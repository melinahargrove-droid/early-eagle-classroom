// Deterministic pure-Node regression: defer actual readiness-helper body reads.
// No browser, network request, source substitution, or app execution is involved.
const assert = require('node:assert/strict');
const {EventEmitter} = require('node:events');
const crypto = require('node:crypto'), vm = require('node:vm');
const {plan, runtimeFiles, consumedFiles, reader, centers, captureRuntimeBytes} = require('./test_week11_centers_tuesday_shared.cjs');
const {readerRuntimeFiles, centersRuntimeFiles} = require('./week11-centers-tuesday-response-capture.cjs');
const base = 'https://melinahargrove-droid.github.io/early-eagle-classroom/v6-test/';
const readerImage = 'assets/focus-3s/unit-2/week-3/mouse-paint/slide-01.jpg';
const files = [...consumedFiles, readerImage];
const bytes = Object.fromEntries(files.map(file => [file, Buffer.from('Independent synthetic response: ' + file)]));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const expected = Object.fromEntries(files.map(file => [file, hash(bytes[file])]));
const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => {let resolve; const promise = new Promise(r => {resolve = r;}); return {promise, resolve};};
class Surface extends EventEmitter {
 constructor(kind, step = 0) {super(); this.change(kind, step);}
 change(kind, step) {this.kind = kind; this.step = step;}
 url() {return base + (this.kind === 'reader' ? 'week11-read-aloud.html' : 'week11-centers.html') + '?week=11&day=Tuesday&section=' + (this.kind === 'reader' ? '0' : '1') + '&step=' + this.step;}
 frames() {return [this];}
 async evaluate(fn, arg) {
  const step = this.step;
  return vm.runInNewContext('(' + fn.toString() + ')(arg)', {arg, EEAReadAloudPlan: {day: 'Tuesday'}, EEACentersPlan: plan, EEASectionState: () => ({step, index: step, total: 2, atStart: step === 0, atEnd: step === 1})});
 }
 locator(selector) {
  if (selector === '#bookImg' || selector === '.lesson-img') return {getAttribute: async attr => {assert.equal(attr, 'src'); return this.kind === 'reader' ? readerImage : plan[this.step].img;}};
  assert.equal(selector, 'script[src]');
  return {evaluateAll: async fn => fn([centersRuntimeFiles[1], centersRuntimeFiles[2], centersRuntimeFiles[3], centersRuntimeFiles[4], centersRuntimeFiles[0]].map(file => ({getAttribute: attr => {assert.equal(attr, 'src'); return file;}})))};
 }
}
function response(page, file, body = () => Promise.resolve(bytes[file]), origin = base) {
 page.emit('response', {url: () => origin + file, body});
}
(async () => {
 const unhandled = [], onUnhandled = error => unhandled.push(error);
 process.on('unhandledRejection', onUnhandled);
 try {
  assert.deepEqual(runtimeFiles, [...readerRuntimeFiles, ...centersRuntimeFiles]);
  const page = new Surface('reader', 18), verified = {}, capture = captureRuntimeBytes(page, base, expected, verified, files);
  response(page, readerRuntimeFiles[0]); response(page, readerRuntimeFiles[1]);
  const planBody = deferred(), imageBody = deferred(); let navigated = false, bodyReads = 0;
  response(page, readerImage, () => imageBody.promise);
  const readerBoundary = reader(page, 18, true).then(() => {navigated = true;});
  await tick(); assert(!navigated, 'Reader readiness waits even when a required plan response has not arrived');
  response(page, readerRuntimeFiles[2], () => {bodyReads++; return planBody.promise;});
  response(page, readerRuntimeFiles[2], () => {throw Error('Duplicate body must never be read');});
  await tick(); assert.equal(bodyReads, 1); assert(!navigated, 'Reader navigation waits for plan body');
  planBody.resolve(bytes[readerRuntimeFiles[2]]); await tick(); assert(!navigated, 'Full-reader navigation also waits for its current image body');
  imageBody.resolve(bytes[readerImage]); await readerBoundary; assert(navigated);

  page.change('centers', 0); navigated = false;
  response(page, centersRuntimeFiles[0]); response(page, centersRuntimeFiles[2]); response(page, centersRuntimeFiles[3]); response(page, centersRuntimeFiles[4]); response(page, plan[0].img);
  const mondayPlanBody = deferred(); response(page, centersRuntimeFiles[1], () => mondayPlanBody.promise);
  const firstCenterBoundary = centers(page, 0, true).then(() => {navigated = true;});
  await tick(); assert(!navigated, 'Exit/Next waits for the otherwise omitted Monday plan body loaded by Tuesday');
  mondayPlanBody.resolve(bytes[centersRuntimeFiles[1]]); await firstCenterBoundary; assert(navigated);

  page.change('centers', 1); navigated = false;
  const secondImageBody = deferred(); response(page, plan[1].img, () => secondImageBody.promise);
  const secondCenterBoundary = centers(page, 1, true).then(() => {navigated = true;});
  await tick(); assert(!navigated, 'Back/Forward/reload cannot dispose of Center 2 before its first image body is hashed');
  secondImageBody.resolve(bytes[plan[1].img]); await secondCenterBoundary; assert(navigated);
  let foreignRead = false;
  response(page, plan[1].img, () => {foreignRead = true; throw Error('Foreign origin');}, 'https://other.example/v6-test/');
  await capture.finish(); assert.deepEqual(verified, expected); assert(!foreignRead); assert.equal(page.listenerCount('response'), 0);

  for (const [name, body, pattern] of [
   ['CDP rejection', () => Promise.reject(Error('Protocol error (Network.getResponseBody): No resource with given identifier found')), /Network.getResponseBody/],
   ['synchronous body failure', () => {throw Error('Synchronous response failure');}, /Synchronous response failure/],
   ['wrong digest', () => Promise.resolve(Buffer.from('stale bytes')), /Browser consumes exact runtime/]
  ]) {
   const p = new Surface('centers'), v = {}, tracked = [...centersRuntimeFiles, plan[0].img], c = captureRuntimeBytes(p, base, expected, v, tracked);
   const failed = centersRuntimeFiles[1];
   for (const file of tracked) response(p, file, file === failed ? body : () => Promise.resolve(bytes[file]));
   await tick(); await tick(); assert.deepEqual(unhandled, [], name + ' is caught immediately');
   response(p, failed, () => {throw Error('A later response must not replace the failed first response');});
   let actionRan = false;
   await assert.rejects(async () => {await centers(p, 0, true); actionRan = true;}, pattern);
   assert(!actionRan, name + ' prevents navigation'); assert(!Object.hasOwn(v, failed));
   await assert.rejects(() => c.finish(), pattern);
  }
  // Cold-image fixtures intentionally have no capture, so their early exits
  // must not wait for image bytes. A main-flow capture ignores untracked images.
  await reader(new Surface('reader', 18), 18, true); await centers(new Surface('centers'), 0, true);
  const mainPage = new Surface('reader', 18), mainVerified = {}, mainCapture = captureRuntimeBytes(mainPage, base, expected, mainVerified, readerRuntimeFiles);
  for (const file of readerRuntimeFiles) response(mainPage, file);
  await reader(mainPage, 18, true); await mainCapture.finish(); assert.equal(Object.keys(mainVerified).length, 3);
  assert.deepEqual(unhandled, []);
  console.log('PASS: actual reader/centers readiness blocks navigation for deferred plan and image bodies; exact first-response hashes required; CDP/hash/synchronous failures remain fatal; duplicates cannot repair failures; cold-image exits stay unblocked');
 } finally {process.off('unhandledRejection', onUnhandled);}
})().catch(error => {console.error(error); process.exitCode = 1;});
