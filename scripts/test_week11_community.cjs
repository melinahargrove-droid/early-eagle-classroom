// Unit 2 Week 3 mindful Community Meeting: real production DOM and source
// integrity (jsdom 26.1.0). Full browser navigation/layout lives in _browser.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const {implForWrapper}=require('jsdom/lib/jsdom/living/generated/utils');
const {serializeURL}=require('whatwg-url');
const {root,read,hash,days,titles,asset,images,imageHashes,links,directions,sharedNotes,until}=require('./test_week11_community_shared.cjs');
const origin='https://eea.test/v6-test/',copy=value=>JSON.parse(JSON.stringify(value));
const dateKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
class AppFiles extends ResourceLoader{fetch(url){assert(url.startsWith(origin),'Only local application files are loaded');return Promise.resolve(read(new URL(url).pathname.slice('/v6-test/'.length)));}}
function open(file,query,storage={}){const errors=[],navigations=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const w=new JSDOM(read(file),{url:origin+file+'?'+query,runScripts:'dangerously',resources:new AppFiles(),virtualConsole:vc,beforeParse(w){for(const [k,v] of Object.entries(storage))w.localStorage.setItem(k,v);implForWrapper(w.location)._locationObjectNavigate=u=>navigations.push(serializeURL(u));}}).window;return {w,errors,navigations};}
async function ready(a,embedded){const frame=embedded?a.w.document.getElementById('frame'):null;await until(()=>a.w.document.readyState==='complete'&&(!frame||frame.contentDocument?.readyState==='complete')&&typeof(frame?frame.contentWindow:a.w).EEASectionState==='function','Production Community DOM ready');return frame?frame.contentWindow:a.w;}
function clean(a){assert.deepEqual(a.errors,[]);a.w.close();}
function destination(a,file,day,section){assert.equal(a.navigations.length,1,'Exactly one top-level boundary navigation');const u=new URL(a.navigations[0]);assert.equal(u.pathname,'/v6-test/'+file);assert.equal(u.searchParams.get('week'),'11');assert.equal(u.searchParams.get('day'),String(day));if(section!==undefined)assert.equal(u.searchParams.get('section'),String(section));}
function jpegSize(bytes){assert.equal(bytes.readUInt16BE(0),0xffd8);let offset=2;while(offset<bytes.length){assert.equal(bytes[offset++],0xff);while(bytes[offset]===0xff)offset++;const marker=bytes[offset++],len=bytes.readUInt16BE(offset);if([0xc0,0xc1,0xc2].includes(marker))return[bytes.readUInt16BE(offset+5),bytes.readUInt16BE(offset+3)];offset+=len;}assert.fail('JPEG SOF header');}
function verify(w,day,visual=day%2?'square':'illustration'){
 const d=w.document;assert.equal(d.querySelectorAll('.community-card').length,1);assert.equal(d.querySelector('h2').textContent,titles[day%2]);assert.equal(d.getElementById('sub').textContent,days[day]+' · Mindful practice');
 assert.deepEqual(copy(w.EEASectionState()),{index:0,step:0,total:1,atStart:true,atEnd:true,visual});assert.equal(d.getElementById('practice-image').getAttribute('src'),asset+images[visual]);assert.match(d.getElementById('practice-image').alt,/^Original /);
 assert.equal(d.querySelectorAll('iframe,select,#activityMenu,#count').length,0);assert.equal(d.querySelectorAll('.teaching-steps li').length,day%2?4:3);assert.equal(d.querySelectorAll('#chair,#illustration').length,day%2?0:2);
 const sections=[];for(const n of d.querySelector('.community-notes-content').children){if(n.tagName==='H3'){if(n.textContent==='Source materials')break;sections.push([n.textContent,[]]);}else if(n.tagName==='P')sections.at(-1)[1].push(n.textContent);}assert.deepEqual(sections,[['Complete mindful practice',directions[day%2]],...sharedNotes]);
 assert.deepEqual([...d.querySelectorAll('.community-notes-content a')].map(a=>[a.textContent,a.getAttribute('href')]),links);for(const a of d.querySelectorAll('.community-notes-content a')){assert.equal(a.target,'_blank');assert(a.relList.contains('noopener')&&a.relList.contains('noreferrer'));}
 assert.match(d.querySelector('.community-notes-content').textContent,/Original visual pages and credits are preserved without cropping or redrawing/);
 assert.equal(d.getElementById('prev').textContent,'← Day Overview');assert.equal(d.getElementById('done').textContent,day<2?'Next: Read Aloud →':'Next: Centers →');assert.equal(d.getElementById('exit').getAttribute('aria-label'),'Return to Day Overview');
 const url=w.location.href,len=w.history.length,notes=d.querySelector('details');assert.equal(notes.open,false);for(let i=0;i<4;i++){notes.querySelector('summary').click();assert(notes.open);notes.querySelector('summary').click();assert.equal(notes.open,false);}assert.equal(w.location.href,url);assert.equal(w.history.length,len);
}
(async()=>{
 const provenance=read(asset+'SOURCE.md').toString();assert.match(provenance,/dc39c7c3a618bbba3b8f2262e6e62484d9087569eb1dab1ff06ce7a0d0d55b22/);assert.match(provenance,/PDF is not bundled/);
 for(const [name,digest]of Object.entries(imageHashes)){const bytes=read(asset+name);assert.equal(hash(bytes),digest);assert.deepEqual(jpegSize(bytes),[1855,2400]);assert(provenance.includes(digest));}
 assert.equal(hash(Buffer.from(fs.readFileSync(path.join(__dirname,'fixtures/week11-community-v100-sw.js'),'utf8').replace(/\r\n/g,'\n'))),'da3b346cfe34d709be58cb3a9ea07fb98ba48b62d38cd53353d1dfc7ac467341','Exact deployed old v100 fixture');
 assert.match(read('week11-community.html').toString(),/<script src="week11-community-v1\.js"><\/script>/,'Versioned, query-independent new script path');
 console.log('PASS: original PDF provenance, exact 3 full-page JPEG hashes/dimensions, exact v100 fixture and versioned runtime');
 for(const embedded of [false,true])for(let day=0;day<5;day++){
  const file=embedded?'lesson-runner-week11.html':'week11-community.html',query='week=11&day='+(embedded?day:days[day])+'&section=2';
  const a=open(file,query);const w=await ready(a,embedded);verify(w,day);
  if(embedded){assert.deepEqual(JSON.parse(a.w.localStorage.getItem('eea-lesson-resume')),{date:dateKey(),week:11,day,section:2});assert.equal(a.w.document.querySelectorAll('iframe').length,1);}
  if(day%2===0){const length=a.w.history.length;for(let n=0;n<4;n++){const visual=n%2?'illustration':'chair';w.document.getElementById(visual).click();verify(w,day,visual);assert.equal(a.w.history.length,length+n+1,'Only owner adds one history entry');assert.equal(new URL(a.w.location.href).searchParams.get('visual'),visual);assert.equal(new URL(w.location.href).searchParams.get('visual'),visual);w.document.getElementById(visual).click();assert.equal(a.w.history.length,length+n+1);}}
  for(let n=0;n<3;n++)a.w.dispatchEvent(new a.w.Event('pageshow'));assert.deepEqual(a.navigations,[]);clean(a);
  for(const id of ['prev','exit','done']){const b=open(file,query,{'eea-lesson-auto-resume':dateKey(),'eea-lesson-resume':JSON.stringify({date:dateKey(),week:11,day,section:2})});const cw=await ready(b,embedded);for(let n=0;n<5;n++)cw.document.getElementById(id).click();destination(b,id==='done'?'lesson-runner-week11.html':'daily-lessons.html',day,id==='done'?(day<2?0:1):undefined);if(id!=='done')assert.equal(b.w.localStorage.getItem('eea-lesson-auto-resume'),null);assert.equal(JSON.parse(b.w.localStorage.getItem('eea-lesson-resume')).section,2);clean(b);}
 }
 console.log('PASS: all five exact practices/notes/credits, repeated notes, synchronous visual restoration, parent-owned history, idempotent boundaries and saved section2');
 for(const embedded of [false,true])for(let day=0;day<5;day++)for(const visual of ['chair','illustration','square','bad','']){const a=open(embedded?'lesson-runner-week11.html':'week11-community.html','week=1&day='+day+'&section=2&step=88&stop=7&book=stale&center=stale&review=1&visual='+visual);const w=await ready(a,embedded),expected=day%2?'square':visual==='chair'?'chair':'illustration';verify(w,day,expected);const p=new URL(a.w.location.href).searchParams;assert.equal(p.get('week'),'11');assert.equal(p.get('visual'),expected);for(const key of ['step','stop','book','center','review'])assert.equal(p.has(key),false,'No leaked '+key);clean(a);}
 console.log('PASS: explicit chair restore, invalid visual normalization, stale unrelated route fields removed');
 for(let day=0;day<5;day++){
  const a=open('daily-lessons.html','week=11&day='+day),d=a.w.document;assert.equal(d.querySelectorAll('#path .step').length,day<2?3:2);assert.equal(d.querySelector('#path .step span').textContent,titles[day%2]);d.getElementById('start').click();destination(a,'lesson-runner-week11.html',day,2);clean(a);
  for(const section of day<2?[0,1,2]:[1,2]){const storage={'eea-lesson-auto-resume':dateKey(),'eea-lesson-resume':JSON.stringify({date:dateKey(),week:11,day,section})};const b=open('daily-lessons.html','week=11&day='+day,storage);destination(b,'lesson-runner-week11.html',day,section);assert.equal(b.w.localStorage.getItem('eea-lesson-auto-resume'),null);assert.equal(JSON.parse(b.w.localStorage.getItem('eea-lesson-resume')).section,section);clean(b);}
  for(const section of day<2?[0,1]:[1]){const b=open('lesson-runner-week11.html','week=11&day='+day+'&section='+section+'&step=1');const w=await ready(b,true);assert.equal(w.EEASectionState().step,1);assert(w.location.pathname.endsWith(section===0?'week11-read-aloud.html':'week11-centers.html'));assert.equal(JSON.parse(b.w.localStorage.getItem('eea-lesson-resume')).section,section);clean(b);}
 }
 console.log('PASS: all 5 overview launches, all 12 saved section routes, and existing reader section0 / Center section1 deep links');
})().catch(error=>{console.error(error);process.exitCode=1;});
