(()=>{
  const players=new Map();
  let activePlayer=null;
  let primed=false;

  function getPlayer(student){
    if(!student||!student.audio)return null;
    const key=String(student.id||student.name||student.audio);
    let player=players.get(key);
    const resolved=new URL(student.audio,location.href).href;
    if(!player||player.src!==resolved){
      player=new Audio();
      player.preload='auto';
      player.src=student.audio;
      player.load();
      players.set(key,player);
    }
    return player;
  }

  function warmRecordings(){
    try{
      if(typeof students==='undefined')return;
      students.forEach(student=>{if(student&&student.audio)getPlayer(student)});
    }catch(e){}
  }

  function primeRecordings(){
    if(primed)return;
    primed=true;
    try{
      if(typeof students==='undefined')return;
      students.forEach(student=>{
        const player=getPlayer(student);
        if(!player)return;
        const oldVolume=player.volume;
        player.volume=0;
        try{player.currentTime=0}catch(e){}
        const p=player.play();
        if(p&&typeof p.then==='function'){
          p.then(()=>setTimeout(()=>{
            player.pause();
            try{player.currentTime=0}catch(e){}
            player.volume=oldVolume;
          },40)).catch(()=>{player.volume=oldVolume});
        }else{
          setTimeout(()=>{
            player.pause();
            try{player.currentTime=0}catch(e){}
            player.volume=oldVolume;
          },40);
        }
      });
    }catch(e){}
  }

  function reliablePlay(student){
    if(typeof settings!=='undefined'&&!settings.nameAudio)return;
    const player=getPlayer(student);
    if(!player)return;
    try{
      if(activePlayer&&activePlayer!==player){activePlayer.pause();try{activePlayer.currentTime=0}catch(e){}}
      activePlayer=player;
      player.pause();
      try{player.currentTime=0}catch(e){}
      const attempt=()=>{
        setTimeout(()=>{
          try{player.currentTime=0}catch(e){}
          const promise=player.play();
          if(promise&&typeof promise.catch==='function'){
            promise.catch(()=>{
              const retry=()=>{
                try{player.currentTime=0}catch(e){}
                setTimeout(()=>{
                  const retryPromise=player.play();
                  if(retryPromise&&typeof retryPromise.catch==='function')retryPromise.catch(()=>{});
                },100);
              };
              if(player.readyState>=2)retry();
              else player.addEventListener('canplay',retry,{once:true});
            });
          }
        },120);
      };
      if(player.readyState>=2)attempt();
      else{
        player.addEventListener('canplay',attempt,{once:true});
        player.load();
      }
    }catch(e){}
  }

  warmRecordings();
  window.addEventListener('load',warmRecordings,{once:true});
  document.addEventListener('pointerdown',primeRecordings,{once:true,capture:true});
  document.addEventListener('touchstart',primeRecordings,{once:true,capture:true,passive:true});
  try{playNameAudio=reliablePlay}catch(e){window.playNameAudio=reliablePlay}
})();
