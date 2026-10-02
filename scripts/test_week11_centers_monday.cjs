// Monday Unit 2 Week 3 Centers: independent source, asset and JSDOM regressions.
// Native joint-session history, focus, image loading and clipping are covered by
// test_week11_centers_monday_browser.cjs; no production code is rewritten here.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const {JSDOM, ResourceLoader, VirtualConsole} = require('jsdom');
const {implForWrapper} = require('jsdom/lib/jsdom/living/generated/utils');
const {serializeURL} = require('whatwg-url');
const root = path.resolve(__dirname, '../v6-test');
const origin = 'https://eea.test/v6-test/';
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const copy = value => JSON.parse(JSON.stringify(value));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const plan = JSON.parse(read('week11-centers-monday-plan.json'));
const sourceURLs = [
  'https://drive.google.com/file/d/1ik0_eqdEwAN0WK6Up1ZcKF3ft_hzRN6L/view',
  'https://drive.google.com/file/d/1tMtBIitGB6u1LnyFIHPTsnTues3bVGSj/view'
];
const assets = [
  ['assets/focus-3s/unit-2/week-3/mouse-paint/slide-06.jpg', '286e0c017a3b2f87686fcbcf3148a9a3ea20d23ae0f2f0c012a069693a24c991'],
  ['assets/focus-3s/unit-2/week-2/strictly-no-elephants/slide-14.jpg', '15b818d24852cf2bbd47272969f8385d6d45b1221bfe94dbff02e66493af61e4'],
  ['assets/focus-3s/unit-2/week-2/strictly-no-elephants/slide-16.jpg', '90ab7c989146f387e8635cda68122c902fc1d73df499247684ce17f47852053d']
];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check, label) { for (let i = 0; i < 250; i++) { if (check()) return; await delay(10); } assert.fail(label); }
class Files extends ResourceLoader {
  fetch(url) { return url.startsWith(origin) ? Promise.resolve(fs.readFileSync(path.join(root, decodeURIComponent(new URL(url).pathname.slice('/v6-test/'.length))))) : null; }
}
function open(file = 'week11-centers.html', query = 'week=11&day=Monday&section=1&step=0') {
  const errors = [], navigations = [], vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error.message));
  const w = new JSDOM(read(file), {url: origin + file + '?' + query, runScripts: 'dangerously', resources: new Files(), virtualConsole: vc, beforeParse(w) {
    implForWrapper(w.location)._locationObjectNavigate = url => navigations.push(serializeURL(url));
    // Invalid or missing day must stay unavailable even on a Monday.
    const NativeDate = w.Date;
    w.Date = class extends NativeDate { constructor(...args) { super(...(args.length ? args : ['2026-10-05T12:00:00Z'])); } static now() { return new NativeDate('2026-10-05T12:00:00Z').getTime(); } };
  }}).window;
  return {w, errors, navigations, embedded: file === 'lesson-runner-week11.html'};
}
async function ready(a) {
  await until(() => a.w.document.readyState === 'complete', 'Document initialized');
  const w = a.embedded ? a.w.document.getElementById('frame').contentWindow : a.w;
  await until(() => typeof w.EEASectionState === 'function' && w.document.readyState === 'complete', 'Centers initialized');
  return w;
}
function close(a) { assert.deepEqual(a.errors, [], 'No JavaScript/resource errors'); a.w.close(); }
function destination(a, file, day = 0, section) {
  assert.equal(a.navigations.length, 1, 'Exactly one top-level exit');
  const url = new URL(a.navigations[0]);
  assert.equal(url.pathname, '/v6-test/' + file); assert.equal(url.searchParams.get('week'), '11'); assert.equal(url.searchParams.get('day'), String(day));
  if (section !== undefined) assert.equal(url.searchParams.get('section'), String(section));
}
function route(a, step) {
  const windows = [[a.w, a.embedded ? '0' : 'Monday']];
  if (a.embedded) windows.push([a.w.document.getElementById('frame').contentWindow, 'Monday']);
  for (const [w, day] of windows) {
    const p = new URL(w.location.href).searchParams;
    assert.equal(p.get('week'), '11'); assert.equal(p.get('day'), day); assert.equal(p.get('section'), '1'); assert.equal(p.get('step'), String(step));
    for (const field of ['book', 'stop', 'center', 'review']) assert(!p.has(field), 'Unrelated route parameter removed: ' + field);
  }
}
function verify(w, step) {
  const d = w.document, p = plan[step], notes = d.querySelector('.community-notes');
  assert.deepEqual(copy(w.EEACentersPlan), plan, 'JSON and live runtime plans match exactly');
  assert.deepEqual(copy(w.EEASectionState()), {step, index: step, total: 2, atStart: step === 0, atEnd: step === 1});
  assert.equal(d.querySelectorAll('.community-card').length, 1, 'Exactly one introduction visible');
  assert.equal(d.querySelectorAll('iframe,select,#activityMenu').length, 0, 'No nested presentation or activity selector');
  assert.equal(d.querySelector('.community-copy h2').textContent, p.title);
  assert.equal(d.querySelector('.lead').textContent, p.lead);
  assert.equal(d.querySelector('.lesson-img').getAttribute('src'), p.img); assert.equal(d.querySelector('.lesson-img').alt, p.alt);
  assert.match(d.getElementById('count').textContent, new RegExp(`${step + 1}\\s*(?:of|/)\\s*2`));
  assert.match(d.getElementById('sub').textContent, /Monday/);
  assert.equal(notes.open, false, 'Teacher Notes initially collapsed');
  const sections = [];
  for (const node of notes.querySelector('.community-notes-content').children) {
    if (node.tagName === 'H3') { if (node.textContent === 'Source materials') break; sections.push([node.textContent, []]); }
    else if (node.tagName === 'P') { assert(sections.length, 'Paragraph belongs to a note heading'); sections.at(-1)[1].push(node.textContent); }
  }
  assert.deepEqual(sections, p.notes, 'Every complete note paragraph appears in source order');
  for (const source of p.sources) assert([...notes.querySelectorAll('a')].some(a => a.getAttribute('href') === source.url && a.textContent === source.label), 'Visible source link: ' + source.label);
  assert([...notes.querySelectorAll('a')].some(a => a.href === p.source), 'Original lesson link remains accessible');
  for (const link of notes.querySelectorAll('a')) { assert.equal(link.target, '_blank'); assert(link.rel.includes('noopener')); assert(link.rel.includes('noreferrer')); }
  assert.equal(d.getElementById('exit').getAttribute('aria-label'), 'Return to Day Overview');
  assert.doesNotMatch(d.body.textContent, /Finish Today/, 'A bounded Centers section does not claim all-day completion');
  const state = copy(w.EEASectionState()), url = w.location.href, length = w.history.length;
  for (let i = 0; i < 3; i++) { notes.querySelector('summary').click(); assert(notes.open); notes.querySelector('summary').click(); assert(!notes.open); }
  assert.deepEqual(copy(w.EEASectionState()), state); assert.equal(w.location.href, url); assert.equal(w.history.length, length);
}
function dialogShim(w) {
  // JSDOM omits native dialog methods. Browser tests own focus and modality.
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
}
function staticIntegrity() {
  assert.equal(plan.length, 2, 'Only the two Monday introductions');
  assert.deepEqual(plan.map(p => p.title), ['Mixing Primary Colors', '“All Are Welcome” Clubhouse']);
  assert.deepEqual(plan.map(p => p.center), ['Art Studio', 'Dramatic Play']);
  assert.deepEqual(plan.map(p => p.source), sourceURLs);
  assert.deepEqual(plan.map(p => p.img), assets.slice(0, 2).map(a => a[0]));
  const provenance = read('assets/focus-3s/unit-2/week-3/centers/SOURCE.md');
  for (const url of sourceURLs) assert(provenance.includes(url), 'Documented original source');
  for (const [asset, digest] of assets) { assert(provenance.includes(asset)); assert(provenance.includes(digest)); }
  const common = [
    'https://docs.google.com/document/d/1SuuiBk5F8PjfZjtGUCEdGFBtSXJvP8nVlSxW66TTbAI/edit',
    'https://docs.google.com/document/d/135vSqhP-fhVwzw67338NH4NQ2569uj8S3vVbWURFRLY/edit'
  ];
  const expectedSupports = [
    ['https://drive.google.com/file/d/1k3z9z3P-Q_MEPEecggDUlq49Fo764b2t/view',
     'https://drive.google.com/file/d/1fLH_XVVw92rUkor559hRHyfCpAntw-KQ/view',
     'https://drive.google.com/file/d/1eFa4JO25drSLSxFsd6dkizw8hz2e4DD_/view',
     'https://docs.google.com/document/d/1nAWoxuaD4WZ3ubJ3ZxkUEt4TtA7KpyR69bQlDCNr7G0/edit',
     'https://drive.google.com/file/d/1uE4xEK7r6_j0WuA0GnWoh49qg7CRE9rt/view',
     'https://drive.google.com/file/d/1t_bnYbmexcrPJtB-Ul2NWT0nNhzOzhC_/view',
     'https://drive.google.com/file/d/1UP1ObRYLQcWuPKpD4C_4_zeptthYu2PW/view', ...common],
    ['https://drive.google.com/file/d/1qF3x_hmFTSbKlmsFDW1YtEp4UEbkkHa5/view',
     'https://drive.google.com/file/d/12tgohu-YOufP-wPcBL6jGzr5-a_SP33s/view', assets[1][0], assets[2][0], ...common]
  ];
  plan.forEach((p, i) => assert.deepEqual(p.sources.map(s => s.url), expectedSupports[i], 'All independently verified original supports retained'));
  const context = {window: {}}; vm.runInNewContext(read('week11-centers-monday-plan-v1.js'), context);
  assert.deepEqual(copy(context.window.EEAWeek11MondayCentersPlan), plan, 'Executable and JSON plans are byte-content equivalent');
  assert.deepEqual([...read('week11-centers.html').matchAll(/<script src="([^"]+)"/g)].map(m => m[1]), ['week11-centers-monday-plan-v1.js', 'week11-centers-tuesday-plan-v1.js', 'week11-centers-wednesday-plan-v1.js', 'week11-centers-thursday-plan-v1.js', 'week11-centers-friday-plan-v1.js', 'week11-centers-v5.js']);
  for (const [asset, digest] of assets) assert.equal(hash(fs.readFileSync(path.join(root, asset))), digest, 'Original reused book spread unchanged: ' + asset);
  for (const p of plan) { assert(p.alt.trim().length > 20); assert(!p.steps, 'A center introduction is not split into mini-pages'); }
}


function sourceCoverage() {
  const fixtures = [
    ['mixing', '78fddacd6ec6fd6f1e28fbbe2c8a702f178c53e9a23dd781fbfc0685724e8cbe'],
    ['clubhouse', '0b73163ddab5a9a88e5cd9d60c9857548150551e04a510a188d0880053260ff8']
  ];
  const normalized = text => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(/\s+/);
  fixtures.forEach(([name, digest], index) => {
    const fixture = fs.readFileSync(path.join(__dirname, `fixtures/week11-centers-monday-${name}-source.txt`), 'utf8');
    assert.equal(hash(fixture), digest, 'Independent original PDF extraction unchanged: ' + name);
    // Remove only document furniture and left-column section labels. The
    // independent extraction keeps every lesson paragraph and image citation,
    // including inconsistent original paint colors and the Week 2 subtitle.
    let body = fixture.replace(/^Unit 2: World of Color\s*$/gm, '').replace(/^WEEK 3\s*$/gm, '')
      .replace(/^\s*(?:Art Studio: Mixing Primary Colors|Dramatic Play: “All Are Welcome” Clubhouse)\s*$/gm, '')
      .replace(/^Image Citations (?:for|on) Center Language Supports:?\s*$/gm, '')
      .replace(/^\s*Notes\s*$/gm, '');
    const headings = ['Big Ideas', 'Big Idea', 'Guiding', 'Questions', 'Question', 'Family', 'Engagement', 'Vocabulary', 'Materials and', 'Preparation', 'Intro to Centers', 'During Centers', 'Differentiation', 'Ideas', 'ideas', 'Facilitation', 'Extensions', 'Standards'];
    for (const heading of headings) body = body.replace(new RegExp('^' + heading + '(?:[ \\t]+|$)', 'gm'), '');
    const notes = plan[index].notes.filter(([heading]) => heading !== 'Teacher preparation clarification').flatMap(([, paragraphs]) => paragraphs).join(' ');
    assert.deepEqual(normalized(notes), normalized(body), name + ': all original teaching text and citations retained in order without omissions');
    assert(plan[index].notes.some(([heading]) => heading === 'Teacher preparation clarification'), 'Source ambiguities explained separately from verbatim teaching notes');
  });
  const mixing = plan[0].notes.flatMap(([, paragraphs]) => paragraphs).join(' ');
  for (const phrase of ['blue and red paints', 'yellow and red', 'add some blue', 'yellow+red', 'sensory sensitivities', 'playdough', 'home languages', 'ready for the next painter']) assert(mixing.includes(phrase), 'Original mixing guidance retained: ' + phrase);
  const clubhouse = plan[1].notes.flatMap(([, paragraphs]) => paragraphs).join(' ');
  for (const phrase of ['continues in Week 2', 'For the next two weeks', 'families and caregivers', 'smaller scale', 'realistic and doable', 'children’s ideas']) assert(clubhouse.includes(phrase), 'Original clubhouse guidance retained: ' + phrase);
  assert(plan[1].sources.some(s => s.url === assets[2][0]), 'Additional flagged final spread remains linked');
}

(async () => {
  staticIntegrity();
  sourceCoverage();
  for (const embedded of [false, true]) {
    const file = embedded ? 'lesson-runner-week11.html' : 'week11-centers.html';
    const base = `week=11&day=${embedded ? '0' : 'Monday'}&section=1`;
    for (const [raw, expected] of [['0', 0], ['1', 1], ['99999', 1], ['-1', 0], ['bad', 0], ['1.5', 0], ['Infinity', 0], ['NaN', 0], ['', 0]]) {
      const a = open(file, `${base}&step=${raw}&book=mouse-paint&stop=4&center=class-soup&review=1`), w = await ready(a);
      verify(w, expected); route(a, expected); assert.equal(a.w.history.length, 1, 'Normalization replaces rather than pushes'); close(a);
    }
    const a = open(file, base), w = await ready(a), d = w.document, parentLength = a.w.history.length, childLength = w.history.length;
    verify(w, 0); route(a, 0);
    dialogShim(w);
    for (const trigger of ['.enlarge-image', '.lesson-img']) {
      d.querySelector(trigger).click(); assert(d.getElementById('image-dialog').open);
      assert.equal(d.getElementById('enlarged-image').getAttribute('src'), plan[0].img);
      assert.equal(d.getElementById('enlarged-image').alt, plan[0].alt);
      d.getElementById('close-image').click(); assert(!d.getElementById('image-dialog').open);
    }
    d.querySelector('.enlarge-image').click();
    for (let i = 0; i < 4; i++) { a.w.dispatchEvent(new a.w.Event('pageshow')); if (embedded) a.w.document.getElementById('frame').dispatchEvent(new a.w.Event('load')); }
    assert(!d.getElementById('image-dialog').open, 'Lifecycle restoration closes enlarged image');
    assert.equal(a.w.history.length, parentLength, 'Lifecycle restoration does not add history');
    d.getElementById('done').click(); verify(w, 1); route(a, 1);
    assert.equal(a.w.history.length, parentLength + 1, 'One Next produces one history entry');
    if (embedded) assert.equal(w.history.length, childLength, 'Iframe does not push duplicate history');
    a.w.history.back(); await until(() => w.EEASectionState().step === 0, 'Back restores first center'); verify(w, 0); route(a, 0);
    a.w.history.forward(); await until(() => w.EEASectionState().step === 1, 'Forward restores second center'); verify(w, 1); route(a, 1);
    d.getElementById('prev').click(); verify(w, 0); route(a, 0); assert.deepEqual(a.navigations, []);
    d.getElementById('done').click(); d.getElementById('done').click(); destination(a, 'daily-lessons.html'); close(a);
    for (const [step, button, target, section] of [[0, 'prev', 'lesson-runner-week11.html', 0], [0, 'exit', 'daily-lessons.html'], [1, 'exit', 'daily-lessons.html']]) {
      const a = open(file, base + '&step=' + step), w = await ready(a);
      a.w.localStorage.setItem('eea-lesson-auto-resume', 'enabled');
      w.document.getElementById(button).click(); destination(a, target, 0, section);
      if (target === 'daily-lessons.html') assert.equal(a.w.localStorage.getItem('eea-lesson-auto-resume'), null);
      close(a);
    }
    // Friday now has Centers, but its unverified reader cannot be opened.
    for (const requested of ['Friday', '4']) {
      const a = open(file, `week=11&day=${requested}&section=0&step=1`);
      await until(() => a.navigations.length === 1, 'Unavailable Friday reader returns to its overview');
      destination(a, 'daily-lessons.html', 4);
      assert.equal(a.w.document.querySelectorAll('.community-card').length, 0);
      assert.equal(a.w.EEACentersPlan, undefined, 'Unavailable reader does not substitute a Centers plan');
      const frame = a.w.document.getElementById('frame');
      if (frame) assert.equal(frame.getAttribute('src'), null, 'Unavailable reader never loads an iframe');
      close(a);
    }
  }
  for (const file of ['week11-centers.html', 'lesson-runner-week11.html']) {
    for (const dayQuery of ['', 'day=', 'day=bad', 'day=-1', 'day=1.5', 'day=Infinity', 'day=5']) {
      const a = open(file, 'week=11&section=1&' + dayQuery);
      await until(() => a.navigations.length === 1, 'Invalid/missing day does not default to a ready Monday');
      destination(a, 'daily-lessons.html', 0); close(a);
    }
  }
  const numeric = open('week11-centers.html', 'week=11&day=0&section=1&step=1');
  const numericWindow = await ready(numeric); verify(numericWindow, 1); route(numeric, 1); close(numeric);
  console.log('PASS: Monday two-page source/JSON/JS parity, original book assets, complete Teacher Notes, normalization, DOM history, same-day boundaries, and unavailable reader/invalid-day routes');
})().catch(error => { console.error(error); process.exitCode = 1; });
