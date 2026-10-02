// Local real-Chromium suite; runs identically on Linux and Windows CI.
// Synthetic fixtures below exist only to reproduce an untouched prior worker.
// No fixtures are used by the real GitHub Pages acceptance entry point.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), crypto = require('node:crypto');
const {chromium} = require('playwright');
const {read, root} = require('./test_week10_centers_friday_fixtures.cjs');
const {verifyViewport, centers, reader, overview, route, until, diagnostics} = require('./test_week10_centers_friday_shared.cjs');
const out = process.env.WEEK10_CENTERS_FRIDAY_SCREENSHOT_DIR;
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
// Read immutable Git blobs so Windows core.autocrlf cannot alter this fixture.
const {execFileSync} = require('node:child_process');
const originalRead = file => execFileSync('git', ['show', 'HEAD:v6-test/' + file], {cwd: path.resolve(__dirname, '..'), encoding: 'utf8'});
const prior = {
  'week10-centers-v4.js': {text: originalRead('week10-centers-v4.js'), hash: '25ddb05bec74d8b00eb2b2e6dcab5d32acacdb19269a1690067f341020ba9e83'},
  'week10-read-aloud-v8.js': {text: originalRead('week10-read-aloud-v8.js'), hash: '488c832964a0f5a6e95c17daa06365889005fede84d0b5e9216c36a8cfe907a5'}
};
for (const [name, fixture] of Object.entries(prior)) assert.equal(hash(fixture.text), fixture.hash, 'Exact pre-Friday runtime retained: ' + name);
const cacheName = 'eea-companion-v94';
const legacyWorker = `const CACHE=${JSON.stringify(cacheName)};
self.addEventListener('install',event=>event.waitUntil((async()=>{const c=await caches.open(CACHE);for(const name of ${JSON.stringify(Object.keys(prior))}){const r=await fetch('./__qa-friday-original-'+name,{cache:'no-store'});if(!r.ok)throw Error('Missing original fixture');await c.put('./'+name,r);}await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{const r=event.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==self.location.origin)return;const html=r.mode==='navigate'||r.destination==='document'||u.pathname.endsWith('.html');if(html){event.respondWith(fetch(r,{cache:'no-store'}));return;}event.respondWith(caches.match(r,{ignoreSearch:true}).then(cached=>cached||fetch(r).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(r,copy)).catch(()=>{});}return response;})));});`;
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost'); let fixture, type = 'text/javascript';
  if (url.pathname === '/v6-test/__qa-friday-v94-worker.js') fixture = legacyWorker;
  else if (url.pathname.startsWith('/v6-test/__qa-friday-original-')) fixture = prior[url.pathname.split('__qa-friday-original-')[1]]?.text;
  else if (url.pathname === '/v6-test/week10-centers-v4.js') fixture = read('week10-centers-v5.js');
  else if (url.pathname === '/v6-test/week10-read-aloud-v8.js') fixture = read('week10-read-aloud-v9.js');
  else if (url.pathname === '/v6-test/__qa-friday-boot.html') { fixture = '<!doctype html><title>Isolated prior Friday cache regression</title>'; type = 'text/html'; }
  else if (url.pathname === '/v6-test/__qa-friday-old-centers.html') { fixture = read('week10-centers.html').replace('week10-centers-v5.js', 'week10-centers-v4.js' + (url.searchParams.has('bust') ? '?friday-upgrade=1' : '')); type = 'text/html'; }
  else if (url.pathname === '/v6-test/__qa-friday-old-reader.html') { fixture = read('week10-read-aloud.html').replace('week10-read-aloud-v9.js', 'week10-read-aloud-v8.js' + (url.searchParams.has('bust') ? '?friday-upgrade=1' : '')); type = 'text/html'; }
  if (fixture !== undefined) { res.writeHead(200, {'Content-Type': type, 'Cache-Control': 'no-store'}).end(fixture); return; }
  let file; try { file = path.resolve(root, '.' + decodeURIComponent(url.pathname.slice('/v6-test'.length))); } catch { res.writeHead(400).end(); return; }
  if (!url.pathname.startsWith('/v6-test/') || !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, bytes) => { if (error) { res.writeHead(404).end(); return; } const mime = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp'}[path.extname(file)] || 'application/octet-stream'; res.writeHead(200, {'Content-Type': mime, 'Cache-Control': 'no-store'}).end(bytes); });
});
function capturePreparedRuntime(page, base, expected, verified) {
  const pending = new Map();
  const onResponse = response => {
    const url = new URL(response.url());
    const file = Object.keys(expected).find(file => url.origin === new URL(base).origin && url.pathname === new URL(base + file).pathname);
    if (!file || pending.has(file)) return;
    // Capture immediately and await before the next document navigation. Failure
    // becomes an explicit result at once, avoiding unhandled body-read rejection.
    pending.set(file, Promise.resolve().then(() => response.body()).then(bytes => {
      const digest = hash(bytes); assert.equal(digest, expected[file], 'Browser consumes the selected app root runtime: ' + file); verified[file] = digest; return {ok: true};
    }).catch(error => ({ok: false, error})));
  };
  page.on('response', onResponse);
  return {
    async verify(file) { await until(() => pending.has(file), 'Prepared runtime response: ' + file); const result = await pending.get(file); if (!result.ok) throw result.error; },
    async finish() { for (const file of Object.keys(expected)) await this.verify(file); assert.deepEqual(verified, expected); page.off('response', onResponse); }
  };
}
async function staleWorker(browser, base) {
  const context = await browser.newContext({viewport: {width: 1280, height: 800}, serviceWorkers: 'allow'});
  try {
    const page = await context.newPage(), clean = diagnostics(page);
    await page.goto(base + '__qa-friday-boot.html');
    await page.evaluate(async () => { await navigator.serviceWorker.register('./__qa-friday-v94-worker.js', {scope: './'}); await navigator.serviceWorker.ready; });
    await page.waitForFunction(() => navigator.serviceWorker.controller?.scriptURL.endsWith('/__qa-friday-v94-worker.js'));
    const pairs = [['week10-centers-v4.js', 'week10-centers-v5.js'], ['week10-read-aloud-v8.js', 'week10-read-aloud-v9.js']];
    for (const query of ['', '?friday-upgrade=1']) {
      for (const [old, current] of pairs) {
        assert.equal(await (await context.request.get(base + old + query)).text(), read(current), 'Origin has upgraded same-path response');
        assert.equal(await page.evaluate(async file => (await fetch('./' + file, {cache: 'no-store'})).text(), old + query), prior[old].text, 'Prior ignoreSearch cache defeats both same filename and query bust');
      }
      await page.goto(base + '__qa-friday-old-reader.html?day=Friday&book=red-dragon&step=999999' + (query ? '&bust=1' : ''));
      await page.waitForFunction(() => typeof EEASectionState === 'function' && EEASectionState().atEnd); assert.equal(await page.locator('#next').textContent(), 'Finish Read Aloud →'); await page.locator('#next').click(); await overview(page);
      await page.goto(base + '__qa-friday-old-centers.html?day=Friday' + (query ? '&bust=1' : '')); await overview(page);
    }
    const readerResponse = page.waitForResponse(r => new URL(r.url()).pathname.endsWith('/week10-read-aloud-v9.js'));
    await page.goto(base + 'lesson-runner-week10.html?week=10&day=4&section=1&book=red-dragon&step=999999'); assert.equal(await (await readerResponse).text(), read('week10-read-aloud-v9.js')); let f = await reader(page, 'red-dragon');
    const centersResponse = page.waitForResponse(r => new URL(r.url()).pathname.endsWith('/week10-centers-v5.js'));
    await f.locator('#next').click(); assert.equal(await (await centersResponse).text(), read('week10-centers-v5.js')); f = await centers(page);
    await f.locator('#center-choice').selectOption('cooking-soup'); await f.locator('#review-original').click(); await f.locator('#done').click(); await page.reload(); f = await centers(page, 'cooking-soup', true, 1);
    if (out) { fs.mkdirSync(out, {recursive: true}); await page.screenshot({path: path.join(out, 'friday-v94-cache-fresh-v5-v9-1280x800.png'), fullPage: true}); }
    await f.locator('#return-choice').click(); f = await centers(page, 'cooking-soup'); await f.locator('#done').click(); await overview(page);
    assert.equal(await page.evaluate(() => navigator.serviceWorker.controller.scriptURL), base + '__qa-friday-v94-worker.js'); assert.equal(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length), 1);
    for (const [old] of pairs) assert.equal(await page.evaluate(async ({cache, file}) => (await (await caches.open(cache)).match('./' + file)).text(), {cache: cacheName, file: old}), prior[old].text, 'Old cache was never cleared or replaced');
    clean(); console.log('PASS: untouched v94 worker proves ignored-query failure and fresh v5/v9 filename recovery without cache reset');
  } finally { await context.close(); }
}
async function pendingImageExits(browser, base) {
  for (const standalone of [false, true]) for (const button of ['prev', 'done', 'exit']) {
    const context = await browser.newContext({serviceWorkers: 'block'}); let release, requested = false; const gate = new Promise(r => { release = r; });
    try {
      await context.route('**/assets/focus-3s/unit-2/week-1/friday/follow-a-recipe.png', async route => { if (route.request().resourceType() === 'image') requested = true; await gate; await route.continue().catch(() => {}); });
      const page = await context.newPage(), clean = diagnostics(page);
      await page.goto(route(base, standalone, 'center=class-soup'), {waitUntil: 'domcontentloaded'}); let f = await centers(page, 'class-soup', false, 0, standalone); await until(() => requested, 'Image is held pending'); assert.equal(await f.locator('.lesson-img').evaluate(e => e.complete), false);
      await f.locator('#' + button).click(); if (button === 'prev') { f = await reader(page); await f.locator('#backBtn').click(); } await overview(page); clean();
    } finally { release(); await context.unrouteAll({behavior: 'wait'}); await context.close(); }
  }
  console.log('PASS: all six cold-image Previous/Finish/X boundaries exit immediately');
}
(async () => {
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); }); const base = `http://127.0.0.1:${server.address().port}/v6-test/`; let browser;
  const expectedRuntimeHashes = Object.fromEntries(['week10-centers-v5.js', 'week10-read-aloud-v9.js'].map(file => [file, hash(fs.readFileSync(path.join(root, file)))])), browserRuntimeHashes = {};
  try {
    browser = await chromium.launch({headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined, ignoreDefaultArgs: ['--disable-back-forward-cache']});
    for (const viewport of [{width: 1280, height: 800}, {width: 1180, height: 757}]) await verifyViewport(browser, base, viewport, out, (page, suffix) => { browserRuntimeHashes[suffix] = {}; return capturePreparedRuntime(page, base, expectedRuntimeHashes, browserRuntimeHashes[suffix]); });
    await staleWorker(browser, base); await pendingImageExits(browser, base);
    if (out) fs.writeFileSync(path.join(out, 'verification-environment.json'), JSON.stringify({platform: process.platform, architecture: process.arch, browser: await browser.version(), commit: process.env.GITHUB_SHA || null, appSource: process.env.WEEK10_FRIDAY_APP_ROOT ? 'prepared Windows desktop-app/app' : 'checked-out v6-test', expectedRuntimeHashes, browserRuntimeHashes, viewports: ['1280x800', '1180x757'], syntheticFixtures: 'Only the isolated stale-worker and pending-image regressions'}, null, 2));
  } finally { if (browser) await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
