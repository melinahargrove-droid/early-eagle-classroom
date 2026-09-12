const CACHE='eea-companion-v4';
const CORE=[
  './','./index.html','./manifest.webmanifest','./install.html',
  './class-profile.js','./star-engine.js','./name-audio-engine.js','./center-choice-state.js','./choose-a-friend-state.js','./visual-store.js','./lesson-visual-edit.js',
  './attendance.html','./star-of-the-day.html','./star-management.html','./choose-a-friend.html','./center-choice.html','./stay-in-your-center.html',
  './timer.html','./calm-down.html','./movement.html','./clean-up-song.html','./daily-lessons.html','./teachers-desk.html',
  './students.html','./centers-management.html','./schedule-management.html','./media-management.html','./calendar-management-v2.html','./app-settings.html','./backup-restore.html','./now-window-settings.html','./visual-editor.html','./movement-song-library.html',
  './assets/app-icon.svg','./assets/home/home-screen-background.png','./assets/home/star-of-the-day.png','./assets/eddie-movement.png','./assets/timer-back.png','./assets/timer-front.png','./assets/timer%20background.png','./assets/timer%20buttons.png'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(async cache=>{
    for(const url of CORE){
      try{await cache.add(url)}catch(e){console.warn('[EEA SW] Could not precache',url,e)}
    }
  }).then(()=>self.skipWaiting()));
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
        const cached=await caches.match(request);
        if(cached)return cached;
        if(request.mode==='navigate')return caches.match('./index.html');
        throw new Error('Offline resource unavailable');
      })
    );
    return;
  }
  event.respondWith(
    caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});}
      return response;
    }))
  );
});
