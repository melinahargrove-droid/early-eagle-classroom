(()=>{
  const players=new Map();
  let activePlayer=null;
  let primingPlayer=null;
  let playToken=0;

  function keyFor(student){return String(student&&((student.id||student.name)||student.audio)||'')}

  function getPlayer(student,forceFresh=false){
    if(!student||!student.audio)return null;
    const key=keyFor(student);
    let player=forceFresh?null:players.get(key);
    const resolved=new URL(student.audio,location.href).href;
    if(!player||player.src!==resolved){
      player=new Audio();
      player.preload='auto';
      player.src=student.audio;
      try{player.load()}catch(e){}
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

  function nextStudent(){
    try{
      if(typeof queue==='undefined'||!queue.length||typeof studentById==='undefined')return null;
      return studentById(queue[0])||null;
    }catch(e){return null}
  }

  function primeStudent(student){
    if(!student||!student.audio)return;
    const player=getPlayer(student);
    if(!player||primingPlayer===player)return;
    primingPlayer=player;
    const oldVolume=player.volume;
    try{
      player.pause();
      player.volume=0;
      player.currentTime=0;
      const finish=()=>{
        try{player.pause();player.currentTime=0}catch(e){}
        player.volume=oldVolume;
        if(primingPlayer===player)primingPlayer=null;
      };
      const start=()=>{
        let promise;
        try{promise=player.play()}catch(e){finish();return}
        if(promise&&typeof promise.catch==='function')promise.catch(()=>{});
        setTimeout(finish,120);
      };
      if(player.readyState>=2)start();
      else{
        player.addEventListener('canplay',start,{once:true});
        try{player.load()}catch(e){}
      }
    }catch(e){
      player.volume=oldVolume;
      primingPlayer=null;
    }
  }

  function primeNextFromChoose(event){
    const button=event.target&&event.target.closest?event.target.closest('#chooseBtn'):null;
    if(!button)return;
    primeStudent(nextStudent());
  }

  function reliablePlay(student){
    if(typeof settings!=='undefined'&&!settings.nameAudio)return;
    if(!student||!student.audio)return;
    const token=++playToken;
    let player=getPlayer(student);
    if(!player)return;

    if(primingPlayer===player){
      try{player.pause();player.volume=1;player.currentTime=0}catch(e){}
      primingPlayer=null;
    }
    if(activePlayer&&activePlayer!==player){
      try{activePlayer.pause();activePlayer.currentTime=0}catch(e){}
    }
    activePlayer=player;

    const actuallyPlay=(p,retryAllowed)=>{
      if(token!==playToken)return;
      let started=false;
      const onPlaying=()=>{started=true;cleanup()};
      const cleanup=()=>{p.removeEventListener('playing',onPlaying)};
      p.addEventListener('playing',onPlaying,{once:true});
      try{p.pause();p.volume=1;p.currentTime=0}catch(e){}
      setTimeout(()=>{
        if(token!==playToken){cleanup();return}
        let result;
        try{result=p.play()}catch(e){result=null}
        if(result&&typeof result.catch==='function'){
          result.catch(()=>{
            cleanup();
            if(retryAllowed)retryFresh();
          });
        }
        setTimeout(()=>{
          if(token!==playToken||started)return;
          cleanup();
          if(retryAllowed)retryFresh();
        },500);
      },180);
    };

    const retryFresh=()=>{
      if(token!==playToken)return;
      player=getPlayer(student,true);
      if(!player)return;
      activePlayer=player;
      const go=()=>actuallyPlay(player,false);
      if(player.readyState>=2)go();
      else{
        player.addEventListener('canplay',go,{once:true});
        try{player.load()}catch(e){}
      }
    };

    const go=()=>actuallyPlay(player,true);
    if(player.readyState>=2)go();
    else{
      player.addEventListener('canplay',go,{once:true});
      try{player.load()}catch(e){}
    }
  }

  warmRecordings();
  window.addEventListener('load',warmRecordings,{once:true});
  document.addEventListener('pointerdown',primeNextFromChoose,true);
  document.addEventListener('touchstart',primeNextFromChoose,{capture:true,passive:true});
  try{playNameAudio=reliablePlay}catch(e){window.playNameAudio=reliablePlay}
})();
