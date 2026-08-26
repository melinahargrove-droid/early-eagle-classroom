(()=>{
  'use strict';

  const STUDENT_KEY='eea-students-v1';
  const SETTINGS_KEY='eea-app-settings';
  const decoded=new Map();
  const bytes=new Map();
  let context=null;
  let activeSource=null;
  let activeAudio=null;
  let playToken=0;

  function audioEnabled(){
    try{
      const saved=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')||{};
      return saved.nameAudio!==false;
    }catch(e){return true}
  }

  function audioUrl(student){
    return String(student&&student.audio||'').trim();
  }

  function studentName(student){
    return String(student&&student.name||'').trim();
  }

  function getContext(){
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextClass)return null;
    if(!context){
      try{context=new AudioContextClass({latencyHint:'interactive'})}
      catch(e){try{context=new AudioContextClass()}catch(err){return null}}
    }
    return context;
  }

  async function unlock(){
    const ctx=getContext();
    if(ctx&&ctx.state==='suspended'){
      try{await ctx.resume()}catch(e){}
    }
    // Speech synthesis can also require a user gesture in packaged Chromium.
    try{
      if(window.speechSynthesis){
        const voices=window.speechSynthesis.getVoices();
        void voices;
      }
    }catch(e){}
  }

  async function fetchBytes(url){
    if(!url)throw new Error('No audio source');
    if(bytes.has(url))return bytes.get(url);
    const promise=(async()=>{
      const response=await fetch(url,{cache:'force-cache'});
      if(!response.ok)throw new Error(`Audio request failed (${response.status})`);
      return await response.arrayBuffer();
    })();
    bytes.set(url,promise);
    try{return await promise}
    catch(error){bytes.delete(url);throw error}
  }

  async function decode(student){
    const url=audioUrl(student);
    if(!url)throw new Error('No saved recording');
    if(decoded.has(url))return decoded.get(url);
    const promise=(async()=>{
      const ctx=getContext();
      if(!ctx)throw new Error('Web Audio is unavailable');
      const raw=await fetchBytes(url);
      return await ctx.decodeAudioData(raw.slice(0));
    })();
    decoded.set(url,promise);
    try{return await promise}
    catch(error){decoded.delete(url);throw error}
  }

  function stop(){
    playToken++;
    if(activeSource){
      try{activeSource.stop(0)}catch(e){}
      try{activeSource.disconnect()}catch(e){}
      activeSource=null;
    }
    if(activeAudio){
      try{activeAudio.pause();activeAudio.currentTime=0}catch(e){}
      activeAudio=null;
    }
    try{if(window.speechSynthesis)window.speechSynthesis.cancel()}catch(e){}
  }

  function chooseVoice(){
    try{
      const voices=window.speechSynthesis&&window.speechSynthesis.getVoices?window.speechSynthesis.getVoices():[];
      if(!voices||!voices.length)return null;
      return voices.find(v=>/^en-US$/i.test(v.lang)&&/zira|aria|jenny|samantha|female/i.test(v.name))
        ||voices.find(v=>/^en-US$/i.test(v.lang))
        ||voices.find(v=>/^en/i.test(v.lang))
        ||voices[0];
    }catch(e){return null}
  }

  function speakFallback(student,token){
    const name=studentName(student);
    if(!name||token!==playToken||!window.speechSynthesis)return false;
    try{
      window.speechSynthesis.cancel();
      const utterance=new SpeechSynthesisUtterance(name);
      utterance.lang='en-US';
      utterance.rate=0.9;
      utterance.pitch=1.05;
      utterance.volume=1;
      const voice=chooseVoice();
      if(voice)utterance.voice=voice;
      window.speechSynthesis.speak(utterance);
      console.info('[EEA Name Audio] Computer voice fallback:',name);
      return true;
    }catch(error){
      console.warn('[EEA Name Audio] Speech fallback failed:',name,error);
      return false;
    }
  }

  async function playHtmlAudio(student,token){
    const url=audioUrl(student);
    if(!url||token!==playToken)return false;
    try{
      const player=new Audio();
      activeAudio=player;
      player.preload='auto';
      player.src=url;
      player.volume=1;
      await new Promise((resolve,reject)=>{
        if(player.readyState>=3){resolve();return}
        const ready=()=>{cleanup();resolve()};
        const fail=()=>{cleanup();reject(new Error('HTML audio failed to load'))};
        const cleanup=()=>{
          player.removeEventListener('canplaythrough',ready);
          player.removeEventListener('error',fail);
        };
        player.addEventListener('canplaythrough',ready,{once:true});
        player.addEventListener('error',fail,{once:true});
        try{player.load()}catch(error){cleanup();reject(error)}
        setTimeout(()=>{if(player.readyState>=2){cleanup();resolve()}},900);
      });
      if(token!==playToken)return false;
      player.currentTime=0;
      await player.play();
      return true;
    }catch(error){
      console.warn('[EEA Name Audio] HTML audio fallback failed:',studentName(student),error);
      if(activeAudio){try{activeAudio.pause()}catch(e){} activeAudio=null}
      return false;
    }
  }

  async function play(student){
    if(!audioEnabled()||!student)return false;
    stop();
    const token=playToken;
    const name=studentName(student);
    const url=audioUrl(student);

    if(url){
      try{
        await unlock();
        const buffer=await decode(student);
        if(token!==playToken)return false;
        const ctx=getContext();
        if(ctx&&ctx.state==='suspended')await ctx.resume();
        if(token!==playToken)return false;
        const source=ctx.createBufferSource();
        source.buffer=buffer;
        source.connect(ctx.destination);
        activeSource=source;
        source.onended=()=>{
          if(activeSource===source){
            try{source.disconnect()}catch(e){}
            activeSource=null;
          }
        };
        // Schedule slightly ahead, but always at offset zero. This prevents
        // Chromium/MP3 startup latency from eating the first phoneme.
        source.start(ctx.currentTime+0.06,0);
        return true;
      }catch(error){
        console.warn('[EEA Name Audio] Decoded recording failed:',name,error);
      }

      // Keep a media-element fallback for audio formats a browser can play
      // but decodeAudioData cannot decode.
      if(await playHtmlAudio(student,token))return true;
    }

    // A child should never be silent because a saved recording is absent,
    // stale, corrupt, or unsupported. The computer voice is the final safety net.
    return speakFallback(student,token);
  }

  function roster(){
    try{
      const saved=JSON.parse(localStorage.getItem(STUDENT_KEY)||'[]');
      return Array.isArray(saved)?saved:[];
    }catch(e){return[]}
  }

  function warm(student){
    const url=audioUrl(student);
    if(!url)return Promise.resolve(false);
    // Fetch immediately. Decoding may finish before the child is selected;
    // if AudioContext is still locked, play() completes it after unlock.
    return fetchBytes(url).then(()=>decode(student)).then(()=>true).catch(error=>{
      console.warn('[EEA Name Audio] Recording unavailable:',studentName(student),error);
      return false;
    });
  }

  function warmAll(){
    roster().forEach(student=>{if(audioUrl(student))warm(student)});
  }

  const service={unlock,warm,warmAll,play,stop};
  window.EEANameAudio=service;

  // Replace the legacy page-level player with this single engine. The page's
  // existing chooseFriend() function continues to call playNameAudio(student),
  // but every child now travels through the exact same playback path.
  const rootPlay=student=>service.play(student);
  window.playNameAudio=rootPlay;
  try{playNameAudio=rootPlay}catch(e){}

  // Unlock on the actual teacher gesture rather than 1+ seconds later after
  // the stick animation. This removes autoplay/first-play timing races.
  const choose=document.getElementById('chooseBtn');
  if(choose){
    choose.addEventListener('pointerdown',()=>{unlock()},true);
    choose.addEventListener('touchstart',()=>{unlock()},{capture:true,passive:true});
  }

  // Pre-fetch all saved recordings once so selection never depends on network
  // or disk timing at reveal time.
  if(document.readyState==='loading'){
    window.addEventListener('DOMContentLoaded',warmAll,{once:true});
  }else{
    setTimeout(warmAll,0);
  }
})();
