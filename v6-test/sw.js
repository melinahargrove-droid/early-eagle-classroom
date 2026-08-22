const CACHE='eea-companion-v2';
const CORE=['./','./index.html','./manifest.webmanifest','./star-engine.js','./assets/app-icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;const isHtml=request.mode==='navigate'||request.destination==='document'||new URL(request.url).pathname.endsWith('.html');if(isHtml){event.respondWith(fetch(request,{cache:'no-store'}));return;}event.respondWith(fetch(request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});}return response;}).catch(()=>caches.match(request)));});
