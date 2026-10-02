(()=>{
  const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const params=new URLSearchParams(location.search);
  const day=days.includes(params.get('day'))?params.get('day'):'Monday';
  const dayIndex=days.indexOf(day);
  const practices=[
    {
      title:'Squat or Pyramid Pose',
      lead:'Breathe. Imagine you are a pyramid, strong and steady.',
      img:'assets/focus-3s/unit-2/week-2/community/squat-pyramid-pose.jpg',
      alt:'Original Squat or Pyramid Pose visual: a child squatting with palms together, and a pyramid.',
      steps:[['Set up','Come down to a squat with your knees apart. Bend your arms and put your palms together.'],['Balance','To find your balance, you can gently bounce up and down or you can put your hands on the ground.'],['Focus','Find something at eye level and focus your eyes on it.']],
      introduction:'Do this together with the children.',
      support:'Children can also do this sitting in a chair.'
    },
    {
      title:'Heart Breathing',
      lead:'Breathe in, raise your arms. Breathe out, make a heart.',
      img:'assets/focus-3s/unit-2/week-2/community/heart-breathing.jpg',
      alt:'Original Heart Breathing visual: three photographs demonstrating arms overhead and hands making a heart in front of the body.',
      steps:[['Begin','Invite children to stand up with their hands by their sides.'],['Breathe in','As you breathe in, raise your arms above your head to gather some good energy.'],['Breathe out','As you breathe out, shape your hands like a heart in front of you.']],
      introduction:'Model for children.',
      support:'Repeat the sequence 4-5 times. End by inviting children to put their hand on the heart, take another deep breath and share some love and kindness with themselves.',
      credit:'From Life is Good Playmaker Project. Visuals: Photos of Unicia Young taken by Marina Boni.'
    }
  ];
  const practice=practices[dayIndex%2];
  const reflection=['Notice how children respond to the conversation prompts.','What do they say that might be important to know about them?','Notice how children manage themselves in the group.','How do children interact with and respond to each other?','What support might they need to deepen connections?','Do all children participate?','What do they seem to prefer as a group: mindfulness, conversations, or games?'];
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  document.getElementById('sub').textContent=day+' · Mindful practice';
  document.getElementById('lesson').innerHTML=`<article class="community-card"><figure class="community-visual"><img class="lesson-img" src="${practice.img}" alt="${escape(practice.alt)}"></figure><div class="community-copy with-steps"><div class="kicker">${day.toUpperCase()} · WORLD OF COLOR</div><h2>${practice.title}</h2><div class="lead">${practice.lead}</div><ol class="teaching-steps" aria-label="Activity steps">${practice.steps.map(([title,text])=>`<li><b>${title}</b><p>${text}</p></li>`).join('')}</ol><details class="community-notes"><summary>Teacher Notes</summary><div class="community-notes-content"><p>${practice.introduction}</p><p>${practice.support}</p>${practice.credit?`<p>${practice.credit}</p>`:''}<h3>Weekly assignment</h3><p>Squat or Pyramid Pose: Monday, Wednesday and Friday. Heart Breathing: Tuesday and Thursday. This daily assignment is the teacher-approved companion schedule; the original weekly plan says to choose from the Community Meeting plans.</p><h3>Teacher reflection notes</h3><ul>${reflection.map(text=>`<li>${text}</li>`).join('')}</ul><h3>SEL Standards</h3><p>SEL4. Self-Management. The child will demonstrate impulse control and stress management.</p><p>SEL8. Self-Management. The child will engage socially, and build relationships with other children and with adults.</p><p>SEL9. Relationship Skills. The child will demonstrate the ability to manage conflict.</p><h3>Source materials</h3><ul><li><a href="https://drive.google.com/file/d/1zcmiPV6midMNPtYjg1_IKx7lAKPPu0i9/view" target="_blank" rel="noopener">Original Community Meeting Plan</a></li><li><a href="https://drive.google.com/file/d/1OmZsge2fDLnNNjeswoyp7X6qW1Rysqp6/view" target="_blank" rel="noopener">Original Community Meeting Visuals (complete PDF)</a></li><li><a href="https://docs.google.com/document/d/1lYe4_XN0sIUJeeEt2kbxzxtzqkteNSX9woHXpfXlb7Y/edit" target="_blank" rel="noopener">Original Week 2 Plan</a></li></ul><p>Focus on Pre-K 3s · Boston Public Schools Department of Early Childhood P-2. Original visual pages and credits are preserved without cropping or redrawing.</p></div></details></div></article>`;
  window.EEASectionState=()=>({index:0,total:1,atStart:true,atEnd:true});
  const overview=()=>{
    localStorage.removeItem('eea-lesson-auto-resume');
    const target=new URL('daily-lessons.html?week=10&day='+dayIndex,location.href).href;
    // These controls can be clicked before the image and iframe.onload finish.
    const destination=params.get('from')==='runner'&&window.parent!==window?window.parent:window;
    destination.location.href=target;
  };
  ['prev','exit'].forEach(id=>document.getElementById(id).onclick=overview);
  document.getElementById('done').textContent=dayIndex<5?'Next: Read Aloud →':'Return to Overview →';
  document.getElementById('done').onclick=()=>{

    const destination=params.get('from')==='runner'&&window.parent!==window?window.parent:window;
    if(typeof destination.EEAWeek10CompleteCommunity==='function')destination.EEAWeek10CompleteCommunity();
    else destination.location.href='lesson-runner-week10.html?week=10&day='+dayIndex+'&section=1';
  };
})();
