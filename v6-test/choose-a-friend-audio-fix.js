(()=>{
  const players=new Map();
  let activePlayer=null;

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

  function reliablePlay(student){
    if(typeof settings!=='undefined'&&!settings.nameAudio)return;
    const player=getPlayer(student);
    if(!player)return;
    try{
      if(activePlayer&&activePlayer!==player){activePlayer.pause();activePlayer.currentTime=0}
      activePlayer=player;
      player.pause();
      try{player.currentTime=0}catch(e){}
      const attempt=()=>{
        const promise=player.play();
        if(promise&&typeof promise.catch==='function'){
          promise.catch(()=>{
            const retry=()=>{
              try{player.currentTime=0}catch(e){}
              const retryPromise=player.play();
              if(retryPromise&&typeof retryPromise.catch==='function')retryPromise.catch(()=>{});
            };
            if(player.readyState>=2)setTimeout(retry,80);
            else player.addEventListener('canplay',retry,{once:true});
          });
        }
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
  try{playNameAudio=reliablePlay}catch(e){window.playNameAudio=reliablePlay}
})();
