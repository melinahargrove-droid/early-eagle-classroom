// Real Chromium Week 1 Centers exit/sequence regression. CI supplies Playwright.
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((request,response)=>{
  // Week 1's unchanged image helper uses the published repository prefix.
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname).replace(/^\/early-eagle-classroom\//,'/');
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)){response.writeHead(403).end();return;}
  fs.readFile(file,(error,bytes)=>{
    if(error){response.writeHead(404).end();return;}
    const type={'.html':'text/html','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'}[path.extname(file)]||'application/octet-stream';
    response.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(bytes);
  });
});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check,label){for(let i=0;i<200;i++){try{if(await check())return;}catch{}await delay(25);}assert.fail(label);}
const html=fs.readFileSync(path.join(root,'v6-test/centers-week1.html'),'utf8');
const all=vm.runInNewContext('('+html.split('const all=')[1].split(';const p=')[0]+')');
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}/v6-test/`;
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    const frame=()=>page.frames().find(f=>f.parentFrame()===page.mainFrame());
    async function opened(day){
      await until(async()=>frame()&&await frame().locator('#chip').textContent().then(x=>x.includes(`WEEK 1 · ${day.toUpperCase()}`)),`${day} opens Centers`);
      assert.equal(page.frames().length,2,'Exactly one iframe; no nested runner');
      assert(frame().url().includes('/centers-week1.html'));
      assert.equal(new URL(frame().url()).searchParams.get('day'),day);
    }
    async function overview(dayIndex,day){
      await page.waitForURL('**/daily-lessons.html?**');
      assert.equal(new URL(page.url()).searchParams.get('week'),'1');
      assert.equal(new URL(page.url()).searchParams.get('day'),String(dayIndex));
      assert.equal(await page.locator('#title').textContent(),`${day}’s Lessons`);
      assert.equal(await page.locator('iframe').count(),0,'Exit leaves outer runner entirely');
      assert.equal(page.frames().length,1);
    }
    let checked=0;
    for(const [dayIndex,[day,items]] of Object.entries(all).entries()){
      const expected=items.flatMap(item=>(item.steps||[null]).map(step=>({item,step})));
      await page.goto(`${base}daily-lessons.html?week=1&day=${dayIndex}`);
      const completionKey=`eea-complete-w1-d${dayIndex}`;
      const completedBefore=await page.evaluate(key=>localStorage.getItem(key),completionKey);
      for(const exitAt of [0,1,expected.length-1]){
        await page.getByRole('button',{name:'Open Centers',exact:true}).click();await opened(day);
        for(let i=0;i<exitAt;i++)await frame().locator('#next').click();
        assert.equal(await frame().locator('#title').textContent(),expected[exitAt].step?.title||expected[exitAt].item.title);
        await frame().locator('#teacher').click();assert(await frame().locator('#panel').isVisible());
        await frame().locator('#close').click();assert(!await frame().locator('#panel').isVisible());
        assert(page.url().includes('/lesson-runner-week1.html'),'Notes close stays in runner');
        await frame().locator('#exit').click();await overview(dayIndex,day);
        assert.equal(await page.evaluate(key=>localStorage.getItem(key),completionKey),completedBefore,'Exit does not complete Centers');
      }
      await page.goBack();await opened(day);
      await page.goForward();await overview(dayIndex,day);
      await page.getByRole('button',{name:'Open Centers',exact:true}).click();await opened(day);
      for(const [index,{item,step}] of expected.entries()){
        const f=frame();
        assert.equal(await f.locator('#title').textContent(),step?.title||item.title);
        assert.equal(await f.locator('#prompt').textContent(),step?.prompt||item.prompt);
        assert.equal(await f.locator('#reminder').textContent(),step?.reminder||item.reminder);
        assert.equal(await f.locator('#art').getAttribute('src'),'/early-eagle-classroom/v6-test/'+(step?.img||item.img)+'?v=20260920-drying-rack');
        await until(()=>f.locator('#art').evaluate(img=>img.complete&&img.naturalWidth>0),`${day} page ${index+1} image decodes`);
        for(let repeat=0;repeat<2;repeat++){
          await f.locator('#teacher').click();assert(await f.locator('#panel').isVisible());
          assert.equal(await f.locator('#notes').textContent(),step?.script||item.notes);
          assert.equal(await f.locator('#materials').textContent(),item.materials);
          await f.locator('#close').click();assert(!await f.locator('#panel').isVisible());
        }
        const final=index===expected.length-1;
        assert.equal(await f.locator('#done').isVisible(),final);
        assert.equal(await f.locator('#next').isVisible(),!final);
        await f.locator(final?'#done':'#next').click();checked++;
        if(!final){assert.equal(frame(),f);assert(frame().url().includes('/centers-week1.html'));}
      }
      await until(()=>frame().url().includes('/storytelling-week1.html'),`${day} Storytelling handoff`);
      assert.equal(new URL(frame().url()).searchParams.get('day'),day);
      const resume=await page.evaluate(()=>JSON.parse(localStorage.getItem('eea-lesson-resume')));
      assert.equal(resume.week,1);assert.equal(resume.day,dayIndex);assert.equal(resume.section,3);
      // This existing overview control is hidden in focus mode; exercise its
      // handler programmatically without adding a new visible UI control.
      await page.evaluate(()=>document.getElementById('overviewBtn').click());
      await overview(dayIndex,day);
      console.log(`Week 1 ${day}: first/internal/final X, repeated entry, Back/Forward, notes close, all ${expected.length} decoded teaching pages, same-day Storytelling and existing Overview handler pass`);
    }
    assert.deepEqual(errors,[]);
    console.log(`All ${checked} Week 1 Centers pages and five weekdays pass in real Chromium without JavaScript page errors`);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
