(()=>{
  'use strict';

  const STUDENT_KEY='eea-students-v1';
  let fixedStickOrder=[];

  function roster(){
    try{
      const saved=JSON.parse(localStorage.getItem(STUDENT_KEY)||'[]');
      if(Array.isArray(saved)&&saved.length)return saved;
    }catch(e){}
    try{
      if(typeof students!=='undefined'&&Array.isArray(students))return students;
    }catch(e){}
    return [];
  }

  function nextStudent(){
    try{
      if(typeof queue==='undefined'||!queue.length||typeof studentById==='undefined')return null;
      return studentById(queue[0])||null;
    }catch(e){return null}
  }

  function restoreVisibleSelection(){
    try{
      if(typeof big==='undefined'||typeof eddie==='undefined')return;
      big.classList.remove('show','done');
      big.textContent='';
      if(completed){
        big.textContent='Everyone has been chosen!';
        big.classList.add('done');
        eddie.className='eddie-wrap celebrate';
        return;
      }
      if(currentId!==null&&typeof studentById==='function'){
        const student=studentById(currentId);
        if(student){
          big.textContent=student.name;
          big.classList.add('show');
        }
      }
    }catch(e){}
  }

  function restoreOriginalBasketMechanics(){
    try{
      if(typeof queue==='undefined'||typeof slots==='undefined'||typeof renderSticks!=='function')return;
      if(typeof sticks==='undefined'||typeof remaining==='undefined'||typeof choose==='undefined'||typeof skip==='undefined')return;

      if(!fixedStickOrder.length)fixedStickOrder=[...queue,...(currentId?[currentId]:[])].slice(0,slots.length);

      // Preserve the original basket look without owning selection state.
      // The canonical page controls attendance, queue progress, and persistence.
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

      const resetButton=document.getElementById('resetBtn');
      if(resetButton){
        resetButton.addEventListener('click',()=>{
          fixedStickOrder=[...queue,...(currentId?[currentId]:[])].slice(0,slots.length);
          renderSticks();
        });
      }

      restoreVisibleSelection();
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
    const chooseButton=document.getElementById('chooseBtn');
    if(chooseButton){
      const prepare=()=>{
        audio.unlock();
        const student=nextStudent();
        if(student)audio.warm(student);
      };
      chooseButton.addEventListener('pointerdown',prepare,true);
      chooseButton.addEventListener('touchstart',prepare,{capture:true,passive:true});
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

  // Do not restore or save chooser state here. choose-a-friend.html is the
  // single source of truth for attendance-aware queue state and persistence.
  restoreOriginalBasketMechanics();
  loadSharedEngine();
})();
