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
  'eea-center-choices','eea-center-picked','eea-friend-used','eea-friend-history',
  'eea-timer-state','eea-home-timer-state','eea-quick-timer-state',
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
})();