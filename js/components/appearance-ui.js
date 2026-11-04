/* Bagian "Tampilan aplikasi" di halaman Tools: mode (terang/gelap/otomatis), tema warna, font */
"use strict";
function useAppearance() {
    const [, bump] = useState(0);
    useEffect(() => { const f = () => bump(n => n + 1); window.addEventListener('ej-appearance', f); return () => window.removeEventListener('ej-appearance', f); }, []);
    return window.EJ;
}
function ApDialog({ title, note, onClose, children }) {
    return ReactDOM.createPortal(React.createElement("div", { className: "modal-backdrop center top sheet-layer", onClick: e => { if (e.target === e.currentTarget)
            onClose(); } },
        React.createElement("div", { className: "tsel-sheet ap-sheet" },
            React.createElement("div", { className: "tsel-title" }, title),
            children,
            note && React.createElement("p", { className: "ap-note" }, note))), document.body);
}
function ApRow({ icon, title, desc, value, dot, onOpen }) {
    return React.createElement("button", { type: "button", className: "pick-row", onClick: onOpen },
        React.createElement("span", { className: "pick-ic" }, icon),
        React.createElement("span", { className: "pick-tx" }, React.createElement("b", null, title), desc && React.createElement("small", null, desc)),
        React.createElement("span", { className: "pick-val" }, dot && React.createElement("i", { className: "ap-dot", style: { background: dot } }), value),
        React.createElement(ChevronRight, { size: 18 }));
}
function AppearanceRows() {
    const EJ = useAppearance();
    const [dlg, setDlg] = useState(null);
    const [showAllTheme, setShowAllTheme] = useState(false);
    const [showAllFont, setShowAllFont] = useState(false);
    const st = EJ.state, th = EJ.THEMES[st.theme], fo = EJ.FONTS[st.font];
    const modeLabel = { light: 'Terang', dark: 'Gelap', auto: 'Otomatis' }[st.mode];
    const close = () => setDlg(null);
    const seg = [['light', 'Terang', Sun], ['dark', 'Gelap', Moon], ['auto', 'Otomatis', Contrast]];
    return React.createElement(React.Fragment, null,
        React.createElement("div", { className: "sec-label" }, "Tampilan aplikasi"),
        React.createElement(ApRow, { icon: st.mode === 'light' || (st.mode === 'auto' && EJ.resolved === 'light') ? React.createElement(Sun, { size: 18 }) : React.createElement(Moon, { size: 18 }), title: "Mode tampilan", desc: "Terang, gelap, atau otomatis", value: modeLabel, onOpen: () => setDlg('mode') }),
        React.createElement(ApRow, { icon: React.createElement(Palette, { size: 18 }), title: "Tema warna", desc: "Warna dasar dan aksen aplikasi", value: th.name, dot: th.sw[0], onOpen: () => { setShowAllTheme(EJ.THEME_ORDER.indexOf(st.theme) >= 5); setDlg('theme'); } }),
        React.createElement(ApRow, { icon: React.createElement(TypeIcon, { size: 18 }), title: "Font aplikasi", desc: "Jenis huruf di seluruh aplikasi", value: fo.name, onOpen: () => { const ex = EJ.FONT_ORDER.indexOf(st.font) >= 6; setShowAllFont(ex); EJ.FONT_ORDER.slice(0, ex ? 12 : 6).forEach(EJ.preload); setDlg('font'); } }),
        dlg === 'mode' && React.createElement(ApDialog, { title: "Mode tampilan", onClose: close, note: "Otomatis mengikuti pengaturan terang/gelap di HP kamu. Perubahan langsung terlihat." },
            React.createElement("div", { className: "ap-seg" }, seg.map(([v, l, Ic]) => React.createElement("button", { type: "button", key: v, className: st.mode === v ? 'on' : '', onClick: () => EJ.set('mode', v) },
                React.createElement(Ic, { size: 18 }), React.createElement("span", null, l))))),
        dlg === 'theme' && React.createElement(ApDialog, { title: "Tema warna", onClose: close, note: "Tema berlaku di mode terang maupun gelap. Mode tampilan dipilih terpisah." },
            React.createElement("div", { className: "ap-list" },
                EJ.THEME_ORDER.slice(0, showAllTheme ? 10 : 5).map((k, i) => [
                    showAllTheme && (i === 0 || i === 5) && React.createElement("div", { className: "ap-grp", key: 'g' + i }, i === 0 ? "Berwarna" : "Hitam & putih"),
                    React.createElement("button", { type: "button", key: k, className: st.theme === k ? 'on' : '', onClick: () => EJ.set('theme', k) },
                        React.createElement("span", { className: "ap-sw" }, React.createElement("i", { style: { background: EJ.THEMES[k].sw[1] } }), React.createElement("i", { style: { background: EJ.THEMES[k].sw[0] } })),
                        React.createElement("span", { className: "ap-nm" }, EJ.THEMES[k].name),
                        React.createElement("i", { className: "ap-rad" }))]),
                React.createElement(ApMore, { open: showAllTheme, more: "Lihat selengkapnya \u00B7 5 lagi", onClick: () => setShowAllTheme(!showAllTheme) }))),
        dlg === 'font' && React.createElement(ApDialog, { title: "Font aplikasi", onClose: close, note: "Font dimuat dari internet saat pertama dipakai, lalu tersimpan. \u201CSistem\u201D selalu bisa dipakai tanpa internet." },
            React.createElement("div", { className: "ap-list" },
                EJ.FONT_ORDER.slice(0, showAllFont ? 12 : 6).map((k, i) => [
                    showAllFont && i === 6 && React.createElement("div", { className: "ap-grp", key: 'g' + i }, "Lainnya"),
                    React.createElement("button", { type: "button", key: k, className: (st.font === k ? 'on ' : '') + 'ap-font', style: { fontFamily: EJ.FONTS[k].css }, onClick: () => EJ.set('font', k) },
                        React.createElement("span", { className: "ap-nm" }, React.createElement("b", null, EJ.FONTS[k].name), React.createElement("small", null, EJ.FONTS[k].desc + " \u00B7 Rp 1.234 \u00B7 +$592.73")),
                        React.createElement("i", { className: "ap-rad" }))]),
                React.createElement(ApMore, { open: showAllFont, more: "Lihat selengkapnya \u00B7 6 lagi", onClick: () => { if (!showAllFont)
                        EJ.FONT_ORDER.forEach(EJ.preload); setShowAllFont(!showAllFont); } }))));
}
function ApMore({ open, more, onClick }) {
    return React.createElement("button", { type: "button", className: "ap-more", onClick: onClick },
        React.createElement("span", null, open ? "Lihat lebih sedikit" : more),
        React.createElement(ChevronDown, { size: 16, style: open ? { transform: 'rotate(180deg)' } : null }));
}
