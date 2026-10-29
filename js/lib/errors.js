/* Penangkap error global (menampilkan pesan di layar pembuka) */
"use strict";
window.addEventListener("error",function(e){var b=document.getElementById("boot");if(b&&!window.__appMounted)b.textContent="Error: "+e.message;});
