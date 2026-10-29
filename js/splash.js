/* Splash / layar pembuka: tampil seketika dan memudar setelah aplikasi siap */
/* Splash: tampil sekarang juga, tampil minimal ~1 detik agar animasi selesai, lalu memudar halus. */
window.__splashStart=(window.performance&&performance.now)?performance.now():0;
window.__splashMin=1350;
(function(){var m=document.querySelector('#splash .sp-mark');if(m)m.addEventListener('animationstart',function(){if(window.__splashAnimStart==null)window.__splashAnimStart=performance.now();},{once:true});})();
/* Splash Android menampilkan logo bulat (ikon maskable v5). Saat dibuka sebagai aplikasi terpasang, animasi halaman mulai dari
   logo yang sama di tengah layar (tanpa fade-in) lalu menyusut jadi kotak membulat ke kiri sambil tulisan muncul.
   Di tab browser biasa (tanpa splash Android) logo memudar masuk seperti sebelumnya. */
(function(){
  try{
    var sp=document.getElementById('splash'),mk=sp&&sp.querySelector('.sp-mark');
    if(!mk)return;
    var W=innerWidth;
    var lk=mk.offsetParent.getBoundingClientRect(),w=mk.offsetWidth; if(!w)return;   /* ukuran layout, tidak terpengaruh transform */
    var mx=lk.left+mk.offsetLeft+w/2;
    var size=Math.min(W*0.4722,520);    /* logo awal = lingkaran splash Android hasil ukur video (47,2% lebar layar, tepat di tengah LAYAR) */
    var native=false; try{native=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());}catch(e){}
    var standalone=false; try{standalone=!!((window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone);}catch(e){}
    /* Splash Android berpusat di tengah layar penuh, sedangkan halaman web berada di bawah bilah status.
       Geser titik awal animasi supaya lingkaran tidak melompat turun (bilah bawah dianggap rata dengan layar). */
    var sy=0; if(native||standalone){var d=(innerHeight-screen.height)/2; if(d<0&&d>-90)sy=d;}
    sp.style.setProperty('--ss',(size/w).toFixed(4));
    sp.style.setProperty('--sx',(W/2-mx).toFixed(1)+'px');
    sp.style.setProperty('--sy',sy.toFixed(1)+'px');
    if(native||standalone)sp.classList.add('sp-android');
    sp.classList.add('sp-morph');
  }catch(e){}
})();
window.__hideSplash=function(){
  var sp=document.getElementById('splash');
  if(!sp||sp.__going)return; sp.__going=true;
  sp.classList.add('sp-out');
  setTimeout(function(){if(sp&&sp.parentNode)sp.parentNode.removeChild(sp);},520);
};
