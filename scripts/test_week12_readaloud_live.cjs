// Actual deployed Pages only: no worker fixture, interception, source rewriting,
// Date shim or injected app runtime. Origin probes and consumed bodies both hash.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium,request}=require('playwright');
const {read,plan,consumedFiles,hash,verifyViewport}=require('./test_week12_readaloud_shared.cjs');
const base='https://melinahargrove-droid.github.io/early-eagle-classroom/v6-test/';
const out=process.env.WEEK12_READALOUD_LIVE_SCREENSHOT_DIR||process.env.WEEK12_READALOUD_SCREENSHOT_DIR;
const files=[...new Set([...consumedFiles,'week12-read-aloud.html','week12-read-aloud-plan.json','lesson-runner-week12.html','daily-lessons.html','sw.js','assets/focus-3s/unit-2/week-4/festival-of-colors/source-manifest.json','week11-read-aloud-v4.js','week11-read-aloud-plan-v1.js','week11-read-aloud-tuesday-plan-v1.js'])];
(async()=>{
 if(process.env.GITHUB_ACTIONS==='true')assert.equal(process.env.GITHUB_REF,'refs/heads/main','Live Pages verification runs on main only');
 const expected=Object.fromEntries(files.map(file=>[file,hash(read(file))])),servedHashes={},evidence={base,commit:process.env.GITHUB_SHA||null,expected,servedHashes,verification:'Actual deployed Pages; exact first browser response bodies; no fixtures, route interception, injected runtime, Date shim, response refetch fallback or source substitution'},api=await request.newContext();
 const limit=20*60*1000,end=Date.now()+limit;let pending;
 try{
  while(true){pending=[];for(const file of files){assert(Date.now()<end,'Expected Pages deployment did not arrive within 20 minutes: '+(pending.join('; ')||file));try{const response=await api.get(base+file+'?week12-live='+Date.now(),{headers:{'Cache-Control':'no-cache'},timeout:Math.max(1,Math.min(30000,end-Date.now()))});if(!response.ok()){pending.push(file+': HTTP '+response.status());continue;}const digest=hash(await response.body());if(digest!==expected[file]){pending.push(file+': stale bytes');continue;}servedHashes[file]=digest;}catch(e){pending.push(file+': '+e.message.split('\n')[0]);}}
   if(!pending.length)break;assert(Date.now()<end,'Expected Pages deployment did not arrive within 20 minutes: '+pending.join('; '));await new Promise(r=>setTimeout(r,5000));
  }
 }finally{await api.dispose();}
 assert.deepEqual(servedHashes,expected,'All deployed files match the expected checkout');
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,ignoreDefaultArgs:['--disable-back-forward-cache']});
 try{evidence.browser=await browser.version();for(const viewport of [{width:1920,height:1080},{width:1366,height:768}])await verifyViewport(browser,base,viewport,out,evidence);}finally{await browser.close();}
 if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'live-verification-manifest.json'),JSON.stringify(evidence,null,2));}
 console.log('PASS: deployed Week12 Monday exact source/runtime/image hashes, every source note and all '+plan.steps.length+' screens/toggles at both viewports');
})().catch(e=>{console.error(e);process.exitCode=1;});
