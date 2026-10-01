// Real Chromium Week 2 Read Aloud regression. CI supplies playwright 1.62.1.
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const server = http.createServer((request, response) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
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
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    // External Google support-slide availability is checked separately in the
    // published cloud browser; these tests exercise the unmodified reader code.
    await page.route('https://docs.google.com/**', route => route.abort());
    const section = () => page.frames().find(frame => frame.parentFrame() === page.mainFrame());
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    for (const [dayIndex, day] of days.entries()) {
      const total = dayIndex < 2 ? 1 : 15;
      await page.goto(`${base}lesson-runner-week2.html?week=2&day=${dayIndex}&section=1`);
      await until(async () => section() && await section().locator('#prev').getAttribute('data-boundary') === '1', `${day} reader prepared`);
      await delay(100); // Include both initial and delayed runner sync.
      // Re-preparing a loaded reader must not install duplicate guide handlers.
      await page.evaluate(() => { const frame = document.getElementById('frame'); for (let i = 0; i < 3; i++) frame.dispatchEvent(new Event('load')); });
      await delay(120);
      let f = section();
      assert.equal(await f.locator('#prev').getAttribute('data-boundary'), '1');
      assert.equal(await f.locator('#bookTitle').textContent(), dayIndex < 2 ? 'I Love Us! A Book About Family' : 'Shhh! The Baby’s Asleep');
      assert.equal(await f.locator('#prev').textContent(), '← Community Meeting');
      if (dayIndex < 2) assert.equal(await f.locator('#next').textContent(), 'Next: Centers →');
      for (let repeat = 0; repeat < 2; repeat++) {
        await f.locator('#notesBtn').click(); assert.equal(await f.locator('#notesPanel').isVisible(), true);
        await f.locator('#closeNotes').click(); assert.equal(await f.locator('#notesPanel').isVisible(), false);
      }
      await f.locator('#book').click();
      assert.equal(await f.locator('#side').isVisible(), false);
      await f.locator('#next').click();
      assert.equal(await f.locator('#side').isVisible(), true);
      assert.equal((await f.evaluate(() => window.EEASectionState())).index, 0);
      for (let i = 0; i < total; i++) {
        assert.equal((await f.evaluate(() => window.EEASectionState())).index, i);
        if (i > 0) {
          await f.locator('#prev').click();
          assert.equal((await f.evaluate(() => window.EEASectionState())).index, i - 1);
          await f.locator('#next').click();
          assert.equal((await f.evaluate(() => window.EEASectionState())).index, i);
        }
        if (i < total - 1) await f.locator('#next').click();
      }
      await f.locator('#next').click();
      await until(async () => section().url().includes('centers-week2.html') && await section().locator('#title').textContent(), `${day} Centers handoff`);
      assert.equal(new URL(section().url()).searchParams.get('day'), day);
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('eea-lesson-resume')).section), 2);
      await page.goto(`${base}lesson-runner-week2.html?week=2&day=${dayIndex}&section=1&landing=end`);
      await until(async () => section().url().includes('week2-read-aloud.html') && await section().locator('#next').getAttribute('data-boundary') === '1', `${day} last-page landing`);
      await delay(100);
      f = section();
      assert.equal((await f.evaluate(() => window.EEASectionState())).index, total - 1);
      assert.equal(await f.locator('#next').textContent(), 'Next: Centers →');
      for (let i = total - 1; i > 0; i--) await f.locator('#prev').click();
      await f.locator('#prev').click();
      await until(() => section().url().includes('community-meeting-week2.html'), `${day} first-page boundary`);
      assert.equal(new URL(section().url()).searchParams.get('day'), day);
      await until(async () => await section().locator('#badge').textContent() === 'NAME MOVEMENTS · 2 OF 2', `${day} Community final page`);
      for (let repeat = 0; repeat < 2; repeat++) {
        await delay(120); // Delayed visual preparation must preserve the boundary.
        f = section();
        assert.equal(await f.locator('#next').getAttribute('data-boundary'), '1');
        assert.equal(await f.locator('#next').textContent(), 'Next: Read Aloud →');
        for (const index of [1, 0, 1]) {
          // Internal render is synchronous; runner labels settle on its existing
          // next-task sync, so wait for that state rather than racing the timer.
          await until(async () => await f.locator('#prev').getAttribute('data-boundary') === (index === 0 ? '1' : '0') && await f.locator('#next').getAttribute('data-boundary') === (index === 1 ? '1' : '0'), `${day} Community page ${index + 1} controls synchronize`);
          assert.equal((await f.evaluate(() => window.EEASectionState())).index, index);
          assert.equal(await f.locator('#prev').textContent(), index === 0 ? '← Day Overview' : '← Previous');
          assert.equal(await f.locator('#prev').getAttribute('data-boundary'), index === 0 ? '1' : '0');
          assert.equal(await f.locator('#next').getAttribute('data-boundary'), index === 1 ? '1' : '0');
          await until(async () => await f.locator('.card.active img').evaluate(img => img.complete && img.naturalWidth > 0), `${day} Community image decodes`);
          for (let notes = 0; notes < 2; notes++) {
            await f.locator('#teacher').click(); assert.equal(await f.locator('#panel').isVisible(), true);
            await f.locator('#teacher').click(); assert.equal(await f.locator('#panel').isVisible(), false);
          }
          if (index === 1) await f.locator('#prev').click();
          else await f.locator('#next').click();
        }
        // The traversal ends at first; return to final, then re-prepare it.
        await f.locator('#next').click();
        await page.evaluate(() => { const frame = document.getElementById('frame'); for (let i = 0; i < 3; i++) frame.dispatchEvent(new Event('load')); });
        await delay(120);
        await f.locator('#next').click();
        await until(async () => section().url().includes('week2-read-aloud.html') && await section().locator('#prev').getAttribute('data-boundary') === '1', `${day} Community returns to reader`);
        assert.equal(new URL(section().url()).searchParams.get('day'), day);
        assert.equal((await section().evaluate(() => window.EEASectionState())).index, 0);
        assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('eea-lesson-resume')).section), 1);
        await section().locator('#prev').click();
        await until(async () => section().url().includes('community-meeting-week2.html') && await section().locator('#badge').textContent() === 'NAME MOVEMENTS · 2 OF 2', `${day} repeated return to Community`);
      }
      // Completed-section restart and both intentional outer exits.
      await page.goto(`${base}lesson-runner-week2.html?week=2&day=${dayIndex}&section=0`);
      await until(async () => section().url().includes('community-meeting-week2.html') && await section().locator('#prev').getAttribute('data-boundary') === '1', `${day} Community starts at first`);
      await delay(120);
      assert.equal((await section().evaluate(() => window.EEASectionState())).index, 0);
      await page.evaluate(() => document.getElementById('continue').click());
      await until(async () => new URL(section().url()).searchParams.get('landing') === 'restart' && await section().locator('#prev').getAttribute('data-boundary') === '1', `${day} completed Community restarts`);
      await delay(120);
      assert.equal((await section().evaluate(() => window.EEASectionState())).index, 0);
      await section().locator('#prev').click();
      await page.waitForURL(`**/daily-lessons.html?week=2&day=${dayIndex}`);
      await page.goto(`${base}lesson-runner-week2.html?week=2&day=${dayIndex}&section=0`);
      await until(async () => section().url().includes('community-meeting-week2.html') && await section().locator('#prev').getAttribute('data-boundary') === '1', `${day} Community reopened`);
      await section().locator('#closeBtn').click();
      await page.waitForURL(`**/daily-lessons.html?week=2&day=${dayIndex}`);
      await page.goto(`${base}lesson-runner-week2.html?week=2&day=${dayIndex}&section=1`);
      await until(async () => section() && await section().locator('#prev').getAttribute('data-boundary') === '1', `${day} reader reopened`);
      await section().locator('#backBtn').click();
      await page.waitForURL(`**/daily-lessons.html?week=2&day=${dayIndex}`);
      assert.equal(new URL(page.url()).searchParams.get('day'), String(dayIndex));
      console.log(`${day}: all ${total} pages, Previous/Next, teaching guide, repeated notes, same-day Centers boundaries, repeated Community round trips, Community images/notes/Overview/Exit and reader Exit pass`);
    }
    assert.deepEqual(errors, []);
    console.log('Week 2 reader browser regression passes with no JavaScript page errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
