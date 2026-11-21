/* Kepala halaman dalam (tombol kembali + judul) untuk Tampilan aplikasi dan halaman-halaman Profil (v5.9.97) */
"use strict";
Object.assign(ICONS, {
    LogOut: [["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }], ["polyline", { points: "16 17 21 12 16 7" }], ["line", { x1: 21, x2: 9, y1: 12, y2: 12 }]],
    Paintbrush: [["path", { d: "m14.622 17.897-10.68-2.913" }], ["path", { d: "M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z" }], ["path", { d: "M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15" }]]
});
function SubHead({ title, onBack }) {
    useEffect(() => {
        const k = e => { if (e.key === 'Escape' && !document.querySelector('.modal-backdrop,.al-page')) onBack(); };
        document.addEventListener('keydown', k);
        return () => document.removeEventListener('keydown', k);
    }, []);
    return React.createElement("div", { className: "sp-head" },
        React.createElement("button", { type: "button", className: "sp-back", "aria-label": "Kembali", onClick: onBack }, React.createElement(ChevronLeft, { size: 24 })),
        React.createElement("h1", null, title));
}
