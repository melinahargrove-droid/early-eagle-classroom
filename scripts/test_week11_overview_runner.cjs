// Bounded Unit 2 Week 3 overview and orchestration regression (jsdom 26.1.0).
// The small protocol fixture deliberately has no curriculum: reader content and
// real joint-session history/layout are covered by the Week11 reader tests.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const {implForWrapper}=require('jsdom/lib/jsdom/living/generated/utils');
const {serializeURL}=require('whatwg-url');
const root=path.resolve(__dirname,'../v6-test'),origin='https://eea.test/v6-test/';
const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
const dateKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const copy=value=>JSON.parse(JSON.stringify(value));
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check,label){for(let i=0;i<150;i++){if(check())return;await delay(10);}assert.fail(label);}
const fixture=`<!doctype html><html><body>
<button id="prev">Previous</button><button id="next">Next</button><button id="backBtn">Close</button>
<script>(()=>{
  let index=0,stop=0;const stops=[0,2,0,1];
  const clamp=(n,max)=>Math.max(0,Math.min(max,Number.isInteger(Number(n))?Number(n):0));
  window.EEAReadAloudRestore=(step,value)=>{index=clamp(step,3);stop=clamp(value,stops[index]);};
  window.EEASectionState=()=>({index,step:index,stop,total:4,atStart:index===0,atEnd:index===3&&stop===1,stopPending:stop<stops[index]});
  const route=(step,value)=>parent.EEAReadAloudNavigate(step,value);
  document.getElementById('prev').onclick=()=>index?route(index===2?1:index-1,0):parent.EEAWeek11Overview();
  document.getElementById('backBtn').onclick=()=>parent.EEAWeek11Overview();
  document.getElementById('next').onclick=()=>stop<stops[index]?route(index,stop+1):index<3?route(index+1,0):parent.EEAWeek11CompleteReadAloud();
  const p=new URLSearchParams(location.search);parent.EEAReadAloudNavigate(p.get('step'),p.get('stop'),true);
})();</script></body></html>`;
class ProtocolReader extends ResourceLoader{
  constructor(){super();this.requests=[];}
  fetch(url){this.requests.push(url);assert.equal(new URL(url).pathname,'/v6-test/week11-read-aloud.html','Runner loads only the Week11 reader');return Promise.resolve(Buffer.from(fixture));}
}
function open(file,query='',storage={}){
  const errors=[],navigations=[],loader=new ProtocolReader(),vc=new VirtualConsole();
  vc.on('jsdomError',error=>errors.push(error.message));
  const w=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{
    url:origin+file+'?'+query,runScripts:'dangerously',resources:loader,virtualConsole:vc,
    beforeParse(w){
      for(const [key,value]of Object.entries(storage))w.localStorage.setItem(key,value);
      // jsdom cannot perform full-page navigation. Observe its actual location
      // implementation instead of rewriting production scripts; iframe-local
      // navigations remain unmocked and fail through the error collector.
      implForWrapper(w.location)._locationObjectNavigate=url=>navigations.push(serializeURL(url));
    }
  }).window;
  return {w,errors,navigations,loader};
}
async function ready(a){const f=a.w.document.getElementById('frame');await until(()=>a.w.document.readyState==='complete'&&f.contentDocument?.readyState==='complete'&&typeof f.contentWindow.EEASectionState==='function','Runner protocol reader ready');return f;}
function clean(a){assert.deepEqual(a.errors,[]);a.w.close();}
function destination(a,pathname,day,section){
  assert.equal(a.navigations.length,1,'Exactly one top-level navigation');const u=new URL(a.navigations[0]);
  assert.equal(u.pathname,'/v6-test/'+pathname);assert.equal(u.searchParams.get('week'),'11');assert.equal(u.searchParams.get('day'),String(day));
  if(section!==undefined)assert.equal(u.searchParams.get('section'),String(section));
}
(async()=>{
  const prior=[];
  for(let week=1;week<=10;week++)for(let day=0;day<5;day++){
    const a=open('daily-lessons.html',`week=${week}&day=${day}`),d=a.w.document;
    if(week!==10||(day!==2&&day!==3&&day!==4))prior.push({week,day,eyebrow:d.getElementById('eyebrow').textContent,title:d.getElementById('title').textContent,path:d.getElementById('path').outerHTML,note:d.getElementById('note').textContent,start:d.getElementById('start').textContent,weekButtons:[...d.querySelectorAll('#weeknav button')].slice(0,10).map(b=>[b.textContent,b.className])});
    assert.equal(d.getElementById('start').disabled,false);clean(a);
  }
  // Pinned from pre-Friday HEAD, excluding only Wednesday/Thursday/Friday changed overviews.
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(prior)).digest('hex'),'e81b00541d03a05b2d2930bf3fbd55ea9417cf996199e77b883059be2f9e8e94','All 47 unaffected Week1–10 overview card sets, including the approved Monday/Tuesday Centers cards, labels, layout classes and notice/start text stay intact');
  for(let day=0;day<5;day++){
    const a=open('daily-lessons.html',`week=11&day=${day}`),d=a.w.document;
    assert.equal(d.querySelectorAll('#weeknav button').length,12);assert.equal(d.querySelector('[data-week="11"]').textContent,'U2 · W3');
    assert.equal(d.getElementById('eyebrow').textContent,`UNIT 2 · WEEK 3 · ${days[day].toUpperCase()}`);
    assert.equal(d.getElementById('title').textContent,`${days[day]}’s Lessons`);
    assert.equal(d.querySelectorAll('#path .step').length,day<2?3:2);
    assert.equal(d.getElementById('start').disabled,false);
    assert.match(d.getElementById('note').textContent,/still being prepared/);
    assert.equal(d.querySelector('#path .step b').textContent,'Community Meeting');
    assert.equal(d.querySelector('#path .step span').textContent,day%2===0?'Boat Pose':'Square Breathing');
    assert.equal(d.querySelector('#path .step').dataset.section,'0');assert.equal(d.querySelector('#path .step').getAttribute('role'),'button');assert.equal(d.querySelector('#path .step').tabIndex,0);
    assert.equal(d.getElementById('start').textContent,'Open Community Meeting →');
    assert.equal(a.w.localStorage.getItem('eea-daily-week'),'11');assert.equal(a.w.localStorage.getItem('eea-daily-day'),String(day));clean(a);
  }
  for(const day of [0,1,2,3,4])for(const trigger of ['card','start','Enter',' ']){
    const a=open('daily-lessons.html',`week=11&day=${day}`),d=a.w.document;
    if(trigger==='start')d.getElementById('start').click();else if(trigger==='card')d.querySelector('#path .step').click();else d.querySelector('#path .step').dispatchEvent(new a.w.KeyboardEvent('keydown',{key:trigger,bubbles:true}));
    destination(a,'lesson-runner-week11.html',day,2);clean(a);
  }
  for(const [query,storage,expected]of [
    ['',{'eea-curriculum-pace':JSON.stringify({startDate:'2020-01-06',mode:'calendar'})},9],
    ['week=11',{'eea-curriculum-pace':JSON.stringify({startDate:'2020-01-06',mode:'calendar'})},11],
    ['',{'eea-daily-week':'11'},11],['week=12',{},12],['week=NaN',{'eea-daily-week':'12'},12],['week=13',{},1]
  ]){const a=open('daily-lessons.html',query,storage);assert.equal(a.w.document.querySelector('#weeknav .active').dataset.week,String(expected));clean(a);}
  const switches=open('daily-lessons.html','week=10&day=3'),d=switches.w.document;
  d.querySelector('[data-week="11"]').click();assert.equal(new URL(switches.w.location.href).searchParams.get('day'),'3');assert.equal(d.getElementById('start').disabled,false);
  for(const day of [0,1,2,3,4,0]){d.querySelector(`[data-i="${day}"]`).click();assert.equal(new URL(switches.w.location.href).searchParams.get('week'),'11');assert.equal(new URL(switches.w.location.href).searchParams.get('day'),String(day));assert.equal(d.getElementById('start').disabled,false);}
  d.querySelector('[data-week="10"]').click();assert.equal(d.getElementById('start').disabled,false);assert.equal(d.getElementById('start').textContent,'Open Community Meeting →');clean(switches);
  for(let day=0;day<5;day++){
    const resume=JSON.stringify({date:dateKey(),week:11,day,section:0});
    const a=open('daily-lessons.html',`week=11&day=${day}`,{'eea-lesson-resume':resume,'eea-lesson-auto-resume':dateKey()});
    assert.equal(a.w.localStorage.getItem('eea-lesson-resume'),resume,'No Week9 migration or rewrite touches the new week');
    if(day<2)destination(a,'lesson-runner-week11.html',day,0);else assert.deepEqual(a.navigations,[],'Unavailable reader section cannot auto-resume into Monday');clean(a);
  }
  for(const day of [2,3,4])for(const section of [1,'1',0,2,-1,'bad']){
    const a=open('daily-lessons.html',`week=11&day=${day}`,{'eea-lesson-resume':JSON.stringify({date:dateKey(),week:11,day,section}),'eea-lesson-auto-resume':dateKey()});
    if(section===1||section==='1'||section===2)destination(a,'lesson-runner-week11.html',day,Number(section));else assert.deepEqual(a.navigations,[],'Only available Centers section1 is resumable on '+days[day]);clean(a);
  }
  console.log('All 55 overviews, Week1–10 snapshot, all-week mouse/keyboard/start launch, unavailable readers, manual cap12 and unchanged automatic cap9 pass');
  for(let day=2;day<5;day++)for(const raw of [day,days[day]]){
    const a=open('lesson-runner-week11.html',`week=1&day=${raw}&section=0&step=7`);destination(a,'daily-lessons.html',day);assert.deepEqual(a.loader.requests,[],'Unavailable reader section never loads a substitute reader');clean(a);
  }
  for(const raw of ['-1','5','2.5','NaN','Infinity','Sunday','',null]){
    const a=open('lesson-runner-week11.html',raw===null?'week=11&section=0':`week=11&day=${raw}&section=0`),weekday=new Date().getDay(),today=weekday===0||weekday===6?4:weekday-1;
    destination(a,'daily-lessons.html',today);assert.deepEqual(a.loader.requests,[]);clean(a);
  }
  for(const section of ['3','-1','999','2.5','NaN','Infinity','']){
    const a=open('lesson-runner-week11.html',`day=Monday&section=${section}&step=7`);destination(a,'daily-lessons.html',0);assert.deepEqual(a.loader.requests,[]);clean(a);
  }
  for(const day of [0,1])for(const [rawStep,rawStop,step,stop]of [['0','0',0,0],['bad','bad',0,0],['-1','-1',0,0],['1.5','2.5',0,0],['Infinity','NaN',0,0],['999','999',3,1],['1','999',1,2],['1','1',1,1]]){
    const a=open('lesson-runner-week11.html',`week=1&day=${days[day]}&section=0&book=unrelated&step=${rawStep}&stop=${rawStop}`),f=await ready(a),p=new URL(a.w.location.href).searchParams,c=new URL(f.contentWindow.location.href).searchParams;
    assert.equal(p.get('week'),'11');assert.equal(p.get('day'),String(day));assert.equal(p.get('section'),'0');assert.equal(p.has('book'),false);
    assert.equal(p.get('step'),String(step));assert.equal(p.get('stop'),String(stop));assert.equal(c.get('step'),String(step));assert.equal(c.get('stop'),String(stop));
    assert.equal(c.get('day'),days[day]);assert.equal(c.get('from'),'runner');assert.equal(c.get('week'),'11');assert.equal(c.get('section'),'0');
    assert.deepEqual(copy(f.contentWindow.EEASectionState()),{index:step,step,stop,total:4,atStart:step===0,atEnd:step===3&&stop===1,stopPending:stop<[0,2,0,1][step]});
    assert.deepEqual(JSON.parse(a.w.localStorage.getItem('eea-lesson-resume')),{date:dateKey(),week:11,day,section:0});assert.deepEqual(a.navigations,[]);clean(a);
  }
  for(const day of [0,1]){
  const a=open('lesson-runner-week11.html',`week=11&day=${day}&section=0`),f=await ready(a),c=f.contentWindow,doc=c.document,h=a.w.history.length,ch=c.history.length;
  for(let i=0;i<4;i++){a.w.dispatchEvent(new a.w.Event('pageshow'));f.dispatchEvent(new a.w.Event('load'));}
  assert.equal(a.w.history.length,h);doc.getElementById('next').click();assert.equal(c.EEASectionState().step,1);assert.equal(a.w.history.length,h+1);
  doc.getElementById('next').click();assert.equal(c.EEASectionState().stop,1);assert.equal(a.w.history.length,h+2);
  doc.getElementById('next').click();assert.equal(c.EEASectionState().stop,2);assert.equal(a.w.history.length,h+3);
  doc.getElementById('next').click();assert.equal(c.EEASectionState().step,2);assert.equal(a.w.history.length,h+4);assert.equal(c.history.length,ch,'Iframe never pushes a second history entry');
  a.w.history.back();await until(()=>c.EEASectionState().step===1&&c.EEASectionState().stop===2,'Back restores the prior teaching-stop position');
  a.w.history.forward();await until(()=>c.EEASectionState().step===2,'Forward restores the vocabulary position');
  doc.getElementById('prev').click();assert.equal(c.EEASectionState().step,1);assert.equal(c.EEASectionState().stop,0);assert.deepEqual(a.navigations,[],'Previous from an internal screen stays in the reader');
  a.w.EEAWeek11CompleteReadAloud();assert.deepEqual(a.navigations,[],'Completion callback cannot skip unfinished content');
  a.w.EEAReadAloudNavigate(3,0);doc.getElementById('next').click();assert.equal(c.EEASectionState().stop,1);assert.deepEqual(a.navigations,[],'A final teaching stop must be shown before exit');
  a.w.localStorage.setItem('eea-lesson-auto-resume',dateKey());doc.getElementById('next').click();destination(a,'lesson-runner-week11.html',day,1);clean(a);
  }
  for(const day of [0,1])for(const [id,step,stop]of [['prev',0,0],['backBtn',1,1],['callback',3,1]]){
    const a=open('lesson-runner-week11.html',`day=${day}&section=0&step=${step}&stop=${stop}`,{'eea-lesson-auto-resume':dateKey()}),f=await ready(a);
    if(id==='callback')a.w.EEAWeek11CompleteReadAloud();else f.contentDocument.getElementById(id).click();
    destination(a,id==='callback'?'lesson-runner-week11.html':'daily-lessons.html',day,id==='callback'?1:undefined);if(id!=='callback')assert.equal(a.w.localStorage.getItem('eea-lesson-auto-resume'),null);assert.equal(JSON.parse(a.w.localStorage.getItem('eea-lesson-resume')).week,11);clean(a);
  }
  console.log('Unavailable/invalid routes, exact weekdays, deep-link normalization, stop gating, idempotent setup, parent-owned history, Previous/X/Finish and resume isolation pass');
})().catch(error=>{console.error(error);process.exitCode=1;});
