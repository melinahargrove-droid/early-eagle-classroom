(()=>{
  const days=['Monday','Tuesday','Wednesday','Thursday','Friday'],params=new URLSearchParams(location.search);
  const raw=params.get('day'),named=days.indexOf(raw),numeric=raw!==null&&/^\d$/.test(raw)?Number(raw):-1;
  const weekday=new Date().getDay(),day=named>=0?named:numeric>=0&&numeric<5?numeric:weekday===0||weekday===6?4:weekday-1;
  let embedded=false;try{embedded=params.get('from')==='runner'&&parent!==window&&parent.location.origin===location.origin&&new URL(parent.location.href).pathname.endsWith('/lesson-runner-week11.html');}catch{}
  const destination=embedded?parent:window,boat=day%2===0,asset='assets/focus-3s/unit-2/week-3/community/';
  let visual=boat&&params.get('visual')==='chair'?'chair':boat?'illustration':'square',leaving=false;
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])), $=id=>document.getElementById(id);
  const full=boat?[
    'Do this together with the children. Invite children to sit on the floor with their feet on the ground and their knees bent.',
    'This is a tricky balancing pose and you can try just one of these steps or all of them.',
    'Let’s try together:',
    'Put your feet on the ground and hug your knees gently. Put your arms behind you and point your toes.',
    'When you are ready, lean back and lift up your legs. You can stretch out your arms and balance. Don’t forget to breathe!',
    'Only one leg could be lifted at a time and/or use a chair. (see visual)'
  ]:[
    'Do this together with the children.',
    'Find a comfortable sitting position. We will count mentally while we breathe.',
    'Breathe in and count to four mentally: one, two, three, four… You can keep track of your counting by tracing an imaginary square with your finger',
    'Model by tracing a finger in the air.',
    'Hold your breath and count to four mentally as you trace another side of the square.',
    'Breathe out as you count to four.',
    'Then hold your breath again to the count of four and trace the square.',
    'Repeat a few times. When you are done, rest with your eyes closed.'
  ];
  const steps=boat?[
    ['Set up','Sit with your feet on the ground and knees bent. Hug your knees gently.'],
    ['Try a balance','Put your arms behind you and point your toes. When ready, lean back and lift your legs.'],
    ['Breathe','Stretch out your arms and balance. Try one step or all; lift one leg at a time or use a chair.']
  ]:[
    ['Breathe in','Sit comfortably. Breathe in to a mental count of four; trace one side of an imaginary square.'],
    ['Hold','Count to four mentally as you trace another side.'],
    ['Breathe out','Breathe out to a count of four.'],
    ['Hold again','Count to four and finish tracing the square. Repeat a few times; rest with your eyes closed.']
  ];
  $('sub').textContent=days[day]+' · Mindful practice';
  $('lesson').innerHTML=`<article class="community-card"><figure class="community-visual"><img id="practice-image" class="lesson-img" alt=""><div class="visual-options">${boat?'<button type="button" id="illustration">Illustrated pose</button><button type="button" id="chair">Chair option</button>':''}<button type="button" id="enlarge">Enlarge image</button></div></figure><div class="community-copy with-steps"><div class="kicker">${days[day].toUpperCase()} · WORLD OF COLOR</div><h2>${boat?'Boat Pose':'Square Breathing'}</h2><div class="lead">${boat?'Balance gently. Don’t forget to breathe!':'Trace a square as you breathe and count.'}</div><ol class="teaching-steps" aria-label="Activity steps">${steps.map(([title,text])=>`<li><b>${title}</b><p>${text}</p></li>`).join('')}</ol><details class="community-notes"><summary>Teacher Notes</summary><div class="community-notes-content"><h3>Complete mindful practice</h3>${full.map(text=>`<p>${escape(text)}</p>`).join('')}<h3>Weekly assignment</h3><p>Boat Pose: Monday, Wednesday and Friday. Square Breathing: Tuesday and Thursday. This daily assignment is the teacher-approved companion schedule; the original weekly plan says to choose from the Community Meeting plans.</p><h3>Teacher reflection notes</h3><p>Notice how children respond to mindfulness practice. Do they prefer yoga poses or breathing exercise? What does that tell you about them and the dynamics of the group?</p><h3>SEL Standards</h3><p>SEL4. Self-Management. The child will demonstrate impulse control and stress management.</p><p>SEL8. Self-Management. The child will engage socially, and build relationships with other children and with adults.</p><p>SEL9. Relationship Skills. The child will demonstrate the ability to manage conflict.</p><h3>Original visual credits</h3><p>Boat Pose: Guber, T., Kalish, L., &amp; Fatus, S. (2005). Yoga Pretzel Activity Cards.</p><p>Boat Pose on Chair: Photo of Unicia Young by Marina Boni.</p><p>Square Breathing: Calmerry, “Teaching your kids square breathing while having fun.” The original source address is retained on the full-page visual.</p><h3>Source materials</h3><ul><li><a href="https://drive.google.com/file/d/10CEcbmXfoajcKKB8Lbdsgv9nnQ6IuTnZ/view" target="_blank" rel="noopener noreferrer">Original Community Meeting Plan</a></li><li><a href="https://drive.google.com/file/d/1aRrGS6Xq3fJmjbuPG4-_3Y51DxO1O0w_/view" target="_blank" rel="noopener noreferrer">Original Community Meeting Visuals (complete PDF)</a></li><li><a href="https://docs.google.com/document/d/135vSqhP-fhVwzw67338NH4NQ2569uj8S3vVbWURFRLY/edit" target="_blank" rel="noopener noreferrer">Original Week 3 Plan</a></li></ul><p>Focus on Pre-K 3s · Boston Public Schools Department of Early Childhood P-2. Original visual pages and credits are preserved without cropping or redrawing.</p></div></details></div></article>`;
  const notes=document.querySelector('.community-notes'),copy=document.querySelector('.community-copy');
  notes.addEventListener('toggle',()=>{if(notes.open)copy.scrollTop+=notes.getBoundingClientRect().top-copy.getBoundingClientRect().top;else copy.scrollTop=0;});
  const descriptions={illustration:['boat-pose.jpg','Original Boat Pose illustrated activity card, showing seated balance steps and original Yoga Pretzel credit.'],chair:['boat-pose-chair.jpg','Original Boat Pose on Chair photograph of Unicia Young by Marina Boni, showing the seated chair adaptation.'],square:['square-breathing.jpg','Original Square Breathing diagram: breathe in, hold, breathe out, pause, each to a count of four.']};
  function restore(value){visual=boat&&value==='chair'?'chair':boat?'illustration':'square';const [file,alt]=descriptions[visual];$('practice-image').src=asset+file;$('practice-image').alt=alt;for(const id of ['illustration','chair'])if($(id))$(id).setAttribute('aria-pressed',String(id===visual));if($('image-dialog').open)$('image-dialog').close();}
  window.EEACommunityRestore=restore;
  window.EEASectionState=()=>({index:0,step:0,total:1,atStart:true,atEnd:true,visual});
  function route(value,replace=false){if(embedded&&typeof parent.EEACommunityNavigate==='function'){parent.EEACommunityNavigate(value,replace);return;}restore(value);const url=new URL(location.href);url.searchParams.set('week','11');url.searchParams.set('day',days[day]);url.searchParams.set('section','2');url.searchParams.set('visual',visual);for(const key of ['step','stop','book','center','review'])url.searchParams.delete(key);if(url.href!==location.href)history[replace?'replaceState':'pushState'](null,'',url.href);}
  for(const id of ['illustration','chair'])if($(id))$(id).onclick=()=>route(id);
  $('enlarge').onclick=()=>{$('enlarged-image').src=$('practice-image').src;$('enlarged-image').alt=$('practice-image').alt;$('image-dialog').showModal();};
  $('close-image').onclick=()=>$('image-dialog').close();
  $('image-dialog').addEventListener('click',event=>{if(event.target!==event.currentTarget)return;const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.currentTarget.close();});
  const navigate=target=>{if(leaving)return;leaving=true;destination.location.href=target;};
  const overview=()=>{localStorage.removeItem('eea-lesson-auto-resume');navigate('daily-lessons.html?week=11&day='+day);};
  ['prev','exit'].forEach(id=>$(id).onclick=overview);
  $('done').textContent=day<2?'Next: Read Aloud →':'Next: Centers →';
  $('done').onclick=()=>{if(embedded&&typeof parent.EEAWeek11CompleteCommunity==='function')parent.EEAWeek11CompleteCommunity();else navigate('lesson-runner-week11.html?week=11&day='+day+'&section='+(day<2?0:1));};
  window.addEventListener('popstate',()=>restore(new URLSearchParams(location.search).get('visual')));
  window.addEventListener('pageshow',()=>{leaving=false;restore(new URLSearchParams(destination.location.search).get('visual'));});
  route(visual,true);
})();
