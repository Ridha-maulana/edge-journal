/* Mendaftarkan service worker (mode offline) dan meminta penyimpanan permanen */
if("serviceWorker" in navigator){try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){}window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){});});}
