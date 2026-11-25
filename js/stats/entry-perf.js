/* Performa per entri (v5.11.6): hasil trading dikelompokkan menurut zona entry Metode
   (Retest / Follow Trend / Lanjutan / Ekstensi Jenuh). Dua tab:
   - Per waktu : matriks zona × (Tahun | Bulan | Minggu | Hari | Sesi), kotak bisa digeser kalau kolom > 3
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
    const [tab, setTab] = useState('time');
    const [dim, setDim] = useState('Sesi');
    const [menu, setMenu] = useState(false);
    const [openZ, setOpenZ] = useState(null);
    const [sc, setSc] = useState({ i: 0 });
    const scrRef = useRef(null), menuRef = useRef(null);

    useEffect(() => {
        if (!menu) return;
        const off = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
        const esc = e => { if (e.key === 'Escape') setMenu(false); };
        document.addEventListener('pointerdown', off); document.addEventListener('keydown', esc);
        return () => { document.removeEventListener('pointerdown', off); document.removeEventListener('keydown', esc); };
    }, [menu]);
    useEffect(() => { if (scrRef.current) scrRef.current.scrollLeft = 0; setSc({ i: 0 }); }, [dim, tab]);

    const zoned = useMemo(() => recs.filter(r => r.z), [recs]);
    const noZone = recs.length - zoned.length;
    const rangeLbl = !rangeText || rangeText === 'All time' ? 'Semua periode' : rangeText;
    const zInfo = id => METODE.zoneOf(id);

    if (!recs.length) return h('div', { className: 'pe-card ep' },
        h('h3', null, 'Performa per entri'),
        h('p', { className: 'pe-empty' }, 'Belum ada trade closed. Tutup posisi dan pilih zona entry Metode untuk melihat cara entry mana yang paling menguntungkan.'));

    const byZone = id => recs.filter(r => (id === 'none' ? !r.z : r.z === id));
    const total = epStat(recs);

    /* ======= tab Per waktu ======= */
    const cols = epCols(dim, zoned);
    const nCol = cols.length;
    const grid = EP_ZIDS.map(id => cols.map(c => epStat(zoned.filter(r => r.z === id && epKeyOf(dim, r) === c.key))));
    const tots = cols.map((c, i) => epStat(zoned.filter(r => epKeyOf(dim, r) === c.key)));
    const maxAbs = Math.max(1, ...grid.flat().map(s => Math.abs(s.net)));
    const onScroll = () => {
        const el = scrRef.current; if (!el || nCol <= 3) return;
        const step = (el.scrollWidth - 0) / nCol;
        const i = Math.max(0, Math.min(nCol - 3, Math.round(el.scrollLeft / step)));
        setSc(p => p.i === i ? p : { i });
    };
    const cell = (s, k) => {
        if (!s.n) return h('div', { key: k, className: 'ep-cx em' }, '–');
        const a = .12 + Math.min(1, Math.abs(s.net) / maxAbs) * .5;
        return h('div', { key: k, className: 'ep-cx', style: { background: s.net >= 0 ? `rgba(34,181,115,${a})` : `rgba(239,107,123,${a})` } },
            h('b', null, `${s.n} · ${Math.round(s.wr)}%`), h('small', null, sg(s.net)));
    };
    const matrix = h('div', { className: 'ep-mxw' },
        h('div', { className: 'ep-mxl' },
            h('div', { className: 'hd' }),
            EP_ZIDS.map(id => h('div', { key: id, className: 'zl' }, h('i', { style: { background: EP_COL[id] } }), EP_SHORT[id])),
            h('div', { className: 'tl' }, 'Total')),
        h('div', { className: 'ep-scrw' },
            h('div', { className: 'ep-scr', ref: scrRef, onScroll },
                h('div', { className: 'ep-trk' }, cols.map((c, ci) => h('div', { key: c.key, className: 'ep-col' },
                    h('div', { className: 'ep-ch' }, c.label),
                    EP_ZIDS.map((id, zi) => cell(grid[zi][ci], id)),
                    h('div', { className: 'ep-cx tt' }, h('span', null, tots[ci].n), h('span', null, '·'), h('span', { className: tn(tots[ci].net) }, sg(tots[ci].net))))))),
            nCol > 3 && sc.i > 0 && h('i', { className: 'ep-fade l' }),
            nCol > 3 && sc.i < nCol - 3 && h('i', { className: 'ep-fade r' })));
    const sbar = nCol > 3 && h('div', { className: 'ep-sbar' },
        h('span', null, `${cols[sc.i].label}–${cols[Math.min(nCol - 1, sc.i + 2)].label}`),
        h('div', { className: 'tr' }, h('i', { className: 'th', style: { width: `${3 / nCol * 100}%`, left: `${sc.i / nCol * 100}%` } })),
        h('span', null, sc.i >= nCol - 3 ? '‹ geser' : 'geser ›'));
    const dimLow = dim.toLowerCase();
    const mix = cols.map((c, ci) => {
        const t = tots[ci].n; if (!t) return null;
        return h('div', { key: c.key, className: 'ep-mx' },
            h('div', { className: 'lab' }, h('span', null, c.label), h('small', null, `${t} posisi`)),
            h('div', { className: 'stk' }, EP_ZIDS.map((id, zi) => grid[zi][ci].n ? h('i', { key: id, style: { flex: grid[zi][ci].n, background: EP_COL[id] } }, Math.round(grid[zi][ci].n / t * 100) + '%') : null)));
    });
    const timeTab = !zoned.length
        ? h('p', { className: 'pe-empty' }, 'Belum ada trade yang punya zona entry. Pilih zona di Tambah trade, atau lewat Edit untuk trade lama.')
        : h(React.Fragment, null,
            h('div', { className: 'ep-sl' }, `Zona × ${dimLow} (posisi · win rate · P&L)`),
            matrix, sbar,
            h('div', { className: 'ep-legend' }, h('span', null, h('i', { style: { background: 'rgba(34,181,115,.55)' } }), 'Untung'), h('span', null, h('i', { style: { background: 'rgba(239,107,123,.55)' } }), 'Rugi'), h('span', null, 'Makin pekat = makin besar')),
            h('div', { className: 'ep-sl', style: { marginTop: 16 } }, `Cara yang paling sering dipakai per ${dimLow}`),
            mix,
            h('div', { className: 'ep-legend' }, EP_ZIDS.map(id => h('span', { key: id }, h('i', { style: { background: EP_COL[id] } }), EP_SHORT[id]))));

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
        const w = Math.abs(r.st.net) / maxContrib * 36, pos = r.st.net >= 0;
        return h('div', { key: r.id, className: 'ep-dr' + (r.id === 'none' ? ' mu' : '') },
            h('span', { className: 'nm' }, r.id === 'none' ? 'Tanpa zona' : EP_SHORT[r.id]),
            h('div', { className: 'trk' },
                r.st.n > 0 && h('i', { className: 'bar', style: { width: w + '%', [pos ? 'left' : 'right']: '50%', background: r.id === 'none' ? EP_COL.none : (pos ? '#22b573' : '#ef6b7b') } }),
                h('span', { className: 'val ' + tn(r.st.net), style: { [pos ? 'left' : 'right']: `calc(50% + ${w}% + 6px)` } }, r.st.n ? sg(r.st.net) : '–')));
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

    /* ======= tab bar: tab pertama = pilihan waktu (menu turun langsung di bawahnya) ======= */
    const onTime = () => { if (tab !== 'time') { setTab('time'); setMenu(false); } else setMenu(m => !m); };
    const colCount = d => epCols(d, zoned).length;
    const tabs = h('div', { className: 'ep-tabs', ref: menuRef },
        h('button', { type: 'button', className: 'tb' + (tab === 'time' ? ' on' : ''), 'aria-haspopup': 'listbox', 'aria-expanded': menu, onClick: onTime }, `Per ${dimLow}`, h(Icon, { name: 'ChevronDown', size: 16, className: menu ? 'up' : '' })),
        h('button', { type: 'button', className: 'tb' + (tab === 'sum' ? ' on' : ''), onClick: () => { setTab('sum'); setMenu(false); } }, 'Ringkasan'),
        menu && h('div', { className: 'ep-dd', role: 'listbox' }, EP_DIMS.map(d => h('button', { key: d, type: 'button', role: 'option', 'aria-selected': d === dim, className: 'o' + (d === dim ? ' on' : ''), onClick: () => { setDim(d); setMenu(false); } }, d, colCount(d) > 3 && d !== 'Sesi' ? h('small', null, colCount(d) + ' kolom') : null))));

    return h('div', { className: 'pe-card ep' },
        h('div', { className: 'ep-top' }, h('h3', null, 'Performa per entri ', h('small', null, `(${rangeLbl})`))),
        h('div', { className: 'ep-sub' }, `Dari zona entry Metode · ${total.n} trade closed`),
        tabs,
        tab === 'time' ? timeTab : sumTab,
        noZone > 0 && h('p', { className: 'pe-note' }, `${noZone} posisi lama tanpa zona ${tab === 'time' ? 'tidak masuk matriks, tapi tetap dihitung di total P&L.' : 'dihitung di baris "Belum ada zona". Zonanya bisa diisi lewat Edit trade.'}`));
}
