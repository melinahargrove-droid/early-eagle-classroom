// Wednesday Unit 2 Week 3 Centers: independent source, asset and JSDOM regressions.
// Native joint-session history, focus, image loading and clipping are covered by
// test_week11_centers_wednesday_browser.cjs; no production code is rewritten here.
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
const plan = JSON.parse(read('week11-centers-wednesday-plan.json'));
// Independently pinned URLs and original visual hashes come from
// the verified source documents and source-asset provenance, never from plan data.
const sourceURLs = [
  'https://drive.google.com/file/d/1maGKAuEwW9CMYbaNk2-Yx6Zgg_aAC0LG/view',
  'https://drive.google.com/file/d/1ACQ8V6kqjXq9TtqdGTeyBssC0K1ORLoE/view'
];
const assets = [
  ['assets/focus-3s/unit-2/week-3/mouse-paint/slide-04.jpg', '13659c9bc7371836f8a1867d67d787b49c866c2082b701940f053800dddecbe4'],
  ['assets/focus-3s/unit-2/week-1/wednesday/reflect-on-acting.jpg', '8a98e4e7485e8f759ae3ab8dd274fbacf78f12029c06bc8f752760f5f159d52d']
];
const commonSupports = [
  'https://docs.google.com/document/d/1SuuiBk5F8PjfZjtGUCEdGFBtSXJvP8nVlSxW66TTbAI/edit',
  'https://docs.google.com/document/d/135vSqhP-fhVwzw67338NH4NQ2569uj8S3vVbWURFRLY/edit'
];
const expectedSupports = [
  ['https://drive.google.com/file/d/1_SRc_urTXtxNUoq7yZ7FFGxKW9XdgVW4/view',
   'https://drive.google.com/file/d/1xKJ9sbTBixgy9rld5w_Sx1RqYjCscfI9/view',
   'https://drive.google.com/file/d/1ljSEOeeTOINekfZahEAsmQ_QLeQxFzxc/view',
   'https://drive.google.com/file/d/1jDuYuzVmTL5YlPYzwZbygLnG6ypPrB8K/view', ...commonSupports],
  ['https://drive.google.com/file/d/1Vsgd5yVHwHUrkPWTkBwDjzgESCrchxoD/view',
   'https://drive.google.com/file/d/1T2ZLZwRx7ubquddBUj1rYjQEU9YrOuF5/view',
   'https://drive.google.com/file/d/1BPSSaL-6yDQYRJ10atXtgWC5nRHHt3sV/view', ...commonSupports]
];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check, label) { for (let i = 0; i < 250; i++) { if (check()) return; await delay(10); } assert.fail(label); }
class Files extends ResourceLoader {
  fetch(url) { return url.startsWith(origin) ? Promise.resolve(fs.readFileSync(path.join(root, decodeURIComponent(new URL(url).pathname.slice('/v6-test/'.length))))) : null; }
}
function open(file = 'week11-centers.html', query = 'week=11&day=Wednesday&section=1&step=0') {
  const errors = [], navigations = [], vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error.message));
  const w = new JSDOM(read(file), {url: origin + file + '?' + query, runScripts: 'dangerously', resources: new Files(), virtualConsole: vc, beforeParse(w) {
    implForWrapper(w.location)._locationObjectNavigate = url => navigations.push(serializeURL(url));
    // Invalid or missing day must stay unavailable even on a Wednesday.
    const NativeDate = w.Date;
    w.Date = class extends NativeDate { constructor(...args) { super(...(args.length ? args : ['2026-10-07T12:00:00Z'])); } static now() { return new NativeDate('2026-10-07T12:00:00Z').getTime(); } };
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
function destination(a, file, day = 2, section) {
  assert.equal(a.navigations.length, 1, 'Exactly one top-level exit');
  const url = new URL(a.navigations[0]);
  assert.equal(url.pathname, '/v6-test/' + file); assert.equal(url.searchParams.get('week'), '11'); assert.equal(url.searchParams.get('day'), String(day));
  if (section !== undefined) assert.equal(url.searchParams.get('section'), String(section));
}
function route(a, step, dayIndex = 2) {
  const windows = [[a.w, a.embedded ? String(dayIndex) : days[dayIndex]]];
  if (a.embedded) windows.push([a.w.document.getElementById('frame').contentWindow, days[dayIndex]]);
  for (const [w, day] of windows) {
    const p = new URL(w.location.href).searchParams;
    assert.equal(p.get('week'), '11'); assert.equal(p.get('day'), day); assert.equal(p.get('section'), '1'); assert.equal(p.get('step'), String(step));
    for (const field of ['book', 'stop', 'center', 'review']) assert(!p.has(field), 'Unrelated route parameter removed: ' + field);
  }
}
function verify(w, step, expectedPlan = plan, dayIndex = 2) {
  const d = w.document, p = expectedPlan[step], notes = d.querySelector('.community-notes');
  assert.deepEqual(copy(w.EEACentersPlan), expectedPlan, 'JSON and live runtime plans match exactly');
  assert.deepEqual(copy(w.EEASectionState()), {step, index: step, total: 2, atStart: step === 0, atEnd: step === 1});
  assert.equal(d.querySelectorAll('.community-card').length, 1, 'Exactly one introduction visible');
  assert.equal(d.querySelectorAll('iframe,select,#activityMenu').length, 0, 'No nested presentation or activity selector');
  assert.equal(d.querySelector('.community-copy h2').textContent, p.title);
  assert.equal(d.querySelector('.lead').textContent, p.lead);
  assert.equal(d.querySelector('.lesson-img').getAttribute('src'), p.img); assert.equal(d.querySelector('.lesson-img').alt, p.alt);
  assert.match(d.getElementById('count').textContent, new RegExp(`${step + 1}\\s*(?:of|/)\\s*2`));
  assert.equal(d.getElementById('sub').textContent, days[dayIndex] + ' · ' + p.center);
  assert.equal(notes.querySelector('summary').textContent, 'Teacher Notes');
  assert.equal(d.getElementById('prev').textContent, step === 0 ? (dayIndex === 2 ? '← Day Overview' : '← Read Aloud') : '← Previous');
  assert.equal(d.getElementById('done').textContent, step === 1 ? 'Finish Centers →' : dayIndex === 2 ? 'Next: Exploring Emotions →' : dayIndex === 1 ? 'Next: Color Walk →' : 'Next: All Are Welcome Clubhouse →');
  assert.equal(notes.open, false, 'Teacher Notes initially collapsed');
  const sections = [];
  for (const node of notes.querySelector('.community-notes-content').children) {
    if (node.tagName === 'H3') { if (node.textContent === 'Source materials') break; sections.push([node.textContent, []]); }
    else if (node.tagName === 'P') { assert(sections.length, 'Paragraph belongs to a note heading'); sections.at(-1)[1].push(node.textContent); }
  }
  assert.deepEqual(sections, p.notes, 'Every complete note paragraph appears in source order');
  for (const source of p.sources) assert([...notes.querySelectorAll('a')].some(a => a.getAttribute('href') === source.url && a.textContent === source.label), 'Visible source link: ' + source.label);
  assert([...notes.querySelectorAll('a')].some(a => a.href === p.source), 'Original lesson link remains accessible');
  assert.equal(notes.querySelectorAll('a').length, p.sources.length + 1, 'No stale or unrelated source links');
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
  assert.equal(plan.length, 2, 'Only the two Wednesday introductions');
  assert.deepEqual(plan.map(p => p.title), ['Bead Bracelets', 'Exploring Emotions']);
  assert.deepEqual(plan.map(p => p.center), ['Math', 'Library and Listening']);
  assert.equal(sourceURLs.length, 2, 'Independent source URL expectations complete');
  assert.equal(assets.length, 2, 'Independent original visual expectations complete');
  assert.deepEqual(plan.map(p => p.source), sourceURLs);
  assert.deepEqual(plan.map(p => p.img), assets.map(a => a[0]));
  const provenance = read('assets/focus-3s/unit-2/week-3/centers/WEDNESDAY-SOURCE.md');
  for (const url of sourceURLs) assert(provenance.includes(url), 'Documented original source');
  for (const [asset, digest] of assets) {
    assert(provenance.includes(asset), 'Documented visual path: ' + asset);
    assert(provenance.includes(digest), 'Documented original visual hash: ' + asset);
    assert.equal(hash(fs.readFileSync(path.join(root, asset))), digest, 'Original visual unchanged: ' + asset);
  }
  plan.forEach((p, i) => {
    assert.deepEqual(p.sources.map(s => s.url), expectedSupports[i], 'All independently verified original supports retained');
    assert(p.alt.trim().length > 20, 'Specific visual alternative text');
    assert(!p.steps, 'A center introduction is not split into mini-pages');
    for (const source of p.sources) {
      assert(source.label.trim(), 'Every source has a human-readable label');
      const url = new URL(source.url, origin);
      assert.equal(url.protocol, 'https:', 'Source links use a safe protocol');
    }
  });
  for (const [file, digest] of [["week11-centers-monday-plan.json", "f02a50557f295a3b0e0a18c087ccb90386e06e8c9a6bb7cbffaba2ee3021d565"], ["week11-centers-monday-plan-v1.js", "0576b8136877911c9bf1797e0c6bfd4006f5db85c80ed9100a20c7e284438edc"], ["week11-centers-tuesday-plan.json", "636daad22071e50b9d56aa2c9abd971d86dca426b369b398959fafd7bfe480e6"], ["week11-centers-tuesday-plan-v1.js", "fb0cbe6f6c849ea2f8e9ece3e4f332c25fa15690de76046041882bc9ff98049a"]]) assert.equal(hash(read(file)), digest, 'Earlier source payload remains unchanged: ' + file);
  const context = {window: {}}; vm.runInNewContext(read('week11-centers-wednesday-plan-v1.js'), context);
  assert.deepEqual(copy(context.window.EEAWeek11WednesdayCentersPlan), plan, 'Executable and JSON plans are byte-content equivalent');
  assert.deepEqual([...read('week11-centers.html').matchAll(/<script src="([^"]+)"/g)].map(m => m[1]), ['week11-centers-monday-plan-v1.js', 'week11-centers-tuesday-plan-v1.js', 'week11-centers-wednesday-plan-v1.js', 'week11-centers-thursday-plan-v1.js', 'week11-centers-friday-plan-v1.js', 'week11-centers-v5.js']);
}

function sourceCoverage() {
  const fixtures = [
    ['beads', 'a50ecb268af4b4e8f2608750b82dd1268ae9ba3152757fa5d4c8f1ef6d0ed952'],
    ['emotions', 'e9249c57b9522d6e309ba492a1e2899cec12557498e7364a2edbefc5f81acef8']
  ];
  // Stricter than word-token comparison: every non-whitespace character is
  // preserved, including original punctuation, capitalization, and typos.
  const normalized = text => text.replace(/●/g, '').replace(/\s+/g, '');
  fixtures.forEach(([name, digest], index) => {
    const fixture = fs.readFileSync(path.join(__dirname, `fixtures/week11-centers-wednesday-${name}-source.txt`), 'utf8');
    assert.equal(hash(fixture), digest, 'Independent original PDF extraction unchanged: ' + name);
    let body = fixture.replace(/\f/g, '').replace(/^Unit 2: World of [Cc]olor\s*$/gm, '').replace(/^WEEK 3\s*$/gm, '')
      .replace(/^\s*(?:Math: Bead Bracelets|Library and Listening: Exploring Emotions)\s*$/gm, '')
      .replace(/(?:Math|Library and Listening) U2 W3/g, ' ')
      .replace(/Focus on Pre-K 3s \| Boston Public Schools Early Childhood Department P-2/g, ' ')
      .replace(/^Image Citations for Center Language Supports\s*$/gm, '')
      .replace(/^\s*Notes\s*$/gm, '');
    const headings = ['Big Ideas', 'Objective', 'Guiding', 'Questions', 'Family', 'Engagement', 'Vocabulary', 'Materials and', 'Preparation', 'Intro to Centers', 'During Centers', 'Differentiation', 'Ideas', 'Facilitation', 'Extensions', 'Standards'];
    for (const heading of headings) body = body.replace(new RegExp('^\\s*' + heading + '(?:[ \\t]+|$)', 'gm'), '');
    const notes = plan[index].notes.filter(([heading]) => heading !== 'Teacher preparation clarification').flatMap(([, paragraphs]) => paragraphs).join(' ');
    assert.equal(normalized(notes), normalized(body), name + ': every source character is retained in order, except layout whitespace and bullets');
    assert(plan[index].notes.some(([heading]) => heading === 'Teacher preparation clarification'), 'Source ambiguities explained separately from original teaching notes');
  });
  const originalNotes = index => plan[index].notes.filter(([heading]) => heading !== 'Teacher preparation clarification').flatMap(([, paragraphs]) => paragraphs).join(' ');
  const beads = originalNotes(0);
  for (const phrase of ['one to one correspondence', 'count objects to 5', 'Flag pages 5-6', '0-5', 'Next we are going to add that many beads to our Five Frame', 'Then we are going to add them to our bracelet', 'one less leave on my bracelet', 'studier pipe cleaner', 'wiki sticks', 'egg cart', 'higher numbers (6-10)', 'The same amount is equal']) assert(beads.includes(phrase), 'Original Bead Bracelets guidance retained: ' + phrase);
  const emotions = originalNotes(1);
  for (const phrase of ['first page with the color monster mixed up and then flip to sadness', 'Chart and discuss 2 responses', 'blue scarf', 'body language and facial expression', 'If ready, ask children to share what they did to cope with the feeling', 'If children feel uncomfortable acting out an emotion themselves', 'use the people figurines instead', 'mindfulness and breathing practices', 'happiness, sadness, anger, fear, loved', 'calm: relaxed and peaceful', 'fearful: 张 学欢 on UnSplash']) assert(emotions.includes(phrase), 'Original Exploring Emotions guidance retained: ' + phrase);
  const clarification = plan[1].notes.find(([heading]) => heading === 'Teacher preparation clarification')[1].join(' ');
  assert.match(clarification, /physical classroom copy of The Color Monster/);
  assert.match(clarification, /not a page from The Color Monster or a photograph of this class/);
  assert.match(plan[1].alt, /Supplemental watercolor illustration/);
  assert.match(plan[1].lead, /The Color Monster classroom book ready/);
  assert(plan[1].sources.some(s => s.label.includes('Color Monster Emotion Cards') && s.url === expectedSupports[1][1]), 'Emotion cards stay linked teacher resources');
}

(async () => {
  staticIntegrity();
  sourceCoverage();
  for (const embedded of [false, true]) {
    const file = embedded ? 'lesson-runner-week11.html' : 'week11-centers.html';
    const base = `week=11&day=${embedded ? '2' : 'Wednesday'}&section=1`;
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
    for (let i = 0; i < 4; i++) { a.w.dispatchEvent(new a.w.Event('pageshow')); if (embedded) { w.dispatchEvent(new w.Event('pageshow')); a.w.document.getElementById('frame').dispatchEvent(new a.w.Event('load')); } }
    assert(!d.getElementById('image-dialog').open, 'Lifecycle restoration closes enlarged image');
    assert.equal(a.w.history.length, parentLength, 'Lifecycle restoration does not add history');
    d.querySelector('.community-notes summary').click(); assert(d.querySelector('.community-notes').open);
    d.querySelector('.enlarge-image').click();
    d.getElementById('done').click(); verify(w, 1); route(a, 1);
    assert(!d.getElementById('image-dialog').open, 'Changing center closes a stale enlarged image');
    d.querySelector('.enlarge-image').click();
    assert.equal(d.getElementById('enlarged-image').getAttribute('src'), plan[1].img);
    assert.equal(d.getElementById('enlarged-image').alt, plan[1].alt);
    d.getElementById('close-image').click();
    assert.equal(a.w.history.length, parentLength + 1, 'One Next produces one history entry');
    if (embedded) assert.equal(w.history.length, childLength, 'Iframe does not push duplicate history');
    a.w.history.back(); await until(() => w.EEASectionState().step === 0, 'Back restores first center'); verify(w, 0); route(a, 0);
    a.w.history.forward(); await until(() => w.EEASectionState().step === 1, 'Forward restores second center'); verify(w, 1); route(a, 1);
    d.getElementById('prev').click(); verify(w, 0); route(a, 0); assert.deepEqual(a.navigations, []);
    d.getElementById('done').click();
    a.w.localStorage.setItem('eea-lesson-auto-resume', 'enabled');
    for (let i = 0; i < 3; i++) d.getElementById('done').click();
    d.getElementById('exit').click(); destination(a, 'daily-lessons.html');
    assert.equal(a.w.localStorage.getItem('eea-lesson-auto-resume'), null, 'Finish clears automatic resume'); close(a);
    for (const [step, button, target, section] of [[0, 'prev', 'daily-lessons.html'], [0, 'exit', 'daily-lessons.html'], [1, 'exit', 'daily-lessons.html']]) {
      const a = open(file, base + '&step=' + step), w = await ready(a);
      a.w.localStorage.setItem('eea-lesson-auto-resume', 'enabled');
      for (let i = 0; i < 3; i++) w.document.getElementById(button).click();
      destination(a, target, 2, section);
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
    for (const dayQuery of ['', 'day=', 'day=bad', 'day=-1', 'day=1.5', 'day=Infinity', 'day=NaN', 'day=5', 'day=Wednesday%20', 'day=wednesday', 'day=Sunday']) {
      const a = open(file, 'week=11&section=1&' + dayQuery);
      await until(() => a.navigations.length === 1, 'Invalid/missing day does not default to a ready Wednesday');
      destination(a, 'daily-lessons.html', 2);
      assert.equal(a.w.EEACentersPlan, undefined, 'Malformed day does not silently load Wednesday'); close(a);
    }
  }
  // Earlier explicitly supported days survive shared v5. Earlier verified source
  // payloads remain exactly unchanged; the Wednesday boundary is the overview.
  const plans = ['monday', 'tuesday', 'wednesday'].map(day => JSON.parse(read(`week11-centers-${day}-plan.json`)));
  for (const file of ['week11-centers.html', 'lesson-runner-week11.html']) {
    for (const dayIndex of [0, 1, 2]) for (const day of [days[dayIndex], String(dayIndex)]) {
      const a = open(file, `week=11&day=${day}&section=1&step=1`), w = await ready(a);
      verify(w, 1, plans[dayIndex], dayIndex); route(a, 1, dayIndex);
      w.document.getElementById('prev').click();
      verify(w, 0, plans[dayIndex], dayIndex); route(a, 0, dayIndex);
      w.document.getElementById('prev').click();
      destination(a, dayIndex === 2 ? 'daily-lessons.html' : 'lesson-runner-week11.html', dayIndex, dayIndex === 2 ? undefined : 0); close(a);
    }
  }
  // Wednesday has no verified Read Aloud: direct requests cannot activate it.
  for (const section of ['0', '3', '-1', 'bad', '1.5', '']) {
    for (const file of ['week11-centers.html', 'lesson-runner-week11.html']) {
      const a = open(file, `week=11&day=Wednesday&section=${section}`);
      await until(() => a.navigations.length === 1, 'Unavailable Wednesday section returns to overview');
      destination(a, 'daily-lessons.html', 2);
      assert.equal(a.w.EEACentersPlan, undefined, 'Unavailable section does not load Centers');
      const frame = a.w.document.getElementById('frame');
      if (frame) assert.equal(frame.getAttribute('src'), null, 'Unavailable section never loads a reader iframe');
      close(a);
    }
  }
  console.log('PASS: Wednesday two-page source/JSON/JS parity, pinned book/neutral visuals, exact original Teacher Notes, normalization, DOM history, same-day boundaries, and unavailable reader/invalid-day routes');
})().catch(error => { console.error(error); process.exitCode = 1; });
