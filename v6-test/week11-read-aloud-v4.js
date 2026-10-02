(()=>{
  const params=new URLSearchParams(location.search),days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const value=params.get('day'),named=days.indexOf(value),numeric=value!==null&&/^\d$/.test(value)?Number(value):-1;
  const validDay=named>=0||numeric>=0&&numeric<5,weekday=new Date().getDay();
  const day=named>=0?named:numeric>=0&&numeric<5?numeric:weekday===0||weekday===6?4:weekday-1;
  let embedded=false;try{embedded=parent!==window&&parent.location.origin===location.origin&&new URL(parent.location.href).pathname.endsWith('/lesson-runner-week11.html');}catch(e){}
  const destination=embedded?parent:window;
  let leaving=false;
  const navigate=url=>{if(leaving)return;leaving=true;destination.location.href=url;};
  const complete=()=>{if(embedded&&typeof parent.EEAWeek11CompleteReadAloud==='function'){parent.EEAWeek11CompleteReadAloud();return;}navigate('lesson-runner-week11.html?week=11&day='+day+'&section=1');};
  const overview=()=>{if(embedded&&typeof parent.EEAWeek11Overview==='function'){parent.EEAWeek11Overview();return;}localStorage.removeItem('eea-lesson-auto-resume');navigate('daily-lessons.html?week=11&day='+day);};
  if(!validDay||day>1){overview();return;}
  const plan=day===1?window.EEAWeek11TuesdayReadAloudPlan:window.EEAWeek11ReadAloudPlan,$=id=>document.getElementById(id);
  let index=0,shown=0;
  const clamp=(n,max)=>Math.max(0,Math.min(max,Number.isInteger(Number(n))?Number(n):0));
  function restore(step,stop){index=clamp(step,plan.steps.length-1);shown=clamp(stop,plan.steps[index].stops.length);$('teacherNotes').open=false;render();}
  function state(){const s=plan.steps[index];return{step:index,index,total:plan.steps.length,atStart:index===0,atEnd:index===plan.steps.length-1&&shown===s.stops.length,stopPending:shown<s.stops.length,vocabulary:!!s.vocabulary,stop:shown};}
  window.EEASectionState=state;window.EEAReadAloudPlan=plan;window.EEAReadAloudRestore=restore;
  function route(step,stop,replace=false){
    if(embedded&&typeof parent.EEAReadAloudNavigate==='function'){parent.EEAReadAloudNavigate(step,stop,replace);return;}
    restore(step,stop);const normalized=state(),url=new URL(location.href);url.searchParams.set('day',days[day]);url.searchParams.set('week','11');url.searchParams.set('section','0');url.searchParams.delete('book');url.searchParams.delete('center');url.searchParams.delete('review');url.searchParams.set('step',String(normalized.step));url.searchParams.set('stop',String(normalized.stop));
    if(url.href!==location.href)history[replace?'replaceState':'pushState'](null,'',url.href);
  }
  function render(){
    const s=plan.steps[index],covered=!!s.coverRightPage&&shown<s.revealAtStop;document.querySelector('.stage').classList.toggle('spread',!!s.bookPage);
    $('title').textContent=plan.title;$('sub').textContent=plan.read+' · Written and illustrated by '+plan.author;$('chip').textContent='UNIT 2 · WEEK 3 · '+days[day].toUpperCase();
    // Keep the previously published source plan immutable; only its app-added
    // routing notice changes now that Monday and Tuesday Centers are available.
    const note=day===0&&s.kind==='closing'?s.note.replace('Later Week 3 lessons are still being prepared; Finish returns to Monday’s Day Overview.','Next, we’ll explore Mixing Primary Colors and the All Are Welcome Clubhouse in Centers.'):day===1&&s.kind==='closing'?s.note.replace('Finish returns to Tuesday’s Day Overview; the remaining lessons are still being prepared.','Next, we’ll explore Observational Drawings and Color Walk in Centers.'):s.note;
    $('kicker').textContent=s.vocabulary?'VOCABULARY':'READ ALOUD';$('stepTitle').textContent=s.title;$('prompt').textContent=s.prompt;$('note').textContent=note;$('note').hidden=!note;
    $('bookCue').textContent=plan.title;$('bookNote').textContent='Original book images from the curriculum teacher guide';$('adaptedText').hidden=true;
    $('bookImg').src=s.img;$('bookImg').alt=plan.title+' — '+(s.sourceSlide===1?'cover':s.kind==='book'?s.title:'original book picture from guide slide '+s.sourceSlide)+(s.vocabulary?' · '+s.word:'');$('bookImg').hidden=false;$('icon').hidden=true;
    // A reversible display cover preserves the original JPEG bytes and full spread.
    // It is derived from the same stop state as native history and deep links.
    $('bookImg').style.clipPath=covered?'inset(0 50% 0 0)':'';
    $('pageCoverNote').hidden=!covered;
    if(covered)$('bookImg').alt=plan.title+' — printed page 3; page 4 is covered until the teacher reveals it';
    $('teachingStop').hidden=shown===0;$('stopText').textContent=shown?s.stops[shown-1]:'';
    $('teacherText').textContent=plan.teacherNotes+' '+note+' Printed book page numbers are distinct from teacher-guide slide numbers. Original embedded book images are preserved without cropping or redrawing.';
    $('sourceLink').href=plan.source;$('count').textContent=(index+1)+' of '+plan.steps.length+(s.bookPage?' · '+s.title:'');$('fill').style.width=((index+1)/plan.steps.length*100)+'%';
    $('prev').textContent=index===0?'← Day Overview':'← Previous';
    $('next').textContent=covered&&shown===s.revealAtStop-1?'Reveal Page 4 →':shown<s.stops.length?'Show Teaching Stop →':index===plan.steps.length-1?'Next: Centers →':s.vocabulary?'Continue →':'Next →';
    window.dispatchEvent(new CustomEvent('eea-section-state',{detail:state()}));
  }
  for(const [label,url] of plan.resources){const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener noreferrer';$('bookResources').append(a,document.createElement('br'));}
  $('backBtn').onclick=overview;
  $('prev').onclick=()=>{if(index===0){overview();return;}const s=plan.steps[index],previous=s.vocabulary?plan.steps.findIndex(p=>p.id===s.sourceStep):index-1;route(Math.max(0,previous),0);};
  $('next').onclick=()=>{const s=plan.steps[index];if(shown<s.stops.length){route(index,shown+1);return;}if(index<plan.steps.length-1)route(index+1,0);else complete();};
  window.addEventListener('popstate',()=>{const p=new URLSearchParams(location.search);restore(p.get('step'),p.get('stop'));});
  window.addEventListener('pageshow',()=>{leaving=false;const p=new URLSearchParams((embedded?parent:window).location.search);restore(p.get('step'),p.get('stop'));});
  route(params.get('step')||0,params.get('stop')||0,true);
})();
