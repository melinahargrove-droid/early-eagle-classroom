// Real Chromium regression for the bounded Thursday Unit 2 Week 2 Centers chunk.
// Requires Playwright. Optional WEEK10_CENTERS_THURSDAY_SCREENSHOT_DIR saves both classroom sizes.
// All data and service-worker fixtures are local, synthetic QA; no student data is used.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const {chromium} = require('playwright');
const {target} = require('./test_week10_centers_thursday_target.cjs');
const root = path.resolve(__dirname, '..');
const screenshotDir = process.env.WEEK10_CENTERS_THURSDAY_SCREENSHOT_DIR;
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const titles = ['Class Soup'];
const plan = JSON.parse(fs.readFileSync(path.join(root, 'v6-test/week10-centers-thursday-plan.json'), 'utf8'));
const tuesdayPlan = JSON.parse(fs.readFileSync(path.join(root, 'v6-test/week10-centers-tuesday-plan.json'), 'utf8'));
const mondayPlan = JSON.parse(fs.readFileSync(path.join(root, 'v6-test/week10-centers-monday-plan.json'), 'utf8'));
const sourcePlan = 'https://docs.google.com/document/d/1lYe4_XN0sIUJeeEt2kbxzxtzqkteNSX9woHXpfXlb7Y/edit';
const read = file => fs.readFileSync(path.join(root, 'v6-test', file), 'utf8');
const prior = {
  'week10-centers-v3.js': {text: read('week10-centers-v3.js'), hash: 'c2dd0bf83a636b482716a096f63761a8836558eccc2ce96b97d99b3dc80a68e9'},
  'week10-read-aloud-v7.js': {text: read('week10-read-aloud-v7.js'), hash: 'fcacacc115e99f4dc3e3d7a84ac3dbad2e2797e709db57c16de23114ac7e1290'}
};
for (const [file, fixture] of Object.entries(prior)) {
  assert.equal(crypto.createHash('sha256').update(fixture.text).digest('hex'), fixture.hash, file + ' is the exact unchanged previous runtime');
}
assert.deepEqual(plan.map(p => p.title), titles);
assert.equal(plan.length, 1);
assert(plan.every(s => s.enlarge));
const legacyCache = 'eea-companion-v93';
// Isolated old v93 cache-first/ignoreSearch behavior. HTML remains network-first.
// Prime the original v3/v7 bytes, then model changed same-path origin responses
// only in this server. Never modify prior files, delete caches or replace this worker.
const legacyWorker = `const CACHE=${JSON.stringify(legacyCache)};
self.addEventListener('install',event=>event.waitUntil((async()=>{const c=await caches.open(CACHE);for(const name of ['week10-centers-v3.js','week10-read-aloud-v7.js']){const r=await fetch('./__qa-thursday-original-'+name,{cache:'no-store'});if(!r.ok)throw Error('Missing original fixture');await c.put('./'+name,r);}await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{const r=event.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==self.location.origin)return;const html=r.mode==='navigate'||r.destination==='document'||u.pathname.endsWith('.html');if(html){event.respondWith(fetch(r,{cache:'no-store'}));return;}event.respondWith(caches.match(r,{ignoreSearch:true}).then(cached=>cached||fetch(r).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(r,copy)).catch(()=>{});}return response;})));});`;
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  let fixture, type = 'text/javascript';
  if (url.pathname === '/v6-test/__qa-thursday-v93-worker.js') fixture = legacyWorker;
  else if (url.pathname.startsWith('/v6-test/__qa-thursday-original-')) fixture = prior[url.pathname.split('__qa-thursday-original-')[1]]?.text;
  else if (url.pathname === '/v6-test/week10-centers-v3.js') fixture = read('week10-centers-v4.js');
  else if (url.pathname === '/v6-test/week10-read-aloud-v7.js') fixture = read('week10-read-aloud-v8.js');
  else if (url.pathname === '/v6-test/__qa-thursday-boot.html') { fixture = '<!doctype html><title>Isolated Thursday v93 regression</title>'; type = 'text/html'; }
  else if (url.pathname === '/v6-test/__qa-thursday-old-centers.html') {
    fixture = read('week10-centers.html').replace('week10-centers-v4.js', 'week10-centers-v3.js' + (url.searchParams.has('bust') ? '?qa-thursday-upgrade=1' : '')); type = 'text/html';
  } else if (url.pathname === '/v6-test/__qa-thursday-old-reader.html') {
    fixture = read('week10-read-aloud.html').replace('week10-read-aloud-v8.js', 'week10-read-aloud-v7.js' + (url.searchParams.has('bust') ? '?qa-thursday-upgrade=1' : '')); type = 'text/html';
  }
  if (fixture !== undefined) { response.writeHead(200, {'Content-Type': type, 'Cache-Control': 'no-store'}).end(fixture); return; }
  let file;
  try { file = path.resolve(root, '.' + decodeURIComponent(url.pathname)); } catch { response.writeHead(400).end(); return; }
  if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, bytes) => {
    if (error) { response.writeHead(404).end(); return; }
    const mime = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml'}[path.extname(file)] || 'application/octet-stream';
    response.writeHead(200, {'Content-Type': mime, 'Cache-Control': 'no-store'}).end(bytes);
  });
});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check, label) {
  let last;
  for (let i = 0; i < 240; i++) { try { if (await check()) return; } catch (error) { last = error; } await delay(25); }
  assert.fail(label + (last ? ': ' + last.message : ''));
}
async function shot(page, name) {
  if (screenshotDir) { fs.mkdirSync(screenshotDir, {recursive: true}); await page.screenshot({path: path.join(screenshotDir, name + '.png'), fullPage: true}); }
}
function diagnostics(page) {
  const errors = [], missing = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) missing.push(`${response.status()} ${response.url()}`); });
  return () => { assert.deepEqual(errors, [], 'No page errors'); assert.deepEqual(missing, [], 'No missing resources'); };
}
function helpers(page, base) {
  const child = () => page.frames().find(frame => frame.parentFrame() === page.mainFrame());
  const route = (step = 0) => base + 'lesson-runner-week10.html?week=10&day=3&section=2&step=' + step;
  const standaloneRoute = (step = 0) => base + 'week10-centers.html?day=Thursday&step=' + step;
  async function overview(day = 3) {
    await until(async () => new URL(page.url()).pathname.endsWith('/daily-lessons.html') && await page.locator('#path .step').count() === (day < 4 ? 3 : 2), 'Same-day top-level overview');
    const p = new URL(page.url()).searchParams;
    assert.equal(p.get('week'), '10'); assert.equal(p.get('day'), String(day)); assert.equal(page.frames().length, 1);
  }
  async function centers(index = 0, standalone = false) {
    await until(async () => {
      const frame = standalone ? page : child();
      return frame?.url().includes('/week10-centers.html') && await frame.evaluate(index => typeof EEASectionState === 'function' && EEASectionState().step === index, index);
    }, 'Thursday center ' + index + ' ready');
    const frame = standalone ? page : child();
    assert.deepEqual(await frame.evaluate(() => EEASectionState()), {step: index, index, total: 1, atStart: true, atEnd: true});
    assert.deepEqual(await frame.evaluate(() => EEACentersPlan), plan, 'Runtime Thursday plan matches checked-in source plan');
    assert.equal(await frame.locator('.community-copy h2').textContent(), titles[index]);
    assert.equal(await frame.locator('.community-copy .lead').textContent(), plan[index].lead);
    assert.equal(await frame.locator('#count').textContent(), '1 of 1');
    assert.equal(await frame.locator('#prev').textContent(), '← Read Aloud');
    assert.equal(await frame.locator('#done').textContent(), 'Finish Centers →');
    assert.equal(await frame.locator('.enlarge-image').textContent(), 'Enlarge image');
    assert.equal(await frame.locator('.community-card').count(), 1); assert.equal(await frame.locator('iframe').count(), 0);
    assert.equal(await frame.locator('script[src]').getAttribute('src'), 'week10-centers-v4.js');
    assert.equal(page.frames().length, standalone ? 1 : 2);
    const p = new URL(page.url()).searchParams, fp = new URL(frame.url()).searchParams;
    assert.equal(p.get('step'), String(index)); assert.equal(p.get('week'), '10'); assert.equal(p.get('section'), '2');
    assert.equal(p.has('stop'), false); assert.equal(p.has('book'), false);
    assert.equal(p.get('day'), standalone ? 'Thursday' : '3');
    assert.equal(fp.get('step'), String(index)); assert.equal(fp.get('day'), 'Thursday'); assert.equal(fp.has('stop'), false); assert.equal(fp.has('book'), false);
    if (!standalone) {
      const resume = await page.evaluate(() => JSON.parse(localStorage.getItem('eea-lesson-resume')));
      assert.equal(resume.week, 10); assert.equal(resume.day, 3); assert.equal(resume.section, 2);
    }
    return frame;
  }
  async function reader(atEnd = false, day = 3) {
    await until(async () => child()?.url().includes('week10-read-aloud.html') && await child().evaluate(atEnd => typeof EEASectionState === 'function' && (!atEnd || EEASectionState().atEnd), atEnd), 'Same-day reader');
    assert.equal(new URL(page.url()).searchParams.get('day'), String(day)); assert.equal(new URL(page.url()).searchParams.get('section'), '1'); assert.equal(page.frames().length, 2);
    assert.equal(await child().locator('script[src]').last().getAttribute('src'), 'week10-read-aloud-v8.js'); return child();
  }
  async function community(day = 3) {
    await until(async () => child()?.url().includes('week10-community.html') && await child().evaluate(() => typeof EEASectionState === 'function'), 'Same-day Community');
    assert.equal(new URL(page.url()).searchParams.get('section'), '0'); assert.equal(new URL(page.url()).searchParams.get('day'), String(day)); return child();
  }
  return {child, route, standaloneRoute, overview, centers, reader, community};
}
async function verifyNotes(page, frame, index) {
  const url = page.url(), length = await page.evaluate(() => history.length), state = await frame.evaluate(() => EEASectionState());
  const actual = await frame.locator('.community-notes-content').evaluate(el => {
    const sections = [];
    for (const node of el.children) { if (node.tagName === 'H3') { if (node.textContent === 'Source materials') break; sections.push([node.textContent, []]); } else if (node.tagName === 'P') sections.at(-1)[1].push(node.textContent); }
    return sections;
  });
  assert.deepEqual(actual, plan[index].notes, 'Every teacher-note heading and paragraph has source parity');
  assert.deepEqual(await frame.locator('.community-notes-content a').evaluateAll(links => links.map(a => [a.textContent, a.getAttribute('href')])), [...(plan[index].links || []), ['Original Week 2 lesson', plan[index].source], ['Original Week 2 Plan', sourcePlan]]);
  assert(await frame.locator('.community-notes-content a').evaluateAll(links => links.every(a => a.target === '_blank' && a.relList.contains('noopener') && a.relList.contains('noreferrer'))));
  for (let n = 0; n < 3; n++) {
    await frame.locator('.community-notes summary').click(); assert(await frame.locator('.community-notes').evaluate(e => e.open));
    await frame.locator('.community-notes summary').click(); assert(!await frame.locator('.community-notes').evaluate(e => e.open));
  }
  assert.equal(page.url(), url); assert.equal(await page.evaluate(() => history.length), length); assert.deepEqual(await frame.evaluate(() => EEASectionState()), state);
}
async function image(frame, index, enlarged = false) {
  const locator = frame.locator(enlarged ? '#enlarged-image' : '.lesson-img');
  await until(() => locator.evaluate(img => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0), 'Original local image loaded');
  await locator.evaluate(async img => { await img.decode(); if (!img.naturalWidth || !img.naturalHeight) throw Error('Source image did not decode'); });
  assert.deepEqual(await locator.evaluate(img => [img.naturalWidth, img.naturalHeight]), [1536, 1024], 'Uncropped original source dimensions');
  assert.equal(await locator.getAttribute('src'), plan[index].img); assert.equal(await locator.getAttribute('alt'), plan[index].alt);
  const box = await locator.evaluate(el => { const r = el.getBoundingClientRect(); return {fit: getComputedStyle(el).objectFit, x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height, vw: innerWidth, vh: innerHeight}; });
  assert.equal(box.fit, 'contain'); assert(box.width > 300 && box.height > 300 && box.x >= 0 && box.y >= 0 && box.right <= box.vw + 1 && box.bottom <= box.vh + 1, 'Large, uncropped image fits viewport: ' + JSON.stringify(box));
}
async function verifyDialog(page, frame, index, screenshotName) {
  assert(plan[index].enlarge);
  const url = page.url(), length = await page.evaluate(() => history.length), state = await frame.evaluate(() => EEASectionState());
  for (const [open, close] of [['keyboard', 'button'], ['keyboard', 'Escape'], ['button', 'button'], ['button', 'Escape'], ['image', 'button'], ['image', 'Escape'], ['button', 'backdrop']]) {
    if (open === 'keyboard') { await frame.locator('.enlarge-image').focus(); await page.keyboard.press('Enter'); }
    else await frame.locator(open === 'image' ? '.lesson-img' : '.enlarge-image').click();
    assert(await frame.locator('#image-dialog').evaluate(el => el.open)); assert.equal(await frame.locator('#image-dialog').getAttribute('aria-label'), 'Enlarged lesson image'); await image(frame, index, true);
    assert(await frame.locator('#close-image').evaluate(el => el === document.activeElement), 'Dialog places focus on Close');
    await target(frame.locator('#close-image'), 'Dialog Close'); await target(frame.locator('#enlarged-image'), 'Enlarged page');
    if (screenshotName) { await shot(page, screenshotName); screenshotName = null; }
    if (close === 'button') await frame.locator('#close-image').click(); else if (close === 'Escape') await page.keyboard.press('Escape'); else { const box = await frame.locator('#image-dialog').boundingBox(); assert(box.x > 2); await page.mouse.click(box.x - 2, box.y + Math.min(30, box.height / 2)); }
    assert(!await frame.locator('#image-dialog').evaluate(el => el.open));
    assert(await frame.locator('.enlarge-image').evaluate(el => el === document.activeElement), 'Every dismissal, including image tap, restores focus to Enlarge image');
    assert.equal(page.url(), url); assert.equal(await page.evaluate(() => history.length), length); assert.deepEqual(await frame.evaluate(() => EEASectionState()), state);
  }
}

async function verifyLegacy(browser, base) {
 const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'allow'});
 try{
  const page=await context.newPage(),clean=diagnostics(page),h=helpers(page,base);
  await page.goto(base+'__qa-thursday-boot.html');await page.evaluate(async()=>{await navigator.serviceWorker.register('./__qa-thursday-v93-worker.js',{scope:'./'});await navigator.serviceWorker.ready;});await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/__qa-thursday-v93-worker.js'));
  const pairs=[['week10-centers-v3.js','week10-centers-v4.js'],['week10-read-aloud-v7.js','week10-read-aloud-v8.js']];
  for(const suffix of ['', '?qa-thursday-upgrade=1']){
   for(const[oldFile,newFile]of pairs){assert.notEqual(prior[oldFile].text,read(newFile));assert.equal(await(await context.request.get(base+oldFile+suffix)).text(),read(newFile));assert.equal(await page.evaluate(async name=>await(await fetch('./'+name,{cache:'no-store'})).text(),oldFile+suffix),prior[oldFile].text,'Old cache-first ignoreSearch worker retains original bytes');}
   await page.goto(base+'__qa-thursday-old-reader.html?day=Thursday&book=red-dragon&step=999999'+(suffix?'&bust=1':''));await page.waitForFunction(()=>typeof EEASectionState==='function'&&EEASectionState().atEnd);assert.equal(await page.locator('#next').textContent(),'Finish Read Aloud →');await page.locator('#next').click();await h.overview();
   await page.goto(base+'__qa-thursday-old-centers.html?day=Thursday'+(suffix?'&bust=1':''));await h.overview();
  }
  const runtimeResponse=page.waitForResponse(r=>new URL(r.url()).pathname==='/v6-test/week10-read-aloud-v8.js');await page.goto(base+'lesson-runner-week10.html?week=10&day=3&section=1&book=red-dragon&step=999999');assert.equal(await(await runtimeResponse).text(),read('week10-read-aloud-v8.js'));let frame=await h.reader(true);
  const centersResponse=page.waitForResponse(r=>new URL(r.url()).pathname==='/v6-test/week10-centers-v4.js');await frame.locator('#next').click();assert.equal(await(await centersResponse).text(),read('week10-centers-v4.js'));frame=await h.centers();await verifyNotes(page,frame,0);await verifyDialog(page,frame,0);await shot(page,'thursday-v93-fresh-v4-v8-1280x800');await page.reload();frame=await h.centers();await frame.locator('#done').click();await h.overview();
  assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL),base+'__qa-thursday-v93-worker.js');assert.equal(await page.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).length),1);
  for(const[oldFile]of pairs)assert.equal(await page.evaluate(async({cache,file})=>await(await(await caches.open(cache)).match('./'+file)).text(),{cache:legacyCache,file:oldFile}),prior[oldFile].text,'Original old cache entry survives without reset');clean();
  console.log('Untouched v93 reproduces stale same-path/query failure; fresh v4/v8 finishes Thursday without clearing caches');
 }finally{await context.close();}
}
async function verifyOneCardHistory(browser,base,standalone){
 const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});
 try{
  const page=await context.newPage(),clean=diagnostics(page),h=helpers(page,base);await page.goto(base+'daily-lessons.html?week=10&day=3');await h.overview();const initial=await page.evaluate(()=>history.length);await page.goto(standalone?h.standaloneRoute():h.route());let frame=await h.centers(0,standalone);assert.equal(await page.evaluate(()=>history.length),initial+1,'Exactly one joint-session entry on center entry');
  for(let n=0;n<4;n++)await page.evaluate(standalone=>{dispatchEvent(new Event('pageshow'));if(!standalone)document.getElementById('frame').dispatchEvent(new Event('load'));},standalone);
  assert.equal(await page.evaluate(()=>history.length),initial+1);await verifyNotes(page,frame,0);await verifyDialog(page,frame,0);assert.equal(await page.evaluate(()=>history.length),initial+1,'One-card content/notes/image never create phantom steps');
  await frame.locator('.enlarge-image').click();await page.goBack();await h.overview();await page.goForward();frame=await h.centers(0,standalone);assert(!await frame.locator('#image-dialog').evaluate(e=>e.open),'Native restoration closes modal');await frame.locator('.enlarge-image').click();await page.reload();frame=await h.centers(0,standalone);assert(!await frame.locator('#image-dialog').evaluate(e=>e.open));
  const resume=await page.evaluate(()=>localStorage.getItem('eea-lesson-resume'));await page.evaluate(()=>localStorage.setItem('eea-lesson-auto-resume',new Date().toISOString().slice(0,10)));await frame.locator('#done').click();await h.overview();assert.equal(await page.evaluate(()=>history.length),initial+2,'Finish creates one bounded exit, no empty second card');assert.equal(await page.evaluate(()=>localStorage.getItem('eea-lesson-auto-resume')),null);assert.equal(await page.evaluate(()=>localStorage.getItem('eea-lesson-resume')),resume);
  for(let n=0;n<3;n++){await page.goBack();await h.centers(0,standalone);await page.goForward();await h.overview();}await page.reload();await h.overview();clean();
 }finally{await context.close();}
}
(async()=>{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const base=`http://127.0.0.1:${server.address().port}/v6-test/`;let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,ignoreDefaultArgs:['--disable-back-forward-cache']});
  for(const standalone of [false,true])await verifyOneCardHistory(browser,base,standalone);
  const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'}),clean=diagnostics(page),h=helpers(page,base);
  await page.goto(base+'daily-lessons.html?week=10&day=3');await h.overview();await page.locator('#start').click();let frame=await h.community();await frame.locator('#done').click();await h.reader();
  // Traverse both physical-book source plans, in both contexts, all the way to
  // the single Class Soup card. No placeholder image requests or fake pages.
  const colorPlans=JSON.parse(read('week10-color-read-aloud-plans.json'));
  for(const standalone of [false,true])for(const book of ['green-chile','red-dragon']){
   await page.goto(base+(standalone?'week10-read-aloud.html?day=Thursday': 'lesson-runner-week10.html?week=10&day=3&section=1')+'&book='+book);if(standalone)await page.waitForFunction(()=>typeof EEASectionState==='function');else await h.reader();frame=standalone?page:h.child();const expected=colorPlans[book].Thursday;assert.deepEqual(await frame.evaluate(()=>EEAReadAloudPlan),expected);assert.equal(await frame.locator('#bookSelect').inputValue(),book);
   for(let i=0;i<expected.steps.length;i++){assert.equal(await frame.evaluate(()=>EEASectionState().index),i);assert.equal(await frame.locator('#prompt').textContent(),expected.steps[i].prompt);assert.equal(await frame.locator('#bookImg').getAttribute('src'),null);assert.match(await frame.locator('#bookCue').textContent(),/physical book/);if(i<expected.steps.length-1)await frame.locator('#next').click();}
   assert.equal(await frame.locator('#next').textContent(),'Next: Centers →');await frame.locator('#next').click();frame=await h.centers();await page.goBack();if(standalone){await page.waitForFunction(()=>typeof EEASectionState==='function'&&EEASectionState().atEnd);assert.equal(await page.evaluate(()=>EEASectionState().book),book);}else{frame=await h.reader(true);assert.equal(await frame.evaluate(()=>EEASectionState().book),book);}await page.goForward();frame=await h.centers();await frame.locator('#prev').click();frame=await h.reader();assert.equal(await frame.evaluate(()=>EEASectionState().book),book);assert.equal(await frame.evaluate(()=>EEASectionState().step),0);await frame.locator('#backBtn').click();await h.overview();
  }
  for(const standalone of [false,true])for(const button of ['prev','done','exit']){
   for(let repeat=0;repeat<3;repeat++){await page.goto(standalone?h.standaloneRoute():h.route());frame=await h.centers(0,standalone);await frame.locator('#'+button).click();if(button==='prev'){await h.reader();await h.child().locator('#backBtn').click();}await h.overview();await page.goBack();if(button==='prev')await h.reader();else await h.centers(0,standalone);await page.goForward();await h.overview();}
  }
  for(const key of ['Enter','Space']){await page.locator('#path .step').nth(2).focus();await page.keyboard.press(key);frame=await h.centers();await frame.locator('#exit').click();await h.overview();}
  // Each early boundary has a cold context and a proven pending image request.
  for(const standalone of [false,true])for(const button of ['prev','done','exit']){
   const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});let release;const gate=new Promise(r=>{release=r;});let requested=false;
   try{await context.route(url=>url.pathname==='/v6-test/'+plan[0].img,async route=>{if(route.request().resourceType()==='image')requested=true;await gate;await route.continue().catch(()=>{});});const pending=await context.newPage(),ph=helpers(pending,base),pc=diagnostics(pending);await pending.goto(standalone?ph.standaloneRoute():ph.route(),{waitUntil:'domcontentloaded'});let pf=await ph.centers(0,standalone);await until(()=>requested,'Initial image request held');assert.equal(await pf.locator('.lesson-img').evaluate(e=>e.complete),false);await pf.locator('#'+button).click();if(button==='prev'){pf=await ph.reader();await pf.locator('#backBtn').click();}await ph.overview();pc();}finally{release();await context.unrouteAll({behavior:'wait'});await context.close();}
  }
  for(const standalone of [false,true])for(const raw of ['-1','1','2','bad','Infinity','1.5','999999','','NaN']){await page.goto((standalone?h.standaloneRoute(raw):h.route(raw))+'&stop=2&book=red-dragon');await h.centers(0,standalone);}
  await page.goto(base+'week10-centers.html?day=Friday&step=0');await h.overview(4);await page.goto(base+'lesson-runner-week10.html?week=10&day=4&section=2&step=4&book=red-dragon&stop=2');await h.community(4);for(const key of ['step','book','stop'])assert.equal(new URL(page.url()).searchParams.has(key),false);
  for(const book of ['green-chile','red-dragon']){await page.goto(base+'lesson-runner-week10.html?week=10&day=4&section=1&book='+book+'&step=999999');frame=await h.reader(true,4);assert.equal(await frame.locator('#next').textContent(),'Finish Read Aloud →');await frame.locator('#next').click();await h.overview(4);}
  // All previous Center plans survive byte for byte and keep their own exits.
  for(const [day,file]of [[0,'week10-centers-monday-plan.json'],[1,'week10-centers-tuesday-plan.json'],[2,'week10-centers-wednesday-plan.json']]){
   await page.goto(base+`lesson-runner-week10.html?week=10&day=${day}&section=1&step=999999`);frame=await h.reader(true,day);await frame.locator('#next').click();await until(async()=>h.child()?.url().includes('week10-centers.html')&&await h.child().evaluate(()=>typeof EEACentersPlan!=='undefined'),'Earlier Centers');frame=h.child();const expected=JSON.parse(read(file));assert.deepEqual(await frame.evaluate(()=>EEACentersPlan),expected);for(let i=0;i<expected.length;i++){assert.equal(await frame.locator('.community-copy h2').textContent(),expected[i].title);await frame.locator('#done').click();}await h.overview(day);
  }
  for(const viewport of [{width:1280,height:800},{width:1180,height:757}]){
   await page.setViewportSize(viewport);await page.goto(base+'daily-lessons.html?week=10&day=3');await h.overview();for(const selector of ['#path .step','#start','#weeknav button','#days button','.home','.pace']){const items=page.locator(selector);for(let n=0;n<await items.count();n++)await target(items.nth(n),'Overview '+selector);}await shot(page,`thursday-overview-${viewport.width}x${viewport.height}`);
   for(const standalone of [false,true]){
    const suffix=`${standalone?'standalone':'embedded'}-${viewport.width}x${viewport.height}`;await page.goto(standalone?h.standaloneRoute():h.route());frame=await h.centers(0,standalone);await image(frame,0);const fit=await frame.locator('.community-copy').evaluate(e=>({height:e.scrollHeight,client:e.clientHeight,top:e.scrollTop}));assert.equal(fit.top,0);assert(fit.height<=fit.client+1,'Full closed teaching introduction fits');for(const selector of ['#prev','#done','#exit','#count','.community-copy h2','.lead','.community-notes summary','.enlarge-image'])await target(frame.locator(selector),suffix+' '+selector);await shot(page,'thursday-class-soup-'+suffix);await verifyNotes(page,frame,0);await verifyDialog(page,frame,0,'thursday-enlarged-'+suffix);
    await frame.locator('.community-notes summary').click();await shot(page,'thursday-notes-'+suffix);const links=frame.locator('.community-notes-content a');for(let n=0;n<await links.count();n++){await links.nth(n).scrollIntoViewIfNeeded();await target(links.nth(n),suffix+' source '+n);}for(const selector of ['#prev','#done','#exit'])await target(frame.locator(selector),suffix+' notes '+selector);await image(frame,0);await shot(page,'thursday-source-links-'+suffix);
   }
  }
  clean();await page.close();await verifyLegacy(browser,base);console.log('PASS: Thursday one-card source/notes, all Green/Red handoffs, native history/reload, six cold-image boundaries, button/Escape/backdrop/focus, same-day exits, prior plans and responsive screenshots');
 }finally{if(browser)await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
