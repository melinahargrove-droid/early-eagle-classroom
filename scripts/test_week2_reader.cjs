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
  fetch(url) {
    if (!url.startsWith(origin)) return null;
    return Promise.resolve(fs.readFileSync(path.join(root, new URL(url).pathname.slice('/v6-test/'.length))));
  }
}
function open(file, query) {
  const errors = [], vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push(e.message));
  const dom = new JSDOM(fs.readFileSync(path.join(root, file), 'utf8'), {
    url: `${origin}${file}?${query}`, runScripts: 'dangerously', resources: new AppFiles(), virtualConsole: vc
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
})().catch(error => { console.error(error); process.exitCode = 1; });
