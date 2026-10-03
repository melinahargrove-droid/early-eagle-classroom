(()=>{
  const params=new URLSearchParams(location.search),days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const value=params.get('day'),named=days.indexOf(value),numeric=value!==null&&/^\d$/.test(value)?Number(value):-1;
  const validDay=named>=0||numeric>=0&&numeric<5,weekday=new Date().getDay();
  const day=named>=0?named:numeric>=0&&numeric<5?numeric:weekday===0||weekday===6?4:weekday-1;
  let embedded=false;try{embedded=parent!==window&&parent.location.origin===location.origin&&new URL(parent.location.href).pathname.endsWith('/lesson-runner-week12.html');}catch(e){}
  const destination=embedded?parent:window;
  let leaving=false;
  const navigate=url=>{if(leaving)return;leaving=true;destination.location.href=url;};
  const complete=()=>{if(embedded&&typeof parent.EEAWeek12CompleteReadAloud==='function'){parent.EEAWeek12CompleteReadAloud();return;}overview();};
  const overview=()=>{if(embedded&&typeof parent.EEAWeek12Overview==='function'){parent.EEAWeek12Overview();return;}localStorage.removeItem('eea-lesson-auto-resume');navigate('daily-lessons.html?week=12&day='+day);};
  if(!validDay||day>3||params.has('section')&&params.get('section')!=='0'){overview();return;}
  const plan=day===3?window.EEAWeek12ThursdayReadAloudPlan:day===2?window.EEAWeek12WednesdayReadAloudPlan:day===1?window.EEAWeek12TuesdayReadAloudPlan:window.EEAWeek12ReadAloudPlan,$=id=>document.getElementById(id);
  let index=0,shown=0;
  const clamp=(n,max)=>Math.max(0,Math.min(max,Number.isInteger(Number(n))?Number(n):0));
  function restore(step,stop){index=clamp(step,plan.steps.length-1);shown=clamp(stop,plan.steps[index].stops.length);$('teacherNotes').open=false;render();}
  function state(){const s=plan.steps[index];return{step:index,index,total:plan.steps.length,atStart:index===0,atEnd:index===plan.steps.length-1&&shown===s.stops.length,stopPending:shown<s.stops.length,vocabulary:!!s.vocabulary,stop:shown};}
  window.EEASectionState=state;window.EEAReadAloudPlan=plan;window.EEAReadAloudRestore=restore;
  function route(step,stop,replace=false){
    if(embedded&&typeof parent.EEAReadAloudNavigate==='function'){parent.EEAReadAloudNavigate(step,stop,replace);return;}
    restore(step,stop);const normalized=state(),url=new URL(location.href);url.searchParams.set('day',days[day]);url.searchParams.set('week','12');url.searchParams.set('section','0');url.searchParams.delete('book');url.searchParams.delete('center');url.searchParams.delete('review');url.searchParams.set('step',String(normalized.step));url.searchParams.set('stop',String(normalized.stop));
    if(url.href!==location.href)history[replace?'replaceState':'pushState'](null,'',url.href);
  }
  function render(){
    const s=plan.steps[index];document.querySelector('.stage').classList.toggle('spread',!!s.bookPage);
    $('title').textContent=plan.title;$('sub').textContent=plan.creditLine||(plan.read+' · '+plan.authors+' · Illustrated by '+plan.illustrator);$('chip').textContent='UNIT 2 · WEEK 4 · '+days[day].toUpperCase();
    const note=s.note;
    $('kicker').textContent=s.vocabulary?'VOCABULARY':'READ ALOUD';$('stepTitle').textContent=s.title;$('prompt').textContent=s.prompt;$('note').textContent=note;$('note').hidden=!note;
    $('bookCue').textContent=s.bookCue||(s.physicalBook?'Read from the classroom book':plan.title);$('bookNote').textContent=s.physicalBook?(plan.physicalBookNote||'Use the physical classroom book for the full original text and illustrations.'):s.vocabulary?(s.img?'Original curriculum visual':'Text vocabulary cue · official cards linked in Teacher Notes'):(plan.bookImageNote||'Original book images from the curriculum teacher guide');$('adaptedText').hidden=true;
    if(s.img){$('bookImg').src=s.img;$('bookImg').alt=s.vocabulary?s.word+' — '+s.definition:plan.title+' — '+(s.sourceSlide===1?'cover':s.title);$('bookImg').hidden=false;$('icon').hidden=true;}else{$('bookImg').removeAttribute('src');$('bookImg').alt='';$('bookImg').hidden=true;$('icon').hidden=false;}
    $('teachingStop').hidden=shown===0;$('stopText').textContent=shown?s.stops[shown-1]:'';
    $('teacherText').textContent=plan.teacherNotes+' '+note+' '+(plan.imageProvenanceNote||'Printed book page numbers are distinct from teacher-guide slide numbers. Original embedded book images are preserved without cropping or redrawing.');
    $('sourceLink').href=plan.source;$('count').textContent=(index+1)+' of '+plan.steps.length+(s.bookPage?' · '+s.title:'')+(plan.readingSupportLabel?' · '+plan.readingSupportLabel:'');$('fill').style.width=((index+1)/plan.steps.length*100)+'%';
    $('prev').textContent=index===0?'← Day Overview':'← Previous';
    $('next').textContent=shown<s.stops.length?'Show Teaching Stop →':index===plan.steps.length-1?'Finish Read Aloud →':s.vocabulary?'Continue →':'Next →';
    const controls=$('discussionControls');controls.replaceChildren();controls.hidden=!s.discussionImages;
    if(s.discussionImages)for(const picture of s.discussionImages){const button=document.createElement('button');button.className='small-button';button.textContent=picture.label;button.type='button';button.setAttribute('aria-pressed',String(picture.img===s.img));button.onclick=()=>{$('bookImg').src=picture.img;$('bookImg').alt=plan.title+' — '+picture.label;for(const child of controls.children)child.setAttribute('aria-pressed',String(child===button));};controls.append(button);}
    window.dispatchEvent(new CustomEvent('eea-section-state',{detail:state()}));
  }
  for(const block of plan.sourceNotes){const heading=document.createElement('h3');heading.textContent=block.title;$('sourceNotes').append(heading);for(const paragraph of block.paragraphs){const p=document.createElement('p');p.textContent=paragraph;$('sourceNotes').append(p);}}
  for(const [label,url] of plan.resources){const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener noreferrer';$('bookResources').append(a,document.createElement('br'));}
  $('backBtn').onclick=overview;
  $('prev').onclick=()=>{if(index===0){overview();return;}const s=plan.steps[index],previous=s.vocabulary?plan.steps.findIndex(p=>p.id===s.sourceStep):index-1;route(Math.max(0,previous),0);};
  $('next').onclick=()=>{const s=plan.steps[index];if(shown<s.stops.length){route(index,shown+1);return;}if(index<plan.steps.length-1)route(index+1,0);else complete();};
  window.addEventListener('popstate',()=>{const p=new URLSearchParams(location.search);restore(p.get('step'),p.get('stop'));});
  window.addEventListener('pageshow',()=>{leaving=false;const p=new URLSearchParams((embedded?parent:window).location.search);restore(p.get('step'),p.get('stop'));});
  route(params.get('step')||0,params.get('stop')||0,true);
})();
