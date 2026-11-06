/* Template halaman utama: 0 = standar (sekarang), 1-6 = enam template baru.
   Setiap template punya header (id 10+n) dan menu bawah (id 4+n) sendiri yang juga bisa dipilih terpisah di Tools. */
"use strict";
const HOME_KEY = 'ej3-home';
const HOME_LIST = [[0, 'Standar (sekarang)'], [1, 'Template 1 · Dasbor biru'], [2, 'Template 2 · Organik hijau'], [5, 'Template 3 · Hijau bersih'], [6, 'Template 4 · Kaca lembut']];
const TPL_HEADER_LIST = HOME_LIST.slice(1).map(x => [10 + x[0], x[1]]);
const TPL_NAV_LIST = HOME_LIST.slice(1).filter(x => x[0] === 1).map(x => [4 + x[0], x[1]]); /* menu bawah: hanya Template 1 punya sendiri; Template 2/3/4 memakai gaya "Datar + pil" (nv 4) */
function homeGet() { try {
    const v = localStorage.getItem(HOME_KEY);
    return v !== null && /^[0-6]$/.test(v) && Number(v) !== 3 && Number(v) !== 4 ? Number(v) : 0;
}
catch (_) {
    return 0;
} }
function homeSet(v) { try {
    localStorage.setItem(HOME_KEY, String(v));
}
catch (_) { } }
/* huruf khas tiap template (dimuat dari Google Fonts, sama seperti font aplikasi) */
const TPL_FONTS = { 2: 'family=Nunito:wght@500;600;700;800&family=Caveat:wght@500;600' };
const tplFontDone = {};
function tplFontLoad(n) { const q = TPL_FONTS[n]; if (!q || tplFontDone[n])
    return; tplFontDone[n] = 1; try {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?' + q + '&display=swap';
    document.head.appendChild(l);
}
catch (_) { } }
/* nomor template dari id header / menu */
const tplOfHeader = v => v >= 11 && v <= 16 ? v - 10 : 0;
const tplOfNav = v => v >= 5 && v <= 10 ? v - 4 : 0;
/* isi menu bawah tiap template: label & ikon persis gambar; posisi tetap (1 Performance, 2 My Journal, 3 Tambah trade, 4 Tools, 5 Profil) */
const TPL_NAV = {
    1: { labels: ['Dashboard', 'Journal', 'Trades', 'Analytics', 'Profile'], icons: ['BarsFill', 'FileText', 'CandlePlus', 'ChartPie', 'UserRound'] },
    2: { labels: ['Beranda', 'Jurnal', 'Trading', 'Statistik', 'Profil'], icons: ['HomeFill', 'BookOpen', 'CandlePlus', 'BarsThin', 'UserRound'] },
    5: { labels: ['Jurnal', 'Edukasi', 'Trading', 'Tools', 'Akun'], icons: ['BarsFill', 'BookOpen', 'CandlePlus', 'SlidersHorizontal', 'UserRound'] },
    6: { labels: ['Journal', 'Insights', 'Trade', 'Tools', 'Profile'], icons: ['BarsThin', 'BookOpen', 'CandlePlus', 'SlidersHorizontal', 'UserRound'] }
};
