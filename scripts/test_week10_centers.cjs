// Bounded Monday Unit 2 Week 2 Centers source/DOM/orchestration regression.
// Requires jsdom 26.1.0; actual joint history, image pixels and layout are tested
// in test_week10_centers_browser.cjs. No production code is rewritten for tests.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const {implForWrapper}=require('jsdom/lib/jsdom/living/generated/utils');
const {serializeURL}=require('whatwg-url');
const root=path.resolve(__dirname,'../v6-test'),origin='https://eea.test/v6-test/';
const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
const titles=['Nature Arrangements','Building Autumn Trees 2'];
const sources=['https://drive.google.com/file/d/1O0tu19Bq53aaPOBqYFkG9KynYpNwMsr8/view','https://drive.google.com/file/d/1-Lpb1glogfAFzgKNLbZX1Kkq3OflK90m/view'];
const digest=v=>crypto.createHash('sha256').update(v).digest('hex');
const copy=v=>JSON.parse(JSON.stringify(v));
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const dateKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
async function until(check,label){for(let i=0;i<200;i++){if(check())return;await delay(10);}assert.fail(label);}
class AppFiles extends ResourceLoader{
 fetch(url){if(!url.startsWith(origin))return null;return Promise.resolve(fs.readFileSync(path.join(root,decodeURIComponent(new URL(url).pathname.slice('/v6-test/'.length)))));}
}
function open(file='week10-centers.html',query='day=Monday&step=0',storage={}){
 const errors=[],navigations=[],vc=new VirtualConsole();vc.on('jsdomError',error=>errors.push(error.message));
 const w=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:origin+file+'?'+query,runScripts:'dangerously',resources:new AppFiles(),virtualConsole:vc,beforeParse(w){
  for(const[k,v]of Object.entries(storage))w.localStorage.setItem(k,v);
  // Observe JSDOM's real navigation implementation. Iframe-local navigation
  // stays unmocked and would produce a collected not-implemented error.
  implForWrapper(w.location)._locationObjectNavigate=url=>navigations.push(serializeURL(url));
 }}).window;
 return{w,errors,navigations};
}
async function ready(a){let w=a.w;if(w.document.getElementById('frame')){const f=w.document.getElementById('frame');await until(()=>w.document.readyState==='complete'&&f.contentDocument?.readyState==='complete'&&typeof f.contentWindow.EEASectionState==='function','Embedded section initialized');w=f.contentWindow;}else await until(()=>w.document.readyState==='complete'&&typeof w.EEASectionState==='function','Standalone Centers initialized');return w;}
function clean(a){assert.deepEqual(a.errors,[]);a.w.close();}
function destination(a,file,day,section){assert.equal(a.navigations.length,1,'Exactly one top-level navigation');const u=new URL(a.navigations[0]);assert.equal(u.pathname,'/v6-test/'+file);assert.equal(u.searchParams.get('week'),'10');assert.equal(u.searchParams.get('day'),String(day));if(section!==undefined)assert.equal(u.searchParams.get('section'),String(section));}
function verify(w,index){
 const d=w.document,notes=d.querySelector('.community-notes'),plan=JSON.parse(fs.readFileSync(path.join(root,'week10-centers-monday-plan.json'),'utf8'));
 assert.equal(plan.length,2);assert.deepEqual(copy(w.EEACentersPlan),plan,'Inspectable plan is identical to the actual runtime');
 assert.equal(d.querySelector('.lead').textContent,plan[index].lead);
 assert.equal(d.querySelector('.lesson-img').getAttribute('src'),plan[index].img);
 assert.equal(d.querySelector('.lesson-img').alt,plan[index].alt);
 assert.deepEqual([...notes.querySelectorAll('.community-notes-content > h3')].map(e=>e.textContent),[...plan[index].notes.map(n=>n[0]),'Source materials']);
 assert.deepEqual([...notes.querySelectorAll('.community-notes-content > p')].slice(0,-1).map(e=>e.textContent),plan[index].notes.flatMap(n=>n[1]),'Every source paragraph is preserved in Teacher Notes');
 assert.deepEqual(copy(w.EEASectionState()),{step:index,index,total:2,atStart:index===0,atEnd:index===1});
 assert.equal(d.querySelectorAll('.community-card').length,1,'One center is visible at a time');
 assert.equal(d.querySelector('.community-copy h2').textContent,titles[index]);
 assert.equal(d.querySelectorAll('iframe,select,#activityMenu').length,0);
 assert(notes);assert.equal(notes.open,false,'Notes start collapsed on each center');
 assert.match(d.getElementById('count').textContent,new RegExp(`${index+1}\\s*(?:of|/)\\s*2`));
 const img=d.querySelector('.lesson-img');assert(img);assert(img.getAttribute('src'));assert(img.alt.trim().length>12);
 assert(fs.existsSync(path.join(root,img.getAttribute('src'))),'Local visual asset exists');
 const copyText=d.querySelector('.community-copy').textContent;
 const patterns=index===0?[/arrange/i,/autumn/i,/rough/i,/smooth/i,/texture/i,/photograph/i,/pinecones/i,/sticks/i,/tray/i,/cardboard/i,/week/i,/collaborat|together|shared/i,/book/i,/library/i,/more/i,/fewer|less/i,/outside/i,/SEL7/i,/APL4/i,/L\.PK\.5c/i,/PK\.CC\.C\.5/i]:[/autumn/i,/branch/i,/paper towel|recycl/i,/acorns/i,/rocks/i,/leaves/i,/tape/i,/photograph/i,/basket|bowl|tray/i,/creators|children.*share|share.*construction/i,/label/i,/color names/i,/RI\.PreK\.7/i,/PreK-PS1-4/i,/SEL7/i,/APL4/i,/MD\.A\.1/i];
 for(const pattern of patterns)assert.match(copyText,pattern,`${titles[index]} preserves ${pattern}`);
 assert.match(notes.textContent,/Boston Public Schools/i);
 assert([...notes.querySelectorAll('a')].some(a=>a.href===sources[index]),'Original linked lesson is accessible in Teacher Notes');
 for(const a of notes.querySelectorAll('a')){assert.equal(a.target,'_blank');assert(a.rel.includes('noopener'));}
 assert.equal(d.getElementById('exit').getAttribute('aria-label'),'Return to Day Overview');
 assert(!/Finish Today/.test(d.body.textContent),'A bounded Centers chunk does not claim the whole day is ready');
 const state=copy(w.EEASectionState()),url=w.location.href,h=w.history.length;
 for(let n=0;n<4;n++){notes.querySelector('summary').click();assert(notes.open);notes.querySelector('summary').click();assert(!notes.open);}
 assert.deepEqual(copy(w.EEASectionState()),state);assert.equal(w.location.href,url);assert.equal(w.history.length,h);
}
(async()=>{
 const provenance=fs.readFileSync(path.join(root,'assets/focus-3s/unit-2/week-2/centers/SOURCE.md'),'utf8');
 for(const source of sources)assert(provenance.includes(source));
 assert.match(provenance,/teacher-held/);assert.match(provenance,/illustrations/);assert.match(provenance,/linked, not bundled/);
 for(const [file,hash]of [['nature-arrangements.png','3a0cbec2a70c364fd1c535bd4d46c671868997aab7f7547f8790aea703f63a4e'],['building-autumn-trees.png','515a8eb986c86278fa2d942a4607d940145e93335cc6eb1b305745e76a6a8e6d']]){const bytes=fs.readFileSync(path.join(root,'assets/focus-3s/unit-2/week-1/centers',file));assert.equal(digest(bytes),hash,'Approved reused illustration bytes stay unchanged');assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[1254,1254]);assert(provenance.includes(hash));}
 const html=fs.readFileSync(path.join(root,'week10-centers.html'),'utf8');
 assert.match(html,/src="week10-centers-v5\.js"/);
 assert.match(fs.readFileSync(path.join(root,'week10-read-aloud.html'),'utf8'),/src="week10-read-aloud-v9\.js"/,'Fresh reader pathname escapes ignoreSearch caches');
 assert.equal(digest(fs.readFileSync(path.join(root,'week10-read-aloud-v4.js'))),'8f4023cb9eade4346b3f24b9c28f7b7efbfb72777317c91d32c72c3e7fe3f828','Prior deployed v4 reader remains an exact stale-cache fixture');
 const unchanged=[];
 for(let week=1;week<=11;week++)for(let day=0;day<5;day++){
  const a=open('daily-lessons.html',`week=${week}&day=${day}`),d=a.w.document;
  const snapshot={week,day,eyebrow:d.getElementById('eyebrow').textContent,title:d.getElementById('title').textContent,path:d.getElementById('path').outerHTML,note:d.getElementById('note').textContent,start:d.getElementById('start').textContent,disabled:d.getElementById('start').disabled,weekButtons:[...d.querySelectorAll('#weeknav button')].map(b=>[b.textContent,b.className])};
  if(week!==10)unchanged.push(snapshot);else if(day===0){
   assert.equal(d.querySelectorAll('#path .step').length,3);assert.deepEqual([...d.querySelectorAll('#path .step b')].map(e=>e.textContent),['Community Meeting','Read Aloud','Centers']);
   const card=d.querySelectorAll('#path .step')[2];assert.equal(card.dataset.section,'2');assert.equal(card.getAttribute('role'),'button');assert.equal(card.tabIndex,0);assert.match(card.textContent,/Nature Arrangements/);assert.match(card.textContent,/Building Autumn Trees 2/);
   assert.equal(d.getElementById('start').textContent,'Open Community Meeting →');assert.equal(d.getElementById('start').disabled,false);
  }clean(a);
 }
 // Pinned from pre-Friday HEAD, excluding only the five built Week 10 Centers overviews.
 assert.equal(digest(JSON.stringify(unchanged)),'9b4b4ac416bead4e11efda438c98a0ef1dfbd05e529136462276c0ef2ab736ea','All 50 unaffected week/day overview cards, readiness, labels, notices and layout remain byte-for-byte unchanged');
 for(const trigger of ['card','Enter',' ']){const a=open('daily-lessons.html','week=10&day=0'),card=a.w.document.querySelectorAll('#path .step')[2];if(trigger==='card')card.click();else card.dispatchEvent(new a.w.KeyboardEvent('keydown',{key:trigger,bubbles:true}));destination(a,'lesson-runner-week10.html',0,2);clean(a);}
 for(const[query,storage,expected]of [['',{'eea-curriculum-pace':JSON.stringify({startDate:'2020-01-06',mode:'calendar'})},9],['week=10',{},10],['week=11',{},11]]){const a=open('daily-lessons.html',query,storage);assert.equal(a.w.document.querySelector('#weeknav .active').dataset.week,String(expected));clean(a);}
 console.log('Monday third-card mouse/keyboard entry and all 50 unaffected overviews/pacing cap9 pass');
 for(const file of ['week10-centers.html','lesson-runner-week10.html'])for(const[raw,index]of [['0',0],['1',1],['999',1],['-1',0],['bad',0],['1.5',0],['Infinity',0]]){
  const embedded=file.startsWith('lesson-runner'),a=open(file,`week=10&day=${embedded?'0':'Monday'}&section=2&step=${raw}&stop=3&book=red-dragon`),w=await ready(a);verify(w,index);
  assert.equal(new URL(a.w.location.href).searchParams.get('step'),String(index));assert.equal(a.w.history.length,1,'Initial route normalization replaces rather than pushes');
  if(embedded){assert.equal(new URL(a.w.location.href).searchParams.has('stop'),false);assert.equal(new URL(a.w.location.href).searchParams.has('book'),false);assert.deepEqual(JSON.parse(a.w.localStorage.getItem('eea-lesson-resume')),{date:dateKey(),week:10,day:0,section:2});assert.equal(a.w.document.querySelectorAll('iframe').length,1);assert.equal(w.document.querySelectorAll('iframe').length,0);}
  clean(a);
 }
 for(const embedded of [false,true]){
  const a=open(embedded?'lesson-runner-week10.html':'week10-centers.html',`week=10&day=${embedded?'0':'Monday'}&section=2&step=0`),w=await ready(a),d=w.document,history=a.w.history.length,childHistory=w.history.length;
  if(embedded){const f=a.w.document.getElementById('frame');for(let n=0;n<4;n++){a.w.dispatchEvent(new a.w.Event('pageshow'));f.dispatchEvent(new a.w.Event('load'));}}
  assert.equal(a.w.history.length,history);d.getElementById('done').click();verify(w,1);assert.equal(a.w.history.length,history+1);if(embedded)assert.equal(w.history.length,childHistory,'Iframe never pushes duplicate history');
  a.w.history.back();await until(()=>w.EEASectionState().step===0,'Back restores first Center');verify(w,0);
  a.w.history.forward();await until(()=>w.EEASectionState().step===1,'Forward restores second Center');verify(w,1);
  d.getElementById('prev').click();verify(w,0);assert.deepEqual(a.navigations,[],'Internal Previous remains inside Centers');
  d.getElementById('done').click();verify(w,1);a.w.localStorage.setItem('eea-lesson-auto-resume',dateKey());d.getElementById('done').click();destination(a,'daily-lessons.html',0);assert.equal(a.w.localStorage.getItem('eea-lesson-auto-resume'),null);clean(a);
 }
 for(const embedded of[false,true])for(const[index,button,file,section]of [[0,'prev','lesson-runner-week10.html',1],[0,'exit','daily-lessons.html'],[1,'exit','daily-lessons.html']]){
  const a=open(embedded?'lesson-runner-week10.html':'week10-centers.html',`week=10&day=${embedded?'0':'Monday'}&section=2&step=${index}`),w=await ready(a);a.w.localStorage.setItem('eea-lesson-auto-resume',dateKey());w.document.getElementById(button).click();destination(a,file,0,section);if(file==='daily-lessons.html')assert.equal(a.w.localStorage.getItem('eea-lesson-auto-resume'),null);clean(a);
 }
 console.log('Both centers preserve linked content, repeated notes, restore/normalization, one-entry parent history and every section boundary');
 for(const embedded of [false,true]){
  const a=open(embedded?'lesson-runner-week10.html':'week10-centers.html',`week=10&day=${embedded?4:'Friday'}&section=2&step=4&book=red-dragon&stop=2`),w=await ready(a),d=w.document;
  assert.match(w.location.pathname,/week10-centers\.html$/);assert.equal(d.getElementById('center-choice').value,'','Friday requires an explicit teacher choice');assert.equal(d.querySelectorAll('#center-choice option').length,8);assert.equal(d.querySelectorAll('.community-card').length,0);
  assert.deepEqual(copy(w.EEASectionState()),{step:0,index:0,total:0,atStart:true,atEnd:true,center:null,review:false});assert.deepEqual(a.navigations,[]);
  if(embedded){const p=new URL(a.w.location.href).searchParams;assert.equal(p.get('section'),'2');assert.equal(p.get('day'),'4');assert.equal(p.get('step'),'0');for(const key of ['book','stop','center','review'])assert.equal(p.has(key),false);}clean(a);
 }

 for(let day=0;day<5;day++){
  const a=open('week10-read-aloud.html',`day=${days[day]}&step=999999`),w=await ready(a);assert.equal(w.EEASectionState().atEnd,true);w.document.getElementById('next').click();destination(a,'lesson-runner-week10.html',day,2);clean(a);
 }
 console.log('All five reader completions hand off to same-day Centers; Friday opens with no default selection');
})().catch(error=>{console.error(error);process.exitCode=1;});
