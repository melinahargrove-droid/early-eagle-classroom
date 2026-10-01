// Run with jsdom 26.1.0 on NODE_PATH. The three source hashes pin every
// pre-existing lesson field after normalizing only the approved math image changes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { JSDOM, ResourceLoader, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '../v6-test');
const origin = 'https://eea.test/v6-test/';
const hashes = {
  3: 'c4a7c334e78120a062b73274683c8441207551fc1bbeb2b23ac4025056f0c928',
  4: 'd0755e6d4576f96f96d34087cd858314340ab59260c6b13d723f1bfd2ef6cb42',
  5: '8de7e85358fa7ceade634ce60b03faa4e666dfc78adb7dc4d9bb6bc3fe057b3e'
};
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
// Keep original curriculum hashes: only these exact image changes are allowed.
function verifyMathImagesAndNormalize(week, all) {
  const original = JSON.parse(JSON.stringify(all));
  if (week === 4) {
    const base = 'assets/focus-3s/unit-1/week-4/centers/math/';
    const lesson = original.Monday[1], revisit = original.Thursday[0];
    assert.equal(lesson.title, 'Cubes With Friends');
    assert.equal(revisit.title, 'Revisit Cubes With Friends');
    assert.equal(lesson.img, base + 'cubes-build-with-friend.webp');
    assert.equal(lesson.steps[1].img, base + 'cubes-meet-cube.webp');
    assert.equal(lesson.steps[2].img, base + 'cubes-stack-three.webp');
    assert.equal(revisit.img, base + 'cubes-build-with-friend.webp');
    lesson.img = revisit.img = 'assets/math.webp';
    delete lesson.steps[1].img; delete lesson.steps[2].img;
  }
  if (week === 5) {
    const base = 'assets/focus-3s/unit-1/week-5/centers/math/';
    const lesson = original.Monday[0], revisit = original.Thursday[0];
    assert.equal(lesson.title, 'Making Groups');
    assert.equal(revisit.title, 'Revisit Making Groups');
    assert.equal(lesson.img, base + 'groups-two-friends.webp');
    assert.equal(lesson.steps[0].img, base + 'groups-cooking-pan-collection.webp');
    assert.equal(revisit.img, base + 'groups-two-or-three-friends.webp');
    lesson.img = revisit.img = 'assets/math.webp';
    delete lesson.steps[0].img;
  }
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
  assert(fs.existsSync(path.join(root, step?.img || item.img)), 'Every Centers image exists, including all nine repaired Math screens');
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
  for (const week of [3,4,5]) {
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
  const end = open('lesson-runner-week3.html','week=3&day=1&section=2&landing=end');
  const f = end.w.document.getElementById('frame');
  await until(() => f.contentDocument.getElementById('doneBtn')?.textContent==='Next: Thinking & Feedback →','Week 3 end landing');
  assert.equal(f.contentWindow.EEASectionState().index,8);assert.deepEqual(end.errors,[]);end.w.close();
  console.log(`All ${checked} preserved Centers teaching pages pass; Week 3 final-page landing passes; all nine Math screens have approved existing image assets`);
})().catch(error => { console.error(error); process.exitCode=1; });
