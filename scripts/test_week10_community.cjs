// Focused Unit 2 Week 2 DOM/integrity regression. Requires jsdom 26.1.0.
// Real navigation/history is covered by test_week10_community_browser.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { JSDOM, ResourceLoader, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '../v6-test');
const origin = 'https://eea.test/v6-test/';
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const titles = ['Squat or Pyramid Pose', 'Heart Breathing'];
const assets = 'assets/focus-3s/unit-2/week-2/community/';
const imageNames = ['squat-pyramid-pose.jpg', 'heart-breathing.jpg'];
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const localDate = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check, label) {
  for (let i=0; i<150; i++) { if (check()) return; await delay(10); }
  assert.fail(label);
}
class AppFiles extends ResourceLoader {
  fetch(url) {
    if (!url.startsWith(origin)) return null;
    return Promise.resolve(fs.readFileSync(path.join(root, new URL(url).pathname.slice('/v6-test/'.length))));
  }
}
function open(file, query = '', storage = {}) {
  const errors = [], vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(fs.readFileSync(path.join(root, file), 'utf8'), {
    url: `${origin}${file}?${query}`, runScripts: 'dangerously', resources: new AppFiles(), virtualConsole: vc,
    beforeParse(w) { for (const [key, value] of Object.entries(storage)) w.localStorage.setItem(key, value); }
  });
  return { w: dom.window, errors };
}
async function runnerReady(w, label) {
  const frame=w.document.getElementById('frame');
  // Resume is saved synchronously before the child fetch starts. Wait for both
  // documents and the real section API, so teardown never aborts an in-flight
  // ResourceLoader promise and late child-script errors remain observable.
  await until(()=>w.document.readyState==='complete' &&
    frame.contentDocument?.readyState==='complete' &&
    typeof frame.contentWindow.EEASectionState==='function', label);
  return frame;
}
function jpegSize(bytes) {
  assert.equal(bytes.readUInt16BE(0), 0xffd8);
  let offset = 2;
  while (offset < bytes.length) {
    assert.equal(bytes[offset++], 0xff);
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++], length = bytes.readUInt16BE(offset);
    if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
      return [bytes.readUInt16BE(offset+5), bytes.readUInt16BE(offset+3)];
    }
    offset += length;
  }
  assert.fail('JPEG has a frame header');
}
function verifyContent(w, day) {
  const d=w.document, notes=d.querySelector('.community-notes');
  assert.equal(d.querySelectorAll('.community-card').length, 1);
  assert.equal(d.querySelector('h2').textContent, titles[day%2]);
  assert.equal(d.getElementById('sub').textContent, `${days[day]} · Mindful practice`);
  assert.equal(d.querySelector('.lesson-img').getAttribute('src'), assets+imageNames[day%2]);
  assert.match(d.querySelector('.lesson-img').alt, /^Original /);
  assert.equal(d.querySelectorAll('select, #activityMenu, #count').length, 0, 'No activity selector or internal-page counter');
  assert.deepEqual(JSON.parse(JSON.stringify(w.EEASectionState())), {index:0,total:1,atStart:true,atEnd:true});
  assert.equal(d.querySelectorAll('.teaching-steps li').length, 3, 'Directions are simultaneous content, not separate cards');
  assert.equal(notes.open, false);
  assert.match(notes.textContent, /teacher-approved companion schedule; the original weekly plan says to choose/);
  for (const text of ['Monday, Wednesday and Friday', 'Tuesday and Thursday', 'Teacher reflection notes',
    'SEL4. Self-Management.', 'SEL8. Self-Management.', 'SEL9. Relationship Skills.',
    'Boston Public Schools Department of Early Childhood P-2', 'without cropping or redrawing']) {
    assert(notes.textContent.includes(text), `Preserved source note: ${text}`);
  }
  assert.equal(notes.querySelectorAll('h3+ul')[0].children.length, 7, 'All seven reflection prompts are preserved');
  assert.deepEqual([...notes.querySelectorAll('a')].map(a=>a.getAttribute('href')), [
    'https://drive.google.com/file/d/1zcmiPV6midMNPtYjg1_IKx7lAKPPu0i9/view',
    'https://drive.google.com/file/d/1OmZsge2fDLnNNjeswoyp7X6qW1Rysqp6/view',
    'https://docs.google.com/document/d/1lYe4_XN0sIUJeeEt2kbxzxtzqkteNSX9woHXpfXlb7Y/edit'
  ]);
  for (const a of notes.querySelectorAll('a')) { assert.equal(a.target, '_blank'); assert(a.rel.includes('noopener')); }
  if (day%2) {
    assert.match(notes.textContent, /Repeat the sequence 4-5 times/);
    assert.match(notes.textContent, /From Life is Good Playmaker Project\. Visuals: Photos of Unicia Young taken by Marina Boni\./);
  } else assert.match(notes.textContent, /Children can also do this sitting in a chair/);
  const oldURL=w.location.href, oldHistory=w.history.length;
  for (let repeat=0; repeat<3; repeat++) {
    notes.querySelector('summary').click(); assert.equal(notes.open, true);
    notes.querySelector('summary').click(); assert.equal(notes.open, false);
  }
  assert.equal(w.location.href, oldURL); assert.equal(w.history.length, oldHistory);
  assert.equal(d.getElementById('prev').textContent, '← Day Overview');
  assert.equal(d.getElementById('done').textContent, 'Next: Read Aloud →');
  assert.equal(d.getElementById('exit').getAttribute('aria-label'), 'Return to Day Overview');
  assert(!/Finish Today/.test(d.body.textContent));
}
(async () => {
  // JPEG hashes pin full-page derivatives of the verified linked original.
  // The complete source PDF is retained via Drive, not bundled/offline.
  const provenance=fs.readFileSync(path.join(root,assets,'SOURCE.md'),'utf8');
  assert.match(provenance,/73725f1072881da0dd83eb8f1a4911d9aa42d2dbebb813245e046dd2fdca77f5/);
  assert.match(provenance,/PDF is not bundled/);
  for (const [name, expected] of Object.entries({
    'squat-pyramid-pose.jpg':'45b31e77ae184fca0fb607075afae7fa928a2d8a4998acbfcb604469f3aafae8',
    'heart-breathing.jpg':'24d2177a93176b8a24108db1056e6f50f94dece4ee85474c47a1004e60a9d6b0'
  })) {
    const bytes=fs.readFileSync(path.join(root, assets, name));
    assert.equal(hash(bytes), expected, `${name}: preserved source or approved original-page derivative`);
    if (name.endsWith('.jpg')) assert.deepEqual(jpegSize(bytes), [1855,2400], 'Full portrait page dimensions');
    else assert.equal(bytes.subarray(0,5).toString(), '%PDF-');
  }
  console.log('Verified original PDF provenance and both full-page JPEG derivative hashes/dimensions pass');
  for (let day=0; day<5; day++) {
    const {w,errors}=open('lesson-runner-week10.html', `week=10&day=${day}&section=0`);
    const frame=await runnerReady(w, `${days[day]} ready`);
    verifyContent(frame.contentWindow, day);
    for (let repeat=0; repeat<3; repeat++) w.dispatchEvent(new w.Event('pageshow'));
    assert.equal(w.document.querySelectorAll('iframe').length,1);
    assert.equal(frame.contentDocument.querySelectorAll('iframe').length,0);
    assert.deepEqual(JSON.parse(w.localStorage.getItem('eea-lesson-resume')), {date:localDate(),week:10,day,section:0});
    assert.equal(w.localStorage.getItem('eea-daily-week'),'10');
    assert.equal(w.localStorage.getItem('eea-daily-day'),String(day));
    assert.equal(new URL(frame.src).searchParams.get('day'),days[day]);
    assert.deepEqual(errors,[]); w.close();
  }
  console.log('All five assigned practices, directions, notes, source links and runner resume state pass');
  const oldSnapshots=[];
  for (let week=1; week<=10; week++) for (let day=0; day<5; day++) {
    const {w,errors}=open('daily-lessons.html', `week=${week}&day=${day}`), d=w.document;
    if (week<10) oldSnapshots.push({week,day,eyebrow:d.getElementById('eyebrow').textContent,title:d.getElementById('title').textContent,
      path:d.getElementById('path').outerHTML,note:d.getElementById('note').textContent,start:d.getElementById('start').textContent,
      weekButtons:[...d.querySelectorAll('#weeknav button')].slice(0,9).map(b=>[b.textContent,b.className])});
    else {
      assert.equal(d.querySelectorAll('#path .step').length,3);
      if(day<=4){assert.equal(d.querySelectorAll('#path .step b')[2].textContent,'Centers');assert.equal(d.querySelectorAll('#path .step')[2].dataset.section,'2');}
      assert.equal(d.querySelectorAll('#path .step b')[1].textContent,'Read Aloud');
      assert.equal(d.querySelector('#path .step b').textContent,'Community Meeting');
      assert.equal(d.querySelector('#path .step span').textContent,titles[day%2]);
      assert.equal(d.getElementById('eyebrow').textContent,`UNIT 2 · WEEK 2 · ${days[day].toUpperCase()}`);
      assert.equal(d.getElementById('start').textContent,'Open Community Meeting →');
      assert.match(d.getElementById('note').textContent,/Read Aloud/);
      assert(d.getElementById('path').classList.contains('unit2-week2'));
      assert.equal(d.querySelector('#path .step').getAttribute('tabindex'),'0');
    }
    assert.equal(d.querySelectorAll('#weeknav button').length,11);
    assert.equal(d.querySelector('[data-week="10"]').textContent,'U2 · W2');
    assert.deepEqual(errors,[]);w.close();
  }
  // Derived from all 45 rendered overview snapshots in the preceding commit.
  assert.equal(hash(JSON.stringify(oldSnapshots)),'e487fefd01f566a72bd7d4310459815b3576c163507e8de734525827800ab8d7',
    'Weeks 1–9 cards, descriptions, labels, layout classes and start/notice text are unchanged');
  console.log('All 50 overviews pass; prior 45 week/day card sets and labels are unchanged');
  for (const [query,storage,expected] of [
    ['',{'eea-curriculum-pace':JSON.stringify({startDate:'2020-01-06',mode:'calendar'})},9],
    ['week=10',{'eea-curriculum-pace':JSON.stringify({startDate:'2020-01-06',mode:'calendar'})},10],
    ['',{'eea-daily-week':'10'},10],
    ['week=NaN',{'eea-daily-week':'12'},1], ['week=12',{},1], ['week=-1',{},1], ['week=2.5',{},1]
  ]) {
    const {w,errors}=open('daily-lessons.html',query,storage);
    assert.equal(w.document.querySelector('#weeknav .active').dataset.week,String(expected));
    assert.deepEqual(errors,[]);w.close();
  }
  for (const raw of ['-1','5','2.5','NaN','Infinity','Monday']) {
    const {w,errors}=open('lesson-runner-week10.html',`week=9&day=${raw}&section=999&step=7`);
    const day=Math.max(0,Math.min(4,new Date().getDay()-1));
    await runnerReady(w,'Invalid runner route normalizes and child finishes loading');
    const p=new URL(w.location.href).searchParams;
    assert.equal(p.get('week'),'10'); assert.equal(p.get('day'),String(day)); assert.equal(p.get('section'),'0');
    assert.equal(p.has('step'),false); assert.deepEqual(errors,[]);w.close();
  }
  for (const section of ['-1','999','2.5','NaN','Infinity']) {
    const {w,errors}=open('lesson-runner-week10.html',`day=3&section=${section}&step=999`);
    await runnerReady(w,'Unavailable section normalizes and child finishes loading');
    assert.equal(new URL(w.location.href).searchParams.get('section'),'0');
    assert.equal(new URL(w.document.getElementById('frame').src).searchParams.get('day'),'Thursday');
    assert.deepEqual(errors,[]);w.close();
  }
  for (const date of [localDate(),'2000-01-01']) {
    const resume=JSON.stringify({date,week:10,day:3,section:0});
    const {w,errors}=open('daily-lessons.html','week=10&day=3',{'eea-lesson-resume':resume});
    assert.equal(w.localStorage.getItem('eea-lesson-resume'),resume,'Week9 migration must not mutate Week10 resume');
    assert.equal(w.document.getElementById('start').textContent,'Open Community Meeting →');
    assert.deepEqual(errors,[]);w.close();
  }
  console.log('Manual week10, automatic pacing cap9, invalid route normalization and dated resume isolation pass');
})().catch(error=>{console.error(error);process.exitCode=1;});
