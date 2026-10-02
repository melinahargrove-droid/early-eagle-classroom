// Real deployed Pages acceptance. Local source/plan/image bytes are the expected
// manifest; actual HTTP and browser response bodies independently prove deployment.
// No route interception, fake responses, runtime injection or Date shims.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {root, activities} = require('./test_week10_centers_friday_fixtures.cjs');
const {verifyViewport, until} = require('./test_week10_centers_friday_shared.cjs');
const {captureRuntimeBytes} = require('./test_week10_centers_thursday_live.cjs');
const base = 'https://melinahargrove-droid.github.io/early-eagle-classroom/v6-test/';
const out = process.env.WEEK10_FRIDAY_LIVE_SCREENSHOT_DIR;
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
async function main() {
  const {chromium, request} = require('playwright');
  if (process.env.GITHUB_ACTIONS === 'true') assert.equal(process.env.GITHUB_REF, 'refs/heads/main', 'Live Pages acceptance runs on main only');
  const files = ['week10-centers-v5.js', 'week10-read-aloud-v9.js', 'week10-centers.html', 'week10-read-aloud.html', 'lesson-runner-week10.html', 'daily-lessons.html', 'sw.js', 'week10-centers-monday-plan.json', 'week10-centers-tuesday-plan.json', 'week10-centers-wednesday-plan.json', 'week10-centers-thursday-plan.json', 'week10-color-read-aloud-plans.json', 'week10-centers-v4.js', 'week10-read-aloud-v8.js'];
  const expected = Object.fromEntries(files.map(file => [file, hash(fs.readFileSync(path.join(root, file)))]));
  const api = await request.newContext(), assets = {};
  try {
    // Hosting propagation is bounded by this deployment's 20-minute acceptance
    // window, never declared successful while the checked-out bytes are absent.
    await until(async () => {
      for (const file of files) { const response = await api.get(base + file + '?friday-acceptance=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}}); if (!response.ok() || hash(await response.body()) !== expected[file]) return false; }
      return true;
    }, 'Pages serves this exact checked-out Friday release', 20 * 60 * 1000, 5000);
    for (const file of new Set(activities.flatMap(a => a.pages.map(p => p.img)))) { const response = await api.get(base + file); assert(response.ok(), 'Image responds: ' + file); assets[file] = hash(await response.body()); assert.equal(assets[file], hash(fs.readFileSync(path.join(root, file))), 'Exact original image bytes: ' + file); }
  } finally { await api.dispose(); }
  const browser = await chromium.launch({headless: true, ignoreDefaultArgs: ['--disable-back-forward-cache']}), browserRuntimeHashes = {};
  try {
    for (const viewport of [{width: 1280, height: 800}, {width: 1180, height: 757}]) await verifyViewport(browser, base, viewport, out, (page, suffix) => {
      browserRuntimeHashes[suffix] = {}; return captureRuntimeBytes(page, expected, browserRuntimeHashes[suffix]);
    });
    if (out) { fs.mkdirSync(out, {recursive: true}); fs.writeFileSync(path.join(out, 'verified-bytes.json'), JSON.stringify({base, commit: process.env.GITHUB_SHA || null, expected, assets, browserRuntimeHashes, browser: await browser.version(), verification: 'Actual deployed Pages in Chromium: exact downloaded and consumed runtime bytes; no response mocking or source injection'}, null, 2)); }
    console.log('PASS: Friday Pages exact-byte deployment plus all seven centers, original scoped reviews, teacher notes, both readers, native history/reload and classroom-size screenshots');
  } finally { await browser.close(); }
}
module.exports = {main};
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
