(()=>{
  window.EEACommunityStandard={
    async apply({doc,day,parentWindow}){
      if(!doc||day<1)return;
      const cards=[...doc.querySelectorAll('.card')];
      if(!cards.length)return;
      const overview=()=>`daily-lessons.html?week=1&day=${day}&v=${Date.now()}`;
      const sourceFiles=['community-meeting.html','community-meeting-tuesday.html','community-meeting-wednesday.html','community-meeting-thursday.html','community-meeting-friday.html'];
      const runnerReturn=`lesson-runner-week1.html?week=1&day=${day}&section=0`;
      const getIndex=()=>Math.max(0,cards.findIndex(c=>c.classList.contains('active')));

      // Make close always return to the correct Day Overview.
      const close=doc.querySelector('.close,#closeBtn');
      if(close) close.onclick=e=>{e.preventDefault();parentWindow.location.href=overview()};

      // Make Previous behave like the locked Monday master.
      const prev=doc.getElementById('prev');
      if(prev){
        const syncPrev=()=>{
          prev.disabled=false;
          prev.textContent=getIndex()===0?'← Day Overview':'← Previous';
        };
        syncPrev();
        new MutationObserver(syncPrev).observe(prev,{attributes:true,childList:true,subtree:true});
        doc.addEventListener('click',e=>{
          const b=e.target.closest&&e.target.closest('#prev');
          if(!b)return;
          if(getIndex()===0){
            e.preventDefault();
            e.stopImmediatePropagation();
            parentWindow.location.href=overview();
          }else setTimeout(syncPrev,0);
        },true);
      }

      // Load the same persistent visual store used by the approved Week 1 pages.
      if(!doc.defaultView.EEAVisualStore){
        await new Promise(resolve=>{
          const s=doc.createElement('script');
          s.src='visual-store.js';
          s.onload=resolve;
          s.onerror=resolve;
          doc.head.appendChild(s);
        });
      }

      // Add the locked Edit Visual control without changing curriculum content.
      let edit=doc.getElementById('eeaEditVisual');
      if(!edit){
        edit=doc.createElement('button');
        edit.id='eeaEditVisual';
        edit.textContent='✎ Edit Visual';
        Object.assign(edit.style,{position:'absolute',left:'5%',bottom:'2%',zIndex:'20',border:'1px solid #d4e0df',borderRadius:'999px',background:'#fffdf8',color:'#315f70',padding:'.65vh 1.2vw',fontWeight:'900',fontSize:'clamp(11px,.8vw,15px)',cursor:'pointer',boxShadow:'0 4px 10px rgba(50,80,90,.08)',fontFamily:'inherit'});
        doc.body.appendChild(edit);
      }

      async function applyVisual(){
        const idx=getIndex(),card=cards[idx],visual=card&&card.querySelector('.visual');
        if(!visual)return;
        const slot=`week1-community-day${day+1}-step${idx+1}`;
        let custom=visual.querySelector('.eeaCustomVisual');
        if(!custom){
          custom=doc.createElement('img');
          custom.className='eeaCustomVisual';
          custom.alt='Custom Community Meeting visual';
          Object.assign(custom.style,{display:'none',maxWidth:'92%',maxHeight:'92%',width:'auto',height:'auto',objectFit:'contain'});
          visual.appendChild(custom);
        }
        const originals=[...visual.children].filter(el=>el!==custom);
        let src='';
        try{
          const store=doc.defaultView.EEAVisualStore;
          if(store){await store.migrate();src=await store.get(slot)}
        }catch(e){}
        if(src){
          custom.src=src;custom.style.display='block';
          originals.forEach(el=>el.style.display='none');
        }else{
          custom.removeAttribute('src');custom.style.display='none';
          originals.forEach(el=>el.style.display='');
        }
        edit.onclick=()=>{
          const current=getIndex();
          const currentSlot=`week1-community-day${day+1}-step${current+1}`;
          parentWindow.location.href='visual-editor.html?slot='+encodeURIComponent(currentSlot)+'&return='+encodeURIComponent(runnerReturn);
        };
      }

      const classObserver=new MutationObserver(()=>{applyVisual();if(prev){prev.disabled=false;prev.textContent=getIndex()===0?'← Day Overview':'← Previous'}});
      cards.forEach(c=>classObserver.observe(c,{attributes:true,attributeFilter:['class']}));
      await applyVisual();

      // The runner owns Done/section handoff; keep the page from navigating away itself.
      const next=doc.getElementById('next');
      if(next){
        const syncNext=()=>{ if(getIndex()===cards.length-1) next.textContent='Done ✓'; };
        syncNext();
        cards.forEach(c=>new MutationObserver(syncNext).observe(c,{attributes:true,attributeFilter:['class']}));
      }
    }
  };
})();