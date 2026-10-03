// Chromium acceptance of checkout or APP_ROOT=desktop-app/app on Windows.
// Local-only exact old-worker fixture supplements authentic UI flow. Only the independently verified book JPEGs are displayed; vocabulary stays text-only.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const {root,read,plan,steps,last,fixtures,expected,consumedFiles,hash,until,child,route,diagnostics,navigate,capture,reader,overview,visualReady,screenshot,verifyViewport,nativeHistories,malformedRoutes}=require('./test_week12_readaloud_thursday_shared.cjs');
const out=process.env.WEEK12_READALOUD_THURSDAY_SCREENSHOT_DIR;
// Pin the deployed old reader to canonical Git bytes; Windows preparation
// intentionally rewrites text line endings, while current runtime hashes use APP_ROOT.
const oldWorker=Buffer.from(fixtures.oldWorker),oldReader=Buffer.from(fixtures.oldReader),oldHtml=Buffer.from(fixtures.oldHtml);
assert.equal(hash(oldHtml),fixtures.oldHtmlSha256,'Exact deployed prior reader HTML');
assert.equal(hash(oldWorker),fixtures.oldWorkerSha256,'Exact deployed v104 service worker');assert.equal(hash(oldReader),fixtures.oldReaderSha256,'Exact deployed Week12 reader v3');
for(const key of ['oldOverview','oldRunner','oldMondayPlan','oldMondayJson','oldTuesdayPlan','oldTuesdayJson','oldWednesdayPlan','oldWednesdayJson'])assert.equal(hash(Buffer.from(fixtures[key])),fixtures[key+'Sha256'],'Exact deployed '+key);
// Frozen old active plans are canonical deployed Git bytes, even on Windows.
// A prepared Windows build can legitimately have different text line endings;
// the old worker retains canonical unchanged-plan bytes until v105 activates.
const frozenPlans={'week12-read-aloud-plan-v1.js':'oldMondayPlan','week12-read-aloud-plan.json':'oldMondayJson','week12-read-aloud-tuesday-plan-v2.js':'oldTuesdayPlan','week12-read-aloud-tuesday-plan.json':'oldTuesdayJson','week12-read-aloud-wednesday-plan-v1.js':'oldWednesdayPlan','week12-read-aloud-wednesday-plan.json':'oldWednesdayJson'};
const oldExpected={...expected,...Object.fromEntries(Object.entries(frozenPlans).filter(([file])=>Object.hasOwn(expected,file)).map(([file,key])=>[file,fixtures[key+'Sha256']]))};
let upgraded=false,seedingOld=false;
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost');let fixture,type='text/javascript';
 if(u.pathname==='/v6-test/__qa-v104-worker.js')fixture=oldWorker;
 else if(u.pathname==='/v6-test/__qa-boot.html'){fixture='<!doctype html><title>Untouched v104 migration fixture</title>';type='text/html';}
 else if(u.pathname==='/v6-test/week12-read-aloud.html'&&seedingOld){fixture=oldHtml;type='text/html';}
 else if(u.pathname==='/v6-test/daily-lessons.html'&&seedingOld){fixture=fixtures.oldOverview;type='text/html';}
 else if(u.pathname==='/v6-test/lesson-runner-week12.html'&&seedingOld){fixture=fixtures.oldRunner;type='text/html';}
 else if(seedingOld&&frozenPlans[u.pathname.slice('/v6-test/'.length)]){fixture=fixtures[frozenPlans[u.pathname.slice('/v6-test/'.length)]];type=u.pathname.endsWith('.json')?'application/json':'text/javascript';}
 else if(u.pathname==='/v6-test/week12-read-aloud-v3.js'&&(seedingOld||upgraded))fixture=upgraded?read('week12-read-aloud-v4.js'):oldReader;
 if(fixture!==undefined){res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fixture);return;}
 let file;try{file=path.resolve(root,'.'+decodeURIComponent(u.pathname.slice('/v6-test'.length)));}catch{res.writeHead(400).end();return;}
 if(!u.pathname.startsWith('/v6-test/')||!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(b);});
});
async function repeatedControls(browser,base){
 for(const standalone of [false,true]){
  const context=await browser.newContext({serviceWorkers:'block'});
  try{
   const page=await context.newPage(),clean=diagnostics(page),cap=capture(page,base,{},['week12-read-aloud-v4.js','week12-read-aloud-plan-v1.js','week12-read-aloud-tuesday-plan-v2.js','week12-read-aloud-wednesday-plan-v1.js','week12-read-aloud-thursday-plan-v1.js']);
   await navigate(page,()=>page.goto(route(base,standalone)));let f=await reader(page,0,0,standalone);const baseline=await page.evaluate(()=>history.length);
   await page.evaluate(()=>{for(let n=0;n<5;n++){dispatchEvent(new Event('pageshow'));document.getElementById('frame')?.dispatchEvent(new Event('load'));}});
   const semantic=[[0,0]];let i=0,stop=0;for(let n=0;n<3;n++){if(stop<steps[i].stops.length)stop++;else{i++;stop=0;}semantic.push([i,stop]);}
   await f.evaluate(()=>{for(let n=0;n<3;n++)document.getElementById('next').click();});await reader(page,i,stop,standalone);assert.equal(await page.evaluate(()=>history.length),baseline+3,'Repeated Next creates exactly three semantic transitions');
   for(const [i,stop]of semantic.slice(0,-1).reverse()){await navigate(page,()=>page.goBack());await reader(page,i,stop,standalone);}
   for(const [i,stop]of semantic.slice(1)){await navigate(page,()=>page.goForward());await reader(page,i,stop,standalone);}
   const previous=i>0?i-1:0;await f.locator('#prev').click();await reader(page,previous,0,standalone);await cap.finish();clean();
  }finally{await context.close();}
  for(const [button,index]of [['prev',0],['backBtn',0],['backBtn',last],['next',last]]){
   const context=await browser.newContext({serviceWorkers:'block'});
   try{
    const page=await context.newPage(),clean=diagnostics(page),cap=capture(page,base,{},['week12-read-aloud-v4.js','week12-read-aloud-plan-v1.js','week12-read-aloud-tuesday-plan-v2.js','week12-read-aloud-wednesday-plan-v1.js','week12-read-aloud-thursday-plan-v1.js']);
    await navigate(page,()=>page.goto(route(base,standalone,index)));const f=await reader(page,index,0,standalone),baseline=await page.evaluate(()=>history.length);await page.evaluate(()=>localStorage.setItem('eea-lesson-auto-resume','enabled'));
    await navigate(page,()=>f.evaluate(id=>{for(let n=0;n<5;n++)document.getElementById(id).click();},button));await overview(page);assert.equal(await page.evaluate(()=>history.length),baseline+1,'Repeated '+button+' exits exactly once');
    await navigate(page,()=>page.goBack());await reader(page,index,0,standalone);await navigate(page,()=>page.goForward());await overview(page);await navigate(page,()=>page.reload());await overview(page);await cap.finish();clean();
   }finally{await context.close();}
  }
 }
 console.log('PASS: repeated lifecycle/Next/Previous, single semantic history entries and repeated completion/Close/first Previous exits');
}
async function pendingImages(browser,base){
 for(const standalone of [false,true])for(const [button,index]of [['prev',0],['backBtn',0],['backBtn',last],['next',last],['advance',0]]){
  const context=await browser.newContext({serviceWorkers:'block'});let release,requested=false;const gate=new Promise(r=>release=r);
  try{
   await context.route('**/'+steps[index].img,async r=>{if(r.request().resourceType()==='image')requested=true;await gate;await r.continue().catch(()=>{});});const page=await context.newPage();await page.goto(route(base,standalone,index,steps[index].stops.length),{waitUntil:'domcontentloaded'});let f=await reader(page,index,steps[index].stops.length,standalone);await until(()=>requested,'Held image request');assert.equal(await f.locator('#bookImg').evaluate(i=>i.complete),false);
   await f.locator('#'+(button==='advance'?'next':button)).click();if(button==='advance'){await reader(page,1,0,standalone);await page.evaluate(()=>history.back());await reader(page,0,0,standalone);await page.evaluate(()=>history.forward());f=await reader(page,1,0,standalone);await f.locator('#backBtn').click();}await overview(page);
  }finally{release();await context.unrouteAll({behavior:'wait'});await context.close();}
 }
 console.log('PASS: first Previous, Close, completion and native history work before original image load');
}
async function staleWorker(browser,base,evidence){
 const context=await browser.newContext({viewport:{width:1366,height:768},serviceWorkers:'allow'});
 try{
  seedingOld=true;const page=await context.newPage();await page.goto(base+'__qa-boot.html');await page.evaluate(async()=>{await navigator.serviceWorker.register('./__qa-v104-worker.js',{scope:'./'});await navigator.serviceWorker.ready;});await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/__qa-v104-worker.js'),null,{timeout:180000});
  assert.equal(await page.evaluate(async()=>(await(await caches.open('eea-companion-v104')).match('./week12-read-aloud.html')).text()),oldHtml.toString(),'Prior v104 installs the exact prior reader HTML');
  for(const [file,key]of [['daily-lessons.html','oldOverview'],['lesson-runner-week12.html','oldRunner']])assert.equal(await page.evaluate(async file=>(await(await caches.open('eea-companion-v104')).match('./'+file)).text(),file),fixtures[key],'Exact deployed v104 seeded bytes '+file);
  for(const [file,key]of Object.entries(frozenPlans))assert.equal(await page.evaluate(async file=>(await(await caches.open('eea-companion-v104')).match('./'+file)).text(),file),fixtures[key],'Exact deployed active v104 plan bytes '+file);
  for(const file of ['week12-read-aloud-v4.js','week12-read-aloud-thursday-plan-v1.js'])assert.equal(await page.evaluate(async file=>!!(await(await caches.open('eea-companion-v104')).match('./'+file)),file),false,'Thursday filename does not exist in exact old cache '+file);
  await page.goto(base+'week12-read-aloud.html?week=12&day=Wednesday&section=0');await page.waitForFunction(()=>typeof EEASectionState==='function');assert.match(await page.evaluate(()=>EEAReadAloudPlan.read),/Read 3/);assert.deepEqual(await page.locator('script[src]').evaluateAll(n=>n.map(x=>x.getAttribute('src'))),['week12-read-aloud-plan-v1.js','week12-read-aloud-tuesday-plan-v2.js','week12-read-aloud-wednesday-plan-v1.js','week12-read-aloud-v3.js'],'Exact old Wednesday HTML executes the exact old v3 runtime');
  await screenshot(page,out,'exact-v104-old-wednesday-baseline');
  const clean=diagnostics(page);seedingOld=false;upgraded=true;
  for(const [oldFile,newFile,oldBytes]of [['week12-read-aloud-v3.js','week12-read-aloud-v4.js',oldReader]])for(const suffix of ['', '?week12-upgrade=1']){
   assert.equal(hash(await(await context.request.get(base+oldFile+suffix)).body()),expected[newFile],'Origin has new same-path bytes '+oldFile);
   assert.equal(await page.evaluate(async file=>(await fetch('./'+file,{cache:'no-store'})).text(),oldFile+suffix),oldBytes.toString(),'Untouched v104 ignoreSearch keeps old pathname stale despite query bust '+oldFile);
  }
  const verified={},cap=capture(page,base,verified,consumedFiles,oldExpected);
  await navigate(page,()=>page.goto(base+'daily-lessons.html?week=12&day=3'));await overview(page);await page.locator('#start').click();
  for(let i=0;i<steps.length;i++){const f=await reader(page,i);await visualReady(f,steps[i]);for(let stop=1;stop<=steps[i].stops.length;stop++){await f.locator('#next').click();await reader(page,i,stop);}if(i<last)await f.locator('#next').click();}
  await screenshot(page,out,'exact-v104-new-week12-filenames');await navigate(page,()=>child(page).locator('#next').click());await overview(page);await cap.finish();
  assert.equal(verified['week12-read-aloud-v4.js'],expected['week12-read-aloud-v4.js']);assert.equal(verified['week12-read-aloud-thursday-plan-v1.js'],expected['week12-read-aloud-thursday-plan-v1.js']);
  assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL),base+'__qa-v104-worker.js');assert.equal(await page.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).length),1);assert.equal(await page.evaluate(async()=>(await(await caches.open('eea-companion-v104')).match('./week12-read-aloud-v3.js')).text()),oldReader.toString());
  assert.equal(await page.evaluate(async()=>(await(await caches.open('eea-companion-v104')).match('./week12-read-aloud-wednesday-plan-v1.js')).text()),fixtures.oldWednesdayPlan,'Old Wednesday plan remains untouched until worker activation');
  upgraded=false;await navigate(page,()=>page.evaluate(async()=>navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'})));await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/sw.js'),null,{timeout:180000});await until(async()=>{const keys=await page.evaluate(()=>caches.keys());return keys.includes('eea-companion-v105')&&!keys.includes('eea-companion-v104');},'Real v105 activation retires v104',180000);
  const current=await context.newPage(),currentClean=diagnostics(current),fresh={},freshCap=capture(current,base,fresh);
  // Complete the standalone reader on its real newly activated worker, proving
  // every current cue and script rather than only precache bytes.
  await navigate(current,()=>current.goto(route(base,true)));
  for(let i=0;i<steps.length;i++){const f=await reader(current,i,0,true);await visualReady(f,steps[i]);for(let stop=1;stop<=steps[i].stops.length;stop++){await f.locator('#next').click();await reader(current,i,stop,true);}if(i<last)await f.locator('#next').click();}
  await navigate(current,()=>current.locator('#next').click());await overview(current);await freshCap.finish();
  const cacheHashes={};for(const file of consumedFiles){await until(()=>current.evaluate(async file=>!!(await(await caches.open('eea-companion-v105')).match('./'+file)),file),'v105 cache '+file);const bytes=await current.evaluate(async file=>Array.from(new Uint8Array(await(await(await caches.open('eea-companion-v105')).match('./'+file)).arrayBuffer())),file);cacheHashes[file]=hash(Buffer.from(bytes));assert.equal(cacheHashes[file],expected[file]);}
  assert.equal(await current.evaluate(async()=>(await(await caches.open('eea-companion-v105')).match('./week12-read-aloud-v3.js')).text()),read('week12-read-aloud-v3.js').toString(),'Current worker preserves exact prepared prior v3 bytes too');
  assert.equal(await current.evaluate(async()=>(await(await caches.open('eea-companion-v105')).match('./week12-read-aloud-wednesday-plan-v1.js')).text()),read('week12-read-aloud-wednesday-plan-v1.js').toString(),'Current worker retains exact prepared prior Wednesday plan');
  evidence.migration={sourceCommit:fixtures.sourceCommit,oldHtmlSha256:hash(oldHtml),oldWorkerSha256:hash(oldWorker),oldReaderSha256:hash(oldReader),oldOverviewSha256:fixtures.oldOverviewSha256,oldRunnerSha256:fixtures.oldRunnerSha256,oldWednesdayPlanSha256:fixtures.oldWednesdayPlanSha256,newThursdayPlanFilename:'week12-read-aloud-thursday-plan-v1.js',newRuntimeFilename:'week12-read-aloud-v4.js',oldExpected,verified,freshExpected:expected,fresh,cacheHashes,queryBustStale:true,oldCachePreservedBeforeUpgrade:true,noManualReset:true};currentClean();clean();
 }finally{await context.close();upgraded=false;seedingOld=false;}
 console.log('PASS: exact v104 stale filename/query proof, fresh week12 reader under old worker, real v105 activation and exact current cache bytes without reset');
}
(async()=>{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const base=`http://127.0.0.1:${server.address().port}/v6-test/`;let browser;const evidence={platform:process.platform,appSource:root,commit:process.env.GITHUB_SHA||null,expected};
 try{browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,ignoreDefaultArgs:['--disable-back-forward-cache']});evidence.browser=await browser.version();for(const viewport of [{width:1920,height:1080},{width:1366,height:768}])await verifyViewport(browser,base,viewport,out,evidence);await nativeHistories(browser,base,evidence);await malformedRoutes(browser,base);await repeatedControls(browser,base);await pendingImages(browser,base);await staleWorker(browser,base,evidence);if(out)fs.writeFileSync(path.join(out,'verification-manifest.json'),JSON.stringify(evidence,null,2));}
 finally{if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
