(function(){
'use strict';
const STUDENT_KEY='eea-students-v1',ATTENDANCE_KEY='eea-attendance-present',CALENDAR_KEY='eea-school-calendar',STAR_KEY='eea-current-star',STATE_KEY='eea-star-state-v1';
const FALLBACK=['Avery','Bentley','Blakely','Brantley','Dylan','Easton','Emersyn','Everleigh','Grayson','Harper','Hudson','Jaxson','Kinsley','Liam','Maverick','Oakley','Sawyer','Warren','Wyatt','Zoey'];
function dateKey(d=new Date()){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function roster(){let a=[];try{const x=JSON.parse(localStorage.getItem(STUDENT_KEY)||'null');if(Array.isArray(x)&&x.length)a=x.filter(s=>s&&s.active!==false&&String(s.name||'').trim()).map((s,i)=>({id:String(s.id||('s'+i)),name:String(s.name).trim()}))}catch(e){}if(!a.length)a=FALLBACK.map((name,i)=>({id:'s'+(i+1),name}));a.sort((x,y)=>x.name.localeCompare(y.name));return a}
function presentIds(){const r=roster(),byId=new Map(r.map(s=>[s.id,s]));try{const x=JSON.parse(localStorage.getItem(ATTENDANCE_KEY)||'[]');if(!Array.isArray(x))return [];return [...new Set(x.map(v=>String(v)).filter(id=>byId.has(id)))]}catch(e){return []}}
function isSchoolDay(d=new Date()){try{const cal=JSON.parse(localStorage.getItem(CALENDAR_KEY)||'{}')||{},entry=cal[dateKey(d)];if(entry)return entry.type==='school'}catch(e){}const day=d.getDay();return day>=1&&day<=5}
function freshState(){const r=roster(),saved=localStorage.getItem(STAR_KEY)||'',idx=r.findIndex(s=>s.name===saved),hasSaved=idx>=0;if(saved&&!hasSaved)localStorage.removeItem(STAR_KEY);return {version:1,cycle:1,servedIds:hasSaved?[r[idx].id]:[],pendingIds:[],nextIndex:r.length?(hasSaved?((idx+1)%r.length):0):0,lastResolvedDate:'',currentId:hasSaved?r[idx].id:'',currentName:hasSaved?r[idx].name:''}}
function load(){let s=null;try{s=JSON.parse(localStorage.getItem(STATE_KEY)||'null')}catch(e){}if(!s||typeof s!=='object')s=freshState();const r=roster(),valid=new Set(r.map(x=>x.id)),validNames=new Set(r.map(x=>x.name));s.servedIds=Array.isArray(s.servedIds)?s.servedIds.filter(id=>valid.has(id)):[];s.pendingIds=Array.isArray(s.pendingIds)?s.pendingIds.filter(id=>valid.has(id)&&!s.servedIds.includes(id)):[];s.nextIndex=Math.max(0,Math.min(Math.max(0,r.length-1),Number(s.nextIndex)||0));if(s.currentId&&!valid.has(s.currentId)){s.currentId='';s.currentName=''}if(s.currentId){const c=r.find(x=>x.id===s.currentId);s.currentName=c?c.name:''}const savedName=localStorage.getItem(STAR_KEY)||'';if(savedName&&!validNames.has(savedName))localStorage.removeItem(STAR_KEY);s.cycle=Number(s.cycle)||1;s.version=1;return s}
function save(s){localStorage.setItem(STATE_KEY,JSON.stringify(s));if(s.currentName)localStorage.setItem(STAR_KEY,s.currentName);else localStorage.removeItem(STAR_KEY);return s}
function firstUnservedIndex(s,start){const r=roster();if(!r.length)return 0;for(let n=0;n<r.length;n++){const i=(start+n)%r.length;if(!s.servedIds.includes(r[i].id))return i}return 0}
function resetCycleIfNeeded(s){const r=roster();if(r.length&&s.servedIds.length>=r.length){s.cycle=(s.cycle||1)+1;s.servedIds=[];s.pendingIds=[];s.nextIndex=0}return s}
function resolveToday(){const d=new Date(),today=dateKey(d),r=roster(),present=presentIds();let s=load();if(!r.length||!isSchoolDay(d)||!present.length)return s;if(s.lastResolvedDate===today&&s.currentId)return s;resetCycleIfNeeded(s);let chosen=null;for(const id of s.pendingIds){if(present.includes(id)&&!s.servedIds.includes(id)){chosen=r.find(x=>x.id===id)||null;if(chosen)break}}if(!chosen){for(let n=0;n<r.length;n++){const i=(s.nextIndex+n)%r.length,student=r[i];if(s.servedIds.includes(student.id))continue;if(present.includes(student.id)){chosen=student;break}if(!s.pendingIds.includes(student.id))s.pendingIds.push(student.id)}}if(!chosen)return save(s);if(!s.servedIds.includes(chosen.id))s.servedIds.push(chosen.id);s.pendingIds=s.pendingIds.filter(id=>id!==chosen.id);s.currentId=chosen.id;s.currentName=chosen.name;s.lastResolvedDate=today;const chosenIndex=r.findIndex(x=>x.id===chosen.id);if(s.pendingIds.length){const pendingIndexes=s.pendingIds.map(id=>r.findIndex(x=>x.id===id)).filter(i=>i>=0);if(pendingIndexes.length)s.nextIndex=pendingIndexes[0]}else{s.nextIndex=firstUnservedIndex(s,(chosenIndex+1)%r.length)}return save(s)}
function overrideById(id){const r=roster(),c=r.find(x=>x.id===id);if(!c)return load();let s=load();resetCycleIfNeeded(s);if(!s.servedIds.includes(id))s.servedIds.push(id);s.pendingIds=s.pendingIds.filter(x=>x!==id);s.currentId=id;s.currentName=c.name;s.lastResolvedDate=dateKey(new Date());const i=r.findIndex(x=>x.id===id);s.nextIndex=firstUnservedIndex(s,(i+1)%r.length);return save(s)}
function nextCandidate(){const r=roster(),s=load();for(const id of s.pendingIds){if(!s.servedIds.includes(id)){const c=r.find(x=>x.id===id);if(c)return c}}for(let n=0;n<r.length;n++){const i=(s.nextIndex+n)%r.length;if(!s.servedIds.includes(r[i].id))return r[i]}return r[0]||null}
function current(){const r=roster(),s=load(),c=r.find(x=>x.id===s.currentId);if(c)return c;const byName=r.find(x=>x.name===localStorage.getItem(STAR_KEY));return byName||r[0]||null}
function status(){return {state:load(),roster:roster(),presentIds:presentIds(),current:current(),next:nextCandidate(),schoolDay:isSchoolDay(new Date()),today:dateKey(new Date())}}
window.EEAStar={resolveToday,overrideById,current,nextCandidate,status,roster,isSchoolDay,dateKey,loadState:load};
})();

(function(){
'use strict';
const icon=document.getElementById('next-icon');if(!icon)return;
const SCHEDULE_KEY='eea-schedule-config',POPUP_KEY='eea-now-popup-images',AUDIO_KEY='eea-now-popup-audio';
const iconBase='https://raw.githubusercontent.com/melinahargrove-droid/early-eagle-classroom/v6-clean-build/Assets/03%20Home/Schedule%20Icons/';
const defaults=[{id:'activity-0',name:'Centers',picture:iconBase+'EEA_v6_4D-2A_Schedule_Centers.png',active:true},{id:'activity-2',name:'Breakfast',picture:iconBase+'EEA_v6_4D-2C_Schedule_Breakfast.png',active:true},{id:'activity-1',name:'Circle Time',picture:iconBase+'EEA_v6_4D-2B_Schedule_Circle_Time.png',active:true},{id:'activity-4',name:'Recess',picture:iconBase+'EEA_v6_4D-2D_Schedule_Recess.png',active:true},{id:'activity-5',name:'Lunch',picture:iconBase+'EEA_v6_4D-2E_Schedule_Lunch.png',active:true},{id:'activity-6',name:'Nap',picture:iconBase+'EEA_v6_4D-2F_Schedule_Nap.png',active:true},{id:'activity-7',name:'Snack',picture:iconBase+'EEA_v6_4D-2G_Schedule_Snack.png',active:true}];
function schedule(){try{const saved=JSON.parse(localStorage.getItem(SCHEDULE_KEY)||'null');if(Array.isArray(saved)&&saved.length)return saved.filter(x=>x.active!==false)}catch(e){}return defaults}
function stored(k){try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(e){return {}}}
function currentActivity(){const s=schedule(),i=Math.max(0,Math.min(Number(localStorage.getItem('eea-schedule-progress')||0),Math.max(0,s.length-1)));return {item:s[i]||null,index:i}}
function openPicturePopup(){
  const cur=currentActivity(),x=cur.item;if(!x)return;
  const key=x.id||('activity-'+cur.index),detail=stored(POPUP_KEY)[key]||'',clip=stored(AUDIO_KEY)[key]||null,first=x.picture||icon.currentSrc||icon.src;
  if(!first)return;
  const overlay=document.createElement('div');
  overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',(x.name||'Activity')+' picture');
  overlay.style.cssText='position:fixed;inset:0;z-index:10000;background:rgba(31,54,66,.72);display:flex;align-items:center;justify-content:center;padding:3vh 4vw;';
  const card=document.createElement('div');
  card.style.cssText='position:relative;width:min(86vw,1200px);height:min(86vh,820px);border-radius:28px;background:#fffdf7;box-shadow:0 22px 70px rgba(20,42,55,.34);display:flex;align-items:center;justify-content:center;padding:4vh 4vw;';
  const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Close picture');close.style.cssText='position:absolute;right:18px;top:16px;width:58px;height:58px;border-radius:50%;border:1.5px solid #c7d2ce;background:#fffaf0;color:#173f72;font-size:38px;font-weight:900;cursor:pointer;z-index:3;';
  const replay=document.createElement('button');replay.type='button';replay.textContent='🔊 Play again';replay.setAttribute('aria-label','Play popup audio again');replay.style.cssText='display:none;position:absolute;left:50%;bottom:18px;transform:translateX(-50%);border:1.5px solid #b9cbc2;border-radius:999px;background:#eef5f1;color:#315f50;padding:12px 22px;font-size:20px;font-weight:900;cursor:pointer;z-index:3;';
  const img=document.createElement('img');img.src=first;img.alt=x.name||'Schedule picture';img.style.cssText='max-width:92%;max-height:88%;object-fit:contain;cursor:'+((detail||clip&&clip.src)?'pointer':'default')+';';
  let showingDetail=false,audio=null;
  function playAudio(){if(!clip||!clip.src)return;if(audio){audio.pause();audio.currentTime=0}else audio=new Audio(clip.src);audio.play().catch(()=>{});replay.style.display='block'}
  function showDetail(){if(showingDetail)return;showingDetail=true;if(detail){img.src=detail;img.alt=(x.name||'Activity')+' popup picture'}img.style.cursor='default';playAudio()}
  img.onclick=ev=>{ev.stopPropagation();if(!detail&&!(clip&&clip.src))return;showDetail()};
  replay.onclick=ev=>{ev.stopPropagation();playAudio()};
  function closeOverlay(){if(audio){audio.pause();audio.currentTime=0}if(overlay.parentNode)overlay.remove();document.removeEventListener('keydown',esc)}
  function esc(e){if(e.key==='Escape')closeOverlay()}
  close.onclick=closeOverlay;overlay.onclick=e=>{if(e.target===overlay)closeOverlay()};document.addEventListener('keydown',esc);
  card.append(img,replay,close);overlay.appendChild(card);document.body.appendChild(overlay)
}
icon.style.cursor='pointer';icon.setAttribute('role','button');icon.setAttribute('tabindex','0');icon.setAttribute('aria-label','Open large schedule picture');
icon.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openPicturePopup()});
icon.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();openPicturePopup()}});
})();