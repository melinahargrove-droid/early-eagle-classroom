// Actual deployed GitHub Pages acceptance. No route mocking or source injection.
// Local fixture suites own exhaustive malformed routes and old-worker simulation.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {chromium,request}=require('playwright');
const root=path.resolve(__dirname,'../v6-test');
const base='https://melinahargrove-droid.github.io/early-eagle-classroom/v6-test/';
const out=process.env.WEEK10_TUESDAY_LIVE_SCREENSHOT_DIR;
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const plan=JSON.parse(fs.readFileSync(path.join(root,'week10-centers-tuesday-plan.json')));
const wednesdayPlan=JSON.parse(fs.readFileSync(path.join(root,'week10-centers-wednesday-plan.json')));
assert.deepEqual(wednesdayPlan.map(s=>s.title),['Collecting Leaves','Multilingual Color Poem or Book']);
async function until(check,label,ms=30000){const end=Date.now()+ms;while(Date.now()<end){try{if(await check())return;}catch{}await delay(100);}assert.fail(label);}
async function shot(page,name){if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});}}
function child(page){return page.frames().find(f=>f.parentFrame()===page.mainFrame());}
async function section(page,file){await until(async()=>{const f=child(page);return f?.url().includes(file)&&await f.evaluate(()=>typeof window.EEASectionState==='function');},file+' initialized');return child(page);}
async function imageReady(frame){await frame.locator('.lesson-img, #bookImg').evaluate(async img=>{await img.decode();if(!img.naturalWidth)throw Error('Image did not decode');});}
async function overview(page,day){await until(()=>{const u=new URL(page.url());return u.pathname.endsWith('/daily-lessons.html')&&u.searchParams.get('day')===String(day)&&u.searchParams.get('week')==='10';},'same-day overview');assert.equal(page.frames().length,1);}
async function fit(frame){const result=await frame.locator('.community-copy').evaluate(el=>({width:el.scrollWidth<=el.clientWidth+1,height:el.scrollHeight<=el.clientHeight+1}));assert.deepEqual(result,{width:true,height:true},'Closed introduction fits without scrolling');for(const selector of ['#prev','#done','#exit']){assert(await frame.locator(selector).isVisible());}}
(async()=>{
 const api=await request.newContext();
 // Pages and GitHub Actions deploy independently. Accept only exact expected
 // runtime and routing bytes; no stale result is counted as live acceptance.
 const files=['week10-centers-v3.js','week10-read-aloud-v7.js','week10-centers.html','week10-read-aloud.html','lesson-runner-week10.html','daily-lessons.html','week10-centers-wednesday-plan.json'];
 const expected=Object.fromEntries(files.map(f=>[f,hash(fs.readFileSync(path.join(root,f)))]));
 await until(async()=>{for(const file of files){const response=await api.get(base+file+'?live-acceptance='+Date.now(),{headers:{'Cache-Control':'no-cache'}});if(!response.ok()||hash(await response.body())!==expected[file])return false;}return true;},'Pages must serve exact checked-out runtime and routing bytes',20*60*1000);
 const verifiedAssets={};for(const file of new Set([...plan,...wednesdayPlan].map(s=>s.img))){const response=await api.get(base+file);assert(response.ok());const digest=hash(await response.body());assert.equal(digest,hash(fs.readFileSync(path.join(root,file))));verifiedAssets[file]=digest;}
 console.log('Actual Pages exact runtime/routing and original image hashes verified',expected,verifiedAssets);await api.dispose();
 const browser=await chromium.launch({headless:true});
 try{for(const viewport of [{width:1280,height:800},{width:1180,height:757}]){
  const suffix=viewport.width+'x'+viewport.height,context=await browser.newContext({viewport,serviceWorkers:'allow'}),page=await context.newPage();
  const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))missing.push(r.status()+' '+r.url());});
  await page.goto(base+'daily-lessons.html?week=10&day=1');assert.deepEqual(await page.locator('#path .step b').allTextContents(),['Community Meeting','Read Aloud','Centers']);await shot(page,'tuesday-overview-'+suffix);
  await page.getByRole('button',{name:'Open Community Meeting',exact:true}).click();let f=await section(page,'week10-community.html');await f.locator('#done').click();f=await section(page,'week10-read-aloud.html');
  const readerPlan=await f.evaluate(()=>window.EEAReadAloudPlan);assert.equal(readerPlan.steps.length,20);
  let stops=0;for(let i=0;i<readerPlan.steps.length;i++){
   assert.equal(await f.evaluate(()=>window.EEASectionState().index),i);await imageReady(f);
   for(let n=0;n<readerPlan.steps[i].stops.length;n++){await f.locator('#next').click();stops++;}
   if(i===readerPlan.steps.length-1){assert.equal(await f.locator('#next').textContent(),'Next: Centers →');await shot(page,'tuesday-reader-closing-'+suffix);}
   await f.locator('#next').click();
  }assert.equal(stops,4);f=await section(page,'week10-centers.html');assert.equal(new URL(page.url()).searchParams.get('day'),'1');
  for(let i=0;i<plan.length;i++){
   assert.equal(await f.locator('.community-copy h2').textContent(),plan[i].title);await imageReady(f);await fit(f);await shot(page,'tuesday-center-'+i+'-'+suffix);
   const before=page.url(),length=await page.evaluate(()=>history.length);await f.locator('summary').click();assert(await f.locator('details').getAttribute('open')!==null);assert.deepEqual(await f.locator('.community-notes-content > p').allTextContents(),[...plan[i].notes.flatMap(n=>n[1]),'Focus on Pre-K 3s | Boston Public Schools Early Childhood Department P-2']);await shot(page,'tuesday-notes-'+i+'-'+suffix);await f.locator('summary').click();assert.equal(page.url(),before);assert.equal(await page.evaluate(()=>history.length),length);
   if(plan[i].enlarge){await f.locator('.enlarge-image').click();assert(await f.locator('#image-dialog').isVisible());await f.locator('#enlarged-image').evaluate(img=>img.decode());await shot(page,'tuesday-enlarged-'+i+'-'+suffix);await f.locator('#close-image').click();assert(!await f.locator('#image-dialog').isVisible());assert.equal(await f.evaluate(()=>document.activeElement.className),'enlarge-image');await f.locator('.lesson-img').click();await f.locator('#close-image').press('Escape');assert(!await f.locator('#image-dialog').isVisible());assert.equal(page.url(),before);assert.equal(await page.evaluate(()=>history.length),length);}
   if(i===1){await page.goBack();f=await section(page,'week10-centers.html');assert.equal(await f.evaluate(()=>EEASectionState().step),0);await page.goForward();f=await section(page,'week10-centers.html');assert.equal(await f.evaluate(()=>EEASectionState().step),1);await page.reload();f=await section(page,'week10-centers.html');assert.equal(await f.evaluate(()=>EEASectionState().step),1);}
   await f.locator('#done').click();
  }await overview(page,1);await shot(page,'tuesday-finished-'+suffix);await page.goBack();f=await section(page,'week10-centers.html');assert.equal(await f.evaluate(()=>EEASectionState().step),4);await page.goForward();await overview(page,1);
  // Direct keyboard entry and first-Previous / X return boundaries.
  await page.getByRole('button',{name:'Open Centers',exact:true}).press('Enter');f=await section(page,'week10-centers.html');await f.locator('#prev').click();f=await section(page,'week10-read-aloud.html');assert.equal(new URL(page.url()).searchParams.get('day'),'1');await f.locator('#backBtn').click();await overview(page,1);
  await page.getByRole('button',{name:'Open Centers',exact:true}).click();f=await section(page,'week10-centers.html');await f.locator('#exit').click();await overview(page,1);
  // Monday's complete reader and both original Centers stay available.
  await page.goto(base+'daily-lessons.html?week=10&day=0');await page.getByRole('button',{name:'Open Read Aloud',exact:true}).click();f=await section(page,'week10-read-aloud.html');const monday=await f.evaluate(()=>EEAReadAloudPlan);assert.equal(monday.steps.length,29);
  for(let i=0;i<monday.steps.length;i++){await imageReady(f);for(let n=0;n<monday.steps[i].stops.length;n++)await f.locator('#next').click();await f.locator('#next').click();}f=await section(page,'week10-centers.html');
  for(const title of ['Nature Arrangements','Building Autumn Trees 2']){assert.equal(await f.locator('.community-copy h2').textContent(),title);await imageReady(f);await fit(f);await shot(page,'monday-'+title.toLowerCase().replaceAll(' ','-')+'-'+suffix);await f.locator('#done').click();}await overview(page,0);
  // Wednesday now traverses its complete reader and both bounded Centers; later readiness stays honest.
  await page.goto(base+'lesson-runner-week10.html?week=10&day=2&section=1');f=await section(page,'week10-read-aloud.html');const wed=await f.evaluate(()=>EEAReadAloudPlan);assert.equal(wed.steps.length,22);for(let i=0;i<wed.steps.length;i++){await imageReady(f);for(let n=0;n<wed.steps[i].stops.length;n++)await f.locator('#next').click();await f.locator('#next').click();}f=await section(page,'week10-centers.html');assert.equal(new URL(page.url()).searchParams.get('day'),'2');assert.equal(new URL(page.url()).searchParams.get('section'),'2');
  for(let i=0;i<wednesdayPlan.length;i++){
   assert.equal(await f.locator('.community-copy h2').textContent(),wednesdayPlan[i].title);assert.deepEqual(await f.evaluate(()=>EEASectionState()),{step:i,index:i,total:2,atStart:i===0,atEnd:i===1});await imageReady(f);await fit(f);await shot(page,'wednesday-center-'+i+'-'+suffix);
   const before=page.url(),length=await page.evaluate(()=>history.length);await f.locator('summary').click();assert.deepEqual(await f.locator('.community-notes-content > p').allTextContents(),[...wednesdayPlan[i].notes.flatMap(n=>n[1]),'Focus on Pre-K 3s | Boston Public Schools Early Childhood Department P-2']);await shot(page,'wednesday-notes-'+i+'-'+suffix);await f.locator('summary').click();assert.equal(page.url(),before);assert.equal(await page.evaluate(()=>history.length),length);await f.locator('#done').click();
  }await overview(page,2);assert.deepEqual(await page.locator('#path .step b').allTextContents(),['Community Meeting','Read Aloud','Centers']);await shot(page,'wednesday-finished-'+suffix);
  for(const day of [3,4]){await page.goto(base+'lesson-runner-week10.html?week=10&day='+day+'&section=1');f=await section(page,'week10-read-aloud.html');assert(await f.locator('#bookSelect').isVisible());await f.locator('#bookSelect').selectOption('red-dragon');assert.equal(await f.locator('#bookSelect').inputValue(),'red-dragon');await f.locator('#bookSelect').selectOption('green-chile');}
  for(const day of [0,1]){await page.goto(base+'daily-lessons.html?week=11&day='+day);await page.getByRole('button',{name:'Open Read Aloud',exact:true}).click();f=await section(page,'week11-read-aloud.html');await imageReady(f);}
  await page.goto(base+'daily-lessons.html?week=11&day=2');assert.equal(await page.locator('#path .step').count(),0);assert(await page.locator('#start').isDisabled());
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);await context.close();console.log('Actual Pages Tuesday complete flow, Monday/Wednesday complete reader-and-Centers regressions, color/Mouse Paint readiness, history/dialog/notes/layout pass',suffix);
 }}finally{await browser.close();}
 if(out)fs.writeFileSync(path.join(out,'verified-bytes.json'),JSON.stringify({base,commit:process.env.GITHUB_SHA||null,expected,verifiedAssets,manualCloudBrowser:'Not run: tool transport timeouts. This is actual deployed Pages in CI Chromium.'},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
