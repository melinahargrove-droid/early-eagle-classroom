// Shared unmodified real-browser flows for local, prepared Windows and actual Pages.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {target} = require('./test_week10_centers_thursday_target.cjs');
const {until, diagnostics} = require('./test_week10_centers_friday_shared.cjs');
const {captureResponseBytes, waitForReaderBytes, waitForCentersBytes} = require('./week11-centers-tuesday-response-capture.cjs');
const root = path.resolve(process.env.WEEK11_MONDAY_APP_ROOT || path.join(__dirname, '../v6-test'));
const read = file => fs.readFileSync(path.join(root, file));
const plan = JSON.parse(read('week11-centers-monday-plan.json'));
const runtimeFiles = ['week11-read-aloud-v4.js', 'week11-centers-v4.js', 'week11-centers-monday-plan-v1.js'];
const consumedFiles = [...runtimeFiles, ...new Set(plan.map(p => p.img))];
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const child = page => page.frames().find(f => f.parentFrame() === page.mainFrame());
const route = (base, standalone = false, step = 0) => base + (standalone ? 'week11-centers.html?week=11&day=Monday&section=1' : 'lesson-runner-week11.html?week=11&day=0&section=1') + '&step=' + step;
async function overview(page, day = 0) {
 await until(async () => { const u = new URL(page.url()); return u.pathname.endsWith('/daily-lessons.html') && u.searchParams.get('week') === '11' && u.searchParams.get('day') === String(day) && await page.locator('#path .step').count() === (day < 2 ? 2 : day <= 3 ? 1 : 0); }, 'Same-day Week11 overview');
 assert.equal(page.frames().length, 1);
}
async function reader(page, step = 0, standalone = false) {
 await until(async () => { const f = standalone ? page : child(page); return f?.url().includes('/week11-read-aloud.html') && await f.evaluate(step => typeof EEASectionState === 'function' && EEASectionState().step === step, step); }, 'Week11 reader ' + step);
 const f = standalone ? page : child(page);
 // Await the tracked reader body and any shared hero image before its frame
 // can be replaced. Untracked reader-plan/images keep the existing scope.
 await waitForReaderBytes(page, await f.locator('#bookImg').getAttribute('src'));
 return f;
}
async function centers(page, step = 0, standalone = false) {
 await until(async () => { const f = standalone ? page : child(page); return f?.url().includes('/week11-centers.html') && await f.evaluate(step => typeof EEASectionState === 'function' && EEASectionState().step === step, step); }, 'Monday Centers ' + step);
 const f = standalone ? page : child(page); assert.equal(page.frames().length, standalone ? 1 : 2);
 assert.deepEqual(await f.evaluate(() => EEACentersPlan), plan);
 assert.deepEqual(await f.evaluate(() => EEASectionState()), {step, index: step, total: 2, atStart: step === 0, atEnd: step === 1});
 for (const [url, day] of [[page.url(), standalone ? 'Monday' : '0'], [f.url(), 'Monday']]) { const p = new URL(url).searchParams; assert.equal(p.get('week'), '11'); assert.equal(p.get('day'), day); assert.equal(p.get('section'), '1'); assert.equal(p.get('step'), String(step)); for (const k of ['book','stop','center','review']) assert(!p.has(k), 'No leaked ' + k); }
 if (!standalone) assert.deepEqual(await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('eea-lesson-resume')); return [s.week,s.day,s.section]; }), [11,0,1]);
 // Center 2 is followed immediately by native Back/Forward/reload in the
 // real flow; its first image body must be hashed before readiness returns.
 await waitForCentersBytes(page, await f.locator('.lesson-img').getAttribute('src'));
 return f;
}
async function imageReady(f, expected, selector = '.lesson-img') {
 const img = f.locator(selector); await img.evaluate(async el => { await el.decode(); if (!el.naturalWidth || !el.naturalHeight) throw Error('Image must decode'); });
 assert.equal(await img.getAttribute('src'), expected.img); assert.equal(await img.getAttribute('alt'), expected.alt); assert.equal(await img.evaluate(el => getComputedStyle(el).objectFit), 'contain'); await target(img, selector);
}
function captureRuntimeBytes(page, base, expected, verified) {
 return captureResponseBytes(page, base, expected, verified, consumedFiles);
}
// Long reader traversal has its own joint session, so it cannot consume the
// browser's capped history budget before exact-count navigation regressions.
async function verifyFullReader(browser,base,viewport,out) {
 const context=await browser.newContext({viewport,serviceWorkers:'allow'}),page=await context.newPage(),clean=diagnostics(page);
 const suffix=viewport.width+'x'+viewport.height,verified={},expected=Object.fromEntries(consumedFiles.map(file=>[file,hash(read(file))]));
 const captures=captureRuntimeBytes(page,base,expected,verified);
 const shot=async name=>{if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'week11-monday-'+name+'-'+suffix+'.png'),fullPage:true});}};
 try {
 // Traverse the unchanged Monday source plan from the actual overview card,
 // including each gated stop. Deep-link handoff regressions below remain separate.
 const mondayReaderPlan = JSON.parse(read('week11-read-aloud-plan.json'));
 assert.equal(mondayReaderPlan.steps.length,24);
 assert.equal(mondayReaderPlan.steps.filter(step=>step.bookPage).length,16);
 assert.equal(mondayReaderPlan.steps.reduce((n,step)=>n+step.stops.length,0),7);
 await page.goto(base+'daily-lessons.html?week=11&day=0');await overview(page);
 await page.getByRole('button',{name:'Open Read Aloud',exact:true}).click();
 let fullReader=await reader(page);await captures?.verify('week11-read-aloud-v4.js');
 assert.deepEqual(await fullReader.evaluate(()=>EEAReadAloudPlan),mondayReaderPlan);
 let visitedScreens=0,visitedStops=0;
 for(const [index,step] of mondayReaderPlan.steps.entries()) {
  fullReader=await reader(page,index);
  const state=await fullReader.evaluate(()=>EEASectionState());
  assert.equal(state.total,24);assert.equal(state.stop,0);assert.equal(state.stopPending,step.stops.length>0);
  assert.equal(await fullReader.locator('#stepTitle').textContent(),step.title);
  assert.equal(await fullReader.locator('#bookImg').getAttribute('src'),step.img);
  await fullReader.locator('#bookImg').evaluate(async image=>{await image.decode();if(!image.naturalWidth||!image.naturalHeight)throw Error('Original reader image did not decode');});
  assert.equal(await fullReader.locator('#bookImg').evaluate(image=>getComputedStyle(image).objectFit),'contain');
  assert.equal(await fullReader.locator('.stage').evaluate(el=>el.classList.contains('spread')),!!step.bookPage);
  for(const selector of ['#prev','#next','#backBtn'])await target(fullReader.locator(selector),'Full Monday reader '+step.id+' '+selector);
  for(const [stopIndex,prompt] of step.stops.entries()) {
   assert.equal(await fullReader.locator('#teachingStop').isVisible(),stopIndex>0);
   await fullReader.locator('#next').click();
   const after=await fullReader.evaluate(()=>EEASectionState());
   assert.equal(after.step,index,'A stop cannot skip its original book page');assert.equal(after.stop,stopIndex+1);
   assert.equal(after.stopPending,stopIndex+1<step.stops.length);
   assert.equal(await fullReader.locator('#stopText').textContent(),prompt);assert(await fullReader.locator('#teachingStop').isVisible());
   assert.equal(await fullReader.locator('#bookImg').getAttribute('src'),step.img);visitedStops++;
  }
  visitedScreens++;if(index<mondayReaderPlan.steps.length-1)await fullReader.locator('#next').click();
 }
 assert.equal(visitedScreens,24);assert.equal(visitedStops,7);assert(await fullReader.evaluate(()=>EEASectionState().atEnd));
 assert.equal(await fullReader.locator('#next').textContent(),'Next: Centers →');
 for(const selector of ['#note','#teacherText']) {const text=await fullReader.locator(selector).textContent();assert(text.includes('Next, we’ll explore Mixing Primary Colors and the All Are Welcome Clubhouse in Centers.'));assert(!text.includes('Finish returns to Monday’s Day Overview'),'No stale app routing notice');}
 for(const selector of ['#prev','#next','#backBtn'])await target(fullReader.locator(selector),'Reader closing '+selector);
 await shot('full-reader-closing');await fullReader.locator('#next').click();
 let fullCenters=await centers(page);await captures?.verify('week11-centers-v4.js');await captures?.verify('week11-centers-monday-plan-v1.js');await imageReady(fullCenters,plan[0]);await captures?.verify(plan[0].img);
 await fullCenters.locator('#exit').click();await overview(page);

 // This isolated traversal consumes the reader and first center. The main flow
 // independently hashes both center images and every new runtime per viewport.
 clean();
 }catch(error){await shot('full-reader-failure').catch(()=>{});throw error;}finally{await context.close();}
}
async function verifyExactHistory(browser,base,viewport) {
 for(const standalone of [false,true])for(const repeated of [false,true]) {
  // Every assertion starts in a brand-new joint session with no forward stack.
  const context=await browser.newContext({viewport,serviceWorkers:'block'});
  try {
   const page=await context.newPage(),clean=diagnostics(page);
   await page.goto(route(base,standalone,repeated?1:0));let f=await centers(page,repeated?1:0,standalone);
   const baseline=await page.evaluate(()=>history.length);assert(baseline<5,'Fresh session leaves room below Chromium history cap');
   if(repeated){
    await f.evaluate(()=>{for(let n=0;n<5;n++)document.getElementById('prev').click();});await reader(page);
    assert.equal(await page.evaluate(()=>history.length),baseline+2,'Internal Previous plus one boundary action, no duplicate iframe entries');
    await page.goBack();await centers(page,0,standalone);await page.goBack();await centers(page,1,standalone);
    await page.goForward();await centers(page,0,standalone);await page.goForward();await reader(page);
   }else{
    await f.locator('#done').click();await centers(page,1,standalone);
    assert.equal(await page.evaluate(()=>history.length),baseline+1,'One semantic action, one joint history entry');
    await page.goBack();await centers(page,0,standalone);await page.goForward();await centers(page,1,standalone);
    await page.reload();await centers(page,1,standalone);assert.equal(await page.evaluate(()=>history.length),baseline+1,'Reload never appends a semantic entry');
   }
   clean();
  }finally{await context.close();}
 }
}
async function verifyViewport(browser, base, viewport, out, capturesFactory) {
 await verifyFullReader(browser,base,viewport,out);
 await verifyExactHistory(browser,base,viewport);
 const context = await browser.newContext({viewport, serviceWorkers:'allow'}), page = await context.newPage(), clean = diagnostics(page), suffix = viewport.width + 'x' + viewport.height;
 const captures = capturesFactory?.(page, suffix); const shot = async name => {if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'week11-monday-'+name+'-'+suffix+'.png'),fullPage:true});}};
 try {
 await page.goto(base+'daily-lessons.html?week=11&day=0'); await overview(page); assert.deepEqual(await page.locator('#path .step b').allTextContents(),['Read Aloud','Centers']); await shot('overview');
 for(const key of ['Enter','Space']) {await page.getByRole('button',{name:'Open Centers',exact:true}).press(key);let f=await centers(page);await captures?.verify('week11-centers-v4.js');await captures?.verify('week11-centers-monday-plan-v1.js');await imageReady(f,plan[0]);await captures?.verify(plan[0].img);await f.locator('#exit').click();await overview(page);}
 for(const standalone of [false,true]) {
 const mode=standalone?'standalone':'embedded';
 await page.goto(base+(standalone?'week11-read-aloud.html?day=Monday':'lesson-runner-week11.html?week=11&day=0&section=0')+'&step=23'); let f=await reader(page,23,standalone);await captures?.verify('week11-read-aloud-v4.js');assert.equal(await f.locator('#next').textContent(),'Next: Centers →');await f.locator('#next').click();await centers(page);await page.goBack();await reader(page,23,standalone);await page.goForward();await centers(page);await page.reload();await centers(page);
 await page.goto(route(base,standalone)); f=await centers(page,0,standalone);
 for(let i=0;i<2;i++) {f=await centers(page,i,standalone);const expected=plan[i];assert.equal(await f.locator('.community-copy h2').textContent(),expected.title);assert.equal(await f.locator('.lead').textContent(),expected.lead);await imageReady(f,expected);await captures?.verify(expected.img);
 for(const selector of ['#prev','#done','#exit','#count','.community-copy h2','.lead','.community-notes summary','.enlarge-image']) await target(f.locator(selector),selector);
 await shot(mode+'-page-'+i);const before=page.url(),length=await page.evaluate(()=>history.length),state=await f.evaluate(()=>EEASectionState());
 const actual=await f.locator('.community-notes-content').evaluate(el=>{const notes=[];for(const n of el.children){if(n.tagName==='H3'){if(n.textContent==='Source materials')break;notes.push([n.textContent,[]]);}else if(n.tagName==='P'&&notes.length)notes.at(-1)[1].push(n.textContent);}return notes;});assert.deepEqual(actual,expected.notes,'Every source-backed notes paragraph');
 await f.locator('summary').click();assert(await f.locator('details').evaluate(e=>e.open));await shot(mode+'-notes-'+i);const links=f.locator('.community-notes-content a');assert(await links.count()>0);assert(await links.evaluateAll(a=>a.every(e=>e.target==='_blank'&&e.relList.contains('noopener')&&e.relList.contains('noreferrer'))));for(let n=0;n<await links.count();n++){await links.nth(n).scrollIntoViewIfNeeded();await target(links.nth(n),'Source link '+n);}await shot(mode+'-sources-'+i);for(const selector of ['#prev','#done','#exit'])await target(f.locator(selector),'Notes-open '+selector);await f.locator('summary').click();
 for(const [open,close] of [['keyboard','button'],['image','Escape'],['button','backdrop']]){if(open==='keyboard'){await f.locator('.enlarge-image').focus();await page.keyboard.press('Enter');}else await f.locator(open==='image'?'.lesson-img':'.enlarge-image').click();assert(await f.locator('#image-dialog').evaluate(e=>e.open));await imageReady(f,expected,'#enlarged-image');await target(f.locator('#close-image'),'Modal Close');assert(await f.locator('#close-image').evaluate(e=>e===document.activeElement));if(open==='keyboard')await shot(mode+'-enlarged-'+i);if(close==='button')await f.locator('#close-image').click();else if(close==='Escape')await page.keyboard.press('Escape');else{const b=await f.locator('#image-dialog').boundingBox();await page.mouse.click(b.x-2,b.y+20);}assert(!await f.locator('#image-dialog').evaluate(e=>e.open));assert(await f.locator('.enlarge-image').evaluate(e=>e===document.activeElement));}
 assert.equal(page.url(),before);assert.equal(await page.evaluate(()=>history.length),length);assert.deepEqual(await f.evaluate(()=>EEASectionState()),state);
 if(i===0){await f.locator('#done').click();await centers(page,1,standalone);await page.goBack();await centers(page,0,standalone);await page.goForward();await centers(page,1,standalone);await page.reload();f=await centers(page,1,standalone);await f.locator('#prev').click();f=await centers(page,0,standalone);await f.locator('#done').click();}
 }
 f=await centers(page,1,standalone);await f.locator('#done').click();await overview(page);await page.goBack();await centers(page,1,standalone);await page.goForward();await overview(page);await page.reload();await overview(page);
 for(const step of [0,1]){await page.goto(route(base,standalone,step));f=await centers(page,step,standalone);await f.locator('#exit').click();await overview(page);}
 await page.goto(route(base,standalone));f=await centers(page,0,standalone);await f.locator('#prev').click();await reader(page);await child(page).locator('#backBtn').click();await overview(page);
 // Repeated synchronous action dispatch must leave exactly the expected semantic state.
 await page.goto(route(base,standalone,1));f=await centers(page,1,standalone);await f.evaluate(()=>{for(let n=0;n<5;n++)document.getElementById('prev').click();});await reader(page);
 }
 await page.goto(base+'daily-lessons.html?week=11&day=1');await overview(page,1);assert.equal(await page.getByRole('button',{name:'Open Centers',exact:true}).count(),1);
 for(const day of [4]){await page.goto(base+'daily-lessons.html?week=11&day='+day);await overview(page,day);assert.equal(await page.getByRole('button',{name:'Open Centers',exact:true}).count(),0);}
 await captures?.finish();clean();console.log('PASS: Week11 Monday Centers real source/image/modal/geometry/handoff/history flows '+suffix);
 }catch(error){await shot('failure').catch(()=>{});throw error;}finally{await context.close();}
}
module.exports={root,read,plan,runtimeFiles,consumedFiles,hash,until,diagnostics,route,overview,reader,centers,imageReady,captureRuntimeBytes,verifyViewport};
