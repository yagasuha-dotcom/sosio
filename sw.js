/* cache supaya game bisa dibuka tanpa internet. Strategi: tampilkan dari cache, perbarui di latar belakang.
   File lagu (assets/audio) tidak diambil alih, supaya pemutaran dan loncat posisi lagu tetap normal. */
const CACHE='sosiowar-v4';
const FILES=['./','index.html','manifest.json','css/style.css','css/fonts.css','js/audio.js','js/data.js','js/sociology.js','js/render.js','js/monsters.js','js/hud.js','js/game.js','js/ui.js','js/main.js','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.includes('/assets/audio/'))return;
  e.respondWith(caches.open(CACHE).then(c=>c.match(e.request).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r&&r.status===200)c.put(e.request,r.clone());return r;}).catch(()=>hit);
    return hit||net;
  })));
});
