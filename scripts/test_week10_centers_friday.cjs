// Source and JSDOM regressions. Native history, focus, layout and image loading
// are tested by test_week10_centers_friday_browser.cjs, never simulated here.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {JSDOM, ResourceLoader, VirtualConsole} = require('jsdom');
const {implForWrapper} = require('jsdom/lib/jsdom/living/generated/utils');
const {serializeURL} = require('whatwg-url');
const {root, read, plans, activities, sourcePlan} = require('./test_week10_centers_friday_fixtures.cjs');
const origin = 'https://eea.test/v6-test/';
const copy = value => JSON.parse(JSON.stringify(value));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check, label) { for (let i = 0; i < 250; i++) { if (check()) return; await delay(10); } assert.fail(label); }
class Files extends ResourceLoader { fetch(url) { return url.startsWith(origin) ? Promise.resolve(fs.readFileSync(path.join(root, decodeURIComponent(new URL(url).pathname.slice('/v6-test/'.length))))) : null; } }
function open(embedded = true, extra = '', storage = {}) {
  const errors = [], navigations = [], vc = new VirtualConsole(); vc.on('jsdomError', error => errors.push(error.message));
  const filename = embedded ? 'lesson-runner-week10.html' : 'week10-centers.html';
  const query = `week=10&day=${embedded ? '4' : 'Friday'}&section=2${extra ? '&' + extra : ''}`;
  const w = new JSDOM(read(filename), {url: origin + filename + '?' + query, runScripts: 'dangerously', resources: new Files(), virtualConsole: vc, beforeParse(w) {
    for (const [key, value] of Object.entries(storage)) w.localStorage.setItem(key, value);
    implForWrapper(w.location)._locationObjectNavigate = url => navigations.push(serializeURL(url));
  }}).window;
  return {w, embedded, errors, navigations};
}
async function ready(a) {
  await until(() => a.w.document.readyState === 'complete', 'Document initialized');
  const w = a.embedded ? a.w.document.getElementById('frame').contentWindow : a.w;
  await until(() => typeof w.EEASectionState === 'function', 'Friday runtime initialized'); return w;
}
function close(a) { assert.deepEqual(a.errors, [], 'No script errors'); a.w.close(); }
function select(w, key) { const input = w.document.getElementById('center-choice'); input.value = key; input.dispatchEvent(new w.Event('change', {bubbles: true})); }
function state(w, center = null, review = false, step = 0) {
  const total = center ? (review ? activities.find(a => a.key === center).pages.length : 1) : 0;
  assert.deepEqual(copy(w.EEASectionState()), {step, index: step, total, atStart: !review && step === 0, atEnd: step >= total - 1, center, review});
}
function route(a, center = null, review = false, step = 0) {
  for (const [w, day] of [[a.w, a.embedded ? '4' : 'Friday'], ...(a.embedded ? [[a.w.document.getElementById('frame').contentWindow, 'Friday']] : [])]) {
    const p = new URL(w.location.href).searchParams;
    assert.equal(p.get('week'), '10'); assert.equal(p.get('day'), day); assert.equal(p.get('section'), '2'); assert.equal(p.get('step'), String(step));
    assert.equal(p.get('center'), center); assert.equal(p.get('review'), review ? '1' : null); for (const key of ['book', 'stop']) assert(!p.has(key), 'Reader-only parameter removed');
  }
}
function notes(w, expected) {
  const d = w.document, sections = [];
  for (const node of d.querySelector('.community-notes-content').children) {
    if (node.tagName === 'H3') { if (node.textContent === 'Source materials') break; sections.push([node.textContent, []]); }
    else if (node.tagName === 'P') sections.at(-1)[1].push(node.textContent);
  }
  assert.deepEqual(sections, expected.notes, 'Full original source notes retained in exact order');
  assert.deepEqual([...d.querySelectorAll('.community-notes-content a')].map(a => [a.textContent, a.getAttribute('href')]), [...(expected.links || []), ['Original Week 2 lesson', expected.source], ['Original Week 2 Plan', sourcePlan]]);
  for (const link of d.querySelectorAll('.community-notes-content a')) { assert.equal(link.target, '_blank'); assert(link.rel.includes('noopener')); assert(link.rel.includes('noreferrer')); }
}
function exit(a, button) {
  assert.equal(a.navigations.length, 1, 'One top-level exit'); const u = new URL(a.navigations[0]);
  assert.equal(u.pathname, '/v6-test/' + (button === 'prev' ? 'lesson-runner-week10.html' : 'daily-lessons.html'));
  assert.equal(u.searchParams.get('week'), '10'); assert.equal(u.searchParams.get('day'), '4');
  if (button === 'prev') assert.equal(u.searchParams.get('section'), '1');
}
(async () => {
  assert.deepEqual(activities.map(a => a.pages.length), [1, 1, 4, 1, 1, 1, 1]);
  const hashes = {
    'week10-centers-v4.js': '25ddb05bec74d8b00eb2b2e6dcab5d32acacdb19269a1690067f341020ba9e83',
    'week10-read-aloud-v8.js': '488c832964a0f5a6e95c17daa06365889005fede84d0b5e9216c36a8cfe907a5',
    'week10-centers-thursday-plan.json': '82ed63999cc7ad6058c4dc1639d31f4c03539fd279a0b3401d38f4933dbaf423',
    'week10-centers-monday-plan.json': '4f45def095c02678e250449b0a77f998d267501dd18ae223aae917a1aadd10c3',
    'week10-centers-tuesday-plan.json': '4da1d97f5fc2a40b67a4258aa85c7ed038b1c69f1db8b291f37964ac595b4ee1',
    'week10-centers-wednesday-plan.json': '0929f336101667bdffd1926caa0fddeb3c6fe474bf396969b7677cc2cdbe2b0b'
  };
  for (const [file, expected] of Object.entries(hashes)) if (expected) assert.equal(hash(read(file)), expected, 'Original source bytes preserved: ' + file);
  assert(read('week10-centers.html').includes('src="week10-centers-v5.js"')); assert(read('week10-read-aloud.html').includes('src="week10-read-aloud-v9.js"'));
  assert.match(read('sw.js'), /eea-companion-v101/); for (const file of ['week10-centers-v5.js', 'week10-read-aloud-v9.js']) assert(read('sw.js').includes('./' + file));
  for (const embedded of [false, true]) {
    const a = open(embedded, '', {'eea-u2w2-center-choice': 'class-soup'}), w = await ready(a), d = w.document;
    const choice = d.getElementById('center-choice'); assert.equal(choice.tagName, 'SELECT'); assert.equal(choice.value, '', 'No default or localStorage selection');
    assert.deepEqual([...choice.options].map(o => o.value), ['', ...activities.map(a => a.key)]); assert.deepEqual([...choice.options].slice(1).map(o => o.textContent), activities.map(a => a.label)); assert(choice.labels.length > 0, 'Native select has accessible label');
    state(w); route(a); assert.deepEqual(copy(w.EEACentersPlan), []); assert.equal(d.querySelectorAll('.community-card,.lesson-img,.community-notes,#review-original').length, 0); assert.equal(d.querySelectorAll('iframe').length, 0);
    const length = a.w.history.length;
    for (let i = 0; i < 4; i++) { a.w.dispatchEvent(new a.w.Event('pageshow')); if (embedded) a.w.document.getElementById('frame').dispatchEvent(new a.w.Event('load')); state(w); }
    assert.equal(a.w.history.length, length, 'Repeated lifecycle events do not add entries'); close(a);
    for (const activity of activities) {
      const a = open(embedded), w = await ready(a), d = w.document; select(w, activity.key); state(w, activity.key); route(a, activity.key);
      assert.equal(w.EEACentersPlan.length, 1); assert.equal(d.querySelectorAll('.community-card').length, 1); assert.equal(d.querySelector('.lesson-img').getAttribute('src'), activity.pages[0].img); notes(w, activity.pages[0]);
      const reminder = copy(w.EEACentersPlan), before = a.w.location.href, length = a.w.history.length;
      for (let n = 0; n < 4; n++) { d.querySelector('summary').click(); assert(d.querySelector('details').open); d.querySelector('summary').click(); assert(!d.querySelector('details').open); }
      assert.equal(a.w.location.href, before); assert.equal(a.w.history.length, length);
      d.getElementById('review-original').click(); state(w, activity.key, true); route(a, activity.key, true); assert.deepEqual(copy(w.EEACentersPlan), activity.pages, 'Review is exactly this activity, never its neighbors');
      for (let index = 0; index < activity.pages.length; index++) {
        state(w, activity.key, true, index); route(a, activity.key, true, index); assert.equal(d.querySelector('.community-copy h2').textContent, activity.pages[index].title); assert.equal(d.querySelector('.lead').textContent, activity.pages[index].lead); notes(w, activity.pages[index]);
        if (index < activity.pages.length - 1) d.getElementById('done').click();
      }
      d.getElementById('return-choice').click(); state(w, activity.key); route(a, activity.key); assert.deepEqual(copy(w.EEACentersPlan), reminder, 'Return retains selected reminder');
      select(w, ''); state(w); route(a); assert.equal(d.querySelectorAll('.community-card,.lesson-img,.community-notes').length, 0); close(a);
    }
    for (const [extra, center, review, step] of [
      ['center=unknown&review=1&step=3', null, false, 0], ['review=1&step=3', null, false, 0],
      ['center=class-soup&review=banana&step=4', 'class-soup', false, 0], ['center=cooking-soup&review=0&step=3', 'cooking-soup', false, 0],
      ['center=cooking-soup&review=1&step=999999', 'cooking-soup', true, 3], ['center=cooking-soup&review=1&step=-1', 'cooking-soup', true, 0],
      ['center=cooking-soup&review=1&step=Infinity', 'cooking-soup', true, 0], ['center=cooking-soup&review=1&step=NaN', 'cooking-soup', true, 0],
      ['center=cooking-soup&review=1&step=1.5', 'cooking-soup', true, 0], ['center=class-soup&review=1&step=6', 'class-soup', true, 0]
    ]) { const a = open(embedded, extra + '&book=red-dragon&stop=4'), w = await ready(a); state(w, center, review, step); route(a, center, review, step); assert.equal(a.w.history.length, 1, 'Normalization only replaces'); close(a); }
    for (const button of ['prev', 'done', 'exit']) for (const extra of ['', 'center=class-soup', 'center=cooking-soup&review=1']) {
      if (button === 'done' && extra.includes('review')) continue;
      const a = open(embedded, extra), w = await ready(a); w.document.getElementById(button).click(); if (button === 'prev' && extra.includes('review')) { state(w, 'cooking-soup'); route(a, 'cooking-soup'); assert.deepEqual(a.navigations, []); } else exit(a, button); close(a);
    }
    for (const activity of activities) { const a = open(embedded, `center=${activity.key}&review=1&step=9999`), w = await ready(a); w.document.getElementById('done').click(); exit(a, 'done'); close(a); }
  }
  console.log('PASS: Friday seven native no-default choices, exact original review slices and source notes, normalization, no phantom lifecycle entries, selected reminder return and same-day boundaries');
})().catch(error => { console.error(error); process.exitCode = 1; });
