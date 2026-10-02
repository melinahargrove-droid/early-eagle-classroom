// Pure Node regression for browser response-capture lifetime. Synthetic bytes
// and EventEmitter only: no browser, network, runtime injection or deployed data.
const assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');
const crypto=require('node:crypto');
const {captureRuntimeBytes}=require('./test_week10_centers_thursday_live.cjs');
const base='https://melinahargrove-droid.github.io/early-eagle-classroom/v6-test/';
const files=['week10-centers-v5.js','week10-read-aloud-v9.js'];
const bytes=Object.fromEntries(files.map(f=>[f,Buffer.from('Exact test response for '+f)]));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const expected=Object.fromEntries(files.map(f=>[f,hash(bytes[f])]));
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
 const unhandled=[];const onUnhandled=e=>unhandled.push(e);process.on('unhandledRejection',onUnhandled);
 try{
  const page=new EventEmitter(),verified={},capture=captureRuntimeBytes(page,expected,verified);let release,reads=0,navigated=false;
  page.emit('response',{url:()=>base+files[0],body:()=>{reads++;return new Promise(r=>{release=r;});}});
  const boundary=capture.verify(files[0]).then(()=>{navigated=true;});await tick();assert.equal(navigated,false,'Readiness blocks subsequent navigation until body is captured');
  page.emit('response',{url:()=>base+files[0],body:()=>{throw Error('Discarded duplicate must never be read');}});assert.equal(reads,1);
  release(bytes[files[0]]);await boundary;assert.equal(navigated,true);assert.equal(verified[files[0]],expected[files[0]]);
  let foreignRead=false;page.emit('response',{url:()=>base.replace('melinahargrove-droid.github.io','other.example')+files[1],body:()=>{foreignRead=true;throw Error('Wrong origin');}});await tick();assert(!foreignRead);
  page.emit('response',{url:()=>base+files[1],body:async()=>bytes[files[1]]});await capture.verify(files[1]);await capture.finish();assert.deepEqual(verified,expected);assert.equal(page.listenerCount('response'),0);
  for(const [name,body,message]of [['CDP failure',()=>Promise.reject(Error('No resource with given identifier')),/No resource with given identifier/],['Wrong hash',()=>Promise.resolve(Buffer.from('stale bytes')),/Browser consumed exact deployed/]]){
   const p=new EventEmitter(),v={},c=captureRuntimeBytes(p,expected,v);p.emit('response',{url:()=>base+files[0],body});await tick();await tick();assert.deepEqual(unhandled,[],name+' has an immediate rejection handler');await assert.rejects(()=>c.verify(files[0]),message);assert.deepEqual(v,{},name+' never produces a verified hash');
  }
  assert.deepEqual(unhandled,[]);console.log('PASS: deferred body blocks navigation; exact two hashes required; duplicate and foreign responses ignored; CDP and hash failures remain fatal without unhandled rejections');
 }finally{process.off('unhandledRejection',onUnhandled);}
})().catch(e=>{console.error(e);process.exitCode=1;});
