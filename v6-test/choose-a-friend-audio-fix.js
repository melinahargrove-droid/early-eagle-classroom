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

  function restoreOriginalBasketMechanics(){
    try{
      if(typeof queue==='undefined'||typeof slots==='undefined'||typeof renderSticks!=='function')return;
      if(typeof sticks==='undefined'||typeof remaining==='undefined'||typeof choose==='undefined'||typeof skip==='undefined')return;

      // The original Choose a Friend basket gave every child one physical stick
      // position for the whole round. A chosen stick disappears from that exact
      // spot; the remaining sticks never slide over or reshuffle themselves.
      const fixedStickOrder=[...queue].slice(0,slots.length);

      renderSticks=function(){
        const available=new Set(queue);
        sticks.innerHTML=slots.map((s,i)=>{
          const id=fixedStickOrder[i];
          const style=`--x:${s.x}%;--y:${s.y}%;--w:${s.w}%;--h:${s.h}%;--tilt:${s.t}deg`;
          return id&&available.has(id)
            ?`<div class="mini-stick" data-id="${id}" style="${style}"></div>`
            :`<div class="mini-stick"${id?` data-id="${id}"`:''} style="${style};visibility:hidden"></div>`;
        }).join('');
        remaining.textContent=queue.length+(currentId!==null?1:0);
        choose.disabled=busy||completed||(queue.length===0&&currentId===null);
        choose.textContent=completed?'Finished':'Choose';
        skip.classList.toggle('show',currentId!==null&&!busy&&!completed);
      };

      renderSticks();
    }catch(e){
      console.error('[EEA Choose a Friend] Could not restore original basket behavior',e);
    }
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

  restoreOriginalBasketMechanics();
  loadSharedEngine();
})();
