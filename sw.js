// One-time retirement worker: remove all ADAH offline caches, then unregister.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith('adah-static-')).map(key=>caches.delete(key)));
  await self.registration.unregister();
  const clientsList=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  await Promise.all(clientsList.map(client=>client.navigate(client.url)));
})()));
self.addEventListener('fetch',event=>{
  if(event.request.method==='GET'&&new URL(event.request.url).origin===self.location.origin){
    event.respondWith(fetch(event.request,{cache:'no-store'}));
  }
});