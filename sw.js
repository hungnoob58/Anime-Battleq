/* Service worker: chơi offline + tự cập nhật. Đặt cùng thư mục với index.html, phục vụ qua HTTPS.
   Chiến lược: luôn hỏi mạng trước (kiểm tra bản mới, nếu không đổi thì chỉ tốn vài byte - HTTP 304);
   mạng chậm quá 3,5 giây hoặc mất mạng thì dùng bản đã lưu để chơi offline. */
const V='linkclick-v4';
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(['./'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
 e.respondWith((async()=>{const c=await caches.open(V);
  const hit=(await c.match(r,{ignoreSearch:true}))||(r.mode==='navigate'?await c.match('./'):undefined);
  const net=fetch(r,{cache:'no-cache'}).then(x=>{if(x&&x.ok&&new URL(r.url).origin===location.origin)c.put(r,x.clone());return x});
  if(!hit)return net;
  return Promise.race([net,new Promise(ok=>setTimeout(()=>ok(hit),3500))]).catch(()=>hit)})())});
