const DEFAULT_ROSTER = [
  'Brahm','Dylan','Easton','Eila','Hayes','Heidi','Jamie','Kayson','Lily',
  'Mason','Maesyn','Neely','River','Roman','Warren','Wyatt','Zach','Zelda'
];

const OLD_TEMP_ROSTER = [
  'Avery','Bentley','Blakely','Brantley','Dylan','Easton','Emersyn','Everleigh','Grayson','Harper',
  'Hudson','Jaxson','Kinsley','Liam','Maverick','Oakley','Sawyer','Warren','Wyatt','Zoey'
];

const AUDIO = {
  brahm:'./assets/brahm.mp3', dylan:'./assets/dylan.mp3', easton:'./assets/easton.mp3',
  eila:'./assets/eila.mp3', hayes:'./assets/hayes.mp3', heidi:'./assets/heidi.mp3',
  jamie:'./assets/jamie.mp3', kayson:'./assets/kayson.mp3', lily:'./assets/lily.mp3',
  mason:'./assets/mason-and-maesyn-reference.mp3', maesyn:'./assets/mason-and-maesyn-reference.mp3',
  neely:'./assets/neely.mp3', river:'./assets/river.mp3', roman:'./assets/roman.mp3',
  warren:'./assets/warren.mp3', wyatt:'./assets/wyatt.mp3', zach:'./assets/zach.mp3', zelda:'./assets/zelda.mp3'
};

function normalize(name){ return String(name||'').trim().toLowerCase().replace(/[^a-z0-9]/g,''); }
function sameNames(list,names){
  if (!Array.isArray(list) || list.length !== names.length) return false;
  return list.every((s,i)=>normalize(s&&s.name)===normalize(names[i]));
}

try {
  const key = 'eea-students-v1';
  let current = null;
  try { current = JSON.parse(localStorage.getItem(key)); } catch (_) {}
  const shouldSeed = !Array.isArray(current) || !current.length || sameNames(current, OLD_TEMP_ROSTER);
  if (shouldSeed) {
    const roster = DEFAULT_ROSTER.map((name,i)=>({
      id:'s'+(i+1), name, active:true, photo:'', audio:AUDIO[normalize(name)]||''
    }));
    localStorage.setItem(key, JSON.stringify(roster));
    localStorage.setItem('eea-student-names', JSON.stringify(DEFAULT_ROSTER));
  }
} catch (_) {}
