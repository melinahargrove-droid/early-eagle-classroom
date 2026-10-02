// Local / prepared Windows Chromium. Synthetic old-SW and cold-image fixtures
// are confined here; actual Pages acceptance uses only the shared real flows.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
const {root,read,plan,runtimeFiles,consumedFiles,hash,until,diagnostics,route,overview,reader,centers,captureRuntimeBytes,verifyViewport}=require('./test_week11_centers_monday_shared.cjs');
const out=process.env.WEEK11_MONDAY_SCREENSHOT_DIR;
const gitRead=file=>execFileSync('git',['show','HEAD:v6-test/'+file],{cwd:path.resolve(__dirname,'..')});
const oldWorker=Buffer.from(fs.readFileSync(path.join(__dirname,'fixtures/week11-centers-monday-v95-sw.js'),'utf8').replace(/\r\n/g,'\n')),oldReader=gitRead('week11-read-aloud-v2.js');
assert.equal(hash(oldWorker),'421ff378c7b90019da27767f190523e76894550bd5de10bae000c1386b07ac20','Exact untouched v95 worker fixture');
assert.equal(hash(oldReader),'67e65ce0720ccc0515652c53cad12de475fb29dc2d793e71011ae2f31bdda675','Exact untouched pre-Centers reader');
assert.match(oldWorker.toString(),/const CACHE='eea-companion-v95'/);
let upgraded=false;
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');let fixture,type='text/javascript';
 if(url.pathname==='/v6-test/__qa-v95-worker.js')fixture=oldWorker;
 else if(url.pathname==='/v6-test/week11-read-aloud-v2.js')fixture=upgraded?read('week11-read-aloud-v4.js'):oldReader;
 else if(url.pathname==='/v6-test/__qa-boot.html'){fixture='<!doctype html><title>Exact prior worker fixture</title>';type='text/html';}
 else if(url.pathname==='/v6-test/__qa-old-reader.html'){fixture=read('week11-read-aloud.html').toString().replace('week11-read-aloud-v4.js','week11-read-aloud-v2.js'+(url.searchParams.has('bust')?'?monday-upgrade=1':''));type='text/html';}
 if(fixture!==undefined){res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fixture);return;}
 let file;try{file=path.resolve(root,'.'+decodeURIComponent(url.pathname.slice('/v6-test'.length)));}catch{res.writeHead(400).end();return;}
 if(!url.pathname.startsWith('/v6-test/')||!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(error,bytes)=>{if(error){res.writeHead(404).end();return;}const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp'}[path.extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(bytes);});
});
async function staleWorker(browser,base){
 const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'allow'});
 try{const page=await context.newPage();await page.goto(base+'__qa-boot.html');await page.evaluate(async()=>{await navigator.serviceWorker.register('./__qa-v95-worker.js',{scope:'./'});await navigator.serviceWorker.ready;});await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/__qa-v95-worker.js'),null,{timeout:120000});upgraded=true;
 const clean=diagnostics(page);
 for(const query of ['', '?monday-upgrade=1']){assert.equal(hash(await(await context.request.get(base+'week11-read-aloud-v2.js'+query)).body()),hash(read('week11-read-aloud-v4.js')),'Origin is upgraded');assert.equal(await page.evaluate(async q=>(await fetch('./week11-read-aloud-v2.js'+q,{cache:'no-store'})).text(),query),oldReader.toString(),'Untouched v95 ignoreSearch keeps stale v2 with and without query');await page.goto(base+'__qa-old-reader.html?day=Monday&step=23'+(query?'&bust=1':''));await page.waitForFunction(()=>typeof EEASectionState==='function'&&EEASectionState().atEnd);assert.equal(await page.locator('#next').textContent(),'Finish Read Aloud →');await page.locator('#next').click();await overview(page);}
 const expected=Object.fromEntries(consumedFiles.map(f=>[f,hash(read(f))])),verified={},captures=captureRuntimeBytes(page,base,expected,verified);
 await page.goto(base+'lesson-runner-week11.html?week=11&day=0&section=0&step=23');let f=await reader(page,23);await captures.verify('week11-read-aloud-v4.js');await f.locator('#next').click();f=await centers(page);await captures.verify('week11-centers-v3.js');await captures.verify('week11-centers-monday-plan-v1.js');await captures.verify(plan[0].img);await f.locator('#done').click();await centers(page,1);await captures.verify(plan[1].img);await page.reload();f=await centers(page,1);if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'week11-monday-exact-v95-fresh-paths.png'),fullPage:true});}await captures.verify(plan[1].img);await f.locator('#done').click();await overview(page);await captures.finish();
 assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL),base+'__qa-v95-worker.js');assert.equal(await page.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).length),1);assert.equal(await page.evaluate(async()=>(await(await caches.open('eea-companion-v95')).match('./week11-read-aloud-v2.js')).text()),oldReader.toString(),'Old cache never cleared or overwritten');clean();console.log('PASS: exact untouched v95 worker, stale same-path/query, fresh v3 and Centers with no cache reset');
 }finally{await context.close();upgraded=false;}
}
async function pendingImages(browser,base){for(const standalone of [false,true])for(const [button,step] of [['prev',0],['exit',0],['exit',1],['done',1]]){
 const context=await browser.newContext({serviceWorkers:'block'});let release,requested=false;const gate=new Promise(r=>release=r);
 try{await context.route('**/'+plan[step].img,async r=>{if(r.request().resourceType()==='image')requested=true;await gate;await r.continue().catch(()=>{});});const page=await context.newPage();await page.goto(route(base,standalone,step),{waitUntil:'domcontentloaded'});let f=await centers(page,step,standalone);await until(()=>requested,'Held cold image request');assert.equal(await f.locator('.lesson-img').evaluate(e=>e.complete),false);await f.locator('#'+button).click();if(button==='prev')await reader(page);else await overview(page);
 }finally{release();await context.unrouteAll({behavior:'wait'});await context.close();}
}console.log('PASS: embedded and standalone Previous/X/Finish work before cold images load');}
(async()=>{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const base=`http://127.0.0.1:${server.address().port}/v6-test/`;let browser;const expected=Object.fromEntries(consumedFiles.map(f=>[f,hash(read(f))])),browserRuntimeHashes={};try{browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,ignoreDefaultArgs:['--disable-back-forward-cache']});for(const viewport of [{width:1280,height:800},{width:1180,height:757}])await verifyViewport(browser,base,viewport,out,(page,suffix)=>{browserRuntimeHashes[suffix]={};return captureRuntimeBytes(page,base,expected,browserRuntimeHashes[suffix]);});await staleWorker(browser,base);await pendingImages(browser,base);if(out)fs.writeFileSync(path.join(out,'verification-environment.json'),JSON.stringify({platform:process.platform,browser:await browser.version(),commit:process.env.GITHUB_SHA||null,appSource:process.env.WEEK11_MONDAY_APP_ROOT?'prepared Windows desktop-app/app':'checked-out v6-test',expected,browserRuntimeHashes,viewports:['1280x800','1180x757'],oldWorkerSha256:hash(oldWorker)},null,2));}finally{if(browser)await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
