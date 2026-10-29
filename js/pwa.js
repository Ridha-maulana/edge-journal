/* Mendaftarkan service worker (mode offline) dan meminta penyimpanan permanen */
if("serviceWorker" in navigator){try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){}window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){});});}
/* Aplikasi Android (Capacitor): warna bilah status mengikuti warna dasar aplikasi (bukan hitam). Di browser tidak melakukan apa-apa. */
(function(){try{var c=window.Capacitor;if(!c||!c.isNativePlatform||!c.isNativePlatform())return;var P=(c.Plugins&&c.Plugins.StatusBar)||c.registerPlugin('StatusBar');var run=function(f){try{Promise.resolve(f()).catch(function(){});}catch(e){}};run(function(){return P.setOverlaysWebView({overlay:false});});run(function(){return P.setBackgroundColor({color:'#0b1020'});});run(function(){return P.setStyle({style:'DARK'});});}catch(e){}})();
/* Ukuran tetap: cegah cubit-zoom (iOS Safari mengabaikan user-scalable=no) */
try{["gesturestart","gesturechange","gesturechange"].forEach(function(t){document.addEventListener(t,function(e){e.preventDefault();},{passive:false});});}catch(e){}
