// Real Thursday browser flows shared by local/prepared Windows and live Pages.
// No substituted source, Date shim, route interception or application injection.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {target} = require('./test_week10_centers_thursday_target.cjs');
const {until, diagnostics} = require('./test_week10_centers_friday_shared.cjs');
const {centersRuntimeFiles, captureResponseBytes, waitForCentersBytes} = require('./week11-centers-thursday-response-capture.cjs');
const root = path.resolve(process.env.WEEK11_THURSDAY_APP_ROOT || path.join(__dirname, '../v6-test'));
const read = file => fs.readFileSync(path.join(root, file));
const plan = JSON.parse(read('week11-centers-thursday-plan.json'));
const runtimeFiles = [...centersRuntimeFiles];
const scriptFiles = ['week11-centers-monday-plan-v1.js','week11-centers-tuesday-plan-v1.js','week11-centers-wednesday-plan-v1.js','week11-centers-thursday-plan-v1.js','week11-centers-friday-plan-v1.js','week11-centers-v5.js'];
const consumedFiles = [...runtimeFiles, ...new Set(plan.map(p => p.img))];
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const child = page => page.frames().find(f => f.parentFrame() === page.mainFrame());
const route = (base, standalone = false, step = 0) => base + (standalone ? 'week11-centers.html?week=11&day=Thursday&section=1' : 'lesson-runner-week11.html?week=11&day=3&section=1') + '&step=' + step;
async function overview(page, day = 3) {
 await until(async () => { const u = new URL(page.url()); return u.pathname.endsWith('/daily-lessons.html') && u.searchParams.get('week') === '11' && u.searchParams.get('day') === String(day) && await page.locator('#path .step').count() === (day < 2 ? 3 : 2); }, 'Same-day Week11 overview ' + day);
 assert.equal(page.frames().length, 1, 'Boundary exits replace the top-level runner');
 if (day >= 2) {
  assert.deepEqual(await page.locator('#path .step b').allTextContents(), ['Community Meeting','Centers']);
  assert.equal(await page.getByRole('button', {name:'Open Read Aloud', exact:true}).count(), 0, 'No invented Wednesday–Friday reader');
  assert.equal(await page.getByRole('button', {name:'Open Centers', exact:true}).count(), 1);
  assert.equal(await page.locator('#start').isDisabled(), false);
 }
}
async function centers(page, step = 0, standalone = false) {
 await until(async () => {const f = standalone ? page : child(page);return f?.url().includes('/week11-centers.html') && await f.evaluate(step => typeof EEASectionState === 'function' && EEASectionState().step === step, step);}, 'Thursday Centers ' + step);
 const f = standalone ? page : child(page);
 assert.equal(page.frames().length, standalone ? 1 : 2);
 assert.deepEqual(await f.evaluate(() => EEACentersPlan), plan);
 assert.deepEqual(await f.locator('script[src]').evaluateAll(nodes => nodes.map(n => n.getAttribute('src'))), scriptFiles, 'All five weekday plans and fresh v5 runtime');
 assert.deepEqual(await f.evaluate(() => EEASectionState()), {step, index:step, total:2, atStart:step === 0, atEnd:step === 1});
 for (const [url, day] of [[page.url(), standalone ? 'Thursday' : '3'], [f.url(), 'Thursday']]) {
  const p = new URL(url).searchParams;
  assert.equal(p.get('week'), '11');assert.equal(p.get('day'), day);assert.equal(p.get('section'), '1');assert.equal(p.get('step'), String(step));
  for (const k of ['book','stop','center','review']) assert(!p.has(k), 'No leaked ' + k);
 }
 if (!standalone) assert.deepEqual(await page.evaluate(() => {const s = JSON.parse(localStorage.getItem('eea-lesson-resume'));return [s.week,s.day,s.section];}), [11,3,1]);
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
 if (out) {fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'week11-thursday-' + name + '-failure-' + viewport.width + 'x' + viewport.height + '.png'),fullPage:true}).catch(() => {});}
}
async function verifyExactHistory(browser, base, viewport, out) {
 for (const standalone of [false,true]) {
  const context = await browser.newContext({viewport,serviceWorkers:'block'});
  try {
   const page = await context.newPage(), clean = diagnostics(page);
   try {
   await page.goto(route(base,standalone));let f = await centers(page,0,standalone);
   const baseline = await page.evaluate(() => history.length);assert(baseline < 5, 'Fresh history below Chromium cap');
   await f.locator('#done').click();await centers(page,1,standalone);
   assert.equal(await page.evaluate(() => history.length), baseline + 1, 'One action, one joint history entry');
   await page.goBack();f = await centers(page,0,standalone);assert.equal(await f.locator('details').evaluate(e => e.open), false);
   await page.goForward();await centers(page,1,standalone);await page.reload();f = await centers(page,1,standalone);
   assert.equal(await page.evaluate(() => history.length), baseline + 1, 'Reload adds no semantic history');
   await f.locator('#prev').click();f = await centers(page,0,standalone);assert.equal(await page.evaluate(() => history.length), baseline + 2);
   await f.locator('#prev').click();await overview(page);assert.equal(await page.evaluate(() => history.length), baseline + 3, 'First Previous exits to overview once');
   await page.goBack();await centers(page,0,standalone);await page.goForward();await overview(page);clean();
   } catch (error) {await saveFailure(page,out,'history-' + (standalone ? 'standalone' : 'embedded'),viewport);throw error;}
  } finally {await context.close();}
 }
}
async function verifyRepeatedBoundaries(browser, base, viewport, out) {
 for (const standalone of [false,true]) for (const [button,start,prior,entries] of [['prev',0,0,1],['prev',1,0,2],['done',0,1,2],['done',1,1,1],['exit',0,0,1],['exit',1,1,1]]) {
  const context = await browser.newContext({viewport,serviceWorkers:'block'});
  try {
   const page = await context.newPage(), clean = diagnostics(page);try {await page.goto(route(base,standalone,start));const f = await centers(page,start,standalone);
   const baseline = await page.evaluate(() => history.length);
   await f.evaluate(id => {for (let n = 0;n < 5;n++) document.getElementById(id).click();},button);
   await overview(page);assert.equal(await page.evaluate(() => history.length), baseline + entries, 'Repeated ' + button + ' dispatch produces one boundary exit');
   assert.equal(await page.evaluate(() => localStorage.getItem('eea-lesson-auto-resume')), null);
   await page.goBack();const restored = await centers(page,prior,standalone);assert.equal(await restored.locator('details').evaluate(e => e.open), false);
   await page.goForward();await overview(page);await page.reload();await overview(page);clean();
   } catch (error) {await saveFailure(page,out,'repeated-' + button + '-' + start + '-' + (standalone ? 'standalone' : 'embedded'),viewport);throw error;}
  } finally {await context.close();}
 }
}
async function verifyMalformedAndUnavailable(browser, base, viewport, out) {
 const context = await browser.newContext({viewport,serviceWorkers:'block'});
 try {
  const page = await context.newPage(), clean = diagnostics(page);try {
  for (const standalone of [false,true]) {
   for (const [step,normalized] of [['-4',0],['garbage',0],['1.5',0],['Infinity',0],['999999',1],['',0]]) {
    await page.goto(route(base,standalone,step) + '&book=stale&stop=8&center=stale&review=1');await centers(page,normalized,standalone);
    await page.reload();await centers(page,normalized,standalone);
   }
   for (const day of ['Thursday','3']) {
    const file = standalone ? 'week11-centers.html' : 'lesson-runner-week11.html';
    await page.goto(base + file + '?week=11&day=' + day + '&section=1&step=1');await centers(page,1,standalone);
    for (const section of ['0','-1','7','garbage','1.5']) {await page.goto(base + file + '?week=11&day=' + day + '&section=' + section + '&step=1');await overview(page);}
   }
  }
  // A Thursday reader is unavailable both directly and through the runner.
  for (const file of ['week11-read-aloud.html','lesson-runner-week11.html']) {await page.goto(base + file + '?week=11&day=Thursday&section=0&step=18');await overview(page);}
  for (const day of [4]) {
   await page.goto(base + 'daily-lessons.html?week=11&day=' + day);await overview(page,day);
   assert.equal(await page.locator('#start').isDisabled(), false);
   assert.equal(await page.getByRole('button',{name:'Open Centers',exact:true}).count(), 1);
   assert.equal(await page.getByRole('button',{name:'Open Read Aloud',exact:true}).count(), 0);
   for (const file of ['week11-centers.html','week11-read-aloud.html','lesson-runner-week11.html']) {await page.goto(base + file + '?week=11&day=' + day + '&section=0&step=1');await overview(page,day);}
  }
  clean();
  } catch (error) {await saveFailure(page,out,'malformed-unavailable',viewport);throw error;}
 } finally {await context.close();}
}
async function verifyRetainedDays(page, base) {
 for (const [day,name] of [[0,'monday'],[1,'tuesday'],[2,'wednesday']]) {
  await page.goto(base + 'daily-lessons.html?week=11&day=' + day);await overview(page,day);
  assert.deepEqual(await page.locator('#path .step b').allTextContents(), day === 2 ? ['Community Meeting','Centers'] : ['Community Meeting','Read Aloud','Centers']);
  await page.getByRole('button',{name:'Open Centers',exact:true}).click();
  await until(async () => child(page)?.url().includes('/week11-centers.html') && await child(page).evaluate(() => typeof EEASectionState === 'function'), name + ' Centers retained');
  let f = child(page);const earlier = JSON.parse(read('week11-centers-' + name + '-plan.json'));
  assert.deepEqual(await f.evaluate(() => EEACentersPlan), earlier);
  for (let i = 0;i < earlier.length;i++) {assert.equal(await f.locator('.community-copy h2').textContent(), earlier[i].title);await imageReady(f,earlier[i]);await f.locator('#done').click();}
  await overview(page,day);
  if (day === 2) continue;
  await page.getByRole('button',{name:'Open Read Aloud',exact:true}).click();
  await until(async () => child(page)?.url().includes('/week11-read-aloud.html') && await child(page).evaluate(() => typeof EEASectionState === 'function'), name + ' reader retained');
  assert.equal(await child(page).evaluate(() => EEAReadAloudPlan.day), name === 'monday' ? 'Monday' : 'Tuesday');
  await child(page).locator('#backBtn').click();await overview(page,day);
 }
}
async function verifyViewport(browser, base, viewport, out, capturesFactory) {
 await verifyExactHistory(browser,base,viewport,out);await verifyRepeatedBoundaries(browser,base,viewport,out);await verifyMalformedAndUnavailable(browser,base,viewport,out);
 const context = await browser.newContext({viewport,serviceWorkers:'allow'}), page = await context.newPage(), clean = diagnostics(page), suffix = viewport.width + 'x' + viewport.height;
 const expected = Object.fromEntries(consumedFiles.map(file => [file,hash(read(file))])), verified = {};
 const captures = capturesFactory?.(page,suffix) || captureRuntimeBytes(page,base,expected,verified);
 const shot = async name => {if (out) {fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'week11-thursday-' + name + '-' + suffix + '.png'),fullPage:true});}};
 try {
  assert.deepEqual(plan.map(p => p.title), ['Building Treehouses','Color Party Invitations']);
  assert.deepEqual(plan.map(p => p.img), ['assets/focus-3s/unit-2/week-2/strictly-no-elephants/slide-13.jpg','assets/focus-3s/unit-1/week-8/centers/decorate-an-invitation.png']);
  await page.goto(base + 'daily-lessons.html?week=11&day=3');await overview(page);await target(page.getByRole('button',{name:'Open Centers',exact:true}),'Thursday Centers card');await target(page.locator('#start'),'Thursday Start');await shot('overview');
  for (const key of ['Enter','Space']) {await page.getByRole('button',{name:'Open Centers',exact:true}).press(key);let f = await centers(page);await imageReady(f,plan[0]);await f.locator('#exit').click();await overview(page);}
  // Start must use section 1 even when it is the only visible card (index 0).
  await page.locator('#start').click();let start = await centers(page);await start.locator('#exit').click();await overview(page);
  for (const standalone of [false,true]) {
   const mode = standalone ? 'standalone' : 'embedded';await page.goto(route(base,standalone));
   for (let i = 0;i < 2;i++) {
    let f = await centers(page,i,standalone);const expected = plan[i];
    assert.equal(await f.locator('.community-copy h2').textContent(), expected.title);assert.equal(await f.locator('.lead').textContent(), expected.lead);assert.equal(await f.locator('#count').textContent(), (i + 1) + ' of 2');
    await imageReady(f,expected);
    for (const selector of ['#prev','#done','#exit','#count','.community-copy h2','.lead','.community-notes summary','.enlarge-image']) await target(f.locator(selector),selector);
    assert.match(await f.locator('#prev').textContent(), i === 0 ? /Day Overview/ : /Previous/);
    assert.equal(await f.locator('#done').textContent(), i === 0 ? 'Next: Color Party Invitations →' : 'Finish Centers →');
    await shot(mode + '-page-' + i);await verifyNotesAndDialog(page,f,expected,shot,mode + '-' + i);
    if (i === 0) {await f.locator('#done').press('Enter');await centers(page,1,standalone);await page.goBack();await centers(page,0,standalone);await page.goForward();await centers(page,1,standalone);await page.reload();f = await centers(page,1,standalone);await f.locator('#prev').click();f = await centers(page,0,standalone);await f.locator('#done').click();}
   }
   let f = await centers(page,1,standalone);await f.locator('#done').press('Space');await overview(page);await page.goBack();await centers(page,1,standalone);await page.goForward();await overview(page);await page.reload();await overview(page);
   for (const step of [0,1]) {await page.goto(route(base,standalone,step));f = await centers(page,step,standalone);await f.locator('#exit').click();await overview(page);}
   await page.goto(route(base,standalone));f = await centers(page,0,standalone);await f.locator('#prev').click();await overview(page);
  }
  await captures.finish();await verifyRetainedDays(page,base);clean();
  console.log('PASS: Week11 Thursday source/image/modal/keyboard/focus/geometry/overview/history/boundary/malformed/retained flows ' + suffix);
 } catch (error) {await shot('failure').catch(() => {});throw error;} finally {await context.close();}
}
module.exports = {root,read,plan,runtimeFiles,scriptFiles,consumedFiles,hash,until,diagnostics,child,route,overview,centers,imageReady,captureRuntimeBytes,verifyViewport};
