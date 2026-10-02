// Bounded Monday Unit 2 Week 2 Read Aloud integrity/DOM regression.
// Requires jsdom 26.1.0. Real session-history/layout checks live in the browser test.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'../v6-test');
const origin='https://eea.test/v6-test/';
const assetRoot='assets/focus-3s/unit-2/week-2/strictly-no-elephants/';
// Full-slide derivatives of the verified source deck, including its cover and
// every spread through pages 29–30. Pinning bytes catches accidental cropping,
// redrawing, low-resolution replacement, omission or reordering of the source.
const imageHashes=[
  'bc6cea4e82e00200e04d83716991efb3b0fb690d08bd7968487497181b5ae3e4',
  'd6d84c83d14a950f37900a906e6553456397c331cc21a864f4cb30780010752b',
  '783b7c79d399224453adba1c56e986bd0732f9a16d6aa6a6972106a56da9fd0a',
  '5a9f0d15ae2db491c79e92c16718c36fc59c34a67aeded603493f91615fa8727',
  'eec738ec2639bfd27fd1a3370843d15cedf9223a0e233173944ab1960ece411a',
  'fd83a3fdc23d234eba9b6037910a521785c8a7ef93be257282a25efe78cee73b',
  '0debe806ab958d3829446cb3550b792778852310730402d14ac4b0e8b7ecc331',
  '3e9237d834544c63f346da5a707df0b0041f102ee4abbe5f88afbeae39ec2f67',
  '3b472ded2118290441311dd9c3c20cbac3c8dcb512c4ac5f12f0a2971f1d33dd',
  '46d381e43d827efb0029b1138389ab04dedf01db6f10029e7315fb51207ab80c',
  '7357c1b6c5c79c7fbc96ccbcf06e548677fcfc5cdee62ac120617d6f31e4f529',
  '0303afa60214b459b28b8f88df9a56f75fd6552b362363d1f104c3f10edbf2e2',
  'a0b5c01c2f8059f097dbb4b7e0cdb3c9bd2e0d8d395d992423204ba1ba89726f',
  '15b818d24852cf2bbd47272969f8385d6d45b1221bfe94dbff02e66493af61e4',
  'af061d5dd17ed801dc803bf56c284a473cba473b4eefd26c6cc0c0147e9c3c92',
  '90ab7c989146f387e8635cda68122c902fc1d73df499247684ce17f47852053d'
];
const imageFor=slide=>assetRoot+`slide-${String(slide).padStart(2,'0')}.jpg`;
const copy=value=>JSON.parse(JSON.stringify(value));
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(test,label){for(let i=0;i<200;i++){if(test())return;await delay(10);}assert.fail(label);}
class AppFiles extends ResourceLoader{
  fetch(url){if(!url.startsWith(origin))return null;return Promise.resolve(fs.readFileSync(path.join(root,decodeURIComponent(new URL(url).pathname.slice('/v6-test/'.length)))));}
}
function open(file='week10-read-aloud.html',query='day=Monday'){
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',error=>errors.push(error.message));
  const dom=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:origin+file+'?'+query,runScripts:'dangerously',resources:new AppFiles(),virtualConsole:vc});
  return {w:dom.window,errors};
}
async function ready(w){await until(()=>w.document.readyState==='complete'&&typeof w.EEASectionState==='function'&&w.EEAReadAloudPlan,'Reader initialized');return copy(w.EEAReadAloudPlan.steps||w.EEAReadAloudPlan);}
function jpegSize(bytes){let offset=2;assert.equal(bytes.readUInt16BE(0),0xffd8);while(offset<bytes.length){assert.equal(bytes[offset++],0xff);while(bytes[offset]===0xff)offset++;const marker=bytes[offset++],length=bytes.readUInt16BE(offset);if([0xc0,0xc1,0xc2].includes(marker))return[bytes.readUInt16BE(offset+5),bytes.readUInt16BE(offset+3)];offset+=length;}assert.fail('JPEG frame header');}
function verifyState(w,steps,index){const state=copy(w.EEASectionState());assert.equal(state.index,index);assert.equal(state.step,index);assert.equal(state.total,steps.length);assert.equal(state.atStart,index===0);assert.equal(state.atEnd,index===steps.length-1&&!state.stopPending);assert.equal(!!state.vocabulary,steps[index].kind==='vocabulary');return state;}
(async()=>{
  assert.match(fs.readFileSync(path.join(root,'week10-community.html'),'utf8'), /src="week10-community-v4\.js"/, 'A new script pathname escapes old service-worker JS caches during Monday upgrades');
  assert.equal(fs.readFileSync(path.join(root,'week10-community-v2.js'),'utf8'),fs.readFileSync(path.join(root,'week10-community.js'),'utf8'),'Versioned Community script preserves the approved Monday implementation');
  assert.match(fs.readFileSync(path.join(root,'week10-read-aloud.html'),'utf8'), /src="week10-read-aloud-v3\.js"/, 'Changed reader uses a fresh script pathname');
  for(const [index,expected]of imageHashes.entries()){
    const bytes=fs.readFileSync(path.join(root,imageFor(index+1)));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),expected,`Original slide ${index+1} bytes`);
    assert.deepEqual(jpegSize(bytes),[1920,1080],`Full slide ${index+1} dimensions`);
  }
  const manifest=JSON.parse(fs.readFileSync(path.join(root,assetRoot,'source-manifest.json'),'utf8'));
  assert.equal(manifest.images.length,16);
  assert.deepEqual(manifest.images.map(image=>image.sha256),imageHashes,'Source manifest and pinned derivative hashes agree');
  assert.equal(manifest.sources.adaptedPdfSha256,'acbf8ad960d9aa8edef0b9ee257dd5a9455b267d206f9943580b132854682c97');
  const {w,errors}=open(),d=w.document,steps=await ready(w);
  assert.deepEqual(copy(w.EEAReadAloudPlan),JSON.parse(fs.readFileSync(path.join(root,'week10-read-aloud-plan.json'),'utf8')),'Inspectable plan and actual runtime agree');
  assert(steps.length>16,'Teaching sequence adds guidance to the complete source deck');
  assert.equal(new Set(steps.map(s=>s.id)).size,steps.length,'Stable unique step IDs');
  const book=steps.filter(s=>s.kind==='book');
  const sourceSteps=steps.filter(s=>s.img&&Number.isInteger(s.sourceSlide));
  assert.deepEqual([...new Set(sourceSteps.map(s=>s.sourceSlide))].sort((a,b)=>a-b),Array.from({length:16},(_,i)=>i+1));
  for(const step of sourceSteps)assert.equal(step.img,imageFor(step.sourceSlide),`Original source mapping for ${step.id}`);
  assert.deepEqual(book.map(s=>s.sourceSlide).filter(n=>n>1),Array.from({length:15},(_,i)=>i+2),'Every original book spread is in reading order');
  for(const step of book.filter(s=>s.sourceSlide>1)){
    const first=(step.sourceSlide-2)*2+1;
    assert.equal(step.bookPage,true);assert.deepEqual(step.printedPages,[first,first+1],`Actual page numbers for source slide ${step.sourceSlide}`);
  }
  const stops=steps.flatMap(s=>(s.stops||[]).map(text=>({slide:s.sourceSlide,text})));
  assert.deepEqual(stops.map(s=>s.slide),[4,7,8,8,12,15],'All six separate while-reading teaching stops');
  assert.equal(new Set(stops.map(s=>s.text)).size,6,'Distinct prompts, including both slide 8 stops');
  assert(stops.every(s=>typeof s.text==='string'&&s.text.trim().length>15));
  for(const [index,meaning]of [/thoughtful.*umbrella/i,/coax.*encourage/i,/isn.t allowed.*sad/i,/scared.*brave/i,/self.portraits.*Unit 1/i,/directions.*clubhouse/i].entries())assert.match(stops[index].text,meaning,`Preserved teaching purpose for stop ${index+1}`);
  const vocabulary=steps.filter(s=>s.kind==='vocabulary');
  assert.deepEqual(vocabulary.map(s=>s.word).sort(),['tiny','thoughtful','club','coax','brave','directions','left out'].sort());
  for(const step of vocabulary){assert.equal(step.vocabulary,true);assert(steps.some(s=>s.id===step.sourceStep&&s.sourceSlide===step.sourceSlide),'Vocabulary has its original source context');}
  const before=steps.filter(s=>s.kind==='before'),after=steps.filter(s=>s.kind==='after');
  assert(before.length>=1);assert.match(JSON.stringify(before),/cover/i);assert.match(JSON.stringify(before),/pets/i);assert.match(JSON.stringify(before),/Amy/);
  assert.equal(steps[0].kind,'before');assert(after.length>=1);assert(after.some(s=>s.sourceSlide===9&&/15\s*[–—-]\s*16/.test(s.note)),'After-reading returns to pages 15–16');
  assert.equal(steps.at(-1).kind,'closing');assert.match(JSON.stringify(steps.at(-1)),/tomorrow/i);
  assert.match(d.body.textContent,/Monday/i);assert.match(d.body.textContent,/Strictly No Elephants/i);
  assert.equal(d.querySelectorAll('iframe').length,0);
  for(const id of ['prev','next','backBtn','teacherNotes','bookImg','teachingStop','stopText'])assert(d.getElementById(id),`Public control ${id}`);
  assert(d.querySelector('.stage'));
  assert.deepEqual([...d.querySelectorAll('#teacherNotes a')].map(a=>a.href),[manifest.sources.lesson,manifest.sources.vocabularyCards,manifest.sources.adaptedText]);
  for(const a of d.querySelectorAll('#teacherNotes a')){assert.equal(a.target,'_blank');assert(a.rel.includes('noopener'));}
  const firstURL=w.location.href,historyLength=w.history.length;
  const notes=d.getElementById('teacherNotes');
  const notesToggle=notes.tagName==='DETAILS'?notes.querySelector('summary'):notes;
  for(let repeat=0;repeat<3;repeat++){notesToggle.click();notesToggle.click();}
  assert.equal(w.location.href,firstURL);assert.equal(w.history.length,historyLength);
  // DOM checks traverse real controls. Each prompt must be acknowledged before
  // the source image can change, including the two consecutive slide 8 stops.
  let reachedStops=0;
  for(let index=0;index<steps.length;index++){
    const step=steps[index];verifyState(w,steps,index);
    assert.equal(d.querySelector('.stage').classList.contains('spread'),!!step.bookPage,'Only source book pages use full-spread layout');
    if(step.img)assert.equal(d.getElementById('bookImg').getAttribute('src'),step.img,step.id);
    let guard=0;
    while(w.EEASectionState().stopPending){
      const oldImage=d.getElementById('bookImg').getAttribute('src'),oldIndex=w.EEASectionState().index;
      assert.equal(d.getElementById('teachingStop').hidden,guard===0);
      d.getElementById('next').click();
      assert.equal(d.getElementById('teachingStop').hidden,false);
      assert.equal(d.getElementById('stopText').textContent,step.stops[guard]);
      assert.equal(w.EEASectionState().index,oldIndex,'Acknowledging a stop does not advance source');
      assert.equal(d.getElementById('bookImg').getAttribute('src'),oldImage);
      reachedStops++;assert(++guard<=step.stops.length,'No stop loop or skipped source');
    }
    if(index<steps.length-1)d.getElementById('next').click();
  }
  assert.equal(reachedStops,6);assert(!/Finish Today/.test(d.getElementById('next').textContent));
  assert.deepEqual(errors,[]);w.close();
  console.log('16 source-image hashes/dimensions, every book page, complete lesson content, all vocabulary and six gated stops pass');
  // Vocabulary Previous is semantic: even the second consecutive word attached
  // to slide 8 returns directly to the associated original book image.
  for(const step of vocabulary){
    const item=open('week10-read-aloud.html','day=Monday&step='+steps.indexOf(step));await ready(item.w);
    assert.equal(item.w.EEASectionState().step,steps.indexOf(step));item.w.document.getElementById('prev').click();
    assert.equal(item.w.EEASectionState().step,steps.findIndex(s=>s.id===step.sourceStep),`${step.word}: Previous returns to source`);
    assert.equal(item.w.document.getElementById('bookImg').getAttribute('src'),imageFor(step.sourceSlide));
    assert.deepEqual(item.errors,[]);item.w.close();
  }
  const stopStep=steps.find(s=>(s.stops||[]).length===2);
  for(const [rawStep,rawStop,expectedStep,expectedStop]of [
    ['does-not-exist','not-a-stop',0,0],['-1','-4',0,0],['2.5','1.5',0,0],
    ['Infinity','NaN',0,0],['999999','999',steps.length-1,0],
    [String(steps.indexOf(stopStep)),'999',steps.indexOf(stopStep),2],
    [String(steps.indexOf(stopStep)),'-1',steps.indexOf(stopStep),0]
  ]){
    const item=open('week10-read-aloud.html',`day=Monday&step=${rawStep}&stop=${rawStop}`);await ready(item.w);
    assert.equal(item.w.EEASectionState().index,expectedStep);assert.equal(item.w.EEASectionState().stop,expectedStop);
    const normalized=new URL(item.w.location.href).searchParams;
    assert.equal(normalized.get('step'),String(expectedStep),'Standalone malformed step URL normalizes to rendered state');
    assert.equal(normalized.get('stop'),String(expectedStop),'Standalone malformed stop URL normalizes to rendered state');
    assert.equal(item.w.history.length,1,'Initial route normalization replaces rather than adds history');
    assert.deepEqual(item.errors,[]);item.w.close();
  }
  for(const stop of [0,1,2]){
    const item=open('week10-read-aloud.html',`day=Monday&step=${steps.indexOf(stopStep)}&stop=${stop}`);await ready(item.w);
    assert.equal(item.w.EEASectionState().step,steps.indexOf(stopStep));assert.equal(item.w.EEASectionState().stopPending,stop<2);
    assert.equal(new URL(item.w.location.href).searchParams.get('stop'),String(stop));
    assert.equal(item.w.document.getElementById('teachingStop').hidden,stop===0);
    assert.equal(item.w.document.getElementById('stopText').textContent,stop?stopStep.stops[stop-1]:'');
    assert.deepEqual(item.errors,[]);item.w.close();
    const embeddedStop=open('lesson-runner-week10.html',`week=10&day=0&section=1&step=${steps.indexOf(stopStep)}&stop=${stop}`);
    const f=embeddedStop.w.document.getElementById('frame');
    await until(()=>embeddedStop.w.document.readyState==='complete'&&f.contentDocument?.readyState==='complete'&&typeof f.contentWindow.EEASectionState==='function','Embedded stop restore');
    for(let repeat=0;repeat<3;repeat++)embeddedStop.w.dispatchEvent(new embeddedStop.w.Event('pageshow'));
    assert.equal(f.contentWindow.EEASectionState().step,steps.indexOf(stopStep));assert.equal(f.contentWindow.EEASectionState().stop,stop);
    assert.equal(new URL(embeddedStop.w.location.href).searchParams.get('stop'),String(stop));
    assert.deepEqual(embeddedStop.errors,[]);embeddedStop.w.close();
  }
  const embedded=open('lesson-runner-week10.html','week=10&day=0&section=1');
  const frame=embedded.w.document.getElementById('frame');
  await until(()=>embedded.w.document.readyState==='complete'&&frame.contentDocument?.readyState==='complete'&&typeof frame.contentWindow.EEASectionState==='function','Monday runner Read Aloud ready');
  assert.equal(frame.contentWindow.EEASectionState().step,0);assert.equal(new URL(frame.src).searchParams.get('day'),'Monday');
  for(let repeat=0;repeat<3;repeat++){embedded.w.dispatchEvent(new embedded.w.Event('pageshow'));frame.dispatchEvent(new embedded.w.Event('load'));}
  frame.contentDocument.getElementById('next').click();
  assert.equal(frame.contentWindow.EEASectionState().index,1,'Repeated preparation must not duplicate Next handlers');
  assert.equal(new URL(embedded.w.location.href).searchParams.get('step'),'1');
  assert.equal(JSON.parse(embedded.w.localStorage.getItem('eea-lesson-resume')).day,0);assert.equal(JSON.parse(embedded.w.localStorage.getItem('eea-lesson-resume')).section,1);
  assert.equal(embedded.w.document.querySelectorAll('iframe').length,1);assert.equal(frame.contentDocument.querySelectorAll('iframe').length,0);
  assert.deepEqual(embedded.errors,[]);embedded.w.close();
  console.log('Vocabulary context return, stable deep links, stop restoration, Monday runner resume and idempotent preparation pass');
})().catch(error=>{console.error(error);process.exitCode=1;});
