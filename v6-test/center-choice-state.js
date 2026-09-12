(()=>{
  'use strict';
  if(!/\bcenter-choice\.html$/i.test(location.pathname))return;

  const STATE_KEY='eea-center-choice-state-v1';
  const STUDENT_KEY='eea-students-v1';
  const ATTENDANCE_KEY='eea-attendance-present';
  const ATTENDANCE_DATE_KEY='eea-attendance-date';
  const dateKey=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};

  function appSettings(){try{return JSON.parse(localStorage.getItem('eea-app-settings')||'{}')||{}}catch(e){return {}}}
  function celebrationSoundsEnabled(){return appSettings().revealSounds!==false}

  function savedRoster(){
    try{
      const saved=JSON.parse(localStorage.getItem(STUDENT_KEY)||'[]');
      if(Array.isArray(saved))return saved;
    }catch(e){}
    try{localStorage.setItem(STUDENT_KEY,'[]')}catch(e){}
    return [];
  }

  function syncInlineRoster(){
    const roster=savedRoster().filter(s=>s&&s.active!==false&&String(s.name||'').trim());
    try{
      if(typeof students!=='undefined'&&Array.isArray(students)){
        students.splice(0,students.length,...roster.map((s,i)=>({
          id:String(s.id||('s'+i)),
          name:String(s.name).trim(),
          photo:s.photo||'',
          audio:s.audio||''
        })));
      }
    }catch(e){}
  }

  function safePresentIds(){
    try{
      if(localStorage.getItem(ATTENDANCE_DATE_KEY)!==dateKey())return [];
      const raw=JSON.parse(localStorage.getItem(ATTENDANCE_KEY)||'[]');
      if(!Array.isArray(raw))return [];
      const known=new Map((typeof students!=='undefined'&&Array.isArray(students)?students:[]).map((s,i)=>[String(s.id||('s'+i)),s]));
      const list=typeof students!=='undefined'&&Array.isArray(students)?students:[];
      return [...new Set(raw.map(v=>{
        let id=String(v);
        if(/^\d+$/.test(id)&&list[Number(id)])id=String(list[Number(id)].id);
        return id;
      }).filter(id=>known.has(id)))];
    }catch(e){return []}
  }

  function saveState(){
    try{
      if(typeof counts==='undefined'||typeof centerHistory==='undefined'||typeof friendQueue==='undefined')return;
      localStorage.setItem(STATE_KEY,JSON.stringify({
        version:1,
        date:dateKey(),
        counts:[...counts],
        closed:typeof closed!=='undefined'?[...closed]:[],
        history:centerHistory.map(x=>({index:Number(x.index),friendId:String(x.friendId)})),
        friendQueue:[...friendQueue].map(String),
        selectedFriendId:typeof selectedFriendId==='undefined'?'':String(selectedFriendId||''),
        selectionLocked:typeof selectionLocked!=='undefined'&&Boolean(selectionLocked),
        chooserStarted:typeof chooserStarted!=='undefined'&&Boolean(chooserStarted)
      }));
    }catch(e){console.error('[EEA Center Choice] Could not save round state',e)}
  }

  function restoreState(){
    try{
      if(typeof counts==='undefined'||typeof centerHistory==='undefined'||typeof friendQueue==='undefined')return false;
      const saved=JSON.parse(localStorage.getItem(STATE_KEY)||'null');
      if(!saved||saved.date!==dateKey())return false;
      const eligible=new Set(safePresentIds().map(String));
      const centerCount=typeof centers!=='undefined'&&Array.isArray(centers)?centers.length:counts.length;
      const history=Array.isArray(saved.history)?saved.history.filter(x=>x&&Number.isInteger(Number(x.index))&&Number(x.index)>=0&&Number(x.index)<centerCount&&eligible.has(String(x.friendId))).map(x=>({index:Number(x.index),friendId:String(x.friendId)})):[];
      centerHistory.splice(0,centerHistory.length,...history);
      counts.fill(0);
      history.forEach(x=>{const cap=centers[x.index]?.cap||99;if(counts[x.index]<cap)counts[x.index]++});
      if(typeof closed!=='undefined'&&Array.isArray(saved.closed))saved.closed.slice(0,closed.length).forEach((v,i)=>closed[i]=Boolean(v));
      const chosen=new Set(history.map(x=>x.friendId));
      let selected=String(saved.selectedFriendId||'');
      if(selected&&!eligible.has(selected))selected='';
      const q=Array.isArray(saved.friendQueue)?saved.friendQueue.map(String).filter(id=>eligible.has(id)&&!chosen.has(id)&&id!==selected):[];
      const accounted=new Set([...chosen,...q]);if(selected)accounted.add(selected);
      safePresentIds().map(String).forEach(id=>{if(!accounted.has(id))q.push(id)});
      friendQueue.splice(0,friendQueue.length,...[...new Set(q)]);
      selectedFriendId=selected;
      selectionLocked=Boolean(saved.selectionLocked)&&Boolean(selected);
      chooserStarted=Boolean(saved.chooserStarted)||history.length>0||Boolean(selected)||friendQueue.length>0;
      transitionPending=false;
      if(typeof renderCenters==='function')renderCenters();
      if(selected&&typeof showFriend==='function')showFriend(selected);
      else{
        const name=document.getElementById('friendName'),personEl=document.getElementById('person'),photo=document.getElementById('friendPhoto');
        if(name)name.textContent='';if(personEl)personEl.classList.remove('show-photo');if(photo)photo.innerHTML='';
      }
      return true;
    }catch(e){console.error('[EEA Center Choice] Could not restore round state',e);return false}
  }

  function installSoundPreferences(){
    try{
      if(typeof playSelectionChime==='function'){
        const originalSelection=playSelectionChime;
        playSelectionChime=function(){if(celebrationSoundsEnabled())return originalSelection.apply(this,arguments)};
      }
      if(typeof playFullCenterSound==='function'){
        const originalFull=playFullCenterSound;
        playFullCenterSound=function(){if(celebrationSoundsEnabled())return originalFull.apply(this,arguments)};
      }
    }catch(e){}
  }

  syncInlineRoster();
  try{presentIds=safePresentIds}catch(e){}
  try{
    if(typeof buildFriendQueue==='function'){
      const safeBuildFriendQueue=buildFriendQueue;
      buildFriendQueue=function(){syncInlineRoster();return safeBuildFriendQueue.apply(this,arguments)};
    }
  }catch(e){}
  installSoundPreferences();
  restoreState();

  try{
    if(typeof chooseCenter==='function'){
      const originalChooseCenter=chooseCenter;
      chooseCenter=function(index){const out=originalChooseCenter(index);setTimeout(saveState,380);return out};
    }
  }catch(e){}

  document.addEventListener('click',event=>{
    const target=event.target.closest&&event.target.closest('#pickBtn,#undoBtn,#resetBtn,#timerBtn,.card');
    if(!target)return;
    setTimeout(saveState,target.classList.contains('card')?400:40);
  });
  window.addEventListener('pagehide',saveState);
  window.addEventListener('beforeunload',saveState);
  window.EEACenterChoiceStateLoaded=true;
})();