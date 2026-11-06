const CACHE='adah-static-v26';
const ASSETS=['./','./index.html','./styles.css','./app.js','./i18n.js','./favicon.svg','./icons.svg','./logo.svg','./manifest.webmanifest','./text-tools.html','./utility-tools.html','./security-tools.html','./privacy.html','./terms.html','./404.html','./about.html','./help.html','./sitemap.html','./learning.html','./resources.html','./services.html'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('adah-static-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;

  // Admin pages and API responses are always network-only. They contain
  // authentication state and deployment configuration and must never be
  // served from the offline/static cache.
  const path=url.pathname;
  if(path.startsWith('/api/')||path==='/admin.html'||path==='/admin.js'){
    event.respondWith(fetch(request,{cache:'no-store'}));
    return;
  }

  event.respondWith(caches.match(request).then(cached=>{
    if(cached)return cached;
    return fetch(request).then(response=>{
      if(response.ok&&path.startsWith(new URL('./',self.registration.scope).pathname)){
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
