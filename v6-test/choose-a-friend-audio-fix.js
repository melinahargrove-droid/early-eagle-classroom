(()=>{
  'use strict';

  const STUDENT_KEY='eea-students-v1';
  const NAME_KEY='eea-student-names';
  const ATTENDANCE_KEY='eea-attendance-present';
  const ATTENDANCE_DATE_KEY='eea-attendance-date';
  const STAR_KEY='eea-current-star';
  const STATE_KEY='eea-choose-friend-state-v1';
  const CANONICAL=['Avery','Bentley','Blakely','Brantley','Dylan','Easton','Emersyn','Everleigh','Grayson','Harper','Hudson','Jaxson','Kinsley','Liam','Maverick','Oakley','Sawyer','Warren','Wyatt','Zoey'];
  let fixedStickOrder=[];

  function localDateKey(d=new Date()){
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  function canonicalizeIfNeeded(){
    let valid=false;
    try{const saved=JSON.parse(localStorage.getItem(STUDENT_KEY)||'null');valid=Array.isArray(saved)&&saved.length>0}catch(e){}
    if(valid)return;
    const seeded=CANONICAL.map((name,i)=>({id:'s'+(i+1),name,active:true,photo:'',audio:''}));
    try{localStorage.setItem(STUDENT_KEY,JSON.stringify(seeded));localStorage.setItem(NAME_KEY,JSON.stringify(CANONICAL))}catch(e){}
    try{
      if(typeof students!=='undefined'&&Array.isArray(students))students.splice(0,students.length,...seeded.map(s=>({id:s.id,name:s.name,photo:'',audio:''})));
    }catch(e){}
  }

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

  function safeEligibleIds(){
    try{
      if(localStorage.getItem(ATTENDANCE_DATE_KEY)!==localDateKey())return [];
      const list=roster().filter(s=>s&&s.active!==false&&String(s.id||'').trim());
      const known=new Map(list.map((s,i)=>[String(s.id||('s'+i)),s]));
      const raw=JSON.parse(localStorage.getItem(ATTENDANCE_KEY)||'[]');
      if(!Array.isArray(raw))return [];
      return [...new Set(raw.map(v=>{
        let id=String(v);
        if(/^\d+$/.test(id)&&list[Number(id)])id=String(list[Number(id)].id);
        return id;
      }).filter(id=>known.has(id)))];
    }catch(e){return []}
  }

  function buildSafeQueue(){
    const eligible=new Set(safeEligibleIds());
    const available=roster().filter(s=>s&&s.active!==false&&eligible.has(String(s.id)));
    let starName='';
    try{starName=String(localStorage.getItem(STAR_KEY)||'').trim()}catch(e){}
    const star=available.find(s=>String(s.name||'')===starName);
    const others=available.filter(s=>!star||String(s.id)!==String(star.id)).map(s=>String(s.id));
    for(let i=others.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[others[i],others[j]]=[others[j],others[i]]}
    return star?[String(star.id),...others]:others;
  }

  function normalizeInitialRound(){
    canonicalizeIfNeeded();
    try{presentIds=()=>safeEligibleIds()}catch(e){}
    try{
      if(typeof queue!=='undefined'&&Array.isArray(queue)){
        queue.splice(0,queue.length,...buildSafeQueue());
        currentId=null;
        completed=false;
      }
    }catch(e){}
  }

  function eligibleIds(){return safeEligibleIds()}

  function loadRound(){
    try{
      if(typeof queue==='undefined'||typeof currentId==='undefined'||typeof completed==='undefined')return false;
      const saved=JSON.parse(localStorage.getItem(STATE_KEY)||'null');
      if(!saved||saved.date!==localDateKey()||!Array.isArray(saved.queue))return false;

      const eligible=new Set(eligibleIds());
      const known=new Set(roster().filter(Boolean).map(s=>String(s.id)));
      const valid=id=>known.has(String(id))&&eligible.has(String(id));

      let savedOrder=Array.isArray(saved.stickOrder)?saved.stickOrder.map(String).filter(valid):[];
      let savedQueue=saved.queue.map(String).filter(valid);
      let savedCurrent=saved.currentId===null||saved.currentId===undefined?null:String(saved.currentId);
      if(savedCurrent!==null&&!valid(savedCurrent))savedCurrent=null;

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
      fixedStickOrder=(savedOrder.length?savedOrder:[...queue,...(currentId?[currentId]:[])]).slice(0,20);
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

  normalizeInitialRound();
  loadRound();
  restoreOriginalBasketMechanics();
  loadSharedEngine();
})();