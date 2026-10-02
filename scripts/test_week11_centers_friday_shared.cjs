// Real Friday browser flows shared by local/prepared Windows and live Pages.
// No substituted source, Date shim, route interception or application injection.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {target} = require('./test_week10_centers_thursday_target.cjs');
const {until, diagnostics} = require('./test_week10_centers_friday_shared.cjs');
const {centersRuntimeFiles, captureResponseBytes, waitForCentersBytes, waitForCapturedBytes} = require('./week11-centers-friday-response-capture.cjs');
const root = path.resolve(process.env.WEEK11_FRIDAY_APP_ROOT || path.join(__dirname, '../v6-test'));
const read = file => fs.readFileSync(path.join(root, file));
const plan = JSON.parse(read('week11-centers-friday-plan.json'));
const runtimeFiles = [...centersRuntimeFiles];
const scriptFiles = ['week11-centers-monday-plan-v1.js','week11-centers-tuesday-plan-v1.js','week11-centers-wednesday-plan-v1.js','week11-centers-thursday-plan-v1.js','week11-centers-friday-plan-v1.js','week11-centers-v5.js'];
const consumedFiles = [...runtimeFiles, ...new Set(plan.map(p => p.img))];
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const child = page => page.frames().find(f => f.parentFrame() === page.mainFrame());
const route = (base, standalone = false, step = 0, review = false) => base + (standalone ? 'week11-centers.html?week=11&day=Friday&section=1' : 'lesson-runner-week11.html?week=11&day=4&section=1') + '&step=' + step + (review ? '&review=1' : '');
async function overview(page, day = 4) {
 await until(async () => { const u = new URL(page.url()); return u.pathname.endsWith('/daily-lessons.html') && u.searchParams.get('week') === '11' && u.searchParams.get('day') === String(day) && await page.locator('#path .step').count() === (day < 2 ? 2 : 1); }, 'Same-day Week11 overview ' + day);
 assert.equal(page.frames().length, 1, 'Boundary exits replace the top-level runner');
 if (day >= 2) {
  assert.deepEqual(await page.locator('#path .step b').allTextContents(), ['Centers']);
  assert.equal(await page.getByRole('button', {name:'Open Read Aloud', exact:true}).count(), 0, 'No invented Wednesday–Friday reader');
  assert.equal(await page.getByRole('button', {name:'Open Centers', exact:true}).count(), 1);
  assert.equal(await page.locator('#start').isDisabled(), false);
 }
}
async function centers(page, step = 0, standalone = false, review = false) {
 await until(async () => {const f = standalone ? page : child(page);return f?.url().includes('/week11-centers.html') && await f.evaluate(({step,review}) => typeof EEASectionState === 'function' && EEASectionState().step === step && EEASectionState().review === review, {step,review});}, 'Friday Centers ' + step);
 const f = standalone ? page : child(page);
 assert.equal(page.frames().length, standalone ? 1 : 2);
 assert.deepEqual(await f.evaluate(() => EEACentersPlan), plan);
 assert.deepEqual(await f.locator('script[src]').evaluateAll(nodes => nodes.map(n => n.getAttribute('src'))), scriptFiles, 'All five weekday plans and fresh v5 runtime');
 assert.deepEqual(await f.evaluate(() => EEASectionState()), {step, index:step, total:2, atStart:step === 0, atEnd:step === 1,review});
 for (const [url, day] of [[page.url(), standalone ? 'Friday' : '4'], [f.url(), 'Friday']]) {
  const p = new URL(url).searchParams;
  assert.equal(p.get('week'), '11');assert.equal(p.get('day'), day);assert.equal(p.get('section'), '1');assert.equal(p.get('step'), String(step));
  assert.equal(p.get('review'), review ? '1' : null);
  for (const k of ['book','stop','center']) assert(!p.has(k), 'No leaked ' + k);
 }
 if (!standalone) assert.deepEqual(await page.evaluate(() => {const s = JSON.parse(localStorage.getItem('eea-lesson-resume'));return [s.week,s.day,s.section];}), [11,4,1]);
 // Hash the first consumed response for every loaded plan/runtime and this
 // displayed hero before Back/Forward/reload/exit can destroy its CDP body.
 // With no capture active, readiness intentionally does not await cold images.
 await waitForCentersBytes(page, await f.locator('.lesson-img').getAttribute('src'));
 return f;
}
async function imageReady(f, expected, selector = '.lesson-img') {
 const img = f.locator(selector);
 await img.evaluate(async el => {await el.decode();if (!el.naturalWidth || !el.naturalHeight) throw Error('Image must decode');});
 assert.equal(await img.getAttribute('src'), expected.img);assert.equal(await img.getAttribute('alt'), expected.alt);
 assert.equal(await img.evaluate(el => getComputedStyle(el).objectFit), 'contain');await target(img, selector);
}
function captureRuntimeBytes(page, base, expected, verified, files = consumedFiles) {return captureResponseBytes(page, base, expected, verified, files);}
async function verifyModalKeyboard(page, f, expectedUrl, expectedLength, expectedState) {
 const trace = [];
 const inspect = async key => {
  const focus = await f.evaluate(() => {
   const dialog = document.getElementById('image-dialog'), active = document.activeElement, topDocument = window.top.document, topActive = topDocument.activeElement;
   const describe = el => el ? {tag:el.tagName,id:el.id || '',className:typeof el.className === 'string' ? el.className : ''} : null;
   const safe = active === document.body || active === document.documentElement || dialog.contains(active);
   const topSafe = topDocument === document ? safe : topActive === window.frameElement || topActive === topDocument.body || topActive === topDocument.documentElement;
   return {open:dialog.open,modal:dialog.matches(':modal'),active:describe(active),topActive:describe(topActive),hasFocus:document.hasFocus(),safe,topSafe,closeFocused:active === document.getElementById('close-image') && document.hasFocus()};
  });
  trace.push({key,...focus});
  const diagnostic = JSON.stringify(trace);
  assert(focus.open && focus.modal, 'Native image modal stays open during keyboard traversal: ' + diagnostic);
  assert(focus.safe && focus.topSafe, 'No background app control receives focus during modal traversal: ' + diagnostic);
  assert.equal(page.url(), expectedUrl, 'Modal traversal does not navigate: ' + diagnostic);
  assert.equal(await page.evaluate(() => history.length), expectedLength, 'Modal traversal does not append history: ' + diagnostic);
  assert.deepEqual(await f.evaluate(() => EEASectionState()), expectedState, 'Modal traversal preserves lesson state: ' + diagnostic);
  return focus;
 };
 assert((await inspect('initial')).closeFocused, 'Modal initially focuses Close: ' + JSON.stringify(trace));
 // Native sequential focus may visit user-agent controls and climb out of an
 // iframe. Only the modal document background must stay inert; one reverse
 // keypress is not a portable browser-chrome round trip. HTML standard:
 // https://html.spec.whatwg.org/multipage/interaction.html#sequential-focus-navigation
 // https://html.spec.whatwg.org/multipage/interaction.html#modal-dialogs-and-inert-subtrees
 await page.keyboard.press('Tab');await inspect('Tab');
 let returned = false;
 for (let attempt = 0; attempt < 8; attempt++) {
  await page.keyboard.press('Shift+Tab');
  if ((await inspect('Shift+Tab ' + (attempt + 1))).closeFocused) {returned = true;break;}
 }
 assert(returned, 'Close remains keyboard-reachable after native forward/reverse traversal, without a focus() reset: ' + JSON.stringify(trace));
}
async function verifyNotesAndDialog(page, f, expected, shot, name) {
 const before = page.url(), length = await page.evaluate(() => history.length), state = await f.evaluate(() => EEASectionState());
 assert.equal(await f.locator('details').evaluate(e => e.open), false, 'Teacher notes initially collapsed');
 const actual = await f.locator('.community-notes-content').evaluate(el => {
  const notes = [];for (const n of el.children) {if (n.tagName === 'H3') {if (n.textContent === 'Source materials') break;notes.push([n.textContent, []]);} else if (n.tagName === 'P' && notes.length) notes.at(-1)[1].push(n.textContent);}return notes;
 });
 assert.deepEqual(actual, expected.notes, 'Every source-backed notes heading and paragraph');
 const links = f.locator('.community-notes-content a');
 assert.deepEqual(await links.evaluateAll(nodes => nodes.map(n => [n.textContent,n.getAttribute('href')])), [['Original Week 3 lesson',expected.source],...(expected.sources || []).map(s => [s.label,s.url])], 'Exact source labels and destinations');
 assert(await links.evaluateAll(nodes => nodes.every(n => n.target === '_blank' && n.relList.contains('noopener') && n.relList.contains('noreferrer'))));
 await f.locator('summary').press('Enter');assert(await f.locator('details').evaluate(e => e.open));await shot(name + '-notes');
 for (let n = 0; n < await links.count(); n++) {await links.nth(n).scrollIntoViewIfNeeded();await target(links.nth(n), 'Source link ' + n);}
 await shot(name + '-sources');for (const selector of ['#prev','#done','#exit']) await target(f.locator(selector), 'Notes-open ' + selector);
 await f.locator('summary').press('Space');assert.equal(await f.locator('details').evaluate(e => e.open), false);
 for (const [open,close] of [['Enter','button'],['Space','Escape'],['image','Escape'],['button','backdrop']]) {
  if (open === 'Enter' || open === 'Space') {await f.locator('.enlarge-image').focus();await page.keyboard.press(open);} else await f.locator(open === 'image' ? '.lesson-img' : '.enlarge-image').click();
  assert(await f.locator('#image-dialog').evaluate(e => e.open));await imageReady(f, expected, '#enlarged-image');await target(f.locator('#close-image'), 'Modal Close');
  assert(await f.locator('#close-image').evaluate(e => e === document.activeElement), 'Modal focuses Close');
  await verifyModalKeyboard(page,f,before,length,state);
  if (open === 'Enter') await shot(name + '-enlarged');
  if (close === 'button') await f.locator('#close-image').click();else if (close === 'Escape') await page.keyboard.press('Escape');else {const b = await f.locator('#image-dialog').boundingBox();await page.mouse.click(b.x - 2,b.y + 20);}
  assert.equal(await f.locator('#image-dialog').evaluate(e => e.open), false);
  assert(await f.locator('.enlarge-image').evaluate(e => e === document.activeElement), 'Dismissal returns focus to Enlarge image');
 }
 assert.equal(page.url(), before);assert.equal(await page.evaluate(() => history.length), length);assert.deepEqual(await f.evaluate(() => EEASectionState()), state);
}
async function saveFailure(page, out, name, viewport) {
 if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'week11-friday-'+name+'-failure-'+viewport.width+'x'+viewport.height+'.png'),fullPage:true}).catch(()=>{});}
}
// This wrapper is used before every document/history navigation while capture is
// active, including before closing a context. A first body error stays fatal.
async function navigate(page, action) {await waitForCapturedBytes(page);return action();}
function ownCapture(page,base,steps=[0,1]) {
 const files=[...runtimeFiles,...new Set(steps.map(i=>plan[i].img))], expected=Object.fromEntries(files.map(file=>[file,hash(read(file))]));
 return captureRuntimeBytes(page,base,expected,{},files);
}
async function card(f,step,review=false) {
 const p=plan[step];
 assert.equal(await f.locator('.community-copy h2').textContent(),review?p.originalTitle:p.title);
 assert.equal(await f.locator('.lead').textContent(),review?p.originalLead:p.lead);
 assert.equal(await f.locator('#count').textContent(),(review?'Review · ':'')+(step+1)+' of 2');
 assert.equal(await f.locator('#sub').textContent(),'Friday · '+p.center+' · '+(review?'Original introduction':'Revisit'));
 assert.equal(await f.locator('#review-original').textContent(),review?'Return to revisit':'Review original introduction');
 assert.equal(await f.locator('.community-card').count(),1);
 assert.equal(await f.locator('iframe,select,#activityMenu').count(),0);
 assert.equal(await f.locator('#prev').textContent(),step===0?'← Day Overview':'← Previous');
 assert.equal(await f.locator('#done').textContent(),step===0?'Next: Exploring Emotions →':'Finish Centers →');
 await imageReady(f,p);
 for(const selector of ['#prev','#done','#exit','#count','.community-copy h2','.lead','.community-notes summary','.enlarge-image','#review-original']) await target(f.locator(selector),selector+(review?' original':' revisit'));
}
async function verifyExactHistory(browser,base,viewport,out) {
 for(const standalone of [false,true]) {
  const context=await browser.newContext({viewport,serviceWorkers:'block'});
  try {
   const page=await context.newPage(),clean=diagnostics(page),capture=ownCapture(page,base);
   try {
    await navigate(page,()=>page.goto(route(base,standalone)));let f=await centers(page,0,standalone);const baseline=await page.evaluate(()=>history.length);
    assert(baseline<5,'Fresh history below browser cap');
    await f.locator('#review-original').press('Enter');f=await centers(page,0,standalone,true);await card(f,0,true);
    assert.equal(await page.evaluate(()=>history.length),baseline+1,'Review creates one same-step history entry');
    assert(await f.locator('#review-original').evaluate(e=>e===document.activeElement),'Review keeps keyboard focus');
    await f.locator('summary').press('Enter');await f.locator('.enlarge-image').click();assert(await f.locator('#image-dialog').evaluate(e=>e.open));
    await navigate(page,()=>page.goBack());f=await centers(page,0,standalone,false);assert.equal(await f.locator('#image-dialog').evaluate(e=>e.open),false,'Back interrupts image review');assert.equal(await f.locator('details').evaluate(e=>e.open),false);
    await navigate(page,()=>page.goForward());f=await centers(page,0,standalone,true);await navigate(page,()=>page.reload());f=await centers(page,0,standalone,true);await card(f,0,true);
    assert.equal(await page.evaluate(()=>history.length),baseline+1,'Review reload adds no semantic entry');
    await f.locator('#done').click();f=await centers(page,1,standalone);assert.equal(await page.evaluate(()=>history.length),baseline+2,'Next from review enters second revisit directly');
    await navigate(page,()=>page.goBack());await centers(page,0,standalone,true);await navigate(page,()=>page.goForward());f=await centers(page,1,standalone);
    await f.locator('#review-original').press('Space');f=await centers(page,1,standalone,true);await navigate(page,()=>page.reload());f=await centers(page,1,standalone,true);await card(f,1,true);
    assert.equal(await page.evaluate(()=>history.length),baseline+3);
    await f.locator('#prev').click();f=await centers(page,0,standalone,false);assert.equal(await page.evaluate(()=>history.length),baseline+4,'Previous from original returns to preceding revisit');
    await navigate(page,()=>page.goBack());f=await centers(page,1,standalone,true);await navigate(page,()=>page.goForward());f=await centers(page,0,standalone);
    // Repeated real button presses must keep the same card and one entry each.
    for(let n=0;n<6;n++){await f.locator('#review-original').press(n%2?'Space':'Enter');f=await centers(page,0,standalone,n%2===0);assert(await f.locator('#review-original').evaluate(e=>e===document.activeElement));assert.equal(await page.evaluate(()=>history.length),baseline+5+n);}
    await navigate(page,()=>f.locator('#prev').click());await overview(page);assert.equal(await page.evaluate(()=>history.length),baseline+11,'First Previous exits once');
    await navigate(page,()=>page.goBack());await centers(page,0,standalone);await navigate(page,()=>page.goForward());await overview(page);
    await capture.finish();clean();
   } catch(error){await saveFailure(page,out,'history-'+(standalone?'direct':'runner'),viewport);throw error;}
  } finally {await context.close();}
 }
}
async function verifyRepeatedBoundaries(browser,base,viewport,out) {
 for(const standalone of [false,true]) for(const review of [false,true]) for(const [button,start,prior,entries] of [['prev',0,0,1],['prev',1,0,2],['done',0,1,2],['done',1,1,1],['exit',0,0,1],['exit',1,1,1]]) {
  const context=await browser.newContext({viewport,serviceWorkers:'block'});
  try {
   const page=await context.newPage(),clean=diagnostics(page),capture=ownCapture(page,base,[start,prior]);
   try {
    await navigate(page,()=>page.goto(route(base,standalone,start,review)));const f=await centers(page,start,standalone,review),baseline=await page.evaluate(()=>history.length);
    // Internal transitions below stay in the same document. Warm and verify the
    // next hero before synchronous repeated clicks can immediately exit it.
    if(start!==prior){await f.locator('#'+button).click();await centers(page,prior,standalone);await navigate(page,()=>page.goBack());await centers(page,start,standalone,review);}
    await navigate(page,()=>f.evaluate(id=>{for(let n=0;n<5;n++)document.getElementById(id).click();},button));await overview(page);
    assert.equal(await page.evaluate(()=>history.length),baseline+entries,'Repeated '+button+' exits once, including review mode');
    assert.equal(await page.evaluate(()=>localStorage.getItem('eea-lesson-auto-resume')),null);
    await navigate(page,()=>page.goBack());const priorReview=start===prior?review:false,restored=await centers(page,prior,standalone,priorReview);assert.equal(await restored.locator('details').evaluate(e=>e.open),false);
    await navigate(page,()=>page.goForward());await overview(page);await navigate(page,()=>page.reload());await overview(page);await capture.finish();clean();
   } catch(error){await saveFailure(page,out,'boundary-'+button+'-'+start+'-'+review+'-'+standalone,viewport);throw error;}
  } finally {await context.close();}
 }
}
async function verifyMalformedAndUnavailable(browser,base,viewport,out) {
 const context=await browser.newContext({viewport,serviceWorkers:'block'});
 try {
  const page=await context.newPage(),clean=diagnostics(page),capture=ownCapture(page,base);
  try {
   for(const standalone of [false,true]) {
    for(const [step,normalized] of [['-4',0],['garbage',0],['1.5',0],['Infinity',0],['999999',1],['',0]])for(const review of ['','0','1','true','garbage','2']) {
     await navigate(page,()=>page.goto(route(base,standalone,step)+'&book=stale&stop=8&center=stale&review='+review));await centers(page,normalized,standalone,review==='1');
     await navigate(page,()=>page.reload());await centers(page,normalized,standalone,review==='1');
    }
    for(const day of ['Friday','4']) {
     const file=standalone?'week11-centers.html':'lesson-runner-week11.html';
     await navigate(page,()=>page.goto(base+file+'?week=11&day='+day+'&section=1&step=1&review=1'));await centers(page,1,standalone,true);
     for(const section of ['0','-1','7','garbage','1.5']){await navigate(page,()=>page.goto(base+file+'?week=11&day='+day+'&section='+section+'&step=1&review=1'));await overview(page);}
    }
   }
   for(const day of ['Friday','4'])for(const file of ['week11-read-aloud.html','lesson-runner-week11.html']){await navigate(page,()=>page.goto(base+file+'?week=11&day='+day+'&section=0&step=18&review=1'));await overview(page);}
   // No clock shim: an invalid day uses the browser's real current weekday for
   // its guarded overview, but must never silently launch a lesson.
   const today=await page.evaluate(()=>{const d=new Date().getDay();return d===0||d===6?4:d-1;});
   for(const file of ['week11-centers.html','lesson-runner-week11.html'])for(const query of ['', 'day=', 'day=bad', 'day=-1', 'day=1.5','day=Infinity','day=5']){await navigate(page,()=>page.goto(base+file+'?week=11&section=1&'+query));await overview(page,today);}
   await capture.finish();clean();
  }catch(error){await saveFailure(page,out,'malformed-guarded',viewport);throw error;}
 }finally{await context.close();}
}
async function verifyRetainedDays(page,base) {
 for(const [day,name] of [[0,'monday'],[1,'tuesday'],[2,'wednesday'],[3,'thursday']]) {
  await navigate(page,()=>page.goto(base+'daily-lessons.html?week=11&day='+day));await overview(page,day);
  assert.deepEqual(await page.locator('#path .step b').allTextContents(),day>=2?['Centers']:['Read Aloud','Centers']);
  await navigate(page,()=>page.getByRole('button',{name:'Open Centers',exact:true}).click());
  await until(async()=>child(page)?.url().includes('/week11-centers.html')&&await child(page).evaluate(()=>typeof EEASectionState==='function'),name+' Centers retained');
  const f=child(page),earlier=JSON.parse(read('week11-centers-'+name+'-plan.json'));assert.deepEqual(await f.evaluate(()=>EEACentersPlan),earlier);
  for(let i=0;i<earlier.length;i++){
   assert.deepEqual(await f.evaluate(()=>EEASectionState()),{step:i,index:i,total:2,atStart:i===0,atEnd:i===1});assert.equal(await f.locator('#review-original').count(),0);
   assert.equal(await f.locator('.community-copy h2').textContent(),earlier[i].title);await imageReady(f,earlier[i]);await navigate(page,()=>f.locator('#done').click());
  }
  await overview(page,day);if(day>=2)continue;
  await navigate(page,()=>page.getByRole('button',{name:'Open Read Aloud',exact:true}).click());await until(async()=>child(page)?.url().includes('/week11-read-aloud.html')&&await child(page).evaluate(()=>typeof EEASectionState==='function'),name+' reader retained');
  assert.equal(await child(page).evaluate(()=>EEAReadAloudPlan.day),name==='monday'?'Monday':'Tuesday');await navigate(page,()=>child(page).locator('#backBtn').click());await overview(page,day);
 }
}
async function verifyViewport(browser,base,viewport,out,capturesFactory) {
 await verifyExactHistory(browser,base,viewport,out);await verifyRepeatedBoundaries(browser,base,viewport,out);await verifyMalformedAndUnavailable(browser,base,viewport,out);
 const context=await browser.newContext({viewport,serviceWorkers:'allow'}),page=await context.newPage(),clean=diagnostics(page),suffix=viewport.width+'x'+viewport.height;
 const expected=Object.fromEntries(consumedFiles.map(file=>[file,hash(read(file))])),verified={},captures=capturesFactory?.(page,suffix)||captureRuntimeBytes(page,base,expected,verified);
 const shot=async name=>{if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'week11-friday-'+name+'-'+suffix+'.png'),fullPage:true});}};
 try {
  assert.deepEqual(plan.map(p=>p.title),['Revisit All Are Welcome Clubhouse','Revisit Exploring Emotions']);
  assert.deepEqual(plan.map(p=>p.img),['assets/focus-3s/unit-2/week-2/strictly-no-elephants/slide-14.jpg','assets/focus-3s/unit-2/week-1/wednesday/reflect-on-acting.jpg']);
  await navigate(page,()=>page.goto(base+'daily-lessons.html?week=11&day=4'));await overview(page);await target(page.getByRole('button',{name:'Open Centers',exact:true}),'Friday Centers card');await target(page.locator('#start'),'Friday Start');await shot('overview');
  for(const key of ['Enter','Space']){await navigate(page,()=>page.getByRole('button',{name:'Open Centers',exact:true}).press(key));const f=await centers(page);await imageReady(f,plan[0]);await navigate(page,()=>f.locator('#exit').click());await overview(page);}
  await navigate(page,()=>page.locator('#start').click());const start=await centers(page);await navigate(page,()=>start.locator('#exit').click());await overview(page);
  for(const standalone of [false,true]) {
   const mode=standalone?'direct':'runner';await navigate(page,()=>page.goto(route(base,standalone)));
   for(let i=0;i<2;i++) {
    let f=await centers(page,i,standalone);await card(f,i);await shot(mode+'-revisit-'+i);await verifyNotesAndDialog(page,f,plan[i],shot,mode+'-revisit-'+i);
    await f.locator('#review-original').press('Enter');f=await centers(page,i,standalone,true);await card(f,i,true);await shot(mode+'-original-'+i);await verifyNotesAndDialog(page,f,plan[i],shot,mode+'-original-'+i);
    await f.locator('#review-original').press('Space');f=await centers(page,i,standalone);await card(f,i);await navigate(page,()=>f.locator('#done').press('Enter'));
   }
   await overview(page);await navigate(page,()=>page.goBack());await centers(page,1,standalone);await navigate(page,()=>page.goForward());await overview(page);await navigate(page,()=>page.reload());await overview(page);
   for(const review of [false,true])for(const step of [0,1]){await navigate(page,()=>page.goto(route(base,standalone,step,review)));const f=await centers(page,step,standalone,review);await navigate(page,()=>f.locator('#exit').click());await overview(page);}
  }
  await captures.finish();await verifyRetainedDays(page,base);clean();
  console.log('PASS: Friday brief/original cards, complete notes/sources, modal keyboard/focus/geometry, review interruption/repetition/history/reload, same-day routes/boundaries, guarded reader and retained days '+suffix);
 }catch(error){await shot('failure').catch(()=>{});throw error;}finally{await context.close();}
}
module.exports={root,read,plan,runtimeFiles,scriptFiles,consumedFiles,hash,until,diagnostics,child,route,overview,centers,imageReady,captureRuntimeBytes,navigate,verifyViewport};
