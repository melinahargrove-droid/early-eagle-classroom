(()=>{
  'use strict';
  if(window.__EEALessonVisualEditLoaded)return;
  window.__EEALessonVisualEditLoaded=true;

  const params=new URLSearchParams(location.search);
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(/read-aloud|community-meeting|visual-editor/.test(file))return;

  const week=params.get('week')||(file.match(/week(\d+)/)||[])[1]||'';
  const day=params.get('day')||'';
  const section=params.get('section')||'';
  const view=params.get('view')||'';
  const selectors=['#visual','#art','#pic','.lesson-visual','.storyvis','.closevis','.scene','.visual','.art-wrap','.story-art'];
  let renderToken=0;
  let observerTimer=0;

  const slug=value=>(value||'visual').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70)||'visual';
  const visible=el=>!!(el&&el.isConnected&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&el.getBoundingClientRect().width>20&&el.getBoundingClientRect().height>20);

  function kind(){
    if(view)return view;
    if(/center/.test(file))return 'centers';
    if(/small/.test(file))return 'smallgroups';
    if(/building/.test(file))return 'buildingblocks';
    if(/story/.test(file))return 'storytelling';
    if(/closing/.test(file))return 'closing';
    return 'lesson';
  }

  function promote(el){
    if(!el)return null;
    if(el.tagName==='IMG'||el.tagName==='SVG'||el.tagName==='CANVAS'||el.tagName==='VIDEO'){
      return el.closest('.visual,.art-wrap,.storyvis,.closevis,.scene,.lesson-visual')||el.parentElement;
    }
    return el;
  }

  function targets(){
    const seen=new Set(),out=[];
    selectors.forEach(sel=>document.querySelectorAll(sel).forEach(raw=>{
      const el=promote(raw);
      if(!el||seen.has(el)||!visible(el))return;
      if(el.closest('[data-eea-edit-chrome]'))return;
      seen.add(el);out.push(el);
    }));
    return out.filter((el,i,all)=>!all.some((other,j)=>j!==i&&other.contains(el)));
  }

  function identity(el,index){
    const scope=el.closest('article,section,.card,.storycard,.closecard,.detail,.plain')||document.body;
    const heading=scope.querySelector('h1,h2,.eye,.label')||document.querySelector('h1,h2,.eye,.label');
    const title=(heading?.textContent||'').trim();
    const eye=(document.querySelector('#eye,.eye')?.textContent||'').trim();
    const own=(el.dataset.eeaVisualName||el.getAttribute('aria-label')||'').trim();
    return slug([title,eye,own,index+1].filter(Boolean).join('-'));
  }

  function slotFor(el,index){
    return ['eea','week'+(week||'x'),kind(),slug(day||'day'),slug(identity(el,index)),section?('s'+section):''].filter(Boolean).join('-');
  }

  function returnUrl(){return location.pathname.split('/').pop()+location.search;}

  function ensureStyle(){
    if(document.getElementById('eeaLessonVisualEditStyle'))return;
    const style=document.createElement('style');
    style.id='eeaLessonVisualEditStyle';
    style.textContent=`
      .eea-editable-visual{position:relative!important;overflow:hidden!important}
      .eea-custom-visual{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:contain!important;z-index:20!important;background:#fff!important}
      .eea-visual-edit-btn{position:absolute!important;right:12px!important;top:12px!important;z-index:30!important;border:1px solid rgba(82,128,142,.25)!important;border-radius:999px!important;background:rgba(255,253,248,.96)!important;color:#245c82!important;padding:8px 12px!important;font:900 13px/1 "Trebuchet MS",Arial,sans-serif!important;box-shadow:0 4px 14px #0002!important;cursor:pointer!important;min-height:38px!important}
      .eea-visual-edit-btn:focus{outline:3px solid rgba(36,92,130,.25)!important;outline-offset:2px!important}
      .editVisual,#editVisual,#editVisualBtn{display:none!important}
    `;
    document.head.appendChild(style);
  }

  async function ensureStore(){
    if(window.EEAVisualStore)return;
    let script=document.getElementById('eeaVisualStoreForLessonEdit');
    if(!script){script=document.createElement('script');script.id='eeaVisualStoreForLessonEdit';script.src='visual-store.js';document.head.appendChild(script);}
    await new Promise(resolve=>{
      if(window.EEAVisualStore){resolve();return;}
      const done=()=>resolve();
      script.addEventListener('load',done,{once:true});script.addEventListener('error',done,{once:true});setTimeout(done,1200);
    });
  }

  async function decorate(el,index,token){
    if(!el||/^(IMG|SVG|CANVAS|VIDEO)$/.test(el.tagName))return;
    const slot=slotFor(el,index);
    el.classList.add('eea-editable-visual');
    let btn=el.querySelector(':scope > .eea-visual-edit-btn');
    if(!btn){btn=document.createElement('button');btn.type='button';btn.className='eea-visual-edit-btn';btn.dataset.eeaEditChrome='1';btn.textContent='✎ Edit Visual';el.appendChild(btn);}
    btn.dataset.slot=slot;
    btn.onclick=event=>{event.preventDefault();event.stopPropagation();location.href='visual-editor.html?slot='+encodeURIComponent(slot)+'&return='+encodeURIComponent(returnUrl());};

    let custom=el.querySelector(':scope > .eea-custom-visual');
    if(!custom){custom=document.createElement('img');custom.className='eea-custom-visual';custom.alt='Custom lesson visual';custom.hidden=true;el.insertBefore(custom,btn);}
    custom.hidden=true;
    if(!window.EEAVisualStore)return;
    try{
      const src=await EEAVisualStore.get(slot);
      if(token!==renderToken||!el.isConnected||btn.dataset.slot!==slot)return;
      if(src){custom.src=src;custom.hidden=false}else{custom.removeAttribute('src');custom.hidden=true}
    }catch(e){custom.hidden=true}
  }

  async function apply(){
    const token=++renderToken;
    ensureStyle();await ensureStore();if(token!==renderToken)return;
    const list=targets();await Promise.all(list.map((el,index)=>decorate(el,index,token)));
  }

  function schedule(){clearTimeout(observerTimer);observerTimer=setTimeout(()=>{window.EEAVisualsReady=apply()},20)}
  window.EEAVisualsReady=apply();
  const observer=new MutationObserver(schedule);observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  document.addEventListener('click',event=>{if(event.target.closest('.eea-visual-edit-btn'))return;setTimeout(schedule,0)},true);
})();