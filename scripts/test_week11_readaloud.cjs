// Monday Unit 2 Week 3 Mouse Paint Read 1 source integrity and DOM regressions.
// Requires jsdom 26.1.0. Real image/layout/joint-history checks are in _browser.cjs.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'../v6-test');
const origin='https://eea.test/v6-test/';
const assetRoot='assets/focus-3s/unit-2/week-3/mouse-paint/';
// Independently checked against the original PPTX media and actual source pixels.
// Original book JPEGs have varied aspect ratios; these are not slide renderings.
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
 'week10-read-aloud.js':'8488ca1302312077661a4f6ce7c68a8958fc436f53b5890f4682b10bced45754',
 'week10-read-aloud-v2.js':'23f4293677913eaab5f630e7fdf83e7220bc37b5ed9d58857df7d62c155c1795',
 'week10-read-aloud-v3.js':'cdf05a0ac53213f47f5287d73f23a4d3aad54e8448a480e514d88fd91064a3b5',
 'week10-read-aloud-v4.js':'8f4023cb9eade4346b3f24b9c28f7b7efbfb72777317c91d32c72c3e7fe3f828',
 'week10-community-v5.js':'86ad9b2dfee572344efc40b66ebc8e9c7b86e2a82be510e5ee774098034acd8d',
 // Pre-Wednesday parent-history bytes, normalized only for its two new readiness bounds below.
 'lesson-runner-week10.html':'be93b14b407087915c29125c2a144cd7b8af2deb7e04f899ddd1050eaf478837'
};
const imageFor=n=>assetRoot+`slide-${String(n).padStart(2,'0')}.jpg`;
const copy=v=>JSON.parse(JSON.stringify(v));
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(test,label){for(let i=0;i<200;i++){if(test())return;await delay(10);}assert.fail(label);}
class AppFiles extends ResourceLoader{
 fetch(url){if(!url.startsWith(origin))return null;return Promise.resolve(fs.readFileSync(path.join(root,decodeURIComponent(new URL(url).pathname.slice('/v6-test/'.length)))));}
}
function open(file='week11-read-aloud.html',query='day=Monday',monday=false){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:origin+file+'?'+query,runScripts:'dangerously',resources:new AppFiles(),virtualConsole:vc,beforeParse(w){if(monday){const Native=w.Date;w.Date=class extends Native{constructor(...args){super(...(args.length?args:['2026-10-05T12:00:00Z']));}static now(){return new Native('2026-10-05T12:00:00Z').getTime();}};}}});
 return{w:dom.window,errors};
}
async function ready(w){await until(()=>w.document.readyState==='complete'&&typeof w.EEASectionState==='function'&&w.EEAReadAloudPlan,'Monday reader initialized');return copy(w.EEAReadAloudPlan.steps);}
function jpegSize(bytes){let offset=2;assert.equal(bytes.readUInt16BE(0),0xffd8);while(offset<bytes.length){assert.equal(bytes[offset++],0xff);while(bytes[offset]===0xff)offset++;const marker=bytes[offset++],length=bytes.readUInt16BE(offset);if([0xc0,0xc1,0xc2].includes(marker))return[bytes.readUInt16BE(offset+5),bytes.readUInt16BE(offset+3)];offset+=length;}assert.fail('JPEG frame header');}
function checkState(w,steps,index,stop=0){const s=copy(w.EEASectionState()),step=steps[index];assert.equal(s.index,index);assert.equal(s.step,index);assert.equal(s.total,24);assert.equal(s.stop,stop);assert.equal(s.atStart,index===0);assert.equal(s.atEnd,index===23&&stop===step.stops.length);assert.equal(s.stopPending,stop<step.stops.length);assert.equal(s.vocabulary,step.kind==='vocabulary');return s;}
async function embedded(step=0,stop=0){const item=open('lesson-runner-week11.html',`week=11&day=0&section=0&step=${step}&stop=${stop}`),frame=item.w.document.getElementById('frame');await until(()=>item.w.document.readyState==='complete'&&frame.contentDocument?.readyState==='complete'&&typeof frame.contentWindow.EEASectionState==='function','Embedded Monday ready');return{...item,frame,cw:frame.contentWindow};}
(async()=>{
 const html=fs.readFileSync(path.join(root,'week11-read-aloud.html'),'utf8');
 assert.match(html,/src="week11-read-aloud-plan-v1\.js"/);assert.match(html,/src="week11-read-aloud-v2\.js"/);
 assert(!/week10-(?:read-aloud|community)/.test(html),'New Week 11 paths cannot reuse old worker cached runtimes');
 for(const[file,hash]of Object.entries(legacyHashes)){
  let bytes=fs.readFileSync(path.join(root,file));
  if(file==='lesson-runner-week10.html'){
   let source=bytes.toString();
   // Normalize only the exact Friday selector route/history additions below.
   // Every other runner byte remains protected by the original pinned hash.
   const fridayChanges=[
    [
        "  const section=day<5&&params.get('section')==='2'?2:params.get('section')==='1'?1:0;\n",
        "  const section=day<4&&params.get('section')==='2'?2:params.get('section')==='1'?1:0;\n"
    ],
    [
        "  const route=new URL(location.href);route.searchParams.set('week','10');route.searchParams.set('day',String(day));route.searchParams.set('section',String(section));if(section!==1){route.searchParams.delete('stop');route.searchParams.delete('book');if(section===0)route.searchParams.delete('step');}if(section!==2){route.searchParams.delete('center');route.searchParams.delete('review');}history.replaceState(history.state,'',route.href);\n  function centerParams(url,state){\n    if(section===2&&day===4&&state.center)url.searchParams.set('center',state.center);else url.searchParams.delete('center');\n    if(section===2&&day===4&&state.review)url.searchParams.set('review','1');else url.searchParams.delete('review');\n  }\n",
        "  const route=new URL(location.href);route.searchParams.set('week','10');route.searchParams.set('day',String(day));route.searchParams.set('section',String(section));if(section!==1){route.searchParams.delete('stop');route.searchParams.delete('book');if(section===0)route.searchParams.delete('step');}history.replaceState(history.state,'',route.href);\n"
    ],
    [
        "    if(section===2){if(typeof win?.EEACentersRestore!=='function')return;win.EEACentersRestore(p.get('step')||0,p.get('center'),p.get('review'));}else{if(typeof win?.EEAReadAloudRestore!=='function')return;win.EEAReadAloudRestore(p.get('step')||0,p.get('stop')||0,p.get('book'));}\n",
        "    if(section===2){if(typeof win?.EEACentersRestore!=='function')return;win.EEACentersRestore(p.get('step')||0);}else{if(typeof win?.EEAReadAloudRestore!=='function')return;win.EEAReadAloudRestore(p.get('step')||0,p.get('stop')||0,p.get('book'));}\n"
    ],
    [
        "    const child=new URL(win.location.href);child.searchParams.set('step',String(state.step));if(section===1)child.searchParams.set('stop',String(state.stop));else child.searchParams.delete('stop');if(state.book)child.searchParams.set('book',state.book);else child.searchParams.delete('book');centerParams(child,state);win.history.replaceState(null,'',child.href);\n    if(section===2){const canonical=new URL(location.href);canonical.searchParams.set('step',String(state.step));centerParams(canonical,state);if(canonical.href!==location.href)history.replaceState(history.state,'',canonical.href);}\n",
        "    const child=new URL(win.location.href);child.searchParams.set('step',String(state.step));if(section===1)child.searchParams.set('stop',String(state.stop));else child.searchParams.delete('stop');if(state.book)child.searchParams.set('book',state.book);else child.searchParams.delete('book');win.history.replaceState(null,'',child.href);\n"
    ],
    [
        "    const state=frame.contentWindow.EEASectionState(),url=new URL(location.href);url.searchParams.set('step',String(state.step));url.searchParams.set('stop',String(state.stop));if(state.book)url.searchParams.set('book',state.book);else url.searchParams.delete('book');centerParams(url,state);\n",
        "    const state=frame.contentWindow.EEASectionState(),url=new URL(location.href);url.searchParams.set('step',String(state.step));url.searchParams.set('stop',String(state.stop));if(state.book)url.searchParams.set('book',state.book);else url.searchParams.delete('book');\n"
    ],
    [
        "  window.EEACentersNavigate=(step,replace=false,center=null,review=false)=>{\n",
        "  window.EEACentersNavigate=(step,replace=false)=>{\n"
    ],
    [
        "    frame.contentWindow.EEACentersRestore(step,center,review);\n    const state=frame.contentWindow.EEASectionState(),url=new URL(location.href);url.searchParams.set('step',String(state.step));url.searchParams.delete('stop');url.searchParams.delete('book');centerParams(url,state);\n",
        "    frame.contentWindow.EEACentersRestore(step);\n    const state=frame.contentWindow.EEASectionState(),url=new URL(location.href);url.searchParams.set('step',String(state.step));url.searchParams.delete('stop');url.searchParams.delete('book');\n"
    ],
    [
        "  window.EEAWeek10CompleteReadAloud=()=>{if(day<5)location.href='lesson-runner-week10.html?week=10&day='+day+'&section=2';else overview();};\n",
        "  window.EEAWeek10CompleteReadAloud=()=>{if(day<4)location.href='lesson-runner-week10.html?week=10&day='+day+'&section=2';else overview();};\n"
    ],
    [
        "  frame.src=(section===2?'week10-centers.html':section===1?'week10-read-aloud.html':'week10-community.html')+'?day='+days[day]+'&from=runner&week=10&section='+section+step+(section===1&&params.has('book')?'&book='+encodeURIComponent(params.get('book')):'')+(section===2&&day===4?'&center='+encodeURIComponent(params.get('center')||'')+'&review='+encodeURIComponent(params.get('review')||''):'');\n",
        "  frame.src=(section===2?'week10-centers.html':section===1?'week10-read-aloud.html':'week10-community.html')+'?day='+days[day]+'&from=runner&week=10&section='+section+step+(section===1&&params.has('book')?'&book='+encodeURIComponent(params.get('book')):'');\n"
    ]
];
   for(const [current,previous]of fridayChanges){assert.equal(source.split(current).length-1,1,'One exact approved Friday selector routing change');source=source.replace(current,previous);}
   // Restore only the explicitly approved Wednesday/Thursday readiness bounds. All
   // previous routing, history and markup bytes retain the original hash.
   for(const [current,previous]of [
    ["const section=day<4&&params.get('section')==='2'", "const section=day<2&&params.get('section')==='2'"],
    ["window.EEAWeek10CompleteReadAloud=()=>{if(day<4)", "window.EEAWeek10CompleteReadAloud=()=>{if(day<2)"]
   ]){assert.equal(source.split(current).length-1,1,'One exact approved Wednesday/Thursday routing change');source=source.replace(current,previous);}
   bytes=Buffer.from(source);
  }
  assert.equal(digest(bytes),hash,`${file} stays intact apart from explicit Wednesday/Thursday readiness and Friday selector routing`);
 }
 const manifest=JSON.parse(fs.readFileSync(path.join(root,assetRoot,'source-manifest.json'),'utf8'));
 assert.equal(manifest.sourcePptxSha256,'cd34dec91415317201a934237a88ec7e287ba6a85cd7d1c0a48c7dd81992c5b5');assert.equal(manifest.images.length,16);
 const media=['image14.jpg','image1.jpg','image5.jpg','image10.jpg','image9.jpg','image7.jpg','image6.jpg','image8.jpg','image12.jpg','image4.jpg','image2.jpg','image16.jpg','image15.jpg','image3.jpg','image13.jpg','image11.jpg'];
 for(const[i,[hash,width,height]]of originals.entries()){
  const bytes=fs.readFileSync(path.join(root,imageFor(i+1))),entry=manifest.images[i];
  assert.equal(digest(bytes),hash,`Original image ${i+1} bytes`);assert.deepEqual(jpegSize(bytes),[width,height],`Uncropped original ${i+1}`);
  assert.equal(entry.sha256,hash);assert.equal(entry.width,width);assert.equal(entry.height,height);assert.equal(entry.sourceSlide,i+1);assert.equal(entry.sourcePptxMedia,'../media/'+media[i]);
  assert.deepEqual(entry.printedPages,i===0?[]:i===15?[29]:[i*2-1,i*2]);
 }
 const{w,errors}=open(),steps=await ready(w),d=w.document;
 const plan=copy(w.EEAReadAloudPlan);assert.deepEqual(plan,JSON.parse(fs.readFileSync(path.join(root,'week11-read-aloud-plan.json'),'utf8')),'Inspectable JSON matches actual executable plan');
 assert.equal(plan.title,'Mouse Paint');assert.equal(plan.author,'Ellen Stoll Walsh');assert.equal(plan.illustrator,'Ellen Stoll Walsh');assert.equal(plan.day,'Monday');assert.match(plan.read,/Read 1/);
 assert.equal(steps.length,24);assert.equal(new Set(steps.map(s=>s.id)).size,24);
 const book=steps.filter(s=>s.kind==='book');assert.deepEqual(book.map(s=>s.sourceSlide),Array.from({length:16},(_,i)=>i+1));
 for(const s of steps){assert.equal(s.img,imageFor(s.sourceSlide));assert(Array.isArray(s.stops));}
 for(const s of book){assert.equal(s.bookPage,true);assert.deepEqual(s.printedPages,manifest.images[s.sourceSlide-1].printedPages);}
 const stopSteps=steps.filter(s=>s.stops.length),stops=stopSteps.flatMap(s=>s.stops);
 assert.deepEqual(stopSteps.map(s=>s.printedPages.at(-1)),[2,10,12,14,16,18,20]);assert.equal(stops.length,7);assert.equal(new Set(stops).size,7);
 const purposes=[/camouflaged.*white mice.*same color/i,/red mouse.*yellow puddle.*predict/i,/red and yellow.*orange.*thumbs up/i,/yellow mouse.*blue puddle.*predict/i,/blue and yellow.*green.*thumbs up/i,/blue mouse.*red puddle.*predict/i,/blue and red.*purple.*thumbs up/i];
 stops.forEach((s,i)=>assert.match(s,purposes[i],`Teaching purpose for printed page ${stopSteps[i].printedPages.at(-1)}`));
 const vocab=steps.filter(s=>s.kind==='vocabulary');assert.deepEqual(vocab.map(s=>s.word),['drip','stir','hop','stiff']);assert.deepEqual(vocab.map(s=>s.sourceSlide),[5,6,8,12]);
 const meanings=[/small drop of liquid/i,/to mix/i,/small jump/i,/hard.*opposite of soft/i];
 vocab.forEach((s,i)=>{assert.equal(s.vocabulary,true);assert.match(s.prompt,meanings[i]);assert.equal(steps[steps.indexOf(s)-1].id,s.sourceStep);assert.equal(steps[steps.indexOf(s)-1].sourceSlide,s.sourceSlide);});
 assert.match(JSON.stringify(steps.filter(s=>s.kind==='before')),/joyful paintings.*self.portraits.*Unit 1/i);
 assert.match(JSON.stringify(steps.find(s=>s.kind==='after')),/mixing colors helpful.*help you.*painting/i);
 assert.equal(steps.at(-1).kind,'closing');assert.match(JSON.stringify(steps.at(-1)),/Art Studio.*tomorrow|tomorrow.*Art Studio/i);
 assert.match(plan.teacherNotes,/no adapted language.*CROWD/i);assert.match(plan.teacherNotes,/RL\.PK\.7.*RL\.PK\.9/);
 assert.equal(d.querySelectorAll('iframe').length,0);for(const id of['prev','next','backBtn','teacherNotes','bookImg','teachingStop','stopText'])assert(d.getElementById(id));
 assert.deepEqual([...d.querySelectorAll('#teacherNotes a')].map(a=>a.href),[plan.source,...plan.resources.map(r=>r[1])]);for(const a of d.querySelectorAll('#teacherNotes a')){assert.equal(a.target,'_blank');assert(a.rel.includes('noopener'));}
 let stopCount=0;
 for(let i=0;i<steps.length;i++){
  const s=steps[i];checkState(w,steps,i);assert.equal(d.getElementById('bookImg').getAttribute('src'),s.img);assert.equal(d.querySelector('.stage').classList.contains('spread'),!!s.bookPage);
  const url=w.location.href,len=w.history.length,state=copy(w.EEASectionState());for(let n=0;n<3;n++){d.querySelector('#teacherNotes summary').click();d.querySelector('#teacherNotes summary').click();}assert.deepEqual(copy(w.EEASectionState()),state);assert.equal(w.location.href,url);assert.equal(w.history.length,len);
  for(let stop=0;stop<s.stops.length;stop++){
   assert.equal(d.getElementById('teachingStop').hidden,stop===0);d.getElementById('next').click();checkState(w,steps,i,stop+1);assert.equal(d.getElementById('stopText').textContent,s.stops[stop]);assert.equal(d.getElementById('teachingStop').hidden,false);assert.equal(d.getElementById('bookImg').getAttribute('src'),s.img);stopCount++;
  }
  if(i<23)d.getElementById('next').click();
 }
 assert.equal(stopCount,7);assert.match(d.getElementById('next').textContent,/Finish Read Aloud/);assert.deepEqual(errors,[]);w.close();
 console.log('All 16 original JPEG hashes/dimensions/page mappings, 24 screens, seven stops and four vocabulary meanings pass');
 for(const s of[...vocab,...stopSteps]){
  const item=open('week11-read-aloud.html',`day=Monday&step=${steps.indexOf(s)}&stop=${s.stops.length}`);await ready(item.w);item.w.document.getElementById('prev').click();
  const previous=s.vocabulary?steps.findIndex(p=>p.id===s.sourceStep):steps.indexOf(s)-1;checkState(item.w,steps,previous);assert.equal(item.w.document.getElementById('bookImg').getAttribute('src'),steps[previous].img);assert.deepEqual(item.errors,[]);item.w.close();
 }
 const stopIndex=steps.indexOf(stopSteps[3]);
 for(const[rawStep,rawStop,expectedStep,expectedStop]of[['bad','bad',0,0],['-1','-9',0,0],['1.5','0.5',0,0],['Infinity','NaN',0,0],['999','999',23,0],[String(stopIndex),'999',stopIndex,1],[String(stopIndex),'-1',stopIndex,0]]){
  const item=open('week11-read-aloud.html',`day=Monday&step=${rawStep}&stop=${rawStop}`);await ready(item.w);checkState(item.w,steps,expectedStep,expectedStop);const p=new URL(item.w.location.href).searchParams;assert.equal(p.get('step'),String(expectedStep));assert.equal(p.get('stop'),String(expectedStop));assert.equal(item.w.history.length,1);assert.deepEqual(item.errors,[]);item.w.close();
 }
 for(const s of stopSteps)for(const stop of[0,1]){
  const item=await embedded(steps.indexOf(s),stop);checkState(item.cw,steps,steps.indexOf(s),stop);assert.equal(item.cw.document.getElementById('teachingStop').hidden,stop===0);assert.equal(item.cw.document.getElementById('stopText').textContent,stop?s.stops[0]:'');
  for(let n=0;n<3;n++){item.w.dispatchEvent(new item.w.Event('pageshow'));item.frame.dispatchEvent(new item.w.Event('load'));}checkState(item.cw,steps,steps.indexOf(s),stop);assert.deepEqual(item.errors,[]);item.w.close();
 }
 const item=await embedded();assert.equal(item.w.document.querySelectorAll('iframe').length,1);assert.equal(item.cw.document.querySelectorAll('iframe').length,0);
 for(let n=0;n<5;n++){item.w.dispatchEvent(new item.w.Event('pageshow'));item.frame.dispatchEvent(new item.w.Event('load'));}
 for(let n=0;n<3;n++)item.cw.document.getElementById('next').click();checkState(item.cw,steps,3,0);
 item.cw.document.getElementById('next').click();checkState(item.cw,steps,3,1);item.cw.document.getElementById('next').click();checkState(item.cw,steps,4,0);
 const p=new URL(item.w.location.href).searchParams;assert.equal(p.get('week'),'11');assert.equal(p.get('day'),'0');assert.equal(p.get('section'),'0');assert.equal(p.get('step'),'4');assert.equal(p.get('stop'),'0');
 const resume=JSON.parse(item.w.localStorage.getItem('eea-lesson-resume'));assert.equal(resume.week,11);assert.equal(resume.day,0);assert.equal(resume.section,0);assert.deepEqual(item.errors,[]);item.w.close();
 for(const day of['Monday','0']){const valid=open('week11-read-aloud.html','day='+day,true);await ready(valid.w);checkState(valid.w,steps,0);assert.deepEqual(valid.errors,[]);valid.w.close();}
 // Freeze today to Monday: otherwise an invalid-day fallback bug could go
 // unnoticed simply because CI happens to run on a different weekday.
 for(const day of['','Wednesday','Thursday','Friday','2','3','4','5','-1','garbage','NaN','0.5','Monday%20']){
  const invalid=open('week11-read-aloud.html',day?'day='+day:'',true);await until(()=>invalid.w.document.readyState==='complete','Rejected route loaded');assert.equal(typeof invalid.w.EEASectionState,'undefined',`${day||'(missing)'} must not initialize Monday`);assert(!invalid.w.EEAReadAloudPlan);assert(invalid.errors.every(e=>/Not implemented: navigation/.test(e)),invalid.errors.join('\n'));invalid.w.close();
 }
 console.log('All stop/vocabulary Previous returns, malformed routes, stop restoration, repeated notes/preparation, rapid clicks and invalid-day rejection pass');
})().catch(e=>{console.error(e);process.exitCode=1;});
