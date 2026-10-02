// Actual deployed Pages only: no fixtures, interception, source replacement,
// clock shim or injected application runtime. Origin and consumed hashes differ.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const {read,plan,consumedFiles,hash,until,captureRuntimeBytes,verifyViewport} = require('./test_week11_centers_friday_shared.cjs');
const base = 'https://melinahargrove-droid.github.io/early-eagle-classroom/v6-test/';
const out = process.env.WEEK11_FRIDAY_LIVE_SCREENSHOT_DIR;
(async () => {
 const {chromium,request} = require('playwright');
 if (process.env.GITHUB_ACTIONS === 'true') assert.equal(process.env.GITHUB_REF,'refs/heads/main','Pages acceptance runs on main only');
 const files = [...new Set([...consumedFiles,'week11-centers.html','week11-centers-friday-plan.json','lesson-runner-week11.html','daily-lessons.html','sw.js','week11-centers-v1.js','week11-centers-v2.js','week11-centers-v3.js','week11-centers-v4.js','week11-centers-thursday-plan.json','week11-centers-wednesday-plan.json','week11-centers-monday-plan.json','week11-centers-tuesday-plan.json','week11-read-aloud.html','week11-read-aloud-v2.js','week11-read-aloud-v3.js','week11-read-aloud-v4.js','week11-read-aloud-plan-v1.js','week11-read-aloud-tuesday-plan-v1.js',...plan.flatMap(p => (p.sources || []).map(s => s.url).filter(url => url.startsWith('assets/')))])];
 const expected = Object.fromEntries(files.map(file => [file,hash(read(file))])), servedHashes = {}, browserRuntimeHashes = {}, api = await request.newContext();
 try {
  await until(async () => {for (const file of files) {const response = await api.get(base + file + '?week11-live=' + Date.now(),{headers:{'Cache-Control':'no-cache'}});if (!response.ok()) return false;const digest = hash(await response.body());if (digest !== expected[file]) return false;servedHashes[file] = digest;}return true;},'Pages serves exact Friday source/runtime/plan/image hashes',20 * 60 * 1000,5000);
 } finally {await api.dispose();}
 assert.deepEqual(servedHashes,expected);
 const browser = await chromium.launch({headless:true});
 try {for (const viewport of [{width:1280,height:800},{width:1180,height:757}]) await verifyViewport(browser,base,viewport,out,(page,suffix) => {browserRuntimeHashes[suffix] = {};return captureRuntimeBytes(page,base,expected,browserRuntimeHashes[suffix]);});} finally {await browser.close();}
 if (out) {fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'verified-bytes.json'),JSON.stringify({base,commit:process.env.GITHUB_SHA || null,expected,servedHashes,browserRuntimeHashes,verification:'Actual deployed Pages; exact first browser response bodies; no source substitution, mocked routing, Date shim, runtime injection, hash fallback or response refetch'},null,2));}
 console.log('PASS: deployed Week11 Friday hashes and exact first browser-consumed bytes verified');
})().catch(error => {console.error(error);process.exitCode = 1;});
