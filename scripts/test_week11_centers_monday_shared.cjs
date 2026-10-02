// Shared unmodified real-browser flows for local, prepared Windows and actual Pages.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {target} = require('./test_week10_centers_thursday_target.cjs');
const {until, diagnostics} = require('./test_week10_centers_friday_shared.cjs');
const root = path.resolve(process.env.WEEK11_MONDAY_APP_ROOT || path.join(__dirname, '../v6-test'));
const read = file => fs.readFileSync(path.join(root, file));
const plan = JSON.parse(read('week11-centers-monday-plan.json'));
const runtimeFiles = ['week11-read-aloud-v3.js', 'week11-centers-v1.js', 'week11-centers-monday-plan-v1.js'];
const consumedFiles = [...runtimeFiles, ...new Set(plan.map(p => p.img))];
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const child = page => page.frames().find(f => f.parentFrame() === page.mainFrame());
const route = (base, standalone = false, step = 0) => base + (standalone ? 'week11-centers.html?week=11&day=Monday&section=1' : 'lesson-runner-week11.html?week=11&day=0&section=1') + '&step=' + step;
async function overview(page, day = 0) {
 await until(async () => { const u = new URL(page.url()); return u.pathname.endsWith('/daily-lessons.html') && u.searchParams.get('week') === '11' && u.searchParams.get('day') === String(day) && await page.locator('#path .step').count() === (day === 0 ? 2 : day === 1 ? 1 : 0); }, 'Same-day Week11 overview');
 assert.equal(page.frames().length, 1);
}
async function reader(page, step = 0, standalone = false) {
 await until(async () => { const f = standalone ? page : child(page); return f?.url().includes('/week11-read-aloud.html') && await f.evaluate(step => typeof EEASectionState === 'function' && EEASectionState().step === step, step); }, 'Week11 reader ' + step);
 return standalone ? page : child(page);
}
async function centers(page, step = 0, standalone = false) {
 await until(async () => { const f = standalone ? page : child(page); return f?.url().includes('/week11-centers.html') && await f.evaluate(step => typeof EEASectionState === 'function' && EEASectionState().step === step, step); }, 'Monday Centers ' + step);
 const f = standalone ? page : child(page); assert.equal(page.frames().length, standalone ? 1 : 2);
 assert.deepEqual(await f.evaluate(() => EEACentersPlan), plan);
 assert.deepEqual(await f.evaluate(() => EEASectionState()), {step, index: step, total: 2, atStart: step === 0, atEnd: step === 1});
 for (const [url, day] of [[page.url(), standalone ? 'Monday' : '0'], [f.url(), 'Monday']]) { const p = new URL(url).searchParams; assert.equal(p.get('week'), '11'); assert.equal(p.get('day'), day); assert.equal(p.get('section'), '1'); assert.equal(p.get('step'), String(step)); for (const k of ['book','stop','center','review']) assert(!p.has(k), 'No leaked ' + k); }
 if (!standalone) assert.deepEqual(await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('eea-lesson-resume')); return [s.week,s.day,s.section]; }), [11,0,1]);
 return f;
}
async function imageReady(f, expected, selector = '.lesson-img') {
 const img = f.locator(selector); await img.evaluate(async el => { await el.decode(); if (!el.naturalWidth || !el.naturalHeight) throw Error('Image must decode'); });
 assert.equal(await img.getAttribute('src'), expected.img); assert.equal(await img.getAttribute('alt'), expected.alt); assert.equal(await img.evaluate(el => getComputedStyle(el).objectFit), 'contain'); await target(img, selector);
}
function captureRuntimeBytes(page, base, expected, verified) {
 const captures = new Map(); const handler = response => { const u = new URL(response.url()), file = consumedFiles.find(name => u.origin === new URL(base).origin && u.pathname === new URL(base + name).pathname); if (!file || captures.has(file)) return;
 captures.set(file, response.body().then(bytes => { const digest = hash(bytes); assert.equal(digest, expected[file], 'Browser consumes exact runtime ' + file); verified[file] = digest; return {ok:true}; }).catch(error => ({ok:false,error}))); };
 page.on('response', handler); return {async verify(file) {await until(() => captures.has(file), 'Browser response ' + file); const r = await captures.get(file); if (!r.ok) throw r.error;}, async finish() {for (const file of consumedFiles) await this.verify(file); assert.deepEqual(Object.keys(verified).sort(), [...consumedFiles].sort()); page.off('response',handler);}};
}
async function verifyViewport(browser, base, viewport, out, capturesFactory) {
 const context = await browser.newContext({viewport, serviceWorkers:'allow'}), page = await context.newPage(), clean = diagnostics(page), suffix = viewport.width + 'x' + viewport.height;
 const captures = capturesFactory?.(page, suffix); const shot = async name => {if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'week11-monday-'+name+'-'+suffix+'.png'),fullPage:true});}};
 try {
 await page.goto(base+'daily-lessons.html?week=11&day=0'); await overview(page); assert.deepEqual(await page.locator('#path .step b').allTextContents(),['Read Aloud','Centers']); await shot('overview');
 for(const key of ['Enter','Space']) {await page.getByRole('button',{name:'Open Centers',exact:true}).press(key);let f=await centers(page);await captures?.verify('week11-centers-v1.js');await captures?.verify('week11-centers-monday-plan-v1.js');await imageReady(f,plan[0]);await captures?.verify(plan[0].img);await f.locator('#exit').click();await overview(page);}
 for(const standalone of [false,true]) {
 const mode=standalone?'standalone':'embedded';
 await page.goto(base+(standalone?'week11-read-aloud.html?day=Monday':'lesson-runner-week11.html?week=11&day=0&section=0')+'&step=23'); let f=await reader(page,23,standalone);await captures?.verify('week11-read-aloud-v3.js');assert.equal(await f.locator('#next').textContent(),'Next: Centers →');await f.locator('#next').click();await centers(page);await page.goBack();await reader(page,23,standalone);await page.goForward();await centers(page);await page.reload();await centers(page);
 await page.goto(route(base,standalone)); f=await centers(page,0,standalone);const initialLength=await page.evaluate(()=>history.length);
 for(let i=0;i<2;i++) {f=await centers(page,i,standalone);const expected=plan[i];assert.equal(await f.locator('.community-copy h2').textContent(),expected.title);assert.equal(await f.locator('.lead').textContent(),expected.lead);await imageReady(f,expected);await captures?.verify(expected.img);
 for(const selector of ['#prev','#done','#exit','#count','.community-copy h2','.lead','.community-notes summary','.enlarge-image']) await target(f.locator(selector),selector);
 await shot(mode+'-page-'+i);const before=page.url(),length=await page.evaluate(()=>history.length),state=await f.evaluate(()=>EEASectionState());
 const actual=await f.locator('.community-notes-content').evaluate(el=>{const notes=[];for(const n of el.children){if(n.tagName==='H3'){if(n.textContent==='Source materials')break;notes.push([n.textContent,[]]);}else if(n.tagName==='P'&&notes.length)notes.at(-1)[1].push(n.textContent);}return notes;});assert.deepEqual(actual,expected.notes,'Every source-backed notes paragraph');
 await f.locator('summary').click();assert(await f.locator('details').evaluate(e=>e.open));await shot(mode+'-notes-'+i);const links=f.locator('.community-notes-content a');assert(await links.count()>0);assert(await links.evaluateAll(a=>a.every(e=>e.target==='_blank'&&e.relList.contains('noopener')&&e.relList.contains('noreferrer'))));for(let n=0;n<await links.count();n++){await links.nth(n).scrollIntoViewIfNeeded();await target(links.nth(n),'Source link '+n);}await shot(mode+'-sources-'+i);for(const selector of ['#prev','#done','#exit'])await target(f.locator(selector),'Notes-open '+selector);await f.locator('summary').click();
 for(const [open,close] of [['keyboard','button'],['image','Escape'],['button','backdrop']]){if(open==='keyboard'){await f.locator('.enlarge-image').focus();await page.keyboard.press('Enter');}else await f.locator(open==='image'?'.lesson-img':'.enlarge-image').click();assert(await f.locator('#image-dialog').evaluate(e=>e.open));await imageReady(f,expected,'#enlarged-image');await target(f.locator('#close-image'),'Modal Close');assert(await f.locator('#close-image').evaluate(e=>e===document.activeElement));if(open==='keyboard')await shot(mode+'-enlarged-'+i);if(close==='button')await f.locator('#close-image').click();else if(close==='Escape')await page.keyboard.press('Escape');else{const b=await f.locator('#image-dialog').boundingBox();await page.mouse.click(b.x-2,b.y+20);}assert(!await f.locator('#image-dialog').evaluate(e=>e.open));assert(await f.locator('.enlarge-image').evaluate(e=>e===document.activeElement));}
 assert.equal(page.url(),before);assert.equal(await page.evaluate(()=>history.length),length);assert.deepEqual(await f.evaluate(()=>EEASectionState()),state);
 if(i===0){await f.locator('#done').click();await centers(page,1,standalone);assert.equal(await page.evaluate(()=>history.length),initialLength+1,'One semantic action, one joint history entry');await page.goBack();await centers(page,0,standalone);await page.goForward();await centers(page,1,standalone);await page.reload();f=await centers(page,1,standalone);await f.locator('#prev').click();f=await centers(page,0,standalone);await f.locator('#done').click();}
 }
 f=await centers(page,1,standalone);await f.locator('#done').click();await overview(page);await page.goBack();await centers(page,1,standalone);await page.goForward();await overview(page);await page.reload();await overview(page);
 for(const step of [0,1]){await page.goto(route(base,standalone,step));f=await centers(page,step,standalone);await f.locator('#exit').click();await overview(page);}
 await page.goto(route(base,standalone));f=await centers(page,0,standalone);await f.locator('#prev').click();await reader(page);await child(page).locator('#backBtn').click();await overview(page);
 // Repeated synchronous action dispatch must leave exactly the expected semantic state.
 await page.goto(route(base,standalone,1));f=await centers(page,1,standalone);const before=await page.evaluate(()=>history.length);await f.evaluate(()=>{for(let n=0;n<5;n++)document.getElementById('prev').click();});await reader(page);assert.equal(await page.evaluate(()=>history.length),before+2,'Repeated boundary actions are idempotent');
 }
 await page.goto(base+'lesson-runner-week11.html?week=11&day=1&section=0&step=18&stop=99');let f=await reader(page,18);assert.equal(await f.locator('#next').textContent(),'Finish Read Aloud →');await f.locator('#next').click();await overview(page,1);
 for(const day of [1,2,3,4]){await page.goto(base+'daily-lessons.html?week=11&day='+day);await overview(page,day);assert.equal(await page.getByRole('button',{name:'Open Centers',exact:true}).count(),0);}
 await captures?.finish();clean();console.log('PASS: Week11 Monday Centers real source/image/modal/geometry/handoff/history flows '+suffix);
 }catch(error){await shot('failure').catch(()=>{});throw error;}finally{await context.close();}
}
module.exports={root,read,plan,runtimeFiles,consumedFiles,hash,until,diagnostics,route,overview,reader,centers,imageReady,captureRuntimeBytes,verifyViewport};
