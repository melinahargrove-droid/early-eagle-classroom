// Test-only response lifetime barriers. A Playwright response body belongs to its
// document/frame: finish reading and hashing it before a caller can navigate.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const readerRuntimeFiles = ['week11-read-aloud-v4.js', 'week11-read-aloud-plan-v1.js', 'week11-read-aloud-tuesday-plan-v1.js'];
const centersRuntimeFiles = ['week11-centers-v2.js', 'week11-centers-monday-plan-v1.js', 'week11-centers-tuesday-plan-v1.js'];
const activeCaptures = new WeakMap();
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
async function responseArrived(captures, file) {
 const deadline = Date.now() + 15000;
 while (!captures.has(file)) {
  assert(Date.now() < deadline, 'Browser response ' + file);
  await new Promise(resolve => setTimeout(resolve, 25));
 }
}
function captureResponseBytes(page, base, expected, verified, files) {
 assert(!activeCaptures.has(page), 'One response capture owns each page');
 assert.equal(new Set(files).size, files.length, 'Tracked response paths are unique');
 for (const file of files) assert.equal(typeof expected[file], 'string', 'Expected digest exists for ' + file);
 const captures = new Map(), paths = new Map(files.map(file => [new URL(base + file).href, file]));
 const handler = response => {
  const url = new URL(response.url()); url.search = ''; url.hash = '';
  const file = paths.get(url.href);
  if (!file || captures.has(file)) return;
  // Register immediately and handle rejection immediately, including a body()
  // call that throws synchronously. Duplicates never replace a failed capture.
  captures.set(file, Promise.resolve().then(() => response.body()).then(bytes => {
   const digest = hash(bytes);
   assert.equal(digest, expected[file], 'Browser consumes exact runtime ' + file);
   verified[file] = digest; return {ok: true};
  }).catch(error => ({ok: false, error})));
 };
 const capture = {
  async verify(file) {
   assert(files.includes(file), 'Requested response is tracked: ' + file);
   await responseArrived(captures, file);
   const result = await captures.get(file);
   if (!result.ok) throw result.error;
  },
  async verifyTracked(surfaceFiles) {
   await Promise.all([...new Set(surfaceFiles)].filter(file => files.includes(file)).map(file => this.verify(file)));
  },
  async finish() {
   await Promise.all(files.map(file => this.verify(file)));
   assert.deepEqual(Object.keys(verified).sort(), [...files].sort());
   page.off('response', handler); activeCaptures.delete(page);
  }
 };
 page.on('response', handler); activeCaptures.set(page, capture); return capture;
}
async function waitForReaderBytes(page, image) {
 await activeCaptures.get(page)?.verifyTracked([...readerRuntimeFiles, image]);
}
async function waitForCentersBytes(page, image) {
 await activeCaptures.get(page)?.verifyTracked([...centersRuntimeFiles, image]);
}
module.exports = {readerRuntimeFiles, centersRuntimeFiles, captureResponseBytes, waitForReaderBytes, waitForCentersBytes};
