// Actual deployed Pages acceptance only. No fixtures, route interception, source
// replacement, Date shim or injected application runtime. Origin hashes and
// exact first browser-consumed response hashes are recorded independently.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium,request}=require('playwright');
const {read,hash,asset,consumedFiles,viewports,until,captureBytes,verifyViewport,verifyHistory}=require('./test_week11_community_shared.cjs');
const base='https://melinahargrove-droid.github.io/early-eagle-classroom/v6-test/';
const out=process.env.WEEK11_COMMUNITY_LIVE_SCREENSHOT_DIR;
(async()=>{
 if(process.env.GITHUB_ACTIONS==='true')assert.equal(process.env.GITHUB_REF,'refs/heads/main','Pages acceptance runs on main only');
 const files=[...consumedFiles,asset+'SOURCE.md','sw.js'],expected=Object.fromEntries(files.map(file=>[file,hash(read(file))])),servedHashes={},browserRuntimeHashes={};
 const api=await request.newContext();let lastMismatch;
 try{await until(async()=>{for(const file of files){const response=await api.get(base+file+'?week11-community-live='+Date.now(),{headers:{'Cache-Control':'no-cache'}});if(!response.ok()){lastMismatch={file,status:response.status()};return false;}const digest=hash(await response.body());if(digest!==expected[file]){lastMismatch={file,expected:expected[file],actual:digest};return false;}servedHashes[file]=digest;}return true;},'Pages serves this exact mindful Community release',20*60*1000,5000);}catch(error){if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'origin-hash-failure.json'),JSON.stringify({base,commit:process.env.GITHUB_SHA||null,lastMismatch,servedHashes,expected,error:error.stack},null,2));}throw error;}finally{await api.dispose();}
 assert.deepEqual(servedHashes,expected);
 const browser=await chromium.launch({headless:true});let browserVersion;
 try{browserVersion=await browser.version();for(const viewport of viewports)await verifyViewport(browser,base,viewport,out,(page,suffix)=>{browserRuntimeHashes[suffix]={};return captureBytes(page,base,expected,browserRuntimeHashes[suffix]);});await verifyHistory(browser,base,viewports[1],out);}finally{await browser.close();}
 if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'verified-bytes.json'),JSON.stringify({base,commit:process.env.GITHUB_SHA||null,platform:process.platform,browser:browserVersion,expected,servedHashes,browserRuntimeHashes,viewports,verification:'Actual deployed Pages; exact first browser response bodies; no fixtures, substituted source, intercepted routes, clock shim, application runtime injection, hash fallback or response refetch'},null,2));}
 console.log('PASS: live Week11 Community assignment/history/layout and exact origin + first browser-consumed hashes');
})().catch(error=>{console.error(error);process.exitCode=1;});
