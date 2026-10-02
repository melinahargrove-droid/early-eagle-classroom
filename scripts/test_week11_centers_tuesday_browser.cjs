// Local / prepared Windows Chromium. Synthetic old-SW and cold-image fixtures
// are confined here; actual Pages acceptance uses only the shared real flows.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const {execFileSync}=require('node:child_process');
const {root,read,plan,runtimeFiles,consumedFiles,readerConsumedFiles,hash,until,diagnostics,route,overview,reader,centers,captureRuntimeBytes,verifyViewport}=require('./test_week11_centers_tuesday_shared.cjs');
const out=process.env.WEEK11_TUESDAY_SCREENSHOT_DIR;
const oldWorker=Buffer.from(fs.readFileSync(path.join(__dirname,'fixtures/week11-centers-tuesday-v96-sw.js'),'utf8').replace(/\r\n/g,'\n'));
// Prior cache fixtures must be the exact deployed git bytes. Windows packaging
// rewrites text files with Set-Content (CRLF plus a final newline); read() below
// intentionally keeps using that prepared app for every fresh/consumed hash.
const gitRead=file=>execFileSync('git',['show','HEAD:v6-test/'+file],{cwd:path.resolve(__dirname,'..')});
const oldReader=gitRead('week11-read-aloud-v3.js'),oldCenters=gitRead('week11-centers-v1.js');
assert.equal(hash(oldWorker),'632e8b8250becd9e3dae84d5e20640a61664234c36696787a3b82dd3d00aa8c6','Exact untouched v96 worker fixture');
assert.equal(hash(oldReader),'0175f514a87b2b6449a2641e81e06af1b60a3b0234ac66e21abfd714094cc438','Exact untouched pre-Tuesday reader');
assert.equal(hash(oldCenters),'250bf906961ededfc5b8405da305b972f9a8c5c1bf3c10541fd702e08c6890fe','Exact untouched pre-Tuesday Centers');
assert.match(oldWorker.toString(),/const CACHE='eea-companion-v96'/);
let upgraded=false;
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');let fixture,type='text/javascript';
 if(url.pathname==='/v6-test/__qa-v96-worker.js')fixture=oldWorker;
 else if(url.pathname==='/v6-test/week11-read-aloud-v3.js')fixture=upgraded?read('week11-read-aloud-v4.js'):oldReader;
 else if(url.pathname==='/v6-test/week11-centers-v1.js')fixture=upgraded?read('week11-centers-v3.js'):oldCenters;
 else if(url.pathname==='/v6-test/__qa-boot.html'){fixture='<!doctype html><title>Exact prior worker fixture</title>';type='text/html';}
 else if(url.pathname==='/v6-test/__qa-old-reader.html'){fixture=read('week11-read-aloud.html').toString().replace('week11-read-aloud-v4.js','week11-read-aloud-v3.js'+(url.searchParams.has('bust')?'?tuesday-upgrade=1':''));type='text/html';}
 else if(url.pathname==='/v6-test/__qa-old-centers.html'){fixture=read('week11-centers.html').toString().replace('week11-centers-v3.js','week11-centers-v1.js'+(url.searchParams.has('bust')?'?tuesday-upgrade=1':''));type='text/html';}
 if(fixture!==undefined){res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fixture);return;}
 let file;try{file=path.resolve(root,'.'+decodeURIComponent(url.pathname.slice('/v6-test'.length)));}catch{res.writeHead(400).end();return;}
 if(!url.pathname.startsWith('/v6-test/')||!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(error,bytes)=>{if(error){res.writeHead(404).end();return;}const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp'}[path.extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(bytes);});
});
async function staleWorker(browser,base){
 const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'allow'});
 try{
  const page=await context.newPage();await page.goto(base+'__qa-boot.html');
  await page.evaluate(async()=>{await navigator.serviceWorker.register('./__qa-v96-worker.js',{scope:'./'});await navigator.serviceWorker.ready;});
  await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/__qa-v96-worker.js'),null,{timeout:120000});
  upgraded=true;const clean=diagnostics(page);
  for(const [file,old,fresh] of [['week11-read-aloud-v3.js',oldReader,'week11-read-aloud-v4.js'],['week11-centers-v1.js',oldCenters,'week11-centers-v3.js']]){
   for(const query of ['', '?tuesday-upgrade=1']){
    assert.equal(hash(await(await context.request.get(base+file+query)).body()),hash(read(fresh)),'Origin is upgraded for '+file);
    assert.equal(await page.evaluate(async p=>(await fetch('./'+p,{cache:'no-store'})).text(),file+query),old.toString(),'Untouched v96 ignoreSearch retains stale same-path bytes, even with a query');
   }
  }
  for(const bust of ['', '&bust=1']){
   await page.goto(base+'__qa-old-reader.html?day=Tuesday&step=18'+bust);await page.waitForFunction(()=>typeof EEASectionState==='function'&&EEASectionState().atEnd);
   assert.equal(await page.locator('#next').textContent(),'Finish Read Aloud →');await page.locator('#next').click();await overview(page);
   await page.goto(base+'__qa-old-centers.html?week=11&day=Tuesday&section=1'+bust);await overview(page);
  }
  const expected=Object.fromEntries(consumedFiles.map(f=>[f,hash(read(f))])),verified={},captures=captureRuntimeBytes(page,base,expected,verified);
  await page.goto(base+'lesson-runner-week11.html?week=11&day=1&section=0&step=18');let f=await reader(page,18);await captures.verify('week11-read-aloud-v4.js');
  await f.locator('#next').click();f=await centers(page);await captures.verify('week11-centers-v3.js');await captures.verify('week11-centers-tuesday-plan-v1.js');await captures.verify(plan[0].img);
  await f.locator('#done').click();await centers(page,1);await captures.verify(plan[1].img);await page.reload();f=await centers(page,1);
  if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'week11-tuesday-exact-v96-fresh-paths.png'),fullPage:true});}
  await f.locator('#done').click();await overview(page);await captures.finish();
  assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL),base+'__qa-v96-worker.js');
  assert.equal(await page.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).length),1);
  for(const [file,bytes] of [['week11-read-aloud-v3.js',oldReader],['week11-centers-v1.js',oldCenters]])assert.equal(await page.evaluate(async file=>(await(await caches.open('eea-companion-v96')).match('./'+file)).text(),file),bytes.toString(),'Prior cache entry never cleared or overwritten: '+file);
  clean();console.log('PASS: exact untouched v96 worker, stale reader/centers same-path/query, fresh v4/v2 with no cache reset');
 }finally{await context.close();upgraded=false;}
}
async function pendingImages(browser,base){for(const standalone of [false,true])for(const [button,step] of [['prev',0],['exit',0],['exit',1],['done',1]]){
 const context=await browser.newContext({serviceWorkers:'block'});let release,requested=false;const gate=new Promise(r=>release=r);
 try{await context.route('**/'+plan[step].img,async r=>{if(r.request().resourceType()==='image')requested=true;await gate;await r.continue().catch(()=>{});});const page=await context.newPage();await page.goto(route(base,standalone,step),{waitUntil:'domcontentloaded'});let f=await centers(page,step,standalone);await until(()=>requested,'Held cold image request');assert.equal(await f.locator('.lesson-img').evaluate(e=>e.complete),false);await f.locator('#'+button).click();if(button==='prev')await reader(page);else await overview(page);
 }finally{release();await context.unrouteAll({behavior:'wait'});await context.close();}
}console.log('PASS: embedded and standalone Previous/X/Finish work before cold images load');}
(async()=>{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const base=`http://127.0.0.1:${server.address().port}/v6-test/`;let browser;const expected=Object.fromEntries(readerConsumedFiles.map(f=>[f,hash(read(f))])),browserRuntimeHashes={};try{browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,ignoreDefaultArgs:['--disable-back-forward-cache']});for(const viewport of [{width:1280,height:800},{width:1180,height:757}])await verifyViewport(browser,base,viewport,out,(page,suffix,files=consumedFiles)=>{browserRuntimeHashes[suffix]={};return captureRuntimeBytes(page,base,expected,browserRuntimeHashes[suffix],files);});await staleWorker(browser,base);await pendingImages(browser,base);if(out)fs.writeFileSync(path.join(out,'verification-environment.json'),JSON.stringify({platform:process.platform,browser:await browser.version(),commit:process.env.GITHUB_SHA||null,appSource:process.env.WEEK11_TUESDAY_APP_ROOT?'prepared Windows desktop-app/app':'checked-out v6-test',expected,browserRuntimeHashes,viewports:['1280x800','1180x757'],oldWorkerSha256:hash(oldWorker)},null,2));}finally{if(browser)await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
