// Real Chromium regression for the bounded Tuesday Unit 2 Week 2 Read Aloud.
// Requires playwright 1.62.1. CI must run this: JSDOM cannot verify joint history,
// native Back/Forward, image containment, hit targets or early iframe exits.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const screenshotDir=process.env.WEEK10_READALOUD_TUESDAY_SCREENSHOT_DIR;
const server=http.createServer((request,response)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)){response.writeHead(403).end();return;}
  fs.readFile(file,(error,bytes)=>{
    if(error){response.writeHead(404).end();return;}
    const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';
    response.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(bytes);
  });
});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check,label){for(let i=0;i<240;i++){try{if(await check())return;}catch{}await delay(25);}assert.fail(label);}
(async()=>{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const base=`http://127.0.0.1:${server.address().port}/v6-test/`;
  let browser;
  try{
    browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,ignoreDefaultArgs:['--disable-back-forward-cache']});
    const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'});
    const errors=[],missing=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400&&!response.url().endsWith('/favicon.ico'))missing.push(`${response.status()} ${response.url()}`);});
    let steps=[];
    const indexFor=step=>typeof step==='number'?step:steps.findIndex(s=>s.id===step);
    const section=()=>page.frames().find(frame=>frame.parentFrame()===page.mainFrame());
    const state=async()=>section().evaluate(()=>window.EEASectionState());
    async function reader(step){
      const expected=step===undefined?null:indexFor(step);
      await until(async()=>section()?.url().includes('/week10-read-aloud.html')&&await section().evaluate(expected=>typeof window.EEASectionState==='function'&&(expected===null||window.EEASectionState().step===expected),expected),'Tuesday Read Aloud '+(step||'ready'));
      const f=section(),outer=new URL(page.url()),child=new URL(f.url());
      assert(outer.pathname.endsWith('/lesson-runner-week10.html'));assert.equal(outer.searchParams.get('week'),'10');assert.equal(outer.searchParams.get('day'),'1');assert.equal(outer.searchParams.get('section'),'1');
      assert.equal(child.searchParams.get('day'),'Tuesday');assert.equal(page.frames().length,2);assert.equal(await f.locator('iframe').count(),0);
      const resume=await page.evaluate(()=>JSON.parse(localStorage.getItem('eea-lesson-resume')));assert.equal(resume.week,10);assert.equal(resume.day,1);assert.equal(resume.section,1);
      assert.equal(outer.searchParams.get('step'),String((await state()).step),'Parent owns authoritative step URL');
      return f;
    }
    async function community(day=1){
      await until(async()=>section()?.url().includes('/week10-community.html')&&await section().evaluate(()=>typeof window.EEASectionState==='function'),'Community ready');
      const outer=new URL(page.url());assert.equal(outer.searchParams.get('day'),String(day));assert.equal(outer.searchParams.get('section'),'0');
      assert.equal(new URL(section().url()).searchParams.get('day'),['Monday','Tuesday','Wednesday','Thursday','Friday'][day]);
      assert.equal(page.frames().length,2);return section();
    }
    async function overview(day=1){
      await until(async()=>new URL(page.url()).pathname.endsWith('/daily-lessons.html')&&await page.locator('#path .step').count()===(day<2?2:1),'Top-level same-day overview');
      assert.equal(page.frames().length,1,'No nested overview');const p=new URL(page.url()).searchParams;assert.equal(p.get('week'),'10');assert.equal(p.get('day'),String(day));
    }
    async function target(locator,label){
      const result=await locator.evaluate(el=>{const r=el.getBoundingClientRect(),hit=el.ownerDocument.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{inside:r.x>=0&&r.y>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,width:r.width,height:r.height,hit:!!hit&&(hit===el||el.contains(hit))};});
      assert(result.inside&&result.width>0&&result.height>0&&result.hit,`${label}: visible unobscured target ${JSON.stringify(result)}`);
    }
    async function image(step){
      if(!step.img)return;
      const f=section();assert.equal(await f.locator('#bookImg').getAttribute('src'),step.img);
      await until(()=>f.locator('#bookImg').evaluate((img,original)=>img.complete&&img.naturalWidth>0&&(!original||(img.naturalWidth===1920&&img.naturalHeight===1080)),Number.isInteger(step.sourceSlide)),`${step.id}: complete original slide`);
      if(await f.locator('#bookImg').isVisible()){
        const geometry=await f.locator('#bookImg').evaluate(el=>{const r=el.getBoundingClientRect(),style=getComputedStyle(el);return{fit:style.objectFit,left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,vw:innerWidth,vh:innerHeight};});
        assert.equal(geometry.fit,'contain',`${step.id}: original image must not be cropped`);
        assert(geometry.width>200&&geometry.height>100&&geometry.left>=-1&&geometry.top>=-1&&geometry.right<=geometry.vw+1&&geometry.bottom<=geometry.vh+1,`${step.id}: source is inside viewport`);
      }
    }
    async function notes(){
      const f=section(),url=page.url(),history=await page.evaluate(()=>window.history.length),initial=await state();
      const el=f.locator('#teacherNotes');
      const details=await el.evaluate(node=>node.tagName==='DETAILS');
      const toggle=details?el.locator('summary'):el;
      for(let repeat=0;repeat<3;repeat++){await toggle.click();await toggle.click();}
      assert.deepEqual(await state(),initial,'Notes never consume a teaching stop or advance a step');assert.equal(page.url(),url);assert.equal(await page.evaluate(()=>window.history.length),history);
    }
    async function shot(name){if(screenshotDir){fs.mkdirSync(screenshotDir,{recursive:true});await page.screenshot({path:path.join(screenshotDir,name+'.png'),fullPage:true});}}
    const route=(step='',stop='')=>`${base}lesson-runner-week10.html?week=10&day=1&section=1${step?'&step='+indexFor(step):''}${stop!==''?'&stop='+stop:''}`;
    await page.goto(`${base}daily-lessons.html?week=10&day=1`);await overview();
    await page.locator('#path .step').first().click();let f=await community();
    assert.equal(await f.locator('#done').textContent(),'Next: Read Aloud →');await f.locator('#done').click();f=await reader();
    steps=await f.evaluate(()=>window.EEAReadAloudPlan.steps||window.EEAReadAloudPlan);
    assert.equal((await state()).step,0);assert.equal(steps[0].kind,'before');
    await notes();await image(steps[0]);await shot('tuesday-preread-1280x800');
    // Tuesday boundaries are fresh top-level documents. Repeated preparation and
    // leaving/returning must preserve the same day with no duplicate listeners.
    for(let repeat=0;repeat<2;repeat++){
      await section().locator('#prev').click();await community();
      await section().locator('#done').click();await reader(steps[0].id);
    }
    await page.evaluate(()=>{const frame=document.getElementById('frame');for(let n=0;n<3;n++){dispatchEvent(new Event('pageshow'));frame.dispatchEvent(new Event('load'));}});
    await section().locator('#next').click();await reader(steps[1].id);
    await page.goBack();await reader(steps[0].id);await page.goForward();await reader(steps[1].id);
    await page.reload();await reader(steps[1].id);
    console.log('Tuesday Community → pre-read, repeated section boundaries, internal Back/Forward and reload pass');
    // Every source spread, four separately acknowledged stops and the final
    // closing are traversed through actual controls; no synthetic step API.
    await page.goto(route());await reader(steps[0].id);
    let stopCount=0;
    for(let index=0;index<steps.length;index++){
      const step=steps[index];f=await reader(step.id);assert.equal((await state()).index,index);await image(step);
      let guard=0;
      while((await state()).stopPending){
        const old=await state(),src=await f.locator('#bookImg').getAttribute('src');
        assert.equal(await f.locator('#teachingStop').isVisible(),guard>0);
        await f.locator('#next').click();assert.equal(await f.locator('#stopText').textContent(),step.stops[guard]);assert(await f.locator('#teachingStop').isVisible());assert.equal((await state()).step,old.step,'Next acknowledges prompt before changing source');assert.equal(await f.locator('#bookImg').getAttribute('src'),src);
        stopCount++;assert(++guard<=step.stops.length);
      }
      if(index<steps.length-1)await f.locator('#next').click();
    }
    assert.equal(stopCount,4);assert.equal((await state()).atEnd,true);assert.match(await f.locator('body').textContent(),/tomorrow/i);await shot('tuesday-closing-1280x800');
    await f.locator('#next').click();await overview();
    await page.goBack();await reader(steps.at(-1).id);assert.equal((await state()).atEnd,true);
    await page.goForward();await overview();
    assert.equal(await page.locator('#start').textContent(),'Open Community Meeting →');
    await page.locator('#start').click();await community();
    console.log('All original spreads, four separate gated stops, closing handoff and history restoration pass');
    // Each Read 2 teaching stop retains its acknowledged state across reload,
    // Back and Forward without consuming the next original book spread.
    const paired=steps.find(s=>s.stops.length===1);
    for(const stopped of steps.filter(s=>s.stops.length)){
      await page.goto(route(stopped.id,0));f=await reader(stopped.id);
      assert.equal((await state()).stopPending,true);await f.locator('#next').click();
      assert.equal((await state()).stopPending,false);assert.equal(await f.locator('#stopText').textContent(),stopped.stops[0]);
      await page.goBack();await reader(stopped.id);assert.equal((await state()).stop,0);
      await page.goForward();f=await reader(stopped.id);assert.equal((await state()).stop,1);
      await page.reload();f=await reader(stopped.id);assert.equal((await state()).stop,1);await notes();
    }
    for(const day of [2,3,4]){
      await page.goto(`${base}lesson-runner-week10.html?week=10&day=${day}&section=1&step=${indexFor(paired.id)}&stop=1`);f=await community(day);
      assert.equal(await f.locator('#done').textContent(),'Return to Overview →');await f.locator('#done').click();await overview(day);
    }
    for(const key of ['Enter','Space']){
      await page.goto(`${base}daily-lessons.html?week=10&day=1`);await overview();await page.locator('#path .step').nth(1).focus();await page.keyboard.press(key);await reader(steps[0].id);
    }
    // The child can be interactive before iframe.onload. Its own early handlers
    // must update the parent route and exit at top level while images are slow.
    for(const action of ['next','backBtn']){
      let release;const gate=new Promise(resolve=>{release=resolve;});const pattern='**/strictly-no-elephants/*.jpg';const hold=async route=>{await gate;await route.continue().catch(()=>{});};
      await page.route(pattern,hold);
      try{
        await page.goto(route(),{waitUntil:'domcontentloaded'});f=await reader(steps[0].id);assert.equal(await f.locator('#bookImg').evaluate(img=>img.complete),false);
        await f.locator('#'+action).click();
        if(action==='next'){
          await reader(steps[1].id);
          await page.evaluate(()=>history.back());await reader(steps[0].id);
          await page.evaluate(()=>history.forward());await reader(steps[1].id);
          await section().locator('#backBtn').click();
        }
        await overview();
      }finally{release();await page.unroute(pattern,hold);}
    }
    console.log('Wednesday–Friday remain Community-only, keyboard Read Aloud launch and early-loading exits pass');
    for(const viewport of [{width:1280,height:800},{width:1180,height:757}]){
      await page.setViewportSize(viewport);
      await page.goto(`${base}daily-lessons.html?week=10&day=1`);await overview();
      for(const selector of ['#path .step','#start','#weeknav button','#days button']){const controls=page.locator(selector);for(let i=0;i<await controls.count();i++)await target(controls.nth(i),`${viewport.width} overview ${selector}/${i}`);}
      await shot(`tuesday-overview-${viewport.width}x${viewport.height}`);
      const samples=[steps[0],paired,...steps.filter(s=>s.kind==='vocabulary').slice(0,1),...steps.filter(s=>s.kind==='after'),steps.at(-1)];
      for(const step of samples){
        await page.goto(route(step.id,(step.stops||[]).length));f=await reader(step.id);await image(step);
        for(const selector of ['#prev','#next','#backBtn'])await target(f.locator(selector),`${viewport.width} ${step.id} ${selector}`);
        const notesEl=f.locator('#teacherNotes');const notesToggle=await notesEl.evaluate(el=>el.tagName==='DETAILS')?notesEl.locator('summary'):notesEl;
        await target(notesToggle,`${viewport.width} ${step.id} teacher notes`);await shot(`${step.id}-${viewport.width}x${viewport.height}`);
        await notesToggle.click();
        for(const selector of ['#prev','#next','#backBtn'])await target(f.locator(selector),`${viewport.width} ${step.id} notes-open ${selector}`);
        await shot(`${step.id}-notes-${viewport.width}x${viewport.height}`);
      }
    }
    // Standalone reader has the same history contract without a parent runner.
    await page.goto(`${base}week10-read-aloud.html?day=Tuesday&step=${indexFor(paired.id)}&stop=0`);
    await page.waitForFunction(()=>typeof window.EEASectionState==='function');
    const standaloneFirst=await page.evaluate(()=>window.EEASectionState());await page.locator('#next').click();const standaloneSecond=await page.evaluate(()=>window.EEASectionState());
    assert.equal(standaloneFirst.step,standaloneSecond.step);assert.notDeepEqual(standaloneFirst,standaloneSecond);
    await page.goBack();await until(async()=>JSON.stringify(await page.evaluate(()=>window.EEASectionState()))===JSON.stringify(standaloneFirst),'Standalone Back restores stop');
    await page.goForward();await until(async()=>JSON.stringify(await page.evaluate(()=>window.EEASectionState()))===JSON.stringify(standaloneSecond),'Standalone Forward restores stop');
    await page.reload();assert.deepEqual(await page.evaluate(()=>window.EEASectionState()),standaloneSecond);
    await page.locator('#backBtn').click();await overview();
    assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
    console.log('1280×800/1180×757 original-image containment, accessible controls, notes, standalone history and resource checks pass');
  }finally{if(browser)await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
