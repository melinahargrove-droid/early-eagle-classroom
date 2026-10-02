// Shared unmodified real-browser flows for local, prepared Windows and actual Pages.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {target} = require('./test_week10_centers_thursday_target.cjs');
const {until, diagnostics} = require('./test_week10_centers_friday_shared.cjs');
const {readerRuntimeFiles, centersRuntimeFiles, captureResponseBytes, waitForReaderBytes, waitForCentersBytes} = require('./week11-centers-tuesday-response-capture.cjs');
const root = path.resolve(process.env.WEEK11_TUESDAY_APP_ROOT || path.join(__dirname, '../v6-test'));
const read = file => fs.readFileSync(path.join(root, file));
const plan = JSON.parse(read('week11-centers-tuesday-plan.json'));
const runtimeFiles = [...readerRuntimeFiles, ...centersRuntimeFiles];
const consumedFiles = [...runtimeFiles, ...new Set(plan.map(p => p.img))];
const readerPlan = JSON.parse(read('week11-read-aloud-tuesday-plan.json'));
const readerConsumedFiles = [...consumedFiles, ...new Set(readerPlan.steps.map(step => step.img))];
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const child = page => page.frames().find(f => f.parentFrame() === page.mainFrame());
const route = (base, standalone = false, step = 0) => base + (standalone ? 'week11-centers.html?week=11&day=Tuesday&section=1' : 'lesson-runner-week11.html?week=11&day=1&section=1') + '&step=' + step;
async function overview(page, day = 1) {
 await until(async () => { const u = new URL(page.url()); return u.pathname.endsWith('/daily-lessons.html') && u.searchParams.get('week') === '11' && u.searchParams.get('day') === String(day) && await page.locator('#path .step').count() === (day < 2 ? 2 : 0); }, 'Same-day Week11 overview');
 assert.equal(page.frames().length, 1);
}
async function reader(page, step = 0, standalone = false) {
 await until(async () => { const f = standalone ? page : child(page); return f?.url().includes('/week11-read-aloud.html') && await f.evaluate(step => typeof EEASectionState === 'function' && EEASectionState().step === step, step); }, 'Week11 reader ' + step);
 const f=standalone ? page : child(page);assert.equal(page.frames().length,standalone?1:2);assert.equal(await f.evaluate(()=>EEAReadAloudPlan.day),'Tuesday');
 for(const [url,day] of [[page.url(),standalone?'Tuesday':'1'],[f.url(),'Tuesday']]){const p=new URL(url).searchParams;assert.equal(p.get('week'),'11');assert.equal(p.get('day'),day);assert.equal(p.get('section'),'0');assert.equal(p.get('step'),String(step));}
 // Readiness is a navigation barrier for every tracked script and this image,
 // not just the runtime whose globals happen to be initialized first.
 await waitForReaderBytes(page, await f.locator('#bookImg').getAttribute('src'));
 return f;
}
async function centers(page, step = 0, standalone = false) {
 await until(async () => { const f = standalone ? page : child(page); return f?.url().includes('/week11-centers.html') && await f.evaluate(step => typeof EEASectionState === 'function' && EEASectionState().step === step, step); }, 'Tuesday Centers ' + step);
 const f = standalone ? page : child(page); assert.equal(page.frames().length, standalone ? 1 : 2);
 assert.deepEqual(await f.evaluate(() => EEACentersPlan), plan);
 assert.deepEqual(await f.locator('script[src]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('src'))),['week11-centers-monday-plan-v1.js','week11-centers-tuesday-plan-v1.js','week11-centers-v2.js']);
 assert.deepEqual(await f.evaluate(() => EEASectionState()), {step, index: step, total: 2, atStart: step === 0, atEnd: step === 1});
 for (const [url, day] of [[page.url(), standalone ? 'Tuesday' : '1'], [f.url(), 'Tuesday']]) { const p = new URL(url).searchParams; assert.equal(p.get('week'), '11'); assert.equal(p.get('day'), day); assert.equal(p.get('section'), '1'); assert.equal(p.get('step'), String(step)); for (const k of ['book','stop','center','review']) assert(!p.has(k), 'No leaked ' + k); }
 if (!standalone) assert.deepEqual(await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('eea-lesson-resume')); return [s.week,s.day,s.section]; }), [11,1,1]);
 // Includes the Monday plan loaded by Tuesday, and each newly displayed hero
 // before Back/Forward/reload/exit can dispose of its response identifier.
 await waitForCentersBytes(page, await f.locator('.lesson-img').getAttribute('src'));
 return f;
}
async function imageReady(f, expected, selector = '.lesson-img') {
 const img = f.locator(selector); await img.evaluate(async el => { await el.decode(); if (!el.naturalWidth || !el.naturalHeight) throw Error('Image must decode'); });
 assert.equal(await img.getAttribute('src'), expected.img); assert.equal(await img.getAttribute('alt'), expected.alt); assert.equal(await img.evaluate(el => getComputedStyle(el).objectFit), 'contain'); await target(img, selector);
}
function captureRuntimeBytes(page, base, expected, verified, files = consumedFiles) {
 return captureResponseBytes(page, base, expected, verified, files);
}
async function verifyCover(f, step, stop) {
 const masked=stop<step.revealAtStop, image=f.locator('#bookImg');
 assert.equal(await image.evaluate(el=>getComputedStyle(el).clipPath.replace(/\b0px\b/g,'0')),masked?'inset(0 50% 0 0)':'none','Original page 4 pixels stay covered until reveal');
 assert.equal(await f.locator('#pageCoverNote').isVisible(),masked);
 const hit=await image.evaluate(el=>{const r=el.getBoundingClientRect(),y=r.top+r.height*.4;return{left:document.elementFromPoint(r.left+r.width*.25,y)===el,right:document.elementFromPoint(r.left+r.width*.75,y)===el};});
 assert.equal(hit.left,true);assert.equal(hit.right,!masked);
 if(masked){assert(!(await f.locator('body').innerText()).includes(step.stops[1]),'Answer stays hidden before reveal');assert.match(await image.getAttribute('alt'),/page 4 is covered/i);}
 if(stop===1)assert.equal(await f.locator('#next').textContent(),'Reveal Page 4 →');
}
// Long reader traversal has its own joint session, so it cannot consume the
// browser's capped history budget before exact-count navigation regressions.
async function verifyFullReader(browser,base,viewport,out,capturesFactory) {
 const context=await browser.newContext({viewport,serviceWorkers:'allow'}),page=await context.newPage(),clean=diagnostics(page);
 const suffix=viewport.width+'x'+viewport.height,verified={},expected=Object.fromEntries(readerConsumedFiles.map(file=>[file,hash(read(file))]));
 const captures=capturesFactory?.(page,suffix+'-full-reader',readerConsumedFiles)||captureRuntimeBytes(page,base,expected,verified,readerConsumedFiles);
 const shot=async name=>{if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'week11-tuesday-'+name+'-'+suffix+'.png'),fullPage:true});}};
 try {
 // Traverse the unchanged Tuesday source plan from the actual overview card,
 // including each gated stop. Deep-link handoff regressions below remain separate.
 const tuesdayReaderPlan = readerPlan;
 assert.equal(tuesdayReaderPlan.steps.length,19);
 assert.equal(tuesdayReaderPlan.steps.filter(step=>step.bookPage).length,16);
 assert.equal(tuesdayReaderPlan.steps.reduce((n,step)=>n+step.stops.length,0),9);
 await page.goto(base+'daily-lessons.html?week=11&day=1');await overview(page);
 await page.getByRole('button',{name:'Open Read Aloud',exact:true}).click();
 let fullReader=await reader(page);await captures?.verify('week11-read-aloud-v4.js');
 assert.deepEqual(await fullReader.evaluate(()=>EEAReadAloudPlan),tuesdayReaderPlan);
 let visitedScreens=0,visitedStops=0;
 for(const [index,step] of tuesdayReaderPlan.steps.entries()) {
  fullReader=await reader(page,index);
  const state=await fullReader.evaluate(()=>EEASectionState());
  assert.equal(state.total,19);assert.equal(state.stop,0);assert.equal(state.stopPending,step.stops.length>0);
  assert.equal(await fullReader.locator('#stepTitle').textContent(),step.title);
  assert.equal(await fullReader.locator('#bookImg').getAttribute('src'),step.img);
  await captures.verify(step.img);
  await fullReader.locator('#bookImg').evaluate(async image=>{await image.decode();if(!image.naturalWidth||!image.naturalHeight)throw Error('Original reader image did not decode');});
  assert.equal(await fullReader.locator('#bookImg').evaluate(image=>getComputedStyle(image).objectFit),'contain');
  if(step.coverRightPage)await verifyCover(fullReader,step,0);
  assert.equal(await fullReader.locator('.stage').evaluate(el=>el.classList.contains('spread')),!!step.bookPage);
  for(const selector of ['#prev','#next','#backBtn'])await target(fullReader.locator(selector),'Full Tuesday reader '+step.id+' '+selector);
  for(const [stopIndex,prompt] of step.stops.entries()) {
   assert.equal(await fullReader.locator('#teachingStop').isVisible(),stopIndex>0);
   await fullReader.locator('#next').click();
   const after=await fullReader.evaluate(()=>EEASectionState());
   assert.equal(after.step,index,'A stop cannot skip its original book page');assert.equal(after.stop,stopIndex+1);
   assert.equal(after.stopPending,stopIndex+1<step.stops.length);
   assert.equal(await fullReader.locator('#stopText').textContent(),prompt);assert(await fullReader.locator('#teachingStop').isVisible());
   assert.equal(await fullReader.locator('#bookImg').getAttribute('src'),step.img);if(step.coverRightPage)await verifyCover(fullReader,step,stopIndex+1);visitedStops++;
  }
  visitedScreens++;if(index<tuesdayReaderPlan.steps.length-1)await fullReader.locator('#next').click();
 }
 assert.equal(visitedScreens,19);assert.equal(visitedStops,9);assert(await fullReader.evaluate(()=>EEASectionState().atEnd));
 assert.equal(await fullReader.locator('#next').textContent(),'Next: Centers →');
 for(const selector of ['#note','#teacherText']) {const text=await fullReader.locator(selector).textContent();assert(text.includes('Next, we’ll explore Observational Drawings and Color Walk in Centers.'));assert(!text.includes('Finish returns to Tuesday’s Day Overview'),'No stale app routing notice');}
 for(const selector of ['#prev','#next','#backBtn'])await target(fullReader.locator(selector),'Reader closing '+selector);
 await shot('full-reader-closing');await fullReader.locator('#next').click();
 let fullCenters=await centers(page);await captures?.verify('week11-centers-v2.js');await captures?.verify('week11-centers-tuesday-plan-v1.js');await imageReady(fullCenters,plan[0]);await captures?.verify(plan[0].img);
 await fullCenters.locator('#done').click();fullCenters=await centers(page,1);await imageReady(fullCenters,plan[1]);await captures.verify(plan[1].img);await fullCenters.locator('#done').click();await overview(page);
 await captures.finish();clean();
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
async function verifyRepeatedBoundaries(browser,base,viewport) {
 for(const standalone of [false,true])for(const [button,start,prior,entries] of [['done',0,1,2],['done',1,1,1],['exit',0,0,1],['exit',1,1,1]]){
  const context=await browser.newContext({viewport,serviceWorkers:'block'});
  try{
   const page=await context.newPage(),clean=diagnostics(page);await page.goto(route(base,standalone,start));let f=await centers(page,start,standalone);
   const baseline=await page.evaluate(()=>history.length);
   await f.evaluate(id=>{for(let n=0;n<5;n++)document.getElementById(id).click();},button);
   await overview(page);assert.equal(await page.evaluate(()=>history.length),baseline+entries,'Repeated '+button+' produces one boundary exit');
   assert.equal(await page.evaluate(()=>localStorage.getItem('eea-lesson-auto-resume')),null);
   await page.goBack();f=await centers(page,prior,standalone);assert.equal(await f.locator('details').evaluate(el=>el.open),false);
   await page.goForward();await overview(page);clean();
  }finally{await context.close();}
 }
}
async function verifyViewport(browser, base, viewport, out, capturesFactory) {
 await verifyFullReader(browser,base,viewport,out,capturesFactory);
 await verifyExactHistory(browser,base,viewport);
 await verifyRepeatedBoundaries(browser,base,viewport);
 const context = await browser.newContext({viewport, serviceWorkers:'allow'}), page = await context.newPage(), clean = diagnostics(page), suffix = viewport.width + 'x' + viewport.height;
 const captures = capturesFactory?.(page, suffix); const shot = async name => {if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'week11-tuesday-'+name+'-'+suffix+'.png'),fullPage:true});}};
 try {
 await page.goto(base+'daily-lessons.html?week=11&day=1'); await overview(page); assert.deepEqual(await page.locator('#path .step b').allTextContents(),['Read Aloud','Centers']); await shot('overview');
 for(const key of ['Enter','Space']) {await page.getByRole('button',{name:'Open Centers',exact:true}).press(key);let f=await centers(page);await captures?.verify('week11-centers-v2.js');await captures?.verify('week11-centers-tuesday-plan-v1.js');await imageReady(f,plan[0]);await captures?.verify(plan[0].img);await f.locator('#exit').click();await overview(page);}
 for(const standalone of [false,true]) {
 const mode=standalone?'standalone':'embedded';
 await page.goto(base+(standalone?'week11-read-aloud.html?day=Tuesday':'lesson-runner-week11.html?week=11&day=1&section=0')+'&step=18'); let f=await reader(page,18,standalone);await captures?.verify('week11-read-aloud-v4.js');assert.equal(await f.locator('#next').textContent(),'Next: Centers →');await f.locator('#next').click();await centers(page);await page.goBack();await reader(page,18,standalone);await page.goForward();await centers(page);await page.reload();await centers(page);
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
 // Keep Monday's two Centers and handoff intact while Wednesday–Friday remain bounded.
 await page.goto(base+'daily-lessons.html?week=11&day=0');await overview(page,0);assert.deepEqual(await page.locator('#path .step b').allTextContents(),['Read Aloud','Centers']);
 await page.getByRole('button',{name:'Open Centers',exact:true}).click();await until(async()=>child(page)?.url().includes('/week11-centers.html')&&await child(page).evaluate(()=>typeof EEASectionState==='function'),'Monday Centers retained');
 assert.deepEqual(await child(page).evaluate(()=>EEACentersPlan),JSON.parse(read('week11-centers-monday-plan.json')));assert.equal(await child(page).locator('.community-copy h2').textContent(),'Mixing Primary Colors');await child(page).locator('#done').click();assert.equal(await child(page).locator('.community-copy h2').textContent(),'“All Are Welcome” Clubhouse');await child(page).locator('#done').click();await overview(page,0);
 for(const day of [2,3,4]){await page.goto(base+'daily-lessons.html?week=11&day='+day);await overview(page,day);assert.equal(await page.getByRole('button',{name:'Open Centers',exact:true}).count(),0);for(const file of ['lesson-runner-week11.html','week11-centers.html']){await page.goto(base+file+'?week=11&day='+day+'&section=1&step=1');await overview(page,day);}}
 await captures?.finish();clean();console.log('PASS: Week11 Tuesday Centers real source/image/modal/geometry/handoff/history flows '+suffix);
 }catch(error){await shot('failure').catch(()=>{});throw error;}finally{await context.close();}
}
module.exports={root,read,plan,runtimeFiles,consumedFiles,readerConsumedFiles,hash,until,diagnostics,route,overview,reader,centers,imageReady,captureRuntimeBytes,verifyViewport};
