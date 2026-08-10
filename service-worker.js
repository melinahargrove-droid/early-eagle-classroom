const CACHE="early-eagle-v5-21-00";
const FILES=[
  "/","/index.html","/css/app.css","/js/app.js","/manifest.webmanifest","/assets/icons/header/volume.svg","/assets/icons/header/home.svg","/assets/icons/header/teacher-desk.svg","/assets/icons/header/calendar.svg","/assets/images/star-celebration-card-base.jpg","/assets/images/star-celebration-card-storybook-blank.png",
  "/assets/images/environment-master-v1.png","/assets/images/friend-basket.png",
  "/assets/images/next-eddie.png","/assets/images/next-community.png","/assets/images/next-read.png","/assets/images/next-centers.png","/assets/images/next-cleanup.png","/assets/images/next-circle.png","/assets/images/next-smallgroups.png","/assets/images/next-lunch.png","/assets/images/next-outdoor.png","/assets/images/next-closing.png","/assets/images/star-art.png",
  "/assets/images/button-star.png","/assets/images/button-friend.png","/assets/images/button-centers.png",
  "/assets/images/button-cleanup.png","/assets/images/button-lessons.png","/assets/images/button-endday.png",
  "/assets/images/star-of-day-master.png","/assets/images/timer-artwork-final.png","/assets/images/timer-watercolor-texture.png","/assets/audio/circle-time-clean-up.mp3",
  "/assets/icons/icon-192.png","/assets/icons/icon-512.png"
];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
