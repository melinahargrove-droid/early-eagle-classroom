// Real Chromium regression for the bounded Tuesday Unit 2 Week 2 Centers chunk.
// Requires Playwright. Optional WEEK10_CENTERS_TUESDAY_SCREENSHOT_DIR saves both classroom sizes.
// All data and service-worker fixtures are local, synthetic QA; no student data is used.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const screenshotDir = process.env.WEEK10_CENTERS_TUESDAY_SCREENSHOT_DIR;
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const titles = ['Vocabulary', 'Connect', 'Model adding spices', 'Play together', 'Storytelling with Props'];
const plan = JSON.parse(fs.readFileSync(path.join(root, 'v6-test/week10-centers-tuesday-plan.json'), 'utf8'));
const mondayPlan = JSON.parse(fs.readFileSync(path.join(root, 'v6-test/week10-centers-monday-plan.json'), 'utf8'));
const sourcePlan = 'https://docs.google.com/document/d/1lYe4_XN0sIUJeeEt2kbxzxtzqkteNSX9woHXpfXlb7Y/edit';
const read = file => fs.readFileSync(path.join(root, 'v6-test', file), 'utf8');
const prior = {
  'week10-centers-v1.js': {text: read('week10-centers-v1.js'), hash: 'ccf7eb9bbf10248892af0167affcd6d15bedcbb70819779ce1962e54e3d8e129'},
  'week10-read-aloud-v4.js': {text: read('week10-read-aloud-v4.js'), hash: '8f4023cb9eade4346b3f24b9c28f7b7efbfb72777317c91d32c72c3e7fe3f828'},
  'week10-read-aloud-v5.js': {text: read('week10-read-aloud-v5.js'), hash: 'bd4d4c76972c5be756cdf160f76f712df0c12b71a91d34f7aaa747865e45a64b'}
};
for (const [file, fixture] of Object.entries(prior)) {
  assert.equal(crypto.createHash('sha256').update(fixture.text).digest('hex'), fixture.hash, file + ' is the exact unchanged previous runtime');
}
assert.deepEqual(plan.map(p => p.title), titles);
assert.equal(plan.length, 5);
for (let index = 1; index < 4; index++) assert.deepEqual(plan[index].notes, plan[0].notes, 'Soup teaching pages retain the complete same source notes');
const legacyCache = 'eea-companion-v91';
// Isolated old v91 cache-first/ignoreSearch behavior. HTML remains network-first.
// Prime the original v1/v5 bytes, then model changed same-path origin responses
// only in this server. Never modify prior files, delete caches or replace this worker.
const legacyWorker = `const CACHE=${JSON.stringify(legacyCache)};
self.addEventListener('install',event=>event.waitUntil((async()=>{const c=await caches.open(CACHE);for(const name of ['week10-centers-v1.js','week10-read-aloud-v5.js']){const r=await fetch('./__qa-tuesday-original-'+name,{cache:'no-store'});if(!r.ok)throw Error('Missing original fixture');await c.put('./'+name,r);}await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{const r=event.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==self.location.origin)return;const html=r.mode==='navigate'||r.destination==='document'||u.pathname.endsWith('.html');if(html){event.respondWith(fetch(r,{cache:'no-store'}));return;}event.respondWith(caches.match(r,{ignoreSearch:true}).then(cached=>cached||fetch(r).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(r,copy)).catch(()=>{});}return response;})));});`;
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  let fixture, type = 'text/javascript';
  if (url.pathname === '/v6-test/__qa-tuesday-v91-worker.js') fixture = legacyWorker;
  else if (url.pathname.startsWith('/v6-test/__qa-tuesday-original-')) fixture = prior[url.pathname.split('__qa-tuesday-original-')[1]]?.text;
  else if (url.pathname === '/v6-test/week10-centers-v1.js') fixture = read('week10-centers-v2.js');
  else if (url.pathname === '/v6-test/week10-read-aloud-v5.js') fixture = read('week10-read-aloud-v6.js');
  else if (url.pathname === '/v6-test/__qa-tuesday-boot.html') { fixture = '<!doctype html><title>Isolated Tuesday v91 regression</title>'; type = 'text/html'; }
  else if (url.pathname === '/v6-test/__qa-tuesday-old-centers.html') {
    fixture = read('week10-centers.html').replace('week10-centers-v2.js', 'week10-centers-v1.js' + (url.searchParams.has('bust') ? '?qa-tuesday-upgrade=1' : '')); type = 'text/html';
  } else if (url.pathname === '/v6-test/__qa-tuesday-old-reader.html') {
    fixture = read('week10-read-aloud.html').replace('week10-read-aloud-v6.js', 'week10-read-aloud-v5.js' + (url.searchParams.has('bust') ? '?qa-tuesday-upgrade=1' : '')); type = 'text/html';
  }
  if (fixture !== undefined) { response.writeHead(200, {'Content-Type': type, 'Cache-Control': 'no-store'}).end(fixture); return; }
  let file;
  try { file = path.resolve(root, '.' + decodeURIComponent(url.pathname)); } catch { response.writeHead(400).end(); return; }
  if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, bytes) => {
    if (error) { response.writeHead(404).end(); return; }
    const mime = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml'}[path.extname(file)] || 'application/octet-stream';
    response.writeHead(200, {'Content-Type': mime, 'Cache-Control': 'no-store'}).end(bytes);
  });
});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check, label) {
  let last;
  for (let i = 0; i < 240; i++) { try { if (await check()) return; } catch (error) { last = error; } await delay(25); }
  assert.fail(label + (last ? ': ' + last.message : ''));
}
async function shot(page, name) {
  if (screenshotDir) { fs.mkdirSync(screenshotDir, {recursive: true}); await page.screenshot({path: path.join(screenshotDir, name + '.png'), fullPage: true}); }
}
function diagnostics(page) {
  const errors = [], missing = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) missing.push(`${response.status()} ${response.url()}`); });
  return () => { assert.deepEqual(errors, [], 'No page errors'); assert.deepEqual(missing, [], 'No missing resources'); };
}
async function target(locator, label) {
  const box = await locator.evaluate(el => {
    const r = el.getBoundingClientRect(), hit = el.ownerDocument.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return {inside: r.x >= 0 && r.y >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1, width: r.width, height: r.height, textFits: el.scrollWidth <= el.clientWidth + 1 && el.scrollHeight <= el.clientHeight + 1, hit: !!hit && (el === hit || el.contains(hit))};
  });
  assert(box.inside && box.width > 0 && box.height > 0 && box.hit && box.textFits, `${label}: visible, unclipped and unobscured ${JSON.stringify(box)}`);
}
function helpers(page, base) {
  const child = () => page.frames().find(frame => frame.parentFrame() === page.mainFrame());
  const route = (step = 0) => base + 'lesson-runner-week10.html?week=10&day=1&section=2&step=' + step;
  const standaloneRoute = (step = 0) => base + 'week10-centers.html?day=Tuesday&step=' + step;
  async function overview(day = 1) {
    await until(async () => new URL(page.url()).pathname.endsWith('/daily-lessons.html') && await page.locator('#path .step').count() === (day < 2 ? 3 : 2), 'Same-day top-level overview');
    const p = new URL(page.url()).searchParams;
    assert.equal(p.get('week'), '10'); assert.equal(p.get('day'), String(day)); assert.equal(page.frames().length, 1);
  }
  async function centers(index = 0, standalone = false) {
    await until(async () => {
      const frame = standalone ? page : child();
      return frame?.url().includes('/week10-centers.html') && await frame.evaluate(index => typeof EEASectionState === 'function' && EEASectionState().step === index, index);
    }, 'Tuesday center ' + index + ' ready');
    const frame = standalone ? page : child();
    assert.deepEqual(await frame.evaluate(() => EEASectionState()), {step: index, index, total: 5, atStart: index === 0, atEnd: index === 4});
    assert.deepEqual(await frame.evaluate(() => EEACentersPlan), plan, 'Runtime Tuesday plan matches checked-in source plan');
    assert.equal(await frame.locator('.community-copy h2').textContent(), titles[index]);
    assert.equal(await frame.locator('.community-copy .lead').textContent(), plan[index].lead);
    assert.equal(await frame.locator('#count').textContent(), `${index + 1} of 5`);
    assert.equal(await frame.locator('#prev').textContent(), index ? '← Previous' : '← Read Aloud');
    assert.equal(await frame.locator('#done').textContent(), index === 4 ? 'Finish Centers →' : index === 3 ? 'Next: Storytelling →' : 'Next →');
    assert.equal(await frame.locator('.community-card').count(), 1); assert.equal(await frame.locator('iframe').count(), 0);
    assert.equal(await frame.locator('script[src]').getAttribute('src'), 'week10-centers-v2.js');
    assert.equal(page.frames().length, standalone ? 1 : 2);
    const p = new URL(page.url()).searchParams, fp = new URL(frame.url()).searchParams;
    assert.equal(p.get('step'), String(index)); assert.equal(p.get('week'), '10'); assert.equal(p.get('section'), '2');
    assert.equal(p.has('stop'), false); assert.equal(p.has('book'), false);
    assert.equal(p.get('day'), standalone ? 'Tuesday' : '1');
    assert.equal(fp.get('step'), String(index)); assert.equal(fp.get('day'), 'Tuesday'); assert.equal(fp.has('stop'), false); assert.equal(fp.has('book'), false);
    if (!standalone) {
      const resume = await page.evaluate(() => JSON.parse(localStorage.getItem('eea-lesson-resume')));
      assert.equal(resume.week, 10); assert.equal(resume.day, 1); assert.equal(resume.section, 2);
    }
    return frame;
  }
  async function reader(atEnd = false, day = 1) {
    await until(async () => child()?.url().includes('week10-read-aloud.html') && await child().evaluate(atEnd => typeof EEASectionState === 'function' && (!atEnd || EEASectionState().atEnd), atEnd), 'Same-day reader');
    assert.equal(new URL(page.url()).searchParams.get('day'), String(day)); assert.equal(new URL(page.url()).searchParams.get('section'), '1'); assert.equal(page.frames().length, 2);
    assert.equal(await child().locator('script[src]').last().getAttribute('src'), 'week10-read-aloud-v6.js'); return child();
  }
  async function community(day = 1) {
    await until(async () => child()?.url().includes('week10-community.html') && await child().evaluate(() => typeof EEASectionState === 'function'), 'Same-day Community');
    assert.equal(new URL(page.url()).searchParams.get('section'), '0'); assert.equal(new URL(page.url()).searchParams.get('day'), String(day)); return child();
  }
  return {child, route, standaloneRoute, overview, centers, reader, community};
}
async function verifyNotes(page, frame, index) {
  const url = page.url(), length = await page.evaluate(() => history.length), state = await frame.evaluate(() => EEASectionState());
  const actual = await frame.locator('.community-notes-content').evaluate(el => {
    const sections = [];
    for (const node of el.children) { if (node.tagName === 'H3') { if (node.textContent === 'Source materials') break; sections.push([node.textContent, []]); } else if (node.tagName === 'P') sections.at(-1)[1].push(node.textContent); }
    return sections;
  });
  assert.deepEqual(actual, plan[index].notes, 'Every teacher-note heading and paragraph has source parity');
  assert.deepEqual(await frame.locator('.community-notes-content a').evaluateAll(links => links.map(a => [a.textContent, a.getAttribute('href')])), [...(plan[index].links || []), ['Original Week 2 lesson', plan[index].source], ['Original Week 2 Plan', sourcePlan]]);
  assert(await frame.locator('.community-notes-content a').evaluateAll(links => links.every(a => a.target === '_blank' && a.relList.contains('noopener') && a.relList.contains('noreferrer'))));
  for (let n = 0; n < 3; n++) {
    await frame.locator('.community-notes summary').click(); assert(await frame.locator('.community-notes').evaluate(e => e.open));
    await frame.locator('.community-notes summary').click(); assert(!await frame.locator('.community-notes').evaluate(e => e.open));
  }
  assert.equal(page.url(), url); assert.equal(await page.evaluate(() => history.length), length); assert.deepEqual(await frame.evaluate(() => EEASectionState()), state);
}
async function image(frame, index, enlarged = false) {
  const locator = frame.locator(enlarged ? '#enlarged-image' : '.lesson-img');
  await until(() => locator.evaluate(img => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0), 'Original local image loaded');
  assert.equal(await locator.getAttribute('src'), plan[index].img); assert.equal(await locator.getAttribute('alt'), plan[index].alt);
  const box = await locator.evaluate(el => { const r = el.getBoundingClientRect(); return {fit: getComputedStyle(el).objectFit, x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height, vw: innerWidth, vh: innerHeight}; });
  assert.equal(box.fit, 'contain'); assert(box.width > 300 && box.height > 300 && box.x >= 0 && box.y >= 0 && box.right <= box.vw + 1 && box.bottom <= box.vh + 1, 'Large, uncropped image fits viewport: ' + JSON.stringify(box));
}
async function verifyDialog(page, frame, index, screenshotName) {
  assert(plan[index].enlarge);
  const url = page.url(), length = await page.evaluate(() => history.length), state = await frame.evaluate(() => EEASectionState());
  for (const [open, close] of [['keyboard', 'button'], ['keyboard', 'Escape'], ['button', 'button'], ['button', 'Escape'], ['image', 'button'], ['image', 'Escape']]) {
    if (open === 'keyboard') { await frame.locator('.enlarge-image').focus(); await page.keyboard.press('Enter'); }
    else await frame.locator(open === 'image' ? '.lesson-img' : '.enlarge-image').click();
    assert(await frame.locator('#image-dialog').evaluate(el => el.open)); await image(frame, index, true);
    assert(await frame.locator('#close-image').evaluate(el => el === document.activeElement), 'Dialog places focus on Close');
    await target(frame.locator('#close-image'), 'Dialog Close'); await target(frame.locator('#enlarged-image'), 'Enlarged page');
    if (screenshotName) { await shot(page, screenshotName); screenshotName = null; }
    if (close === 'button') await frame.locator('#close-image').click(); else await page.keyboard.press('Escape');
    assert(!await frame.locator('#image-dialog').evaluate(el => el.open));
    if (open !== 'image') assert(await frame.locator('.enlarge-image').evaluate(el => el === document.activeElement), 'Dismissal restores focus to Enlarge pages');
    else assert(await frame.locator('#image-dialog').evaluate(el => !el.contains(document.activeElement)), 'Image-tap dismissal never traps focus in the closed dialog');
    assert.equal(page.url(), url); assert.equal(await page.evaluate(() => history.length), length); assert.deepEqual(await frame.evaluate(() => EEASectionState()), state);
  }
}
async function verifySingleHistoryEntry(browser, base, standalone) {
  const context = await browser.newContext({viewport: {width: 1280, height: 800}, serviceWorkers: 'block'});
  try {
    const page = await context.newPage(), clean = diagnostics(page), h = helpers(page, base);
    await page.goto(standalone ? h.standaloneRoute() : h.route()); let frame = await h.centers(0, standalone);
    const initial = await page.evaluate(() => history.length);
    for (let n = 0; n < 4; n++) await page.evaluate(standalone => { dispatchEvent(new Event('pageshow')); if (!standalone) document.getElementById('frame').dispatchEvent(new Event('load')); }, standalone);
    assert.equal(await page.evaluate(() => history.length), initial, 'Repeated preparation adds no history');
    for (let index = 1; index < 5; index++) { await frame.locator('#done').click(); frame = await h.centers(index, standalone); assert.equal(await page.evaluate(() => history.length), initial + index, 'Exactly one joint-session entry per page change'); }
    for (let index = 3; index >= 0; index--) { await page.goBack(); await h.centers(index, standalone); }
    for (let index = 1; index < 5; index++) { await page.goForward(); await h.centers(index, standalone); }
    assert.equal(await page.evaluate(() => history.length), initial + 4, 'Native restoration creates no entries');
    clean(); console.log(`${standalone ? 'Standalone' : 'Embedded'} five-page history has exactly one entry per navigation and no duplicate preparation/restoration`);
  } finally { await context.close(); }
}
async function verifyLegacy(browser, base) {
  const context = await browser.newContext({viewport: {width: 1280, height: 800}, serviceWorkers: 'allow'});
  try {
    const page = await context.newPage(), clean = diagnostics(page), h = helpers(page, base);
    await page.goto(base + '__qa-tuesday-boot.html');
    await page.evaluate(async () => { await navigator.serviceWorker.register('./__qa-tuesday-v91-worker.js', {scope: './'}); await navigator.serviceWorker.ready; });
    await page.waitForFunction(() => navigator.serviceWorker.controller?.scriptURL.endsWith('/__qa-tuesday-v91-worker.js'));
    const pairs = [['week10-centers-v1.js', 'week10-centers-v2.js'], ['week10-read-aloud-v5.js', 'week10-read-aloud-v6.js']];
    for (const suffix of ['', '?qa-tuesday-upgrade=1']) {
      for (const [oldFile, newFile] of pairs) {
        assert.notEqual(prior[oldFile].text, read(newFile));
        assert.equal(await (await context.request.get(base + oldFile + suffix)).text(), read(newFile), 'Network has fresh bytes at the old path');
        assert.equal(await page.evaluate(async name => await (await fetch('./' + name, {cache: 'no-store'})).text(), oldFile + suffix), prior[oldFile].text, 'v91 ignoreSearch retains original bytes with and without query busting');
      }
      await page.goto(base + '__qa-tuesday-old-reader.html?day=Tuesday&step=999999' + (suffix ? '&bust=1' : ''));
      await page.waitForFunction(() => typeof EEASectionState === 'function' && EEASectionState().atEnd);
      assert.equal(await page.locator('script[src]').last().getAttribute('src'), 'week10-read-aloud-v5.js' + suffix);
      assert.equal(await page.locator('#next').textContent(), 'Finish Read Aloud →'); await page.locator('#next').click(); await h.overview();
      await page.goto(base + '__qa-tuesday-old-centers.html?day=Tuesday&step=0' + (suffix ? '&bust=1' : ''));
      await h.overview();
    }
    // No cache reset or replacement registration between stale and fresh flows.
    const freshReader = page.waitForResponse(r => new URL(r.url()).pathname === '/v6-test/week10-read-aloud-v6.js');
    await page.goto(base + 'lesson-runner-week10.html?week=10&day=1&section=1&step=999999');
    assert.equal(await (await freshReader).text(), read('week10-read-aloud-v6.js'));
    let frame = await h.reader(true); assert.equal(await frame.locator('#next').textContent(), 'Next: Centers →');
    const freshCenters = page.waitForResponse(r => new URL(r.url()).pathname === '/v6-test/week10-centers-v2.js');
    await frame.locator('#next').click(); assert.equal(await (await freshCenters).text(), read('week10-centers-v2.js'));
    frame = await h.centers(); await shot(page, 'tuesday-v91-fresh-v2-v6-1280x800');
    for (let index = 1; index < 5; index++) { await frame.locator('#done').click(); frame = await h.centers(index); await verifyNotes(page, frame, index); }
    await page.reload(); frame = await h.centers(4); await frame.locator('#done').click(); await h.overview();
    assert.equal(await page.evaluate(() => navigator.serviceWorker.controller.scriptURL), base + '__qa-tuesday-v91-worker.js');
    assert.equal(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length), 1, 'Original worker is the only registration');
    for (const [oldFile] of pairs) assert.equal(await page.evaluate(async ({cache, file}) => await (await (await caches.open(cache)).match('./' + file)).text(), {cache: legacyCache, file: oldFile}), prior[oldFile].text, 'Exact previous cache entry survives');
    assert(await page.evaluate(async name => (await caches.keys()).includes(name), legacyCache)); clean();
    console.log('Untouched v91 reproduces stale v1/v5 same-path and query failure; v2/v6 completes all Tuesday pages without clearing caches');
  } finally { await context.close(); }
}
(async () => {
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const base = `http://127.0.0.1:${server.address().port}/v6-test/`; let browser;
  try {
    browser = await chromium.launch({headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined, ignoreDefaultArgs: ['--disable-back-forward-cache']});
    for (const standalone of [false, true]) await verifySingleHistoryEntry(browser, base, standalone);
    const page = await browser.newPage({viewport: {width: 1280, height: 800}, serviceWorkers: 'block'}), clean = diagnostics(page), h = helpers(page, base);
    await page.goto(base + 'daily-lessons.html?week=10&day=1'); await h.overview(); await page.locator('#start').click(); let frame = await h.community(); await frame.locator('#done').click(); await h.reader();
    await page.goto(base + 'lesson-runner-week10.html?week=10&day=1&section=1&step=999999'); frame = await h.reader(true);
    assert.equal(await frame.locator('#next').textContent(), 'Next: Centers →'); await frame.locator('#next').click(); await h.centers();
    await page.goBack(); await h.reader(true); await page.goForward(); frame = await h.centers();
    for (let n = 0; n < 3; n++) { await frame.locator('#prev').click(); frame = await h.reader(); assert.equal(await frame.evaluate(() => EEASectionState().step), 0); await page.goBack(); frame = await h.centers(); }
    await page.goto(base + 'week10-read-aloud.html?day=Tuesday&step=999999');
    await page.waitForFunction(() => typeof EEASectionState === 'function' && EEASectionState().atEnd);
    assert.equal(await page.locator('script[src]').last().getAttribute('src'), 'week10-read-aloud-v6.js');
    assert.equal(await page.locator('#next').textContent(), 'Next: Centers →');
    await page.locator('#next').click(); await h.centers();
    await page.goBack(); await page.waitForFunction(() => typeof EEASectionState === 'function' && EEASectionState().atEnd);
    assert.equal(page.frames().length, 1); await page.goForward(); await h.centers();
    for (const standalone of [false, true]) {
      await page.goto(standalone ? h.standaloneRoute() : h.route()); frame = await h.centers(0, standalone);
      for (let index = 0; index < 5; index++) {
        if (index) { await frame.locator('#done').click(); frame = await h.centers(index, standalone); }
        await verifyNotes(page, frame, index);
        if (plan[index].enlarge) await verifyDialog(page, frame, index);
        await page.reload(); frame = await h.centers(index, standalone);
      }
      const resume = await page.evaluate(() => localStorage.getItem('eea-lesson-resume'));
      await page.evaluate(() => localStorage.setItem('eea-lesson-auto-resume', new Date().toISOString().slice(0, 10)));
      await frame.locator('#done').click(); await h.overview();
      assert.equal(await page.evaluate(() => localStorage.getItem('eea-lesson-auto-resume')), null);
      assert.equal(await page.evaluate(() => localStorage.getItem('eea-lesson-resume')), resume);
      for (let n = 0; n < 2; n++) { await page.goBack(); await h.centers(4, standalone); await page.goForward(); await h.overview(); }
      await page.reload(); await h.overview();
      // All internal Previous boundaries, followed by a same-document rapid burst.
      await page.goto(standalone ? h.standaloneRoute(4) : h.route(4)); frame = await h.centers(4, standalone);
      for (let index = 3; index >= 0; index--) { await frame.locator('#prev').click(); frame = await h.centers(index, standalone); }
      await frame.evaluate(() => { document.getElementById('done').click(); document.getElementById('done').click(); document.getElementById('prev').click(); document.getElementById('done').click(); });
      frame = await h.centers(2, standalone); await page.goBack(); await h.centers(1, standalone); await page.goForward(); await h.centers(2, standalone);
      // A modal creates no history and cannot remain over a restored page.
      for (const index of [1, 4]) {
        await page.goto(standalone ? h.standaloneRoute(index - 1) : h.route(index - 1)); frame = await h.centers(index - 1, standalone);
        await frame.locator('#done').click(); frame = await h.centers(index, standalone);
        await frame.locator('.enlarge-image').click(); await page.goBack(); frame = await h.centers(index - 1, standalone); assert(!await frame.locator('#image-dialog').evaluate(e => e.open));
        await page.goForward(); frame = await h.centers(index, standalone); assert(!await frame.locator('#image-dialog').evaluate(e => e.open));
        await frame.locator('.enlarge-image').click(); await page.reload(); frame = await h.centers(index, standalone); assert(!await frame.locator('#image-dialog').evaluate(e => e.open));
      }
    }
    await page.goto(base + 'daily-lessons.html?week=10&day=1'); await h.overview();
    for (const key of ['Enter', 'Space']) { await page.locator('#path .step').nth(2).focus(); await page.keyboard.press(key); frame = await h.centers(); await frame.locator('#exit').click(); await h.overview(); }
    for (const index of [0, 1, 2, 3, 4]) {
      await page.locator('#path .step').nth(2).click(); frame = await h.centers();
      for (let n = 1; n <= index; n++) { await frame.locator('#done').click(); frame = await h.centers(n); }
      await frame.locator('#exit').click(); await h.overview(); await page.goBack(); await h.centers(index); await page.goForward(); await h.overview();
    }
    console.log('Start/card/keyboard, reader handoff, all five pages and exact notes, repeated navigation, rapid clicks, dialog focus and native restoration pass');
    // Every control on every page works before image completion/iframe.onload.
    const heldAssets = new Set(plan.map(p => '/v6-test/' + p.img));
    for (const standalone of [false, true]) for (let index = 0; index < 5; index++) for (const button of ['prev', 'done', 'exit']) {
      let release; const gate = new Promise(resolve => { release = resolve; });
      const pattern = url => heldAssets.has(url.pathname), hold = async route => { await gate; await route.continue().catch(() => {}); };
      await page.route(pattern, hold);
      try {
        await page.goto(standalone ? h.standaloneRoute(index) : h.route(index), {waitUntil: 'domcontentloaded'}); frame = await h.centers(index, standalone);
        assert.equal(await frame.locator('.lesson-img').evaluate(img => img.complete), false, 'Image remains deliberately pending');
        await frame.locator('#' + button).click();
        if (button === 'prev' && index === 0) { frame = await h.reader(); await frame.locator('#backBtn').click(); await h.overview(); }
        else if (button === 'prev' || (button === 'done' && index < 4)) { frame = await h.centers(button === 'prev' ? index - 1 : index + 1, standalone); await frame.locator('#exit').click(); await h.overview(); }
        else await h.overview();
      } finally { release(); await page.unrouteAll({behavior: 'wait'}); }
    }
    console.log('All thirty standalone/embedded early Previous/Next/Finish/X paths pass with images delayed');
    for (const standalone of [false, true]) for (const raw of ['-1', 'bad', 'Infinity', '1.5', '999999', '', 'NaN']) {
      await page.goto((standalone ? h.standaloneRoute(raw) : h.route(raw)) + '&stop=2&book=red-dragon'); await h.centers(raw === '999999' ? 4 : 0, standalone);
    }
    for (let day = 2; day < 5; day++) {
      await page.goto(base + 'week10-centers.html?day=' + days[day] + '&step=4'); await h.overview(day);
      await page.goto(base + `lesson-runner-week10.html?week=10&day=${day}&section=2&step=4&stop=2&book=red-dragon`); await h.community(day);
      for (const key of ['step', 'stop', 'book']) assert.equal(new URL(page.url()).searchParams.has(key), false);
      await page.goto(base + `lesson-runner-week10.html?week=10&day=${day}&section=1&step=999999`); frame = await h.reader(true, day);
      assert.equal(await frame.locator('#next').textContent(), 'Finish Read Aloud →'); await frame.locator('#next').click(); await h.overview(day);
    }
    // Deterministic invalid-day routing, independent of the CI machine's weekday.
    const fallback = await browser.newContext({serviceWorkers: 'block'});
    try {
      await fallback.addInitScript(() => { const RealDate = Date; window.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2026-10-02T12:00:00Z'])); } static now() { return new RealDate('2026-10-02T12:00:00Z').getTime(); } }; });
      const invalid = await fallback.newPage(), invalidHelpers = helpers(invalid, base), invalidClean = diagnostics(invalid);
      for (const raw of ['', 'bad', 'Tuesdayy', '1', '-1', '6']) { await invalid.goto(base + 'week10-centers.html?day=' + raw + '&step=4'); await invalidHelpers.overview(4); }
      for (const raw of ['-1', '5', '1.5', 'NaN', 'Tuesday']) { await invalid.goto(base + 'lesson-runner-week10.html?week=10&day=' + raw + '&section=2&step=4'); await invalidHelpers.community(4); }
      invalidClean();
    } finally { await fallback.close(); }
    // Monday remains the two-page plan and keeps its own reader-to-Centers handoff.
    await page.goto(base + 'lesson-runner-week10.html?week=10&day=0&section=1&step=999999'); frame = await h.reader(true, 0);
    assert.equal(await frame.locator('#next').textContent(), 'Next: Centers →'); await frame.locator('#next').click();
    await until(async () => h.child()?.url().includes('week10-centers.html') && await h.child().evaluate(() => typeof EEACentersPlan !== 'undefined'), 'Monday sentinel Centers');
    frame = h.child(); assert.deepEqual(await frame.evaluate(() => EEACentersPlan), mondayPlan); assert.equal(await frame.locator('.community-copy h2').textContent(), 'Nature Arrangements');
    await frame.locator('#done').click(); assert.equal(await frame.locator('.community-copy h2').textContent(), 'Building Autumn Trees 2'); assert.equal(await frame.evaluate(() => EEASectionState().total), 2);
    await frame.locator('#done').click(); await h.overview(0);
    console.log('Malformed steps/day routes, unsupported Wednesday–Friday boundaries and unchanged Monday sentinel pass');
    for (const viewport of [{width: 1280, height: 800}, {width: 1180, height: 757}]) {
      await page.setViewportSize(viewport); await page.goto(base + 'daily-lessons.html?week=10&day=1'); await h.overview();
      for (const selector of ['#path .step', '#start', '#weeknav button', '#days button', '.home', '.pace']) {
        const items = page.locator(selector); for (let n = 0; n < await items.count(); n++) await target(items.nth(n), `${viewport.width} overview ${selector}/${n}`);
      }
      await shot(page, `tuesday-overview-${viewport.width}x${viewport.height}`);
      for (let index = 0; index < 5; index++) {
        await page.goto(h.route(index)); frame = await h.centers(index); await image(frame, index);
        for (const selector of ['#prev', '#done', '#exit', '#count']) await target(frame.locator(selector), `${viewport.width} ${titles[index]} ${selector}`);
        const copy = await frame.locator('.community-copy').evaluate(el => ({top: el.scrollTop, height: el.scrollHeight, client: el.clientHeight}));
        assert.equal(copy.top, 0); assert(copy.height <= copy.client + 1, `${viewport.width} ${titles[index]} default title, lead, teaching content and Notes fit without scrolling: ${JSON.stringify(copy)}`);
        for (const selector of ['.community-copy h2', '.community-copy .lead', '.community-notes summary', '.vocabulary-list li', '.teaching-steps li', '.enlarge-image']) {
          const items = frame.locator(selector); for (let n = 0; n < await items.count(); n++) await target(items.nth(n), `${viewport.width} ${titles[index]} ${selector}/${n}`);
        }
        await shot(page, `tuesday-center-${index + 1}-${viewport.width}x${viewport.height}`);
        if (plan[index].enlarge) await verifyDialog(page, frame, index, `tuesday-center-${index + 1}-enlarged-${viewport.width}x${viewport.height}`);
        await frame.locator('.community-notes summary').click(); assert(await frame.locator('.community-notes').evaluate(el => el.open));
        await shot(page, `tuesday-center-${index + 1}-notes-open-${viewport.width}x${viewport.height}`);
        const links = frame.locator('.community-notes-content a');
        for (let n = 0; n < await links.count(); n++) { await links.nth(n).scrollIntoViewIfNeeded(); await target(links.nth(n), `${viewport.width} ${titles[index]} source link ${n}`); }
        for (const selector of ['#prev', '#done', '#exit']) await target(frame.locator(selector), `${viewport.width} notes-open footer ${selector}`);
        await image(frame, index); await shot(page, `tuesday-center-${index + 1}-notes-sources-${viewport.width}x${viewport.height}`);
      }
    }
    clean(); await page.close();
    console.log('1280×800 and 1180×757 title/lead/notes/footer fit, original images, both dialogs and source-link hit targets pass');
    await verifyLegacy(browser, base);
    console.log('PASS: Tuesday Centers Chromium regression; previous v1/v4/v5 byte fixtures remain untouched');
  } finally { if (browser) await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
