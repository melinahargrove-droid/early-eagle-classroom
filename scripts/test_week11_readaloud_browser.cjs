// Real Chromium regression for Monday Unit 2 Week 3 Mouse Paint Read 1.
// Requires playwright 1.62.1. CI must run: JSDOM cannot establish actual joint
// history, pixels/image containment, accessible hit targets or early iframe exits.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const screenshotDir=process.env.WEEK11_READALOUD_SCREENSHOT_DIR;
const plan=JSON.parse(fs.readFileSync(path.join(root,'v6-test/week11-read-aloud-plan.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'v6-test/assets/focus-3s/unit-2/week-3/mouse-paint/source-manifest.json'),'utf8'));
const steps=plan.steps,indexFor=s=>typeof s==='number'?s:steps.findIndex(step=>step.id===s);
const legacyCache='eea-qa-week11-v88',legacyWorkerPath='/v6-test/__qa-week11-v88-worker.js';
const legacyPaths=['week10-read-aloud.js','week10-read-aloud-v2.js','week10-read-aloud-v3.js','week10-read-aloud-v4.js','week10-community.js','week10-community-v2.js','week10-community-v3.js','week10-community-v4.js','week10-community-v5.js','week10-color-read-aloud-plans.js'];
const legacySeed=Object.fromEntries(legacyPaths.map(file=>[file,fs.readFileSync(path.join(root,'v6-test',file),'utf8')]));
// Isolated synthetic origin, no real roster data. Preserve the deployed v88
// network-first HTML / ignoreSearch cache-first non-HTML behavior. Its old JS
// entries remain installed throughout recovery: no unregister/cache deletion.
const legacyWorker=`const CACHE=${JSON.stringify(legacyCache)};
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);const seed=await(await fetch('./__qa-week11-v88-seed.json',{cache:'no-store'})).json();for(const[file,body]of Object.entries(seed))await cache.put(new URL(file,self.location.href).href,new Response(body,{headers:{'Content-Type':'text/javascript'}}));await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;const isHtml=request.mode==='navigate'||request.destination==='document'||url.pathname.endsWith('.html');if(isHtml){event.respondWith(fetch(request,{cache:'no-store'}).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});}return response;}).catch(async()=>{const cached=await caches.match(request,{ignoreSearch:true});if(cached)return cached;if(request.mode==='navigate')return caches.match('./index.html',{ignoreSearch:true});throw new Error('Offline resource unavailable');}));return;}event.respondWith(caches.match(request,{ignoreSearch:true}).then(cached=>cached||fetch(request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});}return response;})));});`;
function fixture(request,response){
 const p=new URL(request.url,'http://localhost').pathname;let body,type='text/javascript';
 if(p===legacyWorkerPath)body=legacyWorker;
 else if(p==='/v6-test/__qa-week11-v88-seed.json'){body=JSON.stringify(legacySeed);type='application/json';}
 else if(p==='/v6-test/__qa-week11-v88-boot.html'){body='<!doctype html><title>Isolated v88 upgrade fixture</title>';type='text/html';}
 else return false;
 response.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(body);return true;
}
const server=http.createServer((request,response)=>{
 if(fixture(request,response))return;
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)){response.writeHead(403).end();return;}
 fs.readFile(file,(error,bytes)=>{if(error){response.writeHead(404).end();return;}const type={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';response.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(bytes);});
});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check,label){for(let i=0;i<240;i++){try{if(await check())return;}catch{}await delay(25);}assert.fail(label);}
async function shot(page,name){if(screenshotDir){fs.mkdirSync(screenshotDir,{recursive:true});await page.screenshot({path:path.join(screenshotDir,name+'.png'),fullPage:true});}}
function observe(page){const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))missing.push(`${r.status()} ${r.url()}`);});return()=>{assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);};}
async function target(locator,label){const g=await locator.evaluate(el=>{const r=el.getBoundingClientRect(),hit=el.ownerDocument.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{inside:r.x>=0&&r.y>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,width:r.width,height:r.height,hit:!!hit&&(hit===el||el.contains(hit))};});assert(g.inside&&g.width>0&&g.height>0&&g.hit,`${label}: unobscured viewport target ${JSON.stringify(g)}`);}
async function originalImage(f,step){
 const image=f.locator('#bookImg'),source=manifest.images[step.sourceSlide-1];assert.equal(await image.getAttribute('src'),step.img);
 await until(()=>image.evaluate((img,expected)=>img.complete&&img.naturalWidth===expected.width&&img.naturalHeight===expected.height,source),`${step.id}: original complete image`);
 const g=await image.evaluate(el=>{const r=el.getBoundingClientRect();return{fit:getComputedStyle(el).objectFit,x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height,vw:innerWidth,vh:innerHeight};});
 assert.equal(g.fit,'contain',`${step.id}: no cropping`);assert(g.width>200&&g.height>100&&g.x>=-1&&g.y>=-1&&g.right<=g.vw+1&&g.bottom<=g.vh+1,`${step.id}: complete image inside viewport ${JSON.stringify(g)}`);
}
async function verifyLegacyUpgrade(browser,base){
 const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'allow'});
 try{
  const page=await context.newPage(),clean=observe(page);
  await page.goto(base+'__qa-week11-v88-boot.html');
  await page.evaluate(async()=>{await navigator.serviceWorker.register('./__qa-week11-v88-worker.js',{scope:'./'});await navigator.serviceWorker.ready;});
  await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/__qa-week11-v88-worker.js'));
  for(const file of legacyPaths){const cached=await page.evaluate(async({file,name})=>await(await(await caches.open(name)).match('./'+file)).text(),{file,name:legacyCache});assert.equal(cached,legacySeed[file],`${file} seeded from v88 deployment`);}
  // A deliberately stale disposable old pathname establishes that ignoreSearch
  // really is active; neither the origin nor any production file is modified.
  await page.evaluate(async name=>{const c=await caches.open(name);await c.put('./__qa-week11-stale.js',new Response('old cached bytes'));},legacyCache);
  assert.equal(await page.evaluate(async()=>await(await fetch('./__qa-week11-stale.js?bust=1')).text()),'old cached bytes');
  const responses=new Map();page.on('response',r=>{const name=new URL(r.url()).pathname.split('/').at(-1);if(['week11-read-aloud-v4.js','week11-read-aloud-plan-v1.js'].includes(name))responses.set(name,r);});
  await page.goto(base+'daily-lessons.html?week=11&day=0');assert.equal(await page.locator('#path .step').count(),2);await page.locator('#start').click();
  await until(async()=>{const f=page.frames().find(f=>f.parentFrame()===page.mainFrame());return f?.url().includes('/week11-read-aloud.html')&&await f.evaluate(()=>window.EEAReadAloudPlan?.title==='Mouse Paint'&&window.EEASectionState().step===0);},'v88 context loads new Week 11 path');
  const reader=page.frames().find(f=>f.parentFrame()===page.mainFrame());assert.equal(page.frames().length,2);assert.equal(new URL(page.url()).searchParams.get('week'),'11');assert.equal(new URL(page.url()).searchParams.get('section'),'0');assert.equal(await reader.locator('#stepTitle').textContent(),'Before Reading');
  assert.deepEqual(await reader.locator('script[src]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('src'))),['week11-read-aloud-plan-v1.js','week11-read-aloud-tuesday-plan-v1.js','week11-read-aloud-v4.js']);
  for(const file of ['week11-read-aloud-v4.js','week11-read-aloud-plan-v1.js']){assert(responses.has(file),`Fetched fresh ${file}`);assert.equal(await responses.get(file).text(),fs.readFileSync(path.join(root,'v6-test',file),'utf8'));}
  await originalImage(reader,steps[0]);await shot(page,'old-v88-worker-week11-upgrade');
  await reader.locator('#next').click();assert.equal(await reader.evaluate(()=>window.EEASectionState().step),1);assert.equal(new URL(page.url()).searchParams.get('step'),'1');
  await reader.locator('#backBtn').click();await until(async()=>new URL(page.url()).pathname.endsWith('/daily-lessons.html'),'Old worker top-level overview exit');assert.equal(page.frames().length,1);assert.equal(new URL(page.url()).searchParams.get('week'),'11');assert.equal(new URL(page.url()).searchParams.get('day'),'0');
  // Existing Week 10 reader continues to run from its unchanged cached assets.
  await page.goto(base+'week10-read-aloud.html?day=Monday');await page.waitForFunction(()=>window.EEAReadAloudPlan?.title==='Strictly No Elephants');assert.equal(await page.locator('script[src]').last().getAttribute('src'),'week10-read-aloud-v9.js');
  assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL),new URL(legacyWorkerPath,base).href,'Old worker remains active throughout');
  for(const file of legacyPaths)assert.equal(await page.evaluate(async({name,file})=>await(await(await caches.open(name)).match('./'+file)).text(),{name:legacyCache,file}),legacySeed[file],`${file} cache remains intact`);
  clean();console.log('Unchanged v88 cache-first worker loads fresh Week 11 paths, preserves old Week 10 scripts and exits top-level');
 }finally{await context.close();}
}
(async()=>{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const base=`http://127.0.0.1:${server.address().port}/v6-test/`;let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,ignoreDefaultArgs:['--disable-back-forward-cache']});
  const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'}),page=await context.newPage(),clean=observe(page);
  const section=()=>page.frames().find(f=>f.parentFrame()===page.mainFrame());
  const state=()=>section().evaluate(()=>window.EEASectionState());
  const route=(step=0,stop=0)=>`${base}lesson-runner-week11.html?week=11&day=0&section=0&step=${indexFor(step)}&stop=${stop}`;
  async function reader(step=0,stop){
   const expected=indexFor(step);await until(async()=>section()?.url().includes('/week11-read-aloud.html')&&await section().evaluate(({step,stop})=>typeof window.EEASectionState==='function'&&window.EEASectionState().step===step&&(stop===undefined||window.EEASectionState().stop===stop),{step:expected,stop}),'Monday reader '+step+' stop '+stop);
   const f=section(),outer=new URL(page.url()),child=new URL(f.url()),s=await state();
   assert(outer.pathname.endsWith('/lesson-runner-week11.html'));assert.equal(outer.searchParams.get('week'),'11');assert.equal(outer.searchParams.get('day'),'0');assert.equal(outer.searchParams.get('section'),'0');assert.equal(outer.searchParams.get('step'),String(s.step));assert.equal(outer.searchParams.get('stop'),String(s.stop));
   assert.equal(child.searchParams.get('day'),'Monday');assert.equal(child.searchParams.get('from'),'runner');assert.equal(child.searchParams.get('week'),'11');assert.equal(child.searchParams.get('section'),'0');assert.equal(child.searchParams.get('step'),String(s.step));assert.equal(child.searchParams.get('stop'),String(s.stop));
   assert.equal(page.frames().length,2);assert.equal(await f.locator('iframe').count(),0);assert.equal(s.total,24);
   const resume=await page.evaluate(()=>JSON.parse(localStorage.getItem('eea-lesson-resume')));assert.equal(resume.week,11);assert.equal(resume.day,0);assert.equal(resume.section,0);return f;
  }
  async function overview(day=0){await until(async()=>new URL(page.url()).pathname.endsWith('/daily-lessons.html')&&await page.locator('#days button').count()===5,'Top-level Week 11 overview');const p=new URL(page.url()).searchParams;assert.equal(p.get('week'),'11');assert.equal(p.get('day'),String(day));assert.equal(page.frames().length,1,'Overview never nested');assert.equal(await page.locator('#path .step').count(),day<2?2:1);assert.equal(await page.locator('#start').isDisabled(),false);assert.equal(await page.evaluate(()=>localStorage.getItem('eea-lesson-auto-resume')),null);}
  async function centers(){await until(async()=>{const f=section(),u=new URL(page.url());return u.pathname.endsWith('/lesson-runner-week11.html')&&u.searchParams.get('section')==='1'&&f?.url().includes('week11-centers.html')&&await f.evaluate(()=>typeof EEASectionState==='function'&&EEASectionState().step===0);},'Monday Centers handoff');const u=new URL(page.url());assert.equal(u.searchParams.get('week'),'11');assert.equal(u.searchParams.get('day'),'0');assert.equal(page.frames().length,2);}
  async function notes(){const f=section(),url=page.url(),len=await page.evaluate(()=>history.length),s=await state(),toggle=f.locator('#teacherNotes summary');for(let n=0;n<3;n++){await toggle.click();await toggle.click();}assert.deepEqual(await state(),s);assert.equal(page.url(),url);assert.equal(await page.evaluate(()=>history.length),len);}
  await page.goto(base+'daily-lessons.html?week=11&day=0');await overview();assert.equal(await page.locator('#start').textContent(),'Open Read Aloud →');await page.locator('#path .step[data-section="0"]').click();await reader();
  for(let n=0;n<3;n++){await section().locator('#prev').click();await overview();await page.locator('#start').click();await reader();}
  await page.evaluate(()=>{const f=document.getElementById('frame');for(let n=0;n<5;n++){dispatchEvent(new Event('pageshow'));f.dispatchEvent(new Event('load'));}});
  await section().locator('#next').click();await reader(1);await page.goBack();await reader(0);await page.goForward();await reader(1);await page.reload();await reader(1);
  console.log('Repeated first-Previous returns, idempotent preparation and parent Back/Forward/reload pass');
  await page.goto(route());await reader();let stopCount=0;
  for(let i=0;i<steps.length;i++){
   const step=steps[i],f=await reader(i,0);await originalImage(f,step);await notes();assert.equal(await f.locator('.stage').evaluate(el=>el.classList.contains('spread')),!!step.bookPage);
   for(const selector of ['#prev','#next','#backBtn'])await target(f.locator(selector),`${step.id} ${selector}`);
   for(let stop=0;stop<step.stops.length;stop++){
    assert.equal(await f.locator('#teachingStop').isVisible(),stop>0);const image=await f.locator('#bookImg').getAttribute('src');await f.locator('#next').click();await reader(i,stop+1);assert.equal(await f.locator('#stopText').textContent(),step.stops[stop]);assert(await f.locator('#teachingStop').isVisible());assert.equal(await f.locator('#bookImg').getAttribute('src'),image);await notes();stopCount++;
   }
   if(i<23)await f.locator('#next').click();
  }
  assert.equal(stopCount,7);assert.equal((await state()).atEnd,true);assert.equal(await section().locator('#next').textContent(),'Next: Centers →');await shot(page,'monday-closing-1280x800');
  await section().locator('#next').click();await centers();await page.goBack();await reader(23);assert.equal((await state()).atEnd,true);await page.goForward();await centers();await page.reload();await centers();
  console.log('All 24 screens, original images, seven gated stops, repeated notes and Finish history restoration pass');
  // Every stop independently survives native history and reload. Previous returns
  // through the actual sequence, and a revisit resets the stop until acknowledged.
  for(const step of steps.filter(s=>s.stops.length)){
   const i=indexFor(step.id);await page.goto(route(i,0));let f=await reader(i,0);await f.locator('#next').click();await reader(i,1);const acknowledged=await state(),url=page.url();
   await page.goBack();await reader(i,0);await page.goForward();await reader(i,1);await page.reload();f=await reader(i,1);assert.deepEqual(await state(),acknowledged);assert.equal(page.url(),url);assert.equal(await f.locator('#stopText').textContent(),step.stops[0]);
   await f.locator('#prev').click();await reader(i-1,0);await page.goBack();await reader(i,1);await page.goForward();await reader(i-1,0);
  }
  for(const step of steps.filter(s=>s.vocabulary)){
   await page.goto(route(step.id));let f=await reader(step.id);assert.equal((await state()).vocabulary,true);assert.equal(await f.locator('#prompt').textContent(),step.prompt);await f.locator('#prev').click();f=await reader(step.sourceStep,0);assert.equal(await f.locator('#bookImg').getAttribute('src'),step.img);assert.equal((await state()).vocabulary,false);await page.goBack();await reader(step.id);await page.goForward();await reader(step.sourceStep,0);await page.reload();await reader(step.sourceStep,0);
  }
  await page.goto(route());await reader();await section().evaluate(()=>{for(let n=0;n<3;n++)document.getElementById('next').click();});await reader(3,0);await section().evaluate(()=>{document.getElementById('next').click();document.getElementById('next').click();});await reader(4,0);await page.goBack();await reader(3,1);await page.goBack();await reader(3,0);await page.goForward();await reader(3,1);
  console.log('Every stop and vocabulary Previous, native restoration and rapid-click history pass');
  for(const key of['Enter','Space']){await page.goto(base+'daily-lessons.html?week=11&day=0');await overview();await page.locator('#path .step[data-section="0"]').focus();await page.keyboard.press(key);await reader();}
  // Boundary handling must work before the iframe load event, including Finish
  // when entered through a deep link while original JPEG responses are held.
  for(const action of['prev','backBtn','next','advance']){
   let release;const gate=new Promise(r=>{release=r;}),pattern='**/mouse-paint/*.jpg',hold=async r=>{await gate;await r.continue().catch(()=>{});};await page.route(pattern,hold);
   try{
    const index=action==='next'?23:0;await page.goto(route(index),{waitUntil:'domcontentloaded'});let f=await reader(index);assert.equal(await f.locator('#bookImg').evaluate(img=>img.complete),false);
    await f.locator('#'+(action==='advance'?'next':action)).click();
    if(action==='advance'){await reader(1);await page.evaluate(()=>history.back());await reader(0);await page.evaluate(()=>history.forward());f=await reader(1);await f.locator('#backBtn').click();}
    if(action==='next')await centers();else await overview();
   }finally{release();await page.unroute(pattern,hold);}
  }
  console.log('Keyboard launches and first Previous, X, Finish and advance-before-image-load exits pass');
  for(const viewport of[{width:1280,height:800},{width:1180,height:757}]){
   await page.setViewportSize(viewport);await page.goto(base+'daily-lessons.html?week=11&day=0');await overview();
   for(const selector of['#path .step','#start','#weeknav button','#days button']){const controls=page.locator(selector);for(let i=0;i<await controls.count();i++)await target(controls.nth(i),`${viewport.width} overview ${selector}/${i}`);}await shot(page,`monday-overview-${viewport.width}x${viewport.height}`);
   const sample=[steps[0],steps[1],steps[2],...steps.filter(s=>s.stops.length||s.vocabulary),steps[21],steps[22],steps[23]];
   for(const step of sample){
    await page.goto(route(step.id,step.stops.length));const f=await reader(step.id,step.stops.length);await originalImage(f,step);
    for(const selector of['#prev','#next','#backBtn','#teacherNotes summary'])await target(f.locator(selector),`${viewport.width} ${step.id} ${selector}`);
    if(step.stops.length){const overflow=await f.locator('#teachingStop').evaluate(el=>el.scrollHeight>el.clientHeight+1);assert.equal(overflow,false,'Teaching prompt fits without being clipped');}
    await shot(page,`${step.id}-${viewport.width}x${viewport.height}`);await f.locator('#teacherNotes summary').click();
    for(const selector of['#prev','#next','#backBtn'])await target(f.locator(selector),`${viewport.width} ${step.id} notes-open ${selector}`);await shot(page,`${step.id}-notes-${viewport.width}x${viewport.height}`);
   }
  }
  // Standalone reader uses the same stable normalized history contract.
  const stand=indexFor('book-08');await page.goto(base+`week11-read-aloud.html?day=Monday&step=${stand}&stop=0`);await page.waitForFunction(()=>typeof window.EEASectionState==='function');const first=await page.evaluate(()=>window.EEASectionState());await page.locator('#next').click();const second=await page.evaluate(()=>window.EEASectionState());assert.equal(first.step,second.step);assert.equal(second.stop,1);
  await page.goBack();await until(async()=>JSON.stringify(await page.evaluate(()=>window.EEASectionState()))===JSON.stringify(first),'Standalone Back');await page.goForward();await until(async()=>JSON.stringify(await page.evaluate(()=>window.EEASectionState()))===JSON.stringify(second),'Standalone Forward');await page.reload();assert.deepEqual(await page.evaluate(()=>window.EEASectionState()),second);await page.locator('#backBtn').click();await overview();
  for(const[action,index]of[['prev',0],['next',23]]){await page.goto(base+`week11-read-aloud.html?day=Monday&step=${index}`);await page.waitForFunction(()=>typeof window.EEASectionState==='function');await page.locator('#'+action).click();if(action==='next')await centers();else await overview();}
  clean();await context.close();console.log('1280×800 and 1180×757 screenshots/containment/hit targets plus standalone history and boundary exits pass');
  // Freeze to Monday to catch invalid-day fallthrough regardless of CI weekday.
  const invalidContext=await browser.newContext({serviceWorkers:'block'});await invalidContext.addInitScript(()=>{const Native=Date;window.Date=class extends Native{constructor(...a){super(...(a.length?a:['2026-10-05T12:00:00Z']));}static now(){return new Native('2026-10-05T12:00:00Z').getTime();}};});const invalidPage=await invalidContext.newPage(),invalidClean=observe(invalidPage);
  for(const file of['week11-read-aloud.html','lesson-runner-week11.html'])for(const[day,expected]of[['Wednesday',2],['Thursday',3],['Friday',4],['2',2],['3',3],['4',4],['',0],['garbage',0],['5',0],['-1',0],['0.5',0],['Monday%20',0]]){
   const url=base+file+'?week=11&section=0'+(day?'&day='+day:'');await invalidPage.goto(url);await until(async()=>new URL(invalidPage.url()).pathname.endsWith('/daily-lessons.html'),'Unready/invalid day rejected');assert.equal(new URL(invalidPage.url()).searchParams.get('day'),String(expected));assert.equal(new URL(invalidPage.url()).searchParams.get('week'),'11');assert.equal(invalidPage.frames().length,1);assert.equal(await invalidPage.evaluate(()=>typeof window.EEASectionState),'undefined');assert.equal(await invalidPage.locator('#path .step').count(),expected<2?2:1);assert.equal(await invalidPage.locator('#start').isDisabled(),false);if(expected>=2){assert.deepEqual(await invalidPage.locator('#path .step b').allTextContents(),['Centers']);assert.equal(await invalidPage.getByRole('button',{name:'Open Read Aloud',exact:true}).count(),0);assert.equal(await invalidPage.getByRole('button',{name:'Open Centers',exact:true}).count(),1);}
  }
  for(const section of['2','-1','bad']){await invalidPage.goto(base+`lesson-runner-week11.html?week=11&day=0&section=${section}`);await until(async()=>new URL(invalidPage.url()).pathname.endsWith('/daily-lessons.html'),'Unavailable section rejected');assert.equal(invalidPage.frames().length,1);}
  invalidClean();await invalidContext.close();console.log('Unready named/numeric weekdays and invalid days/sections never render Monday');
  await verifyLegacyUpgrade(browser,base);
 }finally{if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
