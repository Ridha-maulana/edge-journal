/* Drill-down performa Bulan > Minggu > Hari > Sesi > Win/Loss */
"use strict";
/* ===== v2.8.0 — Drill-down performa: Bulan > Minggu > Hari > Sesi > Win/Loss =====
   Menggantikan 4 kartu terpisah (Performa per minggu, per hari, per sesi, Distribusi win/loss).
   Data: semua trade closed pada akun aktif. Mode Kunci = agregasi data dari semua bulan/minggu/hari.
   v2.8.1: warna & animasi mengikuti kartu lain (tab Growth/Balance), kotak info bulan/minggu/hari/sesi di semua level, % dan pips. */
const DD_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const DD_MONF = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DD_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
const DD_WKND = 'Akhir pekan (Sab–Min)';
const DD_SCOL = { 'Asia': '#34d399', 'London': '#6b8dff', 'New York': '#f5b84b', 'Overlap': '#9b82ff' };
const DD_LCOL = ['#6b8dff', '#9b82ff', '#f5b84b'];   // dot level: bulan (biru), minggu (ungu), hari (kuning) = warna kotak info
const DD_LV = ['Bulan', 'Minggu', 'Hari', 'Sesi', 'Win/Loss'];
const DD_LOCK_MSG = ['Menampilkan semua bulan pada periode terpilih', 'Data per nomor minggu dari semua bulan', 'Data per hari dari semua minggu', '4 sesi dengan data agregat dari semua hari', 'Distribusi win/loss agregat dari semua hari'];
const DD_BEST = ['Bulan terbaik', 'Minggu terbaik', 'Hari terbaik', 'Sesi terbaik'];
const dd2 = n => String(n).padStart(2, '0');
function ddBuild(trades) {
    const out = [];
    trades.forEach(t => {
        try {
            const w = wib(t.date);                       // zona WIB, sama dengan Monthly gain
            const iso = w.day;
            const y = Number(w.year), m = Number(w.mi), d = Number(iso.slice(8, 10));
            if (!y || m < 0 || m > 11 || !d) return;
            const off = (new Date(y, m, 1).getDay() + 6) % 7;
            const di = (new Date(y, m, d, 12).getDay() + 6) % 7;
            const ses = SESSIONS.find(s => s.test(w.hour));
            if (!ses) return;
            out.push({ mk: `${y}-${dd2(m + 1)}`, iso, wk: Math.floor((d - 1 + off) / 7) + 1, di: Math.min(di, 5), day: di < 5 ? DD_DAYS[di] : DD_WKND, ses: ses.name, pnl: Number(t.pnl) || 0, pips: pipsOf(t) || 0 });
        } catch (e) { /* tanggal rusak: lewati */ }
    });
    return out;
}
function ddStat(rs) {
    const w = rs.filter(r => r.pnl > 0), l = rs.filter(r => r.pnl < 0);
    const sum = (a, k = 'pnl') => a.reduce((x, r) => x + r[k], 0);
    return {
        n: rs.length, wins: w.length, losses: l.length, wr: rs.length ? w.length / rs.length * 100 : 0, profit: sum(rs), pips: sum(rs, 'pips'),
        avgWin: w.length ? sum(w) / w.length : 0, avgLoss: l.length ? sum(l) / l.length : 0,
        days: new Set(rs.map(r => r.iso)).size, weeks: new Set(rs.map(r => r.mk + r.wk)).size, sessions: new Set(rs.map(r => r.ses)).size
    };
}
/* kotak info kecil: day (abu), week (ungu), month (biru), ses (sesi, ada titik warna) */
function ddTagList(rs, kinds, mkShort) {
    const out = [];
    kinds.forEach(kind => {
        if (kind === 'day') { const seen = new Map(); rs.forEach(r => seen.set(r.di, r.day === DD_WKND ? 'Sab–Min' : r.day)); [...seen.keys()].sort((a, b) => a - b).forEach(k => out.push({ cls: 'day', text: seen.get(k) })); }
        else if (kind === 'week') [...new Set(rs.map(r => r.wk))].sort((a, b) => a - b).forEach(w => out.push({ cls: 'week', text: `Minggu ke-${w}` }));
        else if (kind === 'month') [...new Set(rs.map(r => r.mk))].sort().forEach(mk => out.push({ cls: 'month', text: mkShort(mk) }));
        else if (kind === 'ses') SESSIONS.map(s => s.name).filter(n => rs.some(r => r.ses === n)).forEach(n => out.push({ cls: 'ses', text: n, dot: DD_SCOL[n] }));
    });
    return out;
}
function DdDonut({ st }) {
    const h = React.createElement;
    const r = 70, c = 2 * Math.PI * r, tot = st.n;
    const wA = tot ? c * st.wins / tot : 0, lA = tot ? c * st.losses / tot : 0;
    const col = !tot ? '#8590a8' : st.wr >= 50 ? '#34d399' : '#ff6b81';
    return h('svg', { viewBox: '0 0 180 180', className: 'dd-donut', role: 'img', 'aria-label': `Win rate ${st.wr.toFixed(1)}%` },
        h('circle', { cx: 90, cy: 90, r, fill: 'none', stroke: '#233252', strokeWidth: 24 }),
        lA > 0 && h('circle', { cx: 90, cy: 90, r, fill: 'none', stroke: '#ff6b81', strokeWidth: 24, strokeDasharray: `${lA} ${c}`, strokeDashoffset: -wA, transform: 'rotate(-90 90 90)' }),
        wA > 0 && h('circle', { cx: 90, cy: 90, r, fill: 'none', stroke: '#34d399', strokeWidth: 24, strokeDasharray: `${wA} ${c}`, transform: 'rotate(-90 90 90)' }),
        h('text', { x: 90, y: 100, textAnchor: 'middle', fontSize: 28, fontWeight: 800, fill: col }, `${st.wr.toFixed(1)}%`));
}
function DrillDown({ account, trades, rangeText }) {
    const h = React.createElement;
    const fm = n => money(n, account.currency);
    const sg = n => n > 0 ? `+${fm(n)}` : n < 0 ? `-${fm(Math.abs(n))}` : fm(0);
    const tn = n => n > 0 ? 'pos' : n < 0 ? 'neg' : 'zero';
    // modal awal sama seperti kartu lain (Gain / Monthly gain): saldo - deposit + penarikan
    const hist = account.capitalHistory || [];
    const startBal = Math.max((account.balance || 0) - sumOf(hist.filter(x => x.type !== 'withdraw'), x => x.amount) + sumOf(hist.filter(x => x.type === 'withdraw'), x => x.amount), 1);
    const pct = v => `${v > 0 ? '+' : ''}${(v / startBal * 100).toFixed(2)}%`;
    const pipTxt = v => `${v > 0 ? '+' : ''}${v.toFixed(1)} pips`;
    // Hierarki penyaringan: Periode -> pilihan Monthly gain -> kartu ini. `trades` sudah berupa trade closed
    // yang lolos Periode (termasuk rentang bulan yang dipilih di Monthly gain), jadi kartu selalu satu data dengan Monthly gain.
    const recs = useMemo(() => ddBuild((trades || []).filter(t => t.status === 'closed')), [trades]);
    const [level, setLevel] = useState(0);
    const [locked, setLocked] = useState(false);
    const [sel, setSel] = useState({ mk: null, wk: null, day: null, ses: null });
    const cardRef = useRef(null);
    const mounted = useRef(false);
    const mks = useMemo(() => [...new Set(recs.map(r => r.mk))].sort(), [recs]);
    const multiYear = new Set(mks.map(k => k.slice(0, 4))).size > 1;
    const mkIdx = mk => Number(mk.slice(5, 7)) - 1;
    const mkName = mk => `${DD_MONF[mkIdx(mk)]} ${mk.slice(0, 4)}`;
    const mkShort = mk => DD_MON[mkIdx(mk)] + (multiYear ? ` ${mk.slice(2, 4)}` : '');
    const geo = mk => { const y = Number(mk.slice(0, 4)), m = mkIdx(mk); return { m, dim: new Date(y, m + 1, 0).getDate(), off: (new Date(y, m, 1).getDay() + 6) % 7 }; };
    const weeksIn = mk => { const g = geo(mk); return Math.floor((g.dim - 1 + g.off) / 7) + 1; };
    const wkRange = (mk, wk) => { const g = geo(mk); const a = Math.max(1, (wk - 1) * 7 - g.off + 1), b = Math.min(g.dim, (wk - 1) * 7 - g.off + 7); return a === b ? `${a} ${DD_MON[g.m]}` : `${a}–${b} ${DD_MON[g.m]}`; };

    // Validasi pilihan (data bisa berubah karena sinkron / ganti akun)
    const curM = sel.mk && mks.includes(sel.mk) ? sel.mk : null;
    const curW = curM && sel.wk && sel.wk <= weeksIn(curM) && recs.some(r => r.mk === curM && r.wk === sel.wk) ? sel.wk : null;
    const curD = curW && sel.day && recs.some(r => r.mk === curM && r.wk === curW && r.day === sel.day) ? sel.day : null;
    const curS = curD && sel.ses && recs.some(r => r.mk === curM && r.wk === curW && r.day === curD && r.ses === sel.ses) ? sel.ses : null;
    const cap = curM ? (curW ? (curD ? (curS ? 4 : 3) : 2) : 1) : 0;
    const lv = locked ? level : Math.min(level, cap);

    useEffect(() => {
        if (!mounted.current) { mounted.current = true; return; }
        const el = cardRef.current;
        if (el && el.scrollIntoView) el.scrollIntoView({ block: 'start' });
    }, [lv, locked]);

    if (!recs.length) return h('div', { className: 'pe-card dd', ref: cardRef },
        h('h3', null, 'Performa per bulan / minggu / hari / sesi'),
        h('p', { className: 'pe-empty' }, rangeText && rangeText !== 'All time' ? `Belum ada trade closed pada periode ${rangeText}. Pilih bulan atau periode lain.` : 'Belum ada trade closed. Tutup posisi pertama Anda untuk melihat performa per bulan, minggu, hari, dan sesi.'));

    // ----- susun daftar kartu untuk level aktif -----
    const mkItem = (key, o, rs) => ({ key, st: ddStat(rs), tags: [], ...o });
    const tg = (rs, kinds) => ddTagList(rs, kinds, mkShort);
    let items = [], title = '', small = '';
    const sesNames = SESSIONS.map(s => s.name), sesHrs = n => SESSIONS.find(s => s.name === n).hrs + ' WIB';
    const dayNames = rs => [...DD_DAYS, ...(rs.some(r => r.day === DD_WKND) ? [DD_WKND] : [])];
    if (lv === 0) {
        // Bulan: berapa minggu, hari, sesi (kotak info) + posisi, WR, %, profit
        title = 'Performa per bulan';
        const ys = [...new Set(mks.map(k => k.slice(0, 4)))];
        small = ys.length === 1 ? ys[0] : `${ys[0]}–${ys[ys.length - 1]}`;
        items = mks.map(mk => { const rs = recs.filter(r => r.mk === mk); const st = ddStat(rs); return mkItem(mk, { dot: DD_LCOL[0], title: mkName(mk), tags: [{ cls: 'cnt', text: `${st.weeks} minggu` }, { cls: 'cnt', text: `${st.days} hari` }, { cls: 'cnt', text: `${st.sessions} sesi` }] }, rs); });
    } else if (lv === 1) {
        // Minggu: bulan & hari apa saja, sesi apa saja + posisi, WR, %, profit
        title = 'Performa per minggu';
        if (locked) {
            small = 'Agregasi Semua Bulan';
            const maxW = Math.max(...mks.map(weeksIn));
            items = Array.from({ length: maxW }, (_, i) => { const rs = recs.filter(r => r.wk === i + 1); return mkItem(i + 1, { dot: DD_LCOL[1], title: `Minggu ke-${i + 1}`, note: 'Semua Bulan', sub: rs.length ? '' : 'Tidak ada trade', tags: tg(rs, ['month', 'day', 'ses']) }, rs); });
        } else {
            small = mkName(curM);
            items = Array.from({ length: weeksIn(curM) }, (_, i) => { const rs = recs.filter(r => r.mk === curM && r.wk === i + 1); return mkItem(i + 1, { dot: DD_LCOL[1], title: `Minggu ke-${i + 1}`, sub: wkRange(curM, i + 1), tags: tg(rs, ['month', 'day', 'ses']) }, rs); });
        }
    } else if (lv === 2) {
        // Hari: bulan, minggu, dan sesi apa saja + WR, %, profit
        title = 'Performa per hari';
        if (locked) {
            small = 'Agregasi Semua Minggu';
            items = dayNames(recs).map(d => { const rs = recs.filter(r => r.day === d); return mkItem(d, { dot: DD_LCOL[2], title: d, note: 'Semua Minggu', sub: rs.length ? '' : 'Tidak ada trade', tags: tg(rs, ['month', 'week', 'ses']) }, rs); });
        } else {
            small = `Minggu ke-${curW} · ${mkShort(curM)}`;
            const scope = recs.filter(r => r.mk === curM && r.wk === curW);
            items = dayNames(scope).map(d => { const rs = scope.filter(r => r.day === d); return mkItem(d, { dot: DD_LCOL[2], title: d, sub: rs.length ? '' : 'Belum ada trade', tags: tg(rs, ['month', 'week', 'ses']) }, rs); });
        }
    } else if (lv === 3) {
        title = 'Performa per sesi';
        if (locked) {
            small = 'Agregasi Semua Hari';
            items = sesNames.map(n => { const rs = recs.filter(r => r.ses === n); return mkItem(n, { dot: DD_SCOL[n], title: n, sub: sesHrs(n), tags: tg(rs, ['day', 'week', 'month']) }, rs); });
        } else {
            small = curD === DD_WKND ? 'Akhir pekan' : curD;
            const scope = recs.filter(r => r.mk === curM && r.wk === curW && r.day === curD);
            items = sesNames.map(n => { const rs = scope.filter(r => r.ses === n); return mkItem(n, { dot: DD_SCOL[n], title: n, sub: sesHrs(n), tags: tg(rs, ['day', 'week', 'month']) }, rs); }).filter(i => i.st.n > 0);
        }
    } else {
        title = 'Distribusi win / loss';
        if (locked) {
            small = 'Agregasi Semua Hari';
            items = sesNames.map(n => { const rs = recs.filter(r => r.ses === n); return mkItem(n, { dot: DD_SCOL[n], title: n, sub: sesHrs(n), tags: tg(rs, ['day', 'week', 'month']) }, rs); });
        } else {
            small = `${curS} — ${curD === DD_WKND ? 'Akhir pekan' : curD}`;
            const rs = recs.filter(r => r.mk === curM && r.wk === curW && r.day === curD && r.ses === curS);
            items = [mkItem(curS, { dot: DD_SCOL[curS], title: curS, sub: sesHrs(curS), tags: tg(rs, ['day', 'week', 'month']) }, rs)];
        }
    }

    // ----- aksi -----
    const baseSel = { mk: curM, wk: curW, day: curD, ses: curS };
    const FIELDS = ['mk', 'wk', 'day', 'ses'];
    const applyPick = (key) => {
        const f = FIELDS[lv];
        const next = { ...baseSel };
        if (next[f] !== key) { FIELDS.slice(lv + 1).forEach(x => { next[x] = null; }); }
        next[f] = key;
        setSel(next);
        setLevel(lv + 1);
    };
    const pick = i => { if (lv >= 4) return; if (locked) { setLevel(lv + 1); return; } if (i.st.n > 0) applyPick(i.key); };
    const goNext = () => {
        if (lv >= 4) return;
        if (locked) { setLevel(lv + 1); return; }
        const f = FIELDS[lv];
        if (baseSel[f] != null) { setLevel(lv + 1); return; }
        const first = items.find(i => i.st.n > 0);
        if (first) applyPick(first.key);
    };
    const goBack = () => { if (lv > 0) setLevel(lv - 1); };
    const crumbOn = i => locked || i <= cap;

    // ----- tampilan -----
    const maxN = Math.max(1, ...items.map(i => i.st.n));
    const tagEls = tags => tags && tags.length > 0 ? h('div', { className: 'dd-tags' }, tags.map((t, k) => h('span', { key: k, className: 'dd-tag ' + t.cls }, t.dot ? h('i', { style: { background: t.dot } }) : null, t.text))) : null;
    // data Win/Loss: Win / Loss, Win Rate, Avg. Win / Loss, Perolehan Pips
    const rowsOf = st => [
        ['Win / Loss', `${st.wins} / ${st.losses}`, ''],
        ['Win Rate', `${st.wr.toFixed(1)}%`, st.n ? (st.wr >= 50 ? 'pos' : 'neg') : 'zero'],
        ['Avg. Win / Loss', h(React.Fragment, null, h('span', { className: tn(st.avgWin) }, sg(st.avgWin)), ' / ', h('span', { className: tn(st.avgLoss) }, sg(st.avgLoss))), ''],
        ['Perolehan Pips', pipTxt(st.pips), tn(st.pips)]
    ];
    const table = rows => h('div', { className: 'dd-tbl' }, rows.map(([l, v, t]) => h('div', { key: l }, h('span', null, l), h('b', { className: t }, v))));
    const head = i => h('div', { className: 'dd-ihead' }, h('i', { className: 'dd-dot', style: { background: i.dot } }), h('strong', null, i.title), i.sub ? h('span', { className: 'dd-small' }, i.sub) : null);

    let hl = null;
    if (locked) hl = h('div', { className: 'dd-info' }, `🔒 Mode Kunci: ${DD_LOCK_MSG[lv]}`);
    else if (lv < 4) {
        const c = items.filter(i => i.st.n > 0);
        if (c.length) { const b = c.reduce((a, x) => x.st.profit > a.st.profit ? x : a); hl = h('div', { className: 'dd-best' }, `🏆 ${DD_BEST[lv]}: `, h('b', null, b.title), ` · ${sg(b.st.profit)} · WR ${Math.round(b.st.wr)}% · ${b.st.n} posisi`); }
    }

    let body;
    if (lv < 4) {
        body = items.map(i => {
            const ok = locked || i.st.n > 0;
            return h('div', { key: i.key, className: 'dd-item' + (ok ? ' click' : ' dim') + '', role: ok ? 'button' : undefined, tabIndex: ok ? 0 : undefined, onClick: ok ? () => pick(i) : undefined, onKeyDown: ok ? (e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); } }) : undefined },
                h('div', { className: 'dd-ihead' }, h('i', { className: 'dd-dot', style: { background: i.dot } }), h('strong', null, i.title), i.note ? h('span', { className: 'dd-small' }, `(${i.note})`) : null),
                i.sub ? h('div', { className: 'dd-sub' }, i.sub) : null,
                tagEls(i.tags),
                h('div', { className: 'dd-row' },
                    h('span', { className: 'dd-meta' }, h('span', null, `${i.st.n} posisi`), h('span', null, `${Math.round(i.st.wr)}% WR`), h('span', { className: tn(i.st.profit) }, pct(i.st.profit))),
                    h('b', { className: 'dd-pr ' + tn(i.st.profit) }, sg(i.st.profit))),
                h('div', { className: 'dd-bar' }, h('i', { style: { width: `${i.st.n ? Math.max(3, i.st.n / maxN * 100) : 0}%`, background: i.st.profit < 0 ? '#ff6b81' : '#34d399' } })));
        });
    } else if (locked) {
        const total = ddStat(recs);
        body = [...items.map(i => h('div', { key: i.key, className: 'dd-item' }, head(i), tagEls(i.tags), table(rowsOf(i.st)))),
        h('div', { key: 'total', className: 'dd-item dd-total' },
            h('div', { className: 'dd-ihead' }, h('i', { className: 'dd-dot', style: { background: '#eef2ff' } }), h('strong', null, 'Ringkasan Total'), h('span', { className: 'dd-small' }, 'semua sesi')),
            table([['Total posisi', String(total.n), ''], ...rowsOf(total), ['Profit', `${sg(total.profit)} · ${pct(total.profit)}`, tn(total.profit)]]))];
    } else {
        const i = items[0];
        body = [h('div', { key: 'donut', className: 'dd-donutwrap' }, h(DdDonut, { st: i.st })),
        h('div', { key: 'card', className: 'dd-item' }, head(i), tagEls(i.tags), table(rowsOf(i.st)))];
    }

    const DD_ICO = ['CalendarDays', 'CalendarRange', 'Calendar', 'Clock', 'Trophy'];
    const crumbs = DD_LV.map((l, i) => h('button', { key: l, type: 'button', className: 'dd-crumb' + (i === lv ? ' on' : crumbOn(i) ? ' seen' : ''), disabled: !crumbOn(i), 'aria-label': l, title: l, onClick: () => crumbOn(i) && setLevel(i) }, h(Icon, { name: DD_ICO[i], size: 21 })));
    crumbs.push(h('button', { key: 'lock', type: 'button', className: 'dd-lock' + (locked ? ' on' : ''), 'aria-label': locked ? 'Terkunci' : 'Kunci', title: locked ? 'Terkunci' : 'Kunci', onClick: () => setLocked(v => !v), 'aria-pressed': locked }, h(Icon, { name: locked ? 'LockKeyhole' : 'LockKeyholeOpen', size: 21 })));

    return h('div', { className: 'pe-card dd', ref: cardRef },
        h('div', { className: 'dd-crumbs' }, crumbs),
        h('h3', { className: 'dd-title' }, title, ' ', h('small', null, `(${small})`)),
        hl, body,
        h('div', { className: 'dd-nav' },
            h('button', { type: 'button', className: 'dd-btn back', disabled: lv === 0, onClick: goBack }, lv === 0 ? '← Kembali' : `← Kembali ke ${DD_LV[lv - 1]}`),
            h('button', { type: 'button', className: 'dd-btn next', disabled: lv >= 4, onClick: goNext }, lv >= 4 ? 'Selesai ✓' : 'Selanjutnya →')),
        h('p', { className: 'pe-note' }, 'Minggu mengikuti baris pada Kalender (Senin–Minggu); hari dihitung dari tanggal entry; sesi dari jam entry (WIB): Asia 06–12, London 12–20, New York 20–04, Overlap 04–06. Persen (%) dihitung dari modal awal, sama seperti Gain dan Monthly gain. Data kartu ini mengikuti Periode di atas dan bulan/tahun yang dipilih di Monthly gain (satu data, bulan tanpa trade tidak ditampilkan). Tombol Kunci menampilkan data gabungan dari semua bulan/minggu/hari pada periode itu.'));
}
