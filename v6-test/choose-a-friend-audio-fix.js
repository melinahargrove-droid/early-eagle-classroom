(()=>{
  'use strict';

  const STUDENT_KEY='eea-students-v1';

  function roster(){
    try{
      const saved=JSON.parse(localStorage.getItem(STUDENT_KEY)||'[]');
      return Array.isArray(saved)?saved:[];
    }catch(e){return[]}
  }

  function nextStudent(){
    try{
      if(typeof queue==='undefined'||!queue.length||typeof studentById==='undefined')return null;
      return studentById(queue[0])||null;
    }catch(e){return null}
  }

  function setup(){
    const audio=window.EEANameAudio;
    if(!audio)return;

    // Keep the legacy page call wired to the one shared engine.
    window.playNameAudio=student=>audio.play(student);
    try{playNameAudio=window.playNameAudio}catch(e){}

    const warmAll=()=>audio.warmMany(roster());
    const choose=document.getElementById('chooseBtn');
    if(choose){
      const prepare=()=>{
        audio.unlock();
        const student=nextStudent();
        if(student)audio.warm(student);
      };
      choose.addEventListener('pointerdown',prepare,true);
      choose.addEventListener('touchstart',prepare,{capture:true,passive:true});
    }

    warmAll();
    window.addEventListener('load',warmAll,{once:true});
  }

  function loadSharedEngine(){
    if(window.EEANameAudio){setup();return}
    const script=document.createElement('script');
    script.src='name-audio-engine.js';
    script.async=false;
    script.onload=setup;
    script.onerror=()=>console.error('[EEA Name Audio] Shared engine failed to load');
    document.head.appendChild(script);
  }

  loadSharedEngine();
})();
