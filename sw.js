// Cache only public application files. Never cache support requests or API responses.
const CACHE='calculator-shell-v2';const FILES=['./','./index.html','./style.css','./app.js','./icon.svg','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{const url=new URL(e.request.url);if(e.request.method!=='GET'||url.origin!==self.location.origin)return;if(!FILES.some(f=>new URL(f,self.registration.scope).href===url.href))return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});
