(function(){
'use strict';
const ACTIVE_KEY='eea-active-class';
const PREFIX='eea-class-profile-';
const DEFAULT_NAMES=['Avery','Bentley','Blakely','Brantley','Dylan','Easton','Emersyn','Everleigh','Grayson','Harper','Hudson','Jaxson','Kinsley','Liam','Maverick','Oakley','Sawyer','Warren','Wyatt','Zoey'];
const CLASS_KEYS=[
  'eea-students-v1','eea-student-names',
  'eea-attendance-present','eea-attendance-date','eea-attendance-count','eea-last-morning-attendance-date','eea-last-daily-reset-date',
  'eea-current-star','eea-star-state-v1','eea-star-revealed-date',
  'eea-choose-friend-state-v1','eea-choose-friend-used','eea-choose-friend-remaining',
  'eea-center-choice-state-v1','eea-center-choice-selections','eea-center-choice-history','eea-center-choice-current',
  'eea-center-choices','eea-center-picked','eea-friend-used','eea-friend-history','eea-movement-history-v1',
  'eea-timer-state','eea-home-timer-state','eea-quick-timer-state','eea-center-stay-state-v1',
  'eea-schedule-progress','eea-schedule-index','eea-now-activity'
];
function normalize(v){return String(v||'').toLowerCase()==='pm'?'pm':'am'}
function seedRosterIfNeeded(){let valid=false;try{const x=JSON.parse(localStorage.getItem('eea-students-v1')||'null');valid=Array.isArray(x)&&x.length>0}catch(e){}if(valid)return;const roster=DEFAULT_NAMES.map((name,i)=>({id:'s'+(i+1),name,active:true,photo:'',audio:''}));localStorage.setItem('eea-students-v1',JSON.stringify(roster));localStorage.setItem('eea-student-names',JSON.stringify(DEFAULT_NAMES))}
function active(){const v=normalize(localStorage.getItem(ACTIVE_KEY));if(!localStorage.getItem(ACTIVE_KEY))localStorage.setItem(ACTIVE_KEY,v);return v}
function profileKey(which){return PREFIX+normalize(which)}
function capture(){const data={};CLASS_KEYS.forEach(k=>{const v=localStorage.getItem(k);if(v!==null)data[k]=v});return data}
function save(which=active()){seedRosterIfNeeded();localStorage.setItem(profileKey(which),JSON.stringify(capture()));return true}
function clearLive(){CLASS_KEYS.forEach(k=>localStorage.removeItem(k))}
function restore(which){const target=normalize(which);clearLive();let data={};try{data=JSON.parse(localStorage.getItem(profileKey(target))||'{}')||{}}catch(e){data={}};Object.keys(data).forEach(k=>{if(CLASS_KEYS.includes(k)&&data[k]!==null&&data[k]!==undefined)localStorage.setItem(k,String(data[k]))});seedRosterIfNeeded();localStorage.setItem(ACTIVE_KEY,target);return target}
function switchTo(which){const target=normalize(which),current=active();if(target===current)return current;save(current);return restore(target)}
function label(which=active()){return normalize(which)==='pm'?'PM Class':'AM Class'}
window.EEAClassProfile={active,switchTo,save,restore,label,keys:CLASS_KEYS.slice()};
active();seedRosterIfNeeded();

function registerServiceWorker(){
  try{
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('[EEA] Service worker registration failed',err));
    }
  }catch(e){}
}

function localDateKey(d=new Date()){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function installTeacherDeskRuntimeFixes(){
  if(!/\bteachers-desk\.html$/i.test(location.pathname))return;
  document.addEventListener('click',event=>{
    const target=event.target&&event.target.closest?event.target.closest('#resetDaily,#endDay,.home'):null;
    if(!target)return;
    if(target.id==='resetDaily'||target.id==='endDay'){
      localStorage.removeItem('eea-center-stay-state-v1');
    }
    if(target.classList.contains('home')){
      let settings={lockOnHome:true};
      try{settings={...settings,...JSON.parse(localStorage.getItem('eea-app-settings')||'{}')}}catch(e){}
      if(settings.lockOnHome!==false)sessionStorage.removeItem('eea-teacher-unlocked');
    }
  },true);
}

function installHomeRuntimeFixes(){
  const display=document.getElementById('quick-time'),startButton=document.getElementById('quick-start'),pauseButton=document.getElementById('quick-pause'),stopButton=document.getElementById('quick-stop'),plusButton=document.getElementById('quick-plus');
  if(!display||!startButton||!pauseButton||!stopButton||!plusButton)return;
  setTimeout(()=>{
    const STATE_KEY='eea-home-timer-state',SETTINGS_KEY='eea-app-settings',MEDIA_KEY='eea-media-config';
    let settings={timer:5,autoCleanUp:true};try{settings={...settings,...JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')}}catch(e){}
    let selectedSeconds=Math.max(60,Number(settings.timer||5)*60),remainingSeconds=selectedSeconds,running=false,endAt=0,intervalId=null;
    function loadState(){try{const s=JSON.parse(localStorage.getItem(STATE_KEY)||'null');if(!s||s.date!==localDateKey())return;selectedSeconds=Math.max(60,Number(s.selectedSeconds)||selectedSeconds);remainingSeconds=Math.max(0,Number(s.remainingSeconds));if(!Number.isFinite(remainingSeconds))remainingSeconds=selectedSeconds;if(s.running&&Number(s.endAt)>0){remainingSeconds=Math.max(0,Math.ceil((Number(s.endAt)-Date.now())/1000));running=remainingSeconds>0;endAt=Number(s.endAt)}}catch(e){}}
    function saveState(){try{localStorage.setItem(STATE_KEY,JSON.stringify({version:1,date:localDateKey(),selectedSeconds,remainingSeconds:Math.max(0,remainingSeconds),running:Boolean(running),endAt:running?Date.now()+remainingSeconds*1000:0}))}catch(e){}}
    function render(){const m=Math.floor(Math.max(0,remainingSeconds)/60),s=Math.max(0,remainingSeconds)%60;display.textContent=`${m}:${String(s).padStart(2,'0')}`}
    function clearTicker(){if(intervalId!==null){clearInterval(intervalId);intervalId=null}}
    function openCleanup(){if(settings.autoCleanUp===false)return;let target='clean-up-song.html';try{const items=JSON.parse(localStorage.getItem(MEDIA_KEY)||'[]');if(Array.isArray(items)){const item=items.find(x=>x&&x.cat==='Clean Up');if(item&&item.active===false)return;if(item&&item.source)target=String(item.source)}}catch(e){}if(!/^https?:\/\//i.test(target))target+=(target.includes('?')?'&':'?')+'autoplay=1';location.href=target}
    function finish(){running=false;endAt=0;clearTicker();remainingSeconds=0;render();saveState();openCleanup()}
    function tick(){if(!running)return;if(endAt)remainingSeconds=Math.max(0,Math.ceil((endAt-Date.now())/1000));else remainingSeconds=Math.max(0,remainingSeconds-1);render();if(remainingSeconds<=0)finish()}
    function startTimer(){if(running||remainingSeconds<=0)return;running=true;endAt=Date.now()+remainingSeconds*1000;clearTicker();intervalId=setInterval(tick,500);saveState()}
    function pauseTimer(){if(!running)return;remainingSeconds=Math.max(0,Math.ceil((endAt-Date.now())/1000));running=false;endAt=0;clearTicker();render();saveState()}
    function resetTimer(){running=false;endAt=0;clearTicker();remainingSeconds=selectedSeconds;render();saveState()}
    function addMinute(){selectedSeconds+=60;remainingSeconds+=60;if(running)endAt+=60000;render();saveState()}
    loadState();render();if(running){intervalId=setInterval(tick,500);tick()}else if(remainingSeconds<=0){remainingSeconds=selectedSeconds;render();saveState()}
    startButton.onclick=startTimer;pauseButton.onclick=pauseTimer;stopButton.onclick=resetTimer;plusButton.onclick=addMinute;
    window.addEventListener('pagehide',saveState);window.addEventListener('beforeunload',saveState);

    let schedule=[];try{const saved=JSON.parse(localStorage.getItem('eea-schedule-config')||'null');if(Array.isArray(saved)&&saved.length)schedule=saved.filter(x=>x.active!==false)}catch(e){}
    if(!schedule.length)schedule=[{name:'Centers'},{name:'Breakfast'},{name:'Circle Time'},{name:'Recess'},{name:'Lunch'},{name:'Nap'},{name:'Snack'}];
    const progress=Number(localStorage.getItem('eea-schedule-progress')||0);
    if(schedule.length&&progress>=schedule.length){
      document.querySelectorAll('.schedule-row').forEach(row=>{row.classList.add('done');row.classList.remove('active')});
      const title=document.getElementById('next-title'),icon=document.getElementById('next-icon'),panel=document.getElementById('now-panel');
      if(title)title.textContent='Our day is complete!';if(icon)icon.style.visibility='hidden';if(panel){panel.classList.remove('recess-weather');panel.onclick=null;panel.removeAttribute('role');panel.removeAttribute('tabindex');panel.setAttribute('aria-label','Our day is complete')}
    }
  },0);
}
registerServiceWorker();
installTeacherDeskRuntimeFixes();
installHomeRuntimeFixes();
})();