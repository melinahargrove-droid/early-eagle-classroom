// Real Chromium, a v6-test-only server and isolated synthetic storage; no live classroom data.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const {assets,themes,roster,assetDir}=require('./test_attendance_assets.cjs');
const root=path.resolve(__dirname,'../v6-test');
const server=http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){response.writeHead(403).end();return;}
  fs.readFile(file,(error,bytes)=>{
    if(error){response.writeHead(404).end();return;}
    const type={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'}[path.extname(file)]||'application/octet-stream';
    response.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(bytes);
  });
});
const screenshotDir=process.env.ATTENDANCE_SCREENSHOT_DIR;
async function capture(page,name){if(screenshotDir){fs.mkdirSync(screenshotDir,{recursive:true});await page.screenshot({path:path.join(screenshotDir,name+'.png')});}}
async function decodeImages(page,theme){
  const result=await page.evaluate(async()=>{
    const elements=Array.from(document.images);
    const urls=[...elements.map(i=>i.src),...Array.from(document.querySelectorAll('.piece'),e=>getComputedStyle(e).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1]).filter(Boolean)];
    const loaded=[];
    for(const url of new Set(urls)) {const i=new Image();i.src=url;await i.decode();loaded.push({file:url.split('/').pop(),width:i.naturalWidth,height:i.naturalHeight});}
    for(const i of elements)await i.decode();
    return loaded;
  });
  const state=await page.locator('.piece.here').count();
  const expected=new Set([theme.background,...theme.overlays]);
  if(state<10)expected.add(theme.waiting);if(state>0)expected.add(theme.here);
  assert.deepEqual(new Set(result.map(i=>i.file)),expected);
  for(const i of result){assert.deepEqual([i.width,i.height],assets[i.file].slice(1),`${i.file} decodes at original size`);}
}
async function counts(page,here){
  assert.equal(await page.locator('.piece.here').count(),here);
  assert.equal(await page.locator('.piece.waiting').count(),10-here);
  assert.equal(await page.locator('#hereCount').textContent(),String(here));
  assert.equal(await page.locator('#waitCount').textContent(),String(10-here));
}
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}/`;
  const browser=await chromium.launch({headless:true});
  try {
    for(const theme of themes){
      const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});
      await context.addInitScript(({students})=>{
        if(!sessionStorage.getItem('qa-seeded')){
          localStorage.setItem('eea-students-v1',JSON.stringify(students));
          localStorage.setItem('eea-attendance-theme','school-bus');
          sessionStorage.setItem('qa-seeded','1');
        }
      },{students:roster(10)});
      const page=await context.newPage(),errors=[],failedImages=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('response',r=>{if(r.request().resourceType()==='image'&&!r.ok())failedImages.push(r.url());});
      // Reproduce the original missing-file failure without changing any app code.
      const pattern='**/'+assetDir+'*';
      await page.route(pattern,route=>{
        const file=new URL(route.request().url()).pathname.split('/').pop();
        if(assets[file])return route.fulfill({status:404,body:'Original missing asset'});
        return route.continue();
      });
      await page.goto(base+'attendance-themes.html');
      await page.locator(`[data-id="${theme.id}"]`).click();
      await page.locator('#previewBtn').click();
      await page.waitForURL('**/attendance-approved.html?preview=1');
      await page.waitForLoadState('networkidle');
      assert.equal(await page.locator('.piece.waiting').count(),10);
      assert.equal(await page.locator('#bg').evaluate(i=>i.naturalWidth),0,'Original missing background reproduced');
      assert(failedImages.some(url=>url.endsWith(theme.background)));
      await capture(page,theme.id+'-before');
      await page.unroute(pattern);
      failedImages.length=0;
      await page.reload();await page.locator('.piece.waiting').first().waitFor();
      await decodeImages(page,theme);await counts(page,0);
      await capture(page,theme.id+'-waiting');
      await page.locator('.piece.waiting').first().click();await counts(page,1);await decodeImages(page,theme);
      await capture(page,theme.id+'-here');
      await page.locator('.piece.here').click();await counts(page,0);await decodeImages(page,theme);
      await page.locator('.piece.waiting').first().click();
      await page.reload();await page.locator('.piece.here').waitFor();await counts(page,1);await decodeImages(page,theme);
      await page.locator('#photoToggle').click();assert.equal(await page.locator('#photoToggle').textContent(),'Photos Off');
      await page.locator('#photoToggle').click();assert.equal(await page.locator('#photoToggle').textContent(),'Photos On');
      await page.locator('#resetBtn').click();await counts(page,0);await decodeImages(page,theme);
      assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('eea-students-v1'))),roster(10));
      await page.locator('#closeBtn').click();await page.waitForURL('**/index.html');
      await page.goto(base+'attendance.html');await page.waitForURL('**/attendance-approved.html');
      await page.locator('.piece.waiting').first().waitFor();await counts(page,0);await decodeImages(page,theme);
      assert.equal(await page.locator('#stage').getAttribute('class'),'stage '+theme.css);
      assert.deepEqual(failedImages,[],'All restored images load from the self-contained V6 package');
      assert.deepEqual(errors,[]);await context.close();
      const empty=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});
      await empty.addInitScript(id=>localStorage.setItem('eea-attendance-theme',id),theme.id);
      const emptyPage=await empty.newPage();await emptyPage.goto(base+'attendance.html');
      await emptyPage.waitForURL('**/attendance-approved.html');await emptyPage.locator('.empty').waitFor();
      assert.equal(await emptyPage.locator('.piece').count(),0);
      assert.equal(await emptyPage.locator('#bg').getAttribute('src'),null,'Existing empty-state behavior preserved');
      await capture(emptyPage,theme.id+'-empty');await empty.close();
      console.log(`${theme.id}: original missing-image reproduction, selector/redirect, decoded background/overlays/CSS frames, waiting/here toggle, reload, settings/reset, close/re-entry and empty state pass`);
    }
    console.log('Both seasonal attendance themes pass in isolated Chromium with only the packaged V6 files');
  } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
