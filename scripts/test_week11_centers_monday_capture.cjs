// Pure Node proof of the actual Monday readiness-helper response barriers.
// Deferred synthetic responses only; no browser, network, or app execution.
const assert = require('node:assert/strict');
const {EventEmitter} = require('node:events');
const crypto = require('node:crypto'), vm = require('node:vm');
const {plan, read, runtimeFiles, consumedFiles, reader, centers, captureRuntimeBytes} = require('./test_week11_centers_monday_shared.cjs');
const base = 'https://melinahargrove-droid.github.io/early-eagle-classroom/v6-test/';
const readerPlan = JSON.parse(read('week11-read-aloud-plan.json'));
const sharedImageStep = readerPlan.steps.findIndex(step => step.img === plan[0].img);
const files = [...consumedFiles];
const bytes = Object.fromEntries(files.map(file => [file, Buffer.from('Independent Monday response: ' + file)]));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const expected = Object.fromEntries(files.map(file => [file, hash(bytes[file])]));
const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => {let resolve; const promise = new Promise(r => {resolve = r;}); return {promise, resolve};};
class Surface extends EventEmitter {
 constructor(kind, step = 0) {super(); this.change(kind, step);}
 change(kind, step) {this.kind = kind; this.step = step;}
 url() {return base + (this.kind === 'reader' ? 'week11-read-aloud.html' : 'week11-centers.html') + '?week=11&day=Monday&section=' + (this.kind === 'reader' ? '0' : '1') + '&step=' + this.step;}
 frames() {return [this];}
 async evaluate(fn, arg) {
  const step = this.step;
  return vm.runInNewContext('(' + fn.toString() + ')(arg)', {arg, EEACentersPlan: plan, EEASectionState: () => ({step, index: step, total: 2, atStart: step === 0, atEnd: step === 1})});
 }
 locator(selector) {
  assert(['#bookImg', '.lesson-img'].includes(selector));
  return {getAttribute: async attr => {assert.equal(attr, 'src'); return this.kind === 'reader' ? readerPlan.steps[this.step].img : plan[this.step].img;}};
 }
}
function response(page, file, body = () => Promise.resolve(bytes[file]), origin = base) {
 page.emit('response', {url: () => origin + file, body});
}
(async () => {
 const unhandled = [], onUnhandled = error => unhandled.push(error);
 process.on('unhandledRejection', onUnhandled);
 try {
  assert(sharedImageStep >= 0);
  assert.deepEqual(runtimeFiles, ['week11-read-aloud-v4.js', 'week11-centers-v5.js', 'week11-centers-monday-plan-v1.js']);
  assert.deepEqual(files, [...runtimeFiles, plan[0].img, plan[1].img], 'The original five-file Monday consumed set is unchanged');
  const page = new Surface('reader', sharedImageStep), verified = {}, capture = captureRuntimeBytes(page, base, expected, verified);
  const runtimeBody = deferred(), sharedImageBody = deferred(); let navigated = false, bodyReads = 0;
  response(page, plan[0].img, () => sharedImageBody.promise);
  const readerBoundary = reader(page, sharedImageStep, true).then(() => {navigated = true;});
  await tick(); assert(!navigated, 'Reader navigation waits for its required runtime response to arrive');
  response(page, runtimeFiles[0], () => {bodyReads++; return runtimeBody.promise;});
  response(page, runtimeFiles[0], () => {throw Error('Duplicate first-response body must not be read');});
  await tick(); assert.equal(bodyReads, 1); assert(!navigated, 'Reader navigation waits for the runtime body');
  runtimeBody.resolve(bytes[runtimeFiles[0]]); await tick(); assert(!navigated, 'Reader navigation also waits for its tracked shared hero body');
  sharedImageBody.resolve(bytes[plan[0].img]); await readerBoundary; assert(navigated);

  // Other reader images and plan scripts were never in Monday's consumed set.
  // Their absent bodies cannot stall this unchanged-scope readiness barrier.
  page.change('reader', 0); await reader(page, 0, true);
  response(page, 'week11-read-aloud-plan-v1.js', () => {throw Error('Untracked plan response must not be read');});
  page.change('centers', 0); navigated = false;
  response(page, runtimeFiles[1]);
  const planBody = deferred(); response(page, runtimeFiles[2], () => planBody.promise);
  const firstCenterBoundary = centers(page, 0, true).then(() => {navigated = true;});
  await tick(); assert(!navigated, 'First-center Next/Exit waits for the Monday plan body');
  planBody.resolve(bytes[runtimeFiles[2]]); await firstCenterBoundary; assert(navigated);

  page.change('centers', 1); navigated = false;
  const secondImageBody = deferred(); response(page, plan[1].img, () => secondImageBody.promise);
  const secondCenterBoundary = centers(page, 1, true).then(() => {navigated = true;});
  await tick(); assert(!navigated, 'Center 2 Back/Forward/reload waits for its first hero body before navigation');
  secondImageBody.resolve(bytes[plan[1].img]); await secondCenterBoundary; assert(navigated);
  let foreignRead = false;
  response(page, plan[1].img, () => {foreignRead = true; throw Error('Foreign origin');}, 'https://other.example/v6-test/');
  await capture.finish(); assert.deepEqual(verified, expected); assert(!foreignRead); assert.equal(page.listenerCount('response'), 0);

  for (const [name, kind, step, failed, body, pattern] of [
   ['CDP reader rejection', 'reader', sharedImageStep, runtimeFiles[0], () => Promise.reject(Error('Protocol error (Network.getResponseBody): No resource with given identifier found')), /Network.getResponseBody/],
   ['synchronous center-plan failure', 'centers', 0, runtimeFiles[2], () => {throw Error('Synchronous response failure');}, /Synchronous response failure/],
   ['wrong second-hero digest', 'centers', 1, plan[1].img, () => Promise.resolve(Buffer.from('stale bytes')), /Browser consumes exact runtime/]
  ]) {
   const p = new Surface(kind, step), v = {}, c = captureRuntimeBytes(p, base, expected, v);
   for (const file of files) response(p, file, file === failed ? body : () => Promise.resolve(bytes[file]));
   await tick(); await tick(); assert.deepEqual(unhandled, [], name + ' is caught immediately');
   response(p, failed, () => Promise.resolve(bytes[failed]));
   let actionRan = false;
   await assert.rejects(async () => {await (kind === 'reader' ? reader : centers)(p, step, true); actionRan = true;}, pattern);
   assert(!actionRan, name + ' prevents navigation'); assert(!Object.hasOwn(v, failed), 'A correct duplicate cannot repair failed first bytes');
   await assert.rejects(() => c.finish(), pattern);
  }
  // Cold-image boundary tests have no capture, so readiness still permits exits.
  await reader(new Surface('reader', 23), 23, true); await centers(new Surface('centers'), 0, true); await centers(new Surface('centers', 1), 1, true);
  assert.deepEqual(unhandled, []);
  console.log('PASS: real Monday reader/centers readiness blocks navigation for deferred runtime, plan and both tracked images; original five hashes required; first CDP/digest/synchronous failures stay fatal; duplicates cannot repair failures; cold-image exits remain unblocked');
 } finally {process.off('unhandledRejection', onUnhandled);}
})().catch(error => {console.error(error); process.exitCode = 1;});
