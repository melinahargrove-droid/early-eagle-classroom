(()=>{
  const params=new URLSearchParams(location.search),days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const raw=params.get('day'),named=days.indexOf(raw),numeric=raw!==null&&/^\d$/.test(raw)?Number(raw):-1;
  const weekday=new Date().getDay(),day=named>=0?named:numeric>=0&&numeric<5?numeric:weekday===0||weekday===6?4:weekday-1;
  let embedded=false;try{embedded=parent!==window&&parent.location.origin===location.origin&&new URL(parent.location.href).pathname.endsWith('/lesson-runner-week11.html');}catch(e){}
  const destination=embedded?parent:window;
  let leaving=false;
  const navigate=url=>{if(leaving)return;leaving=true;destination.location.href=url;};
  const overview=()=>{if(embedded&&typeof parent.EEAWeek11Overview==='function'){parent.EEAWeek11Overview();return;}localStorage.removeItem('eea-lesson-auto-resume');navigate('daily-lessons.html?week=11&day='+day);};
  if(day===2&&params.has('section')&&params.get('section')!=='1'){overview();return;}
  if(!['Monday','0','Tuesday','1','Wednesday','2'].includes(raw)){overview();return;}
  const plan=day===2?window.EEAWeek11WednesdayCentersPlan:day===1?window.EEAWeek11TuesdayCentersPlan:window.EEAWeek11MondayCentersPlan;
  const $=id=>document.getElementById(id),escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let index=0;
  const state=()=>({step:index,index,total:plan.length,atStart:index===0,atEnd:index===plan.length-1});
  function restore(step){index=Math.max(0,Math.min(plan.length-1,Number.isInteger(Number(step))?Number(step):0));render();}
  window.EEASectionState=state;window.EEACentersRestore=restore;window.EEACentersPlan=plan;
  function route(step,replace=false){
    if(embedded&&typeof parent.EEACentersNavigate==='function'){parent.EEACentersNavigate(step,replace);return;}
    restore(step);const url=new URL(location.href);url.searchParams.set('day',days[day]);url.searchParams.set('week','11');url.searchParams.set('section','1');url.searchParams.set('step',String(index));url.searchParams.delete('stop');url.searchParams.delete('book');url.searchParams.delete('center');url.searchParams.delete('review');
    if(url.href!==location.href)history[replace?'replaceState':'pushState'](null,'',url.href);
  }
  function render(){const dialog=$('image-dialog');if(dialog?.open)dialog.close();const s=plan[index];$('sub').textContent=days[day]+' · '+s.center;
    $('lesson').innerHTML=`<article class="community-card"><figure class="community-visual"><img class="lesson-img" src="${escape(s.img)}" alt="${escape(s.alt)}"><button type="button" class="enlarge-image">Enlarge image</button></figure><div class="community-copy"><div class="kicker">${escape(s.center.toUpperCase())} · WORLD OF COLOR</div><h2>${escape(s.title)}</h2><div class="lead">${escape(s.lead)}</div><details class="community-notes"><summary>Teacher Notes</summary><div class="community-notes-content">${s.notes.map(([title,paragraphs])=>`<h3>${escape(title)}</h3>${paragraphs.map(p=>`<p>${escape(p)}</p>`).join('')}`).join('')}<h3>Source materials</h3><ul><li><a href="${escape(s.source)}" target="_blank" rel="noopener noreferrer">Original Week 3 lesson</a></li>${(s.sources||[]).map(({label,url})=>`<li><a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a></li>`).join('')}</ul><p>Focus on Pre-K 3s | Boston Public Schools Early Childhood Department P-2</p></div></details></div></article>`;
    $('count').textContent=(index+1)+' of '+plan.length;$('prev').textContent=index===0?(day===2?'← Day Overview':'← Read Aloud'):'← Previous';$('done').textContent=index===plan.length-1?'Finish Centers →':'Next: '+(day===2?'Exploring Emotions':day===1?'Color Walk':'All Are Welcome Clubhouse')+' →';
    const enlarge=document.querySelector('.enlarge-image');enlarge.onclick=()=>{const dialog=$('image-dialog');$('enlarged-image').src=s.img;$('enlarged-image').alt=s.alt;enlarge.focus();dialog.showModal();};const image=document.querySelector('.lesson-img');image.onclick=enlarge.onclick;image.style.cursor='zoom-in';
    window.dispatchEvent(new CustomEvent('eea-section-state',{detail:state()}));
  }
  $('close-image').onclick=()=>$('image-dialog').close();
  $('image-dialog').addEventListener('click',event=>{if(event.target!==$('image-dialog'))return;const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.currentTarget.close();});
  $('exit').onclick=overview;
  $('prev').onclick=()=>{if(index>0){route(index-1);return;}if(day===2){overview();return;}if(embedded&&typeof parent.EEAWeek11PreviousCenters==='function')parent.EEAWeek11PreviousCenters();else navigate('lesson-runner-week11.html?week=11&day='+day+'&section=0');};
  $('done').onclick=()=>{if(index<plan.length-1){route(index+1);return;}if(embedded&&typeof parent.EEAWeek11CompleteCenters==='function')parent.EEAWeek11CompleteCenters();else overview();};
  window.addEventListener('popstate',()=>restore(new URLSearchParams(location.search).get('step')));
  window.addEventListener('pageshow',()=>{leaving=false;restore(new URLSearchParams(destination.location.search).get('step'));});
  route(params.get('step')||0,true);
})();
