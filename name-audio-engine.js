(()=>{
  if(window.EEANameAudio&&window.EEANameAudio.version)return;

  const bufferCache=new Map();
  const bufferLoads=new Map();
  const htmlPlayers=new Map();
  let ctx=null;
  let activeSource=null;
  let activeHtml=null;
  let playToken=0;

  function audioEnabled(){
    try{return typeof settings==='undefined'||settings.nameAudio!==false}catch(e){return true}
  }

  function studentKey(student){
    return String(student&&((student.id||student.name)||student.audio)||'');
  }

  function audioUrl(student){
    if(!student||!student.audio)return '';
    try{return new URL(student.audio,location.href).href}catch(e){return String(student.audio||'')}
  }

  function getContext(){
    if(ctx)return ctx;
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx)return null;
    try{ctx=new Ctx()}catch(e){ctx=null}
    return ctx;
  }

  async function unlock(){
    const c=getContext();
    if(c&&c.state==='suspended'){
      try{await c.resume()}catch(e){}
    }
    return c;
  }

  function stop(){
    playToken++;
    if(activeSource){try{activeSource.stop()}catch(e){} activeSource=null}
    if(activeHtml){try{activeHtml.pause();activeHtml.currentTime=0}catch(e){} activeHtml=null}
    try{if(window.speechSynthesis)window.speechSynthesis.cancel()}catch(e){}
  }

  async function loadBuffer(student){
    const url=audioUrl(student);
    if(!url)throw new Error('No recording');
    if(bufferCache.has(url))return bufferCache.get(url);
    if(bufferLoads.has(url))return bufferLoads.get(url);
    const job=(async()=>{
      const c=await unlock();
      if(!c)throw new Error('Web Audio unavailable');
      const response=await fetch(url,{cache:'force-cache'});
      if(!response.ok)throw new Error('Recording unavailable');
      const bytes=await response.arrayBuffer();
      const buffer=await c.decodeAudioData(bytes.slice(0));
      bufferCache.set(url,buffer);
      return buffer;
    })();
    bufferLoads.set(url,job);
    try{return await job}finally{bufferLoads.delete(url)}
  }

  function warm(student){
    if(!audioEnabled()||!student||!student.audio)return Promise.resolve(false);
    return loadBuffer(student).then(()=>true).catch(()=>false);
  }

  function warmMany(list){
    if(!Array.isArray(list))return;
    list.forEach(student=>{if(student&&student.audio)warm(student)});
  }

  function speak(student,token){
    if(token!==playToken||!student||!student.name)return;
    try{
      if(!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;
      window.speechSynthesis.cancel();
      const utterance=new SpeechSynthesisUtterance(String(student.name));
      utterance.rate=.9;
      utterance.pitch=1.02;
      utterance.volume=1;
      window.speechSynthesis.speak(utterance);
    }catch(e){}
  }

  function htmlFallback(student,token){
    if(token!==playToken)return;
    const url=audioUrl(student);
    if(!url){speak(student,token);return}
    const key=studentKey(student)||url;
    let player=htmlPlayers.get(key);
    if(!player||player.src!==url){
      player=new Audio();
      player.preload='auto';
      player.src=url;
      htmlPlayers.set(key,player);
    }
    activeHtml=player;
    let started=false;
    let settled=false;
    const cleanup=()=>{
      player.removeEventListener('playing',onPlaying);
      player.removeEventListener('error',onError);
    };
    const onPlaying=()=>{started=true;settled=true;cleanup()};
    const onError=()=>{if(settled)return;settled=true;cleanup();speak(student,token)};
    player.addEventListener('playing',onPlaying,{once:true});
    player.addEventListener('error',onError,{once:true});
    try{player.pause();player.currentTime=0;player.volume=1}catch(e){}
    let result;
    try{result=player.play()}catch(e){result=null;onError();return}
    if(result&&typeof result.catch==='function')result.catch(onError);
    setTimeout(()=>{if(token===playToken&&!started&&!settled)onError()},900);
  }

  async function play(student){
    if(!audioEnabled()||!student)return;
    stop();
    const token=playToken;
    if(!student.audio){speak(student,token);return}
    try{
      const c=await unlock();
      const buffer=await loadBuffer(student);
      if(token!==playToken||!c)return;
      const source=c.createBufferSource();
      source.buffer=buffer;
      source.connect(c.destination);
      activeSource=source;
      source.onended=()=>{if(activeSource===source)activeSource=null};
      source.start(0);
    }catch(e){
      if(token===playToken)htmlFallback(student,token);
    }
  }

  function installCompatibility(){window.playNameAudio=play}

  document.addEventListener('pointerdown',()=>{unlock()},{capture:true,passive:true});
  document.addEventListener('touchstart',()=>{unlock()},{capture:true,passive:true});

  window.EEANameAudio={version:'2.0.0',play,warm,warmMany,unlock,stop};
  installCompatibility();
})();