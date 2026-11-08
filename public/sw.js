// AviNivesh Pro 2.0: offline application shell only.
// Financial data API requests are never cached: avoiding stale prices displayed as fresh.
const CACHE='avinivesh-ui-v2';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['/','/icon.svg','/manifest.webmanifest']).catch(()=>{})));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 event.respondWith(fetch(req).then(res=>{if(res.ok&&['document','script','style','image'].includes(req.destination)){const c=res.clone();caches.open(CACHE).then(cache=>cache.put(req,c)).catch(()=>{});}return res;}).catch(async()=>await caches.match(req)||await caches.match('/')||Response.error()));});
