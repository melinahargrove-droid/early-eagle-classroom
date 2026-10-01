// Source-faithful Tuesday Read 2 and same-day embedded history contract.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'../v6-test'),origin='https://eea.test/v6-test/';
const copy=x=>JSON.parse(JSON.stringify(x));
class Files extends ResourceLoader{fetch(url){return url.startsWith(origin)?Promise.resolve(fs.readFileSync(path.join(root,new URL(url).pathname.slice('/v6-test/'.length)))):null;}}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let n=0;n<200;n++){if(fn())return;await delay(10);}assert.fail('Reader did not initialize');}
function open(file='week10-read-aloud.html',query='day=Tuesday'){const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));return{errors,w:new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:origin+file+'?'+query,runScripts:'dangerously',resources:new Files(),virtualConsole:vc}).window};}
(async()=>{
 const plan=JSON.parse(fs.readFileSync(path.join(root,'week10-read-aloud-tuesday-plan.json')));
 const monday=JSON.parse(fs.readFileSync(path.join(root,'week10-read-aloud-plan.json')));
 const item=open(),w=item.w,d=w.document;await until(()=>w.EEAReadAloudPlan);
 assert.deepEqual(copy(w.EEAReadAloudPlan),plan);assert.equal(plan.day,'Tuesday');assert.match(plan.read,/Read 2.*Retelling, sequencing, and summarizing/);
 assert.deepEqual(plan.steps.filter(s=>s.bookPage).map(s=>[s.img,s.printedPages]),monday.steps.filter(s=>s.bookPage).map(s=>[s.img,s.printedPages]),'All 16 unchanged original pages in sequence');
 const stops=plan.steps.filter(s=>s.stops.length);assert.deepEqual(stops.map(s=>s.sourceSlide),[5,7,8,12]);
 for(const [i,re]of [/good friends.*umbrella.*crack/i,/pet club.*arrive/i,/feel.*know/i,/feel.*tell.*smiling/i].entries())assert.match(stops[i].stops[0],re);
 assert.match(stops[0].note,/6–8/);assert.match(stops[3].note,/19–22/);
 assert.equal(plan.steps[0].kind,'before');assert.match(plan.steps[0].note,/remember and retell.*illustrations/);
 const after=plan.steps.filter(s=>s.kind==='after');assert.equal(after.length,2);assert(after.every(s=>s.sourceSlide===12));
 assert.match(after[0].note,/page 22.*self-portraits.*Unit 1/);assert.match(after[0].prompt,/notice/);
 assert.match(after[1].note,/different skin tones.*Week 4.*Skin Tone Color Mixing/);assert.match(after[1].prompt,/all friends/);
 assert.match(plan.teacherNotes,/RL.PK.2.*RL.PK.6.*SL.PK.6.*SEL 5.*SEL 6/);assert.match(plan.teacherNotes,/prompting.*friendship and diversity/);
 assert.match(plan.steps.at(-1).prompt,/tomorrow.*act out/);assert.equal(plan.steps.filter(s=>s.vocabulary).length,0,'Read 1-only vocabulary sequence is not injected into Read 2');
 let count=0;
 for(const [i,step]of plan.steps.entries()){
  assert.equal(w.EEASectionState().step,i);assert.equal(d.getElementById('bookImg').getAttribute('src'),step.img);assert.match(d.getElementById('chip').textContent,/TUESDAY/);assert.equal(new URL(w.location.href).searchParams.get('day'),'Tuesday');
  const url=w.location.href,history=w.history.length;for(let n=0;n<3;n++){d.querySelector('#teacherNotes summary').click();d.querySelector('#teacherNotes summary').click();}assert.equal(w.location.href,url);assert.equal(w.history.length,history);
  if(step.stops.length){assert(w.EEASectionState().stopPending);d.getElementById('next').click();assert.equal(w.EEASectionState().step,i);assert.equal(w.EEASectionState().stop,1);assert.equal(d.getElementById('stopText').textContent,step.stops[0]);count++;}
  if(i<plan.steps.length-1)d.getElementById('next').click();
 }
 assert.equal(count,4);assert(w.EEASectionState().atEnd);assert.deepEqual(item.errors,[]);w.close();
 for(const stop of [0,1,999,-1]){
  const index=plan.steps.indexOf(stops[1]),a=open('lesson-runner-week10.html',`week=10&day=1&section=1&step=${index}&stop=${stop}`),f=a.w.document.getElementById('frame');
  await until(()=>f.contentWindow?.EEAReadAloudPlan);await until(()=>a.w.document.readyState==='complete');
  for(let n=0;n<3;n++){a.w.dispatchEvent(new a.w.Event('pageshow'));f.dispatchEvent(new a.w.Event('load'));}
  assert.equal(f.contentWindow.EEAReadAloudPlan.day,'Tuesday');assert.equal(f.contentWindow.EEASectionState().step,index);assert.equal(f.contentWindow.EEASectionState().stop,Math.min(1,Math.max(0,stop)));
  assert.equal(new URL(f.src).searchParams.get('day'),'Tuesday');assert.equal(JSON.parse(a.w.localStorage.getItem('eea-lesson-resume')).day,1);
  f.contentDocument.getElementById('next').click();assert.equal(f.contentWindow.EEASectionState().step,stop>0?index+1:index,'Repeated setup does not duplicate handlers');
  assert.equal(new URL(a.w.location.href).searchParams.get('day'),'1');assert.deepEqual(a.errors,[]);a.w.close();
 }
 for(const raw of ['-1','2.5','bad','Infinity','9999']){const a=open('week10-read-aloud.html',`day=Tuesday&step=${raw}&stop=999`);await until(()=>a.w.EEAReadAloudPlan);const expected=raw==='9999'?plan.steps.length-1:0;assert.equal(a.w.EEASectionState().step,expected);assert.equal(new URL(a.w.location.href).searchParams.get('step'),String(expected));assert.equal(a.w.EEASectionState().stop,0);assert.deepEqual(a.errors,[]);a.w.close();}
 console.log('Tuesday source-fidelity, 16 preserved images, four teaching stops, skin-tone discussion, notes, malformed routes, and embedded restoration pass');
})().catch(e=>{console.error(e);process.exitCode=1;});
