const C='ej3-3.6.0';   /* naikkan angka ini setiap rilis agar HP memuat versi baru */
const SHELL=[
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-v6-512.png',
  './assets/login-art.webp',
  './css/01-base.css',
  './css/02-splash.css',
  './css/03-nav-legacy.css',
  './css/04-drilldown.css',
  './css/05-nav-simple-fullscreen.css',
  './css/06-icon-tabs.css',
  './css/07-nav-final.css',
  './css/08-profitability-carousel.css',
  './css/09-nav-autohide.css',
  './css/10-profile-add-trade.css',
  './css/11-nav-center.css',
  './css/12-no-zoom.css',
  './js/app.js',
  './js/boot.js',
  './js/pwa.js',
  './js/splash.js',
  './js/watchdog.js',
  './js/components/account-modal.js',
  './js/components/calendar-modal.js',
  './js/components/screenshot-entry.js',
  './js/components/charts.js',
  './js/components/error-boundary.js',
  './js/components/form-controls.js',
  './js/components/layout.js',
  './js/components/trade-modals.js',
  './js/firebase/cloud-sync.js',
  './js/firebase/cloud-ui.js',
  './js/firebase/firebase-config.js',
  './js/vendor/react-19.2.8.min.js',
  './js/lib/errors.js',
  './js/lib/feedback.js',
  './js/lib/files.js',
  './js/lib/format.js',
  './js/lib/haptics.js',
  './js/lib/icons.js',
  './js/lib/react-hooks.js',
  './js/lib/share-image.js',
  './js/lib/mt5-parse.js',
  './js/lib/ocr.js',
  './js/lib/store.js',
  './js/lib/trading.js',
  './js/pages/journal.js',
  './js/pages/performance.js',
  './js/pages/profile.js',
  './js/pages/tools.js',
  './js/stats/advanced-stats.js',
  './js/stats/drilldown.js',
  './js/stats/perf-extra.js'
];
const CDN=[]; /* React kini lokal (js/vendor), tidak ada lagi berkas CDN wajib */
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>Promise.all([
  ...SHELL.map(u=>fetch(new Request(u,{cache:'reload'})).then(r=>{if(r&&r.ok)return c.put(u,r)}).catch(()=>{})),
  ...CDN.map(u=>fetch(new Request(u,{mode:'no-cors'})).then(r=>c.put(u,r)).catch(()=>{}))])));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('ej3-')&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
/* Cache dulu (cepat), lalu perbarui di belakang layar. Untuk berkas milik sendiri, pembaruan selalu memeriksa server
   (cache:'no-cache') agar tidak tertahan cache HTTP GitHub Pages (±10 menit) atau cache browser. */
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const u=new URL(req.url);
  if(u.protocol!=='http:'&&u.protocol!=='https:')return;
  if(/tesseract|projectnaptha/i.test(req.url))return; /* mesin OCR berukuran besar: biarkan browser/Tesseract menyimpannya sendiri */
  const same=u.origin===self.location.origin;
  e.respondWith(caches.open(C).then(async cache=>{
    const cached=await cache.match(req,{ignoreSearch:req.mode==='navigate'});
    const net=(same?fetch(req.url,{cache:'no-cache'}):fetch(req)).then(r=>{if(r&&(r.ok||r.type==='opaque'))cache.put(req,r.clone()).catch(()=>{});return r;}).catch(()=>null);
    if(cached){e.waitUntil(net);return cached;}
    return (await net)||(req.mode==='navigate'?await cache.match('./index.html'):null)||Response.error();
  }));
});
