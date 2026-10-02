// Real Chromium regression for Tuesday Unit 2 Week 3 Mouse Paint Read 2.
// Requires Playwright 1.62.1. JSDOM cannot prove actual image clipping, native
// joint history, responsive hit targets, service-worker upgrades or early exits.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const crypto=require('node:crypto');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),v6=path.join(root,'v6-test');
const screenshotDir=process.env.WEEK11_READALOUD_TUESDAY_SCREENSHOT_DIR;
const plan=JSON.parse(fs.readFileSync(path.join(v6,'week11-read-aloud-tuesday-plan.json'),'utf8'));
const monday=JSON.parse(fs.readFileSync(path.join(v6,'week11-read-aloud-plan.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(v6,'assets/focus-3s/unit-2/week-3/mouse-paint/source-manifest.json'),'utf8'));
const steps=plan.steps,last=steps.length-1,indexFor=s=>typeof s==='number'?s:steps.findIndex(step=>step.id===s);
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const immutable={
 'week11-read-aloud-v1.js':'9ad16dd03cc67f3c9e4c685029c74fe9dd822acb1070d62112df1e7ba71921a9',
 'week11-read-aloud-plan-v1.js':'45340305ccadb7eb5c0bcb115254601b3ef633336cf11187fcf8af396a7930cb'
};
function immutableFiles(){for(const[file,sha]of Object.entries(immutable))assert.equal(digest(fs.readFileSync(path.join(v6,file))),sha,`${file}: deployed v89 bytes are immutable`);}
immutableFiles();
assert.equal(steps.length,19);assert.equal(steps.filter(s=>s.bookPage).length,16);
assert.equal(steps.reduce((n,s)=>n+s.stops.length,0),9);
assert.equal(indexFor('book-03'),3);assert.equal(steps[3].coverRightPage,true);assert.equal(steps[3].revealAtStop,2);
for(const source of manifest.images)assert.equal(digest(fs.readFileSync(path.join(v6,'assets/focus-3s/unit-2/week-3/mouse-paint',source.file))),source.sha256,`${source.file}: original JPEG bytes`);
const contentType=file=>({'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream');
// Seed every old Week 10 HTML/JS/JSON file, including superseded versions, and
// every original asset referenced by those files. Keep all entries and the old
// controlling worker in place throughout recovery; no cleanup is used as a fix.
const week10Paths=fs.readdirSync(v6).filter(file=>/^(?:lesson-runner-)?week10.*\.(?:js|json|html)$/.test(file));
const legacyPaths=new Set([...week10Paths,...Object.keys(immutable),'week11-read-aloud-plan.json']);
for(const file of week10Paths)for(const match of fs.readFileSync(path.join(v6,file),'utf8').matchAll(/['"`]((?:\.\/)?assets\/[^'"`]+)['"`]/gi)){
 const asset=match[1].replace(/^\.\//,'');assert(fs.existsSync(path.join(v6,asset)),`${file}: referenced asset ${asset}`);legacyPaths.add(asset);
}
for(const source of manifest.images)legacyPaths.add('assets/focus-3s/unit-2/week-3/mouse-paint/'+source.file);
const legacySeed=Object.fromEntries([...legacyPaths].map(file=>{const bytes=fs.readFileSync(path.join(v6,file));return[file,{body:bytes.toString('base64'),type:contentType(file),sha:digest(bytes)}];}));
const oldHtml=fs.readFileSync(path.join(v6,'week11-read-aloud.html'),'utf8').replace('<script src="week11-read-aloud-tuesday-plan-v1.js"></script>','').replace('week11-read-aloud-v4.js','week11-read-aloud-v1.js');
legacySeed['week11-read-aloud.html']={body:Buffer.from(oldHtml).toString('base64'),type:'text/html',sha:digest(oldHtml)};
const legacyCache='eea-qa-week11-v89',legacyWorkerPath='/v6-test/__qa-week11-v89-worker.js';
const legacyWorker=`const CACHE=${JSON.stringify(legacyCache)};
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);const seed=await(await fetch('./__qa-week11-v89-seed.json',{cache:'no-store'})).json();for(const[file,entry]of Object.entries(seed)){const bytes=Uint8Array.from(atob(entry.body),c=>c.charCodeAt(0));await cache.put(new URL(file,self.location.href).href,new Response(bytes,{headers:{'Content-Type':entry.type}}));}await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;const isHtml=request.mode==='navigate'||request.destination==='document'||url.pathname.endsWith('.html');if(isHtml){event.respondWith(fetch(request,{cache:'no-store'}).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});}return response;}).catch(async()=>{const cached=await caches.match(request,{ignoreSearch:true});if(cached)return cached;if(request.mode==='navigate')return caches.match('./index.html',{ignoreSearch:true});throw new Error('Offline resource unavailable');}));return;}event.respondWith(caches.match(request,{ignoreSearch:true}).then(cached=>cached||fetch(request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});}return response;})));});`;
function fixture(request,response){
 const url=new URL(request.url,'http://localhost'),p=url.pathname;let body,type='text/javascript';
 if(p===legacyWorkerPath)body=legacyWorker;
 else if(p==='/v6-test/__qa-week11-v89-seed.json'){body=JSON.stringify(legacySeed);type='application/json';}
 else if(p==='/v6-test/__qa-week11-v89-boot.html'){body='<!doctype html><title>Isolated v89 upgrade fixture</title>';type='text/html';}
 else if(url.searchParams.get('bust')==='qa-v90'&&Object.hasOwn(immutable,path.basename(p)))body='/* network-only changed bytes */\n'+fs.readFileSync(path.join(v6,path.basename(p)),'utf8');
 else return false;
 response.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(body);return true;
}
const server=http.createServer((request,response)=>{
 if(fixture(request,response))return;
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)){response.writeHead(403).end();return;}
 fs.readFile(file,(error,bytes)=>{if(error){response.writeHead(404).end();return;}response.writeHead(200,{'Content-Type':contentType(file),'Cache-Control':'no-store'}).end(bytes);});
});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check,label){for(let i=0;i<240;i++){try{if(await check())return;}catch{}await delay(25);}assert.fail(label);}
async function shot(page,name){if(screenshotDir){fs.mkdirSync(screenshotDir,{recursive:true});await page.screenshot({path:path.join(screenshotDir,name+'.png'),fullPage:true});}}
function observe(page){const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))missing.push(`${r.status()} ${r.url()}`);});return()=>{assert.deepEqual(errors,[],'No page exceptions');assert.deepEqual(missing,[],'No missing resources');};}
async function target(locator,label){const g=await locator.evaluate(el=>{const r=el.getBoundingClientRect(),hit=el.ownerDocument.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{inside:r.x>=0&&r.y>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,width:r.width,height:r.height,hit:!!hit&&(hit===el||el.contains(hit))};});assert(g.inside&&g.width>0&&g.height>0&&g.hit,`${label}: unobscured viewport target ${JSON.stringify(g)}`);}
async function originalImage(f,step){
 const image=f.locator('#bookImg'),source=manifest.images[step.sourceSlide-1];assert.equal(await image.getAttribute('src'),step.img);
 await until(()=>image.evaluate((img,expected)=>img.complete&&img.naturalWidth===expected.width&&img.naturalHeight===expected.height,source),`${step.id}: complete original dimensions`);
 const g=await image.evaluate(el=>{const r=el.getBoundingClientRect();return{fit:getComputedStyle(el).objectFit,x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height,vw:innerWidth,vh:innerHeight};});
 assert.equal(g.fit,'contain',`${step.id}: preserve complete source fitting`);assert(g.width>200&&g.height>100&&g.x>=-1&&g.y>=-1&&g.right<=g.vw+1&&g.bottom<=g.vh+1,`${step.id}: image inside viewport ${JSON.stringify(g)}`);
}
async function cover(f,shown){
 const masked=shown<2,image=f.locator('#bookImg');
 assert.equal(await image.evaluate(el=>el.style.clipPath.replace(/\b0px\b/g,'0')),masked?'inset(0 50% 0 0)':'','Mask must clip the actual image, not just display a label');
 assert.equal(await image.evaluate(el=>getComputedStyle(el).clipPath.replace(/\b0px\b/g,'0')),masked?'inset(0 50% 0 0)':'none');
 assert.equal(await f.locator('#pageCoverNote').isVisible(),masked);if(masked)assert.match(await f.locator('#pageCoverNote').textContent(),/Page 4 covered/);
 const hit=await image.evaluate(el=>{const r=el.getBoundingClientRect(),y=r.top+r.height*.4;return{left:document.elementFromPoint(r.left+r.width*.25,y)===el,right:document.elementFromPoint(r.left+r.width*.75,y)===el};});
 assert.equal(hit.left,true,'Page 3 remains present');assert.equal(hit.right,!masked,'Actual Page 4 image region is clipped until reveal');
 const text=await f.locator('body').innerText();
 if(masked){assert(!text.includes(steps[3].stops[1]),'Answer remains absent from visible text before reveal');assert.match(await image.getAttribute('alt'),/page 4 is covered/i);}else assert.equal(await f.locator('#stopText').textContent(),steps[3].stops[1]);
 if(shown===1)assert.equal(await f.locator('#next').textContent(),'Reveal Page 4 →');
}
// Compare actual Chromium screenshot pixels, without third-party image modules.
// Restrict samples to the central image region above the teaching-stop overlay.
async function pixelReveal(page,before,after){
 const diff=await page.evaluate(async({before,after})=>{async function pixels(data){const img=new Image();img.src='data:image/png;base64,'+data;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);return{width:img.width,height:img.height,data:ctx.getImageData(0,0,img.width,img.height).data};}const a=await pixels(before),b=await pixels(after);if(a.width!==b.width||a.height!==b.height)throw new Error('Image geometry changed on reveal');let left=0,right=0,total=0;for(let y=Math.floor(a.height*.2);y<a.height*.55;y++)for(let x=Math.floor(a.width*.06);x<a.width*.94;x++){const i=(y*a.width+x)*4,changed=Math.max(...[0,1,2].map(c=>Math.abs(a.data[i+c]-b.data[i+c])))>12;if(x<a.width*.45)left+=changed;else if(x>a.width*.55){right+=changed;total++;}}return{left,right,total};},{before:before.toString('base64'),after:after.toString('base64')});
 assert.equal(diff.left,0,'Reveal preserves the visible left page pixels');assert(diff.right>Math.max(300,diff.total*.01),`Reveal visibly restores right-page pixels: ${JSON.stringify(diff)}`);
}
async function verifyLegacyUpgrade(browser,base){
 const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'allow'});
 try{
  const page=await context.newPage(),clean=observe(page);await page.goto(base+'__qa-week11-v89-boot.html');
  await page.evaluate(async()=>{await navigator.serviceWorker.register('./__qa-week11-v89-worker.js',{scope:'./'});await navigator.serviceWorker.ready;});
  await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/__qa-week11-v89-worker.js'));
  async function cachedDigest(file){return page.evaluate(async({file,name})=>{const response=await(await caches.open(name)).match('./'+file);if(!response)return null;const digest=await crypto.subtle.digest('SHA-256',await response.arrayBuffer());return [...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');},{file,name:legacyCache});}
  for(const[file,entry]of Object.entries(legacySeed))assert.equal(await cachedDigest(file),entry.sha,`${file}: exact v89 seed`);
  for(const file of Object.keys(immutable)){
   const network=await(await fetch(base+file+'?bust=qa-v90')).text();assert(network.startsWith('/* network-only changed bytes */'));
   const stale=await page.evaluate(async file=>await(await fetch('./'+file+'?bust=qa-v90')).text(),file);assert.equal(digest(stale),immutable[file],`${file}?bust remains stale under ignoreSearch`);assert.notEqual(stale,network);
  }
  const fresh=['week11-read-aloud-v4.js','week11-read-aloud-tuesday-plan-v1.js'],responses=new Map();
  page.on('response',r=>{const file=new URL(r.url()).pathname.split('/').at(-1);if(fresh.includes(file))responses.set(file,r);});
  await page.goto(base+'daily-lessons.html?week=11&day=1');assert.equal(await page.locator('#path .step').count(),2);await page.locator('#start').click();
  const child=()=>page.frames().find(f=>f.parentFrame()===page.mainFrame());
  await until(async()=>child()?.url().includes('/week11-read-aloud.html')&&await child().evaluate(()=>window.EEAReadAloudPlan?.day==='Tuesday'&&window.EEASectionState().total===19),'Old v89 worker opens new Tuesday');
  let f=child();assert.equal(page.frames().length,2);assert.equal(await f.locator('#stepTitle').textContent(),'Opening');assert.equal(new URL(page.url()).searchParams.get('day'),'1');
  assert.deepEqual(await f.locator('script[src]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('src'))),['week11-read-aloud-plan-v1.js','week11-read-aloud-tuesday-plan-v1.js','week11-read-aloud-v4.js']);
  for(const file of fresh){assert(responses.has(file),`Fetched new versioned path ${file}`);assert.equal(await responses.get(file).text(),fs.readFileSync(path.join(v6,file),'utf8'));}
  await originalImage(f,steps[0]);await shot(page,'old-v89-worker-tuesday-upgrade');
  await f.locator('#next').click();assert.equal(await f.evaluate(()=>window.EEASectionState().step),1);assert.equal(new URL(page.url()).searchParams.get('step'),'1');await page.reload();f=child();assert.equal(await f.evaluate(()=>window.EEASectionState().step),1);
  await f.locator('#backBtn').click();await until(async()=>new URL(page.url()).pathname.endsWith('/daily-lessons.html'),'Old worker exits top-level');assert.equal(page.frames().length,1);assert.equal(new URL(page.url()).searchParams.get('day'),'1');
  // Monday keeps the unchanged v1 plan and its complete 24-screen sequence.
  await page.goto(base+'week11-read-aloud.html?day=Monday');await page.waitForFunction(()=>window.EEAReadAloudPlan?.day==='Monday');assert.deepEqual(await page.evaluate(()=>window.EEAReadAloudPlan),monday);assert.equal(await page.evaluate(()=>window.EEASectionState().total),24);assert.equal(await page.locator('#stepTitle').textContent(),'Before Reading');assert.equal(await page.locator('#bookImg').evaluate(el=>getComputedStyle(el).clipPath),'none');
  for(const day of['Monday','Tuesday','Wednesday','Thursday','Friday']){await page.goto(base+'week10-read-aloud.html?day='+day);await page.waitForFunction(()=>typeof window.EEASectionState==='function');assert.equal(await page.locator('script[src]').last().getAttribute('src'),'week10-read-aloud-v9.js');}
  assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL),new URL(legacyWorkerPath,base).href,'Old worker still controls after verification');
  for(const file of legacyPaths)assert.equal(await cachedDigest(file),legacySeed[file].sha,`${file}: old cache is intact after upgrade`);
  assert((await page.evaluate(()=>caches.keys())).includes(legacyCache));immutableFiles();clean();console.log(`v89 cache-first upgrade passes with ${legacyPaths.size} unchanged legacy assets, stale ?bust URLs, fresh v2 paths, Monday and Week 10 intact`);
 }finally{await context.close();}
}
(async()=>{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const base=`http://127.0.0.1:${server.address().port}/v6-test/`;let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,ignoreDefaultArgs:['--disable-back-forward-cache']});
  const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'}),page=await context.newPage(),clean=observe(page);
  const section=()=>page.frames().find(f=>f.parentFrame()===page.mainFrame()),state=()=>section().evaluate(()=>window.EEASectionState());
  const route=(step=0,stop=0)=>`${base}lesson-runner-week11.html?week=11&day=1&section=0&step=${indexFor(step)}&stop=${stop}`;
  async function reader(step=0,stop){
   const expected=indexFor(step);assert(expected>=0,`Known step ${step}`);await until(async()=>section()?.url().includes('/week11-read-aloud.html')&&await section().evaluate(({step,stop})=>typeof window.EEASectionState==='function'&&window.EEASectionState().step===step&&(stop===undefined||window.EEASectionState().stop===stop),{step:expected,stop}),'Tuesday reader '+step+' stop '+stop);
   const f=section(),outer=new URL(page.url()),child=new URL(f.url()),s=await state();assert(outer.pathname.endsWith('/lesson-runner-week11.html'));
   for(const p of[outer.searchParams,child.searchParams]){assert.equal(p.get('week'),'11');assert.equal(p.get('section'),'0');assert.equal(p.get('step'),String(s.step));assert.equal(p.get('stop'),String(s.stop));}
   assert.equal(outer.searchParams.get('day'),'1');assert.equal(child.searchParams.get('day'),'Tuesday');assert.equal(child.searchParams.get('from'),'runner');assert.equal(page.frames().length,2);assert.equal(await f.locator('iframe').count(),0);assert.equal(s.total,19);assert.equal(s.vocabulary,false);
   const resume=await page.evaluate(()=>JSON.parse(localStorage.getItem('eea-lesson-resume')));assert.equal(resume.week,11);assert.equal(resume.day,1);assert.equal(resume.section,0);assert.equal(await f.locator('#chip').textContent(),'UNIT 2 · WEEK 3 · TUESDAY');return f;
  }
  async function overview(day=1){await until(async()=>new URL(page.url()).pathname.endsWith('/daily-lessons.html')&&await page.locator('#days button').count()===5,'Top-level Week 11 overview');const p=new URL(page.url()).searchParams;assert.equal(p.get('week'),'11');assert.equal(p.get('day'),String(day));assert.equal(page.frames().length,1,'Overview never nested');assert.equal(await page.locator('#path .step').count(),day<2?2:day<=3?1:0);assert.equal(await page.locator('#start').isDisabled(),day>3);assert.equal(await page.evaluate(()=>localStorage.getItem('eea-lesson-auto-resume')),null);}
  async function centers(){await until(async()=>section()?.url().includes('/week11-centers.html')&&await section().evaluate(()=>typeof EEASectionState==='function'&&EEASectionState().step===0),'Same-day Tuesday Centers');assert.equal(new URL(page.url()).searchParams.get('day'),'1');assert.equal(new URL(page.url()).searchParams.get('section'),'1');assert.equal(page.frames().length,2);}
  async function notes(){const f=section(),url=page.url(),len=await page.evaluate(()=>history.length),s=await state(),toggle=f.locator('#teacherNotes summary');for(let n=0;n<3;n++){await toggle.click();await toggle.click();}assert.deepEqual(await state(),s);assert.equal(page.url(),url);assert.equal(await page.evaluate(()=>history.length),len);}
  await page.goto(base+'daily-lessons.html?week=11&day=1');await overview();assert.equal(await page.locator('#start').textContent(),'Open Read Aloud →');await page.locator('#path .step[data-section="0"]').click();await reader();
  for(let n=0;n<3;n++){await section().locator('#prev').click();await overview();await page.locator('#start').click();await reader();}
  await page.evaluate(()=>{const f=document.getElementById('frame');for(let n=0;n<5;n++){dispatchEvent(new Event('pageshow'));f.dispatchEvent(new Event('load'));}});
  await section().locator('#next').click();await reader(1);await page.goBack();await reader(0);await page.goForward();await reader(1);await page.reload();await reader(1);
  console.log('Tuesday launches, repeated first-Previous, idempotent load/pageshow, parent Back/Forward/reload pass');
  await page.goto(route());await reader();let stopCount=0;const seenSources=new Set();
  for(let i=0;i<steps.length;i++){
   const step=steps[i],f=await reader(i,0);await originalImage(f,step);seenSources.add(step.sourceSlide);await notes();assert.equal(await f.locator('.stage').evaluate(el=>el.classList.contains('spread')),!!step.bookPage);assert.equal(await f.locator('#stepTitle').textContent(),step.title);assert.equal(await f.locator('#prompt').textContent(),step.prompt);
   for(const selector of['#prev','#next','#backBtn'])await target(f.locator(selector),`${step.id} ${selector}`);
   if(step.coverRightPage)await cover(f,0);else{assert.equal(await f.locator('#bookImg').evaluate(el=>getComputedStyle(el).clipPath),'none');assert.equal(await f.locator('#pageCoverNote').isVisible(),false);}
   for(let stop=0;stop<step.stops.length;stop++){
    assert.equal(await f.locator('#teachingStop').isVisible(),stop>0);const image=await f.locator('#bookImg').getAttribute('src');await f.locator('#next').click();await reader(i,stop+1);assert.equal(await f.locator('#stopText').textContent(),step.stops[stop]);assert(await f.locator('#teachingStop').isVisible());assert.equal(await f.locator('#bookImg').getAttribute('src'),image);await notes();if(step.coverRightPage)await cover(f,stop+1);stopCount++;
   }
   if(i<last)await f.locator('#next').click();
  }
  assert.equal(seenSources.size,16);assert.equal(stopCount,9);assert.equal((await state()).atEnd,true);assert.equal(await section().locator('#next').textContent(),'Next: Centers →');await shot(page,'tuesday-closing-1280x800');
  await section().locator('#next').click();await centers();await page.goBack();await reader(last);assert.equal((await state()).atEnd,true);await page.goForward();await centers();await page.reload();await centers();
  console.log('All 19 screens, 16 original images, nine teaching stops, notes and Finish native history pass');
  // Each teaching stop, including both cover states, is its own history entry.
  for(const step of steps.filter(s=>s.stops.length))for(let stop=1;stop<=step.stops.length;stop++){
   const i=indexFor(step.id);await page.goto(route(i,stop-1));let f=await reader(i,stop-1);await f.locator('#next').click();await reader(i,stop);const acknowledged=await state(),url=page.url();
   await page.goBack();f=await reader(i,stop-1);if(step.coverRightPage)await cover(f,stop-1);await page.goForward();f=await reader(i,stop);if(step.coverRightPage)await cover(f,stop);await page.reload();f=await reader(i,stop);assert.deepEqual(await state(),acknowledged);assert.equal(page.url(),url);assert.equal(await f.locator('#stopText').textContent(),step.stops[stop-1]);
   await f.locator('#prev').click();await reader(i-1,0);await page.goBack();await reader(i,stop);await page.goForward();await reader(i-1,0);
  }
  // Previous from the following spread starts Pages 3–4 covered again, without
  // consuming either question. Native history can still restore the old reveal.
  await page.goto(route('book-03',1));let f=await reader('book-03',1);await originalImage(f,steps[3]);await cover(f,1);const coveredPixels=await f.locator('#bookImg').screenshot();await shot(page,'page-4-covered');
  await f.locator('#next').click();f=await reader('book-03',2);await cover(f,2);const revealedPixels=await f.locator('#bookImg').screenshot();await pixelReveal(page,coveredPixels,revealedPixels);await shot(page,'page-4-revealed');
  await f.locator('#next').click();f=await reader('book-04',0);await f.locator('#prev').click();f=await reader('book-03',0);await cover(f,0);await page.reload();f=await reader('book-03',0);await cover(f,0);await page.goBack();await reader('book-04',0);await page.goBack();f=await reader('book-03',2);await cover(f,2);await page.goForward();await reader('book-04',0);await page.goForward();f=await reader('book-03',0);await cover(f,0);
  // One synchronous event burst must preserve every intermediate teaching stop.
  await page.goto(route('book-03',0));await reader('book-03',0);await section().evaluate(()=>{for(let n=0;n<3;n++)document.getElementById('next').click();});await reader('book-04',0);for(const stop of[2,1,0]){await page.goBack();f=await reader('book-03',stop);await cover(f,stop);}for(const stop of[1,2]){await page.goForward();f=await reader('book-03',stop);await cover(f,stop);}await page.goForward();await reader('book-04',0);
  console.log('Every stop and Previous reset survives history/reload; Page 4 screenshot pixels and rapid-click sequence pass');
  for(const key of['Enter','Space']){await page.goto(base+'daily-lessons.html?week=11&day=1');await overview();await page.locator('#path .step[data-section="0"]').focus();await page.keyboard.press(key);await reader();}
  // Use a fresh context per held-image case so no decoded image cache can make
  // the early-exit assertion pass without actually delaying iframe load.
  for(const action of['prev','backBtn','next','advance','rapid']){
   const early=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'}),p=await early.newPage(),earlyClean=observe(p);let release;const gate=new Promise(r=>{release=r;});await p.route('**/mouse-paint/*.jpg',async r=>{await gate;await r.continue().catch(()=>{});});
   try{
    const i=action==='next'?last:action==='rapid'?3:0;await p.goto(route(i),{waitUntil:'domcontentloaded'});const child=()=>p.frames().find(frame=>frame.parentFrame()===p.mainFrame());await until(async()=>child()&&await child().evaluate(()=>typeof window.EEASectionState==='function'),'Early reader scripts initialized');f=child();assert.equal(await f.locator('#bookImg').evaluate(img=>img.complete),false,'Image genuinely delayed');
    if(action==='advance'||action==='rapid'){
     await f.evaluate(n=>{for(let i=0;i<n;i++)document.getElementById('next').click();},action==='rapid'?3:1);assert.equal(await f.evaluate(()=>window.EEASectionState().step),action==='rapid'?4:1);
     await p.evaluate(()=>history.back());await until(async()=>await f.evaluate(rapid=>window.EEASectionState().step===(rapid?3:0)&&window.EEASectionState().stop===(rapid?2:0),action==='rapid'),'Early Back');
     await p.evaluate(()=>history.forward());await until(async()=>await f.evaluate(i=>window.EEASectionState().step===i,action==='rapid'?4:1),'Early Forward');await f.locator('#backBtn').click();
    }else await f.locator('#'+action).click();
    if(action==='next'){await until(async()=>child()?.url().includes('/week11-centers.html')&&await child().evaluate(()=>typeof EEASectionState==='function'),'Early same-day Centers');assert.equal(p.frames().length,2);assert.equal(new URL(p.url()).searchParams.get('section'),'1');}else{await until(async()=>new URL(p.url()).pathname.endsWith('/daily-lessons.html')&&await p.locator('#days button').count()===5,'Early same-day exit');assert.equal(p.frames().length,1);}assert.equal(new URL(p.url()).searchParams.get('day'),'1');assert.equal(new URL(p.url()).searchParams.get('week'),'11');assert.equal(await p.evaluate(()=>localStorage.getItem('eea-lesson-auto-resume')),null);earlyClean();
   }finally{release();await early.close();}
  }
  console.log('Keyboard launches and image-delayed first Previous, X, Finish, advance and rapid-click exits pass');
  for(const viewport of[{width:1280,height:800},{width:1180,height:757}]){
   await page.setViewportSize(viewport);await page.goto(base+'daily-lessons.html?week=11&day=1');await overview();for(const selector of['#path .step','#start','#weeknav button','#days button']){const controls=page.locator(selector);for(let i=0;i<await controls.count();i++)await target(controls.nth(i),`${viewport.width} overview ${selector}/${i}`);}await shot(page,`tuesday-overview-${viewport.width}x${viewport.height}`);
   for(const step of steps){
    const states=step.coverRightPage?[0,1,2]:[step.stops.length];
    for(const stop of states){await page.goto(route(step.id,stop));f=await reader(step.id,stop);await originalImage(f,step);if(step.coverRightPage)await cover(f,stop);for(const selector of['#prev','#next','#backBtn','#teacherNotes summary'])await target(f.locator(selector),`${viewport.width} ${step.id}/${stop} ${selector}`);
     if(stop)assert.equal(await f.locator('#teachingStop').evaluate(el=>el.scrollHeight>el.clientHeight+1),false,'Teaching prompt is not clipped');
     await shot(page,`${step.id}-stop${stop}-${viewport.width}x${viewport.height}`);await f.locator('#teacherNotes summary').click();for(const selector of['#prev','#next','#backBtn'])await target(f.locator(selector),`${viewport.width} ${step.id} notes-open ${selector}`);await shot(page,`${step.id}-stop${stop}-notes-${viewport.width}x${viewport.height}`);
    }
   }
  }
  // Standalone uses identical cover/stop history, normalized routes and exits.
  const standalone=(step,stop=0)=>base+`week11-read-aloud.html?day=Tuesday&step=${indexFor(step)}&stop=${stop}`;
  await page.goto(standalone('book-03'));await page.waitForFunction(()=>typeof window.EEASectionState==='function');await cover(page,0);await page.locator('#next').click();await cover(page,1);const first=await page.evaluate(()=>window.EEASectionState());await page.locator('#next').click();await cover(page,2);const second=await page.evaluate(()=>window.EEASectionState());
  await page.goBack();await until(async()=>JSON.stringify(await page.evaluate(()=>window.EEASectionState()))===JSON.stringify(first),'Standalone Back');await cover(page,1);await page.goForward();await until(async()=>JSON.stringify(await page.evaluate(()=>window.EEASectionState()))===JSON.stringify(second),'Standalone Forward');await cover(page,2);await page.reload();assert.deepEqual(await page.evaluate(()=>window.EEASectionState()),second);await cover(page,2);
  await page.locator('#next').click();await page.locator('#prev').click();await cover(page,0);assert.equal(new URL(page.url()).searchParams.get('stop'),'0');await page.locator('#backBtn').click();await overview();
  for(const[action,index]of[['prev',0],['next',last]]){await page.goto(standalone(index));await page.waitForFunction(()=>typeof window.EEASectionState==='function');await page.locator('#'+action).click();if(action==='next')await centers();else await overview();await page.goBack();await page.waitForFunction(()=>typeof window.EEASectionState==='function');assert.equal(await page.evaluate(()=>window.EEASectionState().step),index);await page.goForward();if(action==='next')await centers();else await overview();}
  for(const file of['week11-read-aloud.html','lesson-runner-week11.html'])for(const day of['Tuesday','1']){await page.goto(base+file+'?week=11&day='+day+'&section=0&step=3&stop=2');const f=file.startsWith('lesson-runner')?await reader(3,2):page;await f.waitForFunction(()=>typeof window.EEASectionState==='function');assert.equal(await f.evaluate(()=>window.EEAReadAloudPlan.day),'Tuesday');await cover(f,2);}
  clean();await context.close();console.log('Both viewport sizes, all screen hit targets/screenshots, named/numeric Tuesday and standalone history/boundaries pass');
  await verifyLegacyUpgrade(browser,base);immutableFiles();
 }finally{if(browser)await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
