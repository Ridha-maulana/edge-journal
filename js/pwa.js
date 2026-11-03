/* Mendaftarkan service worker (mode offline) dan meminta penyimpanan permanen */
if("serviceWorker" in navigator){try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){}window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){});});}
/* Warna bilah status (atas layar) selalu sama dengan warna layar tepat di bawahnya: halaman, header, lembar/modal penuh.
   Di aplikasi Android (Capacitor) lewat plugin StatusBar; di browser lewat meta theme-color. */
(function(){
var cap=null;try{var c=window.Capacitor;if(c&&c.isNativePlatform&&c.isNativePlatform()){cap=(c.Plugins&&c.Plugins.StatusBar)||c.registerPlugin('StatusBar');}}catch(e){}
var run=function(f){try{Promise.resolve(f()).catch(function(){});}catch(e){}};
if(cap){run(function(){return cap.setOverlaysWebView({overlay:false});});run(function(){return cap.setStyle({style:'DARK'});});}
var BASE=[9,13,24,1],last='';
function parse(str){var m=String(str||'').match(/rgba?\(([^)]+)\)/);if(!m)return null;var a=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return [a[0],a[1],a[2],a.length>3?a[3]:1];}
function over(top,bot){var a=top[3];return [top[0]*a+bot[0]*(1-a),top[1]*a+bot[1]*(1-a),top[2]*a+bot[2]*(1-a),1];}
function layerColor(el){var cs=getComputedStyle(el),bg=parse(cs.backgroundColor);
 if(cs.backgroundImage&&cs.backgroundImage!=='none'){var g=parse(cs.backgroundImage);if(g)bg=g;}
 return bg;}
function topColor(){
 var x=Math.round(innerWidth/2),el=document.elementFromPoint(x,3),stack=[];
 for(var n=el;n&&n.nodeType===1;n=n.parentElement){var c=layerColor(n);if(c&&c[3]>0){stack.push(c);if(c[3]>=1)break;}}
 var col=stack.length&&stack[stack.length-1][3]>=1?stack.pop():BASE.slice();
 while(stack.length)col=over(stack.pop(),col);
 return col;}
function hex(c){return '#'+c.slice(0,3).map(function(v){v=Math.max(0,Math.min(255,Math.round(v)));return (v<16?'0':'')+v.toString(16);}).join('');}
function sync(){try{var h=hex(topColor());if(h===last)return;last=h;
 var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',h);
 if(cap)run(function(){return cap.setBackgroundColor({color:h});});}catch(e){}}
var q=0;function queue(){if(q)return;q=requestAnimationFrame(function(){q=0;sync();});}
window.syncStatusBar=queue;
function start(){try{new MutationObserver(queue).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','data-tab','data-nv']});}catch(e){}
 window.addEventListener('resize',queue);window.addEventListener('orientationchange',queue);setInterval(sync,1500);queue();}
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();
/* Ukuran tetap: cegah cubit-zoom (iOS Safari mengabaikan user-scalable=no) */
try{["gesturestart","gesturechange","gesturechange"].forEach(function(t){document.addEventListener(t,function(e){e.preventDefault();},{passive:false});});}catch(e){}
