// Source-backed Thu/Fri physical-book lessons, existing selector, and parent-owned history.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'../v6-test'),origin='https://eea.test/v6-test/';
const plans=JSON.parse(fs.readFileSync(path.join(root,'week10-color-read-aloud-plans.json')));
class Files extends ResourceLoader{fetch(url){return url.startsWith(origin)?Promise.resolve(fs.readFileSync(path.join(root,new URL(url).pathname.slice('/v6-test/'.length)))):null;}}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let n=0;n<200;n++){if(fn())return;await delay(10);}assert.fail('Reader did not initialize');}
function open(file,query){const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));return{errors,w:new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:origin+file+'?'+query,runScripts:'dangerously',resources:new Files(),virtualConsole:vc}).window};}
(async()=>{
 for(const [day,dayIndex] of [['Thursday',3],['Friday',4]])for(const book of Object.keys(plans)){
  const a=open('lesson-runner-week10.html',`week=10&day=${dayIndex}&section=1&book=${book}`),w=a.w,f=w.document.getElementById('frame');await until(()=>f.contentWindow?.EEAReadAloudPlan);const c=f.contentWindow,d=c.document,p=plans[book][day];
  assert.deepEqual(JSON.parse(JSON.stringify(c.EEAReadAloudPlan)),p);assert.equal(d.querySelector('#bookChoice').hidden,false);assert.equal(d.querySelector('#bookSelect').value,book);
  assert.match(p.teacherNotes,/physical classroom book/);assert.equal(p.mediaStatus,'waiting-for-book-pages');assert.equal(p.steps.filter(s=>s.bookPage||s.img).length,0,'No fake book pages or empty image URLs');
  for(const [i,s]of p.steps.entries()){
   assert.equal(c.EEASectionState().step,i);assert.equal(d.querySelector('#prompt').textContent,s.prompt);assert.equal(d.querySelector('#bookImg').hidden,true);assert.equal(d.querySelector('#bookImg').hasAttribute('src'),false);assert.match(d.querySelector('#bookCue').textContent,/physical book/);assert.equal(new URL(w.location.href).searchParams.get('book'),book);assert.equal(new URL(w.location.href).searchParams.get('day'),String(dayIndex));
   const url=w.location.href,h=w.history.length;for(let n=0;n<3;n++){d.querySelector('#teacherNotes summary').click();d.querySelector('#teacherNotes summary').click();}assert.equal(w.location.href,url);assert.equal(w.history.length,h);
   for(const el of d.querySelectorAll('#bookResources a'))assert(el.href.startsWith('https://drive.google.com/'));
   if(i<p.steps.length-1)d.querySelector('#next').click();
  }
  for(let n=0;n<4;n++){
   const selected=n%2?'red-dragon':'green-chile';d.querySelector('#bookSelect').value=selected;d.querySelector('#bookSelect').dispatchEvent(new c.Event('change'));
   assert.equal(c.EEASectionState().book,selected);assert.equal(c.EEASectionState().step,0);assert.equal(w.localStorage.getItem('eea-u2w2-color-book'),selected);assert.equal(d.querySelector('#teacherNotes').open,false);
   w.dispatchEvent(new w.Event('pageshow'));f.dispatchEvent(new w.Event('load'));d.querySelector('#next').click();assert.equal(c.EEASectionState().step,1,'Repeated setup does not duplicate handlers');
  }
  assert.deepEqual(a.errors,[]);w.close();
 }
 const green=plans['green-chile'],red=plans['red-dragon'];
 assert.deepEqual(green.Friday.steps.filter(s=>s.printedPages.length).map(s=>s.printedPages),[[3,4],[5,6],[8,9]]);
 assert.deepEqual(red.Friday.steps.filter(s=>s.printedPages.length).map(s=>s.printedPages),[[1,2],[21,22],[15,16],[27,28]]);
 assert.match(green.Friday.steps[1].note,/not read in its entirety/);assert.match(red.Friday.steps[4].note,/No digital page mapping/);
 assert.match(green.Thursday.steps.find(s=>s.printedPages[0]===9).prompt,/flicker/);assert.match(red.Thursday.steps.find(s=>s.printedPages[0]===15).prompt,/wish.*shimmering/);
 for(const raw of ['-1','2.5','bad','Infinity','9999']){const a=open('week10-read-aloud.html',`day=Friday&book=red-dragon&step=${raw}&stop=999`);await until(()=>a.w.EEAReadAloudPlan);assert.equal(a.w.EEASectionState().step,raw==='9999'?red.Friday.steps.length-1:0);assert.equal(a.w.EEASectionState().stop,0);assert.equal(a.w.EEASectionState().book,'red-dragon');assert.deepEqual(a.errors,[]);a.w.close();}
 const invalid=open('week10-read-aloud.html','day=Thursday&book=invalid');await until(()=>invalid.w.EEAReadAloudPlan);assert.equal(invalid.w.EEASectionState().book,'green-chile');assert.equal(new URL(invalid.w.location.href).searchParams.get('book'),'green-chile');invalid.w.close();
 console.log('Both books × Thu/Fri source plans, physical cues, original links, repeated selector/notes/setup, page-label anomalies and malformed routes pass');
})().catch(e=>{console.error(e);process.exitCode=1;});
