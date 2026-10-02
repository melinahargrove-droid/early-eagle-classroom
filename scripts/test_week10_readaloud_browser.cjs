// Real Chromium regression for the bounded Monday Unit 2 Week 2 Read Aloud.
// Requires playwright 1.62.1. CI must run this: JSDOM cannot verify joint history,
// native Back/Forward, image containment, hit targets or early iframe exits.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const screenshotDir=process.env.WEEK10_READALOUD_SCREENSHOT_DIR;
// Exact Community runtime from PR #230 head ed20073, before Monday Read Aloud.
// This synthetic isolated-origin fixture contains no roster or student data.
const legacyCommunityScript="(()=>{\n  const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];\n  const params=new URLSearchParams(location.search);\n  const day=days.includes(params.get('day'))?params.get('day'):'Monday';\n  const dayIndex=days.indexOf(day);\n  const practices=[\n    {\n      title:'Squat or Pyramid Pose',\n      lead:'Breathe. Imagine you are a pyramid, strong and steady.',\n      img:'assets/focus-3s/unit-2/week-2/community/squat-pyramid-pose.jpg',\n      alt:'Original Squat or Pyramid Pose visual: a child squatting with palms together, and a pyramid.',\n      steps:[['Set up','Come down to a squat with your knees apart. Bend your arms and put your palms together.'],['Balance','To find your balance, you can gently bounce up and down or you can put your hands on the ground.'],['Focus','Find something at eye level and focus your eyes on it.']],\n      introduction:'Do this together with the children.',\n      support:'Children can also do this sitting in a chair.'\n    },\n    {\n      title:'Heart Breathing',\n      lead:'Breathe in, raise your arms. Breathe out, make a heart.',\n      img:'assets/focus-3s/unit-2/week-2/community/heart-breathing.jpg',\n      alt:'Original Heart Breathing visual: three photographs demonstrating arms overhead and hands making a heart in front of the body.',\n      steps:[['Begin','Invite children to stand up with their hands by their sides.'],['Breathe in','As you breathe in, raise your arms above your head to gather some good energy.'],['Breathe out','As you breathe out, shape your hands like a heart in front of you.']],\n      introduction:'Model for children.',\n      support:'Repeat the sequence 4-5 times. End by inviting children to put their hand on the heart, take another deep breath and share some love and kindness with themselves.',\n      credit:'From Life is Good Playmaker Project. Visuals: Photos of Unicia Young taken by Marina Boni.'\n    }\n  ];\n  const practice=practices[dayIndex%2];\n  const reflection=['Notice how children respond to the conversation prompts.','What do they say that might be important to know about them?','Notice how children manage themselves in the group.','How do children interact with and respond to each other?','What support might they need to deepen connections?','Do all children participate?','What do they seem to prefer as a group: mindfulness, conversations, or games?'];\n  const escape=s=>String(s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]));\n  document.getElementById('sub').textContent=day+' · Mindful practice';\n  document.getElementById('lesson').innerHTML=`<article class=\"community-card\"><figure class=\"community-visual\"><img class=\"lesson-img\" src=\"${practice.img}\" alt=\"${escape(practice.alt)}\"></figure><div class=\"community-copy with-steps\"><div class=\"kicker\">${day.toUpperCase()} · WORLD OF COLOR</div><h2>${practice.title}</h2><div class=\"lead\">${practice.lead}</div><ol class=\"teaching-steps\" aria-label=\"Activity steps\">${practice.steps.map(([title,text])=>`<li><b>${title}</b><p>${text}</p></li>`).join('')}</ol><details class=\"community-notes\"><summary>Teacher Notes</summary><div class=\"community-notes-content\"><p>${practice.introduction}</p><p>${practice.support}</p>${practice.credit?`<p>${practice.credit}</p>`:''}<h3>Weekly assignment</h3><p>Squat or Pyramid Pose: Monday, Wednesday and Friday. Heart Breathing: Tuesday and Thursday. This daily assignment is the teacher-approved companion schedule; the original weekly plan says to choose from the Community Meeting plans.</p><h3>Teacher reflection notes</h3><ul>${reflection.map(text=>`<li>${text}</li>`).join('')}</ul><h3>SEL Standards</h3><p>SEL4. Self-Management. The child will demonstrate impulse control and stress management.</p><p>SEL8. Self-Management. The child will engage socially, and build relationships with other children and with adults.</p><p>SEL9. Relationship Skills. The child will demonstrate the ability to manage conflict.</p><h3>Source materials</h3><ul><li><a href=\"https://drive.google.com/file/d/1zcmiPV6midMNPtYjg1_IKx7lAKPPu0i9/view\" target=\"_blank\" rel=\"noopener\">Original Community Meeting Plan</a></li><li><a href=\"https://drive.google.com/file/d/1OmZsge2fDLnNNjeswoyp7X6qW1Rysqp6/view\" target=\"_blank\" rel=\"noopener\">Original Community Meeting Visuals (complete PDF)</a></li><li><a href=\"https://docs.google.com/document/d/1lYe4_XN0sIUJeeEt2kbxzxtzqkteNSX9woHXpfXlb7Y/edit\" target=\"_blank\" rel=\"noopener\">Original Week 2 Plan</a></li></ul><p>Focus on Pre-K 3s · Boston Public Schools Department of Early Childhood P-2. Original visual pages and credits are preserved without cropping or redrawing.</p></div></details></div></article>`;\n  window.EEASectionState=()=>({index:0,total:1,atStart:true,atEnd:true});\n  const overview=()=>{\n    localStorage.removeItem('eea-lesson-auto-resume');\n    const target=new URL('daily-lessons.html?week=10&day='+dayIndex,location.href).href;\n    // These controls can be clicked before the image and iframe.onload finish.\n    const destination=params.get('from')==='runner'&&window.parent!==window?window.parent:window;\n    destination.location.href=target;\n  };\n  ['prev','done','exit'].forEach(id=>document.getElementById(id).onclick=overview);\n})();\n";
const legacyWorkerPath='/v6-test/__qa-week10-v83-worker.js';
const legacyCache='eea-qa-week10-v83';
const legacyWorkerScript=`
const CACHE=${JSON.stringify(legacyCache)};
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  const legacy=await fetch('./__qa-week10-v83-community.js',{cache:'no-store'});
  if(!legacy.ok)throw new Error('Missing legacy fixture');
  await cache.put(new URL('./week10-community.js',self.location.href).href,legacy);
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  const isHtml=request.mode==='navigate'||request.destination==='document'||url.pathname.endsWith('.html');
  if(isHtml){event.respondWith(fetch(request,{cache:'no-store'}));return;}
  // Keep the legacy v83 non-HTML cache-first policy exactly, including its
  // ignoreSearch behavior: a query suffix cannot escape the stale JS pathname.
  event.respondWith(caches.match(request,{ignoreSearch:true}).then(cached=>cached||fetch(request).then(response=>{
    if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});}
    return response;
  })));
});`;
function testEndpoint(request,response){
  const url=new URL(request.url,'http://localhost');
  let body,type='text/javascript';
  if(url.pathname===legacyWorkerPath)body=legacyWorkerScript;
  else if(url.pathname==='/v6-test/__qa-week10-v83-community.js')body=legacyCommunityScript;
  else if(url.pathname==='/v6-test/__qa-week10-v83-boot.html'){type='text/html';body='<!doctype html><title>Isolated legacy-worker regression</title>';}
  else if(url.pathname==='/v6-test/__qa-week10-v83-community.html'){
    type='text/html';
    const legacyPath='week10-community.js'+(url.searchParams.has('bust')?'?qa-upgrade=1':'');
    body=fs.readFileSync(path.join(root,'v6-test/week10-community.html'),'utf8').replace('week10-community-v5.js',legacyPath);
  }else return false;
  response.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(body);
  return true;
}
const server=http.createServer((request,response)=>{
  if(testEndpoint(request,response))return;
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
async function verifyLegacyWorkerUpgrade(browser,base){
  // Do not weaken the ordinary fresh-context suite's serviceWorkers:'block'.
  // Only this isolated context installs a test worker and disposable Cache API data.
  const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'allow'});
  try{
    const page=await context.newPage(),errors=[],missing=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400&&!response.url().endsWith('/favicon.ico'))missing.push(`${response.status()} ${response.url()}`);});
    await page.goto(base+'__qa-week10-v83-boot.html');
    await page.evaluate(async()=>{await navigator.serviceWorker.register('./__qa-week10-v83-worker.js',{scope:'./'});await navigator.serviceWorker.ready;});
    await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/__qa-week10-v83-worker.js'));
    // The server has the current runtime, but the already-installed worker wins
    // for both the old pathname and an attempted query-string cache bust.
    const current=fs.readFileSync(path.join(root,'v6-test/week10-community.js'),'utf8');
    assert.notEqual(current,legacyCommunityScript,'Fixture really precedes the Monday behavior');
    assert.equal(await(await context.request.get(base+'week10-community.js')).text(),current,'Network origin has current same-path code');
    for(const suffix of ['', '?qa-upgrade=1']){
      const cached=await page.evaluate(async suffix=>await(await fetch('./week10-community.js'+suffix,{cache:'no-store'})).text(),suffix);
      assert.equal(cached,legacyCommunityScript,`Legacy cache remains stale for ${suffix||'same pathname'}`);
      await page.goto(base+'__qa-week10-v83-community.html?day=Monday'+(suffix?'&bust=1':''));
      await page.waitForFunction(()=>typeof window.EEASectionState==='function');
      assert.equal(await page.locator('#done').textContent(),'Return to Overview →','Legacy runtime reproduces the visible missing Monday handoff');
      assert.equal(await page.locator('script[src]').getAttribute('src'),'week10-community.js'+suffix);
    }
    // Also preserve stale Monday-only active assets from v85. This models an
    // existing Monday reader installation while keeping the original v83 fixture.
    const oldReader=fs.readFileSync(path.join(root,'v6-test/week10-read-aloud.js'),'utf8');
    const oldCommunity=fs.readFileSync(path.join(root,'v6-test/week10-community-v2.js'),'utf8');
    await page.evaluate(async ({name,reader,community})=>{const cache=await caches.open(name);await cache.put('./week10-read-aloud.js',new Response(reader));await cache.put('./week10-community-v2.js',new Response(community));},{name:legacyCache,reader:oldReader,community:oldCommunity});
    // Seed the previously deployed Tuesday assets too. Fresh Wednesday HTML
    // must escape these exact stale pathnames without deleting the old cache.
    const tuesdayReader=fs.readFileSync(path.join(root,'v6-test/week10-read-aloud-v2.js'),'utf8');
    const tuesdayCommunity=fs.readFileSync(path.join(root,'v6-test/week10-community-v3.js'),'utf8');
    await page.evaluate(async ({name,reader,community})=>{const c=await caches.open(name);await c.put('./week10-read-aloud-v2.js',new Response(reader));await c.put('./week10-community-v3.js',new Response(community));},{name:legacyCache,reader:tuesdayReader,community:tuesdayCommunity});
    const wednesdayReader=fs.readFileSync(path.join(root,'v6-test/week10-read-aloud-v3.js'),'utf8');
    const wednesdayCommunity=fs.readFileSync(path.join(root,'v6-test/week10-community-v4.js'),'utf8');
    await page.evaluate(async ({name,reader,community})=>{const c=await caches.open(name);await c.put('./week10-read-aloud-v3.js',new Response(reader));await c.put('./week10-community-v4.js',new Response(community));},{name:legacyCache,reader:wednesdayReader,community:wednesdayCommunity});
    // Still controlled by the old worker, fresh production HTML requests the
    // genuinely new v2 pathname. No unregister, reload trick or cache clearing.
    const v2Response=page.waitForResponse(response=>new URL(response.url()).pathname==='/v6-test/week10-community-v5.js');
    await page.goto(base+'week10-community.html?day=Monday');
    assert.equal(await(await v2Response).text(),fs.readFileSync(path.join(root,'v6-test/week10-community-v5.js'),'utf8'));
    await page.waitForFunction(()=>typeof window.EEASectionState==='function');
    assert.equal(await page.locator('script[src]').getAttribute('src'),'week10-community-v5.js');
    assert.equal(await page.locator('#done').textContent(),'Next: Read Aloud →');
    assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL),new URL(legacyWorkerPath,base).href,'The legacy worker is still active during recovery');
    assert.equal(await page.evaluate(async cacheName=>await(await(await caches.open(cacheName)).match('./week10-community.js')).text(),legacyCache),legacyCommunityScript,'Old poisoned entry remains; only the new pathname escaped it');
    if(screenshotDir){fs.mkdirSync(screenshotDir,{recursive:true});await page.screenshot({path:path.join(screenshotDir,'old-worker-upgrade-monday.png'),fullPage:true});}
    await page.locator('#done').click();
    await until(async()=>{
      const frame=page.frames().find(frame=>frame.parentFrame()===page.mainFrame());
      return new URL(page.url()).pathname.endsWith('/lesson-runner-week10.html')&&frame?.url().includes('/week10-read-aloud.html')&&await frame.evaluate(()=>typeof window.EEASectionState==='function'&&window.EEASectionState().index===0);
    },'Old-worker context reaches Monday Read Aloud pre-read');
    const route=new URL(page.url());assert.equal(route.searchParams.get('week'),'10');assert.equal(route.searchParams.get('day'),'0');assert.equal(route.searchParams.get('section'),'1');
    assert.equal(page.frames().length,2,'Upgrade handoff stays top-level with exactly one lesson frame');
    const reader=page.frames().find(frame=>frame.parentFrame()===page.mainFrame());
    assert.equal(new URL(reader.url()).searchParams.get('day'),'Monday');
    assert.equal(await reader.locator('#stepTitle').textContent(),'Before Reading');
    await page.goto(base+'week10-community.html?day=Tuesday');
    await page.waitForFunction(()=>typeof window.EEASectionState==='function');
    assert.equal(await page.locator('#done').textContent(),'Next: Read Aloud →');
    await page.locator('#done').click();
    await until(async()=>{const f=page.frames().find(f=>f.parentFrame()===page.mainFrame());return f?.url().includes('week10-read-aloud.html')&&await f.evaluate(()=>window.EEAReadAloudPlan?.day==='Tuesday');},'Old-worker context reaches Tuesday Read 2');
    const tuesday=page.frames().find(f=>f.parentFrame()===page.mainFrame());
    assert.equal(await tuesday.locator('script[src]').last().getAttribute('src'),'week10-read-aloud-v9.js');
    assert.equal(new URL(page.url()).searchParams.get('day'),'1');
    assert.equal(await tuesday.locator('#stepTitle').textContent(),'Before Reading · Read Again');
    assert.equal(await page.evaluate(async cacheName=>await(await(await caches.open(cacheName)).match('./week10-read-aloud.js')).text(),legacyCache),oldReader);
    await tuesday.locator('#backBtn').click();
    await until(async()=>new URL(page.url()).pathname.endsWith('daily-lessons.html'),'Tuesday old-worker exit stays top-level');
    assert.equal(new URL(page.url()).searchParams.get('day'),'1');assert.equal(page.frames().length,1);
    await page.goto(base+'week10-community.html?day=Wednesday');
    await page.waitForFunction(()=>typeof window.EEASectionState==='function');
    assert.equal(await page.locator('#done').textContent(),'Next: Read Aloud →');
    await page.locator('#done').click();
    await until(async()=>{const f=page.frames().find(f=>f.parentFrame()===page.mainFrame());return f?.url().includes('week10-read-aloud.html')&&await f.evaluate(()=>window.EEAReadAloudPlan?.day==='Wednesday');},'Old-worker context reaches Wednesday Read 3');
    const wednesday=page.frames().find(f=>f.parentFrame()===page.mainFrame());
    assert.equal(await wednesday.locator('script[src]').last().getAttribute('src'),'week10-read-aloud-v9.js');
    assert.equal(new URL(page.url()).searchParams.get('day'),'2');
    assert.equal(await wednesday.locator('#stepTitle').textContent(),'Before Reading · Act Out the Story');
    assert.equal(await page.evaluate(async n=>await(await(await caches.open(n)).match('./week10-read-aloud-v2.js')).text(),legacyCache),tuesdayReader);
    if(screenshotDir)await page.screenshot({path:path.join(screenshotDir,'old-worker-upgrade-wednesday.png'),fullPage:true});
    await wednesday.locator('#backBtn').click();
    await until(async()=>new URL(page.url()).pathname.endsWith('daily-lessons.html'),'Wednesday old-worker exit stays top-level');
    assert.equal(new URL(page.url()).searchParams.get('day'),'2');assert.equal(page.frames().length,1);
    assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
    for(const [day,index] of [['Thursday',3],['Friday',4]]){
      await page.goto(base+'week10-community.html?day='+day);
      await page.waitForFunction(()=>typeof window.EEASectionState==='function');
      assert.equal(await page.locator('#done').textContent(),'Next: Read Aloud →');
      await page.locator('#done').click();
      await until(async()=>{const f=page.frames().find(f=>f.parentFrame()===page.mainFrame());return f?.url().includes('week10-read-aloud.html')&&await f.evaluate(()=>!!window.EEAReadAloudPlan?.steps);},'Old-worker color reader');
      const color=page.frames().find(f=>f.parentFrame()===page.mainFrame());
      for(const book of ['green-chile','red-dragon']){
        await color.locator('#bookSelect').selectOption(book);
        assert.equal(new URL(page.url()).searchParams.get('book'),book);
        assert.equal(await color.locator('#bookCue').textContent(),'Use your physical book');
        assert.equal(await color.locator('#bookImg').getAttribute('src'),null);
      }
      assert.equal(new URL(page.url()).searchParams.get('day'),String(index));
      await color.locator('#backBtn').click();
      await until(async()=>new URL(page.url()).pathname.endsWith('daily-lessons.html'),'Color old-worker exit');
    }
    assert.equal(await page.evaluate(async n=>await(await(await caches.open(n)).match('./week10-read-aloud-v3.js')).text(),legacyCache),wednesdayReader);
    assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
    console.log('Existing v83 cache reproduces stale same-path/query JS; current HTML escapes via v2 and Monday Done reaches Read Aloud under the unchanged old worker');
  }finally{await context.close();}
}
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
      await until(async()=>section()?.url().includes('/week10-read-aloud.html')&&await section().evaluate(expected=>typeof window.EEASectionState==='function'&&(expected===null||window.EEASectionState().step===expected),expected),'Monday Read Aloud '+(step||'ready'));
      const f=section(),outer=new URL(page.url()),child=new URL(f.url());
      assert(outer.pathname.endsWith('/lesson-runner-week10.html'));assert.equal(outer.searchParams.get('week'),'10');assert.equal(outer.searchParams.get('day'),'0');assert.equal(outer.searchParams.get('section'),'1');
      assert.equal(child.searchParams.get('day'),'Monday');assert.equal(page.frames().length,2);assert.equal(await f.locator('iframe').count(),0);
      const resume=await page.evaluate(()=>JSON.parse(localStorage.getItem('eea-lesson-resume')));assert.equal(resume.week,10);assert.equal(resume.day,0);assert.equal(resume.section,1);
      assert.equal(outer.searchParams.get('step'),String((await state()).step),'Parent owns authoritative step URL');
      return f;
    }
    async function community(day=0){
      await until(async()=>section()?.url().includes('/week10-community.html')&&await section().evaluate(()=>typeof window.EEASectionState==='function'),'Community ready');
      const outer=new URL(page.url());assert.equal(outer.searchParams.get('day'),String(day));assert.equal(outer.searchParams.get('section'),'0');
      assert.equal(new URL(section().url()).searchParams.get('day'),['Monday','Tuesday','Wednesday','Thursday','Friday'][day]);
      assert.equal(page.frames().length,2);return section();
    }
    async function centers(){
      await until(async()=>section()?.url().includes('/week10-centers.html')&&await section().evaluate(()=>typeof window.EEASectionState==='function'&&window.EEASectionState().step===0),'Monday closing reaches first Center');
      assert.equal(new URL(page.url()).searchParams.get('section'),'2');assert.equal(page.frames().length,2);
      assert.equal(await section().locator('.community-copy h2').textContent(),'Nature Arrangements');
      return section();
    }
    async function overview(day=0){
      await until(async()=>new URL(page.url()).pathname.endsWith('/daily-lessons.html')&&await page.locator('#path .step').count()===3,'Top-level same-day overview');
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
    const route=(step='',stop='')=>`${base}lesson-runner-week10.html?week=10&day=0&section=1${step?'&step='+indexFor(step):''}${stop!==''?'&stop='+stop:''}`;
    await page.goto(`${base}daily-lessons.html?week=10&day=0`);await overview();
    await page.locator('#path .step').first().click();let f=await community();
    assert.equal(await f.locator('#done').textContent(),'Next: Read Aloud →');await f.locator('#done').click();f=await reader();
    steps=await f.evaluate(()=>window.EEAReadAloudPlan.steps||window.EEAReadAloudPlan);
    assert.equal((await state()).step,0);assert.equal(steps[0].kind,'before');
    await notes();await image(steps[0]);await shot('monday-preread-1280x800');
    // Monday boundaries are fresh top-level documents. Repeated preparation and
    // leaving/returning must preserve the same day with no duplicate listeners.
    for(let repeat=0;repeat<2;repeat++){
      await section().locator('#prev').click();await community();
      await section().locator('#done').click();await reader(steps[0].id);
    }
    await page.evaluate(()=>{const frame=document.getElementById('frame');for(let n=0;n<3;n++){dispatchEvent(new Event('pageshow'));frame.dispatchEvent(new Event('load'));}});
    await section().locator('#next').click();await reader(steps[1].id);
    await page.goBack();await reader(steps[0].id);await page.goForward();await reader(steps[1].id);
    await page.reload();await reader(steps[1].id);
    console.log('Monday Community → pre-read, repeated section boundaries, internal Back/Forward and reload pass');
    // Every source spread, six separately acknowledged stops and the final
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
    assert.equal(stopCount,6);assert.equal((await state()).atEnd,true);assert.match(await f.locator('body').textContent(),/tomorrow/i);await shot('monday-closing-1280x800');
    await f.locator('#next').click();await centers();
    await page.goBack();await reader(steps.at(-1).id);assert.equal((await state()).atEnd,true);
    await page.goForward();f=await centers();
    await f.locator('#exit').click();await overview();
    assert.equal(await page.locator('#start').textContent(),'Open Community Meeting →');
    await page.locator('#start').click();await community();
    console.log('All original spreads, six separate gated stops, closing handoff and history restoration pass');
    // Both prompts on the same image survive reload and Back/Forward without
    // being merged, skipped, or confused with vocabulary on that image.
    const paired=steps.find(s=>(s.stops||[]).length===2);
    await page.goto(route(paired.id,1));f=await reader(paired.id);
    const firstText=await f.locator('#stopText').textContent();assert.equal((await state()).stopPending,true);
    await f.locator('#next').click();const secondText=await f.locator('#stopText').textContent();assert.notEqual(secondText,firstText);assert.equal((await state()).stopPending,false);
    const secondState=await state(),secondURL=page.url();
    await page.goBack();f=await reader(paired.id);assert.equal(await f.locator('#stopText').textContent(),firstText);
    await page.goForward();f=await reader(paired.id);assert.equal(await f.locator('#stopText').textContent(),secondText);
    await page.reload();f=await reader(paired.id);assert.deepEqual(await state(),secondState);assert.equal(page.url(),secondURL);assert.equal(await f.locator('#stopText').textContent(),secondText);
    await notes();assert.equal((await state()).step,indexFor(paired.id));assert.equal((await state()).stopPending,false);
    await page.reload();await reader(paired.id);assert.equal((await state()).stopPending,false);await section().locator('#next').click();assert.notEqual((await state()).step,indexFor(paired.id));
    for(const vocabulary of steps.filter(s=>s.kind==='vocabulary')){
      await page.goto(route(vocabulary.id));f=await reader(vocabulary.id);assert.equal((await state()).vocabulary,true);
      await f.locator('#prev').click();f=await reader(vocabulary.sourceStep);assert.equal((await state()).vocabulary,false);assert.equal(await f.locator('#bookImg').getAttribute('src'),`assets/focus-3s/unit-2/week-2/strictly-no-elephants/slide-${String(vocabulary.sourceSlide).padStart(2,'0')}.jpg`);
      await page.goBack();await reader(vocabulary.id);await page.goForward();await reader(vocabulary.sourceStep);
    }
    console.log('Both slide 8 stop states and all seven vocabulary source returns survive reload and native history');
    for(const key of ['Enter','Space']){
      await page.goto(`${base}daily-lessons.html?week=10&day=0`);await overview();await page.locator('#path .step').nth(1).focus();await page.keyboard.press(key);await reader(steps[0].id);
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
    console.log('keyboard Read Aloud launch and early-loading exits pass');
    for(const viewport of [{width:1280,height:800},{width:1180,height:757}]){
      await page.setViewportSize(viewport);
      await page.goto(`${base}daily-lessons.html?week=10&day=0`);await overview();
      for(const selector of ['#path .step','#start','#weeknav button','#days button']){const controls=page.locator(selector);for(let i=0;i<await controls.count();i++)await target(controls.nth(i),`${viewport.width} overview ${selector}/${i}`);}
      await shot(`monday-overview-${viewport.width}x${viewport.height}`);
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
    await page.goto(`${base}week10-read-aloud.html?day=Monday&step=${indexFor(paired.id)}&stop=0`);
    await page.waitForFunction(()=>typeof window.EEASectionState==='function');
    const standaloneFirst=await page.evaluate(()=>window.EEASectionState());await page.locator('#next').click();const standaloneSecond=await page.evaluate(()=>window.EEASectionState());
    assert.equal(standaloneFirst.step,standaloneSecond.step);assert.notDeepEqual(standaloneFirst,standaloneSecond);
    await page.goBack();await until(async()=>JSON.stringify(await page.evaluate(()=>window.EEASectionState()))===JSON.stringify(standaloneFirst),'Standalone Back restores stop');
    await page.goForward();await until(async()=>JSON.stringify(await page.evaluate(()=>window.EEASectionState()))===JSON.stringify(standaloneSecond),'Standalone Forward restores stop');
    await page.reload();assert.deepEqual(await page.evaluate(()=>window.EEASectionState()),standaloneSecond);
    await page.locator('#backBtn').click();await overview();
    assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
    console.log('1280×800/1180×757 original-image containment, accessible controls, notes, standalone history and resource checks pass');
    await verifyLegacyWorkerUpgrade(browser,base);
  }finally{if(browser)await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
