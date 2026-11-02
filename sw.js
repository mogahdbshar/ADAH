const CACHE='adah-static-v5';
const ASSETS=['./','./index.html','./styles.css','./app.js','./favicon.svg','./logo.svg','./manifest.webmanifest','./text-tools.html','./utility-tools.html','./security-tools.html'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('adah-static-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  event.respondWith(caches.match(request).then(cached=>{
    if(cached)return cached;
    return fetch(request).then(response=>{
      if(response.ok&&url.pathname.startsWith(new URL('./',self.registration.scope).pathname)){
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(request,copy));
      }
      return response;
    }).catch(()=>{
      if(request.mode==='navigate')return caches.match('./index.html');
      return new Response('',{status:503,statusText:'Offline'});
    });
  }));
});