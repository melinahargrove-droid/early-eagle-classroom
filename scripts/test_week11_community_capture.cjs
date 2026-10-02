// Deterministic first-response/body-lifetime regression. Delayed bytes, duplicate
// responses, failed reads and mismatches must never be replaced by a refetch.
const assert=require('node:assert/strict'),{EventEmitter}=require('node:events');
const {captureBytes,navigate,hash}=require('./test_week11_community_shared.cjs');
const base='https://eea.test/v6-test/',file='week11-community-v1.js',bytes=Buffer.from('Exact consumed runtime bytes'),expected={[file]:hash(bytes)};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function page(){const p=new EventEmitter();p.refetches=0;p.request={get(){p.refetches++;throw Error('No request/refetch fallback allowed');}};p.evaluate=()=>{throw Error('No page-evaluation/hash fallback allowed');};return p;}
function response(name,body){return{url:()=>new URL(name,base).href,body};}
(async()=>{
 // A first response registered before navigation must settle before the
 // document is destroyed. A duplicate arriving sooner cannot replace it.
 {
  const p=page(),verified={},capture=captureBytes(p,base,expected,verified,[file]);let release,calls=0,duplicates=0,navigated=false,finished=false;
  const slow=new Promise(resolve=>{release=resolve;});p.emit('response',response(file+'?cache-bust=1#anchor',()=>{calls++;return slow;}));
  p.emit('response',response(file,()=>{duplicates++;return Buffer.from('replacement');}));
  const move=navigate(p,async()=>{navigated=true;return 'moved';});const complete=capture.finish().then(()=>{finished=true;});
  await tick();assert.equal(navigated,false);assert.equal(finished,false);assert.deepEqual(verified,{});assert.equal(calls,1);assert.equal(duplicates,0);
  release(bytes);assert.equal(await move,'moved');await complete;assert(navigated&&finished);assert.deepEqual(verified,expected);assert.equal(p.refetches,0);assert.equal(p.listenerCount('response'),0);
  p.emit('response',response(file,()=>{throw Error('Detached capture must not read later responses');}));
 }
 // Wrong origins and unrelated files must not satisfy the expected response.
 {
  const p=page(),verified={},capture=captureBytes(p,base,expected,verified,[file]);let unexpected=0;
  p.emit('response',response('https://unrelated.test/v6-test/'+file,()=>{unexpected++;return bytes;}));p.emit('response',response('another-file.js',()=>{unexpected++;return bytes;}));
  assert.equal(unexpected,0);p.emit('response',response(file,()=>bytes));await capture.finish();assert.deepEqual(verified,expected);assert.equal(p.refetches,0);
 }
 for(const mode of ['rejected','synchronous throw','mismatch']){
  const p=page(),verified={},capture=captureBytes(p,base,expected,verified,[file]);let first=0,duplicates=0,navigated=false;
  p.emit('response',response(file,()=>{first++;if(mode==='rejected')return Promise.reject(Error('original body failed'));if(mode==='synchronous throw')throw Error('original body threw');return Buffer.from('wrong bytes');}));
  p.emit('response',response(file+'?second-response=1',()=>{duplicates++;return bytes;}));
  const pattern=mode==='mismatch'?/Exact first browser-consumed bytes/:/original body/;
  await assert.rejects(()=>navigate(p,()=>{navigated=true;}),pattern);await assert.rejects(()=>capture.finish(),pattern);
  assert.equal(navigated,false,'Failed body must stop navigation');assert.equal(first,1);assert.equal(duplicates,0,'Successful duplicate cannot replace failed first response');assert.deepEqual(verified,{});assert.equal(p.refetches,0);
 }
 // A delayed failure has a rejection handler immediately, before callers await
 // it, so a fast navigation cannot discard or hide the first response failure.
 {
  const p=page(),verified={},capture=captureBytes(p,base,expected,verified,[file]);let reject;const slow=new Promise((_,r)=>{reject=r;});p.emit('response',response(file,()=>slow));await tick();reject(Error('delayed original failure'));await tick();await assert.rejects(()=>capture.beforeNavigation(),/delayed original failure/);await assert.rejects(()=>capture.finish(),/delayed original failure/);assert.equal(p.refetches,0);
 }
 {
  const p=page();assert.throws(()=>captureBytes(p,base,expected,{},[file,file]),/unique/);assert.throws(()=>captureBytes(p,base,{}, {},[file]),/Expected digest/);
  const capture=captureBytes(p,base,expected,{},[file]);assert.throws(()=>captureBytes(p,base,expected,{},[file]),/One first-response/);p.emit('response',response(file,()=>bytes));await capture.finish();
 }
 console.log('PASS: delayed first-byte barrier, duplicate ownership, wrong-path exclusion, synchronous/delayed rejection, mismatch, no navigation after failure and no refetch/hash fallback');
})().catch(error=>{console.error(error);process.exitCode=1;});
