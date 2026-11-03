/* Pilihan gaya menu bar bawah (di halaman Tools). 0 = standar lama; 1-4 = gaya tambahan lewat kelas nv-N pada .bottom-nav */
"use strict";
const NAV_KEY = 'ej3-nav';
const NAV_LIST = [[0, 'Standar (lama)'], [1, 'Kapsul gelap'], [2, 'Datar + titik'], [3, 'Mengambang + chip'], [4, 'Datar + pil']];
function navVariantGet() { try {
    const v = localStorage.getItem(NAV_KEY);
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
