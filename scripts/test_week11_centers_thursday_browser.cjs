// Local and prepared Windows Chromium. Only this entry point uses the isolated
// exact v98 worker fixture and held-image routes; live acceptance stays real.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const {chromium} = require('playwright');
const {execFileSync} = require('node:child_process');
const {root,read,plan,consumedFiles,hash,until,diagnostics,route,overview,centers,imageReady,captureRuntimeBytes,verifyViewport} = require('./test_week11_centers_thursday_shared.cjs');
const out = process.env.WEEK11_THURSDAY_SCREENSHOT_DIR;
// The saved old worker is normalized only for checkout line endings. The
// fixture's deployed Git bytes and unchanged v3 are pinned independently.
const oldWorker = Buffer.from(fs.readFileSync(path.join(__dirname,'fixtures/week11-centers-thursday-v98-sw.js'),'utf8').replace(/\r\n/g,'\n'));
const oldCenters = execFileSync('git',['show','HEAD:v6-test/week11-centers-v3.js'],{cwd:path.resolve(__dirname,'..')});
assert.equal(hash(oldWorker),'a9ce876cdb87b5a3b3e00a28e5453eb489023a4814ca024d150c8bf610409597','Exact untouched deployed v98 worker fixture');
assert.equal(hash(oldCenters),'ebc5df2b895f09fabbf5bbed09036faded0bac61d03f073f09544f48870ec9b1','Exact untouched pre-Thursday v3');
assert.match(oldWorker.toString(),/const CACHE='eea-companion-v98'/);
let upgraded = false;
const server = http.createServer((req,res) => {
 const url = new URL(req.url,'http://localhost');let fixture,type = 'text/javascript';
 if (url.pathname === '/v6-test/__qa-v98-worker.js') fixture = oldWorker;
 else if (url.pathname === '/v6-test/week11-centers-v3.js') fixture = upgraded ? read('week11-centers-v5.js') : oldCenters;
 else if (url.pathname === '/v6-test/__qa-boot.html') {fixture = '<!doctype html><title>Exact prior worker fixture</title>';type = 'text/html';}
 else if (url.pathname === '/v6-test/__qa-old-centers.html') {fixture = read('week11-centers.html').toString().replace('week11-centers-v5.js','week11-centers-v3.js' + (url.searchParams.has('bust') ? '?thursday-upgrade=1' : ''));type = 'text/html';}
 if (fixture !== undefined) {res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fixture);return;}
 let file;try {file = path.resolve(root,'.' + decodeURIComponent(url.pathname.slice('/v6-test'.length)));} catch {res.writeHead(400).end();return;}
 if (!url.pathname.startsWith('/v6-test/') || !file.startsWith(root + path.sep)) {res.writeHead(403).end();return;}
 fs.readFile(file,(error,bytes) => {if (error) {res.writeHead(404).end();return;}const mime = {'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp'}[path.extname(file)] || 'application/octet-stream';res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(bytes);});
});
async function staleWorker(browser,base) {
 const context = await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'allow'});
 try {
  const page = await context.newPage();await page.goto(base + '__qa-boot.html');
  await page.evaluate(async () => {await navigator.serviceWorker.register('./__qa-v98-worker.js',{scope:'./'});await navigator.serviceWorker.ready;});
  await page.waitForFunction(() => navigator.serviceWorker.controller?.scriptURL.endsWith('/__qa-v98-worker.js'),null,{timeout:120000});
  upgraded = true;const clean = diagnostics(page);
  for (const query of ['', '?thursday-upgrade=1']) {
   assert.equal(hash(await (await context.request.get(base + 'week11-centers-v3.js' + query)).body()),hash(read('week11-centers-v5.js')),'Origin same-path v3 has upgraded bytes');
   assert.equal(await page.evaluate(async file => (await fetch('./' + file,{cache:'no-store'})).text(),'week11-centers-v3.js' + query),oldCenters.toString(),'Untouched v98 ignoreSearch retains stale v3 bytes, including query bust');
  }
  for (const bust of ['', '&bust=1']) {await page.goto(base + '__qa-old-centers.html?week=11&day=Thursday&section=1' + bust);await overview(page);}
  const expected = Object.fromEntries(consumedFiles.map(file => [file,hash(read(file))])), verified = {}, captures = captureRuntimeBytes(page,base,expected,verified);
  for (const standalone of [false,true]) {
   await page.goto(route(base,standalone));let f = await centers(page,0,standalone);await imageReady(f,plan[0]);
   await f.locator('#done').click();f = await centers(page,1,standalone);await imageReady(f,plan[1]);await page.reload();f = await centers(page,1,standalone);
   if (out) {fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'week11-thursday-exact-v98-fresh-v5-' + (standalone ? 'standalone' : 'embedded') + '.png'),fullPage:true});}
   await f.locator('#done').click();await overview(page);
  }
  await captures.finish();assert.deepEqual(verified,expected);
  assert.equal(await page.evaluate(() => navigator.serviceWorker.controller.scriptURL),base + '__qa-v98-worker.js');
  assert.equal(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length),1);
  assert.equal(await page.evaluate(async () => (await (await caches.open('eea-companion-v98')).match('./week11-centers-v3.js')).text()),oldCenters.toString(),'Prior v3 cache remains untouched');
  if (out) fs.writeFileSync(path.join(out,'exact-v98-worker-verification.json'),JSON.stringify({oldWorkerSha256:hash(oldWorker),oldCentersSha256:hash(oldCenters),verified,controller:base + '__qa-v98-worker.js',queryBustStale:true,priorCacheUntouched:true},null,2));
  clean();console.log('PASS: untouched v98 worker, stale v3 same-path/query, fresh Thursday v5 and plan with no cache reset');
 } finally {await context.close();upgraded = false;}
}
async function pendingImages(browser,base) {
 for (const standalone of [false,true]) for (const [button,step] of [['prev',0],['exit',0],['exit',1],['done',1]]) {
  const context = await browser.newContext({serviceWorkers:'block'});let release,requested = false;const gate = new Promise(r => {release = r;});
  try {
   await context.route('**/' + plan[step].img,async route => {if (route.request().resourceType() === 'image') requested = true;await gate;await route.continue().catch(() => {});});
   const page = await context.newPage();await page.goto(route(base,standalone,step),{waitUntil:'domcontentloaded'});const f = await centers(page,step,standalone);
   await until(() => requested,'Held cold image request');assert.equal(await f.locator('.lesson-img').evaluate(e => e.complete),false);
   await f.locator('#' + button).click();await overview(page);
  } finally {release();await context.unrouteAll({behavior:'wait'});await context.close();}
 }
 console.log('PASS: embedded and standalone Thursday Previous/X/Finish exit before cold images load');
}
(async () => {
 await new Promise((resolve,reject) => {server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const base = `http://127.0.0.1:${server.address().port}/v6-test/`, expected = Object.fromEntries(consumedFiles.map(file => [file,hash(read(file))])), browserRuntimeHashes = {};let browser;
 try {
  browser = await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,ignoreDefaultArgs:['--disable-back-forward-cache']});
  for (const viewport of [{width:1280,height:800},{width:1180,height:757}]) await verifyViewport(browser,base,viewport,out,(page,suffix) => {browserRuntimeHashes[suffix] = {};return captureRuntimeBytes(page,base,expected,browserRuntimeHashes[suffix]);});
  await staleWorker(browser,base);await pendingImages(browser,base);
  if (out) fs.writeFileSync(path.join(out,'verification-environment.json'),JSON.stringify({platform:process.platform,browser:await browser.version(),commit:process.env.GITHUB_SHA || null,appSource:process.env.WEEK11_THURSDAY_APP_ROOT ? 'prepared Windows desktop-app/app' : 'checked-out v6-test',expected,browserRuntimeHashes,viewports:['1280x800','1180x757'],oldWorkerSha256:hash(oldWorker)},null,2));
 } finally {if (browser) await browser.close();}
})().catch(error => {console.error(error);process.exitCode = 1;}).finally(() => server.close());
