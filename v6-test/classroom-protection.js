(()=>{
const DB='eea-protection-store',STORE='handles',HANDLE_KEY='classroom-backup-file';
const PREFIXES=['eea-','early-eagle','earlyEagle'];
const META='eea-last-protected-save';
let dbp;
function supported(){return typeof window.showSaveFilePicker==='function'&&typeof indexedDB!=='undefined'}
function openDB(){if(dbp)return dbp;dbp=new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return dbp}
async function getHandle(){try{const d=await openDB();return await new Promise((resolve,reject)=>{const r=d.transaction(STORE,'readonly').objectStore(STORE).get(HANDLE_KEY);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}catch(e){return null}}
async function setHandle(h){const d=await openDB();return new Promise((resolve,reject)=>{const t=d.transaction(STORE,'readwrite');t.objectStore(STORE).put(h,HANDLE_KEY);t.oncomplete=resolve;t.onerror=()=>reject(t.error)})}
async function permission(handle,ask=false){if(!handle)return false;try{let p=await handle.queryPermission({mode:'readwrite'});if(p==='granted')return true;if(ask&&typeof handle.requestPermission==='function')p=await handle.requestPermission({mode:'readwrite'});return p==='granted'}catch(e){return false}}
function includedKey(k){return PREFIXES.some(p=>String(k||'').startsWith(p))}
function collectLocal(){const data={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&includedKey(k)&&k!==META)data[k]=localStorage.getItem(k)}return data}
async function collectVisuals(){try{if(window.EEAVisualStore){await EEAVisualStore.migrate();return await EEAVisualStore.all()}}catch(e){}return{}}
async function payload(){return{app:'Early Eagle Academy Classroom Companion',format:'eea-backup-v2',protected:true,created:new Date().toISOString(),data:collectLocal(),visuals:await collectVisuals()}}
async function write(handle,obj){const w=await handle.createWritable();await w.write(JSON.stringify(obj));await w.close();localStorage.setItem(META,obj.created);window.dispatchEvent(new CustomEvent('eea-protection-saved',{detail:{date:obj.created,name:handle.name||'Protected backup'}}));return obj}
async function chooseFile(){if(!supported())throw new Error('Protected-file saving is not supported in this browser. Use Chrome or Edge on this computer.');const handle=await showSaveFilePicker({suggestedName:'Early Eagle Classroom - Protected Backup.json',types:[{description:'Early Eagle Classroom Backup',accept:{'application/json':['.json']}}]});await setHandle(handle);const obj=await payload();await write(handle,obj);return{name:handle.name||'Protected backup',date:obj.created}}
async function saveSnapshot({askPermission=false}={}){const handle=await getHandle();if(!handle)return{ok:false,reason:'not-linked'};if(!(await permission(handle,askPermission)))return{ok:false,reason:'permission'};const obj=await payload();await write(handle,obj);return{ok:true,name:handle.name||'Protected backup',date:obj.created}}
async function status(){const h=await getHandle();const last=localStorage.getItem(META)||'';if(!h)return{supported:supported(),linked:false,permission:false,last,name:''};return{supported:supported(),linked:true,permission:await permission(h,false),last,name:h.name||'Protected backup'}}
window.EEAProtection={supported,chooseFile,saveSnapshot,status,getHandle,META};
})();