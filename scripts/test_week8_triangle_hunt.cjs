// Run with jsdom 26.1.0 on NODE_PATH. Pins every Week 8 curriculum field,
// normalizing only the reused Thursday Triangle Hunt image.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { JSDOM, ResourceLoader, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '../v6-test');
const origin = 'https://eea.test/v6-test/';
const hashes = {8: 'e8895de099795e54ffe58075b964031e7668cac4ddd5767d02b824b6b5a4a100'};
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
function data(week) {
  const html = fs.readFileSync(path.join(root, `week${week}-intro-centers.html`), 'utf8');
  return vm.runInNewContext('(' + html.split('const all=')[1].split(';const $=')[0] + ')');
}
// Reuse exactly the established Tuesday classroom hunt visual.
function verifyMathImagesAndNormalize(week, all) {
  const original = JSON.parse(JSON.stringify(all));
  const revisit = original.Thursday[1], intro = original.Tuesday[0];
  assert.equal(revisit.title, 'Revisit Triangle Hunt');
  assert.equal(intro.steps[2].title, 'Go on a Triangle Hunt');
  assert.equal(revisit.img, intro.steps[2].img, 'Triangle Hunt revisit reuses its established hunt picture');
  assert.equal(revisit.img, 'assets/focus-3s/unit-1/week-8/centers/triangle-hunt.png');
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, revisit.img))).digest('hex'),
    '5cf6625ea591405c3f3b66dd9abe5dea04676bdb8b98135026c05d0eb5c4cc3f', 'Original artwork is unchanged');
  revisit.img = 'assets/math.webp';
  return original;
}
function pages(items) { return items.flatMap(item => (item.steps || [null]).map(step => ({item, step}))); }
function verify(d, page, week, day, index, total) {
  const $ = id => d.getElementById(id), {item, step} = page;
  assert.equal($('title').textContent, step?.title || item.title);
  assert.equal($('sub').textContent, item.sub);
  assert.equal($('prompt').textContent, step?.prompt || item.prompt);
  assert.equal($('cue').textContent, step?.cue || item.cue);
  assert.equal($('pic').getAttribute('src'), step?.img || item.img);
  assert(fs.existsSync(path.join(root, step?.img || item.img)), 'Every Centers image exists, including the restored Triangle Hunt revisit');
  assert.equal($('noteTitle').textContent, step?.title || item.title);
  assert.equal($('notes').textContent, (step?.script || '') + (item.teacherNote ? '\n\n' + item.teacherNote : '') || (item.revisit ? 'This is a Weekly Plan revisit, not a separate Focus on 3s lesson. Use Review Original Introduction if the group needs the full teaching sequence.' : ''));
  assert.equal($('materials').textContent, item.materials);
  assert.equal($('vocab').textContent, item.vocab);
  assert.equal($('week').textContent, `FOCUS ON 3s · WEEK ${week} · ${day.toUpperCase()}`);
  assert.equal($('review').style.display, item.revisit ? 'inline-block' : 'none');
  assert.deepEqual(JSON.parse(JSON.stringify(d.defaultView.EEASectionState())), {index,total,atStart:index===0,atEnd:index===total-1});
}
(async () => {
  let checked = 0;
  for (const week of [8]) {
    const all = data(week);
    assert.equal(crypto.createHash('sha256').update(JSON.stringify(verifyMathImagesAndNormalize(week, all))).digest('hex'), hashes[week], `Week ${week}: every curriculum field preserved`);
    for (const [dayIndex, [day, items]] of Object.entries(all).entries()) {
      const expected = pages(items);
      const {w, errors} = open(`lesson-runner-week${week}.html`, `week=${week}&day=${dayIndex}&section=2`);
      const frame = w.document.getElementById('frame');
      await until(() => frame.contentWindow.EEASectionState, `${week} ${day} initializes`);
      await delay(120); // Includes initial, delayed and visual synchronization.
      const d = frame.contentDocument;
      for (const [index, page] of expected.entries()) {
        await delay(5);
        verify(d, page, week, day, index, expected.length);
        for (let repeat=0; repeat<2; repeat++) {
          d.getElementById('teacherBtn').click(); assert(d.getElementById('panel').classList.contains('open'));
          d.getElementById('close').click(); assert(!d.getElementById('panel').classList.contains('open'));
        }
        // Repeated resynchronization must never turn an internal step into a boundary.
        frame.contentWindow.dispatchEvent(new frame.contentWindow.Event('eea-section-state'));
        frame.contentWindow.dispatchEvent(new frame.contentWindow.Event('eea-section-state'));
        await delay(10);
        if (index===expected.length-1) assert.equal(d.getElementById('doneBtn').textContent, 'Next: Thinking & Feedback →');
        else assert.match(d.getElementById('doneBtn').textContent, /^Next (Step|Center) →$/);
        d.getElementById('doneBtn').click();
        if (index<expected.length-1) {
          assert.equal(frame.contentDocument,d,'Internal step must stay in Centers');
          assert(!w.localStorage.getItem('eea-lesson-resume'),'No early section handoff');
          assert(!d.getElementById('panel').classList.contains('open'));
        }
        checked++;
      }
      await until(() => frame.contentWindow.location.pathname.endsWith(`thinking-feedback-week${week}.html`), `${week} ${day} final handoff`);
      assert.equal(new URL(frame.src).searchParams.get('day'), day);
      const resume=JSON.parse(w.localStorage.getItem('eea-lesson-resume'));
      assert.equal(resume.section,3); assert.equal(resume.week,week); assert.equal(resume.day,dayIndex);
      assert.deepEqual(errors,[]);w.close();
      console.log(`Week ${week} ${day}: all ${expected.length} preserved pages, approved image paths, notes, repeated synchronization and final same-day handoff pass`);
    }
  }
  // Rapid Next clicks must consult live step state before delayed sync runs.
  for (const [dayIndex, [day, items]] of Object.entries(data(8)).entries()) {
    const {w, errors} = open('lesson-runner-week8.html', `week=8&day=${dayIndex}&section=2`);
    const frame = w.document.getElementById('frame');
    await until(() => frame.contentWindow.EEASectionState, `${day} rapid-click initializes`);
    await delay(120);
    const d = frame.contentDocument, total = pages(items).length;
    for (let index=1; index<total; index++) {
      d.getElementById('doneBtn').click();
      assert.equal(frame.contentDocument, d);
      assert.equal(frame.contentWindow.EEASectionState().index, index);
      assert(!w.localStorage.getItem('eea-lesson-resume'), 'No premature handoff on rapid internal clicks');
    }
    // Let JSDOM finish pending visual promises before destroying its iframe.
    // A stale boundary still must not suppress the final live-state handoff.
    await delay(20);
    d.getElementById('doneBtn').dataset.eeaBoundary = '';
    d.getElementById('doneBtn').click();
    await until(() => frame.contentWindow.location.pathname.endsWith('thinking-feedback-week8.html'), `${day} rapid final handoff`);
    assert.equal(new URL(frame.src).searchParams.get('day'), day);
    assert.deepEqual(errors, []); w.close();
  }
  console.log(`All ${checked} preserved Week 8 Centers pages pass, including the restored Triangle Hunt image and final same-day handoffs`);
})().catch(error => { console.error(error); process.exitCode=1; });
