(()=>{
  const SETTINGS_KEY='eea-app-settings';
  const SESSION_KEY='eea-teacher-unlocked';
  const STUDENT_KEY='eea-students-v1';
  const SCHEDULE_KEY='eea-schedule-config';
  const SCHEDULE_DETAIL_KEYS=['eea-now-illustrations','eea-now-popup-images','eea-now-popup-audio','eea-schedule-rules'];
  const ACTIVITY_IDS={
    'centers':'activity-0',
    'circle time':'activity-1',
    'breakfast':'activity-2',
    'small groups':'activity-3',
    'recess':'activity-4',
    'lunch':'activity-5',
    'nap':'activity-6',
    'snack':'activity-7',
    'read aloud':'activity-8',
    'dancing':'activity-9',
    'clean up':'activity-10',
    'dismissal':'activity-11'
  };
  const EEA_FALLBACK=['Brahm','Dylan','Easton','Eila','Hayes','Heidi','Jamie','Kayson','Lily','Mason','Maesyn','Neely','River','Roman','Warren','Wyatt','Zach','Zelda'];
  const WEEK9_SECTIONS=['Community Meeting','Read Aloud','Foundational Literacy','Writing','Centers','Literacy Small Groups','Building Blocks','Storytelling','Closing Circle'];

  const norm=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,' ');

  // Students used to seed a generic demo roster when no saved classroom roster existed.
  // Seed the personal EEA roster first so Teacher's Desk and classroom-facing tools agree.
  function seedPersonalRoster(){
    if(!/(?:^|\/)students\.html$/i.test(location.pathname))return false;
    if(localStorage.getItem(STUDENT_KEY)!==null)return false;
    const roster=EEA_FALLBACK.map((name,i)=>({id:'s'+(i+1),name,active:true,photo:'',audio:''}));
    localStorage.setItem(STUDENT_KEY,JSON.stringify(roster));
    localStorage.setItem('eea-student-names',JSON.stringify(EEA_FALLBACK));
    return true;
  }

  // A newer schedule editor briefly generated IDs from row position even though
  // the rest of V6 treats activity IDs as stable semantic identities. Repair any
  // saved schedule from that period and carry its per-activity custom data along.
  function repairScheduleIds(){
    try{
      const saved=JSON.parse(localStorage.getItem(SCHEDULE_KEY)||'null');
      if(!Array.isArray(saved)||!saved.length)return false;
      const remap={};let changed=false;
      const repaired=saved.map(item=>{
        if(!item||typeof item!=='object')return item;
        const canonical=ACTIVITY_IDS[norm(item.name)];
        if(!canonical||String(item.id||'')===canonical)return item;
        const old=String(item.id||'');
        if(old)remap[old]=canonical;
        changed=true;
        return {...item,id:canonical};
      });
      if(!changed)return false;

      SCHEDULE_DETAIL_KEYS.forEach(key=>{
        try{
          const data=JSON.parse(localStorage.getItem(key)||'null');
          if(!data||Array.isArray(data)||typeof data!=='object')return;
          const moved={};
          Object.entries(data).forEach(([k,v])=>{moved[remap[k]||k]=v});
          localStorage.setItem(key,JSON.stringify(moved));
        }catch(e){}
      });
      localStorage.setItem(SCHEDULE_KEY,JSON.stringify(repaired));
      return true;
    }catch(e){return false}
  }

  // The shared lesson editors originally stopped their section-name map at Week 8.
  // Keep Unit 2 Week 1 teacher-facing context aligned with its nine-section runner.
  function repairWeek9EditorLabel(){
    const page=location.pathname.split('/').pop().toLowerCase();
    if(page!=='lesson-screen-editor.html'&&page!=='lesson-screen-manager.html')return false;
    const q=new URLSearchParams(location.search);
    if(Number(q.get('week'))!==9)return false;
    const day=Math.max(0,Math.min(4,Number(q.get('day'))||0));
    const section=Math.max(0,Math.min(WEEK9_SECTIONS.length-1,Number(q.get('section'))||0));
    const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
    const apply=()=>{
      const crumb=document.getElementById('crumb');
      if(!crumb)return false;
      crumb.textContent=`UNIT 2 · WEEK 1 · ${days[day].toUpperCase()} · ${WEEK9_SECTIONS[section].toUpperCase()}`;
      return true;
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
    else apply();
    return true;
  }

  seedPersonalRoster();
  repairScheduleIds();
  repairWeek9EditorLabel();

  function settings(){
    try{return JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')||{}}
    catch(e){return{}}
  }

  function configuredPin(){
    const pin=String(settings().pin||'').replace(/\D/g,'').slice(0,4);
    return pin.length===4?pin:'';
  }

  function isUnlocked(){
    const pin=configuredPin();
    return !pin||sessionStorage.getItem(SESSION_KEY)==='1';
  }

  function unlock(){
    const pin=configuredPin();
    if(!pin){sessionStorage.setItem(SESSION_KEY,'1');return true}
    if(sessionStorage.getItem(SESSION_KEY)==='1')return true;
    const entered=window.prompt('Enter the 4-digit Teacher Mode PIN:');
    if(entered===null)return false;
    if(String(entered).trim()===pin){
      sessionStorage.setItem(SESSION_KEY,'1');
      return true;
    }
    window.alert('That PIN is not correct.');
    return false;
  }

  function lock(){sessionStorage.removeItem(SESSION_KEY)}

  function requireAccess(redirect='index.html'){
    if(isUnlocked()||unlock())return true;
    if(redirect)location.replace(redirect);
    return false;
  }

  function shouldLockOnHome(){return settings().lockOnHome!==false}

  function goHome(){
    if(shouldLockOnHome())lock();
    location.href='index.html';
  }

  window.EEATeacherAccess={
    SETTINGS_KEY,SESSION_KEY,settings,configuredPin,isUnlocked,unlock,lock,
    requireAccess,shouldLockOnHome,goHome,repairScheduleIds,seedPersonalRoster,repairWeek9EditorLabel
  };
})();
