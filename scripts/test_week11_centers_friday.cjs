// Friday Unit 2 Week 3 Centers: independent source, asset and JSDOM regressions.
// Native joint-session history, focus, image loading and clipping are covered by
// test_week11_centers_friday_browser.cjs; no production code is rewritten here.
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
const plan = JSON.parse(read('week11-centers-friday-plan.json'));
// Independent source and visual expectations are frozen from the approved Mon/Wed introductions.
const originalDays = ['monday', 'wednesday'];
const originals = originalDays.map(day => JSON.parse(read('week11-centers-' + day + '-plan.json'))[1]);
const lessonPlanURL = 'https://docs.google.com/document/d/135vSqhP-fhVwzw67338NH4NQ2569uj8S3vVbWURFRLY/edit';
const sourceURLs = ['https://drive.google.com/file/d/1tMtBIitGB6u1LnyFIHPTsnTues3bVGSj/view', 'https://drive.google.com/file/d/1ACQ8V6kqjXq9TtqdGTeyBssC0K1ORLoE/view'];
const assets = [
 ['assets/focus-3s/unit-2/week-2/strictly-no-elephants/slide-14.jpg', '15b818d24852cf2bbd47272969f8385d6d45b1221bfe94dbff02e66493af61e4'],
 ['assets/focus-3s/unit-2/week-1/wednesday/reflect-on-acting.jpg', '8a98e4e7485e8f759ae3ab8dd274fbacf78f12029c06bc8f752760f5f159d52d'],
 ['assets/focus-3s/unit-2/week-2/strictly-no-elephants/slide-16.jpg', '90ab7c989146f387e8635cda68122c902fc1d73df499247684ce17f47852053d']
];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check, label) { for (let i = 0; i < 250; i++) { if (check()) return; await delay(10); } assert.fail(label); }
class Files extends ResourceLoader {
  fetch(url) { return url.startsWith(origin) ? Promise.resolve(fs.readFileSync(path.join(root, decodeURIComponent(new URL(url).pathname.slice('/v6-test/'.length))))) : null; }
}
function open(file = 'week11-centers.html', query = 'week=11&day=Friday&section=1&step=0') {
  const errors = [], navigations = [], vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error.message));
  const w = new JSDOM(read(file), {url: origin + file + '?' + query, runScripts: 'dangerously', resources: new Files(), virtualConsole: vc, beforeParse(w) {
    implForWrapper(w.location)._locationObjectNavigate = url => navigations.push(serializeURL(url));
    // Invalid or missing day must stay unavailable even on a Friday.
    const NativeDate = w.Date;
    w.Date = class extends NativeDate { constructor(...args) { super(...(args.length ? args : ['2026-10-09T12:00:00Z'])); } static now() { return new NativeDate('2026-10-09T12:00:00Z').getTime(); } };
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
function destination(a, file, day = 4, section) {
  assert.equal(a.navigations.length, 1, 'Exactly one top-level exit');
  const url = new URL(a.navigations[0]);
  assert.equal(url.pathname, '/v6-test/' + file); assert.equal(url.searchParams.get('week'), '11'); assert.equal(url.searchParams.get('day'), String(day));
  if (section !== undefined) assert.equal(url.searchParams.get('section'), String(section));
}
function route(a, step, review = false, dayIndex = 4) {
  const windows = [[a.w, a.embedded ? String(dayIndex) : days[dayIndex]]];
  if (a.embedded) windows.push([a.w.document.getElementById('frame').contentWindow, days[dayIndex]]);
  for (const [w, day] of windows) {
    const p = new URL(w.location.href).searchParams;
    assert.equal(p.get('week'), '11'); assert.equal(p.get('day'), day); assert.equal(p.get('section'), '1'); assert.equal(p.get('step'), String(step));
    assert.equal(p.get('review'), review ? '1' : null, 'Review state is canonical in parent and child');
    for (const field of ['book', 'stop', 'center']) assert(!p.has(field), 'Unrelated route parameter removed: ' + field);
  }
}
function verify(w, step, review = false, expectedPlan = plan, dayIndex = 4) {
  const d = w.document, p = expectedPlan[step], notes = d.querySelector('.community-notes');
  assert.deepEqual(copy(w.EEACentersPlan), expectedPlan, 'JSON and live runtime plans match exactly');
  assert.deepEqual(copy(w.EEASectionState()), {step, index: step, total: 2, atStart: step === 0, atEnd: step === 1, ...(dayIndex === 4 ? {review} : {})});
  assert.equal(d.querySelectorAll('.community-card').length, 1, 'Exactly one introduction visible');
  assert.equal(d.querySelectorAll('iframe,select,#activityMenu').length, 0, 'No nested presentation or activity selector');
  assert.equal(d.querySelector('.community-copy h2').textContent, (review ? p.originalTitle : p.title));
  assert.equal(d.querySelector('.lead').textContent, (review ? p.originalLead : p.lead));
  assert.equal(d.querySelector('.lesson-img').getAttribute('src'), p.img); assert.equal(d.querySelector('.lesson-img').alt, p.alt);
  assert.match(d.getElementById('count').textContent, new RegExp(`${step + 1}\\s*(?:of|/)\\s*2`));
  assert.equal(d.getElementById('sub').textContent, days[dayIndex] + ' · ' + p.center + (dayIndex === 4 ? ' · ' + (review ? 'Original introduction' : 'Revisit') : ''));
  assert.equal(notes.querySelector('summary').textContent, 'Teacher Notes');
  assert.equal(d.getElementById('prev').textContent, step === 0 ? (dayIndex >= 2 ? '← Day Overview' : '← Read Aloud') : '← Previous');
  assert.equal(d.getElementById('done').textContent, step === 1 ? 'Finish Centers →' : dayIndex === 4 ? 'Next: Exploring Emotions →' : dayIndex === 3 ? 'Next: Color Party Invitations →' : dayIndex === 2 ? 'Next: Exploring Emotions →' : dayIndex === 1 ? 'Next: Color Walk →' : 'Next: All Are Welcome Clubhouse →');
  assert.equal(notes.open, false, 'Teacher Notes initially collapsed');
  assert.equal(d.querySelectorAll('#review-original').length, dayIndex === 4 ? 1 : 0);
  if (dayIndex === 4) {assert.equal(d.getElementById('review-original').textContent, review ? 'Return to revisit' : 'Review original introduction');assert.equal(d.getElementById('count').textContent, (review ? 'Review · ' : '') + (step + 1) + ' of 2');}
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
 const worker = read('sw.js');
 assert.match(worker, /const CACHE='eea-companion-v101'/);
 const scripts = ['week11-centers-monday-plan-v1.js','week11-centers-tuesday-plan-v1.js','week11-centers-wednesday-plan-v1.js','week11-centers-thursday-plan-v1.js','week11-centers-friday-plan-v1.js','week11-centers-v5.js'];
 for (const file of [...scripts, 'week11-centers-friday-plan.json']) assert(worker.includes("'./" + file + "'"), 'Worker caches new runtime and every plan: ' + file);
 assert.deepEqual([...read('week11-centers.html').matchAll(/<script src="([^"]+)"/g)].map(m => m[1]), scripts);
 assert.equal(plan.length, 2, 'Friday is exactly two ordered revisit cards');
 assert.deepEqual(plan.map(p => p.title), ['Revisit All Are Welcome Clubhouse','Revisit Exploring Emotions']);
 assert.deepEqual(plan.map(p => p.center), ['Dramatic Play','Library and Listening']);
 assert.deepEqual(plan.map(p => p.source), sourceURLs);
 assert.deepEqual(plan.map(p => p.img), assets.slice(0,2).map(a => a[0]));
 const pinned = {
  'week11-centers-monday-plan.json':'f02a50557f295a3b0e0a18c087ccb90386e06e8c9a6bb7cbffaba2ee3021d565',
  'week11-centers-monday-plan-v1.js':'0576b8136877911c9bf1797e0c6bfd4006f5db85c80ed9100a20c7e284438edc',
  'week11-centers-tuesday-plan.json':'636daad22071e50b9d56aa2c9abd971d86dca426b369b398959fafd7bfe480e6',
  'week11-centers-tuesday-plan-v1.js':'fb0cbe6f6c849ea2f8e9ece3e4f332c25fa15690de76046041882bc9ff98049a',
  'week11-centers-wednesday-plan.json':'6dea699de003847796e6cd640f580cdf9359c986007d03d0949bab1a7915874f',
  'week11-centers-wednesday-plan-v1.js':'a11d356a369e03b743682a44c2a839ed18315b7e1d11453fd9edae355564fd41',
  'week11-centers-thursday-plan.json':'9115f38e431b129951fd53054874952fa7712bd010a397d5501b0b6d0e903c4b',
  'week11-centers-thursday-plan-v1.js':'57c15a1592364c5dfad6bdd1a84af38a971f52d09a8b20b068291dc92f2ad900',
  'week11-centers-v4.js':'d1b2ef636a3a6acc0cdb80abbd593e12283c7a51a01abe0ac6be3414f2760793'
 };
 for (const [file,digest] of Object.entries(pinned)) assert.equal(hash(read(file)),digest,'Preserved deployed payload: ' + file);
 const context = {window:{}};vm.runInNewContext(read('week11-centers-friday-plan-v1.js'),context);
 assert.deepEqual(copy(context.window.EEAWeek11FridayCentersPlan),plan,'Executable and JSON Friday plans match exactly');
 for (const [asset,digest] of assets) assert.equal(hash(fs.readFileSync(path.join(root,asset))),digest,'Original/supplemental visual unchanged: ' + asset);
 plan.forEach((p,i) => {
  const original = originals[i];
  assert.equal(p.originalTitle,original.title);assert.equal(p.originalLead,original.lead);
  for (const field of ['center','img','alt','source','notes','sources']) assert.deepEqual(p[field],original[field],'Exact original ' + field + ' including labels, order and punctuation: ' + i);
  assert(!p.steps,'Review is an optional same-step mode, never another mandatory page');
  assert(p.lead.length < p.originalLead.length + 20 && p.lead.length < 110,'Brief child-facing revisit prompt');
  assert.notEqual(p.lead,p.originalLead,'Revisit has its own brief prompt');
  assert(p.sources.some(s => s.url === lessonPlanURL),'Original Unit 2 Week 3 lesson plan remains linked');
  for (const source of p.sources) {assert(source.label.trim());assert(['https:'].includes(new URL(source.url,origin).protocol));}
 });
 assert(plan[0].sources.some(s => s.url === assets[2][0]),'Flagged final clubhouse spread retained');
 const provenance = read('assets/focus-3s/unit-2/week-3/centers/FRIDAY-SOURCE.md');
 for (const term of [lessonPlanURL,...plan.map(p => p.title),...sourceURLs,...assets.slice(0,2).flat()]) assert(provenance.includes(term),'Friday provenance records ' + term);
}
function sourceCoverage() {
 const fixture = (name,digest) => {const text = fs.readFileSync(path.join(__dirname,'fixtures/' + name),'utf8');assert.equal(hash(text),digest,'Independent original source remains unchanged');return text;};
 const clubhouse = fixture('week11-centers-monday-clubhouse-source.txt','0b73163ddab5a9a88e5cd9d60c9857548150551e04a510a188d0880053260ff8');
 const emotions = fixture('week11-centers-wednesday-emotions-source.txt','e9249c57b9522d6e309ba492a1e2899cec12557498e7364a2edbefc5f81acef8');
 let body = clubhouse.replace(/^Unit 2: World of Color\s*$/gm,'').replace(/^WEEK 3\s*$/gm,'').replace(/^\s*Dramatic Play: “All Are Welcome” Clubhouse\s*$/gm,'').replace(/^Image Citations (?:for|on) Center Language Supports:?\s*$/gm,'').replace(/^\s*Notes\s*$/gm,'');
 for (const h of ['Big Ideas','Big Idea','Guiding','Questions','Question','Family','Engagement','Vocabulary','Materials and','Preparation','Intro to Centers','During Centers','Differentiation','Ideas','ideas','Facilitation','Extensions','Standards']) body = body.replace(new RegExp('^' + h + '(?:[ \\t]+|$)','gm'),'');
 const noteText = i => plan[i].notes.filter(([h]) => h !== 'Teacher preparation clarification').flatMap(([,ps]) => ps).join(' ');
 const words = s => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim().split(/\s+/);
 assert.deepEqual(words(noteText(0)),words(body),'Full independent clubhouse source teaching text and citations retained');
 body = emotions.replace(/\f/g,'').replace(/^Unit 2: World of [Cc]olor\s*$/gm,'').replace(/^WEEK 3\s*$/gm,'').replace(/^\s*Library and Listening: Exploring Emotions\s*$/gm,'').replace(/Library and Listening U2 W3/g,' ').replace(/Focus on Pre-K 3s \| Boston Public Schools Early Childhood Department P-2/g,' ').replace(/^Image Citations for Center Language Supports\s*$/gm,'').replace(/^\s*Notes\s*$/gm,'');
 for (const h of ['Big Ideas','Objective','Guiding','Questions','Family','Engagement','Vocabulary','Materials and','Preparation','Intro to Centers','During Centers','Differentiation','Ideas','Facilitation','Extensions','Standards']) body = body.replace(new RegExp('^\\s*' + h + '(?:[ \\t]+|$)','gm'),'');
 const characters = s => s.replace(/●/g,'').replace(/\s+/g,'');
 assert.equal(characters(noteText(1)),characters(body),'Every original emotion teaching character, punctuation and citation retained');
 for (const phrase of ['continues in Week 2','For the next two weeks','families and caregivers','smaller scale','realistic and doable','children’s ideas']) assert(noteText(0).includes(phrase));
 for (const phrase of ['first page with the color monster mixed up and then flip to sadness','Chart and discuss 2 responses','blue scarf','body language and facial expression','If ready, ask children to share what they did to cope with the feeling','If children feel uncomfortable acting out an emotion themselves','use the people figurines instead','mindfulness and breathing practices','fearful: 张 学欢 on UnSplash']) assert(noteText(1).includes(phrase));
 assert.match(plan[1].alt,/Supplemental watercolor illustration/);assert.match(plan[1].originalLead,/The Color Monster classroom book ready/);
}
async function back(a,w,step,review) {a.w.history.back();await until(() => w.EEASectionState().step === step && w.EEASectionState().review === review,'History restores exact Friday mode');verify(w,step,review);route(a,step,review);}
async function forward(a,w,step,review) {a.w.history.forward();await until(() => w.EEASectionState().step === step && w.EEASectionState().review === review,'History advances exact Friday mode');verify(w,step,review);route(a,step,review);}
(async () => {
 staticIntegrity();sourceCoverage();
 for (const embedded of [false,true]) {
  const file = embedded ? 'lesson-runner-week11.html' : 'week11-centers.html', base = 'week=11&day=' + (embedded ? '4' : 'Friday') + '&section=1';
  for (const [raw,step] of [['0',0],['1',1],['99999',1],['-1',0],['bad',0],['1.5',0],['Infinity',0],['NaN',0],['',0]]) for (const review of ['', '0','1','true','garbage','-1','2']) {
   const a=open(file,base+'&step='+raw+'&book=stale&stop=4&center=stale&review='+review),w=await ready(a);
   verify(w,step,review==='1');route(a,step,review==='1');assert.equal(a.w.history.length,1,'Normalization replaces');close(a);
  }
  const a=open(file,base),w=await ready(a),d=w.document,start=a.w.history.length,childLength=w.history.length;
  verify(w,0);route(a,0);dialogShim(w);
  d.querySelector('summary').click();d.querySelector('.enlarge-image').click();assert(d.getElementById('image-dialog').open);
  // A mode change interrupts notes and modal without advancing the center.
  d.getElementById('review-original').click();verify(w,0,true);route(a,0,true);assert(!d.getElementById('image-dialog').open);
  assert.equal(a.w.history.length,start+1);if(embedded) assert.equal(w.history.length,childLength,'Iframe never pushes a duplicate review entry');
  for(let n=0;n<4;n++){d.getElementById('review-original').focus();d.getElementById('review-original').click();verify(w,0,n%2===1);assert.equal(d.activeElement.id,'review-original','Review focus survives rerender');}
  assert.equal(a.w.history.length,start+5,'Every repeated mode toggle creates exactly one semantic entry');
  await back(a,w,0,false);await forward(a,w,0,true);
  for (const trigger of ['.enlarge-image','.lesson-img']) {d.querySelector(trigger).click();assert(d.getElementById('image-dialog').open);assert.equal(d.getElementById('enlarged-image').getAttribute('src'),plan[0].img);assert.equal(d.getElementById('enlarged-image').alt,plan[0].alt);d.getElementById('close-image').click();}
  d.querySelector('summary').click();d.querySelector('.enlarge-image').click();const beforeLifecycle=a.w.history.length;
  for(let n=0;n<4;n++){a.w.dispatchEvent(new a.w.Event('pageshow'));if(embedded){w.dispatchEvent(new w.Event('pageshow'));a.w.document.getElementById('frame').dispatchEvent(new a.w.Event('load'));}}
  verify(w,0,true);route(a,0,true);assert(!d.getElementById('image-dialog').open);assert.equal(a.w.history.length,beforeLifecycle);
  // Next while reviewing skips no center and never adds an original-intro page.
  d.getElementById('done').click();verify(w,1,false);route(a,1,false);assert.equal(a.w.history.length,beforeLifecycle+1);
  await back(a,w,0,true);await forward(a,w,1,false);
  d.getElementById('review-original').click();verify(w,1,true);route(a,1,true);
  d.getElementById('prev').click();verify(w,0,false);route(a,0,false);
  await back(a,w,1,true);await forward(a,w,0,false);
  d.getElementById('done').click();d.getElementById('review-original').click();a.w.localStorage.setItem('eea-lesson-auto-resume','enabled');
  for(let n=0;n<5;n++)d.getElementById('done').click();d.getElementById('exit').click();destination(a,'daily-lessons.html');assert.equal(a.w.localStorage.getItem('eea-lesson-auto-resume'),null);close(a);
  // Every boundary works from both optional modes, including interrupted reviews.
  for(const review of [false,true]) for(const [step,button] of [[0,'prev'],[0,'exit'],[1,'exit'],[1,'done']]) {
   const a=open(file,base+'&step='+step+(review?'&review=1':'')),w=await ready(a);verify(w,step,review);a.w.localStorage.setItem('eea-lesson-auto-resume','enabled');
   for(let n=0;n<5;n++)w.document.getElementById(button).click();destination(a,'daily-lessons.html');assert.equal(a.w.localStorage.getItem('eea-lesson-auto-resume'),null);close(a);
  }
  for(const day of ['Friday','4']) {
   const a=open(file,'week=11&day='+day+'&section=1&step=1&review=1'),w=await ready(a);verify(w,1,true);route(a,1,true);close(a);
   for(const section of ['0','-1','7','garbage','1.5']) {const a=open(file,'week=11&day='+day+'&section='+section+'&step=1&review=1');await until(()=>a.navigations.length===1,'Unavailable section guarded');destination(a,'daily-lessons.html');assert.equal(a.w.EEACentersPlan,undefined);const frame=a.w.document.getElementById('frame');if(frame)assert.equal(frame.getAttribute('src'),null);close(a);}
  }
 }
 for(const file of ['week11-centers.html','lesson-runner-week11.html']) for(const query of ['', 'day=', 'day=bad','day=-1','day=1.5','day=Infinity','day=5']) {
  const a=open(file,'week=11&section=1&review=1&'+query);await until(()=>a.navigations.length===1,'Invalid/missing day remains guarded');destination(a,'daily-lessons.html');close(a);
 }
 for(const day of ['Friday','4']) {const a=open('week11-read-aloud.html','week=11&day='+day+'&section=0&step=18&review=1');await until(()=>a.navigations.length===1,'Direct Friday reader guarded');destination(a,'daily-lessons.html');assert.equal(a.w.EEAReadAloudPlan,undefined);close(a);}
 // v5 must preserve the exact Mon–Thu public state shape and ignore stale review.
 for(let day=0;day<4;day++)for(const embedded of [false,true]) {
  const a=open(embedded?'lesson-runner-week11.html':'week11-centers.html','week=11&day='+day+'&section=1&step=1&review=1'),w=await ready(a),earlier=JSON.parse(read('week11-centers-'+days[day].toLowerCase()+'-plan.json'));
  verify(w,1,false,earlier,day);route(a,1,false,day);assert(!Object.hasOwn(w.EEASectionState(),'review'));close(a);
 }
 console.log('PASS: Friday exact sources/assets, ordered two-card revisits, original-review parity, notes, modal interruption, repeated toggles, review history/restoration, same-day boundaries, guarded routes and preserved Mon–Thu state');
})().catch(error=>{console.error(error);process.exitCode=1;});
