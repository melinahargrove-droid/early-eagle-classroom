// Pure-Node regression of first-response ownership. No browser/refetch fallback.
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const {EventEmitter}=require('node:events');
const {readerRuntimeFiles,captureResponseBytes,waitForReaderBytes,waitForCapturedBytes}=require('./test_week12_readaloud_capture.cjs');
const base='https://eea.test/v6-test/',image='assets/first.jpg',nextImage='assets/second.jpg',files=[...readerRuntimeFiles,image,nextImage],bytes=Object.fromEntries(files.map(f=>[f,Buffer.from('Independent response '+f)])),expected=Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(bytes[f]).digest('hex')]));
const tick=()=>new Promise(r=>setImmediate(r)),defer=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};};
const emit=(page,file,body=()=>Promise.resolve(bytes[file]),suffix='',origin=base)=>page.emit('response',{url:()=>origin+file+suffix,body});
(async()=>{
 const unhandled=[],onUnhandled=e=>unhandled.push(e);process.on('unhandledRejection',onUnhandled);
 try{
  const page=new EventEmitter(),verified={},cap=captureResponseBytes(page,base,expected,verified,files),pending=Object.fromEntries(files.map(f=>[f,defer()]));let ready=false,secondRead=false;
  for(const file of files)emit(page,file,()=>pending[file].promise);emit(page,readerRuntimeFiles[0],()=>{secondRead=true;throw Error('Duplicate body read');},'?later=1');
  const barrier=waitForReaderBytes(page,image).then(()=>ready=true);await tick();assert(!ready);
  for(const file of readerRuntimeFiles){pending[file].resolve(bytes[file]);await tick();assert(!ready,'Readiness waits for current image');}
  pending[image].resolve(bytes[image]);await barrier;assert(ready);assert(!secondRead);
  let navigation=false;const boundary=waitForCapturedBytes(page).then(()=>navigation=true);await tick();assert(!navigation,'Every observed image body settles before navigation');pending[nextImage].resolve(bytes[nextImage]);await boundary;await cap.finish();assert.deepEqual(verified,expected);assert.equal(page.listenerCount('response'),0);
  for(const [name,body,pattern]of [['CDP rejection',()=>Promise.reject(Error('Network.getResponseBody failure')),/Network.getResponseBody/],['synchronous failure',()=>{throw Error('Synchronous failure');},/Synchronous failure/],['stale first response',()=>Promise.resolve(Buffer.from('stale bytes')),/Browser consumes exact runtime/]]){
   const p=new EventEmitter(),v={},tracked=[...readerRuntimeFiles,image],c=captureResponseBytes(p,base,expected,v,tracked),bad=readerRuntimeFiles[0];let duplicateRead=false;
   for(const f of tracked)emit(p,f,f===bad?body:()=>Promise.resolve(bytes[f]));await tick();assert.deepEqual(unhandled,[],name+' caught immediately');emit(p,bad,()=>{duplicateRead=true;return Promise.resolve(bytes[bad]);},'?repair=1');
   await assert.rejects(()=>waitForReaderBytes(p,image),pattern);await assert.rejects(()=>waitForCapturedBytes(p),pattern);await assert.rejects(()=>c.finish(),pattern);assert(!duplicateRead,'A later body never repairs first-capture failure');assert(!Object.hasOwn(v,bad));
  }
  const p=new EventEmitter(),v={},c=captureResponseBytes(p,base,expected,v,[image]);let foreignRead=false;emit(p,image,()=>{foreignRead=true;throw Error('foreign');},'','https://other.test/v6-test/');emit(p,image);await c.finish();assert(!foreignRead,'Only exact origin paths are consumed');
  assert.throws(()=>captureResponseBytes(new EventEmitter(),base,{}, {},[image]),/Expected digest exists/);assert.throws(()=>captureResponseBytes(new EventEmitter(),base,expected,{},[image,image]),/paths are unique/);
  // Thursday text vocabulary has no image URL. It still waits for every
  // active script's first consumed response, without inventing an image fetch.
  {const p=new EventEmitter(),v={},c=captureResponseBytes(p,base,expected,v,readerRuntimeFiles),last=readerRuntimeFiles.at(-1),held=defer();let ready=false;for(const f of readerRuntimeFiles)emit(p,f,()=>f===last?held.promise:Promise.resolve(bytes[f]));const wait=waitForReaderBytes(p,null).then(()=>ready=true);await tick();assert(!ready,'Text vocabulary waits for fresh Thursday plan/runtime bytes');held.resolve(bytes[last]);await wait;await c.finish();assert(ready);assert.deepEqual(Object.keys(v).sort(),[...readerRuntimeFiles].sort());}
  // Early-boundary local tests intentionally have no capture, so a cold image
  // cannot make their readiness wait for a response body held by the fixture.
  await waitForReaderBytes(new EventEmitter(),image);await waitForCapturedBytes(new EventEmitter());assert.deepEqual(unhandled,[]);
  console.log('PASS: first-response hashes own readiness/navigation; pending images block disposal; first failures stay fatal; no refetch/duplicate repair; cold-image fixtures remain unblocked');
 }finally{process.off('unhandledRejection',onUnhandled);}
})().catch(e=>{console.error(e);process.exitCode=1;});
