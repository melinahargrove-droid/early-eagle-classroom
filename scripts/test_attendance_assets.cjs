// Asset-only attendance regression. All roster data is disposable synthetic test data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { JSDOM, ResourceLoader, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..'), app = path.join(root, 'v6-test');
const assetDir = 'assets/assets/attendance-themes/';
const assets = {
  'pumpkin-background.png': ['5fbd4f582156e2db3cd9450aa4e8284ce46405d33b717f6644acfe24d5b37bfc',1731,909],
  'pumpkin-crate.png': ['b73bf7d0bdd4b2e735547bb25d2f06cbb6ee80250d60663f9716d0180ee4498c',1731,909],
  'pumpkin-crate-front.png': ['8c8a04d7bfc47078d32cf2ef7f67116bdf76d39a711a4921fe44637f1eae95e4',1731,909],
  'pumpkin-waiting-frame.png': ['951419cf456a83dcbbcd900aa03c32986fa35068f00a261a2f443840bc0bbd8a',944,945],
  'halloween-background.png': ['c55323172663fcdecdbca8a7341bd6ce7347ffcd43f0b7724187dcd8f0519be4',1672,941],
  'halloween-bucket-front.png': ['6aad48ab19397eb1cf96121e46a1bfc9af92bd7ebe2f56a132369213a9a2380a',1672,941],
  'halloween-waiting-ghost.png': ['fda7ee964cdf9b8b6e8f37055eba73b2c5897fa17238a7da57dbf8cea42b7174',1312,1199],
  'halloween-here-candy.png': ['e52d5e5f6912ffbf050c27afee08a6adbd7dbc9e537fe5381997886ff92e3661',979,892]
};
const themes = [
  {id:'pumpkin-patch',css:'pumpkin',background:'pumpkin-background.png',waiting:'pumpkin-waiting-frame.png',here:'pumpkin-waiting-frame.png',overlays:['pumpkin-crate.png','pumpkin-crate-front.png']},
  {id:'halloween',css:'halloween',background:'halloween-background.png',waiting:'halloween-waiting-ghost.png',here:'halloween-here-candy.png',overlays:['halloween-bucket-front.png']}
];
const roster = count => Array.from({length:count},(_,i)=>({id:`qa-${i+1}`,name:`QA Example ${i+1}`,active:true,photo:''}));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const delay = ms => new Promise(resolve=>setTimeout(resolve,ms));
function verifyAssets() {
  assert.equal(hash(fs.readFileSync(path.join(app,'attendance-approved.html'))),'11ed98a3fa2848b585f483177461571001d31bc5a0b5ab55bfdc8e5e08887e67','Attendance layout, settings and data logic remain byte-for-byte unchanged');
  for(const [file,[sha,width,height]] of Object.entries(assets)) {
    const original=fs.readFileSync(path.join(root,file));
    assert.equal(hash(original),sha,`Original ${file} is preserved`);
    const target=path.join(app,assetDir,file);
    assert(fs.existsSync(target),`Missing active attendance asset: ${assetDir}${file}`);
    const copy=fs.readFileSync(target);
    assert.equal(hash(copy),sha,`Packaged ${file} is the unchanged original`);
    assert.equal(copy.subarray(1,4).toString(),'PNG');
    assert.equal(copy.readUInt32BE(16),width);assert.equal(copy.readUInt32BE(20),height);
  }
}
class AppFiles extends ResourceLoader {
  fetch(url) {
    const target=path.join(app,new URL(url).pathname.replace(/^\/v6-test\//,''));
    return Promise.resolve(fs.readFileSync(target));
  }
}
async function run() {
  verifyAssets();
  const html=fs.readFileSync(path.join(app,'attendance-approved.html'),'utf8');
  const router=fs.readFileSync(path.join(app,'attendance.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
  let checked=0;
  for(const theme of themes) {
    let target;
    vm.runInNewContext(router,{localStorage:{getItem:()=>theme.id},location:{search:'?preview=1',replace:value=>target=value}});
    assert.equal(target,'attendance-approved.html?preview=1',`${theme.id} is reachable from existing attendance entry`);
    for(const count of [0,1,10,15,20,25,30]) {
      const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
      const dom=new JSDOM(html,{url:'https://eea.test/v6-test/attendance-approved.html?preview=1',runScripts:'dangerously',resources:new AppFiles(),virtualConsole:vc,beforeParse(w){
        w.localStorage.setItem('eea-attendance-theme',theme.id);
        w.localStorage.setItem('eea-students-v1',JSON.stringify(roster(count)));
      }});
      const w=dom.window,d=w.document;
      for(let i=0;i<100&&!d.querySelector(count?'.piece':'.empty');i++)await delay(10);
      assert(d.getElementById('stage').classList.contains(theme.css));
      assert.equal(d.querySelectorAll('.piece').length,count);
      if(count===0) {
        assert(d.querySelector('.empty'));assert.equal(d.getElementById('bg').getAttribute('src'),null);
      } else {
        assert.equal(d.getElementById('bg').getAttribute('src'),assetDir+theme.background);
        assert.deepEqual(Array.from(d.querySelectorAll('#extra img'),i=>i.getAttribute('src')),theme.overlays.map(f=>assetDir+f));
        function state(here) {
          assert.equal(d.querySelectorAll('.piece.here').length,here);
          assert.equal(d.querySelectorAll('.piece.waiting').length,count-here);
          assert.equal(d.getElementById('hereCount').textContent,String(here));
          assert.equal(d.getElementById('waitCount').textContent,String(count-here));
          assert.equal(JSON.parse(w.localStorage.getItem('eea-attendance-present')).length,here);
          for(const piece of d.querySelectorAll('.piece')) {
            const file=piece.classList.contains('here')?theme.here:theme.waiting;
            // JSDOM does not expand these background-size shorthands; Chromium checks computed images.
            const selector=`.${theme.css} .piece.${piece.classList.contains('here')?'here':'waiting'}`;
            const rule=Array.from(d.styleSheets[0].cssRules).find(r=>r.selectorText===selector);
            assert(rule.style.background.includes(assetDir+file));
            assert.equal(piece.querySelectorAll('img').length,0,'Synthetic roster has no photos');
          }
        }
        state(0);
        for(let i=1;i<=count;i++){d.querySelector('.piece.waiting').click();state(i);}
        for(let i=count-1;i>=0;i--){d.querySelector('.piece.here').click();state(i);}
        d.getElementById('photoToggle').click();assert.equal(d.getElementById('photoToggle').textContent,'Photos Off');
        d.getElementById('photoToggle').click();assert.equal(d.getElementById('photoToggle').textContent,'Photos On');
        d.querySelector('.piece').click();d.getElementById('resetBtn').click();state(0);checked+=count;
      }
      assert.deepEqual(errors,[]);dom.window.close();
    }
  }
  console.log(`Attendance assets: eight exact original PNGs restored; both routes, empty state, ${checked} synthetic pieces across every size bucket, waiting/here, photo toggle and reset pass`);
}
module.exports={assets,themes,roster,assetDir};
if(require.main===module)run().catch(error=>{console.error(error);process.exitCode=1;});
