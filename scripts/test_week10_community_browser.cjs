// Real Chromium regression for the bounded Unit 2 Week 2 Community Meeting.
// Requires playwright 1.62.1. Optional WEEK10_SCREENSHOT_DIR saves visual QA.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
const titles=['Squat or Pyramid Pose','Heart Breathing'];
const screenshotDir=process.env.WEEK10_SCREENSHOT_DIR;
const server=http.createServer((request,response)=>{
  const file=path.resolve(root,'.'+new URL(request.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)){response.writeHead(403).end();return;}
  fs.readFile(file,(error,bytes)=>{
    if(error){response.writeHead(404).end();return;}
    const type={'.html':'text/html','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png','.pdf':'application/pdf'}[path.extname(file)]||'application/octet-stream';
    response.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(bytes);
  });
});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check,label){
  for(let i=0;i<200;i++){try{if(await check())return;}catch{}await delay(25);}
  assert.fail(label);
}
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}/v6-test/`;
  let browser;
  try{
    browser=await chromium.launch({headless:true,ignoreDefaultArgs:['--disable-back-forward-cache']});
    const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'});
    const errors=[],missing=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400&&!response.url().endsWith('/favicon.ico'))missing.push(`${response.status()} ${response.url()}`);});
    const section=()=>page.frames().find(frame=>frame.parentFrame()===page.mainFrame());
    async function overview(day){
      await until(async()=>new URL(page.url()).pathname.endsWith('/daily-lessons.html')&&
        await page.locator('#path .step').count()===(day<3?2:1)&&
        await page.locator('#path .step span').first().textContent()===titles[day%2],'Top-level overview');
      const p=new URL(page.url()).searchParams;
      assert.equal(p.get('week'),'10');assert.equal(p.get('day'),String(day));
      assert.equal(page.frames().length,1,'Overview must never be nested in a runner');
      assert.equal(await page.locator('#path .step').count(),day<3?2:1);
      if(day<3)assert.equal(await page.locator('#path .step b').nth(1).textContent(),'Read Aloud');
      assert.equal(await page.locator('#path .step span').first().textContent(),titles[day%2]);
      if(day<3)assert.match(await page.locator('#note').textContent(),/Read Aloud/);
      else assert.match(await page.locator('#note').textContent(),/rest of Unit 2 Week 2 is still being prepared/);
      assert.equal(await page.locator('#start').textContent(),'Open Community Meeting →');
    }
    async function ready(day){
      await until(async()=>section()&&await section().locator('h2').textContent()===titles[day%2]&&
        await page.evaluate(expected=>{
          const resume=JSON.parse(localStorage.getItem('eea-lesson-resume')||'null');
          return resume?.week===10&&resume.day===expected&&resume.section===0;
        },day),'Assigned Community Meeting ready');
      const f=section(),outer=new URL(page.url()),child=new URL(f.url());
      assert(outer.pathname.endsWith('/lesson-runner-week10.html'));
      assert(child.pathname.endsWith('/week10-community.html'));
      assert.equal(outer.searchParams.get('week'),'10');assert.equal(outer.searchParams.get('day'),String(day));
      assert.equal(outer.searchParams.get('section'),'0');assert.equal(outer.searchParams.has('step'),false);
      assert.equal(child.searchParams.get('day'),days[day]);assert.equal(child.searchParams.get('section'),'0');
      assert.equal(page.frames().length,2);assert.equal(await f.locator('iframe').count(),0,'No nested runner');
      assert.equal(await f.locator('select,#activityMenu,#count').count(),0);
      assert.deepEqual(await f.evaluate(()=>window.EEASectionState()),{index:0,total:1,atStart:true,atEnd:true});
      const resume=await page.evaluate(()=>JSON.parse(localStorage.getItem('eea-lesson-resume')));
      assert.equal(resume.day,day);assert.equal(resume.section,0);
      await until(()=>f.locator('.lesson-img').evaluate(img=>img.complete&&img.naturalWidth===1855&&img.naturalHeight===2400),'Original page image loaded at full dimensions');
      return f;
    }
    async function target(locator,label){
      const result=await locator.evaluate(el=>{
        const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=el.ownerDocument.elementFromPoint(x,y);
        return {inside:r.x>=0&&r.y>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,width:r.width,height:r.height,hit:!!hit&&(el===hit||el.contains(hit))};
      });
      assert(result.inside&&result.width>0&&result.height>0&&result.hit,`${label} is visible, in viewport and unobscured: ${JSON.stringify(result)}`);
    }
    async function shot(name){if(screenshotDir){fs.mkdirSync(screenshotDir,{recursive:true});await page.screenshot({path:path.join(screenshotDir,name+'.png'),fullPage:true});}}
    // A teacher can leave before the JPEG finishes loading. iframe.onload has
    // not fired then, so the child's fallback must not create a nested overview.
    for(const button of ['prev','done','exit']){
      let releaseImage;
      const imageGate=new Promise(resolve=>{releaseImage=resolve;});
      const pattern='**/week-2/community/*.jpg';
      const holdImage=async route=>{await imageGate;await route.continue().catch(()=>{});};
      await page.route(pattern,holdImage);
      try{
        await page.goto(`${base}lesson-runner-week10.html?week=10&day=3&section=0`,{waitUntil:'domcontentloaded'});
        await until(async()=>section()&&await section().locator('h2').textContent()==='Heart Breathing','Child script ready before image load');
        assert.equal(await section().locator('.lesson-img').evaluate(img=>img.complete),false);
        await section().locator('#'+button).click();await overview(3);
      }finally{releaseImage();await page.unroute(pattern,holdImage);}
    }
    console.log('All three early exits before source-image load remain top-level');
    for(let day=0;day<5;day++){
      await page.goto(`${base}daily-lessons.html?week=9&day=${day}`);
      await page.locator('[data-week="10"]').click();await overview(day);
      await page.locator('#path .step').first().click();let f=await ready(day);
      const url=page.url(),length=await page.evaluate(()=>history.length);
      for(let i=0;i<3;i++){
        await f.locator('.community-notes summary').click();assert.equal(await f.locator('.community-notes').evaluate(el=>el.open),true);
        await f.locator('.community-notes summary').click();assert.equal(await f.locator('.community-notes').evaluate(el=>el.open),false);
      }
      assert.equal(page.url(),url);assert.equal(await page.evaluate(()=>history.length),length);
      await page.reload();f=await ready(day);
      for(const button of (day<3?['prev','exit']:['prev','done','exit'])){
        const before=await page.evaluate(()=>localStorage.getItem('eea-lesson-resume'));
        await page.evaluate(()=>{const d=new Date();const pad=n=>String(n).padStart(2,'0');localStorage.setItem('eea-lesson-auto-resume',d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()));});
        for(let i=0;i<3;i++)await page.evaluate(()=>dispatchEvent(new Event('pageshow')));
        await f.locator('#'+button).click();await overview(day);
        assert.equal(await page.evaluate(()=>localStorage.getItem('eea-lesson-resume')),before,'Overview return preserves resume');
        assert.equal(await page.evaluate(()=>localStorage.getItem('eea-lesson-auto-resume')),null,'Deliberate return clears transient auto-resume to prevent bounce; lesson resume survives');
        // Exercise joint session history and restored documents repeatedly.
        for(let i=0;i<2;i++){
          await page.evaluate(()=>history.back());await ready(day);
          await page.evaluate(()=>history.forward());await overview(day);
        }
        await page.locator('#start').click();f=await ready(day);
      }
      await f.locator('#exit').click();await overview(day);
      console.log(`${days[day]}: correct original practice, repeated notes, reload, overview returns, reentry and Back/Forward pass`);
    }
    for(const key of ['Enter','Space']){
      await page.goto(`${base}daily-lessons.html?week=10&day=3`);
      await page.locator('#path .step').focus();await page.keyboard.press(key);await ready(3);
    }
    await page.goto(`${base}daily-lessons.html?week=10&day=0`);
    for(let day=0;day<5;day++){await page.locator(`[data-i="${day}"]`).click();await overview(day);}
    await page.goto(`${base}lesson-runner-week10.html?week=9&day=3&section=999&step=7`);await ready(3);
    for(const invalid of ['-1','5','2.5','NaN','Infinity']){
      await page.goto(`${base}lesson-runner-week10.html?week=1&day=${invalid}&section=999&step=7`);
      const day=await page.evaluate(()=>Math.max(0,Math.min(4,new Date().getDay()-1)));
      await ready(day);
    }
    console.log('Keyboard launch, weekday selection and invalid route normalization pass');
    for(const viewport of [{width:1280,height:800},{width:1180,height:757}]){
      await page.setViewportSize(viewport);
      await page.goto(`${base}daily-lessons.html?week=10&day=3`);await overview(3);
      for(const locator of ['#weeknav button','#days button','#path .step','#start','.home','.pace']){
        const items=page.locator(locator);for(let n=0;n<await items.count();n++)await target(items.nth(n),`${viewport.width}: ${locator}/${n}`);
      }
      await shot(`overview-${viewport.width}x${viewport.height}`);
      for(const day of [0,1]){
        await page.goto(`${base}lesson-runner-week10.html?week=10&day=${day}&section=0`);const f=await ready(day);
        for(const selector of ['#prev','#done','#exit'])await target(f.locator(selector),`${viewport.width}: ${selector}`);
        await f.locator('.community-notes summary').scrollIntoViewIfNeeded();
        await target(f.locator('.community-notes summary'),`${viewport.width}: teacher notes`);
        const picture=await f.locator('.lesson-img').boundingBox();assert(picture.width>200&&picture.height>300,'Large original-page visual');
        await shot(`${day?'heart':'squat'}-${viewport.width}x${viewport.height}`);
        await f.locator('.community-notes summary').click();
        assert.equal(await f.locator('.community-notes').evaluate(el=>el.open),true);
        await f.locator('.community-notes-content a').last().scrollIntoViewIfNeeded();
        await target(f.locator('.community-notes-content a').last(),`${viewport.width}: last source link`);
        for(const selector of ['#prev','#done','#exit'])await target(f.locator(selector),`${viewport.width}: expanded notes ${selector}`);
        await shot(`${day?'heart':'squat'}-notes-${viewport.width}x${viewport.height}`);
      }
    }
    assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
    console.log('1280×800 and 1180×757 layouts, original images, accessible click targets and expanded source notes pass; no page errors or missing resources');
  }finally{if(browser)await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
