// Real Chromium regression for the bounded Monday Unit 2 Week 2 Centers chunk.
// Requires Playwright 1.62.1. CI saves both requested classroom viewport sizes.
// No student/roster data is used; the old service worker has an isolated origin.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const screenshotDir=process.env.WEEK10_CENTERS_SCREENSHOT_DIR;
const titles=['Nature Arrangements','Building Autumn Trees 2'];
const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
const imageNames=['nature-arrangements.png','building-autumn-trees.png'];
const staleV4=fs.readFileSync(path.join(root,'v6-test/week10-read-aloud-v4.js'),'utf8');
const legacyCache='eea-qa-before-monday-centers';
const legacyWorker=`const CACHE=${JSON.stringify(legacyCache)};
self.addEventListener('install',event=>event.waitUntil((async()=>{const c=await caches.open(CACHE);const r=await fetch('./__qa-centers-stale-v4.js',{cache:'no-store'});if(!r.ok)throw Error('Missing stale v4 fixture');await c.put('./week10-read-aloud-v4.js',r);await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{const r=event.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==self.location.origin)return;const html=r.mode==='navigate'||r.destination==='document'||u.pathname.endsWith('.html');if(html){event.respondWith(fetch(r,{cache:'no-store'}));return;}event.respondWith(caches.match(r,{ignoreSearch:true}).then(cached=>cached||fetch(r).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(r,copy)).catch(()=>{});}return response;})));});`;
const server=http.createServer((request,response)=>{
 const url=new URL(request.url,'http://localhost');let fixture,type='text/javascript';
 if(url.pathname==='/v6-test/__qa-centers-old-worker.js')fixture=legacyWorker;
 else if(url.pathname==='/v6-test/__qa-centers-stale-v4.js')fixture=staleV4;
 // Model a same-path redeploy on the origin while the worker retains exact v4.
 // The checked-in v4 fixture is not modified; only this isolated server changes
 // its network response, so both same-path and query-busting failure are proven.
 else if(url.pathname==='/v6-test/week10-read-aloud-v4.js')fixture=fs.readFileSync(path.join(root,'v6-test/week10-read-aloud-v5.js'),'utf8');
 else if(url.pathname==='/v6-test/__qa-centers-boot.html'){fixture='<!doctype html><title>Isolated old-worker Centers regression</title>';type='text/html';}
 else if(url.pathname==='/v6-test/__qa-centers-old-reader.html'){fixture=fs.readFileSync(path.join(root,'v6-test/week10-read-aloud.html'),'utf8').replace('week10-read-aloud-v5.js','week10-read-aloud-v4.js'+(url.searchParams.has('bust')?'?qa-centers-upgrade=1':''));type='text/html';}
 if(fixture!==undefined){response.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fixture);return;}
 const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root+path.sep)){response.writeHead(403).end();return;}
 fs.readFile(file,(error,bytes)=>{if(error){response.writeHead(404).end();return;}const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';response.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(bytes);});
});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check,label){for(let i=0;i<240;i++){try{if(await check())return;}catch{}await delay(25);}assert.fail(label);}
async function shot(page,name){if(screenshotDir){fs.mkdirSync(screenshotDir,{recursive:true});await page.screenshot({path:path.join(screenshotDir,name+'.png'),fullPage:true});}}
function diagnostics(page){const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))missing.push(`${r.status()} ${r.url()}`);});return()=>{assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);};}
async function target(locator,label){const box=await locator.evaluate(el=>{const r=el.getBoundingClientRect(),hit=el.ownerDocument.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{inside:r.x>=0&&r.y>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,width:r.width,height:r.height,textFits:el.scrollWidth<=el.clientWidth+1&&el.scrollHeight<=el.clientHeight+1,hit:!!hit&&(el===hit||el.contains(hit))};});assert(box.inside&&box.width>0&&box.height>0&&box.hit&&box.textFits,`${label}: visible, unobscured target ${JSON.stringify(box)}`);}
async function verifyLegacy(browser,base){
 const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'allow'});
 try{
  const page=await context.newPage(),clean=diagnostics(page),child=()=>page.frames().find(f=>f.parentFrame()===page.mainFrame());
  await page.goto(base+'__qa-centers-boot.html');await page.evaluate(async()=>{await navigator.serviceWorker.register('./__qa-centers-old-worker.js',{scope:'./'});await navigator.serviceWorker.ready;});await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/__qa-centers-old-worker.js'));
  const current=fs.readFileSync(path.join(root,'v6-test/week10-read-aloud-v5.js'),'utf8');assert.notEqual(current,staleV4);
  for(const suffix of['','?qa-centers-upgrade=1']){
   assert.equal(await(await context.request.get(base+'week10-read-aloud-v4.js'+suffix)).text(),current,'Origin has changed bytes but old worker still serves v4');
   const cached=await page.evaluate(async suffix=>await(await fetch('./week10-read-aloud-v4.js'+suffix,{cache:'no-store'})).text(),suffix);assert.equal(cached,staleV4,'ignoreSearch preserves the pre-Centers v4 byte fixture');
   await page.goto(base+'__qa-centers-old-reader.html?day=Monday&step=999999'+(suffix?'&bust=1':''));await page.waitForFunction(()=>typeof EEASectionState==='function'&&EEASectionState().atEnd);
   assert.equal(await page.locator('script[src]').last().getAttribute('src'),'week10-read-aloud-v4.js'+suffix);assert.equal(await page.locator('#next').textContent(),'Finish Read Aloud →');await page.locator('#next').click();await until(()=>new URL(page.url()).pathname.endsWith('/daily-lessons.html'),'Stale v4 reproduces old Monday completion to overview');assert.equal(page.frames().length,1);
  }
  const freshResponse=page.waitForResponse(r=>new URL(r.url()).pathname==='/v6-test/week10-read-aloud-v5.js');await page.goto(base+'lesson-runner-week10.html?week=10&day=0&section=1&step=999999');assert.equal(await(await freshResponse).text(),current);
  await until(async()=>child()?.url().includes('week10-read-aloud.html')&&await child().evaluate(()=>typeof EEASectionState==='function'&&EEASectionState().atEnd),'Fresh v5 Monday closing loaded under old worker');
  assert.equal(await child().locator('script[src]').last().getAttribute('src'),'week10-read-aloud-v5.js');assert.equal(await child().locator('#next').textContent(),'Next: Centers →');await child().locator('#next').click();
  await until(async()=>child()?.url().includes('week10-centers.html')&&await child().locator('.community-copy h2').textContent()===titles[0],'Fresh reader reaches Centers under old worker');assert.equal(new URL(page.url()).searchParams.get('section'),'2');assert.equal(page.frames().length,2);assert.equal(await child().locator('script[src]').getAttribute('src'),'week10-centers-v1.js');await shot(page,'old-worker-first-center-1280x800');
  await child().locator('#done').click();assert.equal(await child().locator('.community-copy h2').textContent(),titles[1]);await page.reload();await until(async()=>child()?.url().includes('week10-centers.html')&&await child().evaluate(()=>typeof EEASectionState==='function'&&EEASectionState().step===1),'Old worker reload preserves second center');await child().locator('#done').click();await until(()=>new URL(page.url()).pathname.endsWith('/daily-lessons.html'),'Old worker final completion stays top-level');
  assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL),base+'__qa-centers-old-worker.js','No unregister, replacement worker or cache clearing');assert.equal(await page.evaluate(async name=>await(await(await caches.open(name)).match('./week10-read-aloud-v4.js')).text(),legacyCache),staleV4,'Exact prior v4 entry survives the upgrade');clean();
  console.log('Unchanged ignoreSearch worker reproduces stale v4 same-path/query finish and fresh v5/centers path restores full Monday handoff without clearing old cache');
 }finally{await context.close();}
}
(async()=>{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const base=`http://127.0.0.1:${server.address().port}/v6-test/`;let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,ignoreDefaultArgs:['--disable-back-forward-cache']});
  const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'}),clean=diagnostics(page),child=()=>page.frames().find(f=>f.parentFrame()===page.mainFrame());
  const route=(step=0)=>base+'lesson-runner-week10.html?week=10&day=0&section=2&step='+step;
  async function overview(day=0){await until(async()=>new URL(page.url()).pathname.endsWith('/daily-lessons.html')&&await page.locator('#path .step').count()===(day===0?3:2),'Top-level same-day overview');assert.equal(new URL(page.url()).searchParams.get('week'),'10');assert.equal(new URL(page.url()).searchParams.get('day'),String(day));assert.equal(page.frames().length,1);}
  async function centers(index=0,standalone=false){await until(async()=>{const f=standalone?page:child();return f?.url().includes('/week10-centers.html')&&await f.evaluate(index=>typeof EEASectionState==='function'&&EEASectionState().step===index,index);},'Center '+index+' ready');const f=standalone?page:child();assert.deepEqual(await f.evaluate(()=>EEASectionState()),{step:index,index,total:2,atStart:index===0,atEnd:index===1});assert.equal(await f.locator('.community-copy h2').textContent(),titles[index]);assert.equal(await f.locator('.community-card').count(),1);assert.equal(await f.locator('iframe').count(),0);assert.equal(page.frames().length,standalone?1:2);assert.equal(new URL(page.url()).searchParams.get('step'),String(index));if(!standalone){const p=new URL(page.url()).searchParams;assert.equal(p.get('week'),'10');assert.equal(p.get('day'),'0');assert.equal(p.get('section'),'2');assert.equal(p.has('stop'),false);assert.equal(p.has('book'),false);const resume=await page.evaluate(()=>JSON.parse(localStorage.getItem('eea-lesson-resume')));assert.equal(resume.week,10);assert.equal(resume.day,0);assert.equal(resume.section,2);assert.equal(new URL(f.url()).searchParams.get('step'),String(index));assert.equal(new URL(f.url()).searchParams.get('day'),'Monday');}return f;}
  async function reader(atEnd=false,day=0){await until(async()=>child()?.url().includes('week10-read-aloud.html')&&await child().evaluate(atEnd=>typeof EEASectionState==='function'&&(!atEnd||EEASectionState().atEnd),atEnd),'Same-day reader');assert.equal(new URL(page.url()).searchParams.get('day'),String(day));assert.equal(new URL(page.url()).searchParams.get('section'),'1');assert.equal(page.frames().length,2);return child();}
  async function community(){await until(async()=>child()?.url().includes('week10-community.html')&&await child().evaluate(()=>typeof EEASectionState==='function'),'Monday Community');assert.equal(new URL(page.url()).searchParams.get('section'),'0');return child();}
  async function image(f,index){await until(()=>f.locator('.lesson-img').evaluate(img=>img.complete&&img.naturalWidth===1254&&img.naturalHeight===1254),'Complete original companion illustration');assert((await f.locator('.lesson-img').getAttribute('src')).endsWith('/'+imageNames[index]));const b=await f.locator('.lesson-img').evaluate(el=>{const r=el.getBoundingClientRect();return{fit:getComputedStyle(el).objectFit,x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height,vw:innerWidth,vh:innerHeight};});assert.equal(b.fit,'contain');assert(b.width>300&&b.height>300&&b.x>=0&&b.y>=0&&b.right<=b.vw+1&&b.bottom<=b.vh+1,'Large uncropped visual fits viewport');}
  async function notes(f){const url=page.url(),length=await page.evaluate(()=>history.length),state=await f.evaluate(()=>EEASectionState());for(let n=0;n<4;n++){await f.locator('.community-notes summary').click();assert(await f.locator('.community-notes').evaluate(e=>e.open));await f.locator('.community-notes summary').click();assert(!await f.locator('.community-notes').evaluate(e=>e.open));}assert.equal(page.url(),url);assert.equal(await page.evaluate(()=>history.length),length);assert.deepEqual(await f.evaluate(()=>EEASectionState()),state);}
  await page.goto(base+'daily-lessons.html?week=10&day=0');await overview();await page.locator('#start').click();let f=await community();await f.locator('#done').click();await reader();
  await page.goto(base+'lesson-runner-week10.html?week=10&day=0&section=1&step=999999');f=await reader(true);assert.equal(await f.locator('#next').textContent(),'Next: Centers →');await f.locator('#next').click();await centers();await page.goBack();await reader(true);await page.goForward();f=await centers();
  for(let n=0;n<3;n++){await f.locator('#prev').click();f=await reader();assert.equal(await f.evaluate(()=>EEASectionState().step),0);await page.goBack();f=await centers();}
  await page.goto(route(0));f=await centers(0);
  for(let n=0;n<4;n++)await page.evaluate(()=>{dispatchEvent(new Event('pageshow'));document.getElementById('frame').dispatchEvent(new Event('load'));});
  await notes(f);const h=await page.evaluate(()=>history.length);await f.locator('#done').click();f=await centers(1);assert.equal(await page.evaluate(()=>history.length),h+1,'One navigation adds exactly one joint-session history entry');await notes(f);
  for(let n=0;n<3;n++){await page.goBack();await centers(0);await page.goForward();await centers(1);}await page.reload();f=await centers(1);await f.locator('#prev').click();f=await centers(0);await f.locator('#done').click();f=await centers(1);
  const resume=await page.evaluate(()=>localStorage.getItem('eea-lesson-resume'));await page.evaluate(()=>localStorage.setItem('eea-lesson-auto-resume',new Date().toISOString().slice(0,10)));await f.locator('#done').click();await overview();assert.equal(await page.evaluate(()=>localStorage.getItem('eea-lesson-auto-resume')),null);assert.equal(await page.evaluate(()=>localStorage.getItem('eea-lesson-resume')),resume);
  for(let n=0;n<2;n++){await page.goBack();await centers(1);await page.goForward();await overview();}await page.reload();await overview();
  for(const key of['Enter','Space']){await page.locator('#path .step').nth(2).focus();await page.keyboard.press(key);f=await centers(0);await f.locator('#exit').click();await overview();}
  for(const index of[0,1]){await page.locator('#path .step').nth(2).click();f=await centers(0);if(index){await f.locator('#done').click();f=await centers(1);}await f.locator('#exit').click();await overview();await page.goBack();await centers(index);await page.goForward();await overview();}
  console.log('Start/card/keyboard paths, Read Aloud handoff, repeated notes/navigation, native Back/Forward, reload and all top-level returns pass');
  // Images deliberately never finish while the controls are exercised. These
  // cases must work before iframe.onload installs any parent preparation.
  for(const standalone of[false,true])for(const index of[0,1])for(const button of['prev','done','exit']){
   let release;const gate=new Promise(resolve=>{release=resolve;}),pattern='**/week-1/centers/*.png',hold=async route=>{await gate;await route.continue().catch(()=>{});};await page.route(pattern,hold);
   try{
    await page.goto(standalone?base+'week10-centers.html?day=Monday&step='+index:route(index),{waitUntil:'domcontentloaded'});f=await centers(index,standalone);assert.equal(await f.locator('.lesson-img').evaluate(img=>img.complete),false);await f.locator('#'+button).click();
    if(button==='prev'&&index===0){f=await reader();await f.locator('#backBtn').click();await overview();}
    else if(button==='prev'||(button==='done'&&index===0)){f=await centers(button==='prev'?0:1,standalone);await f.locator('#exit').click();await overview();}
    else await overview();
   }finally{release();await page.unroute(pattern,hold);}
  }
  console.log('All twelve standalone/embedded early Previous/Next/Finish/X paths work while images are delayed');
  for(const raw of['-1','bad','Infinity','1.5','999']){await page.goto(route(raw)+'&stop=2&book=red-dragon');await centers(raw==='999'?1:0);}
  for(let day=1;day<5;day++){
   await page.goto(base+'week10-centers.html?day='+days[day]+'&step=1');await overview(day);
   await page.goto(base+`lesson-runner-week10.html?week=10&day=${day}&section=2&step=1`);await until(async()=>child()?.url().includes('week10-community.html')&&await child().evaluate(()=>typeof EEASectionState==='function'),'Unavailable runner Centers normalizes to same-day Community');assert.equal(new URL(page.url()).searchParams.get('section'),'0');assert.equal(new URL(page.url()).searchParams.has('step'),false);assert.equal(new URL(page.url()).searchParams.get('day'),String(day));
   await page.goto(base+`lesson-runner-week10.html?week=10&day=${day}&section=1&step=999999`);f=await reader(true,day);assert.equal(await f.locator('#next').textContent(),'Finish Read Aloud →');await f.locator('#next').click();await overview(day);
  }
  await page.goto(base+'week10-centers.html?day=Monday&step=0');f=await centers(0,true);await f.locator('#done').click();await centers(1,true);await page.goBack();await centers(0,true);await page.goForward();await centers(1,true);await page.reload();f=await centers(1,true);await f.locator('#done').click();await overview();
  console.log('Malformed deep links, standalone history and unavailable-day/read-aloud isolation pass');
  for(const viewport of[{width:1280,height:800},{width:1180,height:757}]){
   await page.setViewportSize(viewport);await page.goto(base+'daily-lessons.html?week=10&day=0');await overview();for(const selector of['#path .step','#start','#weeknav button','#days button','.home','.pace']){const items=page.locator(selector);for(let n=0;n<await items.count();n++)await target(items.nth(n),`${viewport.width} overview ${selector}/${n}`);}await shot(page,`monday-overview-${viewport.width}x${viewport.height}`);
   for(const index of[0,1]){await page.goto(route(index));f=await centers(index);await image(f,index);for(const selector of['#prev','#done','#exit'])await target(f.locator(selector),`${viewport.width} ${titles[index]} ${selector}`);const initialCopy=await f.locator('.community-copy').evaluate(el=>({scrollTop:el.scrollTop,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight}));assert.equal(initialCopy.scrollTop,0,'Default closed card starts at the top');assert(initialCopy.scrollHeight<=initialCopy.clientHeight+1,`${viewport.width} ${titles[index]} default closed title, invitation and notes fit without scrolling: ${JSON.stringify(initialCopy)}`);for(const selector of['.community-copy h2','.community-copy .lead','.community-notes summary'])await target(f.locator(selector),`${viewport.width} default closed ${selector}`);await shot(page,`center-${index+1}-${viewport.width}x${viewport.height}`);await f.locator('.community-notes summary').click();assert(await f.locator('.community-notes').evaluate(e=>e.open));await shot(page,`center-${index+1}-notes-open-${viewport.width}x${viewport.height}`);await f.locator('.community-notes-content a').last().scrollIntoViewIfNeeded();await target(f.locator('.community-notes-content a').last(),`${viewport.width} last source link`);for(const selector of['#prev','#done','#exit'])await target(f.locator(selector),`${viewport.width} expanded notes ${selector}`);await image(f,index);await shot(page,`center-${index+1}-notes-sources-${viewport.width}x${viewport.height}`);}
  }
  clean();console.log('1280×800 and 1180×757 large uncropped illustrations, notes, footer/source-link hit targets and screenshots pass; no page errors or missing resources');await page.close();await verifyLegacy(browser,base);
 }finally{if(browser)await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
