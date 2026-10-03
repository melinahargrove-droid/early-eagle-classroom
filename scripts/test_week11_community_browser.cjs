// Real local/prepared-Windows Chromium acceptance. Only this file uses the
// exact prior worker fixture, isolated cache experiment and held-image routes.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const {root,read,hash,days,asset,images,consumedFiles,viewports,until,captureBytes,navigate,diagnostics,route,overview,community,imageReady,nextSection,shot,verifyViewport,verifyHistory}=require('./test_week11_community_shared.cjs');
const out=process.env.WEEK11_COMMUNITY_SCREENSHOT_DIR;
const oldWorker=Buffer.from(fs.readFileSync(path.join(__dirname,'fixtures/week11-community-v100-sw.js'),'utf8').replace(/\r\n/g,'\n'));
assert.equal(hash(oldWorker),'da3b346cfe34d709be58cb3a9ea07fb98ba48b62d38cd53353d1dfc7ac467341','Exact untouched deployed v100 worker');
assert.match(oldWorker.toString(),/const CACHE='eea-companion-v100'/);
const oldScript=read('week11-centers-v5.js'),changedScript=Buffer.concat([Buffer.from('// Test-only origin update: old worker must retain old JS even with a query.\n'),oldScript]);
let changedOrigin=false;
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');let fixture,type='text/javascript';
 if(url.pathname==='/v6-test/__qa-v100-worker.js')fixture=oldWorker;
 else if(url.pathname==='/v6-test/__qa-boot.html'){fixture='<!doctype html><title>Exact v100 fixture bootstrap</title>';type='text/html';}
 else if(url.pathname==='/v6-test/__qa-network.html'){fixture='<!doctype html><title>'+(changedOrigin?'New network HTML':'Old cached HTML')+'</title>';type='text/html';}
 else if(url.pathname==='/v6-test/week11-centers-v5.js'&&changedOrigin)fixture=changedScript;
 if(fixture!==undefined){res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fixture);return;}
 let file;try{file=path.resolve(root,'.'+decodeURIComponent(url.pathname.slice('/v6-test'.length)));}catch{res.writeHead(400).end();return;}
 if(!url.pathname.startsWith('/v6-test/')||!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(error,bytes)=>{if(error){res.writeHead(404).end();return;}const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.md':'text/plain','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp'}[path.extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(bytes);});
});
async function pendingImages(browser,base){
 for(const standalone of [false,true])for(let day=0;day<5;day++)for(const id of ['prev','exit','done']){
  const context=await browser.newContext({viewport:viewports[1],serviceWorkers:'block'});let release,requested=false;const gate=new Promise(r=>{release=r;});
  try{await context.route('**/'+asset+'*.jpg',async r=>{if(r.request().resourceType()==='image')requested=true;await gate;await r.continue().catch(()=>{});});const page=await context.newPage(),clean=diagnostics(page);
   await page.goto(route(base,day,standalone),{waitUntil:'domcontentloaded'});const f=await community(page,day,standalone);await until(()=>requested,'Held original image requested');assert.equal(await f.locator('#practice-image').evaluate(e=>e.complete),false,'Boundary tested before source-image load');
   await f.locator('#'+id).click();if(id==='done'){const next=await nextSection(page,day);await next.locator(day<2?'#backBtn':'#exit').click();}await overview(page,day);assert.equal(page.frames().length,1);clean();
  }finally{release();await context.unrouteAll({behavior:'wait'});await context.close();}
 }
 console.log('PASS: all 30 cold-image boundaries, every weekday, runner and standalone; no nested overview');
}
async function staleWorker(browser,base){
 const context=await browser.newContext({viewport:viewports[1],serviceWorkers:'allow'});
 try{
  const page=await context.newPage();await page.goto(base+'__qa-boot.html');await page.evaluate(async()=>{await navigator.serviceWorker.register('./__qa-v100-worker.js',{scope:'./'});await navigator.serviceWorker.ready;});
  await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/__qa-v100-worker.js'),null,{timeout:180000});
  await page.goto(base+'__qa-network.html');assert.equal(await page.title(),'Old cached HTML');
  await until(()=>page.evaluate(async()=>!!await(await caches.open('eea-companion-v100')).match('./__qa-network.html')),'Old HTML actually cached');
  assert.equal(await page.evaluate(async()=>(await(await(await caches.open('eea-companion-v100')).match('./week11-centers-v5.js')).text())),oldScript.toString(),'Old deployed JS actually cached during install');
  changedOrigin=true;
  for(const query of ['','?week11-community-upgrade=1']){
   assert.equal(hash(await(await context.request.get(base+'week11-centers-v5.js'+query)).body()),hash(changedScript),'Origin returns changed same-path JS');
   assert.equal(await page.evaluate(async name=>(await fetch('./'+name,{cache:'no-store'})).text(),'week11-centers-v5.js'+query),oldScript.toString(),'Exact v100 cache-first ignoreSearch preserves old JS despite same-path/query change');
  }
  await page.reload();assert.equal(await page.title(),'New network HTML','Exact v100 HTML route is network-first, even with old cached HTML');
  const expected=Object.fromEntries(consumedFiles.map(file=>[file,hash(read(file))])),verified={},capture=captureBytes(page,base,expected,verified),clean=diagnostics(page);
  for(let day=0;day<5;day++){
   await navigate(page,()=>page.goto(base+'daily-lessons.html?week=11&day='+day));await overview(page,day);await navigate(page,()=>page.locator('#start').click());let f=await community(page,day);await imageReady(page,f,day%2?'square':'illustration');
   if(day%2===0){await f.locator('#chair').click();f=await community(page,day,false,'chair');await imageReady(page,f,'chair');await navigate(page,()=>page.reload());f=await community(page,day,false,'chair');}
   await shot(page,out,'exact-v100-'+days[day]+'-new-community-v1');await navigate(page,()=>f.locator('#done').click());f=await nextSection(page,day);await navigate(page,()=>f.locator(day<2?'#backBtn':'#exit').click());await overview(page,day);
  }
  await capture.finish();assert.deepEqual(verified,expected);assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL),base+'__qa-v100-worker.js');
  assert.equal(await page.evaluate(async()=>(await(await(await caches.open('eea-companion-v100')).match('./week11-centers-v5.js')).text())),oldScript.toString(),'Old cached runtime remains untouched');
  clean();if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'exact-v100-worker-verification.json'),JSON.stringify({oldWorkerSha256:hash(oldWorker),oldScriptSha256:hash(oldScript),originExperimentSha256:hash(changedScript),htmlNetworkFirst:true,jsCacheFirstIgnoreSearch:true,verified,controller:base+'__qa-v100-worker.js'},null,2));}
  changedOrigin=false;
  await page.evaluate(async()=>{await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});});
  await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/sw.js'),null,{timeout:180000});
  await until(async()=>{const names=await page.evaluate(()=>caches.keys());return names.includes('eea-companion-v103')&&!names.includes('eea-companion-v100');},'Real v103 activation retires v100 without manual reset',180000);
  const nextPage=await context.newPage(),upgradeVerified={},upgradeCapture=captureBytes(nextPage,base,expected,upgradeVerified),nextClean=diagnostics(nextPage);
  for(let day=0;day<5;day++){
   await navigate(nextPage,()=>nextPage.goto(base+'daily-lessons.html?week=11&day='+day));await overview(nextPage,day);await navigate(nextPage,()=>nextPage.locator('#start').click());let f=await community(nextPage,day);await imageReady(nextPage,f,day%2?'square':'illustration');if(day%2===0){await f.locator('#chair').click();f=await community(nextPage,day,false,'chair');await imageReady(nextPage,f,'chair');}
   await navigate(nextPage,()=>f.locator('#done').click());await nextSection(nextPage,day);
  }
  await upgradeCapture.finish();assert.deepEqual(upgradeVerified,expected);assert.equal(await nextPage.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).length),1);
  const cacheHashes={};for(const file of consumedFiles){await until(()=>nextPage.evaluate(async file=>!!await(await caches.open('eea-companion-v103')).match('./'+file,{ignoreSearch:true}),file),'v103 cached '+file);const bytes=await nextPage.evaluate(async file=>Array.from(new Uint8Array(await(await(await caches.open('eea-companion-v103')).match('./'+file,{ignoreSearch:true})).arrayBuffer())),file);cacheHashes[file]=hash(Buffer.from(bytes));assert.equal(cacheHashes[file],expected[file]);}
  await shot(nextPage,out,'v100-to-v103-no-reset');nextClean();
  if(out)fs.writeFileSync(path.join(out,'v100-to-v103-upgrade-verification.json'),JSON.stringify({oldWorkerSha256:hash(oldWorker),verified,upgradeVerified,cacheHashes,noUnregisterOrManualCacheReset:true,controller:base+'sw.js'},null,2));
  console.log('PASS: exact v100 HTML network-first / JS cache-first ignoreSearch, fresh versioned Community JS, and real v103 activation with exact cache bytes');
 }finally{changedOrigin=false;await context.close();}
}
(async()=>{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const base=`http://127.0.0.1:${server.address().port}/v6-test/`,expected=Object.fromEntries(consumedFiles.map(file=>[file,hash(read(file))])),browserRuntimeHashes={};let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,ignoreDefaultArgs:['--disable-back-forward-cache']});
  for(const viewport of viewports)await verifyViewport(browser,base,viewport,out,(page,suffix)=>{browserRuntimeHashes[suffix]={};return captureBytes(page,base,expected,browserRuntimeHashes[suffix]);});
  await verifyHistory(browser,base,viewports[1],out);await pendingImages(browser,base);await staleWorker(browser,base);
  if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'verification-environment.json'),JSON.stringify({platform:process.platform,browser:await browser.version(),commit:process.env.GITHUB_SHA||null,appSource:process.env.WEEK11_COMMUNITY_APP_ROOT?'prepared Windows desktop-app/app':'checked-out v6-test',expected,browserRuntimeHashes,viewports,oldWorkerSha256:hash(oldWorker)},null,2));}
 }finally{if(browser)await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
