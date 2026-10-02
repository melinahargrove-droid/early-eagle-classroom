// Tuesday Unit 2 Week 3 Mouse Paint Read 2 source integrity and DOM regressions.
// Independent teaching expectations are taken from the original Read 2 directions:
// https://drive.google.com/file/d/1SfiovicI0riSvCOb8ubb8yYK753JIK0s/view
// Source was inspected from u2w3-source/mouse_lesson.json; CI does not need that
// external export. Real clipping pixels, image bounds and joint browser history
// are verified separately by test_week11_readaloud_tuesday_browser.cjs.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const {implForWrapper}=require('jsdom/lib/jsdom/living/generated/utils');
const {serializeURL}=require('whatwg-url');
const root=path.resolve(__dirname,'../v6-test'),origin='https://eea.test/v6-test/';
const assetRoot='assets/focus-3s/unit-2/week-3/mouse-paint/';
const originals=[
 ['02d47a6b0304a0ab9a2d46a144cf89d651a7da6865c529c78bdc01fb32b7a4a2',2048,1737],
 ['4bca92d03bf7196761aef06d38b3e2addd72425f1c4fd10f34c1295231ce8aa8',2048,883],
 ['1fde12b283c1549e8869081714476ecd2a6f1fbe4ebb3dadf7b897cb6784391f',2048,824],
 ['13659c9bc7371836f8a1867d67d787b49c866c2082b701940f053800dddecbe4',2048,857],
 ['bb2cc2f5ee423bdc00b6c96b6ed7bedd7f287764a8de3c8e1cb2feb8ef88d666',2048,838],
 ['286e0c017a3b2f87686fcbcf3148a9a3ea20d23ae0f2f0c012a069693a24c991',2048,823],
 ['126ac276f85ae1958e51ac8798ceb628ebcfbfb87f17231405f1a405de803ed0',2048,845],
 ['2644b6a620043896b43cf1a59ef725ea2137659cff4a48d3369dc79482424470',2048,824],
 ['a4ccd18163fe9447af7b27806c38e817b038764608eab43201e70dda614a9bcb',2048,839],
 ['d460f1c5bb8d5e61e32903200b1c238e7d5f04b261080fda8a035d2f7140f06e',2048,833],
 ['d157c872e9974e4e13a086e8a3bb1ccb31d6e76e840569ff1cd55d7474a27aa8',2048,831],
 ['73c696d29ad49ce766395f1ecc246ddf0dadd039f7469b3b295ac92b3d34ca8b',2048,834],
 ['45b1354ded08d07eab572a077f833f4aa269dffa159bf0553d78963a9af36765',2048,820],
 ['738c04840f12850ce148bd25f80315d67817eed4082fad5eb5e71cbc4bb6d718',2048,839],
 ['dbfcb72883d9511f053614734cab5e2a2946c0a6f1b55f7e9f276d7206c99c57',2048,812],
 ['ade981026fd19b17e6c68d3a58ad02d85bc86338c28505e5decf79a692b3a97c',2048,822]
];
const legacyHashes={
 'week11-read-aloud-v1.js':'9ad16dd03cc67f3c9e4c685029c74fe9dd822acb1070d62112df1e7ba71921a9',
 'week11-read-aloud-plan-v1.js':'45340305ccadb7eb5c0bcb115254601b3ef633336cf11187fcf8af396a7930cb'
};
const imageFor=n=>assetRoot+`slide-${String(n).padStart(2,'0')}.jpg`;
const copy=v=>JSON.parse(JSON.stringify(v));
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(test,label){for(let i=0;i<200;i++){if(test())return;await delay(10);}assert.fail(label);}
class AppFiles extends ResourceLoader{
 fetch(url){if(!url.startsWith(origin))return null;return Promise.resolve(fs.readFileSync(path.join(root,decodeURIComponent(new URL(url).pathname.slice('/v6-test/'.length)))));}
}
function open(file='week11-read-aloud.html',query='day=Tuesday',storage={}){
 const errors=[],navigations=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:origin+file+'?'+query,runScripts:'dangerously',resources:new AppFiles(),virtualConsole:vc,beforeParse(w){
  for(const [k,v]of Object.entries(storage))w.localStorage.setItem(k,v);
  // Observe top-level navigation instead of rewriting production code.
  implForWrapper(w.location)._locationObjectNavigate=url=>navigations.push(serializeURL(url));
  // Invalid/missing days must not silently render the Tuesday lesson just
  // because the computer's weekday happens to be Tuesday.
  const Native=w.Date;w.Date=class extends Native{constructor(...a){super(...(a.length?a:['2026-10-06T12:00:00Z']));}static now(){return new Native('2026-10-06T12:00:00Z').getTime();}};
 }});
 return{w:dom.window,errors,navigations};
}
async function ready(w){await until(()=>w.document.readyState==='complete'&&typeof w.EEASectionState==='function'&&w.EEAReadAloudPlan,'Tuesday reader initialized');return copy(w.EEAReadAloudPlan.steps);}
function clean(a){assert.deepEqual(a.errors,[]);a.w.close();}
function jpegSize(bytes){let offset=2;assert.equal(bytes.readUInt16BE(0),0xffd8);while(offset<bytes.length){assert.equal(bytes[offset++],0xff);while(bytes[offset]===0xff)offset++;const marker=bytes[offset++],length=bytes.readUInt16BE(offset);if([0xc0,0xc1,0xc2].includes(marker))return[bytes.readUInt16BE(offset+5),bytes.readUInt16BE(offset+3)];offset+=length;}assert.fail('JPEG frame header');}
function state(w,steps,index,stop=0){
 const s=copy(w.EEASectionState()),step=steps[index];
 assert.equal(s.index,index);assert.equal(s.step,index);assert.equal(s.total,19);assert.equal(s.stop,stop);assert.equal(s.atStart,index===0);assert.equal(s.atEnd,index===18&&stop===step.stops.length);assert.equal(s.stopPending,stop<step.stops.length);assert.equal(s.vocabulary,false);
 const d=w.document,covered=step.coverRightPage&&stop<step.revealAtStop;
 assert.equal(d.getElementById('bookImg').style.clipPath,covered?'inset(0 50% 0 0)':'',`${step.id}/${stop}: cover is derived from current stop`);
 assert.equal(d.getElementById('pageCoverNote').hidden,!covered);assert.equal(d.getElementById('teachingStop').hidden,stop===0);assert.equal(d.getElementById('stopText').textContent,stop?step.stops[stop-1]:'');
 if(covered){assert.match(d.getElementById('pageCoverNote').textContent,/Page 4 covered/);assert.match(d.getElementById('bookImg').alt,/page 4.*covered/i);assert.doesNotMatch(d.getElementById('teacherText').textContent,/red,? yellow.*blue paint|jars of paint/i,'Teacher notes do not expose recall answer before reveal');assert.doesNotMatch(d.getElementById('stopText').textContent,/red|yellow|blue|jars/i);}
 if(step.coverRightPage&&stop===1)assert.equal(d.getElementById('next').textContent,'Reveal Page 4 →');
 return s;
}
async function embedded(index=0,stop=0,day='1'){
 const a=open('lesson-runner-week11.html',`week=11&day=${day}&section=0&step=${index}&stop=${stop}`),frame=a.w.document.getElementById('frame');
 await until(()=>a.w.document.readyState==='complete'&&frame.contentDocument?.readyState==='complete'&&typeof frame.contentWindow.EEASectionState==='function','Embedded Tuesday initialized');
 return{...a,frame,cw:frame.contentWindow};
}
function overview(a,day=1){assert.equal(a.navigations.length,1);const u=new URL(a.navigations[0]);assert.equal(u.pathname,'/v6-test/daily-lessons.html');assert.equal(u.searchParams.get('week'),'11');assert.equal(u.searchParams.get('day'),String(day));}
(async()=>{
 const html=fs.readFileSync(path.join(root,'week11-read-aloud.html'),'utf8');
 assert.deepEqual([...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]),['week11-read-aloud-plan-v1.js','week11-read-aloud-tuesday-plan-v1.js','week11-read-aloud-v2.js']);
 for(const[file,hash]of Object.entries(legacyHashes))assert.equal(digest(fs.readFileSync(path.join(root,file))),hash,`${file} remains an immutable v89 cache fixture`);
 const manifest=JSON.parse(fs.readFileSync(path.join(root,assetRoot,'source-manifest.json'),'utf8'));
 assert.equal(manifest.images.length,16);
 for(const[i,[hash,width,height]]of originals.entries()){
  const bytes=fs.readFileSync(path.join(root,imageFor(i+1))),entry=manifest.images[i];
  assert.equal(digest(bytes),hash,`Original image ${i+1} unchanged`);assert.deepEqual(jpegSize(bytes),[width,height]);assert.equal(entry.sha256,hash);assert.equal(entry.width,width);assert.equal(entry.height,height);assert.equal(entry.sourceSlide,i+1);
  assert.deepEqual(entry.printedPages,i===0?[]:i===15?[29]:[i*2-1,i*2]);
 }
 const a=open(),w=a.w,steps=await ready(w),d=w.document,plan=copy(w.EEAReadAloudPlan);
 assert.deepEqual(plan,JSON.parse(fs.readFileSync(path.join(root,'week11-read-aloud-tuesday-plan.json'),'utf8')),'Inspectable JSON and executable Read2 plan match');
 assert.equal(plan.day,'Tuesday');assert.equal(plan.title,'Mouse Paint');assert.equal(plan.author,'Ellen Stoll Walsh');assert.equal(plan.illustrator,'Ellen Stoll Walsh');assert.match(plan.read,/Read 2.*retell.*summari/i);
 assert.equal(plan.source,'https://drive.google.com/file/d/1SfiovicI0riSvCOb8ubb8yYK753JIK0s/view');
 assert.equal(steps.length,19);assert.equal(new Set(steps.map(s=>s.id)).size,19);
 assert.deepEqual(steps.map(s=>s.kind),['opening',...Array(16).fill('book'),'after','closing']);assert(!steps.some(s=>s.vocabulary||s.kind==='vocabulary'),'Read2 does not repeat Monday vocabulary screens');
 const book=steps.filter(s=>s.kind==='book');assert.deepEqual(book.map(s=>s.sourceSlide),Array.from({length:16},(_,i)=>i+1));
 for(const s of steps){assert.equal(s.img,imageFor(s.sourceSlide));assert(Array.isArray(s.stops));}
 for(const s of book){assert.equal(s.bookPage,true);assert.deepEqual(s.printedPages,manifest.images[s.sourceSlide-1].printedPages);}
 const stopSteps=steps.filter(s=>s.stops.length),stops=stopSteps.flatMap(s=>s.stops);
 assert.deepEqual(stopSteps.map(s=>s.printedPages),[[1,2],[3,4],[5,6],[7,8],[9,10],[11,12],[13,14],[15,16]]);
 assert.deepEqual(stopSteps.map(s=>s.stops.length),[1,2,1,1,1,1,1,1]);assert.equal(stops.length,9);assert.equal(new Set(stops).size,9);
 // These meanings/locations are independently transcribed from Read2, rather
 // than comparing UI against itself or copying Monday's prediction stops.
 const purposes=[/three mice.*cat.*why can.t the cat find the mice/i,/what do the mice find.*cat is asleep/i,/find red, yellow, and blue paint.*what did the mice do with the paint/i,/climbed inside the jars of paint.*red.*yellow.*blue/i,/puddles looked like fun.*what did the mice do with the puddles/i,/stepped and hopped in the puddles.*then what happened/i,/new colors.*red mouse.*yellow puddle.*orange/i,/yellow mouse hopped into the blue puddle.*feet mixed and stirred until/i,/new color.*green/i];
 stops.forEach((s,i)=>assert.match(s,purposes[i],`Source Read2 teaching purpose ${i+1}`));
 assert(!stops.some(s=>/predict|thumbs up/i.test(s)),'Retelling prompts are not Read1 predictions');
 const reveal=stopSteps[1],revealIndex=steps.indexOf(reveal);assert.equal(revealIndex,3);assert.equal(reveal.coverRightPage,true);assert.equal(reveal.revealAtStop,2);assert.deepEqual(steps.filter(s=>s.coverRightPage).map(s=>s.id),[reveal.id]);assert.doesNotMatch(reveal.stops[0],/red|yellow|blue|paint|jars/i);
 assert.match(JSON.stringify(steps[0]),/one more time.*remember and retell/i);
 const after=steps.at(-2);assert.equal(after.sourceSlide,16);assert.match(JSON.stringify(after),/why did they decide to leave some of the paper white/i);assert.match(after.note,/page 29.*white because of the cat.*how did that help the mice.*what might have happened.*whole paper with colors/i);
 const closing=steps.at(-1);assert.match(JSON.stringify(closing),/retell.*second time.*centers.*red and yellow.*red and blue/i);assert.doesNotMatch(JSON.stringify(closing),/again tomorrow/i);
 assert.match(plan.teacherNotes,/RL\.PK\.2.*RL\.PK\.6.*SL\.PK\.6/);assert.match(plan.teacherNotes,/retell.*prompt.*illustrations/i);
 assert.deepEqual([...d.querySelectorAll('#teacherNotes a')].map(e=>e.href),[plan.source,...plan.resources.map(r=>r[1])]);for(const link of d.querySelectorAll('#teacherNotes a')){assert.equal(link.target,'_blank');assert(link.rel.includes('noopener'));}
 assert.equal(d.querySelectorAll('iframe').length,0);
 let stopCount=0;
 for(let i=0;i<steps.length;i++){
  const s=steps[i];state(w,steps,i);assert.equal(d.getElementById('bookImg').getAttribute('src'),s.img);assert.equal(d.querySelector('.stage').classList.contains('spread'),!!s.bookPage);
  for(let stop=0;stop<=s.stops.length;stop++){
   state(w,steps,i,stop);const url=w.location.href,len=w.history.length,before=copy(w.EEASectionState());
   for(let n=0;n<3;n++){d.querySelector('#teacherNotes summary').click();state(w,steps,i,stop);d.querySelector('#teacherNotes summary').click();}
   assert.deepEqual(copy(w.EEASectionState()),before);assert.equal(w.location.href,url);assert.equal(w.history.length,len);
   if(stop<s.stops.length){d.getElementById('next').click();stopCount++;assert.equal(d.getElementById('bookImg').getAttribute('src'),s.img);}
  }
  if(i<18)d.getElementById('next').click();
 }
 assert.equal(stopCount,9);assert.equal(d.getElementById('next').textContent,'Finish Read Aloud →');clean(a);
 console.log('Read2 source alignment: 19 screens, nine gated prompts, all 16 original JPEGs, page29 discussion, retelling closing and unchanged v89 assets pass');
 // Previous starts the earlier screen fresh, including resetting a revealed
 // page4 to its covered state. Native Back/Forward restores the exact prior state.
 for(const s of stopSteps)for(let stop=0;stop<=s.stops.length;stop++){
  const i=steps.indexOf(s),a=await embedded(i,stop),cw=a.cw;state(cw,steps,i,stop);
  for(let n=0;n<4;n++){a.w.dispatchEvent(new a.w.Event('pageshow'));a.frame.dispatchEvent(new a.w.Event('load'));state(cw,steps,i,stop);}
  const childHistory=cw.history.length;cw.document.getElementById('prev').click();state(cw,steps,i-1,0);assert.equal(cw.history.length,childHistory);
  a.w.history.back();await until(()=>cw.EEASectionState().index===i,'Back restores teaching position');state(cw,steps,i,stop);
  a.w.history.forward();await until(()=>cw.EEASectionState().index===i-1,'Forward restores previous screen');state(cw,steps,i-1,0);clean(a);
 }
 for(const mode of['standalone','embedded']){
  const a=mode==='embedded'?await embedded(revealIndex,0):open('week11-read-aloud.html',`day=Tuesday&step=${revealIndex}&stop=0`),cw=a.cw||a.w;await ready(cw);
  for(const stop of[0,1,2]){state(cw,steps,revealIndex,stop);if(stop<2)cw.document.getElementById('next').click();}
  a.w.history.back();await until(()=>cw.EEASectionState().stop===1,'Back restores covered question');state(cw,steps,revealIndex,1);
  a.w.history.back();await until(()=>cw.EEASectionState().stop===0,'Back restores initial covered image');state(cw,steps,revealIndex,0);
  a.w.history.forward();await until(()=>cw.EEASectionState().stop===1,'Forward restores question');state(cw,steps,revealIndex,1);
  a.w.history.forward();await until(()=>cw.EEASectionState().stop===2,'Forward restores reveal');state(cw,steps,revealIndex,2);
  cw.document.getElementById('next').click();state(cw,steps,revealIndex+1,0);cw.document.getElementById('prev').click();state(cw,steps,revealIndex,0);clean(a);
 }
 for(const[rawStep,rawStop,index,stop]of[['bad','bad',0,0],['-1','-9',0,0],['1.5','0.5',0,0],['Infinity','NaN',0,0],['999','999',18,0],['3','999',3,2],['3','-1',3,0],['3','1',3,1],['3','2',3,2],['3','1.5',3,0]]){
  for(const file of['week11-read-aloud.html','lesson-runner-week11.html']){
   const a=open(file,`week=11&day=Tuesday&section=0&step=${rawStep}&stop=${rawStop}`);let cw=a.w;if(file.startsWith('lesson-runner')){await until(()=>a.w.document.getElementById('frame').contentWindow?.EEAReadAloudPlan,'Normalized embedded reader');cw=a.w.document.getElementById('frame').contentWindow;}
   await ready(cw);state(cw,steps,index,stop);const p=new URL(a.w.location.href).searchParams;assert.equal(p.get('step'),String(index));assert.equal(p.get('stop'),String(stop));assert.equal(a.w.history.length,1);clean(a);
  }
 }
 const fast=await embedded();for(let n=0;n<3;n++)fast.cw.document.getElementById('next').click();state(fast.cw,steps,2,1);fast.cw.document.getElementById('next').click();state(fast.cw,steps,3,0);for(let n=0;n<2;n++)fast.cw.document.getElementById('next').click();state(fast.cw,steps,3,2);
 const p=new URL(fast.w.location.href).searchParams;assert.equal(p.get('day'),'1');assert.equal(p.get('step'),'3');assert.equal(p.get('stop'),'2');const resume=JSON.parse(fast.w.localStorage.getItem('eea-lesson-resume'));assert.equal(resume.week,11);assert.equal(resume.day,1);assert.equal(resume.section,0);clean(fast);
 for(const day of['Tuesday','1']){const a=open('week11-read-aloud.html','day='+day);await ready(a.w);state(a.w,steps,0);assert.equal(a.w.EEAReadAloudPlan.day,'Tuesday');clean(a);}
 for(const[id,index,stop]of[['prev',0,0],['backBtn',3,1],['backBtn',3,2],['next',18,0]])for(const file of['week11-read-aloud.html','lesson-runner-week11.html']){
  const a=open(file,`week=11&day=Tuesday&section=0&step=${index}&stop=${stop}`,{'eea-lesson-auto-resume':'2026-10-06'});let cw=a.w;if(file.startsWith('lesson-runner')){await until(()=>a.w.document.getElementById('frame').contentWindow?.EEAReadAloudPlan,'Exit embedded reader');cw=a.w.document.getElementById('frame').contentWindow;}
  await ready(cw);cw.document.getElementById(id).click();overview(a);assert.equal(a.w.localStorage.getItem('eea-lesson-auto-resume'),null);clean(a);
 }
 for(const [day,expected]of[['',1],['Wednesday',2],['Thursday',3],['Friday',4],['2',2],['3',3],['4',4],['5',1],['-1',1],['bad',1],['1.5',1],['Tuesday%20',1]]){
  const a=open('week11-read-aloud.html',day?'day='+day:'');await until(()=>a.w.document.readyState==='complete','Invalid reader loaded');assert.equal(typeof a.w.EEASectionState,'undefined');assert(!a.w.EEAReadAloudPlan);overview(a,expected);clean(a);
 }
 console.log('Covered/revealed restoration, Previous reset, malformed links, repeated preparation/notes, rapid clicks, Tuesday exits and invalid-day rejection pass');
})().catch(e=>{console.error(e);process.exitCode=1;});
