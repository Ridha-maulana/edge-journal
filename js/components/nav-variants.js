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
    return React.createElement("div", { className: "tool-card nav-picker" },
        React.createElement("div", { className: "tool-head" },
            React.createElement("div", { className: "tool-icon" }, React.createElement(SlidersHorizontal, null)),
            React.createElement("div", null,
                React.createElement("h2", null, "Tampilan menu bawah"),
                React.createElement("p", null, "Pilih gaya menu bar di bagian bawah layar. Langsung terlihat, dan pilihan tersimpan di perangkat ini."))),
        React.createElement("div", { className: "hd-picker" }, NAV_LIST.map((x, i) => React.createElement("button", { key: x[0], type: "button", className: value === x[0] ? 'on' : '', onClick: () => onChange(x[0]) }, React.createElement("b", null, i === 0 ? '·' : i), " ", x[1]))));
}
