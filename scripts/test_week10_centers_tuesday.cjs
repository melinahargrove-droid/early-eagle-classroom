// Tuesday Unit 2 Week 2 Centers: independent source/byte fixtures and DOM flows.
// Native dialog focus, layout, actual image loads and joint-session history are
// verified separately by test_week10_centers_tuesday_browser.cjs.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const {implForWrapper}=require('jsdom/lib/jsdom/living/generated/utils');
const {serializeURL}=require('whatwg-url');
const root=path.resolve(__dirname,'../v6-test'),origin='https://eea.test/v6-test/';
const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
const titles=['Vocabulary','Connect','Model adding spices','Play together','Storytelling with Props'];
const plan=JSON.parse(fs.readFileSync(path.join(root,'week10-centers-tuesday-plan.json'),'utf8'));
const copy=v=>JSON.parse(JSON.stringify(v));
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const dateKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
async function until(check,label){for(let n=0;n<200;n++){if(check())return;await delay(10);}assert.fail(label);}
class Files extends ResourceLoader{fetch(url){return url.startsWith(origin)?Promise.resolve(fs.readFileSync(path.join(root,decodeURIComponent(new URL(url).pathname.slice('/v6-test/'.length))))):null;}}
function open(file='week10-centers.html',query='day=Tuesday&step=0',storage={}){
 const errors=[],navigations=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:origin+file+'?'+query,runScripts:'dangerously',resources:new Files(),virtualConsole:vc,beforeParse(w){
  for(const[k,v]of Object.entries(storage))w.localStorage.setItem(k,v);
  implForWrapper(w.location)._locationObjectNavigate=url=>navigations.push(serializeURL(url));
 }}).window;return{w,errors,navigations};
}
async function ready(a){let w=a.w;const frame=w.document.getElementById('frame');await until(()=>a.w.document.readyState==='complete'&&(!frame||frame.contentDocument?.readyState==='complete'),'Document initialized');if(frame)w=frame.contentWindow;await until(()=>typeof w.EEASectionState==='function','Section initialized');return w;}
function close(a){assert.deepEqual(a.errors,[]);a.w.close();}
function destination(a,file,day=1,section){assert.equal(a.navigations.length,1,'Exactly one top-level exit');const p=new URL(a.navigations[0]);assert.equal(p.pathname,'/v6-test/'+file);assert.equal(p.searchParams.get('week'),'10');assert.equal(p.searchParams.get('day'),String(day));if(section!==undefined)assert.equal(p.searchParams.get('section'),String(section));}
function route(embedded,index){return `week=10&day=${embedded?'1':'Tuesday'}&section=2&step=${index}`;}
function assertPage(w,index){
 const d=w.document,s=plan[index],notes=d.querySelector('.community-notes');assert.deepEqual(copy(w.EEACentersPlan),plan,'Runtime and inspectable plan match exactly');
 assert.deepEqual(copy(w.EEASectionState()),{step:index,index,total:5,atStart:index===0,atEnd:index===4});
 assert.equal(d.querySelector('.community-copy h2').textContent,titles[index]);assert.equal(d.querySelector('.lead').textContent,s.lead);assert.equal(d.querySelector('.lesson-img').getAttribute('src'),s.img);assert.equal(d.querySelector('.lesson-img').alt,s.alt);
 assert.equal(d.querySelectorAll('.community-card').length,1);assert.equal(d.querySelectorAll('iframe,select,#activityMenu').length,0);assert.equal(d.getElementById('count').textContent,`${index+1} of 5`);assert.equal(notes.open,false);
 assert.deepEqual([...notes.querySelectorAll('.community-notes-content > h3')].map(e=>e.textContent),[...s.notes.map(n=>n[0]),'Source materials']);
 assert.deepEqual([...notes.querySelectorAll('.community-notes-content > p')].slice(0,-1).map(e=>e.textContent),s.notes.flatMap(n=>n[1]),'Every source paragraph is present in Teacher Notes');
 assert.deepEqual([...notes.querySelectorAll('a')].map(e=>e.href),[...s.links.map(x=>x[1]),s.source,'https://docs.google.com/document/d/1lYe4_XN0sIUJeeEt2kbxzxtzqkteNSX9woHXpfXlb7Y/edit']);
 for(const link of notes.querySelectorAll('a')){assert.equal(link.target,'_blank');assert(link.rel.includes('noopener'));}
 assert.equal(d.querySelectorAll('.enlarge-image').length,[1,4].includes(index)?1:0);assert.match(d.getElementById('sub').textContent,/Tuesday/);assert.equal(d.getElementById('exit').getAttribute('aria-label'),'Return to Day Overview');assert(!/Finish Today|Wednesday/.test(d.body.textContent));
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
 for(const[index,name,label]of [[0,'soup','Dramatic Play: Making Soup'],[4,'props','Library and Listening: Storytelling with Props\x02Strictly No Elephants']]){
  const text=fs.readFileSync(path.join(__dirname,'fixtures',`week10-centers-${name}-source.txt`),'utf8');assert(text.startsWith('Source: '+plan[index].source));
  // These checked-in extracts are independent of the JSON and JS. Remove only
  // table headings, bullets and repeated PDF furniture, then require every word
  // in source order. Extra companion framing is allowed; omissions are not.
  let source=text.replace(/^Source:.*\n/,'').replace('Unit 2: World of Color\nWEEK 2\n','').replace(label,'').replace(/(?:Dramatic Play|Library and Listening) U2 W2\n/g,'').replace(/Focus on Pre-K 3s \| Boston Public Schools Early Childhood Department P-2/g,'').replace(/\bNotes\b/g,'');
  for(const h of ['Continued from Week 1',...plan[index].notes.map(x=>x[0])]){const flexible=h.split(/\s+/).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('\\s+');source=source.replace(new RegExp(flexible,'g'),'');}
  const expected=normalize(source),actual=normalize(plan[index].notes.flatMap(x=>x[1]).join(' '));let cursor=0;
  for(let n=0;n<expected.length;n++){while(cursor<actual.length&&actual[cursor]!==expected[n])cursor++;assert(cursor<actual.length,`${name} source word missing or reordered near: ${expected.slice(Math.max(0,n-7),n+5).join(' ')}`);cursor++;}
 }
 assert.deepEqual(plan.map(s=>s.title),titles);for(let n=1;n<4;n++)assert.deepEqual(plan[n].notes,plan[0].notes,'Every soup screen carries the full source');
 assert.deepEqual(plan[0].words,['chop: cut into small pieces','ingredients: things that are mixed together to make a dish','peel: to take off the skin from a fruit or vegetable','prepare: to make something','recipe: a list of ingredients and directions for making food','stir: to mix by moving a spoon/ladle in a circle']);
 assert.match(plan[1].img,/soup-day\/pages-29-30\.jpg$/);assert.match(plan[2].lead,/Show the spices.*salt and pepper.*pot/);assert.match(plan[2].steps[1][1],/don’t need a lot.*little bit/);assert.match(plan[3].lead,/friend.*together.*Vegetable Soup/);assert.match(plan[4].img,/strictly-no-elephants\/slide-02\.jpg$/);
 const props=plan[4].notes.flatMap(x=>x[1]).join(' ');for(const re of [/Family|families/,/puppets/,/narrator/,/negotiate/,/fabric swatches/,/umbrella/,/popsicle sticks/,/scissors/,/beginning.*describe.*narrate.*vocabulary and dialogue/,/different ending/,/SEL5/,/APL5/,/APL8/,/RL.PK.2/])assert.match(props,re);
}
(async()=>{
 sourceCoverage();
 const fixed={
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
 assert.match(fs.readFileSync(path.join(root,'week10-centers.html'),'utf8'),/src="week10-centers-v5\.js"/);assert.match(fs.readFileSync(path.join(root,'week10-read-aloud.html'),'utf8'),/src="week10-read-aloud-v9\.js"/);
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');for(const file of ['week10-centers-v5.js','week10-read-aloud-v9.js','week10-centers-tuesday-plan.json'])assert(sw.includes('./'+file),`Service worker includes ${file}`);
 console.log('All independent original source words, full notes parity, original images/plans and stale v1/v5 bytes are protected');
 const snapshots=[];
 for(let week=1;week<=11;week++)for(let day=0;day<5;day++){
  const a=open('daily-lessons.html',`week=${week}&day=${day}`),d=a.w.document;
  if(week!==10||(day!==1&&day!==2&&day!==3&&day!==4))snapshots.push({week,day,eyebrow:d.getElementById('eyebrow').textContent,title:d.getElementById('title').textContent,path:d.getElementById('path').outerHTML,note:d.getElementById('note').textContent,start:d.getElementById('start').textContent,disabled:d.getElementById('start').disabled,weekButtons:[...d.querySelectorAll('#weeknav button')].map(b=>[b.textContent,b.className])});
  else if(day===1){assert.deepEqual([...d.querySelectorAll('#path .step b')].map(e=>e.textContent),['Community Meeting','Read Aloud','Centers']);const card=d.querySelectorAll('#path .step')[2];assert.equal(card.dataset.section,'2');assert.equal(card.getAttribute('role'),'button');assert.equal(card.tabIndex,0);assert.match(card.textContent,/Cooking Soup/);assert.match(card.textContent,/Storytelling/);assert.equal(d.getElementById('start').disabled,false);assert.equal(d.getElementById('start').textContent,'Open Community Meeting →');}close(a);await delay(0);
 }
 // Pinned from pre-Friday HEAD, excluding only the intentionally changed Tuesday–Friday overviews.
 assert.equal(hash(JSON.stringify(snapshots)),'84517a25d7a9334b329a8dbde81d82c33ef466f95d466df596404bb202f9e30f','All 51 unaffected overviews, including Monday Centers, are unchanged');
 for(const key of ['click','Enter',' ']){const a=open('daily-lessons.html','week=10&day=1'),card=a.w.document.querySelectorAll('#path .step')[2];if(key==='click')card.click();else card.dispatchEvent(new a.w.KeyboardEvent('keydown',{key,bubbles:true}));destination(a,'lesson-runner-week10.html',1,2);close(a);}
 for(const embedded of [false,true])for(const[raw,index]of [['0',0],['1',1],['2',2],['3',3],['4',4],['999999',4],['-1',0],['bad',0],['1.5',0],['Infinity',0],['',0]]){
  const a=open(embedded?'lesson-runner-week10.html':'week10-centers.html',route(embedded,raw)+'&stop=3&book=red-dragon'),w=await ready(a);assertPage(w,index);assert.equal(new URL(a.w.location.href).searchParams.get('step'),String(index));assert.equal(a.w.history.length,1);assert.equal(new URL(a.w.location.href).searchParams.has('stop'),false);assert.equal(new URL(a.w.location.href).searchParams.has('book'),false);
  if(embedded){assert.equal(a.w.document.querySelectorAll('iframe').length,1);assert.deepEqual(JSON.parse(a.w.localStorage.getItem('eea-lesson-resume')),{date:dateKey(),week:10,day:1,section:2});}close(a);
 }
 console.log('Tuesday card mouse/keyboard launch, every page, full notes, source links and malformed route normalization pass');
 for(const embedded of [false,true]){
  const a=open(embedded?'lesson-runner-week10.html':'week10-centers.html',route(embedded,0)),w=await ready(a),d=w.document;dialogShim(w);const h=a.w.history.length,ch=w.history.length;
  if(embedded)for(let n=0;n<5;n++){a.w.dispatchEvent(new a.w.Event('pageshow'));a.w.document.getElementById('frame').dispatchEvent(new a.w.Event('load'));}
  assert.equal(a.w.history.length,h);for(let n=1;n<=4;n++){d.getElementById('done').click();assertPage(w,n);assert.equal(a.w.history.length,h+n);}if(embedded)assert.equal(w.history.length,ch,'Iframe never pushes a second history entry');
  for(let n=3;n>=0;n--){a.w.history.back();await until(()=>w.EEASectionState().step===n,'Back '+n);assertPage(w,n);}for(let n=1;n<=4;n++){a.w.history.forward();await until(()=>w.EEASectionState().step===n,'Forward '+n);assertPage(w,n);}
  // Rapid sequential controls still move exactly once per click and never leak
  // into a later section. Each render resets Teacher Notes to collapsed.
  for(let n=0;n<3;n++)d.getElementById('prev').click();assertPage(w,1);for(let n=0;n<2;n++)d.getElementById('done').click();assertPage(w,3);assert.deepEqual(a.navigations,[]);
  d.getElementById('done').click();assertPage(w,4);const url=a.w.location.href,length=a.w.history.length;
  for(let n=0;n<4;n++){d.querySelector('.enlarge-image').click();assert(d.getElementById('image-dialog').open);assert.equal(d.getElementById('enlarged-image').getAttribute('src'),plan[4].img);assert.equal(d.getElementById('enlarged-image').alt,plan[4].alt);d.getElementById('close-image').click();assert(!d.getElementById('image-dialog').open);}assert.equal(a.w.location.href,url);assert.equal(a.w.history.length,length);
  d.querySelector('.enlarge-image').click();a.w.history.back();await until(()=>w.EEASectionState().step===3,'History while modal open');assert(!d.getElementById('image-dialog').open,'History render dismisses modal');a.w.history.forward();await until(()=>w.EEASectionState().step===4,'Forward after modal');assert(!d.getElementById('image-dialog').open);close(a);
 }
 // All three actions from every page, in both contexts, independently validate
 // internal steps, previous-reader entry, and bounded same-Tuesday exits.
 for(const embedded of [false,true])for(let index=0;index<5;index++)for(const button of ['prev','done','exit']){
  const a=open(embedded?'lesson-runner-week10.html':'week10-centers.html',route(embedded,index)),w=await ready(a);a.w.localStorage.setItem('eea-lesson-auto-resume',dateKey());w.document.getElementById(button).click();
  if(button==='prev'&&index>0){assertPage(w,index-1);assert.deepEqual(a.navigations,[]);}else if(button==='done'&&index<4){assertPage(w,index+1);assert.deepEqual(a.navigations,[]);}else if(button==='prev')destination(a,'lesson-runner-week10.html',1,1);else{destination(a,'daily-lessons.html');assert.equal(a.w.localStorage.getItem('eea-lesson-auto-resume'),null);}close(a);
 }
 for(const embedded of [false,true])for(const index of [1,4]){const a=open(embedded?'lesson-runner-week10.html':'week10-centers.html',route(embedded,index)),w=await ready(a);dialogShim(w);w.document.querySelector('.enlarge-image').click();assert.equal(w.document.getElementById('enlarged-image').getAttribute('src'),plan[index].img);w.document.getElementById('close-image').click();w.document.querySelector('.lesson-img').click();assert(w.document.getElementById('image-dialog').open,'Original image tap enlarges');w.document.getElementById('close-image').click();assertPage(w,index);close(a);}
 console.log('Standalone/embedded rapid controls, all 30 boundary cases, repeated preparation, Back/Forward and modal history pass');
 for(const embedded of [false,true]){
  const a=open(embedded?'lesson-runner-week10.html':'week10-centers.html',`week=10&day=${embedded?4:'Friday'}&section=2&step=4&book=red-dragon&stop=2`),w=await ready(a),d=w.document;
  assert.match(w.location.pathname,/week10-centers\.html$/);assert.equal(d.getElementById('center-choice').value,'','Friday requires an explicit teacher choice');assert.equal(d.querySelectorAll('#center-choice option').length,8);assert.equal(d.querySelectorAll('.community-card').length,0);
  assert.deepEqual(copy(w.EEASectionState()),{step:0,index:0,total:0,atStart:true,atEnd:true,center:null,review:false});assert.deepEqual(a.navigations,[]);
  if(embedded){const p=new URL(a.w.location.href).searchParams;assert.equal(p.get('section'),'2');assert.equal(p.get('day'),'4');assert.equal(p.get('step'),'0');for(const key of ['book','stop','center','review'])assert.equal(p.has(key),false);}close(a);
 }

 for(const raw of ['','bad','1','tuesday','NaN','Infinity']){const a=open('week10-centers.html',`day=${raw}&step=4`);await until(()=>a.w.document.readyState==='complete','Invalid day initialized');assert.equal(a.w.document.querySelectorAll('.community-card').length,0);assert.equal(a.navigations.length,1);assert.equal(new URL(a.navigations[0]).pathname,'/v6-test/daily-lessons.html');close(a);}
 for(const embedded of [false,true])for(let day=0;day<5;day++){
  const a=open(embedded?'lesson-runner-week10.html':'week10-read-aloud.html',`week=10&day=${embedded?day:days[day]}&section=1&step=999999`),w=await ready(a);assert(w.EEASectionState().atEnd);w.document.getElementById('next').click();destination(a,'lesson-runner-week10.html',day,2);close(a);
 }
 console.log('Invalid days never substitute Monday; all five reader handoffs and Friday explicit-choice entry pass');
})().catch(error=>{console.error(error);process.exitCode=1;});
