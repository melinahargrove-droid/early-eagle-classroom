// Pure-Node first-response lifetime regression. Readiness is exercised directly;
// no browser, refetch, substituted application source or swallowed body failure.
const assert = require('node:assert/strict');
const {EventEmitter} = require('node:events');
const crypto = require('node:crypto'), vm = require('node:vm');
const {plan,runtimeFiles,scriptFiles,consumedFiles,centers,captureRuntimeBytes} = require('./test_week11_centers_wednesday_shared.cjs');
const {centersRuntimeFiles} = require('./week11-centers-wednesday-response-capture.cjs');
const base = 'https://melinahargrove-droid.github.io/early-eagle-classroom/v6-test/';
const bytes = Object.fromEntries(consumedFiles.map(file => [file,Buffer.from('Independent synthetic response: ' + file)]));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const expected = Object.fromEntries(consumedFiles.map(file => [file,hash(bytes[file])]));
const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => {let resolve;const promise = new Promise(r => {resolve = r;});return {promise,resolve};};
class Surface extends EventEmitter {
 constructor(step = 0) {super();this.step = step;}
 url() {return base + 'week11-centers.html?week=11&day=Wednesday&section=1&step=' + this.step;}
 frames() {return [this];}
 async evaluate(fn,arg) {const step = this.step;return vm.runInNewContext('(' + fn.toString() + ')(arg)', {arg,EEACentersPlan:plan,EEASectionState:() => ({step,index:step,total:2,atStart:step === 0,atEnd:step === 1})});}
 locator(selector) {
  if (selector === '.lesson-img') return {getAttribute:async attr => {assert.equal(attr,'src');return plan[this.step].img;}};
  assert.equal(selector,'script[src]');return {evaluateAll:async fn => fn(scriptFiles.map(file => ({getAttribute:attr => {assert.equal(attr,'src');return file;}})))};
 }
}
function response(page,file,body = () => Promise.resolve(bytes[file]),origin = base,query = '') {page.emit('response',{url:() => origin + file + query,body});}
(async () => {
 const unhandled = [], onUnhandled = error => unhandled.push(error);process.on('unhandledRejection',onUnhandled);
 try {
  assert.deepEqual(runtimeFiles,centersRuntimeFiles);
  const page = new Surface(), verified = {}, capture = captureRuntimeBytes(page,base,expected,verified);
  const bodies = Object.fromEntries(runtimeFiles.map(file => [file,deferred()]));
  const firstImage = deferred();let navigated = false, bodyReads = 0;
  response(page,plan[0].img,() => firstImage.promise);
  // Both legacy plans loaded by Wednesday are independently required barriers.
  for (const file of runtimeFiles.filter(file => file !== 'week11-centers-v3.js')) response(page,file,() => bodies[file].promise);
  const ready = centers(page,0,true).then(() => {navigated = true;});await tick();assert(!navigated,'Missing v3 response blocks readiness');
  const runtime = 'week11-centers-v3.js';
  response(page,runtime,() => {bodyReads++;return bodies[runtime].promise;});
  response(page,runtime,() => {throw Error('Duplicate body must never be read');},base,'?later=1');
  await tick();assert.equal(bodyReads,1);
  for (const file of runtimeFiles) {assert(!navigated,'Navigation waits for all four script bodies: ' + file);bodies[file].resolve(bytes[file]);await tick();}
  assert(!navigated,'Navigation still waits for the current first-captured hero image');
  firstImage.resolve(bytes[plan[0].img]);await ready;assert(navigated);
  page.step = 1;navigated = false;
  const secondImage = deferred();response(page,plan[1].img,() => secondImage.promise);
  const secondReady = centers(page,1,true).then(() => {navigated = true;});await tick();assert(!navigated,'Back/Forward/reload cannot dispose of the second hero before its body is hashed');
  secondImage.resolve(bytes[plan[1].img]);await secondReady;
  let foreignRead = false;response(page,plan[1].img,() => {foreignRead = true;throw Error('Foreign origin');},'https://other.example/v6-test/');
  await capture.finish();assert.deepEqual(verified,expected);assert(!foreignRead);assert.equal(page.listenerCount('response'),0);
  for (const [name,body,pattern] of [
   ['CDP rejection',() => Promise.reject(Error('Protocol error (Network.getResponseBody): No resource with given identifier found')),/Network.getResponseBody/],
   ['synchronous failure',() => {throw Error('Synchronous response failure');},/Synchronous response failure/],
   ['stale first body',() => Promise.resolve(Buffer.from('stale bytes')),/Browser consumes exact runtime/]
  ]) {
   const p = new Surface(), v = {}, tracked = [...runtimeFiles,plan[0].img], c = captureRuntimeBytes(p,base,expected,v,tracked), failed = runtimeFiles[1];
   for (const file of tracked) response(p,file,file === failed ? body : () => Promise.resolve(bytes[file]));
   await tick();await tick();assert.deepEqual(unhandled,[],name + ' handled immediately');
   response(p,failed,() => Promise.resolve(bytes[failed]),base,'?retry=1');
   let actionRan = false;await assert.rejects(async () => {await centers(p,0,true);actionRan = true;},pattern);
   assert(!actionRan,name + ' remains fatal');assert(!Object.hasOwn(v,failed));await assert.rejects(() => c.finish(),pattern);
  }
  // No capture is deliberately allowed for held-image early-boundary fixtures.
  await centers(new Surface(),0,true);await centers(new Surface(1),1,true);
  const partial = new Surface(), partialVerified = {}, partialCapture = captureRuntimeBytes(partial,base,expected,partialVerified,runtimeFiles);
  for (const file of runtimeFiles) response(partial,file);
  await centers(partial,0,true);await partialCapture.finish();assert.equal(Object.keys(partialVerified).length,4);
  assert.deepEqual(unhandled,[]);
  console.log('PASS: Wednesday readiness awaits all four script/plan bodies plus current hero; first capture is final; hash/CDP/synchronous failures stay fatal; no refetch or duplicate repair; cold-image exits remain unblocked');
 } finally {process.off('unhandledRejection',onUnhandled);}
})().catch(error => {console.error(error);process.exitCode = 1;});
