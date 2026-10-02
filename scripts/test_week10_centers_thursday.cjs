// Thursday Unit 2 Week 2 Centers: independent source/byte fixtures and DOM flows.
// Native dialog focus, layout, actual image loads and joint-session history are
// verified separately by test_week10_centers_thursday_browser.cjs.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const {implForWrapper}=require('jsdom/lib/jsdom/living/generated/utils');
const {serializeURL}=require('whatwg-url');
const root=path.resolve(__dirname,'../v6-test'),origin='https://eea.test/v6-test/';
const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
const titles=['Class Soup'];
const plan=JSON.parse(fs.readFileSync(path.join(root,'week10-centers-thursday-plan.json'),'utf8'));
const copy=v=>JSON.parse(JSON.stringify(v));
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const dateKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
async function until(check,label){for(let n=0;n<200;n++){if(check())return;await delay(10);}assert.fail(label);}
class Files extends ResourceLoader{fetch(url){return url.startsWith(origin)?Promise.resolve(fs.readFileSync(path.join(root,decodeURIComponent(new URL(url).pathname.slice('/v6-test/'.length))))):null;}}
function open(file='week10-centers.html',query='day=Thursday&step=0',storage={}){
 const errors=[],navigations=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:origin+file+'?'+query,runScripts:'dangerously',resources:new Files(),virtualConsole:vc,beforeParse(w){
  for(const[k,v]of Object.entries(storage))w.localStorage.setItem(k,v);
  implForWrapper(w.location)._locationObjectNavigate=url=>navigations.push(serializeURL(url));
 }}).window;return{w,errors,navigations};
}
async function ready(a){let w=a.w;const frame=w.document.getElementById('frame');await until(()=>a.w.document.readyState==='complete'&&(!frame||frame.contentDocument?.readyState==='complete'),'Document initialized');if(frame)w=frame.contentWindow;await until(()=>typeof w.EEASectionState==='function','Section initialized');return w;}
function close(a){assert.deepEqual(a.errors,[]);a.w.close();}
function destination(a,file,day=3,section){assert.equal(a.navigations.length,1,'Exactly one top-level exit');const p=new URL(a.navigations[0]);assert.equal(p.pathname,'/v6-test/'+file);assert.equal(p.searchParams.get('week'),'10');assert.equal(p.searchParams.get('day'),String(day));if(section!==undefined)assert.equal(p.searchParams.get('section'),String(section));}
function route(embedded,index){return `week=10&day=${embedded?'3':'Thursday'}&section=2&step=${index}`;}
function assertPage(w,index){
 const d=w.document,s=plan[index],notes=d.querySelector('.community-notes');assert.deepEqual(copy(w.EEACentersPlan),plan,'Runtime and inspectable plan match exactly');
 assert.deepEqual(copy(w.EEASectionState()),{step:index,index,total:1,atStart:true,atEnd:true});
 assert.equal(d.querySelector('.community-copy h2').textContent,titles[index]);assert.equal(d.querySelector('.lead').textContent,s.lead);assert.equal(d.querySelector('.lesson-img').getAttribute('src'),s.img);assert.equal(d.querySelector('.lesson-img').alt,s.alt);
 assert.equal(d.querySelectorAll('.community-card').length,1);assert.equal(d.querySelectorAll('iframe,select,#activityMenu').length,0);assert.equal(d.getElementById('count').textContent,'1 of 1');assert.equal(notes.open,false);
 assert.deepEqual([...notes.querySelectorAll('.community-notes-content > h3')].map(e=>e.textContent),[...s.notes.map(n=>n[0]),'Source materials']);
 assert.deepEqual([...notes.querySelectorAll('.community-notes-content > p')].slice(0,-1).map(e=>e.textContent),s.notes.flatMap(n=>n[1]),'Every source paragraph is present in Teacher Notes');
 assert.deepEqual([...notes.querySelectorAll('a')].map(e=>e.href),[...s.links.map(x=>x[1]),s.source,'https://docs.google.com/document/d/1lYe4_XN0sIUJeeEt2kbxzxtzqkteNSX9woHXpfXlb7Y/edit']);
 for(const link of notes.querySelectorAll('a')){assert.equal(link.target,'_blank');assert(link.rel.includes('noopener'));}
 assert.equal(d.querySelectorAll('.enlarge-image').length,1);assert.equal(d.querySelector('.enlarge-image').textContent,'Enlarge image');assert.match(d.getElementById('sub').textContent,/Thursday/);assert.equal(d.getElementById('exit').getAttribute('aria-label'),'Return to Day Overview');assert(!/Finish Today|Friday/.test(d.body.textContent));assert.equal(d.getElementById('prev').textContent,'← Read Aloud');assert.equal(d.getElementById('done').textContent,'Finish Centers →');
 const state=copy(w.EEASectionState()),url=w.location.href,length=w.history.length;for(let n=0;n<4;n++){notes.querySelector('summary').click();assert(notes.open);notes.querySelector('summary').click();assert(!notes.open);}assert.deepEqual(copy(w.EEASectionState()),state);assert.equal(w.location.href,url);assert.equal(w.history.length,length);
}
function dialogShim(w){
 // JSDOM has no native dialog implementation. Only install its missing methods,
 // never rewrite production code or pretend this verifies browser focus/modal UI.
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
}

function sourceCoverage(){
 const source=fs.readFileSync(path.join(__dirname,'fixtures/week10-centers-thursday-soup-source.txt'),'utf8');
 assert.equal(hash(source),'0802511a573b979c69ab468448563f0f05e169a9f5b80c44830dbf31ee7aa6ff','Original independent Class Soup extract remains intact');
 assert(source.startsWith('Source: '+plan[0].source));
 // Exclude only source URL, PDF headings/furniture and bibliography for separate
 // linked picture supports. Every actual lesson word must remain in exact order.
 let lesson=source.split('NotesImage Citations for Center Language Supports:')[0].replace(/^Source:.*\n/,'').replace(/Unit 2: World of Color\s+WEEK 2\s+/g,'').replace(/Science and Engineering U2 W2/g,'').replace(/Focus on Pre-K 3s \| Boston Public Schools Early Childhood Department P-2/g,'');
 for(const heading of ['Science and Engineering: Class Soup','Big Ideas','Guiding Question','Family Engagement','Vocabulary','Materials','Intro to Centers','During Centers','Differentiation Ideas','Facilitation','Standards']){
  const flexible=heading.split(/\s+/).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('\\s+');lesson=lesson.replace(new RegExp(flexible),'');
 }
 const normalized=s=>s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim().split(/\s+/);
 assert.deepEqual(normalized(plan[0].notes.slice(1).flatMap(n=>n[1]).join(' ')),normalized(lesson),'Full Class Soup lesson content and ordering match the independently extracted source');
 assert.deepEqual(plan.map(s=>s.title),['Class Soup']);assert.equal(plan.length,1,'One source activity is one introduction');
 const p=plan[0];assert.equal(p.center,'Science and Engineering');assert.equal(p.enlarge,true);assert.equal(p.enlargeLabel,'Enlarge image');assert.equal(p.words,undefined);assert.equal(p.steps,undefined);
 assert.equal(p.source,'https://drive.google.com/file/d/1GtykjF_jo1HNCA69lk5gJjCbpsczXL-n/view');
 assert.equal(p.img,'assets/focus-3s/unit-2/week-1/friday/follow-a-recipe.png');assert.match(p.alt,/not the class’s selected recipe/);
 const teacher=p.notes.flatMap(n=>n[1]).join(' ');for(const text of ['food allergies/preferences','child-safe cutting tools','Children first wash their hands','pretend and real ingredients','fruit or vegetable salad','Use the steps that are appropriate for your classroom.','_____ [list ingredients]'])assert(teacher.includes(text),'Source safety/choice language preserved: '+text);
 assert.match(p.notes[0][1].join(' '),/not the class’s selected recipe, a required ingredient list, or a photograph of this class/);assert.match(p.notes[0][1].join(' '),/does not identify children in this class/);
}
(async()=>{
 sourceCoverage();
 const fixed={
  "week10-centers-v1.js": "ccf7eb9bbf10248892af0167affcd6d15bedcbb70819779ce1962e54e3d8e129",
  "week10-centers-v2.js": "7aed8aeda1d5f4cce89a9c99a041e85f6f27207c5000005347d7b06b034a4db6",
  "week10-centers-v3.js": "c2dd0bf83a636b482716a096f63761a8836558eccc2ce96b97d99b3dc80a68e9",
  "week10-read-aloud-v4.js": "8f4023cb9eade4346b3f24b9c28f7b7efbfb72777317c91d32c72c3e7fe3f828",
  "week10-read-aloud-v5.js": "bd4d4c76972c5be756cdf160f76f712df0c12b71a91d34f7aaa747865e45a64b",
  "week10-read-aloud-v6.js": "e91de843726115645ec9f8bf9dd6bf9da7ff1bfeba3bcd24d7f36b5fa92e51b9",
  "week10-read-aloud-v7.js": "fcacacc115e99f4dc3e3d7a84ac3dbad2e2797e709db57c16de23114ac7e1290",
  "week10-centers-monday-plan.json": "4f45def095c02678e250449b0a77f998d267501dd18ae223aae917a1aadd10c3",
  "week10-centers-tuesday-plan.json": "4da1d97f5fc2a40b67a4258aa85c7ed038b1c69f1db8b291f37964ac595b4ee1",
  "week10-centers-wednesday-plan.json": "0929f336101667bdffd1926caa0fddeb3c6fe474bf396969b7677cc2cdbe2b0b",
  "week10-color-read-aloud-plans.json": "4b5a820e188f48c3833b8bd694dc4e9ed240a5832170fa53444a342a6c91876f",
  "week10-read-aloud-plan.json": "f5a46a913be470b1f85593eb3be17a29da8890b2185c2efd1b8a7820b713a9d1",
  "week10-read-aloud-tuesday-plan.json": "84174e8232a673b2b2ad12dd4a534aaea72b66f0219bcd17d005390cdd1dcead",
  "week10-read-aloud-wednesday-plan.json": "873cacc82796a5b1c165ec93c44f6cc7debc894277934302de3720640752d1c9",
  "assets/focus-3s/unit-2/week-1/friday/follow-a-recipe.png": "c25a54227ea3d2e6b25597268ad683aa5d581962f4e2298a222da3400ccd8f1b"
};
 for(const[file,digest]of Object.entries(fixed))assert.equal(hash(fs.readFileSync(path.join(root,file))),digest,'Unmodified pre-Thursday file: '+file);
 for(const[file,runtime]of [['week10-centers.html','week10-centers-v5.js'],['week10-read-aloud.html','week10-read-aloud-v9.js']])assert(fs.readFileSync(path.join(root,file),'utf8').includes('src="'+runtime+'"'));
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');assert.match(sw,/eea-companion-v102/);for(const f of ['week10-centers-v5.js','week10-read-aloud-v9.js','week10-centers-thursday-plan.json'])assert(sw.includes('./'+f));
 const provenance=fs.readFileSync(path.join(root,'assets/focus-3s/unit-2/week-2/centers/SOURCE.md'),'utf8');assert(provenance.includes(plan[0].source));assert(provenance.includes(plan[0].img.split('/').at(-1)));
 const snapshots=[];
 for(let week=1;week<=11;week++)for(let day=0;day<5;day++){
  const a=open('daily-lessons.html',`week=${week}&day=${day}`),d=a.w.document;
  if(!(week===11&&day===2))snapshots.push({week,day,eyebrow:d.getElementById('eyebrow').textContent,title:d.getElementById('title').textContent,path:d.getElementById('path').outerHTML,note:d.getElementById('note').textContent,start:d.getElementById('start').textContent,disabled:d.getElementById('start').disabled,weekButtons:[...d.querySelectorAll('#weeknav button')].map(b=>[b.textContent,b.className])});
  if(week===10&&day===3){assert.deepEqual([...d.querySelectorAll('#path .step b')].map(e=>e.textContent),['Community Meeting','Read Aloud','Centers']);assert.match(d.querySelectorAll('#path .step')[2].textContent,/Class Soup/);assert.equal(d.getElementById('start').textContent,'Open Community Meeting →');assert.equal(d.getElementById('start').disabled,false);}close(a);await delay(0);
 }
 // Week3 mindful Community Meeting updates the Week11 snapshots only; the
 // Week11 overview-runner suite retains its independent Week1–10 integrity pin.
 // Rebased after comparison with 13b52d2 proved Week11 Friday is the sole changed overview;
 // all other 54 overviews and 112 Monday–Thursday resume/launch flows were identical.
 // All 54 snapshots remain pinned, including newly ready Friday; Wednesday stays separately tested.
 assert.equal(hash(JSON.stringify(snapshots)),'f656879cffab679d48dd04aa1fb47e9b12edca7a58a62dca8e7d671122abdff0','All 54 other day overviews/readiness/week buttons remain unchanged');
 for(const[query,storage,expected]of [['',{'eea-curriculum-pace':JSON.stringify({startDate:'2020-01-06',mode:'calendar'})},9],['week=10',{},10],['week=11',{},11]]){const a=open('daily-lessons.html',query,storage);assert.equal(a.w.document.querySelector('#weeknav .active').dataset.week,String(expected));close(a);}
 for(const key of ['click','Enter',' ']){const a=open('daily-lessons.html','week=10&day=3'),card=a.w.document.querySelectorAll('#path .step')[2];assert.equal(card.getAttribute('role'),'button');assert.equal(card.tabIndex,0);if(key==='click')card.click();else card.dispatchEvent(new a.w.KeyboardEvent('keydown',{key,bubbles:true}));destination(a,'lesson-runner-week10.html',3,2);close(a);}
 for(const embedded of [false,true])for(const raw of ['0','1','2','999999','-1','bad','1.5','Infinity','','NaN']){
  const a=open(embedded?'lesson-runner-week10.html':'week10-centers.html',route(embedded,raw)+'&stop=4&book=red-dragon'),w=await ready(a);assertPage(w,0);const url=new URL(a.w.location.href);assert.equal(url.searchParams.get('step'),'0');assert.equal(url.searchParams.has('book'),false);assert.equal(url.searchParams.has('stop'),false);assert.equal(a.w.history.length,1);
  if(embedded)assert.deepEqual(JSON.parse(a.w.localStorage.getItem('eea-lesson-resume')),{date:dateKey(),week:10,day:3,section:2});close(a);
 }
 for(const embedded of [false,true]){
  const a=open(embedded?'lesson-runner-week10.html':'week10-centers.html',route(embedded,0)),w=await ready(a),d=w.document;dialogShim(w);const url=a.w.location.href,length=a.w.history.length;
  for(let n=0;n<5;n++){a.w.dispatchEvent(new a.w.Event('pageshow'));if(embedded)a.w.document.getElementById('frame').dispatchEvent(new a.w.Event('load'));assertPage(w,0);}
  for(let n=0;n<4;n++)for(const selector of ['.enlarge-image','.lesson-img']){d.querySelector(selector).click();assert(d.getElementById('image-dialog').open);assert.equal(d.getElementById('image-dialog').getAttribute('aria-label'),'Enlarged lesson image');assert.equal(d.getElementById('enlarged-image').getAttribute('src'),plan[0].img);assert.equal(d.getElementById('enlarged-image').alt,plan[0].alt);d.getElementById('close-image').click();assert(!d.getElementById('image-dialog').open);}
  d.querySelector('.enlarge-image').click();a.w.dispatchEvent(new a.w.Event('pageshow'));assert(!d.getElementById('image-dialog').open,'Restoration dismisses modal');assert.equal(a.w.location.href,url);assert.equal(a.w.history.length,length);assert.deepEqual(a.navigations,[]);close(a);
 }
 for(const embedded of [false,true])for(const button of ['prev','done','exit']){
  const a=open(embedded?'lesson-runner-week10.html':'week10-centers.html',route(embedded,0),{'eea-u2w2-color-book':'red-dragon'}),w=await ready(a);a.w.localStorage.setItem('eea-lesson-auto-resume',dateKey());w.document.getElementById(button).click();destination(a,button==='prev'?'lesson-runner-week10.html':'daily-lessons.html',3,button==='prev'?1:undefined);if(button!=='prev')assert.equal(a.w.localStorage.getItem('eea-lesson-auto-resume'),null);assert.equal(a.w.localStorage.getItem('eea-u2w2-color-book'),'red-dragon');close(a);
 }
 const colorPlans=JSON.parse(fs.readFileSync(path.join(root,'week10-color-read-aloud-plans.json'),'utf8'));
 for(const embedded of [false,true])for(const book of ['green-chile','red-dragon']){
  const a=open(embedded?'lesson-runner-week10.html':'week10-read-aloud.html',`week=10&day=${embedded?3:'Thursday'}&section=1&book=${book}&step=999999`),w=await ready(a);assert.deepEqual(copy(w.EEAReadAloudPlan),colorPlans[book].Thursday);assert(w.EEASectionState().atEnd);assert.equal(w.document.getElementById('next').textContent,'Next: Centers →');assert.equal(w.document.getElementById('bookImg').hasAttribute('src'),false);w.document.getElementById('next').click();destination(a,'lesson-runner-week10.html',3,2);close(a);
 }
 for(const embedded of [false,true])for(const book of ['green-chile','red-dragon']){const a=open(embedded?'lesson-runner-week10.html':'week10-read-aloud.html',`week=10&day=${embedded?4:'Friday'}&section=1&book=${book}&step=999999`),w=await ready(a);assert.equal(w.document.getElementById('next').textContent,'Next: Centers →');w.document.getElementById('next').click();destination(a,'lesson-runner-week10.html',4,2);close(a);}
 for(const embedded of [false,true]){
  const a=open(embedded?'lesson-runner-week10.html':'week10-centers.html',`week=10&day=${embedded?4:'Friday'}&section=2&step=4&book=red-dragon&stop=2`),w=await ready(a),d=w.document;
  assert.match(w.location.pathname,/week10-centers\.html$/);assert.equal(d.getElementById('center-choice').value,'','Friday requires an explicit teacher choice');assert.equal(d.querySelectorAll('#center-choice option').length,8);assert.equal(d.querySelectorAll('.community-card').length,0);
  assert.deepEqual(copy(w.EEASectionState()),{step:0,index:0,total:0,atStart:true,atEnd:true,center:null,review:false});assert.deepEqual(a.navigations,[]);
  if(embedded){const p=new URL(a.w.location.href).searchParams;assert.equal(p.get('section'),'2');assert.equal(p.get('day'),'4');assert.equal(p.get('step'),'0');for(const key of ['book','stop','center','review'])assert.equal(p.has(key),false);}close(a);
 }
 console.log('PASS: independent full source parity, protected earlier bytes, 54 unaffected overviews/pacing, one-card notes/enlarge, all six same-day exits, both Thursday/Friday book handoffs and explicit Friday selection');
})().catch(error=>{console.error(error);process.exitCode=1;});
