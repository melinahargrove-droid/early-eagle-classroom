// JSDOM cannot perform full navigation. Capture only the runner's outer
// overview assignment; real Chromium verifies unmodified navigation below.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { JSDOM, ResourceLoader, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '../v6-test');
const origin = 'https://eea.test/v6-test/';
const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const centers = fs.readFileSync(path.join(root, 'centers-week1.html'), 'utf8');
assert.equal(crypto.createHash('sha256').update(centers).digest('hex'),'652f118a9ea08b194e97ca02518408a187b3ce8bd9ce03f341a0d64b7e89352c','The complete Centers page, curriculum, artwork, layout and internal handlers stay unchanged');
const all = vm.runInNewContext('(' + centers.split('const all=')[1].split(';const p=')[0] + ')');
const runner = fs.readFileSync(path.join(root, 'lesson-runner-week1.html'), 'utf8');
const overview = "function overview(){location.href='daily-lessons.html?week=1&day='+day+'&v='+Date.now()}";
assert(runner.includes(overview), 'Existing overview destination is preserved');
const observedRunner = runner.replace(overview, "function overview(){window.__overview='daily-lessons.html?week=1&day='+day+'&v='+Date.now()}");
class AppFiles extends ResourceLoader {
  fetch(url) {
    if (!url.startsWith(origin)) return null;
    return Promise.resolve(fs.readFileSync(path.join(root, decodeURIComponent(new URL(url).pathname.slice('/v6-test/'.length)))));
  }
}
async function until(test, label) {
  for(let i=0;i<150;i++){if(test())return;await delay(10);}
  assert.fail(label);
}
function open(day) {
  const errors=[], vc=new VirtualConsole();vc.on('jsdomError', e=>errors.push(e.message));
  const dom=new JSDOM(observedRunner,{url:`${origin}lesson-runner-week1.html?week=1&day=${day}&section=2`,runScripts:'dangerously',resources:new AppFiles(),virtualConsole:vc,pretendToBeVisual:true});
  return {w:dom.window,errors};
}
function verifyOverview(w,day){
  assert(w.__overview,'Centers X must invoke the outer overview handler');
  const url=new URL(w.__overview,origin);
  assert.equal(url.pathname,'/v6-test/daily-lessons.html');
  assert.equal(url.searchParams.get('week'),'1');assert.equal(url.searchParams.get('day'),String(day));
}
(async()=>{
  let checked=0;
  for(const [dayIndex,day] of days.entries()){
    const {w,errors}=open(dayIndex),frame=w.document.getElementById('frame');
    await until(()=>frame.contentDocument.getElementById('title')?.textContent,`${day} initializes`);
    await delay(30);
    const d=frame.contentDocument;
    const expected=all[day].flatMap(item=>(item.steps||[null]).map(step=>({item,step})));
    for(const [index,{item,step}] of expected.entries()){
      await delay(20);
      const $=id=>d.getElementById(id);
      assert.equal($('title').textContent,step?.title||item.title);
      assert.equal($('prompt').textContent,step?.prompt||item.prompt);
      assert.equal($('reminder').textContent,step?.reminder||item.reminder);
      assert.equal($('sub').textContent,item.sub);
      assert.equal($('notes').textContent,step?.script||item.notes);
      assert.equal($('materials').textContent,item.materials);
      assert.equal($('art').getAttribute('src'),'/early-eagle-classroom/v6-test/'+(step?.img||item.img)+'?v=20260920-drying-rack');
      assert.match($('chip').textContent,new RegExp(`WEEK 1 · ${day.toUpperCase()}`));
      assert.equal($('review').style.display,item.revisit?'inline-block':'none');
      for(let repeat=0;repeat<2;repeat++){
        $('teacher').click();assert($('panel').classList.contains('open'));
        $('close').click();assert(!$('panel').classList.contains('open'));
        assert(!w.__overview,'Teacher Notes close must not exit');
      }
      // Observe X on first, every internal and final page without leaving JSDOM.
      $('exit').click();verifyOverview(w,dayIndex);delete w.__overview;
      assert.equal(frame.contentDocument,d);assert.equal(w.document.querySelectorAll('iframe').length,1);
      const final=index===expected.length-1;
      assert.equal($('done').style.display,final?'inline-block':'none');
      assert.equal($('next').style.display,final?'none':'inline-block');
      $(final?'done':'next').click();checked++;
      if(!final){assert.equal(frame.contentDocument,d);assert(!w.localStorage.getItem('eea-lesson-resume'),'No premature handoff');}
    }
    await until(()=>w.document.getElementById('frame').contentWindow.location.pathname.endsWith('/storytelling-week1.html'),`${day} same-day Storytelling handoff`);
    const next=w.document.getElementById('frame');
    await until(()=>next.contentDocument.readyState==='complete',`${day} Storytelling loaded`);
    assert.equal(new URL(next.src).searchParams.get('day'),day);
    assert.equal(JSON.parse(w.localStorage.getItem('eea-lesson-resume')).section,3);
    assert.equal(JSON.parse(w.localStorage.getItem('eea-lesson-resume')).day,dayIndex);
    w.document.getElementById('overviewBtn').click();verifyOverview(w,dayIndex);
    assert.deepEqual(errors,[]);w.close();
    console.log(`Week 1 ${day}: ${expected.length} original pages, notes close, X targets, Day Overview and same-day Storytelling handoff pass`);
  }
  console.log(`All ${checked} Week 1 Centers pages pass; actual outer navigation requires the Chromium suite`);
})().catch(error=>{console.error(error);process.exitCode=1;});
