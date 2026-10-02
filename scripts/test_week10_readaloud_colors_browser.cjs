// Real Chromium regression for the bounded Wednesday Unit 2 Week 2 Read Aloud.
// Requires playwright 1.62.1. CI must run this: JSDOM cannot verify joint history,
// native Back/Forward, image containment, hit targets or early iframe exits.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const screenshotDir=process.env.WEEK10_READALOUD_COLORS_SCREENSHOT_DIR;
const server=http.createServer((request,response)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)){response.writeHead(403).end();return;}
  fs.readFile(file,(error,bytes)=>{
    if(error){response.writeHead(404).end();return;}
    const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';
    response.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(bytes);
  });
});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check,label){for(let i=0;i<240;i++){try{if(await check())return;}catch{}await delay(25);}assert.fail(label);}
(async()=>{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const base=`http://127.0.0.1:${server.address().port}/v6-test/`;let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,ignoreDefaultArgs:['--disable-back-forward-cache']});
  const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'}),errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))missing.push(r.url());});
  const child=()=>page.frames().find(f=>f.parentFrame()===page.mainFrame());
  const state=()=>child().evaluate(()=>EEASectionState());
  async function ready(day,book,step){await until(async()=>child()?.url().includes('week10-read-aloud.html')&&await child().evaluate(({book,step})=>typeof EEASectionState==='function'&&EEASectionState().book===book&&(step===undefined||EEASectionState().step===step),{book,step}),'Color reader restored');assert.equal(new URL(page.url()).searchParams.get('day'),String(day));assert.equal(new URL(page.url()).searchParams.get('book'),book);assert.equal(page.frames().length,2);return child();}
  async function overview(day){await until(async()=>page.url().includes('daily-lessons.html')&&await page.locator('#path .step').count()===2,'Overview');assert.equal(new URL(page.url()).searchParams.get('day'),String(day));assert.equal(page.frames().length,1);}
  async function community(day){await until(async()=>child()?.url().includes('week10-community.html')&&await child().evaluate(()=>typeof EEASectionState==='function'),'Community');assert.equal(new URL(page.url()).searchParams.get('day'),String(day));}
  const route=(day,book,step=0)=>base+`lesson-runner-week10.html?week=10&day=${day}&section=1&book=${book}&step=${step}`;
  async function target(locator,label){await locator.scrollIntoViewIfNeeded();const r=await locator.evaluate(el=>{const r=el.getBoundingClientRect(),hit=el.ownerDocument.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{inside:r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,hit:hit===el||el.contains(hit),width:r.width,height:r.height};});assert(r.inside&&r.hit&&r.width>0&&r.height>0,label+' '+JSON.stringify(r));}
  async function shot(name){if(screenshotDir){fs.mkdirSync(screenshotDir,{recursive:true});await page.screenshot({path:path.join(screenshotDir,name+'.png'),fullPage:true});}}
  for(const day of [3,4])for(const book of ['green-chile','red-dragon']){
   await page.goto(route(day,book));let f=await ready(day,book,0);const steps=await f.evaluate(()=>EEAReadAloudPlan.steps);
   for(const [i,s]of steps.entries()){
    f=await ready(day,book,i);assert.equal(await f.locator('#prompt').textContent(),s.prompt);assert.equal(await f.locator('#bookImg').isVisible(),false);assert.equal(await f.locator('#bookImg').getAttribute('src'),null);assert.match(await f.locator('#bookCue').textContent(),/physical book/);
    const url=page.url(),h=await page.evaluate(()=>history.length);for(let n=0;n<2;n++){await f.locator('#teacherNotes summary').click();await f.locator('#teacherNotes summary').click();}assert.equal(page.url(),url);assert.equal(await page.evaluate(()=>history.length),h);
    if(i<steps.length-1)await f.locator('#next').click();
   }
   assert.equal((await state()).atEnd,true);await f.locator('#next').click();await overview(day);await page.goBack();await ready(day,book,steps.length-1);await page.goForward();await overview(day);
   await page.locator('#path .step').nth(1).click();await ready(day,book,0);await child().locator('#prev').click();await community(day);await child().locator('#done').click();await ready(day,book,0);
   await page.evaluate(()=>{const f=document.getElementById('frame');for(let n=0;n<3;n++){dispatchEvent(new Event('pageshow'));f.dispatchEvent(new Event('load'));}});await child().locator('#next').click();await ready(day,book,1);
   const other=book==='green-chile'?'red-dragon':'green-chile';await child().locator('#teacherNotes summary').click();await child().locator('#bookSelect').selectOption(other);await ready(day,other,0);assert.equal(await child().locator('#teacherNotes').getAttribute('open'),null);
   await page.goBack();await ready(day,book,1);await page.goForward();await ready(day,other,0);await page.reload();await ready(day,other,0);
   for(let n=0;n<4;n++){const b=n%2?other:book;await child().locator('#bookSelect').selectOption(b);await ready(day,b,0);}
   await child().locator('#backBtn').click();await overview(day);
   for(const viewport of [{width:1280,height:800},{width:1180,height:757}]){
    await page.setViewportSize(viewport);
    for(let i=0;i<steps.length;i++){
     await page.goto(route(day,book,i));f=await ready(day,book,i);
     for(const sel of ['#bookSelect','#prev','#next','#backBtn','#teacherNotes summary'])await target(f.locator(sel),`${day}/${book}/${i}/${sel}`);
     if(i===0||steps[i].kind==='after'||i===steps.length-1){await shot(`${day}-${book}-${i}-${viewport.width}`);await f.locator('#teacherNotes summary').click();for(const sel of ['#bookSelect','#prev','#next','#backBtn'])await target(f.locator(sel),`notes open ${day}/${book}/${i}/${sel}`);await shot(`${day}-${book}-${i}-notes-${viewport.width}`);}
    }
   }
   console.log(`${day} ${book}: all cues, notes, selected book history/reload, boundaries, repeated setup and responsive controls pass`);
  }
  // Standalone selection and step history must match the embedded contract.
  await page.goto(base+'week10-read-aloud.html?day=Friday&book=green-chile&step=2');await page.waitForFunction(()=>typeof EEASectionState==='function');await page.locator('#bookSelect').selectOption('red-dragon');assert.equal(await page.evaluate(()=>EEASectionState().step),0);await page.goBack();await until(()=>page.evaluate(()=>EEASectionState().book==='green-chile'&&EEASectionState().step===2),'Standalone book back');await page.goForward();await until(()=>page.evaluate(()=>EEASectionState().book==='red-dragon'&&EEASectionState().step===0),'Standalone book forward');await page.reload();assert.equal(await page.evaluate(()=>EEASectionState().book),'red-dragon');await page.locator('#backBtn').click();await overview(4);
  for(const day of [3,4])for(const key of ['Enter','Space']){await page.goto(base+`daily-lessons.html?week=10&day=${day}`);await overview(day);await page.locator('#path .step').nth(1).focus();await page.keyboard.press(key);await ready(day,'red-dragon',0);}
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log('Color reader standalone history, keyboard launch and no missing assets pass');
 }finally{if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
