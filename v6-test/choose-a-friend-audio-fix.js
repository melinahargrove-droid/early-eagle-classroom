(()=>{
  'use strict';

  const STUDENT_KEY='eea-students-v1';
  const STATE_KEY='eea-choose-friend-state-v1';
  let fixedStickOrder=[];

  function localDateKey(d=new Date()){
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  function roster(){
    try{
      const saved=JSON.parse(localStorage.getItem(STUDENT_KEY)||'[]');
      return Array.isArray(saved)?saved:[];
    }catch(e){return[]}
  }

  function eligibleIds(){
    try{
      if(typeof presentIds==='function')return presentIds().map(String);
    }catch(e){}
    return roster().filter(s=>s&&s.active!==false).map(s=>String(s.id));
  }

  function loadRound(){
    try{
      if(typeof queue==='undefined'||typeof currentId==='undefined'||typeof completed==='undefined')return false;
      const saved=JSON.parse(localStorage.getItem(STATE_KEY)||'null');
      if(!saved||saved.date!==localDateKey()||!Array.isArray(saved.queue))return false;

      const eligible=new Set(eligibleIds());
      const known=new Set(roster().map(s=>String(s.id)));
      const valid=id=>known.has(String(id))&&eligible.has(String(id));

      let savedOrder=Array.isArray(saved.stickOrder)?saved.stickOrder.map(String).filter(valid):[];
      let savedQueue=saved.queue.map(String).filter(valid);
      let savedCurrent=saved.currentId===null||saved.currentId===undefined?null:String(saved.currentId);
      if(savedCurrent!==null&&!valid(savedCurrent))savedCurrent=null;

      // Preserve who has already had a turn, but append children who became present later.
      const alreadyAccounted=new Set([...savedOrder]);
      const newcomers=[...eligible].filter(id=>known.has(id)&&!alreadyAccounted.has(id));
      if(newcomers.length){
        savedOrder.push(...newcomers);
        savedQueue.push(...newcomers);
      }

      savedQueue=[...new Set(savedQueue.filter(id=>id!==savedCurrent))];
      savedOrder=[...new Set(savedOrder)];
      queue=savedQueue;
      currentId=savedCurrent;
      completed=Boolean(saved.completed)&&queue.length===0&&currentId===null;
      fixedStickOrder=savedOrder.length?savedOrder:[...queue,...(currentId?[currentId]:[])];
      return true;
    }catch(e){
      console.error('[EEA Choose a Friend] Could not restore round progress',e);
      return false;
    }
  }

  function saveRound(){
    try{
      if(typeof queue==='undefined'||typeof currentId==='undefined'||typeof completed==='undefined')return;
      localStorage.setItem(STATE_KEY,JSON.stringify({
        version:1,
        date:localDateKey(),
        queue:[...queue],
        currentId:currentId===null?null:String(currentId),
        completed:Boolean(completed),
        stickOrder:[...fixedStickOrder]
      }));
    }catch(e){
      console.error('[EEA Choose a Friend] Could not save round progress',e);
    }
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

      if(!fixedStickOrder.length)fixedStickOrder=[...queue,...(currentId?[currentId]:[])].slice(0,slots.length);

      // The original Choose a Friend basket gave every child one physical stick
      // position for the whole round. A chosen stick disappears from that exact
      // spot; the remaining sticks never slide over or reshuffle themselves.
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
        saveRound();
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
      window.addEventListener('pagehide',saveRound);
      window.addEventListener('beforeunload',saveRound);
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

  loadRound();
  restoreOriginalBasketMechanics();
  loadSharedEngine();
})();
