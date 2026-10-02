// Wednesday Unit 2 Week 2 Centers: independent source/byte fixtures and DOM flows.
// Native dialog focus, layout, actual image loads and joint-session history are
// verified separately by test_week10_centers_wednesday_browser.cjs.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const {implForWrapper}=require('jsdom/lib/jsdom/living/generated/utils');
const {serializeURL}=require('whatwg-url');
const root=path.resolve(__dirname,'../v6-test'),origin='https://eea.test/v6-test/';
const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
const titles=['Collecting Leaves','Multilingual Color Poem or Book'];
const plan=JSON.parse(fs.readFileSync(path.join(root,'week10-centers-wednesday-plan.json'),'utf8'));
const copy=v=>JSON.parse(JSON.stringify(v));
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const dateKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
async function until(check,label){for(let n=0;n<200;n++){if(check())return;await delay(10);}assert.fail(label);}
class Files extends ResourceLoader{fetch(url){return url.startsWith(origin)?Promise.resolve(fs.readFileSync(path.join(root,decodeURIComponent(new URL(url).pathname.slice('/v6-test/'.length))))):null;}}
function open(file='week10-centers.html',query='day=Wednesday&step=0',storage={}){
 const errors=[],navigations=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:origin+file+'?'+query,runScripts:'dangerously',resources:new Files(),virtualConsole:vc,beforeParse(w){
  for(const[k,v]of Object.entries(storage))w.localStorage.setItem(k,v);
  implForWrapper(w.location)._locationObjectNavigate=url=>navigations.push(serializeURL(url));
 }}).window;return{w,errors,navigations};
}
async function ready(a){let w=a.w;const frame=w.document.getElementById('frame');await until(()=>a.w.document.readyState==='complete'&&(!frame||frame.contentDocument?.readyState==='complete'),'Document initialized');if(frame)w=frame.contentWindow;await until(()=>typeof w.EEASectionState==='function','Section initialized');return w;}
function close(a){assert.deepEqual(a.errors,[]);a.w.close();}
function destination(a,file,day=2,section){assert.equal(a.navigations.length,1,'Exactly one top-level exit');const p=new URL(a.navigations[0]);assert.equal(p.pathname,'/v6-test/'+file);assert.equal(p.searchParams.get('week'),'10');assert.equal(p.searchParams.get('day'),String(day));if(section!==undefined)assert.equal(p.searchParams.get('section'),String(section));}
function route(embedded,index){return `week=10&day=${embedded?'2':'Wednesday'}&section=2&step=${index}`;}
function assertPage(w,index){
 const d=w.document,s=plan[index],notes=d.querySelector('.community-notes');assert.deepEqual(copy(w.EEACentersPlan),plan,'Runtime and inspectable plan match exactly');
 assert.deepEqual(copy(w.EEASectionState()),{step:index,index,total:2,atStart:index===0,atEnd:index===1});
 assert.equal(d.querySelector('.community-copy h2').textContent,titles[index]);assert.equal(d.querySelector('.lead').textContent,s.lead);assert.equal(d.querySelector('.lesson-img').getAttribute('src'),s.img);assert.equal(d.querySelector('.lesson-img').alt,s.alt);
 assert.equal(d.querySelectorAll('.community-card').length,1);assert.equal(d.querySelectorAll('iframe,select,#activityMenu').length,0);assert.equal(d.getElementById('count').textContent,`${index+1} of 2`);assert.equal(notes.open,false);
 assert.deepEqual([...notes.querySelectorAll('.community-notes-content > h3')].map(e=>e.textContent),[...s.notes.map(n=>n[0]),'Source materials']);
 assert.deepEqual([...notes.querySelectorAll('.community-notes-content > p')].slice(0,-1).map(e=>e.textContent),s.notes.flatMap(n=>n[1]),'Every source paragraph is present in Teacher Notes');
 assert.deepEqual([...notes.querySelectorAll('a')].map(e=>e.href),[...s.links.map(x=>x[1]),s.source,'https://docs.google.com/document/d/1lYe4_XN0sIUJeeEt2kbxzxtzqkteNSX9woHXpfXlb7Y/edit']);
 for(const link of notes.querySelectorAll('a')){assert.equal(link.target,'_blank');assert(link.rel.includes('noopener'));}
 assert.equal(d.querySelectorAll('.enlarge-image').length,1);assert.equal(d.querySelector('.enlarge-image').textContent,'Enlarge image');assert.match(d.getElementById('sub').textContent,/Wednesday/);assert.equal(d.getElementById('exit').getAttribute('aria-label'),'Return to Day Overview');assert(!/Finish Today|Thursday/.test(d.body.textContent));assert.equal(d.getElementById('prev').textContent,index?'← Previous':'← Read Aloud');assert.equal(d.getElementById('done').textContent,index?'Finish Centers →':'Next: Color Poem →');
 const state=copy(w.EEASectionState()),url=w.location.href,length=w.history.length;for(let n=0;n<4;n++){notes.querySelector('summary').click();assert(notes.open);notes.querySelector('summary').click();assert(!notes.open);}assert.deepEqual(copy(w.EEASectionState()),state);assert.equal(w.location.href,url);assert.equal(w.history.length,length);
}
function dialogShim(w){
 // JSDOM has no native dialog implementation. Only install its missing methods,
 // never rewrite production code or pretend this verifies browser focus/modal UI.
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
}
function sourceCoverage(){
 const normalize=s=>s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim().split(/\s+/);
 for(const[index,name]of [[0,'leaf'],[1,'poem']]){
  const text=fs.readFileSync(path.join(__dirname,'fixtures',`week10-centers-wednesday-${name}-source.txt`),'utf8');assert(text.startsWith('Source: '+plan[index].source));assert.equal(hash(text),['fa75855836de5a9732a4584885374c8e1610ab6b17912e334c55e29beaa6a17f','e945243250c3599c44f258700985ba72c2a6871bd8f3a843a297153493e59ce2'][index],'Unmodified independent source extract');
  // Independent original source extracts: remove table headings/PDF furniture,
  // not lesson content. Require every remaining source word in source order.
  let source=text.replace(/^Source:.*\n/,'').replace(/Unit 2: World of Color\s+WEEK 2\s+/g,'').replace(/Focus on Pre-K 3s \| Boston Public Schools Early Childhood Department P-2/g,'').replace(/(?:Math|Writing and Drawing) U2 W2\s*/g,'').replace(/\bNotes\b/g,'');
  const headings=[index?'Writing and Drawing: Multilingual Color Poem or Book':'Math: Collecting Leaves','Big Ideas','Objective',index?'Guiding Question':'Guiding Questions','Family Engagement','Vocabulary','Materials and Preparation','Poem Example:','Intro to Centers','During Centers','Differentiation Ideas','Facilitation','Extensions','Standards'];
  for(const heading of headings){const flexible=heading.split(/\s+/).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('\\s+');source=source.replace(new RegExp(flexible),'');}
  const expected=normalize(source),actual=normalize(plan[index].notes.slice(1).flatMap(x=>x[1]).join(' '));
  assert.deepEqual(actual,expected,`${name}: full lesson content and ordering exactly match the independent source after removing only headings, punctuation and PDF furniture`);
 }
 assert.deepEqual(plan.map(s=>s.title),titles);assert.equal(plan.length,2,'Exactly one introduction per source activity');assert(plan.every(s=>s.enlarge===true));
 assert.equal(plan[0].img,'assets/focus-3s/unit-2/week-1/centers/autumn-leaves.png');
 assert.equal(plan[1].img,'assets/focus-3s/unit-2/week-2/centers/favorite-objects-visual-menu.png');
 assert.match(plan[0].notes[0][1].join(' '),/not a five-frame demonstration/);
 assert.match(plan[1].notes[0][1].join(' '),/fictional teaching examples.*not information about children in this class/);
 assert.match(plan[1].notes[0][1].join(' '),/monolingual alternative/);
 const poemExample=plan[1].notes.find(n=>n[0].startsWith('Poem Example'));assert.match(poemExample[0],/Fictional Source Examples/);assert(poemExample[1].includes('Iman loves green trains - أخضر (pronounced akhdar - Arabic)'));
 for(const s of plan){assert.equal(s.enlargeLabel,'Enlarge image');assert.equal(s.words,undefined);assert.equal(s.steps,undefined);}

}
(async()=>{
 sourceCoverage();
 const fixed={
  'week10-centers-v2.js':'7aed8aeda1d5f4cce89a9c99a041e85f6f27207c5000005347d7b06b034a4db6',
  'week10-read-aloud-v6.js':'e91de843726115645ec9f8bf9dd6bf9da7ff1bfeba3bcd24d7f36b5fa92e51b9',
  'week10-centers-tuesday-plan.json':'4da1d97f5fc2a40b67a4258aa85c7ed038b1c69f1db8b291f37964ac595b4ee1',
  'assets/focus-3s/unit-2/week-2/centers/favorite-objects-visual-menu.png':'28c7a6733bf4f8669a49ee4a5cd47eb09a5821821f2b483cdbaadc01d9362039',
  'assets/focus-3s/unit-2/week-1/centers/autumn-leaves.png':'388b76faa5f49592540bc9550ff298e29886c7d3ef541bcbeff2470773445c15',
  'week10-centers-v1.js':'ccf7eb9bbf10248892af0167affcd6d15bedcbb70819779ce1962e54e3d8e129',
  'week10-read-aloud-v5.js':'bd4d4c76972c5be756cdf160f76f712df0c12b71a91d34f7aaa747865e45a64b',
  'week10-centers-monday-plan.json':'4f45def095c02678e250449b0a77f998d267501dd18ae223aae917a1aadd10c3',
  'week10-read-aloud-plan.json':'f5a46a913be470b1f85593eb3be17a29da8890b2185c2efd1b8a7820b713a9d1',
  'week10-read-aloud-tuesday-plan.json':'84174e8232a673b2b2ad12dd4a534aaea72b66f0219bcd17d005390cdd1dcead',
  'week10-read-aloud-wednesday-plan.json':'873cacc82796a5b1c165ec93c44f6cc7debc894277934302de3720640752d1c9',
  'assets/focus-3s/unit-2/week-1/centers/cooking-soup.jpg':'3eee5ad61783753d4430ab6e6d0492b9d83d89c697a6ce9a3ce4872397b00bfa',
  'assets/focus-3s/unit-2/week-1/soup-day/pages-29-30.jpg':'dfaaaeb7a4c7387bb6b469e346871a9d4529dda327bcc2f00099cb5426388e0f',
  'assets/focus-3s/unit-2/week-2/strictly-no-elephants/slide-02.jpg':'d6d84c83d14a950f37900a906e6553456397c331cc21a864f4cb30780010752b'
 };
 for(const[file,digest]of Object.entries(fixed))assert.equal(hash(fs.readFileSync(path.join(root,file))),digest,`Unmodified original ${file}`);
 const provenance=fs.readFileSync(path.join(root,'assets/focus-3s/unit-2/week-2/centers/SOURCE.md'),'utf8');for(const s of plan){assert(provenance.includes(s.source));assert(fs.existsSync(path.join(root,s.img)));}
 assert.match(fs.readFileSync(path.join(root,'week10-centers.html'),'utf8'),/src="week10-centers-v4\.js"/);assert.match(fs.readFileSync(path.join(root,'week10-read-aloud.html'),'utf8'),/src="week10-read-aloud-v8\.js"/);
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');assert.match(sw,/eea-companion-v94/);for(const file of ['week10-centers-v4.js','week10-read-aloud-v8.js','week10-centers-wednesday-plan.json'])assert(sw.includes('./'+file),`Service worker includes ${file}`);
 console.log('All independent original source words, full notes parity, original images/plans and stale v1/v2/v5/v6 bytes are protected');
 const snapshots=[];
 for(let week=1;week<=11;week++)for(let day=0;day<5;day++){
  const a=open('daily-lessons.html',`week=${week}&day=${day}`),d=a.w.document;
  if(week!==10||(day!==2&&day!==3))snapshots.push({week,day,eyebrow:d.getElementById('eyebrow').textContent,title:d.getElementById('title').textContent,path:d.getElementById('path').outerHTML,note:d.getElementById('note').textContent,start:d.getElementById('start').textContent,disabled:d.getElementById('start').disabled,weekButtons:[...d.querySelectorAll('#weeknav button')].map(b=>[b.textContent,b.className])});
  else if(day===2){assert.deepEqual([...d.querySelectorAll('#path .step b')].map(e=>e.textContent),['Community Meeting','Read Aloud','Centers']);const card=d.querySelectorAll('#path .step')[2];assert.equal(card.dataset.section,'2');assert.equal(card.getAttribute('role'),'button');assert.equal(card.tabIndex,0);assert.match(card.textContent,/Leaf|Leaves/);assert.match(card.textContent,/Color Poem|Multilingual/);assert.equal(d.getElementById('start').disabled,false);assert.equal(d.getElementById('start').textContent,'Open Community Meeting →');}close(a);await delay(0);
 }
 // Recorded from pre-Thursday main 380b394, not recomputed from changed content.
 assert.equal(hash(JSON.stringify(snapshots)),'8aa7f2e38d44656cd881aedeceb389505b4f6cb6c4d9371cec3af8a9a0e1d3e4','All 53 unaffected overviews, including Monday/Tuesday Centers, are unchanged');
 for(const key of ['click','Enter',' ']){const a=open('daily-lessons.html','week=10&day=2'),card=a.w.document.querySelectorAll('#path .step')[2];if(key==='click')card.click();else card.dispatchEvent(new a.w.KeyboardEvent('keydown',{key,bubbles:true}));destination(a,'lesson-runner-week10.html',2,2);close(a);}
 for(const embedded of [false,true])for(const[raw,index]of [['0',0],['1',1],['2',1],['3',1],['4',1],['999999',1],['-1',0],['bad',0],['1.5',0],['Infinity',0],['',0]]){
  const a=open(embedded?'lesson-runner-week10.html':'week10-centers.html',route(embedded,raw)+'&stop=3&book=red-dragon'),w=await ready(a);assertPage(w,index);assert.equal(new URL(a.w.location.href).searchParams.get('step'),String(index));assert.equal(a.w.history.length,1);assert.equal(new URL(a.w.location.href).searchParams.has('stop'),false);assert.equal(new URL(a.w.location.href).searchParams.has('book'),false);
  if(embedded){assert.equal(a.w.document.querySelectorAll('iframe').length,1);assert.deepEqual(JSON.parse(a.w.localStorage.getItem('eea-lesson-resume')),{date:dateKey(),week:10,day:2,section:2});}close(a);
 }
 console.log('Wednesday card mouse/keyboard launch, every page, full notes, source links and malformed route normalization pass');
 for(const embedded of [false,true]){
  const a=open(embedded?'lesson-runner-week10.html':'week10-centers.html',route(embedded,0)),w=await ready(a),d=w.document;dialogShim(w);const h=a.w.history.length,ch=w.history.length;
  if(embedded)for(let n=0;n<5;n++){a.w.dispatchEvent(new a.w.Event('pageshow'));a.w.document.getElementById('frame').dispatchEvent(new a.w.Event('load'));}
  assert.equal(a.w.history.length,h);d.getElementById('done').click();assertPage(w,1);assert.equal(a.w.history.length,h+1);if(embedded)assert.equal(w.history.length,ch,'Iframe never pushes a second history entry');
  for(let n=0;n<3;n++){a.w.history.back();await until(()=>w.EEASectionState().step===0,'Back');assertPage(w,0);a.w.history.forward();await until(()=>w.EEASectionState().step===1,'Forward');assertPage(w,1);}
  for(let n=0;n<5;n++){d.getElementById('prev').click();assertPage(w,0);d.getElementById('done').click();assertPage(w,1);}assert.deepEqual(a.navigations,[]);
  const url=a.w.location.href,length=a.w.history.length;
  for(let n=0;n<4;n++){d.querySelector('.enlarge-image').click();assert(d.getElementById('image-dialog').open);assert.equal(d.getElementById('image-dialog').getAttribute('aria-label'),'Enlarged lesson image');assert.equal(d.getElementById('enlarged-image').getAttribute('src'),plan[1].img);assert.equal(d.getElementById('enlarged-image').alt,plan[1].alt);d.getElementById('close-image').click();assert(!d.getElementById('image-dialog').open);}assert.equal(a.w.location.href,url);assert.equal(a.w.history.length,length);
  d.querySelector('.enlarge-image').click();a.w.history.back();await until(()=>w.EEASectionState().step===0,'History while modal open');assert(!d.getElementById('image-dialog').open,'History render dismisses modal');a.w.history.forward();await until(()=>w.EEASectionState().step===1,'Forward after modal');assert(!d.getElementById('image-dialog').open);close(a);
 }
 // All three actions from every page, in both contexts, independently validate
 // internal steps, previous-reader entry, and bounded same-Wednesday exits.
 for(const embedded of [false,true])for(let index=0;index<2;index++)for(const button of ['prev','done','exit']){
  const a=open(embedded?'lesson-runner-week10.html':'week10-centers.html',route(embedded,index)),w=await ready(a);a.w.localStorage.setItem('eea-lesson-auto-resume',dateKey());w.document.getElementById(button).click();
  if(button==='prev'&&index>0){assertPage(w,index-1);assert.deepEqual(a.navigations,[]);}else if(button==='done'&&index<1){assertPage(w,index+1);assert.deepEqual(a.navigations,[]);}else if(button==='prev')destination(a,'lesson-runner-week10.html',2,1);else{destination(a,'daily-lessons.html');assert.equal(a.w.localStorage.getItem('eea-lesson-auto-resume'),null);}close(a);
 }
 for(const embedded of [false,true])for(const index of [0,1]){const a=open(embedded?'lesson-runner-week10.html':'week10-centers.html',route(embedded,index)),w=await ready(a);dialogShim(w);w.document.querySelector('.enlarge-image').click();assert.equal(w.document.getElementById('enlarged-image').getAttribute('src'),plan[index].img);w.document.getElementById('close-image').click();w.document.querySelector('.lesson-img').click();assert(w.document.getElementById('image-dialog').open,'Original image tap enlarges');w.document.getElementById('close-image').click();assertPage(w,index);close(a);}
 console.log('Standalone/embedded rapid controls, all 12 boundary cases, repeated preparation, Back/Forward and modal history pass');
 for(let day=4;day<5;day++){
  const a=open('week10-centers.html',`day=${days[day]}&step=2`);await until(()=>a.w.document.readyState==='complete','Unsupported ready');destination(a,'daily-lessons.html',day);assert.equal(a.w.document.querySelectorAll('.community-card').length,0);assert.equal(typeof a.w.EEASectionState,'undefined');close(a);
  const b=open('lesson-runner-week10.html',`week=10&day=${day}&section=2&step=4&book=red-dragon&stop=2`),w=await ready(b);assert.match(w.location.pathname,/week10-community\.html$/);assert.equal(new URL(b.w.location.href).searchParams.get('section'),'0');assert.equal(new URL(b.w.location.href).searchParams.get('day'),String(day));assert.equal(new URL(b.w.location.href).searchParams.has('step'),false);close(b);
 }
 for(const raw of ['','bad','1','wednesday','NaN','Infinity']){const a=open('week10-centers.html',`day=${raw}&step=4`);await until(()=>a.w.document.readyState==='complete','Invalid day initialized');assert.equal(a.w.document.querySelectorAll('.community-card').length,0);assert.equal(a.navigations.length,1);assert.equal(new URL(a.navigations[0]).pathname,'/v6-test/daily-lessons.html');close(a);}
 for(const embedded of [false,true])for(let day=0;day<5;day++){
  const a=open(embedded?'lesson-runner-week10.html':'week10-read-aloud.html',`week=10&day=${embedded?day:days[day]}&section=1&step=999999`),w=await ready(a);assert(w.EEASectionState().atEnd);w.document.getElementById('next').click();destination(a,day<4?'lesson-runner-week10.html':'daily-lessons.html',day,day<4?2:undefined);close(a);
 }
 console.log('Unsupported/invalid days never substitute Monday; Monday–Thursday reader handoffs and Friday bounded finishes pass');
})().catch(error=>{console.error(error);process.exitCode=1;});
