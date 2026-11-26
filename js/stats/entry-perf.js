/* Performa per entri / posisi (v5.11.7): hasil trading dikelompokkan menurut zona entry Metode
   (Retest / Follow Trend / Lanjutan / Ekstensi Jenuh). Dua tab:
   - Per waktu : matriks zona × (Tahun | Bulan | Minggu | Hari | Sesi), kotak bisa digeser kalau kolom > 3
   Judul kartu bisa dipilih: "Performa per entri" (baris = zona) atau "Performa per posisi" (baris = Win / Loss / BE).
   - Ringkasan : penyumbang profit / penggerus, kontribusi P&L, kartu zona + detail (Wilson 95%, PF, ekspektasi) */
"use strict";
const EP_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const EP_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sab–Min'];
const EP_ZIDS = ['retest', 'follow', 'lanjut', 'jenuh'];
const EP_SHORT = { retest: 'Retest', follow: 'Follow Trend', lanjut: 'Lanjutan', jenuh: 'Ekstensi Jenuh', none: 'Belum ada zona' };
const EP_COL = { retest: '#f0b429', follow: '#22b573', lanjut: '#2fd28a', jenuh: '#ef6b7b', none: '#6b7280' };
const EP_DIMS = ['Tahun', 'Bulan', 'Minggu', 'Hari', 'Sesi'];
const EP_DIM_SUB = { Tahun: 'Tiap tahun yang ada trade', Bulan: 'Tiap bulan yang ada trade', Minggu: 'Minggu ke-1 sampai ke-5 dalam bulan', Hari: 'Senin sampai Jumat (+ akhir pekan)', Sesi: 'Asia · London · New York' };
const EP_SAMPLE_MIN = 30, EP_SAMPLE_SOP = 100;
const EP_OUT = ['win', 'loss', 'be'], EP_OUT_STACK = ['win', 'be', 'loss'];
const EP_OUT_NAME = { win: 'Win', loss: 'Loss', be: 'BE' };
const EP_OUT_COL = { win: '#22b573', loss: '#ef6b7b', be: '#6b7280' };
const epOutOf = r => r.pnl > 0 ? 'win' : r.pnl < 0 ? 'loss' : 'be';

/* satu trade closed -> catatan ringkas (waktu WIB, sama dengan kartu Performa per bulan) */
function epBuild(trades) {
    const out = [];
    (trades || []).forEach(t => {
        if (t.status !== 'closed') return;
        try {
            const w = wib(t.date), y = Number(w.year), m = Number(w.mi), d = Number(w.day.slice(8, 10));
            if (!y || m < 0 || m > 11 || !d) return;
            const off = (new Date(y, m, 1).getDay() + 6) % 7;
            const di = (new Date(y, m, d, 12).getDay() + 6) % 7;
            out.push({
                z: METODE.zoneOf(t.zone) ? t.zone : '', y: String(y), mk: `${y}-${String(m + 1).padStart(2, '0')}`, wk: Math.floor((d - 1 + off) / 7) + 1,
                di: Math.min(di, 5), ses: sesOf(new Date(t.date).getTime()), pnl: Number(t.pnl) || 0
            });
        } catch (e) { /* tanggal rusak: lewati */ }
    });
    return out;
}
/* statistik satu kelompok. Win rate = untung / semua posisi closed (BE ikut penyebut, sama dengan Performa per bulan) */
function epStat(rs) {
    let w = 0, l = 0, be = 0, gp = 0, gl = 0, net = 0;
    rs.forEach(r => { net += r.pnl; if (r.pnl > 0) { w++; gp += r.pnl; } else if (r.pnl < 0) { l++; gl -= r.pnl; } else be++; });
    const n = rs.length, p = n ? w / n : 0, z = 1.96;
    let lo = 0, hi = 0;
    if (n) { const d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d, hw = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d; lo = Math.max(0, c - hw) * 100; hi = Math.min(1, c + hw) * 100; }
    return { n, w, l, be, net, gp, gl, wr: p * 100, lo, hi, pf: gl > 0 ? gp / gl : (gp > 0 ? Infinity : null), exp: n ? net / n : 0, avgW: w ? gp / w : 0, avgL: l ? -gl / l : 0 };
}
/* kolom matriks menurut pilihan waktu */
function epCols(dim, recs) {
    const multiYear = new Set(recs.map(r => r.y)).size > 1;
    if (dim === 'Tahun') return [...new Set(recs.map(r => r.y))].sort().map(k => ({ key: k, label: k }));
    if (dim === 'Bulan') return [...new Set(recs.map(r => r.mk))].sort().map(k => ({ key: k, label: EP_MON[Number(k.slice(5, 7)) - 1] + (multiYear ? ' ' + k.slice(2, 4) : '') }));
    if (dim === 'Minggu') { const mx = Math.max(0, ...recs.map(r => r.wk)); return Array.from({ length: mx }, (_, i) => ({ key: i + 1, label: 'Mgg ' + (i + 1) })); }
    if (dim === 'Hari') { const n = recs.some(r => r.di === 5) ? 6 : 5; return Array.from({ length: n }, (_, i) => ({ key: i, label: EP_DAYS[i] })); }
    return SESSIONS.map(s => s.name).filter(n => n !== 'Sepi' || recs.some(r => r.ses === 'Sepi')).map(n => ({ key: n, label: n }));
}
const epKeyOf = (dim, r) => dim === 'Tahun' ? r.y : dim === 'Bulan' ? r.mk : dim === 'Minggu' ? r.wk : dim === 'Hari' ? r.di : r.ses;

function EntryPerf({ account, trades, rangeText }) {
    const h = React.createElement;
    const fm = n => money(n, account.currency);
    const sg = n => n > 0 ? `+${fm(n)}` : n < 0 ? `−${fm(Math.abs(n))}` : fm(0);
    const tn = n => n > 0 ? 'pos' : n < 0 ? 'neg' : 'zero';
    const recs = useMemo(() => epBuild(trades), [trades]);
    const [mode, setMode] = useState('entri');
    const [modeMenu, setModeMenu] = useState(false);
    const [tab, setTab] = useState('time');
    const [dim, setDim] = useState('Sesi');
    const [menu, setMenu] = useState(false);
    const [openZ, setOpenZ] = useState(null);
    const [sc, setSc] = useState({ i: 0 });
    const scrRef = useRef(null), menuRef = useRef(null), modeRef = useRef(null);

    useEffect(() => {
        if (!menu && !modeMenu) return;
        const off = e => {
            if (menu && menuRef.current && !menuRef.current.contains(e.target)) setMenu(false);
            if (modeMenu && modeRef.current && !modeRef.current.contains(e.target)) setModeMenu(false);
        };
        const esc = e => { if (e.key === 'Escape') { setMenu(false); setModeMenu(false); } };
        document.addEventListener('pointerdown', off); document.addEventListener('keydown', esc);
        return () => { document.removeEventListener('pointerdown', off); document.removeEventListener('keydown', esc); };
    }, [menu, modeMenu]);
    useEffect(() => { if (scrRef.current) scrRef.current.scrollLeft = 0; setSc({ i: 0 }); }, [dim, tab, mode]);

    const zoned = useMemo(() => recs.filter(r => r.z), [recs]);
    const noZone = recs.length - zoned.length;
    const rangeLbl = !rangeText || rangeText === 'All time' ? 'Semua periode' : rangeText;
    const zInfo = id => METODE.zoneOf(id);

    const pos = mode === 'posisi';
    if (!recs.length) return h('div', { className: 'pe-card ep' },
        h('h3', null, 'Performa per entri'),
        h('p', { className: 'pe-empty' }, 'Belum ada trade closed. Tutup posisi dan pilih zona entry Metode untuk melihat cara entry mana yang paling menguntungkan.'));

    const byZone = id => recs.filter(r => (id === 'none' ? !r.z : r.z === id));
    const total = epStat(recs);

    /* ======= tab Per waktu ======= */
    const data = pos ? recs : zoned;
    const rowIds = pos ? EP_OUT : EP_ZIDS;
    const rowOf = r => pos ? epOutOf(r) : r.z;
    const rowName = id => pos ? EP_OUT_NAME[id] : EP_SHORT[id];
    const rowCol = id => pos ? EP_OUT_COL[id] : EP_COL[id];
    const cols = epCols(dim, data);
    const nCol = cols.length;
    const grid = rowIds.map(id => cols.map(c => epStat(data.filter(r => rowOf(r) === id && epKeyOf(dim, r) === c.key))));
    const tots = cols.map(c => epStat(data.filter(r => epKeyOf(dim, r) === c.key)));
    const maxAbs = Math.max(1, ...grid.flat().map(s => Math.abs(s.net)));
    const onScroll = () => {
        const el = scrRef.current; if (!el || nCol <= 3) return;
        const step = el.scrollWidth / nCol;
        const i = Math.max(0, Math.min(nCol - 3, Math.round(el.scrollLeft / step)));
        setSc(p => p.i === i ? p : { i });
    };
    const cell = (s, k, ci, id) => {
        if (!s.n) return h('div', { key: k, className: 'ep-cx em' }, '–');
        if (pos && id === 'be') return h('div', { key: k, className: 'ep-cx', style: { background: 'rgba(107,114,128,.28)' } }, h('b', null, `${s.n} · ${Math.round(s.n / tots[ci].n * 100)}%`), h('small', null, `impas ${fm(0)}`));
        const a = .12 + Math.min(1, Math.abs(s.net) / maxAbs) * .5;
        return h('div', { key: k, className: 'ep-cx', style: { background: s.net >= 0 ? `rgba(34,181,115,${a})` : `rgba(239,107,123,${a})` } },
            h('b', null, `${s.n} · ${Math.round(pos ? s.n / tots[ci].n * 100 : s.wr)}%`), h('small', null, sg(s.net)));
    };
    const matrix = h('div', { className: 'ep-mxw' },
        h('div', { className: 'ep-mxl' },
            h('div', { className: 'hd' }),
            rowIds.map(id => h('div', { key: id, className: 'zl' }, h('i', { style: { background: rowCol(id) } }), rowName(id))),
            h('div', { className: 'tl' }, 'Total')),
        h('div', { className: 'ep-scrw' },
            h('div', { className: 'ep-scr', ref: scrRef, onScroll },
                h('div', { className: 'ep-trk' }, cols.map((c, ci) => h('div', { key: c.key, className: 'ep-col' },
                    h('div', { className: 'ep-ch' }, c.label),
                    rowIds.map((id, zi) => cell(grid[zi][ci], id, ci, id)),
                    h('div', { className: 'ep-cx tt' }, h('span', null, tots[ci].n), h('span', null, '·'), h('span', { className: tn(tots[ci].net) }, sg(tots[ci].net))))))),
            nCol > 3 && sc.i > 0 && h('i', { className: 'ep-fade l' }),
            nCol > 3 && sc.i < nCol - 3 && h('i', { className: 'ep-fade r' })));
    const sbar = nCol > 3 && h('div', { className: 'ep-sbar' },
        h('span', null, `${cols[sc.i].label}–${cols[Math.min(nCol - 1, sc.i + 2)].label}`),
        h('div', { className: 'tr' }, h('i', { className: 'th', style: { width: `${3 / nCol * 100}%`, left: `${sc.i / nCol * 100}%` } })),
        h('span', null, sc.i >= nCol - 3 ? '‹ geser' : 'geser ›'));
    const dimLow = dim.toLowerCase();
    const stackIds = pos ? EP_OUT_STACK : EP_ZIDS;
    const mix = cols.map((c, ci) => {
        const t = tots[ci].n; if (!t) return null;
        return h('div', { key: c.key, className: 'ep-mx' },
            h('div', { className: 'lab' }, h('span', null, c.label), h('small', null, `${t} posisi`)),
            h('div', { className: 'stk' }, stackIds.map(id => { const g = grid[rowIds.indexOf(id)][ci]; return g.n ? h('i', { key: id, style: { flex: g.n, background: rowCol(id), color: id === 'be' ? '#fff' : undefined } }, Math.round(g.n / t * 100) + '%') : null; })));
    });
    const timeTab = !data.length
        ? h('p', { className: 'pe-empty' }, 'Belum ada trade yang punya zona entry. Pilih zona di Tambah trade, atau lewat Edit untuk trade lama.')
        : h(React.Fragment, null,
            h('div', { className: 'ep-sl' }, pos ? `Hasil × ${dimLow} (posisi · persen · P&L)` : `Zona × ${dimLow} (posisi · win rate · P&L)`),
            matrix, sbar,
            h('div', { className: 'ep-legend' }, h('span', null, h('i', { style: { background: 'rgba(34,181,115,.55)' } }), 'Untung'), h('span', null, h('i', { style: { background: 'rgba(239,107,123,.55)' } }), 'Rugi'), h('span', null, 'Makin pekat = makin besar')),
            h('div', { className: 'ep-sl', style: { marginTop: 16 } }, pos ? `Perbandingan win dan loss per ${dimLow}` : `Cara yang paling sering dipakai per ${dimLow}`),
            mix,
            h('div', { className: 'ep-legend' }, stackIds.map(id => h('span', { key: id }, h('i', { style: { background: rowCol(id) } }), rowName(id)))));

    /* ======= tab Ringkasan ======= */
    const zs = EP_ZIDS.map(id => ({ id, st: epStat(byZone(id)) }));
    const rows = [...zs, { id: 'none', st: epStat(byZone('none')) }];
    const used = zs.filter(z => z.st.n > 0);
    const top = used.filter(z => z.st.net > 0).sort((a, b) => b.st.net - a.st.net)[0];
    const bad = used.filter(z => z.st.net < 0).sort((a, b) => a.st.net - b.st.net);
    const share = top && total.net > 0 ? Math.round(top.st.net / total.net * 100) : null;
    const badTxt = z => h(React.Fragment, { key: z.id }, h('b', null, zInfo(z.id).name), ' ', h('b', { className: 'neg' }, sg(z.st.net)), z.id === 'jenuh' ? ` (${z.st.n} entry di zona dilarang)` : '');
    const insights = h('div', { className: 'ep-ins' },
        top && h('div', { className: 'ep-in p' }, h('i'), h('div', null, 'Penyumbang profit: ', h('b', null, zInfo(top.id).name), ' ', h('b', { className: 'pos' }, sg(top.st.net)), share != null && share <= 100 ? ` · ${share}% dari total P&L` : '')),
        bad.length > 0 && h('div', { className: 'ep-in n' }, h('i'), h('div', null, 'Penggerus: ', bad.slice(0, 2).map((z, i) => h(React.Fragment, { key: z.id }, i ? ' dan ' : '', badTxt(z))))));
    const maxContrib = Math.max(1, ...rows.map(r => Math.abs(r.st.net)));
    const contrib = h('div', { className: 'ep-dv' }, rows.map(r => {
        const w = Math.abs(r.st.net) / maxContrib * 48, pos = r.st.net >= 0;
        return h('div', { key: r.id, className: 'ep-dr' + (r.id === 'none' ? ' mu' : '') },
            h('span', { className: 'nm' }, r.id === 'none' ? 'Tanpa zona' : EP_SHORT[r.id]),
            h('div', { className: 'trk' },
                r.st.n > 0 && h('i', { className: 'bar', style: { width: w + '%', [pos ? 'left' : 'right']: '50%', background: r.id === 'none' ? EP_COL.none : (pos ? '#22b573' : '#ef6b7b') } })),
            h('span', { className: 'val ' + tn(r.st.net) }, r.st.n ? sg(r.st.net) : '–'));
    }));
    const maxN = Math.max(1, ...rows.map(r => r.st.n));
    const pfTxt = s => s.pf == null ? '–' : s.pf === Infinity ? '∞' : s.pf.toFixed(2);
    const sesRows = id => SESSIONS.map(s => s.name).map(n => ({ n, st: epStat(byZone(id).filter(r => r.ses === n)) })).filter(x => x.st.n > 0);
    const detail = (id, s) => h('div', { className: 'ep-det' },
        h('div', { className: 'ep-g' },
            h('div', null, h('span', null, 'Win / Loss / BE'), h('b', null, `${s.w} / ${s.l} / ${s.be}`)),
            h('div', null, h('span', null, 'Win rate (rentang 95%)'), h('b', null, `${Math.round(s.wr)}%`, h('em', null, ` ${Math.round(s.lo)}–${Math.round(s.hi)}%`))),
            h('div', null, h('span', null, 'Profit factor'), h('b', null, pfTxt(s))),
            h('div', null, h('span', null, 'Ekspektasi / trade'), h('b', { className: tn(s.exp) }, sg(s.exp))),
            h('div', null, h('span', null, 'Rata-rata win'), h('b', { className: 'pos' }, s.w ? sg(s.avgW) : '–')),
            h('div', null, h('span', null, 'Rata-rata loss'), h('b', { className: 'neg' }, s.l ? sg(s.avgL) : '–'))),
        id !== 'none' && h('div', { className: 'ep-smp' }, h('div', { className: 'lb' }, h('span', null, `Sampel menuju ${EP_SAMPLE_SOP} posisi (SOP)`), h('b', null, `${s.n}/${EP_SAMPLE_SOP}`)), h('div', { className: 'pb' }, h('i', { style: { width: Math.min(100, s.n / EP_SAMPLE_SOP * 100) + '%' } }))),
        sesRows(id).length > 0 && h('div', { className: 'ep-ses' }, h('div', { className: 'ep-sl' }, 'Per sesi'),
            sesRows(id).map(x => h('div', { key: x.n, className: 'r' }, h('b', null, x.n), h('span', null, `${x.st.n} posisi · ${Math.round(x.st.wr)}% WR`), h('em', { className: tn(x.st.net) }, sg(x.st.net))))));
    const zoneCards = rows.map(r => {
        const s = r.st, info = r.id === 'none' ? null : zInfo(r.id), open = openZ === r.id, name = r.id === 'none' ? 'Belum ada zona' : info.name;
        const dead = !s.n;
        return h('div', { key: r.id, className: 'ep-zi' + (open ? ' open' : '') + (r.id === 'none' ? ' mu' : '') },
            h('div', { className: 'ep-zh', role: 'button', tabIndex: dead ? -1 : 0, 'aria-expanded': open, onClick: () => !dead && setOpenZ(open ? null : r.id), onKeyDown: e => { if (!dead && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setOpenZ(open ? null : r.id); } } },
                h('i', { className: 'dt', style: { background: EP_COL[r.id] } }), h('strong', null, name),
                h('span', { className: 'chip c-' + (r.id === 'none' ? 'z' : info.tone) }, r.id === 'none' ? 'data lama' : info.range),
                h('b', { className: 'pl ' + tn(s.net) }, dead ? '–' : sg(s.net)),
                !dead && h('span', { className: 'chev' + (open ? ' up' : '') }, h(Icon, { name: 'ChevronDown', size: 16 }))),
            h('div', { className: 'ep-meta' },
                h('span', null, h('b', null, s.n), ' posisi'),
                s.n > 0 && s.n < EP_SAMPLE_MIN && h('span', { className: 'ep-tag' }, 'Sampel kecil'),
                !dead && h('span', null, h('b', null, `${Math.round(s.wr)}%`), ' WR'),
                !dead && h('span', null, 'PF ', h('b', null, pfTxt(s))),
                !dead && h('span', null, h('b', { className: tn(s.exp) }, sg(s.exp)), '/trade')),
            h('div', { className: 'ep-nb' }, h('i', { style: { width: (s.n / maxN * 100) + '%', background: EP_COL[r.id] } })),
            open && !dead && detail(r.id, s));
    });
    const sumTab = h(React.Fragment, null,
        insights,
        h('div', { className: 'ep-sl' }, 'Kontribusi P&L per cara entry'), contrib,
        h('div', { className: 'ep-sl', style: { marginTop: 4 } }, 'Detail per zona · ketuk untuk membuka'),
        h('div', { className: 'ep-zl' }, zoneCards),
        h('p', { className: 'pe-note' }, 'Win rate = posisi untung ÷ semua posisi closed (sama dengan kartu Performa per bulan). PF = total profit ÷ total loss. Ekspektasi = rata-rata P&L per trade. Rentang 95% memakai interval Wilson: makin sedikit sampel, makin lebar rentangnya, jadi win rate di bawah 30 posisi belum bisa dijadikan patokan. Posisi open tidak dihitung.'));

    /* ======= tab Ringkasan (mode per posisi) ======= */
    const wins = recs.filter(r => r.pnl > 0), losses = recs.filter(r => r.pnl < 0), bes = recs.filter(r => r.pnl === 0);
    const ST = epStat(recs), ratio = ST.avgL < 0 ? ST.avgW / -ST.avgL : 0;
    const zoneCount = rs => EP_ZIDS.map(id => ({ id, n: rs.filter(r => r.z === id).length })).filter(x => x.n).sort((a, b) => b.n - a.n);
    const topZone = rs => { const z = zoneCount(rs)[0]; return z ? h(React.Fragment, null, h('b', null, zInfo(z.id).name), ` (${z.n} dari ${rs.length} ${rs === wins ? 'win' : 'loss'})`) : null; };
    const pIns = h('div', { className: 'ep-ins' },
        ST.w > 0 && ST.l > 0 && h('div', { className: 'ep-in ' + (ratio >= 1 ? 'p' : 'n') }, h('i'), h('div', null, 'Rata-rata win ', h('b', null, sg(ST.avgW)), ' vs rata-rata loss ', h('b', null, sg(ST.avgL)), ' · rasio ', h('b', null, `${ratio.toFixed(2)} : 1`))),
        topZone(wins) && h('div', { className: 'ep-in p' }, h('i'), h('div', null, 'Win terbanyak datang dari ', topZone(wins))),
        topZone(losses) && h('div', { className: 'ep-in n' }, h('i'), h('div', null, 'Loss terbanyak datang dari ', topZone(losses))));
    const pMax = Math.max(1, ST.gp, ST.gl);
    const pBar = (nm, val, color, mu) => {
        const w = Math.abs(val) / pMax * 48, ps = val >= 0;
        return h('div', { className: 'ep-dr' + (mu ? ' mu' : '') },
            h('span', { className: 'nm' }, nm),
            h('div', { className: 'trk' },
                val !== 0 && h('i', { className: 'bar', style: { width: w + '%', [ps ? 'left' : 'right']: '50%', background: color } })),
            h('span', { className: 'val ' + tn(val) }, sg(val)));
    };
    const pContrib = h('div', { className: 'ep-dv' }, pBar('Total win', ST.gp, '#22b573'), pBar('Total loss', -ST.gl, '#ef6b7b'), pBar('Bersih', ST.net, '#6b7280', true));
    const dayTop = rs => { const c = {}; rs.forEach(r => { c[EP_DAYS[r.di]] = (c[EP_DAYS[r.di]] || 0) + 1; }); const e = Object.entries(c).sort((a, b) => b[1] - a[1])[0]; return e ? e[0] : '–'; };
    const pDetail = (k, rs, s) => {
        const win = k === 'win', zc = zoneCount(rs), nz = rs.filter(r => !r.z).length;
        const big = win ? Math.max(...rs.map(r => r.pnl)) : Math.min(...rs.map(r => r.pnl));
        const cl = win ? 'pos' : 'neg';
        return h('div', { className: 'ep-det' },
            h('div', { className: 'ep-g' },
                h('div', null, h('span', null, 'Jumlah posisi'), h('b', null, rs.length)),
                h('div', null, h('span', null, 'Porsi dari semua'), h('b', null, `${Math.round(rs.length / total.n * 100)}%`)),
                h('div', null, h('span', null, win ? 'Total profit' : 'Total loss'), h('b', { className: cl }, sg(s.net))),
                h('div', null, h('span', null, 'Rata-rata'), h('b', { className: cl }, sg(win ? s.avgW : s.avgL))),
                h('div', null, h('span', null, win ? 'Win terbesar' : 'Loss terbesar'), h('b', { className: cl }, sg(big))),
                h('div', null, h('span', null, 'Hari tersering'), h('b', null, dayTop(rs)))),
            (zc.length > 0 || nz > 0) && h('div', { className: 'ep-ses' }, h('div', { className: 'ep-sl' }, 'Berasal dari zona'),
                zc.map(x => h('div', { key: x.id, className: 'r' }, h('b', null, EP_SHORT[x.id]), h('span', null, `${x.n} posisi · ${Math.round(x.n / rs.length * 100)}%`), h('em', { style: { color: EP_COL[x.id] } }, '●'))),
                nz > 0 && h('div', { className: 'r' }, h('b', null, 'Belum ada zona'), h('span', null, `${nz} posisi · ${Math.round(nz / rs.length * 100)}%`), h('em', { style: { color: EP_COL.none } }, '●'))),
            h('div', { className: 'ep-ses' }, h('div', { className: 'ep-sl' }, 'Per sesi'),
                SESSIONS.map(x => x.name).map(n => ({ n, c: rs.filter(r => r.ses === n).length })).filter(x => x.c > 0)
                    .map(x => h('div', { key: x.n, className: 'r' }, h('b', null, x.n), h('span', null, `${x.c} posisi · ${Math.round(x.c / rs.length * 100)}%`), h('em')))));
    };
    const maxPN = Math.max(1, wins.length, losses.length, bes.length);
    const pCard = (k, rs) => {
        const s = epStat(rs), win = k === 'win', be = k === 'be', open = openZ === k, empty = !rs.length;
        const clk = !be && !empty;
        const big = empty || be ? 0 : (win ? Math.max(...rs.map(r => r.pnl)) : Math.min(...rs.map(r => r.pnl)));
        const col = EP_OUT_COL[k];
        return h('div', { key: k, className: 'ep-zi' + (be ? ' mu' : '') },
            h('div', { className: 'ep-zh', role: clk ? 'button' : undefined, tabIndex: clk ? 0 : -1, 'aria-expanded': clk ? open : undefined, onClick: () => clk && setOpenZ(open ? null : k), onKeyDown: e => { if (clk && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setOpenZ(open ? null : k); } } },
                h('i', { className: 'dt', style: { background: col } }), h('strong', null, EP_OUT_NAME[k]),
                h('span', { className: 'chip c-' + (win ? 'g' : be ? 'z' : 'r') }, `${Math.round(rs.length / total.n * 100)}% dari semua`),
                h('b', { className: 'pl ' + (be ? 'zero' : tn(s.net)) }, empty ? '–' : sg(s.net)),
                clk && h('span', { className: 'chev' + (open ? ' up' : '') }, h(Icon, { name: 'ChevronDown', size: 16 }))),
            h('div', { className: 'ep-meta' },
                h('span', null, h('b', null, rs.length), ' posisi'),
                be ? (!empty && h('span', null, 'impas, tidak untung dan tidak rugi')) : !empty && h(React.Fragment, null,
                    h('span', null, 'rata-rata ', h('b', { className: tn(s.net) }, sg(win ? s.avgW : s.avgL))),
                    h('span', null, 'terbesar ', h('b', { className: tn(s.net) }, sg(big))))),
            h('div', { className: 'ep-nb' }, h('i', { style: { width: (rs.length / maxPN * 100) + '%', background: col } })),
            open && clk && pDetail(k, rs, s));
    };
    const pSumTab = h(React.Fragment, null,
        pIns,
        h('div', { className: 'ep-sl' }, 'Total win vs total loss'), pContrib,
        h('div', { className: 'ep-sl', style: { marginTop: 4 } }, 'Detail · ketuk Win atau Loss untuk membuka'),
        h('div', { className: 'ep-zl' }, pCard('win', wins), pCard('loss', losses), pCard('be', bes)),
        h('p', { className: 'pe-note' }, 'BE = posisi impas (hasil tepat 0). Persen dihitung dari semua posisi closed. Posisi open tidak dihitung.'));

    /* ======= tab bar: tab pertama = pilihan waktu (menu turun langsung di bawahnya) ======= */
    const onTime = () => { if (tab !== 'time') { setTab('time'); setMenu(false); } else setMenu(m => !m); };
    const colCount = d => epCols(d, pos ? recs : zoned).length;
    const tabs = h('div', { className: 'ep-tabs', ref: menuRef },
        h('button', { type: 'button', className: 'tb' + (tab === 'time' ? ' on' : ''), 'aria-haspopup': 'listbox', 'aria-expanded': menu, onClick: onTime }, `Per ${dimLow}`, h(Icon, { name: 'ChevronDown', size: 16, className: menu ? 'up' : '' })),
        h('button', { type: 'button', className: 'tb' + (tab === 'sum' ? ' on' : ''), onClick: () => { setTab('sum'); setMenu(false); } }, 'Ringkasan'),
        menu && h('div', { className: 'ep-dd', role: 'listbox' }, EP_DIMS.map(d => h('button', { key: d, type: 'button', role: 'option', 'aria-selected': d === dim, className: 'o' + (d === dim ? ' on' : ''), onClick: () => { setDim(d); setMenu(false); } }, d, colCount(d) > 3 && d !== 'Sesi' ? h('small', null, colCount(d) + ' kolom') : null))));

    const pickMode = m => { setMode(m); setModeMenu(false); setMenu(false); setOpenZ(null); };
    const head = h('div', { className: 'ep-topw', ref: modeRef },
        h('div', { className: 'ep-top' },
            h('button', { type: 'button', className: 'ep-ttl', 'aria-haspopup': 'listbox', 'aria-expanded': modeMenu, onClick: () => { setModeMenu(o => !o); setMenu(false); } },
                h('h3', null, pos ? 'Performa per posisi' : 'Performa per entri'),
                h('span', { className: 'ep-pill' }, h(Icon, { name: 'ChevronDown', size: 16, className: modeMenu ? 'up' : '' })),
                h('small', null, `(${rangeLbl})`))),
        modeMenu && h('div', { className: 'ep-ddt', role: 'listbox' },
            [['entri', 'Performa per entri', 'Menurut zona: Retest, Follow Trend, Lanjutan, Ekstensi Jenuh'], ['posisi', 'Performa per posisi', 'Menurut hasil: Win, Loss, dan BE']].map(([k, t, d]) =>
                h('button', { key: k, type: 'button', role: 'option', 'aria-selected': mode === k, className: 'o' + (mode === k ? ' on' : ''), onClick: () => pickMode(k) }, h('b', null, t), h('small', null, d)))));

    return h('div', { className: 'pe-card ep' },
        head,
        h('div', { className: 'ep-sub' }, `${pos ? 'Dari hasil posisi' : 'Dari zona entry Metode'} · ${total.n} trade closed`),
        tabs,
        tab === 'time' ? timeTab : (pos ? pSumTab : sumTab),
        !pos && noZone > 0 && h('p', { className: 'pe-note' }, `${noZone} posisi lama tanpa zona ${tab === 'time' ? 'tidak masuk matriks, tapi tetap dihitung di total P&L.' : 'dihitung di baris "Belum ada zona". Zonanya bisa diisi lewat Edit trade.'}`));
}
