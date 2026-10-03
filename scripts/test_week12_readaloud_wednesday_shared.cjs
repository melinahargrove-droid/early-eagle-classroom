// Week 4 reader real-browser checks shared by local, prepared Windows and live acceptance.
// APP_ROOT points at v6-test or the prepared desktop-app/app directory.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const fixtures = require('./test_week12_readaloud_wednesday_fixtures.cjs');
const {readerRuntimeFiles, captureResponseBytes, waitForReaderBytes, waitForCapturedBytes} = require('./test_week12_readaloud_capture.cjs');
const root = path.resolve(process.env.APP_ROOT || process.env.WEEK12_READALOUD_APP_ROOT || path.join(__dirname, '../v6-test'));
const read = file => fs.readFileSync(path.join(root, file));
const plan = JSON.parse(read('week12-read-aloud-wednesday-plan.json'));
const steps = plan.steps, last = steps.length - 1;
const consumedFiles = [...readerRuntimeFiles, 'week12-read-aloud.html', ...new Set(steps.map(s => s.img))];
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const expected = Object.fromEntries([...consumedFiles,'lesson-runner-week12.html','daily-lessons.html'].map(file => [file, hash(read(file))]));
for (const file of new Set(steps.map(s=>s.img))) {const source=fixtures.images.find(i=>(i.file||'guide-'+String(i.sourceSlide).padStart(2,'0')+'.jpg')===path.basename(file));assert(source,'Independent image source '+file);assert.equal(expected[file],source.sha256,'Browser image input preserves original bytes '+file);}
const delay = ms => new Promise(r => setTimeout(r, ms));
async function until(check, label, timeout = 15000) {const end = Date.now() + timeout;let cause;while (Date.now() < end) {try {if (await check()) return;} catch (e) {cause = e;}await delay(25);}assert.fail(label + (cause ? ': ' + cause.message : ''));}
const child = page => page.frames().find(f => f.parentFrame() === page.mainFrame());
const route = (base, standalone = false, step = 0, stop = 0) => base + (standalone ? 'week12-read-aloud.html?week=12&day=Wednesday' : 'lesson-runner-week12.html?week=12&day=2') + '&section=0&step=' + step + '&stop=' + stop;
const state = (step, stop = 0) => ({step,index:step,total:steps.length,atStart:step===0,atEnd:step===last&&stop===steps[step].stops.length,stopPending:stop<steps[step].stops.length,vocabulary:!!steps[step].vocabulary,stop});
function diagnostics(page) {const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))missing.push(r.status()+' '+r.url());});return()=>{assert.deepEqual(errors,[],'No browser exceptions');assert.deepEqual(missing,[],'No missing app resources');};}
async function target(locator,label) {const g=await locator.evaluate(el=>{const r=el.getBoundingClientRect(),hit=el.ownerDocument.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{inside:r.x>=-1&&r.y>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,width:r.width,height:r.height,hit:!!hit&&(hit===el||el.contains(hit))};});assert(g.inside&&g.width>0&&g.height>0&&g.hit,label+': usable viewport target '+JSON.stringify(g));}
async function navigate(page, action) {await waitForCapturedBytes(page);return action();}
function capture(page,base,verified,files=consumedFiles) {return captureResponseBytes(page,base,expected,verified,files);}
async function reader(page, step=0, stop=0, standalone=false) {
 await until(async()=>{const f=standalone?page:child(page);return f?.url().includes('/week12-read-aloud.html')&&await f.evaluate(({step,stop})=>typeof EEASectionState==='function'&&EEASectionState().step===step&&EEASectionState().stop===stop,{step,stop});},'Week12 Wednesday '+step+':'+stop);
 const f=standalone?page:child(page);assert.equal(page.frames().length,standalone?1:2);assert.equal(await f.locator('iframe').count(),0);
 assert.deepEqual(await f.evaluate(()=>EEAReadAloudPlan),plan,'Executable and JSON plans match');assert.deepEqual(await f.evaluate(()=>EEAWeek12TuesdayReadAloudPlan),JSON.parse(read('week12-read-aloud-tuesday-plan.json')),'Fresh Tuesday v2 is consumed alongside Wednesday');assert.match(await f.evaluate(()=>EEAWeek12TuesdayReadAloudPlan.steps.at(-1).note),/Wednesday’s digital Read 3 is now available/);assert.deepEqual(await f.evaluate(()=>EEASectionState()),state(step,stop));
 assert.deepEqual(await f.locator('script[src]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('src'))),['week12-read-aloud-plan-v1.js','week12-read-aloud-tuesday-plan-v2.js','week12-read-aloud-wednesday-plan-v1.js','week12-read-aloud-v3.js']);
 for(const [url,day] of [[page.url(),standalone?'Wednesday':'2'],[f.url(),'Wednesday']]) {const p=new URL(url).searchParams;assert.equal(p.get('week'),'12');assert.equal(p.get('day'),day);assert.equal(p.get('section'),'0');assert.equal(p.get('step'),String(step));assert.equal(p.get('stop'),String(stop));for(const key of ['book','center','review'])assert(!p.has(key),'No leaked '+key);}
 if(!standalone) {assert.equal(new URL(f.url()).searchParams.get('from'),'runner');assert.deepEqual(await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('eea-lesson-resume'));return[s.week,s.day,s.section];}),[12,2,0]);}
 assert.equal(await f.locator('#bookImg').getAttribute('src'),steps[step].img);assert.equal(await f.locator('#teachingStop').isVisible(),stop>0);assert.equal(await f.locator('#stopText').textContent(),stop?steps[step].stops[stop-1]:'');
 assert.equal(stop,0,'No page-specific Read3 stop can be restored');assert.doesNotMatch(await f.locator('#next').textContent(),/Show Teaching Stop/);await waitForReaderBytes(page,steps[step].img);return f;
}
async function overview(page,day=2) {
 await until(async()=>{const u=new URL(page.url());return u.pathname.endsWith('/daily-lessons.html')&&u.searchParams.get('week')==='12'&&u.searchParams.get('day')===String(day)&&await page.locator('#days button').count()===5;},'Same-day Week12 overview '+day);
 assert.equal(page.frames().length,1,'Overview exits top-level');assert.equal(await page.locator('#path .step').count(),day<=2?1:0,'Only Monday through Wednesday verified readers are available');assert.equal(await page.locator('#start').isDisabled(),day>2);assert.match(await page.locator('#eyebrow').textContent(),/UNIT 2 · WEEK 4/);assert.equal(await page.evaluate(()=>localStorage.getItem('eea-lesson-auto-resume')),null);
}
async function imageReady(f,step,pixelEvidence) {
 const image=f.locator('#bookImg'),source=fixtures.images.find(i=>(i.file||'guide-'+String(i.sourceSlide).padStart(2,'0')+'.jpg')===path.basename(step.img));assert(source,'Pinned image '+step.img);await image.evaluate(async el=>el.decode());
 const info=await image.evaluate(el=>{const r=el.getBoundingClientRect(),style=getComputedStyle(el),canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;const c=canvas.getContext('2d');c.drawImage(el,0,0,64,64);return{width:el.naturalWidth,height:el.naturalHeight,fit:style.objectFit,clip:style.clipPath,rect:{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height,vw:innerWidth,vh:innerHeight},pixels:Array.from(c.getImageData(0,0,64,64).data)};});
 assert.deepEqual([info.width,info.height],[source.width,source.height],'Original image dimensions');assert.equal(info.fit,'contain','Uncropped image');assert.equal(info.clip,'none','No hidden source page');const r=info.rect;assert(r.width>120&&r.height>100&&r.x>=-1&&r.y>=-1&&r.right<=r.vw+1&&r.bottom<=r.vh+1,'Complete image inside viewport '+JSON.stringify(r));
 const colors=new Set();for(let i=0;i<info.pixels.length;i+=4){assert.equal(info.pixels[i+3],255,'Opaque decoded source pixels');colors.add(info.pixels.slice(i,i+3).join(','));}assert(colors.size>100,'Rendered image has actual nonblank source pixels');
 if(pixelEvidence)pixelEvidence[step.img]={sourceSha256:source.sha256,decoded64x64Sha256:hash(Buffer.from(info.pixels)),naturalWidth:info.width,naturalHeight:info.height,distinctColors:colors.size};
}
async function notes(page,f,shot) {
 const before=page.url(),length=await page.evaluate(()=>history.length),s=await f.evaluate(()=>EEASectionState());
 const details=f.locator('#teacherNotes'),summary=details.locator('summary');assert.equal(await details.evaluate(el=>el.open),false);
 const expectedLinks=[plan.source,...plan.resources.map(r=>r[1])];assert.deepEqual(await details.locator('a').evaluateAll(nodes=>nodes.map(a=>a.getAttribute('href'))),expectedLinks);assert(await details.locator('a').evaluateAll(nodes=>nodes.every(a=>a.target==='_blank'&&a.relList.contains('noopener')&&a.relList.contains('noreferrer'))));
 await summary.press('Enter');assert(await details.evaluate(el=>el.open));assert((await f.locator('#teacherText').textContent()).includes(plan.teacherNotes),'Complete teacher notes accessible');
 const blocks=await f.locator('#sourceNotes').evaluate(el=>{const result=[];for(const n of el.children){if(n.tagName==='H3')result.push({title:n.textContent,paragraphs:[]});else if(n.tagName==='P')result.at(-1).paragraphs.push(n.textContent);}return result;});assert.deepEqual(blocks,plan.sourceNotes,'Every full original lesson and differentiated note paragraph accessible');if(shot)await shot('notes');
 for(let i=0;i<await details.locator('a').count();i++){await details.locator('a').nth(i).scrollIntoViewIfNeeded();await target(details.locator('a').nth(i),'Source note link '+i);}
 if(shot)await shot('sources');await summary.scrollIntoViewIfNeeded();await summary.press('Space');assert.equal(await details.evaluate(el=>el.open),false);
 for(let n=0;n<2;n++){await summary.click();await summary.click();}
 assert.deepEqual(await f.evaluate(()=>EEASectionState()),s);assert.equal(page.url(),before);assert.equal(await page.evaluate(()=>history.length),length,'Notes add no history');
}
async function screenshot(page,out,name,evidence) {if(!out)return;fs.mkdirSync(out,{recursive:true});const file=name+'.png';const bytes=await page.screenshot({path:path.join(out,file),fullPage:true});if(evidence)evidence[file]=hash(bytes);}
async function verifyViewport(browser,base,viewport,out,evidence={}) {
 const context=await browser.newContext({viewport,serviceWorkers:'block'});let page;
 try {
  page=await context.newPage();const clean=diagnostics(page),verified={},pixels={},screenshots={},cap=capture(page,base,verified,[...consumedFiles,'lesson-runner-week12.html','daily-lessons.html']),suffix=viewport.width+'x'+viewport.height;
  await navigate(page,()=>page.goto(base+'daily-lessons.html?week=12&day=2'));await overview(page);for(const selector of ['#start','#path .step','#days button','#weeknav button']){const controls=page.locator(selector);for(let i=0;i<await controls.count();i++)await target(controls.nth(i),'Overview '+selector+'/'+i);}await screenshot(page,out,'wednesday-overview-'+suffix,screenshots);
  for(const key of ['Enter','Space']){await page.locator('#path .step').focus();await page.keyboard.press(key);let f=await reader(page);await imageReady(f,steps[0],pixels);await navigate(page,()=>f.locator('#backBtn').click());await overview(page);}
  await page.locator('#start').click();await reader(page);let stopCount=0;
  for(let i=0;i<steps.length;i++) {
   const step=steps[i],f=await reader(page,i);await imageReady(f,step,pixels);assert.equal(await f.locator('.stage').evaluate(el=>el.classList.contains('spread')),!!step.bookPage);assert.equal(await f.locator('#prompt').textContent(),step.prompt);await notes(page,f,['before-acting','choose-scenes','book-04','vocab-bloom','after-acting'].includes(step.id)?name=>screenshot(page,out,step.id+'-'+name+'-'+suffix,screenshots):undefined);
   for(const selector of ['#prev','#next','#backBtn','#teacherNotes summary'])await target(f.locator(selector),step.id+' '+selector);
   await screenshot(page,out,step.id+'-'+suffix,screenshots);
   if(step.discussionImages){const before=page.url(),length=await page.evaluate(()=>history.length),original=await f.evaluate(()=>EEASectionState()),buttons=f.locator('#discussionControls button');assert.equal(await buttons.count(),2);for(let n=0;n<2;n++){await target(buttons.nth(n),'Discussion spread '+n);await buttons.nth(n).click();const picture=step.discussionImages[n];assert.equal(await f.locator('#bookImg').getAttribute('src'),picture.img);assert.equal(await buttons.nth(n).getAttribute('aria-pressed'),'true');await imageReady(f,{...step,img:picture.img},pixels);await screenshot(page,out,step.id+'-discussion-'+n+'-'+suffix,screenshots);assert.deepEqual(await f.evaluate(()=>EEASectionState()),original);assert.equal(page.url(),before);assert.equal(await page.evaluate(()=>history.length),length);}await buttons.nth(step.sourceSlide===16?0:1).click();}
   for(let stop=1;stop<=step.stops.length;stop++){await f.locator('#next').click();await reader(page,i,stop);await imageReady(f,step,pixels);await notes(page,f);assert.equal(await f.locator('#stopText').textContent(),step.stops[stop-1]);await target(f.locator('#teachingStop'),'Complete teaching stop');assert.equal(await f.locator('#teachingStop').evaluate(el=>el.scrollHeight>el.clientHeight+1),false,'Stop text not clipped');await screenshot(page,out,step.id+'-stop-'+stop+'-'+suffix,screenshots);stopCount++;}
   if(i<last)await f.locator('#next').click();
  }
  assert.equal(stopCount,0,'Read3 has no predetermined teaching stops');assert(steps.every(s=>s.stops.length===0));assert.match(await child(page).locator('#next').textContent(),/Finish/i);assert.doesNotMatch(await child(page).locator('#next').textContent(),/Centers|Finish Today/i);
  await navigate(page,()=>child(page).locator('#next').click());await overview(page);await navigate(page,()=>page.goBack());await reader(page,last,steps[last].stops.length);await navigate(page,()=>page.goForward());await overview(page);await navigate(page,()=>page.reload());await overview(page);
  await cap.finish();clean();evidence[suffix]={verified,pixels,screenshots,steps:steps.length,stops:stopCount};console.log('PASS: '+suffix+' complete reader/stops/vocabulary, actual source pixels, every source note, exact first-consumed HTML/runtime/image bytes and completion');
 }catch(error){if(page)await screenshot(page,out,'failure-'+viewport.width+'x'+viewport.height);throw error;}finally{await context.close();}
}
// Shared with actual Pages acceptance: these use the served application and
// native navigation only; no fixture, route interception or injected runtime.
async function nativeHistories(browser,base,evidence={}) {
 const counts={};
 for(const standalone of [false,true]) {
  const context=await browser.newContext({viewport:{width:1366,height:768},serviceWorkers:'block'});
  try {
   const page=await context.newPage(),clean=diagnostics(page),verified={},cap=capture(page,base,verified,[...readerRuntimeFiles,'week12-read-aloud.html']);let screens=0;
   for(let i=0;i<steps.length;i++) {
    await navigate(page,()=>page.goto(route(base,standalone,i)));let f=await reader(page,i,0,standalone);const baseline=await page.evaluate(()=>history.length);
    assert.equal(await f.locator('#teachingStop').isVisible(),false);assert.doesNotMatch(await f.locator('#next').textContent(),/Teaching Stop/);
    if(i<last) {
     await f.locator('#next').click();await reader(page,i+1,0,standalone);if(baseline<50)assert.equal(await page.evaluate(()=>history.length),baseline+1,'One native entry per ungated advance');
     await navigate(page,()=>page.goBack());await reader(page,i,0,standalone);await navigate(page,()=>page.goForward());await reader(page,i+1,0,standalone);await navigate(page,()=>page.reload());await reader(page,i+1,0,standalone);
     await navigate(page,()=>page.goBack());f=await reader(page,i,0,standalone);
    }
    if(i>0) {
     const previous=steps[i].vocabulary?steps.findIndex(s=>s.id===steps[i].sourceStep):i-1;
     await f.locator('#prev').click();await reader(page,previous,0,standalone);await navigate(page,()=>page.goBack());await reader(page,i,0,standalone);await navigate(page,()=>page.goForward());await reader(page,previous,0,standalone);await navigate(page,()=>page.reload());await reader(page,previous,0,standalone);
    } else {await navigate(page,()=>page.reload());await reader(page,0,0,standalone);}
    screens++;
   }
   await cap.finish();clean();assert.equal(screens,26);counts[standalone?'standalone':'embedded']={screens,verified};
  } finally {await context.close();}
 }
 evidence.nativeHistories=counts;
 console.log('PASS: every one of 26 ungated screens, standalone and embedded native Next/Previous/Back/Forward/reload, vocabulary source returns and exact consumed runtime/HTML');
}
async function malformedRoutes(browser,base) {
 const context=await browser.newContext({serviceWorkers:'block'});
 try {
  const page=await context.newPage(),clean=diagnostics(page),cap=capture(page,base,{},[...readerRuntimeFiles,'week12-read-aloud.html']);
  for(const standalone of [false,true]) {
   for(const [rawStep,rawStop,index]of [['bad','bad',0],['-1','-1',0],['1.5','0.5',0],['Infinity','NaN',0],['9999','9999',last],['12','999',12],['12','-1',12],['12','1',12]]) {
    await navigate(page,()=>page.goto(route(base,standalone,rawStep,rawStop)+'&book=stale&center=stale&review=1'));await reader(page,index,0,standalone);await navigate(page,()=>page.reload());await reader(page,index,0,standalone);
   }
   const file=standalone?'week12-read-aloud.html':'lesson-runner-week12.html';
   for(const day of ['Wednesday','2']){await navigate(page,()=>page.goto(base+file+'?week=12&day='+day+'&section=0'));await reader(page,0,0,standalone);}
   for(const [day,expected]of [['Thursday',3],['Friday',4],['3',3],['4',4]]){await navigate(page,()=>page.goto(base+file+'?week=12&day='+day+'&section=0'));await overview(page,expected);assert.equal(await page.evaluate(()=>typeof EEASectionState),'undefined','No unavailable reader renders');}
   const today=await page.evaluate(()=>{const d=new Date().getDay();return d===0||d===6?4:d-1;});
   for(const q of ['', 'day=', 'day=bad','day=-1','day=1.5','day=Infinity','day=5','day=Wednesday%20']){await navigate(page,()=>page.goto(base+file+'?week=12&section=0&'+q));await overview(page,today);}
   for(const section of ['1','2','-1','bad','0.5','']){await navigate(page,()=>page.goto(base+file+'?week=12&day=Wednesday&section='+section));await overview(page);}
  }
  for(let day=3;day<5;day++){await navigate(page,()=>page.goto(base+'daily-lessons.html?week=12&day='+day));await overview(page,day);const url=page.url();await page.waitForTimeout(100);assert.equal(page.url(),url,'Unavailable overview has no unexpected auto redirect');}
  await cap.finish();clean();
 } finally {await context.close();}
 console.log('PASS: malformed route/state cleanup and named/numeric unavailable days/sections; every stale Read1/2 stop clamps to zero');
}
module.exports={root,read,plan,steps,last,fixtures,consumedFiles,expected,hash,until,child,route,state,diagnostics,target,navigate,capture,reader,overview,imageReady,notes,screenshot,verifyViewport,nativeHistories,malformedRoutes};
