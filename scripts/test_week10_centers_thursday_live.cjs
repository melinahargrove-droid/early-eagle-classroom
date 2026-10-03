// Actual deployed GitHub Pages acceptance. No route interception, runtime/source
// replacement, Date shims or other injected behavior. Run on deployed main only.
// Exhaustive synthetic old-worker and delayed-image cases live in the local suite.
const assert=require('node:assert/strict');
const {target}=require('./test_week10_centers_thursday_target.cjs');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../v6-test');
const base='https://melinahargrove-droid.github.io/early-eagle-classroom/v6-test/';
const out=process.env.WEEK10_THURSDAY_LIVE_SCREENSHOT_DIR;
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const readPlan=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const plan=readPlan('week10-centers-thursday-plan.json');
const earlier=[{day:2,name:'Wednesday',centers:readPlan('week10-centers-wednesday-plan.json'),reader:readPlan('week10-read-aloud-wednesday-plan.json')},{day:0,name:'Monday',centers:readPlan('week10-centers-monday-plan.json'),reader:readPlan('week10-read-aloud-plan.json')},{day:1,name:'Tuesday',centers:readPlan('week10-centers-tuesday-plan.json'),reader:readPlan('week10-read-aloud-tuesday-plan.json')}];
const colorPlans=readPlan('week10-color-read-aloud-plans.json');
const sourcePlan='https://docs.google.com/document/d/1lYe4_XN0sIUJeeEt2kbxzxtzqkteNSX9woHXpfXlb7Y/edit';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
assert.deepEqual(plan.map(s=>s.title),['Class Soup']);
assert.equal(plan.length,1);
async function fridaySelector(page,standalone=false){
 const frame=()=>standalone?page:page.frames().find(f=>f.parentFrame()===page.mainFrame());
 await until(async()=>frame()?.url().includes('week10-centers.html')&&await frame().locator('#center-choice').count()===1,'Friday explicit-choice selector');
 const f=frame();assert.equal(await f.locator('#center-choice').inputValue(),'');assert.equal(await f.locator('#center-choice option').count(),8);assert.equal(await f.locator('.community-card').count(),0);assert.equal(await f.locator('script[src]').getAttribute('src'),'week10-centers-v5.js');
 assert.deepEqual(await f.evaluate(()=>EEASectionState()),{step:0,index:0,total:0,atStart:true,atEnd:true,center:null,review:false});assert.equal(page.frames().length,standalone?1:2);
 if(!standalone){const p=new URL(page.url()).searchParams;assert.equal(p.get('day'),'4');assert.equal(p.get('section'),'2');assert.equal(p.get('step'),'0');for(const key of ['book','stop','center','review'])assert(!p.has(key));}return f;
}
async function until(check,label,ms=30000,interval=100){const end=Date.now()+ms;let last;while(Date.now()<end){try{if(await check())return;}catch(error){last=error;}await delay(interval);}assert.fail(label+(last?': '+last.message:''));}
async function shot(page,name){if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});}}
const runtimeFiles=['week10-centers-v5.js','week10-read-aloud-v9.js'];
const runtimeCaptures=new WeakMap();
function captureRuntimeBytes(page,expected,verified){
 const captures=new Map();
 const onResponse=response=>{
  const url=new URL(response.url()),file=runtimeFiles.find(name=>url.origin===new URL(base).origin&&url.pathname===new URL(base+name).pathname);
  if(!file||captures.has(file))return;
  // Capture the first actual browser response for each required runtime in this
  // fresh viewport context. Readiness awaits its body before any next action.
  // Later duplicate/redirect responses are unnecessary and can lose their CDP
  // resource handle as the document is discarded. Never defer them to the end.
  const result=Promise.resolve().then(()=>response.body()).then(body=>{
   const digest=hash(body);assert.equal(digest,expected[file],'Browser consumed exact deployed '+file);verified[file]=digest;return{ok:true};
  }).catch(error=>({ok:false,error:new Error('Browser runtime capture failed for '+file+': '+error.message,{cause:error})}));
  // Rejections become explicit results immediately, so a body failure cannot
  // escape as an unhandled rejection while unrelated UI checks are running.
  captures.set(file,result);
 };
 page.on('response',onResponse);
 return{
  async verify(file){assert(runtimeFiles.includes(file));await until(()=>captures.has(file),'Browser response observed for '+file);const result=await captures.get(file);if(!result.ok)throw result.error;assert.equal(verified[file],expected[file],'Required browser runtime hash is present');},
  async finish(){for(const file of runtimeFiles)await this.verify(file);assert.deepEqual(Object.keys(verified).sort(),runtimeFiles);page.off('response',onResponse);}
 };
}
async function verifyRuntime(page,file){const runtime={'week10-centers.html':'week10-centers-v5.js','week10-read-aloud.html':'week10-read-aloud-v9.js'}[file];if(runtime)await runtimeCaptures.get(page).verify(runtime);}

function child(page){return page.frames().find(f=>f.parentFrame()===page.mainFrame());}
async function section(page,file){await until(async()=>{const f=child(page);return f?.url().includes(file)&&await f.evaluate(()=>typeof window.EEASectionState==='function');},file+' initialized');await verifyRuntime(page,file);assert.equal(page.frames().length,2);return child(page);}
async function overview(page,day=3){await until(async()=>{const u=new URL(page.url());return u.pathname.endsWith('/daily-lessons.html')&&u.searchParams.get('day')===String(day)&&u.searchParams.get('week')==='10'&&await page.locator('#path .step').count()===3;},'same-day overview');assert.equal(page.frames().length,1);}
async function centers(page,index=0,standalone=false){
 await until(async()=>{const f=standalone?page:child(page);return f?.url().includes('week10-centers.html')&&await f.evaluate(i=>typeof EEASectionState==='function'&&EEASectionState().step===i,index);},'Thursday center '+index);await verifyRuntime(page,'week10-centers.html');
 const f=standalone?page:child(page),url=new URL(page.url());
 assert.deepEqual(await f.evaluate(()=>EEACentersPlan),plan);assert.deepEqual(await f.evaluate(()=>EEASectionState()),{step:index,index,total:1,atStart:true,atEnd:true});
 assert.equal(url.searchParams.get('day'),standalone?'Thursday':'3');assert.equal(url.searchParams.get('section'),'2');assert.equal(url.searchParams.get('week'),'10');assert.equal(url.searchParams.get('step'),String(index));assert(!url.searchParams.has('stop'));assert(!url.searchParams.has('book'));
 assert.equal(page.frames().length,standalone?1:2);assert.equal(await f.locator('script[src]').getAttribute('src'),'week10-centers-v5.js');
 assert.equal(await f.locator('.community-copy h2').textContent(),plan[index].title);assert.equal(await f.locator('.lead').textContent(),plan[index].lead);assert.equal(await f.locator('#count').textContent(),'1 of 1');
 assert.equal(await f.locator('#prev').textContent(),'← Read Aloud');assert.equal(await f.locator('#done').textContent(),'Finish Centers →');assert.equal(await f.locator('.enlarge-image').textContent(),'Enlarge image');
 assert.equal(await f.locator('.community-card').count(),1);assert.equal(await f.locator('select,iframe,#activityMenu').count(),0);assert(!await f.locator('.community-notes').evaluate(e=>e.open));return f;
}
async function imageReady(frame,selector='.lesson-img, #bookImg',expected){const img=frame.locator(selector);await img.evaluate(async img=>{await img.decode();if(!img.naturalWidth||!img.naturalHeight)throw Error('Image did not decode');});if(expected){assert.equal(await img.getAttribute('src'),expected.img);assert.equal(await img.getAttribute('alt'),expected.alt);assert.deepEqual(await img.evaluate(i=>[i.naturalWidth,i.naturalHeight]),[1536,1024]);}}
async function fit(frame){const result=await frame.locator('.community-copy').evaluate(el=>({width:el.scrollWidth<=el.clientWidth+1,height:el.scrollHeight<=el.clientHeight+1,top:el.scrollTop}));assert.deepEqual(result,{width:true,height:true,top:0},'Closed introduction fits without scrolling');for(const selector of ['#prev','#done','#exit','#count','.community-copy h2','.lead','.community-notes summary','.enlarge-image']){if(await frame.locator(selector).count())await target(frame.locator(selector),selector);}}
async function verifyNotes(page,f,index,suffix){
 const before=page.url(),length=await page.evaluate(()=>history.length),state=await f.evaluate(()=>EEASectionState()),p=plan[index];
 assert.deepEqual(await f.locator('.community-notes-content > h3').allTextContents(),[...p.notes.map(n=>n[0]),'Source materials']);
 assert.deepEqual(await f.locator('.community-notes-content > p').allTextContents(),[...p.notes.flatMap(n=>n[1]),'Focus on Pre-K 3s | Boston Public Schools Early Childhood Department P-2']);
 assert.deepEqual(await f.locator('.community-notes-content a').evaluateAll(links=>links.map(a=>[a.textContent,a.getAttribute('href')])),[...p.links,['Original Week 2 lesson',p.source],['Original Week 2 Plan',sourcePlan]]);
 assert(await f.locator('.community-notes-content a').evaluateAll(links=>links.every(a=>a.target==='_blank'&&a.relList.contains('noopener')&&a.relList.contains('noreferrer'))));
 for(let n=0;n<3;n++){
  await f.locator('summary').click();assert(await f.locator('.community-notes').evaluate(e=>e.open));
  if(n===0){await shot(page,`thursday-notes-${index}-${suffix}`);const links=f.locator('.community-notes-content a');for(let i=0;i<await links.count();i++){await links.nth(i).scrollIntoViewIfNeeded();await target(links.nth(i),'Visible source link '+i);}for(const s of ['#prev','#done','#exit'])await target(f.locator(s),'Notes-open '+s);await shot(page,`thursday-note-links-${index}-${suffix}`);}
  await f.locator('summary').click();assert(!await f.locator('.community-notes').evaluate(e=>e.open));
 }
 assert.equal(page.url(),before);assert.equal(await page.evaluate(()=>history.length),length);assert.deepEqual(await f.evaluate(()=>EEASectionState()),state);
}
async function verifyDialog(page,f,index,suffix){
 const before=page.url(),length=await page.evaluate(()=>history.length),state=await f.evaluate(()=>EEASectionState());
 for(const [open,close]of [['keyboard','button'],['button','Escape'],['image','button'],['image','Escape'],['button','backdrop']]){
  if(open==='keyboard'){await f.locator('.enlarge-image').focus();await page.keyboard.press('Enter');}else await f.locator(open==='image'?'.lesson-img':'.enlarge-image').click();
  assert(await f.locator('#image-dialog').evaluate(e=>e.open));assert.equal(await f.locator('#image-dialog').getAttribute('aria-label'),'Enlarged lesson image');await imageReady(f,'#enlarged-image',plan[index]);
  assert(await f.locator('#close-image').evaluate(e=>e===document.activeElement));await target(f.locator('#close-image'),'Dialog Close');await target(f.locator('#enlarged-image'),'Enlarged image');
  assert.equal(await f.locator('#enlarged-image').evaluate(e=>getComputedStyle(e).objectFit),'contain');if(open==='keyboard')await shot(page,`thursday-enlarged-${index}-${suffix}`);
  if(close==='button')await f.locator('#close-image').click();else if(close==='Escape')await page.keyboard.press('Escape');else{const box=await f.locator('#image-dialog').boundingBox();assert(box.x>2);await page.mouse.click(box.x-2,box.y+Math.min(30,box.height/2));}assert(!await f.locator('#image-dialog').evaluate(e=>e.open));
  assert(await f.locator('.enlarge-image').evaluate(e=>e===document.activeElement),'Every dismissal, including image tap, returns focus to Enlarge image');
  assert.equal(page.url(),before);assert.equal(await page.evaluate(()=>history.length),length);assert.deepEqual(await f.evaluate(()=>EEASectionState()),state);
 }
}
async function traverseReader(page,expected,suffix){
 let f=await section(page,'week10-read-aloud.html');assert.equal(await f.locator('script[src]').last().getAttribute('src'),'week10-read-aloud-v9.js');assert.deepEqual(await f.evaluate(()=>EEAReadAloudPlan),expected);
 for(let i=0;i<expected.steps.length;i++){
  assert.equal(await f.evaluate(()=>EEASectionState().index),i);await imageReady(f);
  for(let n=0;n<expected.steps[i].stops.length;n++)await f.locator('#next').click();
  if(i===expected.steps.length-1){assert.equal(await f.locator('#next').textContent(),'Next: Centers →');await shot(page,'reader-closing-'+suffix);}await f.locator('#next').click();
 }return section(page,'week10-centers.html');
}

async function main(){
 const {chromium,request}=require('playwright');
 if(process.env.GITHUB_ACTIONS==='true')assert.equal(process.env.GITHUB_REF,'refs/heads/main','Live acceptance is main-only');
 const api=await request.newContext();
 const files=['week10-centers-v5.js','week10-read-aloud-v9.js','week10-centers.html','week10-read-aloud.html','lesson-runner-week10.html','daily-lessons.html','sw.js','week10-centers-thursday-plan.json','week10-color-read-aloud-plans.json','week10-centers-monday-plan.json','week10-centers-tuesday-plan.json','week10-centers-wednesday-plan.json','week10-centers-v3.js','week10-read-aloud-v7.js'];
 const expected=Object.fromEntries(files.map(f=>[f,hash(fs.readFileSync(path.join(root,f)))]));
 try{await until(async()=>{for(const file of files){const response=await api.get(base+file+'?live-acceptance='+Date.now(),{headers:{'Cache-Control':'no-cache'}});if(!response.ok()||hash(await response.body())!==expected[file])return false;}return true;},'Pages must serve exact checked-out runtime/routing/SW/plan bytes',20*60*1000,5000);}catch(error){await api.dispose();throw error;}
 const verifiedAssets={};for(const file of new Set([...plan,...earlier.flatMap(p=>p.centers)].map(p=>p.img))){const response=await api.get(base+file);assert(response.ok());const digest=hash(await response.body());assert.equal(digest,hash(fs.readFileSync(path.join(root,file))));verifiedAssets[file]=digest;}await api.dispose();
 console.log('Actual Pages runtime/routing/SW/plan and original source-image hashes verified',expected,verifiedAssets);
 const browserRuntimeHashes={},browser=await chromium.launch({headless:true});
 try{for(const viewport of [{width:1280,height:800},{width:1180,height:757}]){
  const suffix=viewport.width+'x'+viewport.height,context=await browser.newContext({viewport,serviceWorkers:'allow'}),page=await context.newPage(),errors=[],missing=[];browserRuntimeHashes[suffix]={};page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))missing.push(r.status()+' '+r.url());});const captures=captureRuntimeBytes(page,expected,browserRuntimeHashes[suffix]);runtimeCaptures.set(page,captures);
  await page.goto(base+'daily-lessons.html?week=10&day=3');await overview(page);assert.deepEqual(await page.locator('#path .step b').allTextContents(),['Community Meeting','Read Aloud','Centers']);for(const selector of ['#path .step','#start','#days button','#weeknav button','.home','.pace']){const items=page.locator(selector);for(let i=0;i<await items.count();i++)await target(items.nth(i),'Overview '+selector);}await shot(page,'thursday-overview-'+suffix);
  await page.getByRole('button',{name:'Open Community Meeting',exact:true}).click();let f=await section(page,'week10-community.html');await f.locator('#done').click();f=await section(page,'week10-read-aloud.html');assert(await f.locator('#bookSelect').isVisible());
  // Both source-backed physical books must finish to the same Thursday center.
  for(const standalone of [false,true])for(const book of ['green-chile','red-dragon']){
   await page.goto(base+(standalone?'week10-read-aloud.html?day=Thursday':'lesson-runner-week10.html?week=10&day=3&section=1')+'&book='+book);if(standalone){await page.waitForFunction(()=>typeof EEASectionState==='function');await verifyRuntime(page,'week10-read-aloud.html');f=page;}else f=await section(page,'week10-read-aloud.html');const expectedReader=colorPlans[book].Thursday;assert.deepEqual(await f.evaluate(()=>EEAReadAloudPlan),expectedReader);assert.equal(await f.locator('#bookSelect').inputValue(),book);
   for(let i=0;i<expectedReader.steps.length;i++){assert.equal(await f.evaluate(()=>EEASectionState().step),i);assert.equal(await f.locator('#prompt').textContent(),expectedReader.steps[i].prompt);assert.equal(await f.locator('#bookImg').getAttribute('src'),null);assert.match(await f.locator('#bookCue').textContent(),/physical book/);if(i<expectedReader.steps.length-1)await f.locator('#next').click();}
   assert.equal(await f.locator('#next').textContent(),'Next: Centers →');await shot(page,`thursday-${book}-${standalone?'standalone':'embedded'}-closing-${suffix}`);await f.locator('#next').click();f=await centers(page);await page.goBack();if(standalone){await page.waitForFunction(()=>typeof EEASectionState==='function'&&EEASectionState().atEnd);f=page;}else f=await section(page,'week10-read-aloud.html');assert.equal(await f.evaluate(()=>EEASectionState().book),book);assert(await f.evaluate(()=>EEASectionState().atEnd));await page.goForward();f=await centers(page);await f.locator('#prev').click();f=await section(page,'week10-read-aloud.html');assert.equal(new URL(page.url()).searchParams.get('day'),'3');assert.equal(await f.evaluate(()=>EEASectionState().step),0);assert.equal(await f.evaluate(()=>EEASectionState().book),book);await f.locator('#backBtn').click();await overview(page);
  }
  for(const standalone of [false,true]){
   const route=base+(standalone?'week10-centers.html?day=Thursday':'lesson-runner-week10.html?week=10&day=3&section=2')+'&step=0';const mode=standalone?'standalone':'embedded';
   await page.goto(route);f=await centers(page,0,standalone);await imageReady(f,'.lesson-img',plan[0]);await fit(f);await shot(page,`thursday-class-soup-${mode}-${suffix}`);await verifyNotes(page,f,0,mode+'-'+suffix);await verifyDialog(page,f,0,mode+'-'+suffix);
   await f.locator('.enlarge-image').click();await page.goBack();await overview(page);await page.goForward();f=await centers(page,0,standalone);assert(!await f.locator('#image-dialog').evaluate(e=>e.open));await f.locator('.enlarge-image').click();await page.reload();f=await centers(page,0,standalone);assert(!await f.locator('#image-dialog').evaluate(e=>e.open));
   await f.locator('#done').click();await overview(page);await shot(page,`thursday-finished-${mode}-${suffix}`);for(let n=0;n<2;n++){await page.goBack();await centers(page,0,standalone);await page.goForward();await overview(page);}await page.reload();await overview(page);
   for(const button of ['prev','exit','done']){await page.goto(route);f=await centers(page,0,standalone);await f.locator('#'+button).click();if(button==='prev'){f=await section(page,'week10-read-aloud.html');assert.equal(new URL(page.url()).searchParams.get('day'),'3');await f.locator('#backBtn').click();}await overview(page);}
  }
  for(const key of ['Enter','Space']){await page.getByRole('button',{name:'Open Centers',exact:true}).press(key);f=await centers(page);await f.locator('#exit').click();await overview(page);}
  // Full earlier plans and reader transitions, not title-only readiness checks.
  for(const previous of earlier){await page.goto(base+'daily-lessons.html?week=10&day='+previous.day);await page.getByRole('button',{name:'Open Read Aloud',exact:true}).click();f=await traverseReader(page,previous.reader,previous.name.toLowerCase()+'-'+suffix);assert.deepEqual(await f.evaluate(()=>EEACentersPlan),previous.centers);for(let i=0;i<previous.centers.length;i++){assert.equal(await f.locator('.community-copy h2').textContent(),previous.centers[i].title);await imageReady(f);await fit(f);assert.deepEqual(await f.locator('.community-notes-content > p').allTextContents(),[...previous.centers[i].notes.flatMap(n=>n[1]),'Focus on Pre-K 3s | Boston Public Schools Early Childhood Department P-2']);await shot(page,`${previous.name.toLowerCase()}-center-${i}-${suffix}`);await f.locator('#done').click();}await overview(page,previous.day);}
  for(const book of ['green-chile','red-dragon']){await page.goto(base+'lesson-runner-week10.html?week=10&day=4&section=1&book='+book+'&step=999999');f=await section(page,'week10-read-aloud.html');assert.equal(await f.locator('#next').textContent(),'Next: Centers →');await f.locator('#next').click();f=await fridaySelector(page);await f.locator('#exit').click();await overview(page,4);}await page.goto(base+'week10-centers.html?day=Friday');await fridaySelector(page,true);await shot(page,'friday-ready-no-default-'+suffix);await page.locator('#exit').click();await overview(page,4);
  for(const day of [0,1]){await page.goto(base+'daily-lessons.html?week=11&day='+day);await page.getByRole('button',{name:'Open Read Aloud',exact:true}).click();f=await section(page,'week11-read-aloud.html');await imageReady(f);}for(const readyDay of [2,3]){await page.goto(base+'daily-lessons.html?week=11&day='+readyDay);assert.deepEqual(await page.locator('#path .step b').allTextContents(),['Community Meeting','Centers']);assert.equal(await page.locator('#start').isDisabled(),false);assert.equal(await page.locator('#start').textContent(),'Open Community Meeting →');assert.equal(await page.getByRole('button',{name:'Open Read Aloud',exact:true}).count(),0);}
  await captures.finish();assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);await context.close();console.log('Actual Pages Thursday Class Soup, both books/all handoffs, earlier full plans, notes/enlarge/Escape/backdrop/focus, native restoration and exact browser-consumed runtime hashes pass',suffix);
 }}finally{await browser.close();}
 if(out)fs.writeFileSync(path.join(out,'verified-bytes.json'),JSON.stringify({base,commit:process.env.GITHUB_SHA||null,expected,verifiedAssets,browserRuntimeHashes,verification:'Actual deployed Pages in Chromium; no source injection, route interception, Date shim or mocked runtime'},null,2));
}
module.exports={captureRuntimeBytes};
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
