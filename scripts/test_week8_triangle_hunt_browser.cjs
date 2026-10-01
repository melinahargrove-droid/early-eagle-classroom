// Real Chromium Week 8 Centers/Triangle Hunt regression. CI supplies playwright 1.62.1.
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const server = http.createServer((request, response) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
  if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, bytes) => {
    if (error) { response.writeHead(404).end(); return; }
    const type = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' }[path.extname(file)] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' }).end(bytes);
  });
});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check, label) {
  for (let i = 0; i < 200; i++) { try { if (await check()) return; } catch {} await delay(25); }
  assert.fail(label);
}
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/v6-test/`;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: {width:1280,height:800}, serviceWorkers:'block' });
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    const section=()=>page.frames().find(frame=>frame.parentFrame()===page.mainFrame());
    const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
    const totals={8:[9,6,10,2,6]};
    let checked=0;
    for(const week of [8]) {
      const html=fs.readFileSync(path.join(root,`v6-test/week${week}-intro-centers.html`),'utf8');
      const data=require('node:vm').runInNewContext('('+html.split('const all=')[1].split(';const $=')[0]+')');
      for(const [dayIndex,day] of days.entries()) {
        const expected=data[day].flatMap(item=>(item.steps||[null]).map(step=>({item,step})));
        assert.equal(expected.length,totals[week][dayIndex]);
        await page.goto(`${base}daily-lessons.html?week=${week}&day=${dayIndex}`);
        await page.getByRole('button', {name:'Open Centers', exact:true}).click();
        await until(async()=>section()&&await section().evaluate(()=>typeof window.EEASectionState==='function'),`${week} ${day} initialized`);
        await delay(120);
        const f=section();
        for(const [index,{item,step}] of expected.entries()) {
          assert.equal(await f.locator('#title').textContent(),step?.title||item.title);
          assert.equal(await f.locator('#prompt').textContent(),step?.prompt||item.prompt);
          assert.equal((await f.evaluate(()=>window.EEASectionState())).index,index);
          assert.equal(await f.locator('#pic').getAttribute('src'),step?.img||item.img);
          // Decode every image, including the restored Triangle Hunt revisit.
          await until(()=>f.locator('#pic').evaluate(img=>img.complete&&img.naturalWidth>0),`${week} ${day} page ${index+1} image decodes`);
          for(let repeat=0;repeat<2;repeat++) {
            await f.locator('#teacherBtn').click();assert(await f.locator('#panel').isVisible());
            assert.equal(await f.locator('#materials').textContent(),item.materials);
            await f.locator('#close').click();assert(!await f.locator('#panel').isVisible());
          }
          if(index===expected.length-1) assert.equal(await f.locator('#doneBtn').textContent(),'Next: Thinking & Feedback →');
          else assert.match(await f.locator('#doneBtn').textContent(),/^Next (Step|Center) →$/);
          await f.locator('#doneBtn').click();checked++;
          if(index<expected.length-1) {
            assert(section().url().includes(`week${week}-intro-centers.html`),'Internal step remains in Centers');
            assert.equal(new URL(section().url()).searchParams.get('day'),day);
          }
        }
        await until(()=>section().url().includes(`thinking-feedback-week${week}.html`),`${week} ${day} final handoff`);
        assert.equal(new URL(section().url()).searchParams.get('day'),day);
        assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('eea-lesson-resume')).section),3);
        console.log(`Week ${week} ${day}: all ${expected.length} pages and decoded images, repeated notes, final same-day handoff pass`);
      }
    }
    // Exercise truly consecutive clicks in one browser task, before queued sync.
    for (const [dayIndex, day] of days.entries()) {
      await page.goto(`${base}lesson-runner-week8.html?week=8&day=${dayIndex}&section=2`);
      await until(async()=>section()&&await section().evaluate(()=>typeof window.EEASectionState==='function'), `${day} rapid initialization`);
      await delay(120);
      const states = await section().evaluate(() => {
        const button = document.getElementById('doneBtn'), result = [];
        const total = window.EEASectionState().total;
        for (let i=0; i<total; i++) {
          result.push(window.EEASectionState().index);
          button.click();
        }
        return result;
      });
      assert.deepEqual(states, Array.from({length:totals[8][dayIndex]}, (_,i)=>i));
      await until(()=>section().url().includes('thinking-feedback-week8.html'), `${day} rapid final handoff`);
      assert.equal(new URL(section().url()).searchParams.get('day'), day);
    }
    // Standalone revisit, normal Thursday entry, Review Original, and reload
    // all use the same asset; this does not change auxiliary return semantics.
    for (const query of ['day=Thursday', 'day=Thursday&item=1', 'day=Thursday&item=1&eeaRunner=1', 'day=Thursday&item=1&from=runner']) {
      await page.goto(`${base}week8-intro-centers.html?${query}`);
      if (query === 'day=Thursday') await page.locator('#doneBtn').click();
      assert.equal(await page.locator('#title').textContent(), 'Revisit Triangle Hunt');
      assert.equal(await page.locator('#pic').getAttribute('src'), 'assets/focus-3s/unit-1/week-8/centers/triangle-hunt.png');
      await until(() => page.locator('#pic').evaluate(img=>img.complete&&img.naturalWidth===1536&&img.naturalHeight===1024), 'Revisit image decodes');
    }
    await page.reload();
    await until(() => page.locator('#pic').evaluate(img=>img.complete&&img.naturalWidth===1536), 'Revisit image survives reload');
    await page.locator('#review').click();
    await page.waitForURL('**/week8-intro-centers.html?day=Tuesday&item=0&review=1');
    assert.equal(await page.locator('#title').textContent(), 'Meet the Triangle');
    await page.locator('#doneBtn').click();
    await page.locator('#doneBtn').click();
    assert.equal(await page.locator('#title').textContent(), 'Go on a Triangle Hunt');
    await until(() => page.locator('#pic').evaluate(img=>img.complete&&img.naturalWidth===1536), 'Original hunt image decodes');
    assert.deepEqual(errors,[]);
    console.log(`All ${checked} Centers pages pass in real Chromium with no JavaScript page errors; the restored revisit, standalone variants, reload and original introduction decode successfully`);
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
