/* Halaman baca Metode Satu Warna: bagian lipat, tab zona, visual Fibonacci, jadwal alarm, PDF asli, dan ubah teks (v5.11.5) */
"use strict";
/* ===== visual bagian 2 (v5.11.5): chart GOLD H1 bergambar, tangga zona, strip jam alarm ===== */
const MV_PDF = { file: 'assets/sop-metode-satu-warna.pdf', pages: ['assets/sop-metode-1.jpg', 'assets/sop-metode-2.jpg', 'assets/sop-metode-3.jpg'], name: 'SOP-Metode-Satu-Warna.pdf' };
const MV_CSS = `
.mv{--mg:#6fe0a6;--ma:#f5c85a;--mr:#ff8d9b;--mc:#22b573;--mk:#f0b429;--mx:#ef6b7b}
html[data-mode="light"] .mv{--mg:#15803d;--ma:#a16207;--mr:#b91c4a}
.mv-chart{display:block;width:100%;height:auto;color:inherit;margin:0 0 4px}
.mv-chart text{font-family:inherit}
.mv-chart .t-g{fill:var(--mg)}.mv-chart .t-a{fill:var(--ma)}.mv-chart .t-r{fill:var(--mr)}.mv-chart .t-m{fill:currentColor;opacity:.55}.mv-chart .t-k{fill:currentColor}
.mv .mt-acb{padding-left:0!important;padding-right:0!important}
.mv-pn{margin:0 -12px 12px;padding:0 12px;border-radius:18px;border:1px solid color-mix(in srgb,currentColor 10%,transparent);background:color-mix(in srgb,var(--bg,#111) 55%,transparent);-webkit-backdrop-filter:blur(26px) saturate(1.15);backdrop-filter:blur(26px) saturate(1.15)}
html[data-mode="light"] .mv-pn{background:color-mix(in srgb,#fff 58%,transparent);border-color:color-mix(in srgb,#000 9%,transparent)}
.mv-pn .mt-ac:last-child{border-bottom:0}
.mv-zl{margin:0 0 4px}
.mv-zr{display:flex;gap:10px;padding:9px 0;border-top:1px solid color-mix(in srgb,currentColor 12%,transparent)}.mv-zr:first-child{border-top:0}
.mv-zr>i{width:3px;border-radius:99px;flex:none}
.mv-zr>div{flex:1;min-width:0}
.mv-zr .h{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.mv-zr b{font-size:13.5px;font-weight:700}
.mv-zr .c{font-size:11px;font-weight:700;padding:1px 8px;border-radius:99px;white-space:nowrap;border:1px solid}
.mv-zr p{margin:2px 0 0;font-size:12px;line-height:1.45;opacity:.74}
.mv-zr.g>i{background:var(--mc)}.mv-zr.g b,.mv-zr.g .c{color:var(--mg)}.mv-zr.g .c{border-color:color-mix(in srgb,var(--mc) 50%,transparent);background:color-mix(in srgb,var(--mc) 12%,transparent)}
.mv-zr.a>i{background:var(--mk)}.mv-zr.a b,.mv-zr.a .c{color:var(--ma)}.mv-zr.a .c{border-color:color-mix(in srgb,var(--mk) 50%,transparent);background:color-mix(in srgb,var(--mk) 12%,transparent)}
.mv-zr.t>i{background:#2fd28a;opacity:.7}.mv-zr.t b,.mv-zr.t .c{color:var(--mg)}.mv-zr.t .c{border-color:color-mix(in srgb,#2fd28a 50%,transparent);background:color-mix(in srgb,#2fd28a 10%,transparent)}
.mv-zr.r>i{background:var(--mx)}.mv-zr.r b,.mv-zr.r .c{color:var(--mr)}.mv-zr.r .c{border-color:color-mix(in srgb,var(--mx) 50%,transparent);background:color-mix(in srgb,var(--mx) 12%,transparent)}
.mv-strip{position:relative;height:50px;margin:4px 4px 0}
.mv-strip .bar{position:absolute;left:0;right:0;top:30px;height:10px;border-radius:99px;background:color-mix(in srgb,currentColor 10%,transparent)}
.mv-strip .u,.mv-strip .o{position:absolute;top:26px;height:18px;border-radius:5px}
.mv-strip .u{background:var(--mc)}.mv-strip .o{background:var(--mk)}
.mv-strip .n{position:absolute;top:2px;transform:translateX(-50%);font-size:11px;font-weight:700;white-space:nowrap}
.mv-lg{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:11.5px;opacity:.7;margin:2px 4px 8px}
.mv-lg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.mv-tb{width:100%;border-collapse:collapse;font-size:11.5px;font-variant-numeric:tabular-nums}
.mv-tb th{font-size:10px;font-weight:600;text-align:left;padding:4px 2px;text-transform:uppercase;letter-spacing:.03em;opacity:.6;white-space:nowrap}
.mv-tb td{padding:7px 2px;border-top:1px solid color-mix(in srgb,currentColor 12%,transparent);white-space:nowrap}
.mv-tb td:first-child{font-weight:700}
.mt-seg button.on.a{background:rgba(240,180,41,.16)!important;border-color:rgba(240,180,41,.55)!important;color:var(--ma,#f5c85a)!important}
.mt-dec.a{background:rgba(240,180,41,.13)!important;border-color:rgba(240,180,41,.4)!important;color:var(--ma,#f5c85a)!important}
html[data-mode="light"] .mt-seg button.on.a,html[data-mode="light"] .mt-dec.a{color:#a16207!important}
.mv-pdf{margin:14px 0 6px;border:1px solid color-mix(in srgb,currentColor 14%,transparent);border-radius:16px;padding:14px;background:color-mix(in srgb,currentColor 4%,transparent)}
.mv-pdf h3{margin:0 0 10px;font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;opacity:.7}
.mv-pf{display:flex;gap:12px;align-items:center}
.mv-ic{width:44px;height:54px;border-radius:8px;background:#e5484d;color:#fff;font-weight:800;font-size:12px;letter-spacing:.04em;display:flex;align-items:flex-end;justify-content:center;padding-bottom:7px;flex:none;position:relative}
.mv-ic:before{content:"";position:absolute;top:0;right:0;width:13px;height:13px;background:rgba(0,0,0,.25);border-radius:0 8px 0 8px}
.mv-pf b{font-size:14px;display:block}.mv-pf small{font-size:12px;opacity:.65}
.mv-pdf p{margin:10px 0 12px;font-size:12.5px;line-height:1.5;opacity:.72}
.mv-bt{display:flex;gap:10px}
.mv-bt button{flex:1;min-height:46px;border-radius:12px;font-weight:700;font-size:14px;line-height:1;font-family:inherit;border:1px solid color-mix(in srgb,currentColor 18%,transparent);background:color-mix(in srgb,currentColor 7%,transparent);color:inherit;cursor:pointer}
.mv-bt button.p{background:#22b573;border-color:#22b573;color:#06231a}
.mv-vw{margin:0 0 10px;border-radius:10px;background:#fff;box-shadow:0 4px 20px rgba(0,0,0,.35);overflow:hidden}
.mv-sc{overflow-x:auto;border-radius:10px;margin:0 0 10px;-webkit-overflow-scrolling:touch}
.mv-sc img{display:block;background:#fff;border-radius:10px;max-width:none}
.mv-zm{display:flex;align-items:center;gap:8px;margin:0 0 10px;font-size:12px;opacity:.85}
.mv-zm button{min-width:44px;min-height:44px;border-radius:12px;border:1px solid color-mix(in srgb,currentColor 18%,transparent);background:color-mix(in srgb,currentColor 7%,transparent);color:inherit;font-weight:700;font-size:16px;line-height:1;font-family:inherit}
.mv-zm span{flex:1}
`;
function mvStyle() { if (document.getElementById('mv-css')) return; const st = document.createElement('style'); st.id = 'mv-css'; st.textContent = MV_CSS; document.head.appendChild(st); }
/* chart contoh: harga turun dari 0.0 (High 3646) ke 100.0 (Low 3533), lalu memantul di zona retest. Zona: Follow Trend 0-100, Retest 38.2-100, Lanjutan 100-161.8, Ekstensi Jenuh >161.8 */
function mvChartSvg() {
    const P0 = 3646, P100 = 3533, D = P0 - P100, lv = x => P0 - D * x / 100, W = 372, H = 300, pmin = 3405, pmax = 3662, pw = W;
    const y = p => 6 + (pmax - p) / (pmax - pmin) * (H - 12);
    const C = [[3552, 3560, 3546, 3558], [3558, 3570, 3554, 3566], [3566, 3585, 3562, 3580], [3580, 3600, 3576, 3596], [3596, 3625, 3592, 3620], [3620, 3646, 3616, 3640], [3640, 3644, 3622, 3626], [3626, 3632, 3606, 3610], [3610, 3622, 3598, 3618], [3618, 3624, 3596, 3600], [3600, 3604, 3570, 3574], [3574, 3578, 3548, 3552], [3552, 3560, 3536, 3556], [3556, 3562, 3533, 3540], [3540, 3548, 3535, 3546], [3546, 3575, 3542, 3572]];
    const G = '#22b573', G2 = '#2fd28a', R = '#ef6b7b', A = '#f0b429', cw = 13.2;
    let s = '<defs><pattern id="mvh" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="6" fill="' + R + '" opacity=".32"/></pattern></defs>';
    s += '<rect x="0" y="' + y(P0) + '" width="' + pw + '" height="' + (y(P100) - y(P0)) + '" fill="' + G + '" opacity=".12"/>';
    s += '<rect x="0" y="' + y(lv(38.2)) + '" width="' + pw + '" height="' + (y(P100) - y(lv(38.2))) + '" fill="' + A + '" opacity=".16"/>';
    s += '<rect x="0.5" y="' + y(P100) + '" width="' + (pw - 1) + '" height="' + (y(lv(161.8)) - y(P100)) + '" fill="' + G2 + '" opacity=".09" stroke="' + G2 + '" stroke-opacity=".5" stroke-dasharray="5 4"/>';
    s += '<rect x="0" y="' + y(lv(161.8)) + '" width="' + pw + '" height="' + (y(pmin) - y(lv(161.8))) + '" fill="url(#mvh)"/>';
    [[0, '0.0'], [38.2, '38.2'], [50, '50.0'], [100, '100.0'], [161.8, '161.8']].forEach(([x, t]) => {
        const yy = y(lv(x)), cls = x === 161.8 ? 't-r' : (x === 38.2 || x === 50) ? 't-a' : 't-k', col = x === 161.8 ? R : (x === 38.2 || x === 50) ? A : 'currentColor';
        s += '<line x1="0" x2="' + pw + '" y1="' + yy + '" y2="' + yy + '" stroke="' + col + '" stroke-width="' + (x === 0 || x === 100 ? 1.3 : 1) + '" ' + (x === 50 ? 'stroke-dasharray="4 3" ' : '') + 'opacity="' + (col === 'currentColor' ? .7 : .9) + '"/>';
        s += '<text x="' + (pw - 4) + '" y="' + (x === 50 ? yy + 12 : yy - 4) + '" text-anchor="end" class="' + cls + '" font-size="11" font-weight="800">' + t + '</text>';
    });
    C.forEach((c, i) => { const op = c[0], h = c[1], l = c[2], cl = c[3], x = 4 + i * cw + cw / 2, col = cl >= op ? G : R;
        s += '<line x1="' + x + '" x2="' + x + '" y1="' + y(h) + '" y2="' + y(l) + '" stroke="' + col + '" stroke-width="1.3"/><rect x="' + (x - cw * .33) + '" y="' + y(Math.max(op, cl)) + '" width="' + (cw * .66) + '" height="' + Math.max(2, Math.abs(y(op) - y(cl))) + '" rx="1.5" fill="' + col + '"/>'; });
    const lab = (t, yy, cls) => '<text x="' + (pw - 74) + '" y="' + (yy + 4) + '" text-anchor="end" class="' + cls + '" font-size="11" font-weight="800">' + t + '</text>';
    s += lab('FOLLOW TREND', y(lv(19)), 't-g') + lab('RETEST', y(lv(72)), 't-a') + lab('LANJUTAN FOLLOW TREND', y(lv(131)), 't-g') + lab('DILARANG ENTRY', y(lv(190)), 't-r');
    const bx = pw - 62;
    s += '<g fill="none" stroke-width="2.6" stroke-linecap="round"><path d="M' + bx + ' ' + (y(P0) + 4) + ' V' + (y(P100) - 4) + '" stroke="' + G + '"/><path d="M' + (bx + 9) + ' ' + (y(lv(38.2)) + 4) + ' V' + (y(P100) - 4) + '" stroke="' + A + '"/></g>';
    return '<svg class="mv-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Contoh chart GOLD H1 dengan zona Fibonacci: Follow Trend 0.0 sampai 100, Retest 38.2 sampai 100, Lanjutan Follow Trend 100 sampai 161.8, dilarang entry di atas 161.8">' + s + '</svg>';
}
function mvTimes(v) { return String(v || '').match(/\d{1,2}:\d{2}(?::\d{2})?/g) || []; }
const mvHour = t => { const a = String(t).split(':'); return (+a[0]) + (+a[1]) / 60; };
const mvDot = (c) => React.createElement("i", { style: { background: c } });
function MvAlarmStrip({ rows }) {
    const ok = rows.filter(r => mvTimes(r[1]).length >= 4);
    const pc = h => h / 24 * 100, wd = pc(0.12) + 1.4;
    return React.createElement(React.Fragment, null,
        React.createElement("div", { className: "mv-strip", "aria-hidden": "true" },
            React.createElement("div", { className: "bar" }),
            ok.map((r, i) => { const t = mvTimes(r[1]), u = mvHour(t[0]), o = mvHour(t[2]);
                return React.createElement(React.Fragment, { key: i },
                    React.createElement("div", { className: "u", style: { left: pc(u) + '%', width: wd + '%' } }),
                    React.createElement("div", { className: "o", style: { left: pc(o) + '%', width: wd + '%' } }),
                    React.createElement("div", { className: "n", style: { left: pc((u + o) / 2 + .12) + '%' } }, r[0].replace(/^Sesi\s+/i, ''))); })),
        React.createElement("div", { className: "mv-lg" }, React.createElement("span", null, mvDot('#22b573'), "Alarm utama + tutup"), React.createElement("span", null, mvDot('#f0b429'), "Opsi +1 jam + tutup")),
        React.createElement("table", { className: "mv-tb" },
            React.createElement("thead", null, React.createElement("tr", null, ["Sesi", "Utama", "Tutup", "+1 jam", "Tutup"].map((h, i) => React.createElement("th", { key: i }, h)))),
            React.createElement("tbody", null, rows.map((r, i) => { const t = mvTimes(r[1]);
                return t.length >= 4
                    ? React.createElement("tr", { key: i }, React.createElement("td", null, r[0].replace(/^Sesi\s+/i, '')), t.slice(0, 4).map((x, j) => React.createElement("td", { key: j }, x)))
                    : React.createElement("tr", { key: i }, React.createElement("td", { colSpan: 5, style: { whiteSpace: 'normal' } }, React.createElement("b", null, r[0]), r[1] ? ': ' + r[1] : '')); }))));
}
/* tiap baris zona: "Judul 38.2 – 100%" dipecah menjadi judul + chip rentang */
function mvSplitZone(t) { const m = String(t).match(/^(.*?)\s*((?:[>≥]\s*)?\d[\d.]*(?:\s*[–-]\s*\d[\d.]*)?\s*%)\s*$/); return m && m[1] ? [m[1], m[2]] : [String(t), '']; }
function MvLadder({ zones }) {
    const cls = ['g', 'a', 't', 'r'];
    return React.createElement("div", { className: "mv-zl" }, zones.map((p, i) => { const z = mvSplitZone(p[0]);
        return React.createElement("div", { key: i, className: "mv-zr " + (cls[i] || 'g') },
            React.createElement("i", null),
            React.createElement("div", null, React.createElement("div", { className: "h" }, React.createElement("b", null, z[0]), z[1] && React.createElement("span", { className: "c" }, z[1])), p[1] && React.createElement("p", null, p[1]))); }));
}
async function mvDownloadPdf() {
    try {
        const r = await fetch(MV_PDF.file); if (!r.ok) throw new Error('PDF tidak ditemukan');
        const blob = new Blob([await r.blob()], { type: 'application/pdf' });
        if (typeof capNative === 'function' && capNative()) { await nativeShareBlob(blob, MV_PDF.name, 'SOP Metode Satu Warna'); return; }
        const u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = MV_PDF.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1500);
    }
    catch (e) { if (!/cancel/i.test(String((e && e.message) || e)) && typeof notify === 'function') notify('Gagal mengunduh PDF: ' + ((e && e.message) || e)); }
}
const mvDlIcon = size => React.createElement("svg", { width: size || 20, height: size || 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, React.createElement("path", { d: "M12 4v11M7 11l5 5 5-5M5 20h14" }));
function MetodePdfView({ onBack }) {
    const [z, setZ] = useState(0), Z = [100, 160, 240];
    return React.createElement("section", { className: "mt mv" },
        React.createElement("div", { className: "sp-head" },
            React.createElement("button", { type: "button", className: "sp-back", "aria-label": "Kembali ke penjelasan", onClick: onBack }, React.createElement(ChevronLeft, { size: 24 })),
            React.createElement("h1", { style: { margin: 0 } }, "SOP Metode Satu Warna"),
            React.createElement("button", { type: "button", className: "sp-back", "aria-label": "Unduh PDF", onClick: mvDownloadPdf }, mvDlIcon(20))),
        React.createElement("div", { className: "mv-zm" },
            React.createElement("span", null, "PDF asli · 3 halaman · geser untuk melihat sisi lain"),
            React.createElement("button", { type: "button", "aria-label": "Perkecil", disabled: z === 0, onClick: () => setZ(Math.max(0, z - 1)) }, "−"),
            React.createElement("button", { type: "button", "aria-label": "Perbesar", disabled: z === Z.length - 1, onClick: () => setZ(Math.min(Z.length - 1, z + 1)) }, "+")),
        MV_PDF.pages.map((src, i) => React.createElement("div", { key: i, className: "mv-sc" }, React.createElement("img", { src, alt: "SOP Metode Satu Warna, halaman " + (i + 1) + " dari 3", style: { width: Z[z] + '%' }, loading: "lazy", draggable: false }))),
        React.createElement("div", { className: "mv-bt" },
            React.createElement("button", { type: "button", onClick: onBack }, "Kembali ke penjelasan"),
            React.createElement("button", { type: "button", className: "p", onClick: mvDownloadPdf }, "Unduh PDF")));
}
function MetodePage({ onBack, sec, tab }) {
    const M = window.METODE, d = M.useMetode();
    const [open, setOpen] = useState(() => { const o = {}; if (sec) o[sec] = true; else { o[1] = true; o[3] = true; } return o; });
    const [side, setSide] = useState(tab === 'follow' ? 'follow' : 'retest');
    const [pdf, setPdf] = useState(false);
    useEffect(() => { mvStyle(); }, []);
    const [edit, setEdit] = useState(false);
    const [draft, setDraft] = useState({});
    const [ask, setAsk] = useState(false);
    useEffect(() => {
        if (!sec) return;
        const t = setTimeout(() => { const el = document.querySelector('.mt-ac[data-n="' + sec + '"]'); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 60);
        return () => clearTimeout(t);
    }, []);
    useEffect(() => {
        const k = e => { if (e.key === 'Escape') { if (edit) setEdit(false); else if (pdf) setPdf(false); else onBack(); } };
        document.addEventListener('keydown', k);
        return () => document.removeEventListener('keydown', k);
    }, [edit, pdf]);
    const allOpen = M.SECS.every(s => open[s.n]);
    const toggle = n => setOpen({ ...open, [n]: !open[n] });
    const toAll = () => { const o = {}; if (!allOpen) M.SECS.forEach(s => { o[s.n] = true; }); setOpen(o); };
    const startEdit = () => { const x = {}; Object.keys(M.TYPES).forEach(k => { x[k] = M.toText(k, d[k]); }); setDraft(x); setAsk(false); setEdit(true); try { window.scrollTo(0, 0); } catch (e) { } };
    const doSave = () => { const n = {}; Object.keys(M.TYPES).forEach(k => { n[k] = M.fromText(k, draft[k]); }); M.save(n); setEdit(false); try { window.scrollTo(0, 0); } catch (e) { } };
    const doReset = () => { M.save(null); setEdit(false); setAsk(false); try { window.scrollTo(0, 0); } catch (e) { } };
    const pairs = (arr, cls) => arr.map((p, i) => React.createElement("div", { key: i, className: cls }, React.createElement("b", null, p[0]), p[1] && React.createElement("p", null, p[1])));
    const steps = arr => arr.map((x, i) => React.createElement("div", { key: i, className: "mt-st" }, React.createElement("span", null, i + 1), React.createElement("p", null, x)));
    if (pdf)
        return React.createElement(MetodePdfView, { onBack: () => { setPdf(false); try { window.scrollTo(0, 0); } catch (e) { } } });
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
            d.info.map((p, i) => React.createElement("div", { key: i, className: "mt-kv" }, React.createElement("small", null, p[0]), React.createElement("b", null, p[1]))));
        if (n === 2) return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "mt-sl" }, "Peta harga nyata (contoh GOLD H1)"), React.createElement("div", { dangerouslySetInnerHTML: { __html: mvChartSvg() } }),
            React.createElement("div", { className: "mt-sl" }, "Zona Fibonacci"), React.createElement(MvLadder, { zones: d.zones }),
            React.createElement("div", { className: "mt-sl" }, "Aturan baku: berakhirnya zona terlarang (> 161.8%)"),
            d.unlockIntro && React.createElement("p", { className: "mt-pp", style: { marginTop: 0 } }, d.unlockIntro),
            steps(d.unlock),
            d.unlockEnd && React.createElement("p", { className: "mt-pp", style: { marginTop: 8 } }, d.unlockEnd),
            React.createElement("div", { className: "mt-sl" }, "Jam alarm dalam sehari (WIB)"),
            d.alarmNote && React.createElement("p", { className: "mt-pp", style: { marginTop: 0 } }, d.alarmNote),
            React.createElement(MvAlarmStrip, { rows: d.alarms }));
        if (n === 3) { const b = side === 'retest';
            return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "mt-seg", role: "tablist" },
                    React.createElement("button", { type: "button", role: "tab", "aria-selected": b, className: b ? "on a" : "", onClick: () => setSide('retest') }, "Zona Retest"),
                    React.createElement("button", { type: "button", role: "tab", "aria-selected": !b, className: !b ? "on g" : "", onClick: () => setSide('follow') }, "Follow Trend & Lanjutan")),
                React.createElement("p", { className: "mt-pp", style: { marginTop: 0 } }, b ? "Rentang 38.2 sampai 100%" : "Rentang 0.0 sampai 161.8%"),
                steps(b ? d.retest : d.follow),
                (b ? d.retestDec : d.followDec) && React.createElement("div", { className: "mt-dec " + (b ? "a" : "g") }, b ? d.retestDec : d.followDec)); }
        if (n === 4) return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "mt-sl" }, "Aturan Opsi +1 Jam"),
            d.skipIntro && React.createElement("p", { className: "mt-pp", style: { marginTop: 0 } }, d.skipIntro),
            React.createElement("div", { className: "mt-sl" }, "Kondisi wajib Skip"),
            d.skip.map((p, i) => React.createElement("div", { key: i, className: "mt-sk" }, React.createElement(X, { size: 16 }), React.createElement("div", null, React.createElement("b", null, p[0]), p[1] && React.createElement("p", null, p[1])))));
        if (n === 6) return React.createElement(React.Fragment, null,
            d.evalIntro && React.createElement("p", { className: "mt-pp", style: { marginTop: 0 } }, d.evalIntro),
            React.createElement("div", { className: "mv-zl" }, d.modes.map((p, i) => React.createElement("div", { key: i, className: "mv-zr " + ['g', 'a', 't', 'r'][i % 4] },
                React.createElement("i", null), React.createElement("div", null, React.createElement("div", { className: "h" }, React.createElement("b", null, p[0])), p[1] && React.createElement("p", null, p[1]))))));
        return steps(d.flow);
    };
    return React.createElement("section", { className: "mt mv" },
        React.createElement("div", { className: "sp-head" },
            React.createElement("button", { type: "button", className: "sp-back", "aria-label": "Kembali", onClick: onBack }, React.createElement(ChevronLeft, { size: 24 })),
            React.createElement("h1", { style: { margin: 0 } }, "Metode Satu Warna"),
            React.createElement("button", { type: "button", className: "sp-back", "aria-label": "Ubah teks metode", onClick: startEdit }, React.createElement(Pencil, { size: 20 }))),
        React.createElement("button", { type: "button", className: "mt-all", onClick: toAll }, (allOpen ? "Tutup semua" : "Buka semua") + " · " + M.SECS.length + " bagian"),
        React.createElement("div", { className: "mv-pn" }, M.SECS.map(s => React.createElement("div", { key: s.n, className: "mt-ac" + (open[s.n] ? " open" : ""), "data-n": s.n },
            React.createElement("button", { type: "button", className: "mt-ach", "aria-expanded": !!open[s.n], onClick: () => toggle(s.n) },
                React.createElement("span", { className: "mt-nn" }, s.n), React.createElement("b", null, s.title), React.createElement(ChevronRight, { size: 18 })),
            open[s.n] && React.createElement("div", { className: "mt-acb" }, body(s.n))))),
        React.createElement("div", { className: "mv-pdf" },
            React.createElement("h3", null, "Versi PDF"),
            React.createElement("div", { className: "mv-pf" }, React.createElement("div", { className: "mv-ic", "aria-hidden": "true" }, "PDF"), React.createElement("div", null, React.createElement("b", null, "SOP Metode Satu Warna"), React.createElement("small", null, "Dokumen asli \u00B7 3 halaman"))),
            React.createElement("p", null, "Lebih suka membaca dokumen aslinya? Buka langsung di aplikasi, atau simpan ke HP."),
            React.createElement("div", { className: "mv-bt" },
                React.createElement("button", { type: "button", className: "p", onClick: () => { setPdf(true); try { window.scrollTo(0, 0); } catch (e) { } } }, "Buka PDF"),
                React.createElement("button", { type: "button", onClick: mvDownloadPdf }, "Unduh PDF"))));
}
window.MetodePage = MetodePage;
