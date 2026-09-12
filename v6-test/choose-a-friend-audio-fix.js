(()=>{
  'use strict';
  if(window.EEAChooseFriendStateLoaded)return;
  const script=document.createElement('script');
  script.src='choose-a-friend-state.js';
  script.async=false;
  script.onload=()=>{window.EEAChooseFriendStateLoaded=true};
  script.onerror=()=>console.error('[EEA Choose a Friend] State helper failed to load');
  document.head.appendChild(script);
})();