(()=>{
  'use strict';

  const STUDENT_KEY='eea-students-v1';
  const ATTENDANCE_KEY='eea-attendance-present';
  const ATTENDANCE_DATE_KEY='eea-attendance-date';
  const STAR_KEY='eea-current-star';
  const STATE_KEY='eea-choose-friend-state-v1';
  let fixedStickOrder=[];

  function localDateKey(d=new Date()){
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  function savedRoster(){
    try{
      const saved=JSON.parse(localStorage.getItem(STUDENT_KEY)||'[]');
      if(Array.isArray(saved))return saved;
    }catch(e){}
    return [];
  }

  function activeRoster(){
    return savedRoster().filter(s=>s&&s.active!==false&&String(s.name||'').trim());
  }

  function syncInlineRoster(){
    const saved=activeRoster();
    try{
      if(typeof students!=='undefined'&&Array.isArray(students)){
        students.splice(0,students.length,...saved.map((s,i)=>({
          id:String(s.id||('s'+i)),
          name:String(s.name).trim(),
          photo:s.photo||'',
          audio:s.audio||''
        })));
      }
    }catch(e){}
    return saved;
  }

  function roster(){
    return activeRoster();
  }

  function safeEligibleIds(){
    try{
      if(localStorage.getItem(ATTENDANCE_DATE_KEY)!==localDateKey())return [];
      const list=roster().filter(s=>s&&String(s.id||'').trim());
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
    const available=roster().filter(s=>eligible.has(String(s.id)));
    let starName='';
    try{starName=String(localStorage.getItem(STAR_KEY)||'').trim()}catch(e){}
    const star=available.find(s=>String(s.name||'')===starName);
    const others=available.filter(s=>!star||String(s.id)!==String(star.id)).map(s=>String(s.id));
    for(let i=others.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[others[i],others[j]]=[others[j],others[i]]}
    return star?[String(star.id),...others]:others;
  }

  function normalizeInitialRound(){
    syncInlineRoster();
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

      const hadSavedParticipants=saved.queue.length>0||(Array.isArray(saved.stickOrder)&&saved.stickOrder.length>0)||(saved.currentId!==null&&saved.currentId!==undefined);
      if(!hadSavedParticipants&&eligible.size>0){
        localStorage.removeItem(STATE_KEY);
        return false;
      }

      let savedOrder=Array.isArray(saved.stickOrder)?saved.stickOrder.map(String).filter(valid):[];
      let savedQueue=saved.queue.map(String).filter(valid);
      let savedCurrent=saved.currentId===null||saved.currentId===undefined?null:String(saved.currentId);
      if(savedCurrent!==null&&!valid(savedCurrent))savedCurrent=null;

      const alreadyAccounted=new Set(savedOrder);
      const newcomers=[...eligible].filter(id=>known.has(id)&&!alreadyAccounted.has(id));
      if(newcomers.length){
        savedOrder.push(...newcomers);
        savedQueue.push(...newcomers);
      }

      savedQueue=[...new Set(savedQueue.filter(id=>id!==savedCurrent))];
      savedOrder=[...new Set(savedOrder)];
      queue=savedQueue;
      currentId=savedCurrent;
      completed=Boolean(saved.completed)&&eligible.size>0&&queue.length===0&&currentId===null;
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

  function removeEmptyState(){
    const old=document.getElementById('eea-caf-empty-state');
    if(old)old.remove();
  }

  function showEmptyState(){
    removeEmptyState();
    const list=roster();
    const eligible=safeEligibleIds();
    if(list.length&&eligible.length)return false;

    try{
      queue.splice(0,queue.length);
      currentId=null;
      completed=false;
      fixedStickOrder=[];
    }catch(e){}

    const reveal=document.querySelector('.reveal');
    if(!reveal)return true;
    const card=document.createElement('div');
    card.id='eea-caf-empty-state';
    card.style.cssText='position:absolute;inset:9% 8%;z-index:20;border:2px solid #8ca9bf;border-radius:28px;background:rgba(255,250,242,.96);box-shadow:0 12px 28px rgba(35,76,119,.12);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:28px;color:#123d78;';

    const heading=document.createElement('div');
    heading.style.cssText='font-size:clamp(28px,2.5vw,48px);font-weight:900;margin-bottom:12px;';
    const detail=document.createElement('div');
    detail.style.cssText='font-size:clamp(17px,1.35vw,25px);font-weight:700;line-height:1.35;max-width:620px;margin-bottom:22px;';
    const action=document.createElement('button');
    action.type='button';
    action.style.cssText='border:2px solid #527da8;border-radius:18px;background:#fffaf2;color:#123d78;font-size:clamp(18px,1.35vw,25px);font-weight:900;padding:13px 24px;cursor:pointer;';

    if(!list.length){
      heading.textContent='No students yet';
      detail.textContent='Add students to this class before using Choose a Friend.';
      action.textContent='Open Students';
      action.onclick=()=>{location.href='students.html'};
    }else{
      heading.textContent='No friends marked present yet';
      detail.textContent='Take attendance for today before using Choose a Friend.';
      action.textContent='Open Attendance';
      action.onclick=()=>{location.href='attendance.html'};
    }

    card.append(heading,detail,action);
    reveal.appendChild(card);
    try{
      if(typeof choose!=='undefined')choose.disabled=true;
      if(typeof reset!=='undefined')reset.disabled=true;
      if(typeof skip!=='undefined')skip.classList.remove('show');
      if(typeof remaining!=='undefined')remaining.textContent='0';
    }catch(e){}
    saveRound();
    return true;
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
  showEmptyState();
  loadSharedEngine();
})();