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

  function installCenterChoiceState(){
    if(!/\bcenter-choice\.html$/i.test(location.pathname))return;
    const STATE_KEY='eea-center-choice-state-v1';
    const STUDENT_KEY='eea-students-v1';
    const NAME_KEY='eea-student-names';
    const ATTENDANCE_KEY='eea-attendance-present';
    const ATTENDANCE_DATE_KEY='eea-attendance-date';
    const CANONICAL=['Avery','Bentley','Blakely','Brantley','Dylan','Easton','Emersyn','Everleigh','Grayson','Harper','Hudson','Jaxson','Kinsley','Liam','Maverick','Oakley','Sawyer','Warren','Wyatt','Zoey'];
    const dateKey=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};

    function canonicalizeIfNeeded(){
      try{
        const saved=JSON.parse(localStorage.getItem(STUDENT_KEY)||'null');
        if(Array.isArray(saved)&&saved.length)return;
      }catch(e){}
      const roster=CANONICAL.map((name,i)=>({id:'s'+(i+1),name,active:true,photo:'',audio:''}));
      try{localStorage.setItem(STUDENT_KEY,JSON.stringify(roster));localStorage.setItem(NAME_KEY,JSON.stringify(CANONICAL))}catch(e){}
      try{
        if(typeof students!=='undefined'&&Array.isArray(students)){
          students.splice(0,students.length,...roster.map(s=>({id:s.id,name:s.name,photo:'',audio:''})));
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

    canonicalizeIfNeeded();
    try{presentIds=safePresentIds}catch(e){}
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
  }

  document.addEventListener('pointerdown',()=>{unlock()},{capture:true,passive:true});
  document.addEventListener('touchstart',()=>{unlock()},{capture:true,passive:true});

  window.EEANameAudio={version:'2.1.0',play,warm,warmMany,unlock,stop};
  installCompatibility();
  installCenterChoiceState();
})();