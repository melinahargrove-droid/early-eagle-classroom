(function(){
'use strict';
const SCHEDULE_KEY='eea-schedule-config',PROGRESS_KEY='eea-schedule-progress',POPUP_KEY='eea-now-popup-images',AUDIO_KEY='eea-now-popup-audio',RULES_KEY='eea-schedule-rules',NOW_KEY='eea-now-illustrations';
const $=id=>document.getElementById(id);
const iconBase='assets/home/';
// IDs are semantic and intentionally follow the original classroom activity IDs,
// not the activity's current position in the schedule.
const DEFAULTS=[
 {id:'activity-0',name:'Centers',picture:iconBase+'schedule-centers.png',active:true},
 {id:'activity-2',name:'Breakfast',picture:iconBase+'schedule-breakfast.png',active:true},
 {id:'activity-1',name:'Circle Time',picture:iconBase+'schedule-circle-time.png',active:true},
 {id:'activity-4',name:'Recess',picture:iconBase+'schedule-recess.png',active:true},
 {id:'activity-5',name:'Lunch',picture:iconBase+'schedule-lunch.png',active:true},
 {id:'activity-6',name:'Nap',picture:iconBase+'schedule-nap.png',active:true},
 {id:'activity-7',name:'Snack',picture:iconBase+'schedule-snack.png',active:true}
];
function stored(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(e){return {}}}
function schedule(){try{const x=JSON.parse(localStorage.getItem(SCHEDULE_KEY)||'null');if(Array.isArray(x)&&x.length)return x.filter(i=>i&&i.active!==false)}catch(e){}return DEFAULTS}
function index(){const s=schedule();return Math.max(0,Math.min(Number(localStorage.getItem(PROGRESS_KEY)||0),s.length))}
function keyFor(item,i){return item&&item.id?item.id:'activity-'+i}
function isRecess(item){return item&&/^(recess|outside|outdoor play|playground)$/i.test(String(item.name||'').trim())}
function localDateKey(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function openDetails(item,i){if(!item)return;if(isRecess(item)){location.href='weather.html';return}
 const key=keyFor(item,i),pics=stored(POPUP_KEY),audioMap=stored(AUDIO_KEY),rules=stored(RULES_KEY),now=stored(NOW_KEY),clip=audioMap[key]||null;
 const image=pics[key]||now[key]||item.picture||'';const rule=String(rules[key]||'').trim();
 const overlay=document.createElement('div');overlay.id='eea-schedule-detail-overlay';overlay.style.cssText='position:fixed;inset:0;z-index:30000;background:rgba(31,54,66,.7);display:flex;align-items:center;justify-content:center;padding:3vh 4vw;font-family:Trebuchet MS,Arial,sans-serif';
 const card=document.createElement('div');card.style.cssText='position:relative;width:min(900px,86vw);max-height:86vh;overflow:auto;border-radius:28px;background:#fffaf0;border:3px solid #527da8;padding:28px 34px;text-align:center;color:#173f72;box-shadow:0 22px 70px rgba(20,42,55,.34)';
 card.innerHTML=`<button id="eea-detail-close" style="position:absolute;right:16px;top:12px;width:52px;height:52px;border-radius:50%;border:1.5px solid #b7c9d5;background:white;color:#173f72;font-size:34px;font-weight:900;cursor:pointer">×</button><h2 style="font-size:38px;margin:4px 60px 18px">${String(item.name||'Activity').replace(/[&<>]/g,'')}</h2>${image?`<img src="${image}" alt="" style="display:block;max-width:72%;max-height:44vh;object-fit:contain;margin:0 auto 18px">`:''}${rule?`<div style="font-size:24px;line-height:1.35;font-weight:800;margin:14px auto 18px;max-width:700px">${rule.replace(/[<>]/g,'')}</div>`:''}<div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap"><button id="eea-detail-audio" style="${clip&&clip.src?'':'display:none;'}border:1.5px solid #9fb7c5;border-radius:16px;background:#eef5f1;color:#173f72;padding:12px 20px;font-size:18px;font-weight:900;cursor:pointer">🔊 Play Audio</button><button id="eea-detail-done" style="border:0;border-radius:16px;background:#648fae;color:white;padding:13px 24px;font-size:19px;font-weight:900;cursor:pointer">✓ Done / Next Activity</button></div>`;
 overlay.appendChild(card);document.body.appendChild(overlay);
 let player=null;function close(){if(player){player.pause();player=null}overlay.remove()}
 $('eea-detail-close').onclick=close;overlay.onclick=e=>{if(e.target===overlay)close()};
 const ab=$('eea-detail-audio');if(ab&&clip&&clip.src)ab.onclick=()=>{if(player)player.pause();player=new Audio(clip.src);player.play().catch(()=>{})};
 $('eea-detail-done').onclick=()=>{const s=schedule(),cur=index();localStorage.setItem(PROGRESS_KEY,String(Math.min(cur+1,s.length)));close();location.reload()};
}
function syncCompletionState(){
 const s=schedule(),i=index();if(!s.length||i<s.length)return;
 document.querySelectorAll('.schedule-row').forEach(row=>{row.classList.add('done');row.classList.remove('active')});
 const title=$('next-title'),icon=$('next-icon'),panel=$('now-panel');
 if(title)title.textContent='Our day is complete!';
 if(icon){icon.style.visibility='hidden';icon.removeAttribute('src')}
 if(panel){panel.classList.remove('recess-weather');panel.removeAttribute('aria-label')}
}
function interceptNowPanel(){
 // Schedule rows belong to Home's schedule-progress controller. Do not capture
 // those clicks here; teachers use them to advance or move back through the day.
 document.addEventListener('click',e=>{
  const panel=e.target.closest&&e.target.closest('#now-panel');
  if(!panel)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  const s=schedule(),i=index();if(i>=s.length)return;openDetails(s[i],i);
 },true)
}
function interceptDailyLessonsResume(){const btn=$('lessons-tool');if(!btn)return;btn.addEventListener('click',e=>{let r=null;try{r=JSON.parse(localStorage.getItem('eea-lesson-resume')||'null')}catch(err){}if(!r||r.date!==localDateKey())return;const week=Number(r.week),day=Number(r.day),section=Number(r.section);if(!Number.isInteger(week)||week<1||week>9||!Number.isInteger(day)||day<0||day>4||!Number.isInteger(section)||section<0)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();location.href=`lesson-runner-week${week}.html?week=${week}&day=${day}&section=${section}&resume=1&v=${Date.now()}`},true)}
function replaceQuickTimer(){const start=$('quick-start'),pause=$('quick-pause'),reset=$('quick-stop'),plus=$('quick-plus'),display=$('quick-time');if(!start||!pause||!reset||!plus||!display)return;
 [start,pause,reset,plus].forEach(btn=>{const clone=btn.cloneNode(true);btn.replaceWith(clone)});
 const s=$('quick-start'),p=$('quick-pause'),r=$('quick-stop'),pl=$('quick-plus');let base=300;try{const cfg=JSON.parse(localStorage.getItem('eea-app-settings')||'{}');base=Math.max(60,Number(cfg.timer||5)*60)}catch(e){}let left=base,timer=null,running=false;
 function draw(){display.textContent=`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`}
 function stopTicker(){if(timer){clearInterval(timer);timer=null}}
 s.onclick=()=>{if(running||left<=0)return;running=true;stopTicker();timer=setInterval(()=>{left=Math.max(0,left-1);draw();if(left===0){running=false;stopTicker();try{const A=window.AudioContext||window.webkitAudioContext;if(A){const c=new A(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=660;g.gain.setValueAtTime(.08,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.45);o.start();o.stop(c.currentTime+.45)}}catch(e){}}},1000)};
 p.onclick=()=>{running=false;stopTicker()};r.onclick=()=>{running=false;stopTicker();left=base;draw()};pl.onclick=()=>{base+=60;left+=60;draw()};draw();
}
function init(){syncCompletionState();interceptNowPanel();interceptDailyLessonsResume();setTimeout(replaceQuickTimer,0)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();