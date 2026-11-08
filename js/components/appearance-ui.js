/* Bagian "Tampilan aplikasi" di halaman Tools: mode (terang/gelap/otomatis), tema warna (geser ke samping), warna sendiri, font */
"use strict";
function useAppearance() {
    const [, bump] = useState(0);
    useEffect(() => { const f = () => bump(n => n + 1); window.addEventListener('ej-appearance', f); return () => window.removeEventListener('ej-appearance', f); }, []);
    return window.EJ;
}
/* Efek tampilan: 7 saklar terpisah + pilihan cepat. Pratinjau mengikuti saklar. */
const FX_ROWS = [
    ['latar', 'Efek latar', 'Cahaya lembut di latar halaman', 'Moon'],
    ['kartu', 'Efek kartu', 'Bayangan, gradasi halus, tepi bercahaya', 'FileText'],
    ['tombol', 'Efek tombol', 'Tombol gradasi + cahaya, efek saat ditekan', 'SlidersHorizontal'],
    ['ikon', 'Efek ikon kartu', 'Ikon kartu berwarna sendiri, kotak bercahaya', 'Star'],
    ['hdr', 'Efek ikon header', 'Ikon header berwarna sendiri', 'CalendarDays'],
    ['nav', 'Efek ikon menu', 'Ikon menu bawah berwarna sendiri', 'BookOpen'],
    ['gerak', 'Efek gerak', 'Kartu muncul halus dan animasi saat ditekan', 'Clock']
];
const FX_MINI = { hdr: ['CalendarDays', 'UserRound'], nav: ['BarChart3', 'BookOpen', 'SlidersHorizontal', 'UserRound'] };
const FX_NAVC = ['#3b82f6', '#f59e0b', '#06b6d4', '#f97316'];
function fxCount(st) { const n = EJ_FX_KEYS().filter(k => st.fxs[k]).length; return n === 0 ? 'Tanpa efek' : n === EJ_FX_KEYS().length ? 'Semua efek' : n + ' efek aktif'; }
function EJ_FX_KEYS() { return window.EJ.FX_KEYS; }
function ApFxDialog({ EJ, st, onClose }) {
    const h = React.createElement, f = st.fxs, n = EJ.FX_KEYS.filter(k => f[k]).length, all = n === EJ.FX_KEYS.length, none = n === 0;
    return h(ApDialog, { title: "Efek tampilan", onClose: onClose, note: "Nyalakan semua, matikan semua, atau pilih sendiri efek mana yang dipakai. Perubahan langsung terlihat." },
        h("div", { className: "fxm" },
            h("div", { className: "fxm-seg" },
                h("button", { type: "button", className: none ? 'on' : '', onClick: () => EJ.setFxAll(false) }, h(SlidersHorizontal, { size: 18 }), h("span", null, "Tanpa efek")),
                h("button", { type: "button", className: all ? 'on' : '', onClick: () => EJ.setFxAll(true) }, h(Sparkles, { size: 18 }), h("span", null, "Semua efek"))),
            h("div", { className: "fxm-pv", "data-l": f.latar ? 1 : 0, "data-k": f.kartu ? 1 : 0, "data-b": f.tombol ? 1 : 0, "data-i": f.ikon ? 1 : 0 },
                h("small", null, "PRATINJAU"),
                h("div", { className: "fxm-card" },
                    h("span", { className: "fxm-t" }, h(Icon, { name: "Trophy", size: 22 })),
                    h("div", { className: "fxm-tx" }, h("b", null, "Win Rate"), h("span", null, "88%")),
                    h("span", { className: "fxm-bt" }, "Lihat"))),
            h("div", { className: "fxm-list" }, FX_ROWS.map(([k, t, d, ic]) => h("button", { type: "button", key: k, className: "fxm-r" + (f[k] ? ' on' : ''), role: "switch", "aria-checked": !!f[k], onClick: () => EJ.setFx(k, !f[k]) },
                h("i", null, h(Icon, { name: ic, size: 18 })),
                h("div", null, h("b", null, t), h("small", null, d)),
                FX_MINI[k] && h("span", { className: "fxm-mini" }, FX_MINI[k].map((nm, j) => h("span", { key: nm, style: { color: f[k] ? (k === 'nav' ? FX_NAVC[j] : ICON_COLORS[nm]) : 'var(--ej-ik)', opacity: f[k] ? 1 : .55 } }, h(Icon, { name: nm, size: 15 })))),
                h("span", { className: "fxm-sw" }))))));
}
function ApDialog({ title, note, onClose, children, className }) {
    return ReactDOM.createPortal(React.createElement("div", { className: "modal-backdrop center top sheet-layer", onClick: e => { if (e.target === e.currentTarget)
            onClose(); } },
        React.createElement("div", { className: "tsel-sheet ap-sheet " + (className || '') },
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
/* Daftar yang bisa digeser ke samping: tiap halaman berisi 5 pilihan, titik di bawah menunjukkan halaman */
function ApPager({ pages, titles, start, onPage }) {
    const ref = useRef(null);
    const [idx, setIdx] = useState(start || 0);
    const step = () => { const el = ref.current; if (!el || !el.children.length)
        return 1; const a = el.children[0], b = el.children[1]; return b ? b.offsetLeft - a.offsetLeft : a.offsetWidth; };
    useEffect(() => { const el = ref.current; if (el && start)
        el.scrollLeft = start * step(); }, []);
    const onScroll = () => { const el = ref.current; if (!el)
        return; const i = Math.max(0, Math.min(pages.length - 1, Math.round(el.scrollLeft / step()))); if (i !== idx) {
        setIdx(i);
        if (onPage)
            onPage(i);
    } };
    const go = i => { const el = ref.current; if (el)
        el.scrollTo({ left: i * step(), behavior: 'smooth' }); };
    return React.createElement(React.Fragment, null,
        React.createElement("div", { className: "ap-pager", ref: ref, onScroll: onScroll }, pages.map((pg, i) => React.createElement("div", { className: "ap-page", key: i },
            React.createElement("div", { className: "ap-grp" }, React.createElement("span", null, titles[i]), React.createElement("span", null, React.createElement("b", null, i + 1), " / ", pages.length)),
            pg))),
        React.createElement("div", { className: "ap-dots" }, pages.map((_, i) => React.createElement("button", { type: "button", key: i, "aria-label": "Halaman " + (i + 1), className: i === idx ? 'on' : '', onClick: () => go(i) }))),
        React.createElement("div", { className: "ap-swipe" }, "← geser ke samping →"));
}
function apInk(h) { const v = [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16) / 255).map(c => c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4)); const L = .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; return L > .4 ? '#111' : '#fff'; }
const AP_BGS = ['#000000', '#0a0a0a', '#121212', '#1a1a1a', '#1c1c1e', '#0e1320', '#f4f3ef', '#e8e9eb'];
const AP_ACS = ['#cfd0d4', '#c9c6bf', '#9fb0d6', '#86c79a', '#d4a574', '#7fb4d9', '#6ccbc3', '#f7af5c'];
function ColorField({ label, value, presets, onChange }) {
    const [txt, setTxt] = useState(value);
    useEffect(() => { setTxt(value); }, [value]);
    const norm = v => { v = String(v).trim(); if (v[0] !== '#')
        v = '#' + v; if (/^#[0-9a-f]{3}$/i.test(v))
        v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]; return v; };
    const ok = window.EJ.validHex(norm(txt));
    const typed = v => { setTxt(v); const n = norm(v); if (window.EJ.validHex(n))
        onChange(n.toLowerCase()); };
    return React.createElement("div", { className: "ap-cf" },
        React.createElement("div", { className: "ap-cl" }, label),
        React.createElement("div", { className: "ap-cr" },
            presets.map(c => React.createElement("button", { type: "button", key: c, className: "ap-cd" + (c === value ? ' on' : ''), style: { background: c }, "aria-label": c, onClick: () => onChange(c) })),
            React.createElement("label", { className: "ap-cd ap-pick", title: "Pilih warna bebas" }, "+", React.createElement("input", { type: "color", value: value, onChange: e => onChange(e.target.value.toLowerCase()) }))),
        React.createElement("div", { className: "ap-hexrow" },
            React.createElement("i", { className: "ap-hsw", style: { background: value } }),
            React.createElement("input", { className: "ap-hex" + (ok ? '' : ' bad'), value: txt, maxLength: 7, spellCheck: false, autoCapitalize: "off", autoCorrect: "off", placeholder: "#RRGGBB", onChange: e => typed(e.target.value), "aria-label": "Kode warna " + label })));
}
function CustomEditor({ EJ, onClose }) {
    const c = EJ.custom, mode = EJ.resolved, pv = EJ.preview(c.bg, c.ac, mode);
    return React.createElement(ApDialog, { title: "Warna sendiri", onClose: onClose, className: "ap-custom", note: "Ketik kode warna (mis. #0a0a0a), pilih lingkaran warna, atau sentuh + untuk memilih bebas. Latar gelap otomatis punya versi terang yang serasi (dan sebaliknya). Perubahan langsung terlihat." },
        React.createElement("div", { className: "ap-prev", style: { background: pv.bg, borderColor: pv.bd } },
            React.createElement("div", { className: "ap-pc", style: { background: pv.pn, borderColor: pv.bd, color: pv.tx } },
                React.createElement("b", null, "Tahun 2026"), React.createElement("small", { style: { color: pv.mu } }, "77 posisi · +$592.73"),
                React.createElement("span", { className: "ap-pb", style: { background: pv.ac, color: pv.on } }, "Simpan trade"))),
        React.createElement(ColorField, { label: "Latar", value: c.bg, presets: AP_BGS, onChange: v => EJ.setCustom({ bg: v }) }),
        React.createElement(ColorField, { label: "Aksen", value: c.ac, presets: AP_ACS, onChange: v => EJ.setCustom({ ac: v }) }),
        React.createElement("div", { className: "ap-foot" },
            React.createElement("button", { type: "button", onClick: () => EJ.setCustom({ bg: '#0a0a0a', ac: '#c9c6bf' }) }, "Atur ulang"),
            React.createElement("button", { type: "button", className: "ok", onClick: onClose }, "Selesai")));
}

function AppearanceRows({ homeT, onHome, headerVariant, onHeaderVariant, navVariant, onNavVariant }) {
    const EJ = useAppearance();
    const [dlg, setDlg] = useState(null);
    const st = EJ.state, th = EJ.THEMES[st.theme], fo = EJ.FONTS[st.font];
    const modeLabel = { light: 'Terang', dark: 'Gelap', auto: 'Otomatis' }[st.mode];
    const close = () => setDlg(null);
    const seg = [['light', 'Terang', Sun], ['dark', 'Gelap', Moon], ['auto', 'Otomatis', Contrast]];
    const chunk = (arr, n) => { const o = []; for (let i = 0; i < arr.length; i += n)
        o.push(arr.slice(i, i + n)); return o; };
    const themeKeys = chunk(EJ.THEME_ORDER, 5), fontKeys = chunk(EJ.FONT_ORDER, 5);
    const startT = Math.max(0, themeKeys.findIndex(p => p.indexOf(st.theme) >= 0)), startF = Math.max(0, fontKeys.findIndex(p => p.indexOf(st.font) >= 0));
    const themePages = themeKeys.map(p => React.createElement("div", { className: "ap-list" }, p.map(k => {
        const t = EJ.THEMES[k], cust = k === 'custom';
        return React.createElement("button", { type: "button", key: k, className: (st.theme === k ? 'on ' : '') + 'ap-th', onClick: () => { if (cust) {
                EJ.setCustom({});
                setDlg('custom');
            }
            else
                EJ.set('theme', k); } },
            React.createElement("span", { className: "ap-no", style: cust ? { background: 'conic-gradient(#ff5d5d,#ffd45d,#5dff8a,#5dd6ff,#6a7bff,#ff5dd1,#ff5d5d)', color: '#111' } : { background: t.grad[0], color: apInk(t.grad[0]) } }, cust ? "+" : String(t.no).padStart(2, '0')),
            React.createElement("span", { className: "ap-nm" }, React.createElement("b", null, t.name), React.createElement("small", null, t.tag)),
            React.createElement("span", { className: "ap-pair" }, React.createElement("i", { style: { background: cust ? EJ.custom.bg : t.lt[0] } }), React.createElement("i", { style: { background: cust ? EJ.custom.ac : t.dk[0] } }), React.createElement("i", { style: { background: cust ? EJ.custom.ac : t.dk[3] } })),
            cust ? React.createElement("span", { className: "ap-edit" }, "\u270E") : React.createElement("i", { className: "ap-rad" }));
    })));
    const fontPages = fontKeys.map(p => React.createElement("div", { className: "ap-list" }, p.map(k => React.createElement("button", { type: "button", key: k, className: (st.font === k ? 'on ' : '') + 'ap-font', style: { fontFamily: EJ.FONTS[k].css }, onClick: () => EJ.set('font', k) },
        React.createElement("span", { className: "ap-nm" }, React.createElement("b", null, EJ.FONTS[k].name), React.createElement("small", null, EJ.FONTS[k].desc + " · Rp 1.234 · +$592.73")),
        React.createElement("i", { className: "ap-rad" })))));
    const preFont = i => { [i - 1, i, i + 1].forEach(j => { if (fontKeys[j])
        fontKeys[j].forEach(EJ.preload); }); };
    return React.createElement(React.Fragment, null,
        React.createElement("div", { className: "sec-label" }, "Tampilan aplikasi"),
        React.createElement(ApRow, { icon: React.createElement(Home, { size: 18 }), title: "Halaman utama", desc: "Template lengkap: header, isi, dan menu bawah", value: (HOME_LIST.find(x => x[0] === (homeT || 0)) || HOME_LIST[0])[1].replace(/^Template (\d) · /, 'T$1 · ').replace(' (sekarang)', ''), onOpen: () => setDlg('home') }),
        React.createElement(ApRow, { icon: st.mode === 'light' || (st.mode === 'auto' && EJ.resolved === 'light') ? React.createElement(Sun, { size: 18 }) : React.createElement(Moon, { size: 18 }), title: "Mode tampilan", desc: "Terang, gelap, atau otomatis", value: modeLabel, onOpen: () => setDlg('mode') }),
        React.createElement(ApRow, { icon: React.createElement(Palette, { size: 18 }), title: "Tema aplikasi", desc: "78 tema, masing-masing terang & gelap", value: th.name, dot: th.grad[0], onOpen: () => setDlg('theme') }),
        React.createElement(ApRow, { icon: React.createElement(TypeIcon, { size: 18 }), title: "Font aplikasi", desc: "Jenis huruf di seluruh aplikasi", value: fo.name, onOpen: () => { preFont(startF); setDlg('font'); } }),
        React.createElement(ApRow, { icon: React.createElement(Sparkles, { size: 18 }), title: "Efek tampilan", desc: "Kartu, tombol, ikon, latar, dan gerak: pilih semua atau satu per satu", value: fxCount(st), onOpen: () => setDlg('fx') }),
        React.createElement(HeaderPicker, { value: headerVariant || 0, onChange: onHeaderVariant }),
        React.createElement(NavPicker, { value: navVariant || 0, onChange: onNavVariant }),
        dlg === 'home' && React.createElement(ApDialog, { title: "Halaman utama", onClose: close, className: "ap-wide", note: "Template mengganti header, isi, dan menu bawah sekaligus. Warna, mode, font, dan efek kartu tetap mengikuti pilihanmu. Header dan menu bawah masih bisa dipilih sendiri di bawah." },
            React.createElement("div", { className: "ap-list" }, HOME_LIST.map(([v, l]) => React.createElement("button", { type: "button", key: v, className: ((homeT || 0) === v ? 'on ' : '') + 'ap-font', onClick: () => { onHome && onHome(v); close(); } },
                React.createElement("span", { className: "ap-nm" }, React.createElement("b", null, l.replace(' (sekarang)', '')), React.createElement("small", null, v === 0 ? "Tampilan Edge Journal sekarang" : ({ 1: "Biru, tabel trade & donat P&L", 2: "Hijau lembut, area chart", 5: "Hijau bersih, grafik batang", 6: "Kaca buram, kandel" })[v])), React.createElement("i", { className: "ap-rad" }))))),
        dlg === 'fx' && React.createElement(ApFxDialog, { EJ: EJ, st: st, onClose: close }),
        dlg === 'mode' && React.createElement(ApDialog, { title: "Mode tampilan", onClose: close, note: "Otomatis mengikuti pengaturan terang/gelap di HP kamu. Perubahan langsung terlihat." },
            React.createElement("div", { className: "ap-seg" }, seg.map(([v, l, Ic]) => React.createElement("button", { type: "button", key: v, className: st.mode === v ? 'on' : '', onClick: () => EJ.set('mode', v) },
                React.createElement(Ic, { size: 18 }), React.createElement("span", null, l))))),
        dlg === 'theme' && React.createElement(ApDialog, { title: "Tema aplikasi", onClose: close, className: "ap-wide", note: "Setiap tema punya warna terang dan gelap sendiri. Pilih terang/gelap/otomatis di Mode tampilan." },
            React.createElement(ApPager, { pages: themePages, titles: themeKeys.map((p, i) => p.indexOf('custom') >= 0 ? (p.length > 1 ? "Tema " + (i * 5 + 1) + "\u2013" + (i * 5 + p.length - 1) + " & kustom" : "Kustom") : "Tema " + (i * 5 + 1) + "\u2013" + (i * 5 + 5)), start: startT })),
        dlg === 'custom' && React.createElement(CustomEditor, { EJ: EJ, onClose: close }),
        dlg === 'font' && React.createElement(ApDialog, { title: "Font aplikasi", onClose: close, className: "ap-wide", note: "Font dimuat dari internet saat pertama dipakai, lalu tersimpan. “Sistem” selalu bisa dipakai tanpa internet." },
            React.createElement(ApPager, { pages: fontPages, titles: fontKeys.map((_, i) => "Font " + (i * 5 + 1) + "–" + (i * 5 + 5)), start: startF, onPage: preFont })));
}
