/* Pesan cadangan bila aplikasi gagal dimuat dalam 15 detik */
setTimeout(function(){var b=document.getElementById('boot');if(b&&!window.__appMounted)b.textContent='Gagal memuat. Pastikan HP terhubung internet lalu muat ulang halaman ini.';},15000);
