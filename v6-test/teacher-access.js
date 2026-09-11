(()=>{
  const SETTINGS_KEY='eea-app-settings';
  const SESSION_KEY='eea-teacher-unlocked';

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
    requireAccess,shouldLockOnHome,goHome
  };
})();
