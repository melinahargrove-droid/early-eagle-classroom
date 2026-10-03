// Real Community Meeting acceptance shared by local Linux, prepared Windows,
// and live Pages. No source substitution, clock shim or application injection.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {target}=require('./test_week10_centers_thursday_target.cjs');
const root=path.resolve(process.env.WEEK11_COMMUNITY_APP_ROOT||path.join(__dirname,'../v6-test'));
const read=file=>fs.readFileSync(path.join(root,file));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
const titles=['Boat Pose','Square Breathing'];
const asset='assets/focus-3s/unit-2/week-3/community/';
const images={illustration:'boat-pose.jpg',chair:'boat-pose-chair.jpg',square:'square-breathing.jpg'};
const imageHashes={
 'boat-pose.jpg':'73baeb945c437e3f95a599788a24ca80615f2429bc93c855ff8110926720603c',
 'boat-pose-chair.jpg':'4c3092fccaf2a541eeefad759ec24fe7bfa7e8a6c154768de5fe1c9772f1ee59',
 'square-breathing.jpg':'1f1270f6c9712e55631b1ab8a4b4041201501d7fd29b49fa4368e239113dffb8'
};
const links=[
 ['Original Community Meeting Plan','https://drive.google.com/file/d/10CEcbmXfoajcKKB8Lbdsgv9nnQ6IuTnZ/view'],
 ['Original Community Meeting Visuals (complete PDF)','https://drive.google.com/file/d/1aRrGS6Xq3fJmjbuPG4-_3Y51DxO1O0w_/view'],
 ['Original Week 3 Plan','https://docs.google.com/document/d/135vSqhP-fhVwzw67338NH4NQ2569uj8S3vVbWURFRLY/edit']
];
const directions=[[
 'Do this together with the children. Invite children to sit on the floor with their feet on the ground and their knees bent.',
 'This is a tricky balancing pose and you can try just one of these steps or all of them.',
 'Let’s try together:',
 'Put your feet on the ground and hug your knees gently. Put your arms behind you and point your toes.',
 'When you are ready, lean back and lift up your legs. You can stretch out your arms and balance. Don’t forget to breathe!',
 'Only one leg could be lifted at a time and/or use a chair. (see visual)'
],[
 'Do this together with the children.',
 'Find a comfortable sitting position. We will count mentally while we breathe.',
 'Breathe in and count to four mentally: one, two, three, four… You can keep track of your counting by tracing an imaginary square with your finger',
 'Model by tracing a finger in the air.',
 'Hold your breath and count to four mentally as you trace another side of the square.',
 'Breathe out as you count to four.',
 'Then hold your breath again to the count of four and trace the square.',
 'Repeat a few times. When you are done, rest with your eyes closed.'
]];
const sharedNotes=[
 ['Weekly assignment',['Boat Pose: Monday, Wednesday and Friday. Square Breathing: Tuesday and Thursday. This daily assignment is the teacher-approved companion schedule; the original weekly plan says to choose from the Community Meeting plans.']],
 ['Teacher reflection notes',['Notice how children respond to mindfulness practice. Do they prefer yoga poses or breathing exercise? What does that tell you about them and the dynamics of the group?']],
 ['SEL Standards',['SEL4. Self-Management. The child will demonstrate impulse control and stress management.','SEL8. Self-Management. The child will engage socially, and build relationships with other children and with adults.','SEL9. Relationship Skills. The child will demonstrate the ability to manage conflict.']],
 ['Original visual credits',['Boat Pose: Guber, T., Kalish, L., & Fatus, S. (2005). Yoga Pretzel Activity Cards.','Boat Pose on Chair: Photo of Unicia Young by Marina Boni.','Square Breathing: Calmerry, “Teaching your kids square breathing while having fun.” The original source address is retained on the full-page visual.']]
];
const runtimeFiles=['week11-community-v1.js','week11-read-aloud-plan-v1.js','week11-read-aloud-tuesday-plan-v1.js','week11-read-aloud-v4.js','week11-centers-monday-plan-v1.js','week11-centers-tuesday-plan-v1.js','week11-centers-wednesday-plan-v1.js','week11-centers-thursday-plan-v1.js','week11-centers-friday-plan-v1.js','week11-centers-v5.js'];
const consumedFiles=['daily-lessons.html','lesson-runner-week11.html','week11-community.html','week11-read-aloud.html','week11-centers.html',...runtimeFiles,...Object.values(images).map(name=>asset+name)];
const viewports=[{width:1920,height:1080},{width:1280,height:800},{width:1366,height:768}];
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check,label,timeout=20000,interval=25){let last;const end=Date.now()+timeout;while(Date.now()<end){try{if(await check())return;}catch(e){last=e;}await delay(interval);}assert.fail(label+(last?': '+last.message:''));}
const captures=new WeakMap();
function captureBytes(page,base,expected,verified,files=consumedFiles){
 assert(!captures.has(page),'One first-response capture per page');assert.equal(new Set(files).size,files.length,'Tracked response paths are unique');for(const file of files)assert.equal(typeof expected[file],'string','Expected digest exists: '+file);
 const pending=new Map(),wanted=new Map(files.map(file=>[new URL(file,base).href,file]));
 const listener=response=>{const u=new URL(response.url());u.search='';u.hash='';const file=wanted.get(u.href);if(!file||pending.has(file))return;
  pending.set(file,Promise.resolve().then(()=>response.body()).then(bytes=>{const digest=hash(bytes);assert.equal(digest,expected[file],'Exact first browser-consumed bytes: '+file);verified[file]=digest;return {ok:true};}).catch(error=>({ok:false,error})));
 };
 const capture={async verify(file){await until(()=>pending.has(file),'Browser consumed '+file);const value=await pending.get(file);if(!value.ok)throw value.error;},async beforeNavigation(){await Promise.all([...pending.keys()].map(file=>this.verify(file)));},async finish(){await Promise.all(files.map(file=>this.verify(file)));assert.deepEqual(Object.keys(verified).sort(),[...files].sort());page.off('response',listener);captures.delete(page);}};
 page.on('response',listener);captures.set(page,capture);return capture;
}
async function navigate(page,action){await captures.get(page)?.beforeNavigation();return action();}
function diagnostics(page){const errors=[],missing=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))missing.push(r.status()+' '+r.url());});page.on('requestfailed',r=>{if(!/ERR_ABORTED|NS_BINDING_ABORTED/.test(r.failure()?.errorText||''))failed.push(r.failure()?.errorText+' '+r.url());});const clean=()=>{assert.deepEqual(errors,[],'No page errors');assert.deepEqual(missing,[],'No missing responses');assert.deepEqual(failed,[],'No failed resource requests');};clean.records={errors,missing,failed};return clean;}
const child=page=>page.frames().find(f=>f.parentFrame()===page.mainFrame());
function route(base,day,standalone=false,visual){return base+(standalone?'week11-community.html?week=11&day='+days[day]:'lesson-runner-week11.html?week=11&day='+day)+'&section=2'+(visual?'&visual='+visual:'');}
async function overview(page,day){
 await until(async()=>{const u=new URL(page.url());return u.pathname.endsWith('/daily-lessons.html')&&u.searchParams.get('week')==='11'&&u.searchParams.get('day')===String(day)&&await page.locator('#path .step').count()===(day<2?3:2);},'Same-day overview '+days[day]);
 assert.equal(page.frames().length,1,'Overview is top-level');
 assert.deepEqual(await page.locator('#path .step b').allTextContents(),day<2?['Community Meeting','Read Aloud','Centers']:['Community Meeting','Centers']);
 assert.equal(await page.locator('#path .step span').first().textContent(),titles[day%2]);
 assert.equal(await page.locator('#start').textContent(),'Open Community Meeting →');
 assert.equal(await page.locator('#start').isDisabled(),false);
}
async function community(page,day,standalone=false,visual=day%2?'square':'illustration'){
 await until(async()=>{const f=standalone?page:child(page);return f?.url().includes('/week11-community.html')&&await f.evaluate(expected=>typeof EEASectionState==='function'&&EEASectionState().visual===expected,visual);},days[day]+' Community '+visual);
 const f=standalone?page:child(page);assert.equal(page.frames().length,standalone?1:2);assert.equal(await f.locator('iframe,select,#activityMenu,#count').count(),0);
 assert.equal(await f.locator('.community-card').count(),1);assert.equal(await f.locator('h2').textContent(),titles[day%2]);assert.equal(await f.locator('#sub').textContent(),days[day]+' · Mindful practice');
 assert.deepEqual(await f.evaluate(()=>EEASectionState()),{index:0,step:0,total:1,atStart:true,atEnd:true,visual});
 for(const [url,dayValue] of [[page.url(),standalone?days[day]:String(day)],[f.url(),days[day]]]){const p=new URL(url).searchParams;assert.equal(p.get('week'),'11');assert.equal(p.get('day'),dayValue);assert.equal(p.get('section'),'2');assert.equal(p.get('visual'),visual);assert.equal(p.has('step'),false);}
 if(!standalone){assert.deepEqual(await page.evaluate(()=>{const r=JSON.parse(localStorage.getItem('eea-lesson-resume'));return [r.week,r.day,r.section];}),[11,day,2]);}
 assert.equal(await f.locator('#prev').textContent(),'← Day Overview');assert.equal(await f.locator('#done').textContent(),day<2?'Next: Read Aloud →':'Next: Centers →');
 assert.equal(await f.locator('#exit').getAttribute('aria-label'),'Return to Day Overview');
 assert.equal(await f.locator('.teaching-steps li').count(),day%2?4:3);
 assert.equal(await f.locator('#chair,#illustration').count(),day%2?0:2);
 if(day%2===0)for(const key of ['chair','illustration'])assert.equal(await f.locator('#'+key).getAttribute('aria-pressed'),String(key===visual));
 await captures.get(page)?.verify('week11-community-v1.js');return f;
}
async function imageReady(page,f,visual,selector='#practice-image'){
 const img=f.locator(selector);await img.evaluate(async e=>{await e.decode();if(e.naturalWidth!==1855||e.naturalHeight!==2400)throw Error('Full source page dimensions changed');});
 assert(new URL(await img.getAttribute('src'),f.url()).pathname.endsWith('/'+asset+images[visual]));assert.match(await img.getAttribute('alt'),/^Original /);assert.equal(await img.evaluate(e=>getComputedStyle(e).objectFit),'contain');
 await target(img,visual+' full-page visual');await captures.get(page)?.verify(asset+images[visual]);
}
async function nextSection(page,day,section=day<2?0:1){
 const file=section===0?'week11-read-aloud.html':'week11-centers.html';
 await until(async()=>child(page)?.url().includes('/'+file)&&await child(page).evaluate(()=>typeof EEASectionState==='function'),'Existing '+file+' on '+days[day]);
 assert.equal(page.frames().length,2);const f=child(page);for(const [url,d] of [[page.url(),String(day)],[f.url(),days[day]]]){const p=new URL(url).searchParams;assert.equal(p.get('week'),'11');assert.equal(p.get('day'),d);assert.equal(p.get('section'),String(section));assert.equal(p.has('visual'),false);}
 assert.deepEqual(await page.evaluate(()=>{const r=JSON.parse(localStorage.getItem('eea-lesson-resume'));return[r.week,r.day,r.section];}),[11,day,section]);
 await captures.get(page)?.beforeNavigation();return f;
}
async function shot(page,out,name){if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});}}
async function notesAndModal(page,f,day,visual,out,name){
 const url=page.url(),length=await page.evaluate(()=>history.length),state=await f.evaluate(()=>EEASectionState());
 assert.equal(await f.locator('details').evaluate(e=>e.open),false);
 assert.deepEqual(await f.locator('.community-notes-content').evaluate(el=>{const sections=[];for(const n of el.children){if(n.tagName==='H3'){if(n.textContent==='Source materials')break;sections.push([n.textContent,[]]);}else if(n.tagName==='P')sections.at(-1)[1].push(n.textContent);}return sections;}),[['Complete mindful practice',directions[day%2]],...sharedNotes]);
 assert.deepEqual(await f.locator('.community-notes-content a').evaluateAll(a=>a.map(e=>[e.textContent,e.getAttribute('href')])),links);
 assert(await f.locator('.community-notes-content a').evaluateAll(a=>a.every(e=>e.target==='_blank'&&e.relList.contains('noopener')&&e.relList.contains('noreferrer'))));
 for(let i=0;i<3;i++){await f.locator('summary').press(i%2?'Space':'Enter');assert(await f.locator('details').evaluate(e=>e.open));await until(()=>f.locator('.community-notes-content p').first().evaluate(e=>{const r=e.getBoundingClientRect(),p=e.closest('.community-copy').getBoundingClientRect();return r.top>=p.top&&r.bottom<=p.bottom;}),'Opening notes reveals source prose');await target(f.locator('.community-notes-content p').first(),'First note visible on opening');if(i===0){await shot(page,out,name+'-notes');for(let n=0;n<3;n++){await f.locator('.community-notes-content a').nth(n).scrollIntoViewIfNeeded();await target(f.locator('.community-notes-content a').nth(n),'Teacher source link');}for(const id of ['prev','done','exit'])await target(f.locator('#'+id),'Notes open '+id);await shot(page,out,name+'-sources');}await f.locator('summary').press('Enter');assert.equal(await f.locator('details').evaluate(e=>e.open),false);}
 for(const close of ['button','Escape','backdrop']){
  await f.locator('#enlarge').press(close==='Escape'?'Space':'Enter');assert(await f.locator('#image-dialog').evaluate(e=>e.open&&e.matches(':modal')));await imageReady(page,f,visual,'#enlarged-image');await target(f.locator('#close-image'),'Modal close');
  assert(await f.locator('#close-image').evaluate(e=>e===document.activeElement),'Close initially focused');
  await page.keyboard.press('Tab');assert(await f.evaluate(()=>{const a=document.activeElement,d=document.getElementById('image-dialog');return a===document.body||a===document.documentElement||d.contains(a);}), 'Modal background is inert');
  let returned=false;for(let n=0;n<8;n++){await page.keyboard.press('Shift+Tab');if(await f.locator('#close-image').evaluate(e=>e===document.activeElement&&document.hasFocus())){returned=true;break;}}assert(returned,'Close remains keyboard-reachable');
  if(close==='button'){await shot(page,out,name+'-enlarged');await f.locator('#close-image').click();}else if(close==='Escape')await page.keyboard.press('Escape');else{const b=await f.locator('#image-dialog').boundingBox();await page.mouse.click(b.x-2,b.y+20);}
  assert.equal(await f.locator('#image-dialog').evaluate(e=>e.open),false);assert(await f.locator('#enlarge').evaluate(e=>e===document.activeElement),'Modal dismissal restores enlarge focus');
 }
 assert.equal(page.url(),url);assert.equal(await page.evaluate(()=>history.length),length);assert.deepEqual(await f.evaluate(()=>EEASectionState()),state);
}
async function layout(page,f,visual){
 await target(f.locator('.community-notes summary'),'Teacher Notes initially fully visible without assisted scrolling');
 assert(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),'No page-level overflow');
 for(const s of ['h1','#sub','.community-copy h2','.lead','#prev','#done','#exit','#enlarge','.community-notes summary']){await f.locator(s).scrollIntoViewIfNeeded();await target(f.locator(s),s);}
 for(const s of ['#chair','#illustration'])if(await f.locator(s).count())await target(f.locator(s),s);
 const copy=await f.locator('.community-copy').evaluate(e=>({width:e.scrollWidth<=e.clientWidth+1,font:parseFloat(getComputedStyle(e.querySelector('.lead')).fontSize)}));assert(copy.width&&copy.font>=21,'Readable prompt without horizontal clipping');
 const image=await f.locator('#practice-image').boundingBox();assert(image.width>=350&&image.height>=350,'Classroom-scale source visual');
 await imageReady(page,f,visual);
}
async function verifyViewport(browser,base,viewport,out,onCapture){
 const context=await browser.newContext({viewport,serviceWorkers:'block'}),suffix=viewport.width+'x'+viewport.height;
 try{
  const page=await context.newPage(),clean=diagnostics(page),capture=onCapture?.(page,suffix);
  try{
   for(let day=0;day<5;day++){
    await navigate(page,()=>page.goto(base+'daily-lessons.html?week=11&day='+day));await overview(page,day);
    for(const s of ['#weeknav button','#days button','#path .step','#start','.home','.pace'])for(let n=0;n<await page.locator(s).count();n++)await target(page.locator(s).nth(n),'Overview '+s+'/'+n);
    await shot(page,out,suffix+'-'+days[day]+'-overview');
    await navigate(page,()=>page.locator('#path .step').first().press(day%2?'Space':'Enter'));let f=await community(page,day);await imageReady(page,f,day%2?'square':'illustration');await layout(page,f,day%2?'square':'illustration');
    await shot(page,out,suffix+'-'+days[day]+'-community');await notesAndModal(page,f,day,day%2?'square':'illustration',out,suffix+'-'+days[day]);
    if(day%2===0){await f.locator('#chair').click();f=await community(page,day,false,'chair');await imageReady(page,f,'chair');await shot(page,out,suffix+'-'+days[day]+'-chair');await notesAndModal(page,f,day,'chair',out,suffix+'-'+days[day]+'-chair');}
    await navigate(page,()=>page.reload());f=await community(page,day,false,day%2?'square':'chair');
    await navigate(page,()=>f.locator('#done').click());await nextSection(page,day);
    await navigate(page,()=>page.goBack());await community(page,day,false,day%2?'square':'chair');
    await navigate(page,()=>page.goForward());f=await nextSection(page,day);await navigate(page,()=>f.locator(day<2?'#backBtn':'#exit').click());await overview(page,day);
    for(const standalone of [false,true])for(const id of ['prev','exit']){
     await navigate(page,()=>page.goto(route(base,day,standalone)));f=await community(page,day,standalone);await imageReady(page,f,day%2?'square':'illustration');
     const resume=await page.evaluate(()=>localStorage.getItem('eea-lesson-resume'));
     await navigate(page,()=>f.locator('#'+id).click());await overview(page,day);assert.equal(await page.evaluate(()=>localStorage.getItem('eea-lesson-resume')),resume,'Overview preserves saved lesson');
     await navigate(page,()=>page.goBack());await community(page,day,standalone);await navigate(page,()=>page.goForward());await overview(page,day);
    }
    await navigate(page,()=>page.goto(route(base,day,true)));f=await community(page,day,true);await navigate(page,()=>f.locator('#done').click());await nextSection(page,day);
   }
   // Existing reader/Center deep links keep their historical section numbers.
   for(let day=0;day<5;day++)for(const section of day<2?[0,1]:[1]){await navigate(page,()=>page.goto(base+'lesson-runner-week11.html?week=11&day='+day+'&section='+section+'&step=1'));const f=await nextSection(page,day,section);assert.equal(await f.evaluate(()=>EEASectionState().step),1,'Existing saved section route retains its step');}
   await capture?.finish();clean();console.log('PASS: all five assignments, notes/modal, runner/standalone boundaries, preserved existing routes and geometry '+suffix);
  }catch(e){await shot(page,out,suffix+'-failure').catch(()=>{});if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,suffix+'-failure.json'),JSON.stringify({url:page.url(),frames:page.frames().map(f=>f.url()),diagnostics:clean.records,error:e.stack},null,2));}throw e;}
 }finally{await context.close();}
}
async function verifyHistory(browser,base,viewport,out){
 for(const standalone of [false,true])for(const day of [0,2,4]){
  const context=await browser.newContext({viewport,serviceWorkers:'block'});
  try{const page=await context.newPage(),clean=diagnostics(page);await page.goto(route(base,day,standalone));let f=await community(page,day,standalone);await imageReady(page,f,'illustration');const length=await page.evaluate(()=>history.length);assert(length<5,'Fresh uncapped history');
   for(let n=0;n<6;n++){const v=n%2?'illustration':'chair';await f.locator('#'+v).press(n%2?'Space':'Enter');f=await community(page,day,standalone,v);await imageReady(page,f,v);assert.equal(await page.evaluate(()=>history.length),length+n+1,'Exactly one parent-owned visual history entry');await f.locator('#'+v).click();assert.equal(await page.evaluate(()=>history.length),length+n+1,'Selecting current visual is idempotent');}
   await f.locator('#chair').click();f=await community(page,day,standalone,'chair');await f.locator('#enlarge').click();assert(await f.locator('#image-dialog').evaluate(e=>e.open));await page.goBack();f=await community(page,day,standalone,'illustration');assert.equal(await f.locator('#image-dialog').evaluate(e=>e.open),false,'Back closes stale modal');
   await page.goForward();f=await community(page,day,standalone,'chair');await page.reload();f=await community(page,day,standalone,'chair');assert.equal(await page.evaluate(()=>history.length),length+7,'Reload adds no history entry');
   for(let n=0;n<3;n++){await page.goBack();await community(page,day,standalone,'illustration');await page.goForward();await community(page,day,standalone,'chair');}
   await f.locator('#exit').click();await overview(page,day);await page.goBack();f=await community(page,day,standalone,'chair');await imageReady(page,f,'chair');await page.goForward();await overview(page,day);clean();
  }catch(e){throw new Error('Visual history '+days[day]+' '+(standalone?'standalone':'runner')+': '+e.stack);}finally{await context.close();}
 }
 console.log('PASS: exact visual history, duplicate clicks, modal interruption, refresh and repeated Back/Forward for all Boat days, runner and standalone');
}
module.exports={root,read,hash,days,titles,asset,images,imageHashes,links,directions,sharedNotes,runtimeFiles,consumedFiles,viewports,until,captureBytes,navigate,diagnostics,child,route,overview,community,imageReady,nextSection,shot,verifyViewport,verifyHistory};
