// Run with jsdom 26.1.0 available on NODE_PATH. No app data or network writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, ResourceLoader, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '../v6-test');
const origin = 'https://eea.test/v6-test/';
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(test, label) {
  for (let i = 0; i < 150; i++) { if (test()) return; await delay(10); }
  assert.fail(label);
}
class AppFiles extends ResourceLoader {
  constructor(skipCommunityVisuals = false) { super(); this.skipCommunityVisuals = skipCommunityVisuals; }
  fetch(url) {
    // JSDOM destroys iframe globals before queued visual MutationObservers run.
    // Skip only this visual helper in Community navigation tests; Chromium below
    // exercises the real helper, images and document teardown without stubbing.
    if (this.skipCommunityVisuals && new URL(url).pathname.endsWith('/community-visual-overrides.js')) return null;
    if (!url.startsWith(origin)) return null;
    return Promise.resolve(fs.readFileSync(path.join(root, new URL(url).pathname.slice('/v6-test/'.length))));
  }
}
function open(file, query, skipCommunityVisuals = false) {
  const errors = [], vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push(e.message));
  const dom = new JSDOM(fs.readFileSync(path.join(root, file), 'utf8'), {
    url: `${origin}${file}?${query}`, runScripts: 'dangerously', resources: new AppFiles(skipCommunityVisuals), virtualConsole: vc
  });
  return { w: dom.window, errors };
}
(async () => {
  for (const [dayIndex, day] of days.entries()) {
    const { w, errors } = open('week2-read-aloud.html', `day=${day}&eeaRunner=1`);
    const d = w.document, $ = id => d.getElementById(id), total = dayIndex < 2 ? 1 : 15;
    await until(() => $('bookTitle').textContent, `${day} initializes`);
    assert.equal($('bookTitle').textContent, dayIndex < 2 ? 'I Love Us! A Book About Family' : 'Shhh! The Baby’s Asleep');
    assert.match($('chip').textContent, new RegExp(day.toUpperCase()));
    assert.match($('notesCopy').textContent, /Unit 1 Week 2/);
    assert($('prev').disabled);
    assert($('stop').textContent.trim());
    $('book').click(); assert.equal($('side').style.display, 'none');
    $('book').click(); assert.equal($('side').style.display, 'block');
    for (let repeat = 0; repeat < 2; repeat++) {
      $('notesBtn').click(); assert($('notesPanel').classList.contains('open'));
      $('closeNotes').click(); assert(!$('notesPanel').classList.contains('open'));
    }
    const expectedSource = page => dayIndex < 2 ? `${origin}assets/reading.webp` : `https://docs.google.com/presentation/d/1ysX9sbEW4YiZqVa29m86IddnnYKNqQVIp53QVkr7QpU/export/png?pageid=p${page + 2}`;
    for (let page = 0; page < total; page++) {
      assert.equal($('bookImg').src, expectedSource(page));
      assert.equal($('count').textContent, dayIndex < 2 ? `Read ${dayIndex + 1} of 2` : `Support slide ${page + 1} of 15`);
      assert.equal($('next').textContent, page === total - 1 ? 'Finish Read Aloud ✓' : 'Next →');
      if (page < total - 1) $('next').click();
    }
    const finalSource = $('bookImg').src;
    $('next').click(); assert.equal($('bookImg').src, finalSource, 'Runner owns final handoff');
    for (let page = total - 1; page > 0; page--) { $('prev').click(); assert.equal($('bookImg').src, expectedSource(page - 1)); }
    assert($('prev').disabled); $('prev').click(); assert.equal($('bookImg').src, expectedSource(0));
    assert.deepEqual(errors, []); w.close();
    console.log(`${day}: preserved title/source mapping, all ${total} pages, Previous/Next, guide and repeated notes pass`);
  }
  for (const [dayIndex, day] of days.entries()) {
    const { w, errors } = open('lesson-runner-week2.html', `week=2&day=${dayIndex}&section=1`);
    const frame = w.document.getElementById('frame');
    await until(() => frame.contentDocument.getElementById('prev')?.dataset.boundary === '1', `${day} runner prepared`);
    await delay(100); // Includes the runner's second scheduled sync.
    const d = frame.contentDocument;
    assert.equal(d.getElementById('prev').textContent, '← Community Meeting');
    assert.equal(d.getElementById('prev').dataset.boundary, '1');
    if (dayIndex < 2) assert.equal(d.getElementById('next').dataset.boundary, '1');
    d.getElementById('book').click();
    const firstSource = d.getElementById('bookImg').src;
    d.getElementById('next').click();
    assert.equal(d.getElementById('bookImg').src, firstSource, 'Hidden teaching guide is shown before advancing');
    assert.equal(d.getElementById('side').style.display, 'block');
    for (let i = 0; i < 35; i++) {
      if (frame.contentWindow.location.pathname.endsWith('centers-week2.html')) break;
      frame.contentDocument.getElementById('next').click(); await delay(5);
      assert(i < 34, `${day} advances to Centers`);
    }
    await until(() => frame.contentWindow.location.pathname.endsWith('centers-week2.html'), `${day} Centers loaded`);
    assert.equal(new URL(frame.src).searchParams.get('day'), day);
    assert.equal(JSON.parse(w.localStorage.getItem('eea-lesson-resume')).section, 2);
    assert.deepEqual(errors, []); w.close();
    const ending = open('lesson-runner-week2.html', `week=2&day=${dayIndex}&section=1&landing=end`);
    const endingFrame = ending.w.document.getElementById('frame');
    await until(() => endingFrame.contentDocument.getElementById('next')?.dataset.boundary === '1', 'Last-page landing prepared');
    await delay(100);
    const restored = endingFrame.contentDocument;
    assert.equal(restored.getElementById('count').textContent, dayIndex < 2 ? `Read ${dayIndex + 1} of 2` : 'Support slide 15 of 15');
    assert.equal(restored.getElementById('next').dataset.boundary, '1');
    if (dayIndex >= 2) {
      restored.getElementById('prev').click(); await delay(10);
      assert.equal(restored.getElementById('count').textContent, 'Support slide 14 of 15');
      assert.equal(restored.getElementById('next').dataset.boundary, '0');
      restored.getElementById('next').click(); await delay(10);
      assert.equal(restored.getElementById('count').textContent, 'Support slide 15 of 15');
    }
    assert.deepEqual(ending.errors, []); ending.w.close();
    console.log(`${day}: runner reads all pages and hands off to same-day Centers`);
  }
  for (const [dayIndex, day] of days.entries()) {
    const { w, errors } = open('lesson-runner-week2.html', `week=2&day=${dayIndex}&section=1`, true);
    const frame = w.document.getElementById('frame');
    await until(() => frame.contentDocument.getElementById('prev')?.dataset.boundary === '1', `${day} reader ready for return`);
    frame.contentDocument.getElementById('prev').click();
    await until(() => frame.contentDocument.getElementById('badge')?.textContent === 'NAME MOVEMENTS · 2 OF 2', `${day} Community end landing`);
    await delay(120); // Includes visual preparation and its delayed boundary sync.
    let d = frame.contentDocument;
    assert.equal(d.getElementById('next').dataset.boundary, '1', `${day} Community final boundary survives delayed sync`);
    assert.equal(d.getElementById('next').textContent, 'Next: Read Aloud →');
    assert.equal(d.getElementById('prev').dataset.boundary, '0');
    for (let repeat = 0; repeat < 3; repeat++) {
      d.getElementById('teacher').click(); assert(d.getElementById('panel').classList.contains('open'));
      await delay(10);
      d.getElementById('teacher').click(); assert(!d.getElementById('panel').classList.contains('open'));
      await delay(10);
      assert.equal(d.getElementById('next').dataset.boundary, '1');
      d.getElementById('prev').click(); await delay(10);
      assert.equal(d.getElementById('badge').textContent, 'CHILD POSE · 1 OF 2');
      assert.equal(d.getElementById('prev').dataset.boundary, '1');
      assert.equal(d.getElementById('prev').textContent, '← Day Overview');
      assert.equal(d.getElementById('next').dataset.boundary, '0');
      d.getElementById('teacher').click(); await delay(10);
      d.getElementById('teacher').click(); await delay(10);
      assert.equal(d.getElementById('prev').dataset.boundary, '1');
      d.getElementById('next').click(); await delay(10);
      assert.equal(frame.contentDocument, d, 'Internal Next stays in Community');
      assert.equal(d.getElementById('badge').textContent, 'NAME MOVEMENTS · 2 OF 2');
      assert.equal(d.getElementById('prev').textContent, '← Previous');
      assert.equal(d.getElementById('prev').dataset.boundary, '0');
      assert.equal(d.getElementById('next').dataset.boundary, '1');
    }
    // Repeated preparation of one document must not duplicate capture listeners.
    let newClickHandlers = 0;
    const add = d.addEventListener.bind(d);
    d.addEventListener = (type, ...args) => { if (type === 'click') newClickHandlers++; return add(type, ...args); };
    for (let repeat = 0; repeat < 3; repeat++) frame.dispatchEvent(new w.Event('load'));
    await delay(120);
    assert.equal(newClickHandlers, 0, 'A prepared document does not accumulate click handlers');
    for (let repeat = 0; repeat < 2; repeat++) {
      d.getElementById('next').click();
      await until(() => frame.contentDocument.getElementById('bookTitle')?.textContent && frame.contentDocument.getElementById('prev')?.dataset.boundary === '1', `${day} returns to reader once`);
      assert.equal(new URL(frame.src).searchParams.get('day'), day);
      assert.equal(frame.contentWindow.EEASectionState().index, 0);
      assert.equal(JSON.parse(w.localStorage.getItem('eea-lesson-resume')).section, 1);
      assert.equal(JSON.parse(w.localStorage.getItem('eea-lesson-resume')).day, dayIndex);
      frame.contentDocument.getElementById('prev').click();
      await until(() => frame.contentDocument.getElementById('badge')?.textContent === 'NAME MOVEMENTS · 2 OF 2', `${day} repeated Community end landing`);
      await delay(120); d = frame.contentDocument;
      assert.equal(d.getElementById('next').dataset.boundary, '1');
    }
    // Continuing an already completed Community section restarts internally,
    // without activating its enabled Overview boundary during reset.
    w.document.getElementById('continue').click();
    await until(() => frame.contentDocument.getElementById('badge')?.textContent === 'CHILD POSE · 1 OF 2' && frame.contentDocument.getElementById('prev')?.dataset.boundary === '1', `${day} completed Community restart`);
    await delay(120);
    assert.equal(frame.contentWindow.EEASectionState().index, 0);
    assert.equal(frame.contentDocument.getElementById('prev').dataset.boundary, '1');
    assert.deepEqual(errors, []); w.close();
    console.log(`${day}: Community first/final boundaries, internal steps, repeated notes/preparation and reader round trips pass`);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
