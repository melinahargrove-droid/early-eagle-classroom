// Run with jsdom 26.1.0 available on NODE_PATH. No app data or network writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, ResourceLoader, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '../v6-test');
const html = fs.readFileSync(path.join(root, 'week9-sections.html'), 'utf8');
const current = fs.readFileSync(path.join(root, 'week9-sections-v30.js'), 'utf8');
const previous = fs.readFileSync(path.join(root, 'week9-sections-v29.js'), 'utf8');
const origin = 'https://eea.test/v6-test/';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const choose = (w, n) => { const menu = w.document.getElementById('activityMenu'); menu.value = String(n); menu.dispatchEvent(new w.Event('change')); };
function lesson(code, day, view, step = '') {
  const dom = new JSDOM(html, { url: `${origin}week9-sections.html?day=${day}&view=${view}&step=${step}`, runScripts: 'outside-only' });
  dom.window.eval(code);
  return dom.window;
}
function snapshot(w) {
  const d = w.document;
  return { body: d.getElementById('lesson').innerHTML, classes: d.body.className, count: d.getElementById('count').textContent, value: d.getElementById('activityMenu').value };
}
async function until(test, message) {
  for (let i = 0; i < 100; i++) { if (test()) return; await delay(10); }
  assert.fail(message);
}
class AppFiles extends ResourceLoader {
  fetch(url) {
    const file = path.join(root, new URL(url).pathname.replace('/v6-test/', ''));
    return Promise.resolve(fs.readFileSync(file));
  }
}
(async () => {
  // Every existing card and layout remains byte-for-byte equivalent.
  let cards = 0;
  for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
    for (const view of ['community', 'centers', 'writing', 'building', 'math', 'foundational']) {
      if (view === 'writing' && ['Monday', 'Wednesday'].includes(day)) continue;
      const old = lesson(previous, day, view), next = lesson(current, day, view);
      if (!old.EEASectionState) { assert.equal(next.EEASectionState, undefined); old.close(); next.close(); continue; }
      assert.equal(old.EEASectionState().total, next.EEASectionState().total);
      for (let n = 0; n < old.EEASectionState().total; n++) {
        choose(old, n); choose(next, n);
        assert.deepEqual(snapshot(next), snapshot(old), `${day}/${view}/${n} unchanged`);
        assert.equal(new URL(next.location.href).searchParams.get('step'), String(n));
        cards++;
      }
      old.close(); next.close();
    }
  }
  console.log(`${cards} existing section renders, layouts and lesson counts unchanged`);
  for (const [view, n] of [['writing', 7], ['centers', 4], ['writing', 3], ['centers', 8]]) {
    const w = lesson(current, 'Thursday', view, n);
    assert.equal(w.EEASectionState().index, n);
    assert.equal(w.document.getElementById('activityMenu').value, String(n));
    const historyLength = w.history.length;
    w.document.getElementById('prev').click();
    assert.equal(w.EEASectionState().index, n - 1);
    assert.equal(w.history.length, historyLength, 'Internal steps do not add history entries');
    w.document.getElementById('done').click();
    assert.equal(w.EEASectionState().index, n);
    w.dispatchEvent(new w.Event('pageshow'));
    w.document.getElementById('activityMenu').value = '0'; // Browser restores stale form value after pageshow.
    await delay(5);
    assert.equal(w.document.getElementById('activityMenu').value, String(n));
    w.close();
  }
  for (const [step, expected] of [['-1', 0], ['2.5', 0], ['NaN', 0], ['Infinity', 0], ['999', 7]]) {
    const w = lesson(current, 'Thursday', 'writing', step);
    assert.equal(w.EEASectionState().index, expected); w.close();
  }
  console.log('Step restoration, deferred form normalization, internal history and invalid-step checks pass');
  const errors = [];
  const vc = new VirtualConsole(); vc.on('jsdomError', e => errors.push(e.message));
  const runner = new JSDOM(fs.readFileSync(path.join(root, 'lesson-runner-week9.html'), 'utf8'), {
    url: `${origin}lesson-runner-week9.html?week=9&day=3&section=3&step=7`,
    runScripts: 'dangerously', resources: new AppFiles(), virtualConsole: vc
  });
  const w = runner.window, frame = w.document.getElementById('frame');
  await until(() => frame.contentDocument.getElementById('done')?.textContent === 'Next: Centers →', 'Writing boundary prepared');
  const writingURL = frame.contentWindow.location.href;
  frame.contentDocument.getElementById('done').click();
  await until(() => frame.contentDocument.getElementById('prev')?.textContent === '← Writing', 'Centers boundary prepared');
  choose(frame.contentWindow, 4);
  const centersURL = frame.contentWindow.location.href;
  // JSDOM does not implement session-history traversal. Reconstruct each saved
  // iframe URL; real Back/Forward and native dialogs are tested in Chromium.
  for (let i = 0; i < 3; i++) {
    frame.src = writingURL;
    await until(() => frame.contentDocument.getElementById('done')?.textContent === 'Next: Centers →', 'Writing restored');
    assert.equal(frame.contentWindow.EEASectionState().index, 7);
    assert.equal(frame.contentDocument.getElementById('prev').textContent, '← Previous');
    assert.equal(new URL(w.location.href).searchParams.get('section'), '3');
    assert.equal(new URL(w.location.href).searchParams.get('step'), '7');
    assert.equal(JSON.parse(w.localStorage.getItem('eea-lesson-resume')).section, 3);
    frame.src = centersURL;
    await until(() => new URL(w.location.href).searchParams.get('section') === '4', 'Centers restored');
    assert.equal(frame.contentWindow.EEASectionState().index, 4);
    assert.equal(frame.contentDocument.getElementById('activityMenu').value, '4');
    assert.equal(JSON.parse(w.localStorage.getItem('eea-lesson-resume')).section, 4);
  }
  // Repeated prepare/pageshow must not accumulate boundary-click handlers.
  for (let i = 0; i < 4; i++) w.dispatchEvent(new w.Event('pageshow'));
  await delay(10);
  choose(frame.contentWindow, 12);
  frame.contentDocument.getElementById('done').click();
  await until(() => new URL(w.location.href).searchParams.get('section') === '6', 'Only one Centers to Math handoff');
  assert.equal(frame.contentDocument.getElementById('count').textContent, '1 of 8');
  assert.equal(new URL(w.location.href).searchParams.get('step'), '0');
  assert.deepEqual(errors, []);
  w.close();
  console.log('Runner restoration, outer route, saved section and idempotent event binding pass');
})().catch(error => { console.error(error); process.exitCode = 1; });
