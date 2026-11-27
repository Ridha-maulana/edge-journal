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
    return h(ApDialog, { title: "Efek tampilan", onClose: onClose, className: "ap-fx" },
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

/* Kecepatan & kelancaran (v5.12.8): paket Normal/Ringan/Ngebut, saklar satu per satu, laju layar (APK) */
const SPD_NAMES = ['Normal', 'Ringan', 'Ngebut'];
function speedLabel(EJ) { const m = EJ.speedMode(); return m < 0 ? 'Kustom' : SPD_NAMES[m]; }
function ApSpeedDialog({ EJ, st, onClose }) {
    const h = React.createElement, mode = EJ.speedMode();
    const [info, setInfo] = useState(null);
    useEffect(() => { let ok = true; EJ.refreshInfo().then(r => { if (ok) setInfo(r); }); return () => { ok = false; }; }, []);
    const MODES = [['Normal', 'Sparkles'], ['Ringan', 'Zap'], ['Ngebut', 'Zap']];
    const MD = ['Semua efek seperti sebelumnya.', 'Tanpa blur kaca dan bayangan, animasi singkat. Terasa lebih cepat di HP.', 'Tanpa blur, bayangan, dan animasi: paling cepat, tampilan paling polos.', 'Pengaturan diubah satu per satu.'];
    const flip = (k, on) => { EJ.set(k, on ? 0 : 1); };
    const ROWS = [
        ['nblur', 'Matikan blur kaca', 'Penyebab berat terbesar saat membuka halaman', 'Layers', !!st.nblur, () => flip('nblur', !!st.nblur)],
        ['nshd', 'Matikan bayangan', 'Kartu dan tombol tanpa bayangan lembut', 'FileText', !!st.nshd, () => flip('nshd', !!st.nshd)],
        ['nanim', 'Animasi singkat', 'Perpindahan halaman dan pop-up lebih cepat', 'Clock', st.nanim > 0, () => EJ.set('nanim', st.nanim > 0 ? 0 : 1)],
        ['hapf', 'Getar langsung saat ditekan', 'Getar terasa saat jari menyentuh, tanpa menunggu', 'Zap', !!st.hapf, () => flip('hapf', !!st.hapf)]
    ];
    const HZ = [0, 60, 90, 120], max = info && info.max || 0, can = info && info.ok;
    const note = !info ? '' : !info.native ? 'Pilihan laju layar hanya tersedia di aplikasi Android.' : !info.ok ? 'Aplikasi Android kamu belum mendukung ini. Pasang APK terbaru dulu.' : (max > 60 ? 'Layar HP-mu mendukung sampai ' + max + ' Hz. Pilihan ini meminta layar memakai laju itu untuk aplikasi ini, jadi gulir dan animasi lebih mulus.' : 'Layar HP-mu hanya mendukung 60 Hz.');
    return h(ApDialog, { title: "Kecepatan & kelancaran", onClose: onClose, className: "ap-sp" },
        h("div", { className: "fxm" },
            h("div", { className: "sp-lbl" }, "Mode kelancaran"),
            h("div", { className: "fxm-seg sp3" }, MODES.map(([t, ic], i) => h("button", { type: "button", key: t, className: mode === i ? 'on' : '', "aria-pressed": mode === i, onClick: () => EJ.setSpeedMode(i) }, h(Icon, { name: ic, size: 18 }), h("span", null, t)))),
            h("p", { className: "sp-desc" }, MD[mode < 0 ? 3 : mode]),
            h("div", { className: "sp-lbl" }, "Atur satu per satu"),
            h("div", { className: "fxm-list" }, ROWS.map(([k, t, d, ic, on, fn]) => h("button", { type: "button", key: k, className: "fxm-r" + (on ? ' on' : ''), role: "switch", "aria-checked": on, onClick: fn },
                h("i", null, h(Icon, { name: ic, size: 18 })), h("div", null, h("b", null, t), h("small", null, d)), h("span", { className: "fxm-sw" })))),
            h("div", { className: "sp-lbl" }, "Kecepatan layar", info && !can && info.native ? h("em", null, "Perlu APK baru") : null),
            h("div", { className: "fxm-seg sp4" }, HZ.map(v => { const off = v > 0 && (!can || (max && v > max)); return h("button", { type: "button", key: v, className: st.hz === v ? 'on' : '', disabled: off, style: off ? { opacity: .35 } : null, "aria-pressed": st.hz === v, onClick: () => EJ.setHz(v) }, h("span", null, v ? v + ' Hz' : 'Otomatis')); })),
            note && h("p", { className: "sp-desc" }, note)));
}
/* Efek permukaan kartu: 0 = standar (tampilan sekarang), 25 gaya (10 dasar + 15 doff) untuk kartu, header, dan menu bawah */
function sfcName(EJ, n) { const m = EJ.SFC[n]; return m ? m[0] : 'Standar'; }
function ApSfcDialog({ EJ, st, onClose }) {
    const h = React.createElement, cur = st.sfc | 0, S = EJ.SFC;
    const keys = S.map((m, k) => m ? k : 0).filter(Boolean);
    const pages = [];
    for (let i = 0; i < keys.length; i += 5) pages.push(keys.slice(i, i + 5));
    const start = Math.max(0, pages.findIndex(pg => pg.indexOf(cur) >= 0));
    const row = k => h("button", { type: "button", key: k, className: (cur === k ? 'on ' : '') + 'ap-font', "aria-pressed": cur === k, onClick: () => EJ.set('sfc', k) },
        h("span", { className: "sfc-pv ap-sq", "data-k": k }),
        h("span", { className: "ap-nm" }, h("b", null, S[k][0]), h("small", null, S[k][2] === 'doff' ? 'Doff' : 'Dasar')),
        h("i", { className: "ap-rad" }));
    return h(ApDialog, { title: "Efek permukaan", onClose: onClose, className: "ap-wide" },
        h("div", { className: "ap-list ap-top" },
            h("button", { type: "button", className: (cur === 0 ? 'on ' : '') + 'ap-font', "aria-pressed": cur === 0, onClick: () => EJ.set('sfc', 0) },
                h("span", { className: "ap-nm" }, h("b", null, "Standar")), h("i", { className: "ap-rad" })),
            h("button", { type: "button", className: "ap-font ap-sw" + (st.sfcg ? ' on' : ''), role: "switch", "aria-checked": !!st.sfcg, disabled: cur === 0, style: cur === 0 ? { opacity: .45 } : null, onClick: () => EJ.set('sfcg', st.sfcg ? 0 : 1) },
                h("span", { className: "ap-nm" }, h("b", null, "Latar berpendar")), h("span", { className: "fxm-sw" }))),
        h(ApPager, { pages: pages.map(pg => h("div", { className: "ap-list" }, pg.map(row))), titles: pages.map((_, i) => String(i + 1)), start: start }));
}
/* Latar aplikasi (v5.9.53): Standar = ikut tema/template halaman utama; selain itu latar tetap di belakang seluruh aplikasi. Sekali ketuk, latar langsung dipakai dan halaman ini tertutup. */
function bgName(EJ, k) { const w = EJ.WP && EJ.WP.BY[k]; return w ? w.name : 'Standar'; }
function ApBgDialog({ EJ, st, onClose }) {
    const h = React.createElement, WP = EJ.WP, cur = WP.BY[st.bg] ? st.bg : '';
    const [cat, setCat] = useState('semua');
    const items = cat === 'semua' ? WP.LIST : WP.LIST.filter(w => w.cat === cat), w0 = WP.BY[cur], auto = EJ.WP.auto(w0);
    const catName = k => (WP.CATS.find(c => c[0] === k) || [0, ''])[1];
    const pages = [];
    for (let i = 0; i < items.length; i += 5) pages.push(items.slice(i, i + 5));
    const start = Math.max(0, pages.findIndex(pg => pg.some(w => w.k === cur)));
    const row = (w, i) => h("button", { type: "button", key: w.k, className: (cur === w.k ? 'on ' : '') + 'ap-font', "aria-pressed": cur === w.k, onClick: () => EJ.set('bg', w.k) },
        h("span", { className: "bgx-im ap-th2", dangerouslySetInnerHTML: { __html: WP.thumb(w, 'r' + items.indexOf(w)) } }),
        h("span", { className: "ap-nm" }, h("b", null, w.name), h("small", null, catName(w.cat))),
        h("i", { className: "ap-rad" }));
    return h(ApDialog, { title: "Latar", onClose: onClose, className: "ap-wide" },
        h("div", { className: "bgx-cats", role: "tablist" }, [['semua', 'Semua']].concat(WP.CATS).map(([k, l]) => h("button", { type: "button", key: k, role: "tab", "aria-selected": cat === k, className: cat === k ? 'on' : '', onClick: () => setCat(k) }, l))),
        h("div", { className: "ap-list ap-top" }, h("button", { type: "button", className: (cur === '' ? 'on ' : '') + 'ap-font', "aria-pressed": cur === '', onClick: () => EJ.set('bg', '') },
            h("span", { className: "ap-nm" }, h("b", null, "Tanpa latar")), h("i", { className: "ap-rad" }))),
        h(ApPager, { key: cat, pages: pages.map(pg => h("div", { className: "ap-list" }, pg.map(row))), titles: pages.map((_, i) => String(i + 1)), start: cat === 'semua' ? start : 0 }),
        h("div", { className: "bgx-sl" + (cur === '' ? ' off' : '') },
            h("b", null, "Redup"),
            h("input", { type: "range", min: 0, max: 80, step: 5, value: st.bgd | 0, disabled: cur === '', "aria-label": "Redup latar", onChange: e => EJ.set('bgd', +e.target.value) }),
            h("span", null, (st.bgd | 0) + "%")));
}
function ApDialog({ title, note, noteEnd, onClose, children, className }) {
    useEffect(() => { const k = e => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, []);
    return ReactDOM.createPortal(React.createElement("div", { className: "modal-backdrop sheet-layer ap-bs", onClick: e => { if (e.target === e.currentTarget)
            onClose(); } },
        React.createElement("div", { className: "tsel-sheet ap-sheet ap-bsheet " + (className || ''), role: "dialog", "aria-modal": "true", "aria-label": title },
            React.createElement("div", { className: "ap-head" },
                React.createElement("h2", { className: "ap-ttl" }, title),
                React.createElement("button", { type: "button", className: "ap-x", "aria-label": "Tutup", onClick: onClose }, React.createElement(X, { size: 20 }))),
            React.createElement("div", { className: "ap-body" },
                note && !noteEnd && React.createElement("p", { className: "ap-note ap-note-top" }, note),
                children,
                note && noteEnd && React.createElement("p", { className: "ap-note" }, note)))), document.body);
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
        React.createElement("div", { className: "ap-pn" },
            React.createElement("button", { type: "button", className: "ap-nb", "aria-label": "Halaman sebelumnya", disabled: idx <= 0, onClick: () => go(idx - 1) }, React.createElement(ChevronLeft, { size: 20 })),
            React.createElement("span", { className: "ap-pc2" }, (idx + 1) + " / " + pages.length),
            React.createElement("button", { type: "button", className: "ap-nb", "aria-label": "Halaman berikutnya", disabled: idx >= pages.length - 1, onClick: () => go(idx + 1) }, React.createElement(ChevronRight, { size: 20 }))));
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
    return React.createElement(ApDialog, { title: "Warna sendiri", onClose: onClose, className: "ap-custom", noteEnd: true, note: "Ketik kode warna (mis. #0a0a0a), pilih lingkaran warna, atau sentuh + untuk memilih bebas. Latar gelap otomatis punya versi terang yang serasi (dan sebaliknya). Perubahan langsung terlihat." },
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

function AppearanceRows({ homeT, onHome, headerVariant, onHeaderVariant, navVariant, onNavVariant, openDlg, scrollTo }) {
    const EJ = useAppearance();
    const [dlg, setDlg] = useState(openDlg || null);
    /* dari pencarian di halaman Tools: gulir ke bagian Header & menu */
    useEffect(() => { if (!scrollTo) return; const t = setTimeout(() => { const el = [].slice.call(document.querySelectorAll('.sec-label')).find(n => n.textContent === scrollTo); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'start' }); }, 60); return () => clearTimeout(t); }, []);
    const st = EJ.state, th = EJ.THEMES[st.theme], fo = EJ.FONTS[st.font];
    const modeLabel = { light: 'Terang', dark: 'Gelap', auto: 'Otomatis' }[st.mode];
    const close = () => setDlg(null);
    const [sure, setSure] = useState(false);
    useEffect(() => { if (!sure) return; const t = setTimeout(() => setSure(false), 4000); return () => clearTimeout(t); }, [sure]);
    function resetAll() {
        if (!sure) { setSure(true); return; }
        setSure(false);
        EJ.set('mode', 'dark'); EJ.set('theme', 'mint'); EJ.set('font', 'manrope'); EJ.set('sfc', 0); EJ.set('sfcg', 0); EJ.set('bg', ''); EJ.set('bgd', 20); EJ.setSpeedMode(0);
        EJ.FX_KEYS.forEach(k => EJ.setFx(k, ['latar', 'kartu', 'tombol', 'ikon', 'hdr', 'gerak'].indexOf(k) >= 0));
        onHome && onHome(0); onHeaderVariant && onHeaderVariant(0); onNavVariant && onNavVariant(0);
    }
    const seg = [['light', 'Terang', Sun], ['dark', 'Gelap', Moon], ['auto', 'Otomatis', Contrast]];
    const chunk = (arr, n) => { const o = []; for (let i = 0; i < arr.length; i += n)
        o.push(arr.slice(i, i + n)); return o; };
    const themeKeys = chunk(EJ.THEME_ORDER, 6), fontKeys = chunk(EJ.FONT_ORDER, 6);
    const startT = Math.max(0, themeKeys.findIndex(p => p.indexOf(st.theme) >= 0)), startF = Math.max(0, fontKeys.findIndex(p => p.indexOf(st.font) >= 0));
    const themePages = themeKeys.map(p => React.createElement("div", { className: "ap-list" }, p.map(k => {
        const t = EJ.THEMES[k], cust = k === 'custom';
        return React.createElement("button", { type: "button", key: k, className: (st.theme === k ? 'on ' : '') + 'ap-th', onClick: () => { if (cust) {
                EJ.setCustom({});
                setDlg('custom');
            }
            else
                EJ.set('theme', k); } },
            cust ? React.createElement("span", { className: "ap-sw3 cust" }, "+") : React.createElement("span", { className: "ap-sw3" }, React.createElement("i", { style: { background: t.lt[0] } }), React.createElement("i", { style: { background: '#fff' } }), React.createElement("i", { style: { background: t.grad[0] } })),
            React.createElement("span", { className: "ap-nm" }, React.createElement("b", null, t.name), React.createElement("small", null, t.tag)),
            cust ? React.createElement("span", { className: "ap-edit" }, "\u270E") : React.createElement("i", { className: "ap-rad" }));
    })));
    const fontPages = fontKeys.map(p => React.createElement("div", { className: "ap-list" }, p.map(k => React.createElement("button", { type: "button", key: k, className: (st.font === k ? 'on ' : '') + 'ap-font', style: { fontFamily: EJ.FONTS[k].css }, onClick: () => EJ.set('font', k) },
        React.createElement("span", { className: "ap-nm" }, React.createElement("b", null, EJ.FONTS[k].name), React.createElement("small", null, EJ.FONTS[k].desc)),
        React.createElement("i", { className: "ap-rad" })))));
    const preFont = i => { [i - 1, i, i + 1].forEach(j => { if (fontKeys[j])
        fontKeys[j].forEach(EJ.preload); }); };
    return React.createElement(React.Fragment, null,
        React.createElement("div", { className: "sec-label" }, "Umum"),
        React.createElement(ApRow, { icon: React.createElement(Home, { size: 18 }), title: "Halaman utama", desc: "Template lengkap: header, isi, dan menu bawah", value: (HOME_LIST.find(x => x[0] === (homeT || 0)) || HOME_LIST[0])[1].replace(/^Template (\d) · /, 'T$1 · ').replace(' (sekarang)', ''), onOpen: () => setDlg('home') }),
        React.createElement(ApRow, { icon: st.mode === 'light' || (st.mode === 'auto' && EJ.resolved === 'light') ? React.createElement(Sun, { size: 18 }) : React.createElement(Moon, { size: 18 }), title: "Mode tampilan", desc: "Terang, gelap, atau otomatis", value: modeLabel, onOpen: () => setDlg('mode') }),
        React.createElement("div", { className: "sec-label" }, "Warna & huruf"),
        React.createElement(ApRow, { icon: React.createElement(Palette, { size: 18 }), title: "Tema aplikasi", desc: "78 tema, masing-masing terang & gelap", value: th.name, dot: th.grad[0], onOpen: () => setDlg('theme') }),
        React.createElement(ApRow, { icon: React.createElement(TypeIcon, { size: 18 }), title: "Font aplikasi", desc: "Jenis huruf di seluruh aplikasi", value: fo.name, onOpen: () => { preFont(startF); setDlg('font'); } }),
        React.createElement("div", { className: "sec-label" }, "Efek & latar"),
        React.createElement(ApRow, { icon: React.createElement(Sparkles, { size: 18 }), title: "Efek tampilan", desc: "Kartu, tombol, ikon, latar, dan gerak: pilih semua atau satu per satu", value: fxCount(st), onOpen: () => setDlg('fx') }),
        React.createElement(ApRow, { icon: React.createElement(Layers, { size: 18 }), title: "Efek permukaan kartu", desc: "Doff, solid, transparan, bayangan: kartu, header, dan menu bawah", value: sfcName(EJ, st.sfc | 0), onOpen: () => setDlg('sfc') }),
        React.createElement(ApRow, { icon: React.createElement(Icon, { name: "Image", size: 18 }), title: "Latar aplikasi", desc: "Warna dasar, doff, kaca, anime, atau pola di belakang aplikasi", value: bgName(EJ, st.bg), onOpen: () => setDlg('bg') }),
        React.createElement("div", { className: "sec-label" }, "Kecepatan"),
        React.createElement(ApRow, { icon: React.createElement(Icon, { name: "Zap", size: 18 }), title: "Kecepatan & kelancaran", desc: "Mode ringan, animasi, getar, dan laju layar", value: speedLabel(EJ), onOpen: () => setDlg('speed') }),
        React.createElement("div", { className: "sec-label" }, "Header & menu"),
        React.createElement(HeaderPicker, { value: headerVariant || 0, onChange: onHeaderVariant }),
        React.createElement(NavPicker, { value: navVariant || 0, onChange: onNavVariant }),
        React.createElement("button", { type: "button", className: "ap-reset" + (sure ? ' sure' : ''), onClick: resetAll }, sure ? "Ketuk lagi untuk mengembalikan" : "Kembalikan tampilan standar"),
        dlg === 'home' && React.createElement(ApDialog, { title: "Template beranda", onClose: close, className: "ap-wide", note: "Template mengganti header, isi, dan menu bawah sekaligus. Header dan menu bawah masih bisa dipilih sendiri." },
            React.createElement("div", { className: "ap-list" }, HOME_LIST.map(([v, l]) => React.createElement("button", { type: "button", key: v, className: ((homeT || 0) === v ? 'on ' : '') + 'ap-font', onClick: () => { onHome && onHome(v); } },
                React.createElement("span", { className: "ap-nm" }, React.createElement("b", null, l.replace(' (sekarang)', ''))), React.createElement("i", { className: "ap-rad" }))))),
        dlg === 'fx' && React.createElement(ApFxDialog, { EJ: EJ, st: st, onClose: close }),
        dlg === 'speed' && React.createElement(ApSpeedDialog, { EJ: EJ, st: st, onClose: close }),
        dlg === 'sfc' && React.createElement(ApSfcDialog, { EJ: EJ, st: st, onClose: close }),
        dlg === 'bg' && React.createElement(ApBgDialog, { EJ: EJ, st: st, onClose: close }),
        dlg === 'mode' && React.createElement(ApDialog, { title: "Mode tampilan", onClose: close, className: "ap-wide" },
            React.createElement("div", { className: "ap-list" }, [['auto', 'Otomatis', 'Ikuti pengaturan terang/gelap di HP', Contrast], ['light', 'Terang', 'Latar terang, teks gelap', Sun], ['dark', 'Gelap', 'Latar gelap, teks terang', Moon]].map(([v, l, d, Ic]) => React.createElement("button", { type: "button", key: v, className: (st.mode === v ? 'on ' : '') + 'ap-font', onClick: () => EJ.set('mode', v) },
                React.createElement("span", { className: "ap-ic" }, React.createElement(Ic, { size: 18 })),
                React.createElement("span", { className: "ap-nm" }, React.createElement("b", null, l), React.createElement("small", null, d)), React.createElement("i", { className: "ap-rad" }))))),
        dlg === 'theme' && React.createElement(ApDialog, { title: "Tema warna", onClose: close, className: "ap-wide" },
            React.createElement(ApPager, { pages: themePages, titles: themeKeys.map((_, i) => String(i + 1)), start: startT })),
        dlg === 'custom' && React.createElement(CustomEditor, { EJ: EJ, onClose: close }),
        dlg === 'font' && React.createElement(ApDialog, { title: "Font", onClose: close, className: "ap-wide" },
            React.createElement(ApPager, { pages: fontPages, titles: fontKeys.map((_, i) => String(i + 1)), start: startF, onPage: preFont })));
}

/* Baris di Tools: ringkasan pengaturan sekarang dalam bentuk chip (v5.9.97) */
function AppearanceEntry({ onOpen }) {
    const EJ = useAppearance(), st = EJ.state, th = EJ.THEMES[st.theme], fo = EJ.FONTS[st.font];
    const mode = { light: 'Terang', dark: 'Gelap', auto: 'Otomatis' }[st.mode];
    return React.createElement("button", { type: "button", className: "pick-row sp-entry", onClick: onOpen },
        React.createElement("span", { className: "pick-ic" }, React.createElement(Icon, { name: "Paintbrush", size: 18 })),
        React.createElement("span", { className: "pick-tx" }, React.createElement("b", null, "Tampilan aplikasi"),
            React.createElement("span", { className: "sp-chips" }, React.createElement("u", null, mode), React.createElement("u", null, th ? th.name : ''), React.createElement("u", null, fo ? fo.name : ''))),
        React.createElement(ChevronRight, { size: 18 }));
}

/* Indeks pencarian pengaturan Tampilan (dipakai kolom cari di halaman Tools).
   Tiap entri: judul, jalur, kata kunci tambahan, dan tujuan (dlg = dialog yang dibuka, scroll = judul bagian yang digulir). */
function apSearchIndex(EJ) {
    const out = [], add = (title, sub, key, dlg, scroll) => out.push({ title, sub, key: key || '', dlg: dlg || null, scroll: scroll || null });
    add('Halaman utama', 'Tampilan \u203A Umum', 'template beranda dasbor', 'home');
    add('Mode tampilan', 'Tampilan \u203A Umum', 'terang gelap otomatis dark light siang malam', 'mode');
    add('Tema aplikasi', 'Tampilan \u203A Warna & huruf', 'warna tema', 'theme');
    add('Font aplikasi', 'Tampilan \u203A Warna & huruf', 'huruf jenis tulisan', 'font');
    add('Efek tampilan', 'Tampilan \u203A Efek & latar', 'efek semua tanpa efek', 'fx');
    FX_ROWS.forEach(r => add(r[1], 'Tampilan \u203A Efek tampilan', r[2], 'fx'));
    add('Efek permukaan kartu', 'Tampilan \u203A Efek & latar', 'doff solid transparan bayangan kaca permukaan', 'sfc');
    (EJ.SFC || []).forEach(m => { if (m && m[0]) add(m[0], 'Tampilan \u203A Efek permukaan kartu', 'efek permukaan kartu', 'sfc'); });
    add('Latar aplikasi', 'Tampilan \u203A Efek & latar', 'wallpaper background kaca anime pola warna dasar', 'bg');
    ((EJ.WP && EJ.WP.LIST) || []).forEach(w => add(w.name, 'Tampilan \u203A Latar aplikasi', 'latar ' + (w.cat || ''), 'bg'));
    add('Tampilan header', 'Tampilan \u203A Header & menu', 'gaya header atas', null, 'Header & menu');
    add('Tampilan menu bawah', 'Tampilan \u203A Header & menu', 'gaya menu bar navigasi bawah', null, 'Header & menu');
    (EJ.THEME_ORDER || []).forEach(k => { const t = EJ.THEMES[k]; if (t && k !== 'custom') add(t.name, 'Tampilan \u203A Tema aplikasi', 'tema warna ' + (t.tag || ''), 'theme'); });
    (EJ.FONT_ORDER || []).forEach(k => { const f = EJ.FONTS[k]; if (f) add(f.name, 'Tampilan \u203A Font aplikasi', 'font huruf ' + (f.desc || ''), 'font'); });
    HOME_LIST.forEach(([v, l]) => add(l.replace(' (sekarang)', ''), 'Tampilan \u203A Halaman utama', 'template beranda', 'home'));
    return out;
}
