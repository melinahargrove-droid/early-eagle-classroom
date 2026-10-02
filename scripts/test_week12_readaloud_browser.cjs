// Chromium acceptance of checkout or APP_ROOT=desktop-app/app on Windows.
// Local-only old-worker and pending-image fixtures supplement authentic UI flow.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const {execFileSync}=require('node:child_process');
const {root,read,plan,steps,last,fixtures,expected,consumedFiles,hash,until,child,route,diagnostics,navigate,capture,reader,overview,imageReady,screenshot,verifyViewport}=require('./test_week12_readaloud_shared.cjs');
const out=process.env.WEEK12_READALOUD_SCREENSHOT_DIR;
// Pin the deployed old reader to canonical Git bytes; Windows preparation
// intentionally rewrites text line endings, while current runtime hashes use APP_ROOT.
const oldWorker=Buffer.from(fixtures.oldWorker),oldReader=execFileSync('git',['show','HEAD:v6-test/week11-read-aloud-v4.js'],{cwd:path.resolve(__dirname,'..')});
assert.equal(hash(oldWorker),fixtures.oldWorkerSha256,'Exact deployed v100 service worker');assert.equal(hash(oldReader),fixtures.oldReaderSha256,'Prior Week11 reader remains untouched');
let upgraded=false;
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost');let fixture,type='text/javascript';
 if(u.pathname==='/v6-test/__qa-v100-worker.js')fixture=oldWorker;
 else if(u.pathname==='/v6-test/__qa-boot.html'){fixture='<!doctype html><title>Untouched v100 migration fixture</title>';type='text/html';}
 else if(u.pathname==='/v6-test/week11-read-aloud-v4.js')fixture=upgraded?read('week12-read-aloud-v1.js'):oldReader;
 if(fixture!==undefined){res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fixture);return;}
 let file;try{file=path.resolve(root,'.'+decodeURIComponent(u.pathname.slice('/v6-test'.length)));}catch{res.writeHead(400).end();return;}
 if(!u.pathname.startsWith('/v6-test/')||!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(b);});
});
async function histories(browser,base){
 for(const standalone of [false,true]){
  const context=await browser.newContext({viewport:{width:1366,height:768},serviceWorkers:'block'});
  try{
   const page=await context.newPage(),clean=diagnostics(page),cap=capture(page,base,{},['week12-read-aloud-v1.js','week12-read-aloud-plan-v1.js']);
   for(const step of steps.filter(s=>s.stops.length||s.vocabulary)){
    const i=steps.indexOf(step);await navigate(page,()=>page.goto(route(base,standalone,i)));let f=await reader(page,i,0,standalone);const baseline=await page.evaluate(()=>history.length);
    for(let stop=1;stop<=step.stops.length;stop++){
     await f.locator('#next').click();await reader(page,i,stop,standalone);if(baseline+stop<50)assert.equal(await page.evaluate(()=>history.length),baseline+stop,'One semantic entry per stop');
     await navigate(page,()=>page.goBack());await reader(page,i,stop-1,standalone);await navigate(page,()=>page.goForward());await reader(page,i,stop,standalone);await navigate(page,()=>page.reload());f=await reader(page,i,stop,standalone);
    }
    const previous=step.vocabulary?steps.findIndex(s=>s.id===step.sourceStep):i-1;
    await f.locator('#prev').click();await reader(page,previous,0,standalone);await navigate(page,()=>page.goBack());await reader(page,i,step.stops.length,standalone);await navigate(page,()=>page.goForward());await reader(page,previous,0,standalone);await navigate(page,()=>page.reload());await reader(page,previous,0,standalone);
   }
   // Fresh contexts below own exact boundary history; this pass covers a
   // repeated lifecycle event without installing duplicate click handlers.
   await navigate(page,()=>page.goto(route(base,standalone)));let f=await reader(page,0,0,standalone);
   await page.evaluate(()=>{for(let n=0;n<5;n++){dispatchEvent(new Event('pageshow'));document.getElementById('frame')?.dispatchEvent(new Event('load'));}});
   await f.locator('#next').click();await reader(page,1,0,standalone);await navigate(page,()=>page.goBack());await reader(page,0,0,standalone);await navigate(page,()=>page.goForward());await reader(page,1,0,standalone);
   await cap.finish();clean();
  }finally{await context.close();}
  for(const [button,index]of [['prev',0],['backBtn',0],['backBtn',last],['next',last]]){
   const context=await browser.newContext({serviceWorkers:'block'});
   try{
    const page=await context.newPage(),clean=diagnostics(page),cap=capture(page,base,{},['week12-read-aloud-v1.js','week12-read-aloud-plan-v1.js']);
    await navigate(page,()=>page.goto(route(base,standalone,index,steps[index].stops.length)));const f=await reader(page,index,steps[index].stops.length,standalone),baseline=await page.evaluate(()=>history.length);
    await page.evaluate(()=>localStorage.setItem('eea-lesson-auto-resume','enabled'));
    await navigate(page,()=>f.evaluate(id=>{for(let n=0;n<5;n++)document.getElementById(id).click();},button));await overview(page);assert.equal(await page.evaluate(()=>history.length),baseline+1,'Repeated '+button+' exits once');
    await navigate(page,()=>page.goBack());await reader(page,index,steps[index].stops.length,standalone);await navigate(page,()=>page.goForward());await overview(page);await navigate(page,()=>page.reload());await overview(page);await cap.finish();clean();
   }finally{await context.close();}
  }
 }
 console.log('PASS: every stop/vocabulary Previous, native Back/Forward/reload, lifecycle idempotence and repeated completion/Close/first Previous');
}
async function malformed(browser,base){
 const context=await browser.newContext({serviceWorkers:'block'});
 try{
  const page=await context.newPage(),clean=diagnostics(page),cap=capture(page,base,{},['week12-read-aloud-v1.js','week12-read-aloud-plan-v1.js']);
  const firstStop=steps.findIndex(s=>s.stops.length);
  for(const standalone of [false,true]){
   for(const [rawStep,rawStop,index,stop]of [['bad','bad',0,0],['-1','-1',0,0],['1.5','0.5',0,0],['Infinity','NaN',0,0],['9999','9999',last,steps[last].stops.length],[String(firstStop),'999',firstStop,steps[firstStop].stops.length],[String(firstStop),'-1',firstStop,0]]){
    await navigate(page,()=>page.goto(route(base,standalone,rawStep,rawStop)+'&book=stale&center=stale&review=1'));await reader(page,index,stop,standalone);await navigate(page,()=>page.reload());await reader(page,index,stop,standalone);
   }
   const file=standalone?'week12-read-aloud.html':'lesson-runner-week12.html';
   for(const day of ['Monday','0']){await navigate(page,()=>page.goto(base+file+'?week=12&day='+day+'&section=0'));await reader(page,0,0,standalone);}
   for(const [day,expected]of [['Tuesday',1],['Wednesday',2],['Thursday',3],['Friday',4],['1',1],['2',2],['3',3],['4',4]]){await navigate(page,()=>page.goto(base+file+'?week=12&day='+day+'&section=0'));await overview(page,expected);assert.equal(await page.evaluate(()=>typeof EEASectionState),'undefined','No unavailable reader renders');}
   const today=await page.evaluate(()=>{const d=new Date().getDay();return d===0||d===6?4:d-1;});
   for(const q of ['', 'day=', 'day=bad','day=-1','day=1.5','day=Infinity','day=5','day=Monday%20']){await navigate(page,()=>page.goto(base+file+'?week=12&section=0&'+q));await overview(page,today);}
   for(const section of ['1','2','-1','bad','0.5','']){await navigate(page,()=>page.goto(base+file+'?week=12&day=Monday&section='+section));await overview(page);}
  }
  for(let day=1;day<5;day++){await navigate(page,()=>page.goto(base+'daily-lessons.html?week=12&day='+day));await overview(page,day);const url=page.url();await page.waitForTimeout(100);assert.equal(page.url(),url,'Unavailable overview has no unexpected auto redirect');}
  await cap.finish();clean();
 }finally{await context.close();}
 console.log('PASS: malformed deep links normalize, named/numeric unavailable and invalid days/sections reject, and future days stay unavailable');
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
  const page=await context.newPage();await page.goto(base+'__qa-boot.html');await page.evaluate(async()=>{await navigator.serviceWorker.register('./__qa-v100-worker.js',{scope:'./'});await navigator.serviceWorker.ready;});await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/__qa-v100-worker.js'),null,{timeout:180000});
  const clean=diagnostics(page);upgraded=true;
  for(const suffix of ['', '?week12-upgrade=1']){assert.equal(hash(await(await context.request.get(base+'week11-read-aloud-v4.js'+suffix)).body()),expected['week12-read-aloud-v1.js'],'Origin has new same-path bytes');assert.equal(await page.evaluate(async file=>(await fetch('./'+file,{cache:'no-store'})).text(),'week11-read-aloud-v4.js'+suffix),oldReader.toString(),'Untouched v100 ignoreSearch keeps old pathname stale despite query bust');}
  const verified={},cap=capture(page,base,verified);
  await navigate(page,()=>page.goto(base+'daily-lessons.html?week=12&day=0'));await overview(page);await page.locator('#start').click();
  for(let i=0;i<steps.length;i++){const f=await reader(page,i);await imageReady(f,steps[i]);for(let stop=1;stop<=steps[i].stops.length;stop++){await f.locator('#next').click();await reader(page,i,stop);}if(i<last)await f.locator('#next').click();}
  await screenshot(page,out,'exact-v100-new-week12-filenames');await navigate(page,()=>child(page).locator('#next').click());await overview(page);await cap.finish();
  assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL),base+'__qa-v100-worker.js');assert.equal(await page.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).length),1);assert.equal(await page.evaluate(async()=>(await(await caches.open('eea-companion-v100')).match('./week11-read-aloud-v4.js')).text()),oldReader.toString());
  upgraded=false;await navigate(page,()=>page.evaluate(async()=>navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'})));await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/sw.js'),null,{timeout:180000});await until(async()=>{const keys=await page.evaluate(()=>caches.keys());return keys.includes('eea-companion-v101')&&!keys.includes('eea-companion-v100');},'Real v101 activation retires v100',180000);
  const current=await context.newPage(),currentClean=diagnostics(current),fresh={},freshCap=capture(current,base,fresh);
  // Complete the standalone reader on its real newly activated worker, proving
  // every currently rendered image and script rather than only precache bytes.
  await navigate(current,()=>current.goto(route(base,true)));
  for(let i=0;i<steps.length;i++){const f=await reader(current,i,0,true);await imageReady(f,steps[i]);for(let stop=1;stop<=steps[i].stops.length;stop++){await f.locator('#next').click();await reader(current,i,stop,true);}if(i<last)await f.locator('#next').click();}
  await navigate(current,()=>current.locator('#next').click());await overview(current);await freshCap.finish();
  const cacheHashes={};for(const file of consumedFiles){await until(()=>current.evaluate(async file=>!!(await(await caches.open('eea-companion-v101')).match('./'+file)),file),'v101 cache '+file);const bytes=await current.evaluate(async file=>Array.from(new Uint8Array(await(await(await caches.open('eea-companion-v101')).match('./'+file)).arrayBuffer())),file);cacheHashes[file]=hash(Buffer.from(bytes));assert.equal(cacheHashes[file],expected[file]);}
  evidence.migration={oldWorkerSha256:hash(oldWorker),oldReaderSha256:hash(oldReader),verified,fresh,cacheHashes,queryBustStale:true,oldCachePreservedBeforeUpgrade:true,noManualReset:true};currentClean();clean();
 }finally{await context.close();upgraded=false;}
 console.log('PASS: exact v100 stale filename/query proof, fresh week12 reader under old worker, real v101 activation and exact current cache bytes without reset');
}
(async()=>{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const base=`http://127.0.0.1:${server.address().port}/v6-test/`;let browser;const evidence={platform:process.platform,appSource:root,commit:process.env.GITHUB_SHA||null,expected};
 try{browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,ignoreDefaultArgs:['--disable-back-forward-cache']});evidence.browser=await browser.version();for(const viewport of [{width:1920,height:1080},{width:1366,height:768}])await verifyViewport(browser,base,viewport,out,evidence);await histories(browser,base);await malformed(browser,base);await pendingImages(browser,base);await staleWorker(browser,base,evidence);if(out)fs.writeFileSync(path.join(out,'verification-manifest.json'),JSON.stringify(evidence,null,2));}
 finally{if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
