(function(){
'use strict';
const DB='eea-classroom-file';
const STORE='files';
const KEY='recovery';
const LAST='eea-protection-last-save';
function supported(){return typeof window.showSaveFilePicker==='function'&&typeof indexedDB!=='undefined'}
function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function readHandle(){if(!supported())return null;const db=await openDb();try{return await new Promise((resolve,reject)=>{const r=db.transaction(STORE).objectStore(STORE).get(KEY);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}finally{db.close()}}
async function storeHandle(handle){const db=await openDb();try{await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(handle,KEY);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}finally{db.close()}}
async function canWrite(handle,ask){if(!handle)return false;try{if(await handle.queryPermission({mode:'readwrite'})==='granted')return true;if(ask&&await handle.requestPermission({mode:'readwrite'})==='granted')return true}catch(e){}return false}
function collect(){const data={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(/^eea-/.test(k)||/^early-eagle/.test(k)||/^earlyEagle/.test(k)))data[k]=localStorage.getItem(k)}return data}
async function makePayload(){let visuals={};try{if(window.EEAVisualStore){if(EEAVisualStore.migrate)await EEAVisualStore.migrate();if(EEAVisualStore.all)visuals=await EEAVisualStore.all()}}catch(e){}return {app:'Early Eagle Academy Classroom Companion',format:'eea-protected-classroom-v1',created:new Date().toISOString(),data:collect(),visuals}}
async function saveSnapshot(options={}){if(!supported())return {ok:false,reason:'unsupported'};const handle=options.handle||await readHandle();if(!handle)return {ok:false,reason:'not-linked'};if(!await canWrite(handle,options.askPermission===true))return {ok:false,reason:'permission'};try{const payload=await makePayload(),w=await handle.createWritable();await w.write(JSON.stringify(payload));await w.close();localStorage.setItem(LAST,payload.created);return {ok:true,created:payload.created}}catch(error){console.error('[EEA Protection] Save failed',error);return {ok:false,reason:'write',error}}}
async function chooseFile(){if(!supported())return {ok:false,reason:'unsupported'};const handle=await showSaveFilePicker({suggestedName:'early-eagle-classroom-backup.json',types:[{description:'Classroom backup',accept:{'application/json':['.json']}}]});await storeHandle(handle);return saveSnapshot({handle,askPermission:true})}
async function status(){if(!supported())return {supported:false,linked:false,permission:false,last:localStorage.getItem(LAST)||''};let handle=null;try{handle=await readHandle()}catch(e){}return {supported:true,linked:!!handle,permission:handle?await canWrite(handle,false):false,last:localStorage.getItem(LAST)||''}}
window.EEAProtection={status,chooseFile,saveSnapshot};
})();
