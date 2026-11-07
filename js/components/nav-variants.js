/* Pilihan gaya menu bar bawah (di halaman Tools). 0 = standar lama; 1-4 = gaya tambahan lewat kelas nv-N pada .bottom-nav */
"use strict";
const NAV_KEY = 'ej3-nav';
const NAV_LIST = [[0, 'Standar (lama)'], [1, 'Kapsul gelap'], [2, 'Datar + titik'], [3, 'Mengambang + chip'], [4, 'Datar + pil']].concat(TPL_NAV_LIST);
function navVariantGet() { try {
    let v = localStorage.getItem(NAV_KEY);
    if (v === '6' || v === '9' || v === '10') v = '4'; // menu bawah lama Template 2/3/4 -> Datar + pil
    if (v === '5') v = '0'; // menu bawah lama Template 1 -> Standar (lama)
    return v !== null && /^\d+$/.test(v) && NAV_LIST.some(x => x[0] === Number(v)) ? Number(v) : 0;
}
catch (_) {
    return 0;
} }
function navVariantSet(v) { try {
    localStorage.setItem(NAV_KEY, String(v));
}
catch (_) { } }
function NavPicker({ value, onChange }) {
    return React.createElement(PickRow, { icon: React.createElement(SlidersHorizontal, { size: 18 }), title: "Tampilan menu bawah", desc: "Gaya menu bar di bagian bawah layar", value: value, options: NAV_LIST.map(x => ({ v: x[0], l: x[1] })), onChange: onChange });
}
