// Shared real-browser acceptance. No route interception or injected runtime,
// Date shims, source replacements, or synthetic navigation in these flows.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const {activities, sourcePlan, read} = require('./test_week10_centers_friday_fixtures.cjs');
const {target} = require('./test_week10_centers_thursday_target.cjs');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check, label, timeout = 15000, interval = 25) {
  const end = Date.now() + timeout; let last;
  while (Date.now() < end) { try { if (await check()) return; } catch (error) { last = error; } await delay(interval); }
  assert.fail(label + (last ? ': ' + last.message : ''));
}
const child = page => page.frames().find(frame => frame.parentFrame() === page.mainFrame());
function route(base, standalone = false, extra = '') { return base + (standalone ? 'week10-centers.html?week=10&day=Friday&section=2' : 'lesson-runner-week10.html?week=10&day=4&section=2') + (extra ? '&' + extra : ''); }
async function overview(page, day = 4) {
  await until(async () => { const u = new URL(page.url()); return u.pathname.endsWith('/daily-lessons.html') && u.searchParams.get('week') === '10' && u.searchParams.get('day') === String(day) && await page.locator('#path .step').count() === 3; }, 'Same-day overview');
  assert.equal(page.frames().length, 1);
}
async function reader(page, book, standalone = false) {
  await until(async () => { const f = standalone ? page : child(page); return f?.url().includes('week10-read-aloud.html') && await f.evaluate(() => typeof EEASectionState === 'function'); }, 'Friday reader');
  const f = standalone ? page : child(page); assert.equal(new URL(f.url()).searchParams.get('day'), 'Friday');
  if (book) assert.equal(await f.evaluate(() => EEASectionState().book), book);
  return f;
}
async function centers(page, center = null, review = false, step = 0, standalone = false) {
  await until(async () => {
    const f = standalone ? page : child(page);
    return f?.url().includes('week10-centers.html') && await f.evaluate(({center, review, step}) => typeof EEASectionState === 'function' && EEASectionState().center === center && EEASectionState().review === review && EEASectionState().step === step, {center, review, step});
  }, `Friday ${center || 'unselected'} ${review ? 'review' : 'reminder'} ${step}`);
  const f = standalone ? page : child(page), total = center ? review ? activities.find(a => a.key === center).pages.length : 1 : 0;
  assert.deepEqual(await f.evaluate(() => EEASectionState()), {step, index: step, total, atStart: !review && step === 0, atEnd: step >= total - 1, center, review});
  assert.equal(await f.locator('#center-choice').inputValue(), center || '');
  assert.equal(await f.locator('script[src]').getAttribute('src'), 'week10-centers-v5.js');
  assert.equal(page.frames().length, standalone ? 1 : 2);
  for (const [url, day] of [[page.url(), standalone ? 'Friday' : '4'], [f.url(), 'Friday']]) {
    const p = new URL(url).searchParams;
    assert.equal(p.get('day'), day); assert.equal(p.get('week'), '10'); assert.equal(p.get('section'), '2'); assert.equal(p.get('step'), String(step));
    assert.equal(p.get('center'), center); assert.equal(p.get('review'), review ? '1' : null); for (const k of ['book', 'stop']) assert(!p.has(k));
  }
  if (!standalone) { const resume = await page.evaluate(() => JSON.parse(localStorage.getItem('eea-lesson-resume'))); assert.equal(resume.week, 10); assert.equal(resume.day, 4); assert.equal(resume.section, 2); }
  return f;
}
async function imageReady(f, expected, selector = '.lesson-img') {
  const img = f.locator(selector); await img.evaluate(async el => { await el.decode(); if (!el.naturalWidth || !el.naturalHeight) throw Error('Image did not decode'); });
  assert.equal(await img.getAttribute('src'), expected.img); assert.equal(await img.getAttribute('alt'), expected.alt);
  assert.equal(await img.evaluate(el => getComputedStyle(el).objectFit), 'contain'); await target(img, selector + ' image');
}
async function notes(page, f, expected, shot, suffix) {
  const before = page.url(), length = await page.evaluate(() => history.length), state = await f.evaluate(() => EEASectionState());
  const actual = await f.locator('.community-notes-content').evaluate(el => { const sections = []; for (const n of el.children) { if (n.tagName === 'H3') { if (n.textContent === 'Source materials') break; sections.push([n.textContent, []]); } else if (n.tagName === 'P') sections.at(-1)[1].push(n.textContent); } return sections; });
  assert.deepEqual(actual, expected.notes, 'Complete source notes, no omitted paragraphs');
  assert.deepEqual(await f.locator('.community-notes-content a').evaluateAll(links => links.map(a => [a.textContent, a.getAttribute('href')])), [...(expected.links || []), ['Original Week 2 lesson', expected.source], ['Original Week 2 Plan', sourcePlan]]);
  assert(await f.locator('.community-notes-content a').evaluateAll(links => links.every(a => a.target === '_blank' && a.relList.contains('noopener') && a.relList.contains('noreferrer'))));
  await f.locator('summary').click(); assert(await f.locator('details').evaluate(e => e.open));
  if (shot) {
    await shot('notes-' + suffix);
    const links = f.locator('.community-notes-content a'); for (let i = 0; i < await links.count(); i++) { await links.nth(i).scrollIntoViewIfNeeded(); await target(links.nth(i), 'Source link ' + i); }
    for (const id of ['prev', 'done', 'exit', 'center-choice']) await target(f.locator('#' + id), 'Notes-open ' + id);
    await shot('source-links-' + suffix);
  }
  await f.locator('summary').click(); assert(!await f.locator('details').evaluate(e => e.open));
  assert.equal(page.url(), before); assert.equal(await page.evaluate(() => history.length), length); assert.deepEqual(await f.evaluate(() => EEASectionState()), state);
}
async function fit(f, selected = true) {
  for (const selector of ['#prev', '#done', '#exit', '#count', '#center-choice']) await target(f.locator(selector), selector);
  if (selected) {
    const size = await f.locator('.community-copy').evaluate(el => ({width: el.scrollWidth <= el.clientWidth + 1, height: el.scrollHeight <= el.clientHeight + 1, top: el.scrollTop}));
    assert.deepEqual(size, {width: true, height: true, top: 0}, 'Closed reminder/review fits');
    for (const selector of ['.community-copy h2', '.lead', '.community-notes summary', '#review-original', '#return-choice', '.enlarge-image']) if (await f.locator(selector).count()) await target(f.locator(selector), selector);
  }
}
async function dialog(page, f, expected, shot, suffix) {
  const before = page.url(), length = await page.evaluate(() => history.length), state = await f.evaluate(() => EEASectionState());
  for (const [open, close] of [['keyboard', 'button'], ['image', 'Escape'], ['button', 'backdrop']]) {
    if (open === 'keyboard') { await f.locator('.enlarge-image').focus(); await page.keyboard.press('Enter'); } else await f.locator(open === 'image' ? '.lesson-img' : '.enlarge-image').click();
    assert(await f.locator('#image-dialog').evaluate(e => e.open)); await imageReady(f, expected, '#enlarged-image'); await target(f.locator('#close-image'), 'Dialog close');
    assert(await f.locator('#close-image').evaluate(e => e === document.activeElement)); if (shot && open === 'keyboard') await shot('enlarged-' + suffix);
    if (close === 'button') await f.locator('#close-image').click(); else if (close === 'Escape') await page.keyboard.press('Escape'); else { const b = await f.locator('#image-dialog').boundingBox(); await page.mouse.click(b.x - 2, b.y + 20); }
    assert(!await f.locator('#image-dialog').evaluate(e => e.open)); assert(await f.locator('.enlarge-image').evaluate(e => e === document.activeElement));
  }
  assert.equal(page.url(), before); assert.equal(await page.evaluate(() => history.length), length); assert.deepEqual(await f.evaluate(() => EEASectionState()), state);
}
function diagnostics(page) {
  const errors = [], missing = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) missing.push(r.status() + ' ' + r.url()); });
  return () => { assert.deepEqual(errors, [], 'No browser errors'); assert.deepEqual(missing, [], 'No failed assets'); };
}
async function verifyHistory(browser, base, standalone) {
  const context = await browser.newContext({viewport: {width: 1280, height: 800}, serviceWorkers: 'block'});
  try {
    const page = await context.newPage(), clean = diagnostics(page);
    // Joint-session Back/Forward must represent exactly one semantic action.
      await page.goto(base + 'daily-lessons.html?week=10&day=4'); await overview(page); const baseline = await page.evaluate(() => history.length);
      await page.goto(route(base, standalone)); let f = await centers(page, null, false, 0, standalone); assert.equal(await page.evaluate(() => history.length), baseline + 1);
      const states = [[null, false, 0], ['cooking-soup', false, 0], ['cooking-soup', true, 0], ['cooking-soup', true, 1], ['cooking-soup', true, 2], ['cooking-soup', true, 3], ['cooking-soup', false, 0], ['storytelling-props', false, 0]];
      await f.locator('#center-choice').selectOption('cooking-soup'); await f.locator('#review-original').click(); for (let i = 0; i < 3; i++) await f.locator('#done').click(); await f.locator('#return-choice').click(); await f.locator('#center-choice').selectOption('storytelling-props');
      assert.equal(await page.evaluate(() => history.length), baseline + states.length, 'No duplicate iframe history pushes');
      for (let i = states.length - 1; i >= 0; i--) { f = await centers(page, ...states[i], standalone); await page.reload(); await centers(page, ...states[i], standalone); if (i > 0) await page.goBack(); }
      await page.goBack(); await overview(page); for (const state of states) { await page.goForward(); f = await centers(page, ...state, standalone); }
      await f.locator('#center-choice').selectOption('class-soup'); f = await centers(page, 'class-soup', false, 0, standalone); await f.locator('#review-original').click(); await f.locator('#center-choice').selectOption('nature-arrangements'); await centers(page, 'nature-arrangements', false, 0, standalone);

    await page.goto(route(base, standalone, 'center=cooking-soup&review=1&step=3'));
    f = await centers(page, 'cooking-soup', true, 3, standalone);
    for (let step = 2; step >= 0; step--) { await f.locator('#prev').click(); f = await centers(page, 'cooking-soup', true, step, standalone); }
    await f.locator('#prev').click(); f = await centers(page, 'cooking-soup', false, 0, standalone);
    await f.locator('#prev').click(); await reader(page); clean();
  } finally { await context.close(); }
}
async function verifyViewport(browser, base, viewport, out, captureFactory) {
  const suffix = viewport.width + 'x' + viewport.height, context = await browser.newContext({viewport, serviceWorkers: 'allow'}), page = await context.newPage(), clean = diagnostics(page);
  const captures = captureFactory?.(page, suffix);
  const shot = async name => { if (out) { fs.mkdirSync(out, {recursive: true}); await page.screenshot({path: path.join(out, 'friday-' + name + '-' + suffix + '.png'), fullPage: true}); } };
  try {
    await page.goto(base + 'daily-lessons.html?week=10&day=4'); await overview(page);
    assert.deepEqual(await page.locator('#path .step b').allTextContents(), ['Community Meeting', 'Read Aloud', 'Centers']); await shot('overview');
    for (const key of ['Enter', 'Space']) { await page.getByRole('button', {name: 'Open Centers', exact: true}).press(key); const f = await centers(page); await captures?.verify('week10-centers-v5.js'); await f.locator('#exit').click(); await overview(page); }
    const colorPlans = JSON.parse(read('week10-color-read-aloud-plans.json'));
    for (const standalone of [false, true]) for (const book of ['green-chile', 'red-dragon']) {
      await page.goto(base + (standalone ? 'week10-read-aloud.html?day=Friday' : 'lesson-runner-week10.html?week=10&day=4&section=1') + '&book=' + book);
      let f = await reader(page, book, standalone); await captures?.verify('week10-read-aloud-v9.js'); const plan = colorPlans[book].Friday;
      assert.deepEqual(await f.evaluate(() => EEAReadAloudPlan), plan);
      for (let i = 0; i < plan.steps.length; i++) { assert.equal(await f.evaluate(() => EEASectionState().step), i); assert.equal(await f.locator('#prompt').textContent(), plan.steps[i].prompt); assert.equal(await f.locator('#bookImg').getAttribute('src'), null); if (i < plan.steps.length - 1) await f.locator('#next').click(); }
      assert.equal(await f.locator('#next').textContent(), 'Next: Centers →'); await shot(book + '-' + (standalone ? 'standalone' : 'embedded') + '-reader-end'); await f.locator('#next').click(); f = await centers(page); await page.goBack(); f = await reader(page, book, standalone); assert(await f.evaluate(() => EEASectionState().atEnd)); await page.goForward(); f = await centers(page); await f.locator('#prev').click(); f = await reader(page, book); assert.equal(await f.evaluate(() => EEASectionState().step), 0);
    }
    for (const standalone of [false, true]) {
      const mode = standalone ? 'standalone' : 'embedded';
      await page.goto(route(base, standalone)); let f = await centers(page, null, false, 0, standalone); await fit(f, false); await shot(mode + '-unselected');
      assert.deepEqual(await f.locator('#center-choice option').evaluateAll(options => options.map(o => o.value)), ['', ...activities.map(a => a.key)]);
      assert.deepEqual((await f.locator('#center-choice option').allTextContents()).slice(1), activities.map(a => a.label));
      assert.equal(await f.locator('.community-card,.lesson-img,.community-notes,#review-original').count(), 0);
      // Genuine native keyboard selection, then explicit reset to the blank option.
      await f.locator('#center-choice').focus(); await page.keyboard.press('Home'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); f = await centers(page, activities[0].key, false, 0, standalone); await f.locator('#center-choice').selectOption(''); await centers(page, null, false, 0, standalone);
      for (const activity of activities) {
        await f.locator('#center-choice').selectOption(activity.key); f = await centers(page, activity.key, false, 0, standalone); assert.equal(await f.locator('.community-card').count(), 1); await imageReady(f, activity.pages[0]); await fit(f); await shot(mode + '-' + activity.key + '-reminder'); await notes(page, f, activity.pages[0], shot, mode + '-' + activity.key);
        await f.locator('#review-original').click(); f = await centers(page, activity.key, true, 0, standalone); assert(await f.locator('#return-choice').evaluate(e => e === document.activeElement), 'Review preserves focus on the return control'); assert.deepEqual(await f.evaluate(() => EEACentersPlan), activity.pages);
        for (let i = 0; i < activity.pages.length; i++) {
          f = await centers(page, activity.key, true, i, standalone); assert.equal(await f.locator('.community-copy h2').textContent(), activity.pages[i].title); assert.equal(await f.locator('.lead').textContent(), activity.pages[i].lead); await imageReady(f, activity.pages[i]); await fit(f); await shot(mode + '-' + activity.key + '-review-' + i); await notes(page, f, activity.pages[i]);
          if (activity.pages[i].enlarge) await dialog(page, f, activity.pages[i], shot, mode + '-' + activity.key + '-review-' + i);
          if (i < activity.pages.length - 1) await f.locator('#done').click();
        }
        await f.locator('#return-choice').click(); f = await centers(page, activity.key, false, 0, standalone); assert(await f.locator('#review-original').evaluate(e => e === document.activeElement), 'Return preserves focus on the review control'); await page.reload(); f = await centers(page, activity.key, false, 0, standalone); await f.locator('#center-choice').selectOption(''); f = await centers(page, null, false, 0, standalone);
      }
      for (const [extra, c, r, s] of [['center=wrong&review=1&step=9', null, false, 0], ['center=cooking-soup&review=wrong&step=3', 'cooking-soup', false, 0], ['center=cooking-soup&review=1&step=9999', 'cooking-soup', true, 3], ['center=cooking-soup&review=1&step=-2', 'cooking-soup', true, 0]]) { await page.goto(route(base, standalone, extra + '&stop=4&book=red-dragon')); await centers(page, c, r, s, standalone); }
      for (const extra of ['', 'center=class-soup', 'center=cooking-soup&review=1']) for (const button of ['prev', 'exit', 'done']) {
        if (button === 'done' && extra.includes('review')) continue;
        await page.goto(route(base, standalone, extra)); f = await centers(page, extra ? extra.includes('cooking') ? 'cooking-soup' : 'class-soup' : null, extra.includes('review'), 0, standalone); await f.locator('#' + button).click(); if (button === 'prev' && extra.includes('review')) { f = await centers(page, 'cooking-soup', false, 0, standalone); await f.locator('#exit').click(); } else if (button === 'prev') { f = await reader(page); await f.locator('#backBtn').click(); } await overview(page);
      }
      for (const activity of activities) { await page.goto(route(base, standalone, `center=${activity.key}&review=1&step=9999`)); f = await centers(page, activity.key, true, activity.pages.length - 1, standalone); await f.locator('#done').click(); await overview(page); }
    }
    for (const standalone of [false, true]) await verifyHistory(browser, base, standalone);
    await captures?.finish(); clean(); console.log('PASS: Friday real-browser selector/source/notes/reviews/reader handoffs/history/geometry at ' + suffix);
  } catch (error) {
    if (out && !page.isClosed()) await shot('failure').catch(() => {});
    throw error;
  } finally { await context.close(); }
}
module.exports = {verifyViewport, activities, until, centers, reader, overview, route, diagnostics};
