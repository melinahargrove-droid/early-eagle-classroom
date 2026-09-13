(()=>{
  'use strict';
  if(window.EEAChooseFriendStateLoaded)return;

  function installStarFirstReset(){
    try{
      const resetButton=document.getElementById('resetBtn');
      if(!resetButton)return;
      resetButton.onclick=()=>{
        try{
          if(typeof busy!=='undefined'&&busy)return;
          const present=typeof presentIds==='function'?presentIds().map(String):[];
          const presentSet=new Set(present);
          let starId='';
          try{
            const state=JSON.parse(localStorage.getItem('eea-star-state-v1')||'null');
            if(state&&state.currentId)starId=String(state.currentId);
          }catch(e){}
          if(!starId){
            const starName=String(localStorage.getItem('eea-current-star')||'').trim();
            const star=(typeof students!=='undefined'&&Array.isArray(students))?students.find(s=>String(s.name||'').trim()===starName):null;
            if(star)starId=String(star.id);
          }
          const list=(typeof students!=='undefined'&&Array.isArray(students))?students:[];
          const others=list.filter(s=>presentSet.has(String(s.id))&&String(s.id)!==starId).map(s=>String(s.id));
          for(let i=others.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[others[i],others[j]]=[others[j],others[i]]}
          const next=starId&&presentSet.has(starId)?[starId,...others]:others;
          if(typeof queue!=='undefined'&&Array.isArray(queue))queue.splice(0,queue.length,...next);
          if(typeof currentId!=='undefined')currentId=null;
          if(typeof completed!=='undefined')completed=false;
          if(typeof big!=='undefined'&&big){big.classList.remove('show','done');big.textContent=''}
          if(typeof eddie!=='undefined'&&eddie)eddie.className='eddie-wrap ready';
          if(typeof renderSticks==='function')renderSticks();
        }catch(e){console.error('[EEA Choose a Friend] Star-first reset failed',e)}
      };
    }catch(e){console.error('[EEA Choose a Friend] Could not install Star-first reset',e)}
  }

  const script=document.createElement('script');
  script.src='choose-a-friend-state.js';
  script.async=false;
  script.onload=()=>{
    window.EEAChooseFriendStateLoaded=true;
    installStarFirstReset();
  };
  script.onerror=()=>console.error('[EEA Choose a Friend] State helper failed to load');
  document.head.appendChild(script);
})();