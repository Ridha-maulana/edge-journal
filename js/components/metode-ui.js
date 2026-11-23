/* Halaman baca Metode Satu Warna: bagian lipat, tab Buy/Sell, dan ubah teks (v5.10.6) */
"use strict";
function MetodePage({ onBack, sec, tab }) {
    const M = window.METODE, d = M.useMetode();
    const [open, setOpen] = useState(() => { const o = {}; if (sec) o[sec] = true; else { o[1] = true; o[3] = true; } return o; });
    const [side, setSide] = useState(tab === 'sell' ? 'sell' : 'buy');
    const [edit, setEdit] = useState(false);
    const [draft, setDraft] = useState({});
    const [ask, setAsk] = useState(false);
    useEffect(() => {
        if (!sec) return;
        const t = setTimeout(() => { const el = document.querySelector('.mt-ac[data-n="' + sec + '"]'); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 60);
        return () => clearTimeout(t);
    }, []);
    useEffect(() => {
        const k = e => { if (e.key === 'Escape') { if (edit) setEdit(false); else onBack(); } };
        document.addEventListener('keydown', k);
        return () => document.removeEventListener('keydown', k);
    }, [edit]);
    const allOpen = M.SECS.every(s => open[s.n]);
    const toggle = n => setOpen({ ...open, [n]: !open[n] });
    const toAll = () => { const o = {}; if (!allOpen) M.SECS.forEach(s => { o[s.n] = true; }); setOpen(o); };
    const startEdit = () => { const x = {}; Object.keys(M.TYPES).forEach(k => { x[k] = M.toText(k, d[k]); }); setDraft(x); setAsk(false); setEdit(true); try { window.scrollTo(0, 0); } catch (e) { } };
    const doSave = () => { const n = {}; Object.keys(M.TYPES).forEach(k => { n[k] = M.fromText(k, draft[k]); }); M.save(n); setEdit(false); try { window.scrollTo(0, 0); } catch (e) { } };
    const doReset = () => { M.save(null); setEdit(false); setAsk(false); try { window.scrollTo(0, 0); } catch (e) { } };
    const pairs = (arr, cls) => arr.map((p, i) => React.createElement("div", { key: i, className: cls }, React.createElement("b", null, p[0]), p[1] && React.createElement("p", null, p[1])));
    const steps = arr => arr.map((x, i) => React.createElement("div", { key: i, className: "mt-st" }, React.createElement("span", null, i + 1), React.createElement("p", null, x)));
    if (edit)
        return React.createElement("section", { className: "mt" },
            React.createElement("div", { className: "sp-head" },
                React.createElement("button", { type: "button", className: "sp-back", "aria-label": "Batal", onClick: () => setEdit(false) }, React.createElement(ChevronLeft, { size: 24 })),
                React.createElement("h1", { style: { margin: '0 44px 0 0' } }, "Ubah metode")),
            React.createElement("p", { className: "mt-help" }, "Ubah teks seperlunya. Perubahan tersimpan di akun ini dan ikut tersinkron ke perangkat lain."),
            M.SECS.map(s => React.createElement("div", { key: s.n, className: "mt-eg" },
                React.createElement("div", { className: "mt-eh" }, React.createElement("span", { className: "mt-nn" }, s.n), React.createElement("b", null, s.title)),
                s.fields.map(f => React.createElement("label", { key: f[0], className: "mt-ef" },
                    React.createElement("span", null, f[1]),
                    f[2] && React.createElement("small", null, f[2]),
                    React.createElement("textarea", { value: draft[f[0]] || '', rows: Math.min(10, Math.max(2, (draft[f[0]] || '').split('\n').length + 1)), onChange: e => setDraft({ ...draft, [f[0]]: e.target.value }) }))))),
            React.createElement("div", { className: "mt-bar" },
                React.createElement("button", { type: "button", className: "mt-pri", onClick: doSave }, "Simpan"),
                React.createElement("button", { type: "button", className: "mt-sec", onClick: () => setEdit(false) }, "Batal")),
            ask ? React.createElement("div", { className: "mt-ask" },
                    React.createElement("p", null, "Semua teks kembali ke versi bawaan dan ubahan Anda hilang. Lanjutkan?"),
                    React.createElement("div", { className: "mt-bar" },
                        React.createElement("button", { type: "button", className: "mt-sec", onClick: () => setAsk(false) }, "Tidak"),
                        React.createElement("button", { type: "button", className: "mt-pri mt-del", onClick: doReset }, "Ya, kembalikan")))
                : React.createElement("button", { type: "button", className: "mt-reset", onClick: () => setAsk(true) }, "Kembalikan ke teks bawaan"));
    const body = n => {
        if (n === 1) return React.createElement(React.Fragment, null,
            d.info.map((p, i) => React.createElement("div", { key: i, className: "mt-kv" }, React.createElement("small", null, p[0]), React.createElement("b", null, p[1]))),
            d.goal && React.createElement("p", { className: "mt-pp" }, d.goal));
        if (n === 2) return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "mt-sl" }, "Rutinitas alarm"), pairs(d.alarms, "mt-al"),
            React.createElement("div", { className: "mt-sl" }, "Peta chart"), pairs(d.map, "mt-al"));
        if (n === 3) { const b = side === 'buy';
            return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "mt-seg", role: "tablist" },
                    React.createElement("button", { type: "button", role: "tab", "aria-selected": b, className: b ? "on g" : "", onClick: () => setSide('buy') }, "Entry Buy"),
                    React.createElement("button", { type: "button", role: "tab", "aria-selected": !b, className: !b ? "on r" : "", onClick: () => setSide('sell') }, "Entry Sell")),
                steps(b ? d.buy : d.sell),
                (b ? d.buyDec : d.sellDec) && React.createElement("div", { className: "mt-dec " + (b ? "g" : "r") }, b ? d.buyDec : d.sellDec)); }
        if (n === 4) return React.createElement(React.Fragment, null,
            d.skipIntro && React.createElement("p", { className: "mt-pp", style: { marginTop: 0 } }, d.skipIntro),
            d.skip.map((p, i) => React.createElement("div", { key: i, className: "mt-sk" }, React.createElement(X, { size: 16 }), React.createElement("div", null, React.createElement("b", null, p[0]), p[1] && React.createElement("p", null, p[1])))));
        return steps(d.flow);
    };
    return React.createElement("section", { className: "mt" },
        React.createElement("div", { className: "sp-head" },
            React.createElement("button", { type: "button", className: "sp-back", "aria-label": "Kembali", onClick: onBack }, React.createElement(ChevronLeft, { size: 24 })),
            React.createElement("h1", { style: { margin: 0 } }, "Metode Satu Warna"),
            React.createElement("button", { type: "button", className: "sp-back", "aria-label": "Ubah teks metode", onClick: startEdit }, React.createElement(Pencil, { size: 20 }))),
        React.createElement("button", { type: "button", className: "mt-all", onClick: toAll }, (allOpen ? "Tutup semua" : "Buka semua") + " · " + M.SECS.length + " bagian"),
        M.SECS.map(s => React.createElement("div", { key: s.n, className: "mt-ac" + (open[s.n] ? " open" : ""), "data-n": s.n },
            React.createElement("button", { type: "button", className: "mt-ach", "aria-expanded": !!open[s.n], onClick: () => toggle(s.n) },
                React.createElement("span", { className: "mt-nn" }, s.n), React.createElement("b", null, s.title), React.createElement(ChevronRight, { size: 18 })),
            open[s.n] && React.createElement("div", { className: "mt-acb" }, body(s.n)))));
}
window.MetodePage = MetodePage;
