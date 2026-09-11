(function(){
'use strict';

const KEYS={
  students:'eea-students-v1',
  attendance:'eea-attendance-present',
  attendanceDate:'eea-attendance-date',
  attendanceCount:'eea-attendance-count',
  currentStar:'eea-current-star',
  starState:'eea-star-state-v1'
};

const DAILY_RESET_KEY='eea-last-daily-reset-date';
const STATIC_DAILY_KEYS=[
  'eea-attendance-present','eea-attendance-count','eea-attendance-date',
  'eea-choose-friend-state-v1','eea-center-choice-state-v1',
  'eea-schedule-progress','eea-now-activity',
  'eea-lesson-resume','eea-daily-week','eea-daily-day','eea-daily-date',
  'eea-movement-history-v1','eea-movement-history-v2',
  'eea-timer-state','eea-home-timer-state','eea-quick-timer-state',
  'eea-star-revealed-date'
];

// Early Eagle always opens Stay in Your Center after the initial Center Choice round.
// Normalize any older saved preference that could disable this required classroom flow.
try{
  const settingsKey='eea-app-settings';
  const saved=JSON.parse(localStorage.getItem(settingsKey)||'{}')||{};
  if(saved.autoStay!==true){
    saved.autoStay=true;
    localStorage.setItem(settingsKey,JSON.stringify(saved));
  }
}catch(e){}

// Matches the current Early Eagle classroom fallback roster used by the classroom tools.
const FALLBACK=['Brahm','Dylan','Easton','Eila','Hayes','Heidi','Jamie','Kayson','Lily','Mason','Maesyn','Neely','River','Roman','Warren','Wyatt','Zach','Zelda'];

function dateKey(d=new Date()){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function lessonCompletionKeys(d=new Date()){
  const prefix=`eea-lesson-complete-${dateKey(d)}-`;
  const out=[];
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(k&&k.startsWith(prefix))out.push(k);
  }
  return out;
}

function resetDailyState(d=new Date()){
  [...STATIC_DAILY_KEYS,...lessonCompletionKeys(d)].forEach(k=>localStorage.removeItem(k));
  localStorage.setItem(KEYS.attendance,'[]');
  localStorage.setItem(KEYS.attendanceCount,'0');
  localStorage.setItem(DAILY_RESET_KEY,dateKey(d));
}

function ensureDailyReset(d=new Date()){
  if(localStorage.getItem(DAILY_RESET_KEY)!==dateKey(d))resetDailyState(d);
}

// Run before Home's legacy inline lifecycle. This establishes the restored daily contract
// and marks today as reset so older Home code cannot clear an incomplete/outdated key set.
ensureDailyReset();

function roster(){
  try{
    const saved=JSON.parse(localStorage.getItem(KEYS.students)||'null');
    if(Array.isArray(saved)&&saved.length){
      return saved
        .filter(s=>s&&s.active!==false&&String(s.name||'').trim())
        .map((s,i)=>({
          id:String(s.id||('s'+i)),
          name:String(s.name).trim(),
          photo:s.photo||'',
          audio:s.audio||''
        }));
    }
  }catch(e){}
  return FALLBACK.map((name,i)=>({id:'s'+(i+1),name,photo:'',audio:''}));
}

function normalizePresent(raw,students=roster()){
  const valid=new Map(students.map((s,i)=>[String(s.id),{student:s,index:i}]));
  if(!Array.isArray(raw))return [];
  const out=[];
  raw.forEach(v=>{
    let id=String(v);
    if(/^\d+$/.test(id)&&!valid.has(id)){
      const oldIndex=Number(id);
      if(students[oldIndex])id=String(students[oldIndex].id);
    }
    if(valid.has(id)&&!out.includes(id))out.push(id);
  });
  return out;
}

function attendanceStatus(d=new Date()){
  const today=dateKey(d);
  const stamp=localStorage.getItem(KEYS.attendanceDate)||'';
  if(stamp!==today){
    return {taken:false,date:today,presentIds:[],count:0,reason:'not-taken-today'};
  }
  try{
    const raw=JSON.parse(localStorage.getItem(KEYS.attendance)||'[]');
    if(!Array.isArray(raw))return {taken:false,date:today,presentIds:[],count:0,reason:'invalid-data'};
    const presentIds=normalizePresent(raw);
    return {taken:true,date:today,presentIds,count:presentIds.length,reason:'ok'};
  }catch(e){
    return {taken:false,date:today,presentIds:[],count:0,reason:'invalid-data'};
  }
}

function hasAttendanceToday(){return attendanceStatus().taken;}
function presentIds(){return attendanceStatus().presentIds;}
function presentStudents(){
  const ids=new Set(presentIds());
  return roster().filter(s=>ids.has(s.id));
}

function saveAttendance(ids){
  const present=normalizePresent(ids);
  localStorage.setItem(KEYS.attendance,JSON.stringify(present));
  localStorage.setItem(KEYS.attendanceDate,dateKey());
  localStorage.setItem(KEYS.attendanceCount,String(present.length));
  window.dispatchEvent(new CustomEvent('eea:attendance-changed',{detail:{presentIds:present,count:present.length,date:dateKey()}}));
  return present;
}

function clearAttendance(){return saveAttendance([]);}

function currentStar(){
  const students=roster();
  let id='',name='';
  try{
    const state=JSON.parse(localStorage.getItem(KEYS.starState)||'null');
    if(state&&typeof state==='object'){
      id=String(state.currentId||'');
      name=String(state.currentName||'');
    }
  }catch(e){}
  let student=id?students.find(s=>s.id===id):null;
  if(!student){
    const storedName=localStorage.getItem(KEYS.currentStar)||name;
    student=students.find(s=>s.name===storedName)||null;
  }
  return student;
}

function presentStar(){
  const star=currentStar();
  if(!star)return null;
  return presentIds().includes(star.id)?star:null;
}

function starFirstQueue(shuffleFn){
  const status=attendanceStatus();
  if(!status.taken)return {ready:false,reason:status.reason,ids:[]};
  const students=roster();
  const presentSet=new Set(status.presentIds);
  const available=students.filter(s=>presentSet.has(s.id));
  const star=presentStar();
  let rest=available.filter(s=>!star||s.id!==star.id).map(s=>s.id);
  if(typeof shuffleFn==='function')rest=shuffleFn(rest.slice());
  return {ready:true,reason:'ok',ids:star?[star.id,...rest]:rest,starId:star?star.id:''};
}

function requireAttendance(options={}){
  if(hasAttendanceToday())return true;
  const message=options.message||'Take attendance first so Eddie knows who is here today!';
  const target=options.target||'attendance.html';
  if(document.getElementById('eea-attendance-required'))return false;
  const overlay=document.createElement('div');
  overlay.id='eea-attendance-required';
  overlay.style.cssText='position:fixed;inset:0;z-index:20000;background:rgba(31,54,66,.66);display:flex;align-items:center;justify-content:center;padding:24px;font-family:Trebuchet MS,Arial,sans-serif;';
  const card=document.createElement('div');
  card.style.cssText='width:min(640px,88vw);background:#fffaf0;border:3px solid #527da8;border-radius:28px;padding:34px;text-align:center;color:#173f72;box-shadow:0 20px 60px rgba(20,35,50,.28);';
  const title=document.createElement('div');
  title.textContent='Attendance First';
  title.style.cssText='font-size:34px;font-weight:900;margin-bottom:14px;';
  const copy=document.createElement('div');
  copy.textContent=message;
  copy.style.cssText='font-size:22px;line-height:1.35;margin-bottom:26px;';
  const button=document.createElement('button');
  button.type='button';
  button.textContent='Go to Attendance';
  button.style.cssText='border:2px solid #527da8;border-radius:18px;background:#eef5f1;color:#173f72;padding:14px 24px;font-size:20px;font-weight:900;cursor:pointer;';
  button.onclick=()=>{window.location.href=target;};
  card.append(title,copy,button);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  return false;
}

window.EEAClassroomState={
  keys:KEYS,
  dateKey,
  roster,
  attendanceStatus,
  hasAttendanceToday,
  presentIds,
  presentStudents,
  saveAttendance,
  clearAttendance,
  currentStar,
  presentStar,
  starFirstQueue,
  requireAttendance,
  resetDailyState,
  ensureDailyReset
};

// Home loads this shared state script before its large legacy inline controller.
// Load the Phase 2 controller after the page finishes parsing so it can safely
// replace legacy Home/Schedule handlers without rewriting the whole Home file.
if(/(?:^|\/)index\.html$/i.test(location.pathname)||location.pathname.endsWith('/v6-test/')||location.pathname.endsWith('/v6-test')){
  window.addEventListener('load',()=>{
    if(document.querySelector('script[data-eea-home-schedule-controller]'))return;
    const s=document.createElement('script');
    s.src='home-schedule-controller.js';
    s.dataset.eeaHomeScheduleController='1';
    document.body.appendChild(s);
  },{once:true});
}
})();
