(function(){
'use strict';
if(!window.EEAStar)return;
const STATE_KEY='eea-star-state-v1';
function setNextById(id){
  const roster=window.EEAStar.roster();
  const student=roster.find(x=>String(x.id)===String(id));
  if(!student)return window.EEAStar.status();
  const state=window.EEAStar.loadState();
  state.servedIds=(state.servedIds||[]).filter(x=>String(x)!==String(id));
  state.pendingIds=[String(id),...(state.pendingIds||[]).filter(x=>String(x)!==String(id)&&!(state.servedIds||[]).includes(x))];
  const index=roster.findIndex(x=>String(x.id)===String(id));
  if(index>=0)state.nextIndex=index;
  localStorage.setItem(STATE_KEY,JSON.stringify(state));
  return window.EEAStar.status();
}
window.EEAStar.setNextById=setNextById;
})();
