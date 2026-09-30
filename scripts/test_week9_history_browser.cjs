// Real Chromium session-history regression. CI supplies playwright 1.62.1.
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const server = http.createServer((request, response) => {
  const file = path.resolve(root, '.' + new URL(request.url, 'http://localhost').pathname);
  if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, bytes) => {
    if (error) { response.writeHead(404).end(); return; }
    const type = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg' }[path.extname(file)] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' }).end(bytes);
  });
});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check, label) {
  for (let i = 0; i < 200; i++) { try { if (await check()) return; } catch {} await delay(25); }
  assert.fail(label);
}
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/v6-test/`;
  const browser = await chromium.launch({ headless: true, ignoreDefaultArgs: ['--disable-back-forward-cache'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => addEventListener('pageshow', event => { window.historyTestPersisted = event.persisted; }));
    const section = () => page.frames().find(frame => frame.parentFrame() === page.mainFrame());
    async function expected(view, index, total, previous, next) {
      await until(async () => {
        const f = section();
        if (!f) return false;
        const child = new URL(f.url()).searchParams, outer = new URL(page.url()).searchParams;
        return child.get('view') === view && child.get('step') === String(index) &&
          outer.get('step') === String(index) && outer.get('section') === child.get('section') &&
          await f.locator('#activityMenu').inputValue() === String(index) &&
          await f.locator('#count').textContent() === `${index + 1} of ${total}` &&
          await f.locator('#prev').textContent() === previous && await f.locator('#done').textContent() === next;
      }, `Render ${view}/${index} with correct boundaries`);
      const f = section(), child = new URL(f.url()), outer = new URL(page.url());
      assert.equal(await f.locator('#activityMenu').inputValue(), String(index));
      assert.equal(child.searchParams.get('step'), String(index));
      assert.equal(outer.searchParams.get('step'), String(index));
      assert.equal(outer.searchParams.get('section'), child.searchParams.get('section'));
      assert.equal(outer.searchParams.get('day'), '3');
      assert.equal(child.searchParams.get('day'), 'Thursday');
      const state = await f.evaluate(() => window.EEASectionState());
      assert.equal(state.index, index);
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('eea-lesson-resume')).section), Number(child.searchParams.get('section')));
    }
    async function choose(n) { await section().locator('#activityMenu').selectOption(String(n)); }
    async function open(sectionIndex) {
      await page.goto(`${base}lesson-runner-week9.html?week=9&day=3&section=${sectionIndex}`);
      await until(async () => section() && await section().locator('#activityMenu').count() === 1 && await section().locator('#prev').getAttribute('data-eea-boundary') !== null, 'Runner prepared');
    }
    await open(3);
    await choose(7);
    await expected('writing', 7, 8, '← Previous', 'Next: Centers →');
    assert.match(await section().locator('#lesson').innerText(), /Extend and connect home/);
    await section().locator('#done').click();
    await expected('centers', 0, 13, '← Writing', 'Next →');
    for (let i = 0; i < 4; i++) await section().locator('#done').click();
    await expected('centers', 4, 13, '← Previous', 'Next →');
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => history.back());
      await expected('writing', 7, 8, '← Previous', 'Next: Centers →');
      assert.match(await section().locator('#lesson').innerText(), /Extend and connect home/);
      await page.evaluate(() => history.forward());
      await expected('centers', 4, 13, '← Previous', 'Next →');
      assert.match(await section().locator('#lesson').innerText(), /Children choose a color/);
    }
    await page.reload();
    await expected('centers', 4, 13, '← Previous', 'Next →');
    await section().locator('#prev').click();
    await expected('centers', 3, 13, '← Previous', 'Next →');
    await section().locator('[data-dough-enlarge]').click();
    await page.keyboard.press('Escape');
    assert.equal(await section().locator('#doughBookDialog').evaluate(dialog => dialog.open), false);
    await expected('centers', 3, 13, '← Previous', 'Next →');
    console.log('Writing → Centers → repeated real Back/Forward, reload and Playdough cancel pass');
    // Both shared Favorite Foods routes keep page selection and enlargement local.
    for (const [runnerSection, offset, total] of [[3, 0, 8], [4, 5, 13]]) {
      await open(runnerSection);
      await choose(offset + 2);
      const f = section(), historyLength = await page.evaluate(() => history.length), url = page.url();
      await f.locator('.soup-book-panel [data-soup-page="1"]').click();
      await f.locator('.soup-book-panel [data-soup-enlarge]').first().click();
      assert.equal(await f.locator('#soupBookDialog').evaluate(dialog => dialog.open), true);
      await page.keyboard.press('Escape');
      assert.equal(await f.locator('#soupBookDialog').evaluate(dialog => dialog.open), false);
      assert.equal(await f.locator('.soup-book-panel [data-soup-page="1"]').getAttribute('aria-pressed'), 'true');
      await f.locator('#done').click();
      for (let i = 0; i < 2; i++) {
        await f.locator('.soup-book-controls [data-food-enlarge]').click();
        assert.equal(await f.locator('#foodVisualDialog').evaluate(dialog => dialog.open), true);
        if (i === 0) await f.locator('[data-food-close]').click(); else await page.keyboard.press('Escape');
        assert.equal(await f.locator('#foodVisualDialog').evaluate(dialog => dialog.open), false);
      }
      await f.locator('#prev').click();
      assert.equal(await f.locator('#count').textContent(), `${offset + 3} of ${total}`);
      assert.equal(page.url(), url);
      assert.equal(await page.evaluate(() => history.length), historyLength);
      await choose(offset);
      await f.locator('[data-food-word="4"]').click();
      assert.equal(await f.locator('#foodWord').textContent(), 'Spices');
      await choose(total - 1);
      await f.locator('#done').click();
      await expected(runnerSection === 3 ? 'centers' : 'building', 0, runnerSection === 3 ? 13 : 8, runnerSection === 3 ? '← Writing' : '← Centers', 'Next →');
      await page.evaluate(() => history.back());
      await expected(runnerSection === 3 ? 'writing' : 'centers', total - 1, total, '← Previous', runnerSection === 3 ? 'Next: Centers →' : 'Next: Math →');
      await page.evaluate(() => history.forward());
      await expected(runnerSection === 3 ? 'centers' : 'building', 0, runnerSection === 3 ? 13 : 8, runnerSection === 3 ? '← Writing' : '← Centers', 'Next →');
    }
    console.log('Both Favorite Foods routes, vocabulary, soup selector, Close/Escape and Centers ↔ Math pass');
    // Deliberate exit and browser return, including top-level document restoration.
    await section().locator('#exit').click();
    await until(() => page.url().includes('daily-lessons.html'), 'Exit to Thursday overview');
    assert.equal(new URL(page.url()).searchParams.get('day'), '3');
    await page.evaluate(() => history.back());
    await expected('building', 0, 8, '← Centers', 'Next →');
    console.log('Exit/Back pageshow.persisted:', await page.evaluate(() => window.historyTestPersisted));
    await choose(7);
    await expected('building', 7, 8, '← Previous', 'Finish Today ✓');
    // This isolated lesson test starts after the class's morning attendance.
    // Avoid the unrelated first-Home-visit attendance redirect in a fresh profile.
    await page.evaluate(() => {
      const d = new Date(), pad = n => String(n).padStart(2, '0');
      localStorage.setItem('eea-last-morning-attendance-date', `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
    });
    await Promise.all([page.waitForURL('**/index.html', { waitUntil: 'load' }), section().locator('#done').click()]);
    assert.equal(await page.evaluate(() => localStorage.getItem('eea-lesson-resume')), null);
    // Weekday skips and first-boundary retreat remain unchanged.
    for (let day = 0; day < 5; day++) {
      await page.goto(`${base}lesson-runner-week9.html?week=9&day=${day}&section=2`);
      const nextLabel = [0, 2].includes(day) ? 'Next: Centers →' : 'Next: Writing →';
      await until(async () => section() && await section().locator('#done').textContent() === nextLabel, 'Foundation next boundary');
      await section().locator('#done').click();
      await until(() => new URL(page.url()).searchParams.get('section') === ([0, 2].includes(day) ? '4' : '3'), 'Correct weekday section handoff');
      await section().locator('#prev').click();
      await until(() => new URL(page.url()).searchParams.get('section') === '2', 'Correct boundary retreat');
    }
    // Read Aloud keeps its own first page and teaching-stop semantics, no leaked step.
    await page.goto(`${base}lesson-runner-week9.html?week=9&day=3&section=1&step=7`);
    await until(async () => section() && await section().locator('#prev').textContent() === '← Community Meeting', 'Read Aloud first boundary');
    assert.equal(new URL(page.url()).searchParams.has('step'), false);
    await section().locator('#next').click();
    await until(async () => await section().locator('#prev').textContent() === '← Previous', 'Read Aloud internal Previous');
    for (let i = 0; i < 30; i++) {
      const f = section(), state = await f.evaluate(() => window.EEASectionState());
      if (state.stopPending) {
        await f.locator('#next').click();
        assert.equal((await f.evaluate(() => window.EEASectionState())).index, state.index);
        assert.equal(await f.locator('#teachingStop').isVisible(), true);
        break;
      }
      assert(i < 29, 'Found a real teaching stop');
      await f.locator('#next').click();
    }
    assert.deepEqual(errors, []);
    console.log('Exit/return, Finish, all weekday boundaries and Read Aloud teaching stop pass; no page errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
