const CACHE='eea-companion-v10';
const CORE=[
  './','./index.html','./manifest.webmanifest','./install.html',
  './class-profile.js','./star-engine.js','./name-audio-engine.js','./center-choice-state.js','./choose-a-friend-state.js','./choose-a-friend-audio-fix.js','./visual-store.js','./lesson-visual-edit.js','./classroom-protection.js',
  './attendance.html','./star-of-the-day.html','./star-management.html','./choose-a-friend.html','./choose-friend.html','./center-choice.html','./stay-in-your-center.html',
  './timer.html','./calm-down.html','./movement.html','./clean-up-song.html','./clean-up.html','./daily-lessons.html','./teachers-desk.html','./weather.html',
  './students.html','./centers-management.html','./schedule-management.html','./media-management.html','./calendar-management-v2.html','./app-settings.html','./backup-restore.html','./now-window-settings.html','./visual-editor.html','./movement-song-library.html',
  './lesson-runner-week1.html','./lesson-runner-week2.html','./lesson-runner-week3.html','./lesson-runner-week4.html','./lesson-runner-week5.html','./lesson-runner-week6.html','./lesson-runner-week7.html','./lesson-runner-week8.html','./lesson-runner-week9.html',
  './community-meeting.html','./community-meeting-tuesday.html','./community-meeting-wednesday.html','./community-meeting-thursday.html','./community-meeting-friday.html','./week1-read-aloud.html','./centers-week1.html','./storytelling-week1.html','./closing-circle-week1.html',
  './community-meeting-week2.html','./week2-read-aloud.html','./centers-week2.html','./literacy-small-groups-week2.html','./storytelling-week2.html','./closing-circle-week2.html',
  './community-meeting-week3.html','./week3-read-aloud.html','./week3-intro-centers.html','./week3-small-groups.html','./week3-storytelling.html','./closing-circle-week3.html',
  './community-meeting-week4.html','./week4-read-aloud.html','./week4-intro-centers.html','./week4-small-groups.html','./week4-building-blocks.html','./week4-storytelling.html','./closing-circle-week4.html',
  './community-meeting-week5.html','./week5-read-aloud.html','./week5-intro-centers.html','./week5-foundational.html','./week5-small-groups.html','./week5-building-blocks.html','./week5-storytelling.html','./closing-circle-week5.html',
  './community-meeting-week6.html','./week6-read-aloud.html','./week6-intro-centers.html','./week6-writing.html','./week6-foundational.html','./week6-small-groups.html','./week6-building-blocks.html','./week6-storytelling.html','./closing-circle-week6.html',
  './community-meeting-week7.html','./week7-read-aloud.html','./week7-intro-centers.html','./week7-foundational.html','./week7-writing.html','./week7-small-groups.html','./week7-building-blocks.html','./week7-storytelling.html','./closing-circle-week7.html',
  './community-meeting-week8.html','./week8-read-aloud.html','./week8-sections.html','./week9-read-aloud.html','./week9-sections.html',
  './assets/app-icon.svg','./assets/pwa-icon-192.png','./assets/pwa-icon-512.png','./assets/home/home-screen-background.png','./assets/home/star-of-the-day.png','./assets/eddie-movement.png','./assets/timer-back.png','./assets/timer-front.png','./assets/timer%20background.png','./assets/timer%20buttons.png'
];
const SKIP_PRECACHE_EXT=/\.(?:mp4|webm|mov)(?:$|[?#])/i;

function localAssetUrls(text,baseUrl){
  const found=new Set();
  const add=value=>{
    if(!value)return;
    value=String(value).trim().replace(/&amp;/g,'&');
    if(!/^(?:\.\/)?assets\//i.test(value)||SKIP_PRECACHE_EXT.test(value))return;
    try{
      const url=new URL(value,baseUrl);
      if(url.origin===self.location.origin)found.add(url.href);
    }catch(e){}
  };
  const quoted=/['"`]((?:\.\/)?assets\/[^'"`]+)['"`]/gi;
  let match;
  while((match=quoted.exec(text)))add(match[1]);
  return [...found];
}

async function cacheOne(cache,url){
  try{
    const request=new Request(url,{cache:'reload'});
    const response=await fetch(request);
    if(!response||!response.ok)throw new Error('HTTP '+(response&&response.status));
    await cache.put(request,response.clone());
    return response;
  }catch(e){
    console.warn('[EEA SW] Could not precache',url,e);
    return null;
  }
}

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    const discovered=new Set();
    for(const path of CORE){
      const absolute=new URL(path,self.location.href).href;
      const response=await cacheOne(cache,absolute);
      if(!response||SKIP_PRECACHE_EXT.test(absolute))continue;
      const type=response.headers.get('content-type')||'';
      if(!/(?:text\/|javascript|json|manifest)/i.test(type))continue;
      try{
        const text=await response.clone().text();
        localAssetUrls(text,absolute).forEach(url=>discovered.add(url));
      }catch(e){}
    }
    for(const url of discovered){
      if(!CORE.some(path=>new URL(path,self.location.href).href===url))await cacheOne(cache,url);
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  const isHtml=request.mode==='navigate'||request.destination==='document'||url.pathname.endsWith('.html');
  if(isHtml){
    event.respondWith(
      fetch(request,{cache:'no-store'}).then(response=>{
        if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});}
        return response;
      }).catch(async()=>{
        const cached=await caches.match(request,{ignoreSearch:true});
        if(cached)return cached;
        if(request.mode==='navigate')return caches.match('./index.html',{ignoreSearch:true});
        throw new Error('Offline resource unavailable');
      })
    );
    return;
  }
  event.respondWith(
    caches.match(request,{ignoreSearch:true}).then(cached=>cached||fetch(request).then(response=>{
      if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});}
      return response;
    }))
  );
});
