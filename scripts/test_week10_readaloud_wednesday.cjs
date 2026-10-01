// Source-faithful Wednesday Read 2 and same-day embedded history contract.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'../v6-test'),origin='https://eea.test/v6-test/';
const copy=x=>JSON.parse(JSON.stringify(x));
class Files extends ResourceLoader{fetch(url){return url.startsWith(origin)?Promise.resolve(fs.readFileSync(path.join(root,new URL(url).pathname.slice('/v6-test/'.length)))):null;}}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let n=0;n<200;n++){if(fn())return;await delay(10);}assert.fail('Reader did not initialize');}
function open(file='week10-read-aloud.html',query='day=Wednesday'){const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));return{errors,w:new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:origin+file+'?'+query,runScripts:'dangerously',resources:new Files(),virtualConsole:vc}).window};}
(async()=>{
 const plan=JSON.parse(fs.readFileSync(path.join(root,'week10-read-aloud-wednesday-plan.json')));
 const monday=JSON.parse(fs.readFileSync(path.join(root,'week10-read-aloud-plan.json')));
 const item=open(),w=item.w,d=w.document;await until(()=>w.EEAReadAloudPlan);
 assert.deepEqual(copy(w.EEAReadAloudPlan),plan);assert.equal(plan.day,'Wednesday');
 assert.deepEqual(plan.steps.filter(s=>s.bookPage).map(s=>[s.img,s.printedPages]),monday.steps.filter(s=>s.bookPage).map(s=>[s.img,s.printedPages]),'All 16 unchanged original pages in sequence');
 const stops=plan.steps.filter(s=>s.stops.length);assert.equal(stops.length,0,'Read 3 source does not assign page-specific teaching stops');
 assert.match(plan.read,/Read 3.*Act out/);
 assert.deepEqual(plan.steps.filter(s=>s.kind==='before').map(s=>s.id),['before-act','before-stage','before-pass','before-scenes']);
 assert.match(plan.steps[0].note,/pretend to be characters/);
 assert.match(plan.steps[1].note,/perimeter.*audience.*stage/);
 assert.match(plan.steps[2].prompt,/pass.*gesture/);assert.match(plan.steps[2].note,/shaking their head.*putting up a hand.*crossing hands to shoulders/);
 assert.match(plan.steps[3].note,/Select several scenes.*beginning, middle, end.*does not prescribe/);
 assert.match(plan.steps.find(s=>s.kind==='after').prompt,/What did you think about acting out the story today/);
 assert.equal(plan.steps.at(-1).prompt,'We will act out other stories soon!');
 assert.match(plan.teacherNotes,/SEL7.*APL2.*RL.PK.3/);assert.match(plan.teacherNotes,/successful or challenging.*audience member.*new understandings/);
 assert.equal(plan.steps.filter(s=>s.vocabulary).length,0);
 let count=0;
 for(const [i,step]of plan.steps.entries()){
  assert.equal(w.EEASectionState().step,i);assert.equal(d.getElementById('bookImg').getAttribute('src'),step.img);assert.match(d.getElementById('chip').textContent,/WEDNESDAY/);assert.equal(new URL(w.location.href).searchParams.get('day'),'Wednesday');
  const url=w.location.href,history=w.history.length;for(let n=0;n<3;n++){d.querySelector('#teacherNotes summary').click();d.querySelector('#teacherNotes summary').click();}assert.equal(w.location.href,url);assert.equal(w.history.length,history);
  if(step.stops.length){assert(w.EEASectionState().stopPending);d.getElementById('next').click();assert.equal(w.EEASectionState().step,i);assert.equal(w.EEASectionState().stop,1);assert.equal(d.getElementById('stopText').textContent,step.stops[0]);count++;}
  if(i<plan.steps.length-1)d.getElementById('next').click();
 }
 assert.equal(count,0);assert(w.EEASectionState().atEnd);assert.deepEqual(item.errors,[]);w.close();
 for(const stop of [0,1,999,-1]){
  const index=plan.steps.findIndex(s=>s.id==='book-07'),a=open('lesson-runner-week10.html',`week=10&day=2&section=1&step=${index}&stop=${stop}`),f=a.w.document.getElementById('frame');
  await until(()=>f.contentWindow?.EEAReadAloudPlan);await until(()=>a.w.document.readyState==='complete');
  for(let n=0;n<3;n++){a.w.dispatchEvent(new a.w.Event('pageshow'));f.dispatchEvent(new a.w.Event('load'));}
  assert.equal(f.contentWindow.EEAReadAloudPlan.day,'Wednesday');assert.equal(f.contentWindow.EEASectionState().step,index);assert.equal(f.contentWindow.EEASectionState().stop,0);
  assert.equal(new URL(f.src).searchParams.get('day'),'Wednesday');assert.equal(JSON.parse(a.w.localStorage.getItem('eea-lesson-resume')).day,2);
  f.contentDocument.getElementById('next').click();assert.equal(f.contentWindow.EEASectionState().step,index+1,'Repeated setup does not duplicate handlers');
  assert.equal(new URL(a.w.location.href).searchParams.get('day'),'2');assert.deepEqual(a.errors,[]);a.w.close();
 }
 for(const raw of ['-1','2.5','bad','Infinity','9999']){const a=open('week10-read-aloud.html',`day=Wednesday&step=${raw}&stop=999`);await until(()=>a.w.EEAReadAloudPlan);const expected=raw==='9999'?plan.steps.length-1:0;assert.equal(a.w.EEASectionState().step,expected);assert.equal(new URL(a.w.location.href).searchParams.get('step'),String(expected));assert.equal(a.w.EEASectionState().stop,0);assert.deepEqual(a.errors,[]);a.w.close();}
 console.log('Wednesday source-fidelity, 16 preserved images, teacher-selected acting scenes, voluntary participation, reflection, notes, malformed routes, and embedded restoration pass');
})().catch(e=>{console.error(e);process.exitCode=1;});
