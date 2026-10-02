// Local and prepared Windows Chromium. Only this entry point uses the isolated
// exact v99 worker fixture and held-image routes; live acceptance stays real.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const {chromium} = require('playwright');
const {execFileSync} = require('node:child_process');
const {root,read,plan,consumedFiles,hash,until,diagnostics,route,overview,centers,imageReady,captureRuntimeBytes,navigate,verifyViewport} = require('./test_week11_centers_friday_shared.cjs');
const out = process.env.WEEK11_FRIDAY_SCREENSHOT_DIR;
// The saved old worker is normalized only for checkout line endings. The
// fixture's deployed Git bytes and unchanged v4 are pinned independently.
const oldWorker = Buffer.from(fs.readFileSync(path.join(__dirname,'fixtures/week11-centers-friday-v99-sw.js'),'utf8').replace(/\r\n/g,'\n'));
const oldCenters = execFileSync('git',['show','HEAD:v6-test/week11-centers-v4.js'],{cwd:path.resolve(__dirname,'..')});
assert.equal(hash(oldWorker),'45c44446add39d17867d762f27c7644eaeaad4a9b059b66f99b973c00fcc1d0c','Exact untouched deployed v99 worker fixture');
assert.equal(hash(oldCenters),'d1b2ef636a3a6acc0cdb80abbd593e12283c7a51a01abe0ac6be3414f2760793','Exact untouched pre-Friday v4');
assert.match(oldWorker.toString(),/const CACHE='eea-companion-v99'/);
let upgraded = false;
const server = http.createServer((req,res) => {
 const url = new URL(req.url,'http://localhost');let fixture,type = 'text/javascript';
 if (url.pathname === '/v6-test/__qa-v99-worker.js') fixture = oldWorker;
 else if (url.pathname === '/v6-test/week11-centers-v4.js') fixture = upgraded ? read('week11-centers-v5.js') : oldCenters;
 else if (url.pathname === '/v6-test/__qa-boot.html') {fixture = '<!doctype html><title>Exact prior worker fixture</title>';type = 'text/html';}
 else if (url.pathname === '/v6-test/__qa-old-centers.html') {fixture = read('week11-centers.html').toString().replace('week11-centers-v5.js','week11-centers-v4.js' + (url.searchParams.has('bust') ? '?friday-upgrade=1' : ''));type = 'text/html';}
 if (fixture !== undefined) {res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fixture);return;}
 let file;try {file = path.resolve(root,'.' + decodeURIComponent(url.pathname.slice('/v6-test'.length)));} catch {res.writeHead(400).end();return;}
 if (!url.pathname.startsWith('/v6-test/') || !file.startsWith(root + path.sep)) {res.writeHead(403).end();return;}
 fs.readFile(file,(error,bytes) => {if (error) {res.writeHead(404).end();return;}const mime = {'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp'}[path.extname(file)] || 'application/octet-stream';res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(bytes);});
});
async function staleWorker(browser,base) {
 const context = await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'allow'});
 try {
  const page = await context.newPage();await page.goto(base + '__qa-boot.html');
  await page.evaluate(async () => {await navigator.serviceWorker.register('./__qa-v99-worker.js',{scope:'./'});await navigator.serviceWorker.ready;});
  await page.waitForFunction(() => navigator.serviceWorker.controller?.scriptURL.endsWith('/__qa-v99-worker.js'),null,{timeout:120000});
  upgraded = true;const clean = diagnostics(page);
  for (const query of ['', '?friday-upgrade=1']) {
   assert.equal(hash(await (await context.request.get(base + 'week11-centers-v4.js' + query)).body()),hash(read('week11-centers-v5.js')),'Origin same-path v4 has upgraded bytes');
   assert.equal(await page.evaluate(async file => (await fetch('./' + file,{cache:'no-store'})).text(),'week11-centers-v4.js' + query),oldCenters.toString(),'Untouched v99 ignoreSearch retains stale v4 bytes, including query bust');
  }
  for (const bust of ['', '&bust=1']) {await page.goto(base + '__qa-old-centers.html?week=11&day=Friday&section=1' + bust);await overview(page);}
  const expected = Object.fromEntries(consumedFiles.map(file => [file,hash(read(file))])), verified = {}, captures = captureRuntimeBytes(page,base,expected,verified);
  for (const standalone of [false,true]) {
   await navigate(page,()=>page.goto(route(base,standalone)));let f=await centers(page,0,standalone);await imageReady(f,plan[0]);
   await f.locator('#review-original').click();f=await centers(page,0,standalone,true);assert.equal(await f.locator('.community-copy h2').textContent(),plan[0].originalTitle);
   await navigate(page,()=>f.locator('#done').click());f=await centers(page,1,standalone);await imageReady(f,plan[1]);await f.locator('#review-original').click();f=await centers(page,1,standalone,true);
   await navigate(page,()=>page.reload());f=await centers(page,1,standalone,true);assert.equal(await f.locator('.lead').textContent(),plan[1].originalLead);
   if (out) {fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'week11-friday-exact-v99-fresh-v5-' + (standalone ? 'standalone' : 'embedded') + '.png'),fullPage:true});}
   await navigate(page,()=>f.locator('#done').click());await overview(page);
  }
  await captures.finish();assert.deepEqual(verified,expected);
  assert.equal(await page.evaluate(() => navigator.serviceWorker.controller.scriptURL),base + '__qa-v99-worker.js');
  assert.equal(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length),1);
  assert.equal(await page.evaluate(async () => (await (await caches.open('eea-companion-v99')).match('./week11-centers-v4.js')).text()),oldCenters.toString(),'Prior v4 cache remains untouched');
  if (out) fs.writeFileSync(path.join(out,'exact-v99-worker-verification.json'),JSON.stringify({oldWorkerSha256:hash(oldWorker),oldCentersSha256:hash(oldCenters),verified,controller:base + '__qa-v99-worker.js',queryBustStale:true,priorCacheUntouched:true},null,2));
  // Now install the real production worker at its normal URL. Keep its
  // original v4 resource unchanged; only the preceding stale-path experiment
  // substituted origin bytes. No unregister, cache clearing or browser reset.
  upgraded=false;
  await navigate(page,()=>page.evaluate(async()=>{await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});}));
  await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/sw.js'),null,{timeout:180000});
  await until(async()=>{const keys=await page.evaluate(()=>caches.keys());return keys.includes('eea-companion-v100')&&!keys.includes('eea-companion-v99');},'Production v100 activation replaces v99 cache',180000);
  const upgradedPage=await context.newPage(),upgradedClean=diagnostics(upgradedPage),upgradeVerified={},upgradeCapture=captureRuntimeBytes(upgradedPage,base,expected,upgradeVerified);
  await navigate(upgradedPage,()=>upgradedPage.goto(route(base,false,0,true)));let f=await centers(upgradedPage,0,false,true);await imageReady(f,plan[0]);
  await navigate(upgradedPage,()=>f.locator('#done').click());f=await centers(upgradedPage,1,false);await imageReady(f,plan[1]);
  await f.locator('#review-original').click();await centers(upgradedPage,1,false,true);await navigate(upgradedPage,()=>upgradedPage.reload());f=await centers(upgradedPage,1,false,true);
  await navigate(upgradedPage,()=>f.locator('#done').click());await overview(upgradedPage);await upgradeCapture.finish();assert.deepEqual(upgradeVerified,expected);
  assert.equal(await upgradedPage.evaluate(()=>navigator.serviceWorker.controller.scriptURL),base+'sw.js');
  assert.equal(await upgradedPage.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).length),1);
  const cacheHashes={};
  for(const file of consumedFiles){
   await until(()=>upgradedPage.evaluate(async file=>!!(await(await caches.open('eea-companion-v100')).match('./'+file)),file),'v100 cached '+file);
   const body=await upgradedPage.evaluate(async file=>Array.from(new Uint8Array(await(await(await caches.open('eea-companion-v100')).match('./'+file)).arrayBuffer())),file);
   cacheHashes[file]=hash(Buffer.from(body));assert.equal(cacheHashes[file],expected[file],'v100 caches exact '+file);
  }
  if(out)fs.writeFileSync(path.join(out,'v99-to-v100-upgrade-verification.json'),JSON.stringify({oldWorkerSha256:hash(oldWorker),oldCentersSha256:hash(oldCenters),verified,upgradeVerified,cacheHashes,controller:base+'sw.js',noManualCacheReset:true},null,2));
  upgradedClean();clean();console.log('PASS: untouched v99 worker, stale v4 same-path/query, fresh Friday v5 and review, real v100 upgrade and exact cache bytes without reset');
 } finally {await context.close();upgraded = false;}
}
async function pendingImages(browser,base) {
 for (const standalone of [false,true]) for (const review of [false,true]) for (const [button,step] of [['prev',0],['exit',0],['exit',1],['done',1]]) {
  const context = await browser.newContext({serviceWorkers:'block'});let release,requested = false;const gate = new Promise(r => {release = r;});
  try {
   await context.route('**/' + plan[step].img,async route => {if (route.request().resourceType() === 'image') requested = true;await gate;await route.continue().catch(() => {});});
   const page = await context.newPage();await page.goto(route(base,standalone,step,review),{waitUntil:'domcontentloaded'});const f = await centers(page,step,standalone,review);
   await until(() => requested,'Held cold image request');assert.equal(await f.locator('.lesson-img').evaluate(e => e.complete),false);
   await f.locator('#' + button).click();await overview(page);
  } finally {release();await context.unrouteAll({behavior:'wait'});await context.close();}
 }
 console.log('PASS: embedded and standalone Friday Previous/X/Finish exit before cold images load in brief and original modes');
}
(async () => {
 await new Promise((resolve,reject) => {server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const base = `http://127.0.0.1:${server.address().port}/v6-test/`, expected = Object.fromEntries(consumedFiles.map(file => [file,hash(read(file))])), browserRuntimeHashes = {};let browser;
 try {
  browser = await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,ignoreDefaultArgs:['--disable-back-forward-cache']});
  for (const viewport of [{width:1280,height:800},{width:1180,height:757}]) await verifyViewport(browser,base,viewport,out,(page,suffix) => {browserRuntimeHashes[suffix] = {};return captureRuntimeBytes(page,base,expected,browserRuntimeHashes[suffix]);});
  await staleWorker(browser,base);await pendingImages(browser,base);
  if (out) fs.writeFileSync(path.join(out,'verification-environment.json'),JSON.stringify({platform:process.platform,browser:await browser.version(),commit:process.env.GITHUB_SHA || null,appSource:process.env.WEEK11_FRIDAY_APP_ROOT ? 'prepared Windows desktop-app/app' : 'checked-out v6-test',expected,browserRuntimeHashes,viewports:['1280x800','1180x757'],oldWorkerSha256:hash(oldWorker)},null,2));
 } finally {if (browser) await browser.close();}
})().catch(error => {console.error(error);process.exitCode = 1;}).finally(() => server.close());
