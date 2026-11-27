/* Performa per bulan, Trader DNA, grafik tambahan */
"use strict";
/* Garis/area dan batang kecil untuk halaman Performa Keseluruhan (v5.12.9) */
function TlLine({ vals, h, col, zero, fill }) {
    const v = vals.length > 1 ? vals : [vals[0] || 0, vals[0] || 0], W = 300, H = h;
    let mn = Math.min(...v), mx = Math.max(...v);
    if (zero) { mn = Math.min(mn, 0); mx = Math.max(mx, 0); }
    if (mn === mx) { mn -= 1; mx += 1; }
    const r = mx - mn; mn -= r * .12; mx += r * .12;
    const y = a => H - (a - mn) / (mx - mn) * H, pts = v.map((a, i) => [i / (v.length - 1) * W, y(a)]);
    const d = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('');
    const base = zero ? y(0) : H, last = pts[pts.length - 1], gid = 'tl' + Math.round(h) + (col || '').replace(/\W/g, '') + v.length;
    return React.createElement("div", { className: "tl-ln", style: { height: h } },
        React.createElement("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "none", "aria-hidden": "true" },
            React.createElement("defs", null, React.createElement("linearGradient", { id: gid, x1: 0, x2: 0, y1: 0, y2: 1 }, React.createElement("stop", { offset: 0, stopColor: col, stopOpacity: .3 }), React.createElement("stop", { offset: 1, stopColor: col, stopOpacity: 0 }))),
            zero && React.createElement("line", { x1: 0, x2: W, y1: base, y2: base, stroke: "currentColor", strokeOpacity: .15, vectorEffect: "non-scaling-stroke" }),
            fill !== false && React.createElement("path", { d: d + `L${last[0]} ${base}L0 ${base}Z`, fill: `url(#${gid})` }),
            React.createElement("path", { d, fill: "none", stroke: col, strokeWidth: 2.4, strokeLinejoin: "round", strokeLinecap: "round", vectorEffect: "non-scaling-stroke" })),
        fill !== false && React.createElement("i", { className: "tl-dt", style: { top: (last[1] / H * 100) + '%', background: col } }));
}
function TlBars({ vals, h }) {
    const n = vals.length || 1, mx = Math.max(1, ...vals.map(Math.abs)), mid = h / 2;
    return React.createElement("svg", { className: "tl-bs", viewBox: `0 0 ${n * 10} ${h}`, preserveAspectRatio: "none", style: { height: h }, "aria-hidden": "true" },
        vals.map((a, i) => { const bh = Math.max(2, Math.abs(a) / mx * (mid - 2)); return React.createElement("rect", { key: i, x: i * 10 + 1.5, width: 7, y: a >= 0 ? mid - bh : mid, height: bh, rx: 1.5, fill: EJC(a >= 0 ? "#34d399" : "#ff6b81") }); }));
}
function PerfExtra({ account, trades, filtered, total, maxDd, onSelectDate, view, onPickMonth, onResetAll, rangeText, mode = 'all', advancedStats, onBack }) {
    const cur = account.currency;
    const fm = n => money(n, cur);
    const sg = n => `${n > 0 ? '+' : ''}${fm(n)}`;
    const [ct, setCt] = useState('daily'), kctl = useTplChart('line');
    const [hub, setHub] = useState('posisi');
    const flat = mode === 'advanced';
    const [showDet, setShowDet] = useState(false);
    const nowW = wib(new Date());
    const year = view.y, mSel = view.m;
    const hist = account.capitalHistory || [];
    const dep = hist.filter(h => h.type !== 'withdraw'), wdr = hist.filter(h => h.type === 'withdraw');
    const depSum = sumOf(dep, h => h.amount), wdSum = sumOf(wdr, h => h.amount);
    const start = Math.max((account.balance || 0) - depSum + wdSum, 1), capBal = Math.max(account.balance || 0, 1);
    const sorted = filtered.slice().sort(byDateAsc);
    const wins = sorted.filter(t => t.pnl > 0), losses = sorted.filter(t => t.pnl < 0);
    const gW = sumOf(wins, t => t.pnl), gL = Math.abs(sumOf(losses, t => t.pnl));
    const pf = gL ? gW / gL : (gW ? Infinity : 0);
    const dayMap = {};
    sorted.forEach(t => { const k = wib(t.date).day; dayMap[k] = (dayMap[k] || 0) + (Number(t.pnl) || 0); });
    const dayKeys = Object.keys(dayMap).sort();
    const monthProfit = sumOf(sorted.filter(t => wib(t.date).month === nowW.month), t => t.pnl);
    const rrs = filtered.map(t => { const r = riskFor(t.entry, t.sl, t.lots, t.symbol), w = rewardFor(t.entry, t.tp, t.lots, t.symbol); return r && w ? w / r : null; }).filter(Boolean);
    const avgRR = rrs.length ? rrs.reduce((a, b) => a + b, 0) / rrs.length : null;
    const fp = v => `${v > 0 ? '+' : ''}${v.toFixed(2)}%`;
    const pcs = (v, b) => `${v > 0 ? '+' : ''}${(v / (b || 1) * 100).toFixed(2)}%`;
    const tiles = [['Gain', fp(pctChain(account, filtered)), tone(total)], ['Abs. gain', pcs(total, start + depSum), tone(total)], ['Daily (rata-rata)', fp(dayKeys.length ? pctChain(account, sorted) / dayKeys.length : 0), tone(total)], ['Monthly (bulan ini)', fp(pctChain(account, sorted.filter(t => wib(t.date).month === nowW.month))), tone(monthProfit)], ['Drawdown', `${maxDd ? '-' : ''}${ddChain(account, filtered).toFixed(2)}%`, maxDd ? 'neg' : ''], ['Win rate', `${sorted.length ? (wins.length / sorted.length * 100).toFixed(0) : 0}%`, sorted.length ? (wins.length / sorted.length >= .5 ? 'pos' : 'neg') : ''], ['Profit factor', pf === Infinity ? '∞' : pf.toFixed(2), pf >= 1 ? 'pos' : pf > 0 ? 'neg' : ''], ['Avg R:R', avgRR ? avgRR.toFixed(1) : '—', ''], ['Trades', String(sorted.length), ''], ['Profit', sg(total), tone(total)], ['Balance', fm(account.balance), ''], ['Equity', fm(account.balance + total), tone(total)], ['Deposits', fm(depSum), 'pos'], ['Withdrawals', fm(wdSum), wdSum ? 'neg' : '']];
    let cum = 0, peak = 0;
    const cumS = [], ddS = [];
    dayKeys.forEach(k => { cum += dayMap[k]; peak = Math.max(peak, cum); cumS.push(cum); ddS.push(cum - peak); });
    const dayPct = {}; sorted.forEach(t => { const k = wib(t.date).day; dayPct[k] = chainAdd(dayPct[k] || 0, tradePct(account, t)); });
    let cumP = 0; const cumPS = dayKeys.map(k => (cumP = chainAdd(cumP, dayPct[k])));
    const lab = dayKeys.map(k => `${k.slice(8)}/${k.slice(5, 7)}`);
    const CT = { growth: { v: cumPS, k: 'line', f: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`, t: 'Growth (% dari modal sekarang)' }, balance: { v: cumS.map(c => account.balance + c), k: 'line', f: v => `$${Math.round(v)}`, t: 'Balance / equity' }, profit: { v: cumS, k: 'line', f: v => `$${Math.round(v)}`, t: 'Profit kumulatif' }, daily: { v: dayKeys.map(k => dayMap[k]), k: 'bar', f: v => `$${Math.round(v)}`, t: 'P&L harian (WIB)' }, dd: { v: ddS, k: 'line', f: v => `$${Math.round(v)}`, t: 'Drawdown dari puncak' } }[ct];
    const allClosed = trades.filter(t => t.status === 'closed');
    const mon = Array.from({ length: 12 }, (_, i) => { const xs = allClosed.filter(t => { const w = wib(t.date); return Number(w.year) === year && w.mi === i; }); return { i, n: xs.length, pnl: sumOf(xs, t => t.pnl), pc: xs.reduce((a, t) => chainAdd(a, tradePct(account, t)), 0), wins: xs.filter(t => t.pnl > 0).length }; });
    const MN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const ms = mon[mSel];
    const mpct = p => { const a = Math.abs(p); return (p > 0.004 ? '+' : p < -0.004 ? '-' : '') + (a >= 10 ? a.toFixed(1) : a.toFixed(2)) + '%'; };
    const syms = [...new Set(sorted.map(t => t.symbol))].map(s => { const xs = sorted.filter(t => t.symbol === s); return { s, n: xs.length, pnl: sumOf(xs, t => t.pnl) }; }).sort((a, b) => b.n - a.n);
    const maxSym = Math.max(1, ...syms.map(x => Math.abs(x.pnl)));
    /* Sorotan akun (garis waktu): balance, hari terbaik, drawdown terdalam, hari terburuk, titik mulai */
    const tlSummary = () => {
        const nD = dayKeys.length, gcol = EJC("#34d399"), rcol = EJC("#ff6b81");
        if (!nD) return React.createElement("p", { className: "pe-empty" }, "Belum ada data.");
        const eq = cumS.map(c => (account.balance || 0) + c), cur = eq[nD - 1], dv = dayKeys.map(k => dayMap[k]);
        let pkI = 0; eq.forEach((v, i) => { if (v >= eq[pkI]) pkI = i; });
        let gs = 0; for (let i = nD - 1; i >= 0 && dv[i] > 0; i--) gs++;
        let bi = 0; dv.forEach((v, i) => { if (v > dv[bi]) bi = i; });
        let wi = 0; dv.forEach((v, i) => { if (v < dv[wi]) wi = i; });
        let di = 0; ddS.forEach((v, i) => { if (v < ddS[di]) di = i; });
        const nT = k => sorted.filter(t => wib(t.date).day === k).length;
        let rec = -1; if (ddS[di] < 0) { const pk = cumS[di] - ddS[di]; for (let j = di + 1; j < nD; j++) if (cumS[j] >= pk) { rec = j - di; break; } }
        const It = (d, col, title, desc, chart, last) => React.createElement("div", { className: "tl-it", key: title },
            React.createElement("span", { className: "tl-d" }, d),
            React.createElement("div", { className: "tl-r" }, React.createElement("i", { style: { background: col } }), !last && React.createElement("b", null)),
            React.createElement("div", { className: "tl-b" }, React.createElement("strong", null, title), React.createElement("p", null, desc), chart));
        const items = [];
        items.push(It(lab[pkI === nD - 1 ? nD - 1 : pkI], gcol, pkI === nD - 1 && nD > 1 ? 'Balance tertinggi baru' : `Balance tertinggi ${fm(eq[pkI])}`, pkI === nD - 1 ? (gs >= 2 ? `${gs} hari hijau berturut-turut, balance di ${fm(cur)}` : `Balance sekarang ${fm(cur)}`) : `Sekarang ${fm(cur)}, ${fm(cur - eq[pkI])} dari puncak`));
        if (dv[bi] > 0) items.push(It(lab[bi], gcol, `Hari terbaik: ${sg(dv[bi])}`, `${nT(dayKeys[bi])} trade pada hari itu`, nD > 2 ? React.createElement(TlBars, { vals: dv.slice(Math.max(0, bi - 4), bi + 5), h: 56 }) : null));
        if (ddS[di] < 0) items.push(It(lab[di], rcol, `Drawdown terdalam ${fm(ddS[di])}`, rec >= 0 ? `Pulih penuh dalam ${rec} hari trading` : 'Belum pulih penuh dari puncak', nD > 2 ? React.createElement(TlLine, { vals: ddS, h: 56, col: rcol, zero: true }) : null));
        if (dv[wi] < 0) items.push(It(lab[wi], rcol, `Hari terburuk ${fm(dv[wi])}`, `${nT(dayKeys[wi])} trade, rugi harian terbesar`));
        items.push(It(lab[0], 'currentColor', `Mulai dengan modal ${fm(account.balance || 0)}`, `Hari pertama ${sg(dv[0])}`, null, true));
        return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "tl-top" },
                React.createElement("div", null, React.createElement("small", null, "BALANCE"), React.createElement("b", null, fm(cur))),
                React.createElement("div", { className: "tl-gn" }, React.createElement("b", { className: tone(total) }, sg(total)), React.createElement("small", null, `${fp(pctChain(account, filtered))} · ${nD} hari`))),
            React.createElement(TlLine, { vals: eq, h: 96, col: eq[nD - 1] >= eq[0] ? gcol : rcol }),
            React.createElement("div", { className: "tl-list" }, items));
    };
    const [dnaOpen, setDnaOpen] = useState(true);
    const cy = view.y, cm = view.m;
    const cdays = new Date(cy, cm + 1, 0).getDate();
    const coff = (new Date(cy, cm, 1).getDay() + 6) % 7;
    const cinfo = trades.reduce((a, t) => { const k = dateOnly(t.date); const x = (a[k] || (a[k] = { pnl: 0, n: 0 })); x.pnl += t.status === 'closed' ? (Number(t.pnl) || 0) : 0; x.n += 1; return a; }, {});
    const cmPnl = Object.keys(cinfo).filter(k => k.startsWith(`${cy}-${String(cm + 1).padStart(2, '0')}`)).reduce((a, k) => a + cinfo[k].pnl, 0);
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const mMap = {};
    sorted.forEach(t => { const m = wib(t.date).month; mMap[m] = (mMap[m] || 0) + (Number(t.pnl) || 0); });
    const mKeys = Object.keys(mMap);
    const mWin = mKeys.filter(k => mMap[k] > 0).length;
    const dWin = dayKeys.filter(k => dayMap[k] > 0).length;
    const dnaOK = sorted.length >= 3;
    const dnaDD = ddChain(account, filtered);
    const rf = maxDd ? total / maxDd : (total > 0 ? 3 : 0);
    const rsA = sorted.map(t => { const r = riskFor(t.entry, t.sl, t.lots, t.symbol); return r ? (Number(t.pnl) || 0) / r : null; }).filter(v => v !== null);
    const avgLossAbs = losses.length ? gL / losses.length : 0;
    const expR = rsA.length ? rsA.reduce((a, b) => a + b, 0) / rsA.length : (avgLossAbs && sorted.length ? (total / sorted.length) / avgLossAbs : 0);
    const slPct = sorted.length ? sorted.filter(t => t.sl !== null && t.sl !== undefined && t.sl !== '').length / sorted.length * 100 : 0;
    const lotsA = sorted.map(t => Number(t.lots) || 0);
    const meanL = lotsA.length ? lotsA.reduce((a, b) => a + b, 0) / lotsA.length : 0;
    const cvL = meanL ? Math.sqrt(lotsA.reduce((a, b) => a + (b - meanL) ** 2, 0) / lotsA.length) / meanL : 0;
    let mart = 0, streak = 0, maxStreak = 0;
    sorted.forEach((t, i) => { if (i > 0 && sorted[i - 1].pnl < 0 && (Number(t.lots) || 0) > (Number(sorted[i - 1].lots) || 0) * 1.5)
        mart++; if (t.pnl < 0) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
    }
    else
        streak = 0; });
    const martFlag = mart >= 2;
    const sKons = Math.round((mKeys.length ? mWin / mKeys.length * 100 : 0) * .5 + (dayKeys.length ? dWin / dayKeys.length * 100 : 0) * .5);
    const sProf = Math.round(clamp(((pf === Infinity ? 3 : pf) - .5) / 2) * 100 * .6 + clamp((expR + .2) / .8) * 100 * .4);
    const sRisk = Math.round(clamp(1 - dnaDD / 30) * 100 * .6 + clamp(rf / 3) * 100 * .4);
    const sDisc = Math.round(slPct * .5 + clamp(1 - cvL) * 100 * .3 + (martFlag ? 0 : 100) * .2);
    const sRes = Math.round(clamp(1 - (Math.max(maxStreak, 1) - 1) / 9) * 100 * .6 + clamp(rf / 3) * 100 * .4);
    const band = v => v >= 75 ? 0 : v >= 50 ? 1 : 2;
    const BL = [['Kuat', 'pos'], ['Cukup', 'mid'], ['Perlu perbaikan', 'neg']];
    const dims = [
        { name: 'Konsistensi', short: 'Konsistensi', score: sKons, meta: `${mWin}/${mKeys.length} bulan profit · ${dayKeys.length ? Math.round(dWin / dayKeys.length * 100) : 0}% hari profit`, desc: 'Seberapa teratur profit datang — dihitung dari persentase bulan dan hari yang berakhir profit.', tip: ['Konsistensi bagus — profit datang secara teratur. Pertahankan target harian yang realistis dan jangan memaksa trade di hari yang sudah profit.', 'Kejar keteraturan, bukan jackpot. Tetapkan target harian yang realistis dan berhenti setelah tercapai; satu hari rugi besar bisa menghapus akumulasi berhari-hari.', 'Hasil masih naik-turun. Kejar keteraturan, bukan jackpot; fokus pada setup berkualitas dan batasi jumlah trade per hari.'][band(sKons)] },
        { name: 'Profitabilitas', short: 'Profit', score: sProf, meta: `Profit Factor ${pf === Infinity ? '∞' : pf.toFixed(2)} · ekspektasi ${expR > 0 ? '+' : ''}${expR.toFixed(2)}R/trade`, desc: 'Kualitas cuan — dari Profit Factor (total profit ÷ total rugi) dan ekspektasi rata-rata per trade.', tip: ['Profit Factor sehat. Jaga disiplin rasio risk:reward dan jangan menahan posisi rugi melewati batas.', 'Profit Factor cukup. Tingkatkan rasio risk:reward (minimal 1:1.5) dan potong posisi rugi lebih cepat.', 'Profit Factor rendah — rugi lebih besar dari untung. Perbaiki rasio risk:reward dan evaluasi setup yang paling sering gagal.'][band(sProf)] },
        { name: 'Manajemen Risiko', short: 'Risiko', score: sRisk, meta: `Max drawdown ${dnaDD.toFixed(1)}% · recovery ${rf.toFixed(1)}×`, desc: 'Ketahanan modal — dari max drawdown (penurunan terdalam) dan recovery factor (profit ÷ drawdown).', tip: ['Drawdown terkendali. Pertahankan risiko kecil per trade agar kurva ekuitas tetap halus.', 'Drawdown mulai terasa. Turunkan risiko per trade ke 1–2% modal agar modal tak cepat tergerus.', `Drawdown ${dnaDD.toFixed(1)}% tergolong dalam. Kecilkan risiko per trade ke 1–2% modal saja agar kurva ekuitas lebih halus dan modal tak cepat tergerus saat rentetan rugi.`][band(sRisk)] },
        { name: 'Disiplin', short: 'Disiplin', score: sDisc, meta: `Lot ${cvL < .25 ? 'Stabil' : 'Agresif'} · SL dipakai di ${slPct.toFixed(0)}% trade${martFlag ? ' · terdeteksi martingale' : ''}`, desc: 'Kepatuhan pada aturan — dari kestabilan ukuran lot dan pemakaian Stop Loss.', tip: [slPct < 80 ? `Hanya ${slPct.toFixed(0)}% trade memakai Stop Loss — ini titik lemah terbesar. Pasang SL di SETIAP posisi supaya satu trade tak pernah bisa menghabiskan akun.` : '', martFlag ? 'Hentikan pula kebiasaan menaikkan lot setelah rugi (martingale); tetapkan lot yang tetap.' : (cvL >= .25 ? 'Ukuran lot masih berubah-ubah; tetapkan lot yang tetap.' : '')].filter(Boolean).join(' ') || 'Disiplin sudah baik — pertahankan lot yang stabil dan SL di setiap posisi.' },
        { name: 'Ketahanan', short: 'Ketahanan', score: sRes, meta: `Rugi beruntun maks ${maxStreak}× · recovery ${rf.toFixed(1)}×`, desc: 'Kemampuan bangkit dari tekanan — dari rentetan rugi beruntun terpanjang dan recovery factor.', tip: ['Sangat tahan banting. Rentetan rugi pendek dan cepat pulih — pertahankan dengan SL dan risiko per trade yang kecil.', 'Cukup tahan banting. Rentetan rugi terkendali — jaga agar tetap begitu dengan SL dan risiko per trade yang kecil.', `Rentetan rugi sampai ${maxStreak}× terlalu panjang. Berhenti sejenak setelah 3 rugi beruntun dan kecilkan lot sampai performa pulih.`][band(sRes)] }
    ];
    const overall = Math.round(dims.reduce((a, d) => a + d.score, 0) / 5);
    const grade = overall >= 85 ? 'A' : overall >= 70 ? 'B' : overall >= 55 ? 'C' : overall >= 40 ? 'D' : 'E';
    const strong = dims.reduce((a, b) => b.score > a.score ? b : a), weak = dims.reduce((a, b) => b.score < a.score ? b : a);
    const RC = 95, rp = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return [130 + Math.cos(a) * RC * v / 100, 130 + Math.sin(a) * RC * v / 100]; };
    const bar = (w, pos) => React.createElement("div", { className: "pe-bar" },
        React.createElement("i", { style: { width: `${Math.max(2, w)}%`, background: pos ? EJC("#34d399") : EJC("#ff6b81") } }));
    const calInner = () => React.createElement(React.Fragment, null,
            React.createElement("div", { className: "cal-nav" },
                React.createElement("button", { className: "icon-btn", onClick: () => { const d = new Date(cy, cm - 1, 1); onPickMonth(d.getFullYear(), d.getMonth()); } },
                    React.createElement(ChevronLeft, { size: 16 })),
                React.createElement("strong", null, new Date(cy, cm, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })),
                React.createElement("button", { className: "icon-btn", onClick: () => { const d = new Date(cy, cm + 1, 1); onPickMonth(d.getFullYear(), d.getMonth()); } },
                    React.createElement(ChevronRight, { size: 16 }))),
            React.createElement("div", { className: "cal-week" }, ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(x => React.createElement("span", { key: x }, x))),
            React.createElement("div", { className: "cal-grid" },
                Array.from({ length: coff }, (_, i) => React.createElement("div", { className: "cal-cell empty", key: 'e' + i })),
                Array.from({ length: cdays }, (_, i) => { const d = i + 1; const iso = `${cy}-${String(cm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; const v = cinfo[iso]; return React.createElement("button", { key: iso, className: `cal-cell ${v ? (v.pnl > 0 ? 'win' : v.pnl < 0 ? 'loss' : 'flat') : ''}`, onClick: () => v && onSelectDate && onSelectDate(iso) },
                    React.createElement("span", { className: "cal-day" }, d),
                    v && React.createElement(React.Fragment, null,
                        React.createElement("b", null,
                            v.pnl > 0 ? '+' : '',
                            Math.round(v.pnl * 100) / 100),
                        React.createElement("small", null,
                            v.n,
                            " posisi"))); })),
            React.createElement("p", { className: "pe-note" }, "Ketuk tanggal yang punya posisi untuk membuka jurnal hari itu."));
    return React.createElement("div", { className: `pe ${mode === 'dna' ? 'only-dna' : mode === 'advanced' ? 'only-advanced' : ''}` },
        !flat && React.createElement("div", { className: "pe-card" },
            React.createElement("div", { className: "pe-head" },
                React.createElement("h3", null, "Kalender"),
                React.createElement("b", { className: tone(cmPnl) }, sg(cmPnl))),
            calInner()),
        (() => {
            const hh = p => React.createElement(PerfHubHead, { ...p, mode: hub, onMode: setHub, onBack });
            if (hub === 'posisi' || hub === 'entri' || hub === 'bulan') {
                if (hub === 'bulan') return React.createElement(DrillDown, { flat, key: account.id + '-dd', account: account, trades: filtered, rangeText: rangeText, hubHead: hh });
                return React.createElement(EntryPerf, { flat, key: account.id + '-ep-' + hub, account: account, trades: filtered, rangeText: rangeText, mode: hub, hubHead: hh });
            
            }
            if (hub === 'kal') return React.createElement("div", { className: "pg pg-cal" },
                hh({ sub: `Total P&L bulan ini \u00B7 ${sg(cmPnl)}` }),
                calInner());
            if (hub === 'mg') return React.createElement(React.Fragment, null,
            React.createElement("div", { className: (flat ? "pg" : "pe-card") + " mg" },
            React.createElement(PerfHubHead, { mode: 'mg', onMode: setHub, onBack, sub: `Ringkasan performa bulanan · ${MN[mSel]} ${year}`, lockBtn: React.createElement("div", { className: "mg-years" },
                React.createElement("button", { type: "button", "aria-label": "Tahun sebelumnya", onClick: () => onPickMonth(year - 1, mSel) }, React.createElement(ChevronLeft, { size: 16 })),
                React.createElement("span", null, year),
                React.createElement("button", { type: "button", "aria-label": "Tahun berikutnya", onClick: () => onPickMonth(year + 1, mSel) }, React.createElement(ChevronRight, { size: 16 }))) }),
            React.createElement("div", { className: "mg-body" },
                React.createElement("div", { className: "mg-stats" }, [
                    ['Gain ' + MN[ms.i], fp(ms.pc), tone(ms.pnl), 'ChartUp'],
                    ['Profit', sg(ms.pnl), tone(ms.pnl), 'Coins'],
                    ['Trades', ms.n, '', 'BarChart3'],
                    ['Win rate', (ms.n ? Math.round(ms.wins / ms.n * 100) : 0) + '%', '', 'Shield']
                ].map(([l, v, tn, ic]) => React.createElement("div", { className: "mg-stat", key: l },
                    React.createElement("i", { className: "mg-ic" }, React.createElement(Icon, { name: ic, size: 18 })),
                    React.createElement("div", null, React.createElement("span", null, l), React.createElement("b", { className: tn }, v))))),
                (() => {
                    const gp = ms.pc, mxA = Math.max(1, ...mon.map(z => Math.abs(z.pc)), Math.abs(gp));
                    const top = mxA < 10 ? Math.ceil(mxA / 2) * 2 : Math.ceil(mxA / 5) * 5;
                    const R = 78, CX = 110, CY = 100, A0 = Math.PI, frac = Math.min(1, Math.abs(gp) / top);
                    const pt = a => [CX + R * Math.cos(a), CY - R * Math.sin(a)];
                    const arc = f => { const [x0, y0] = pt(A0), [x1, y1] = pt(A0 - Math.PI * f); return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };
                    const col = gp >= 0 ? EJC("#34d399") : EJC("#ff6b81");
                    return React.createElement("div", { className: "mg-gauge" },
                        React.createElement("svg", { viewBox: "0 0 220 124", role: "img", "aria-label": `Gain ${MN[ms.i]} ${fp(ms.pc)}` },
                            React.createElement("path", { d: arc(1), className: "mg-track" }),
                            frac > 0 && React.createElement("path", { d: arc(frac), className: "mg-val", style: { stroke: col } }),
                            React.createElement("text", { x: 30, y: 118, className: "mg-tick", textAnchor: "middle" }, "0%"),
                            React.createElement("text", { x: 190, y: 118, className: "mg-tick", textAnchor: "middle" }, `${gp < 0 ? '-' : '+'}${top}%`)),
                        React.createElement("div", { className: "mg-gv" },
                            React.createElement("small", null, "Monthly gain"),
                            React.createElement("b", { className: tone(ms.pnl) }, fp(ms.pc)),
                            React.createElement("small", null, "Gain di " + MN[ms.i] + " " + year)));
                })()),
            React.createElement("div", { className: "mg-lbl" }, "Bulan"),
            React.createElement("div", { className: "mg-row" }, mon.map(m => React.createElement("button", { key: m.i, type: "button", className: mSel === m.i ? 'sel' : '', onClick: () => onPickMonth(year, m.i), ref: mSel === m.i ? (el => { if (el && el.parentNode && el.parentNode.scrollWidth > el.parentNode.clientWidth) el.parentNode.scrollLeft = el.offsetLeft - (el.parentNode.clientWidth - el.offsetWidth) / 2; }) : undefined },
                React.createElement("span", null, MN[m.i]),
                React.createElement("em", { className: m.n ? (m.pnl > 0 ? 'pos' : m.pnl < 0 ? 'neg' : '') : 'nil' }, m.n ? sg(m.pnl) : '–')))),
            React.createElement("div", { className: `mg-note ${ms.n ? (ms.pnl > 0 ? 'pos' : ms.pnl < 0 ? 'neg' : '') : ''}` },
                React.createElement("b", null, !ms.n ? `Belum ada trade di ${MN[ms.i]}` : ms.pnl > 0 ? `Progres bagus di ${MN[ms.i]}` : ms.pnl < 0 ? `${MN[ms.i]} perlu evaluasi` : `${MN[ms.i]} impas`),
                React.createElement("span", null, `Trades ${ms.n}  |  Win rate ${ms.n ? Math.round(ms.wins / ms.n * 100) : 0}%  |  Profit ${sg(ms.pnl)}`))));
            if (hub === 'adv') return React.createElement("div", { className: (flat ? "pg" : "pe-card") + " hub-adv" }, hh({ sub: `Statistik lengkap akun \u00B7 ${sorted.length} trade` }), advancedStats);
            if (hub === 'pair') {
                const N = sorted.length, byP = syms.slice().sort((x, y) => y.pnl - x.pnl);
                const best = byP[0], pop = syms[0];
                const COL = ['#6b8dff', '#34d399', '#f5b942', '#ff6b81', '#a78bfa', '#22d3ee', '#fb923c', '#94a3b8'];
                const R = 44, C = 2 * Math.PI * R; let off = 0;
                return React.createElement("div", { className: (flat ? "pg" : "pe-card") + " pm" },
                    hh({ sub: `${syms.length} pair \u00B7 ${N} trade \u00B7 ${!rangeText || rangeText === 'All time' ? 'Semua periode' : rangeText}` }),
                    !syms.length ? React.createElement("p", { className: "pe-empty" }, "Belum ada data.") : React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "pm-dn" },
                            React.createElement("svg", { viewBox: "0 0 120 120", width: 124, height: 124, role: "img", "aria-label": `Porsi trade per pair, ${N} trade` },
                                React.createElement("circle", { cx: 60, cy: 60, r: R, fill: "none", stroke: "currentColor", strokeOpacity: .12, strokeWidth: 16 }),
                                syms.map((x, i) => { const len = x.n / N * C; const el = React.createElement("circle", { key: x.s, cx: 60, cy: 60, r: R, fill: "none", stroke: COL[i % COL.length], strokeWidth: 16, strokeDasharray: `${Math.max(0, len - (syms.length > 1 ? 1.5 : 0))} ${C}`, strokeDashoffset: -off, transform: "rotate(-90 60 60)" }); off += len; return el; }),
                                React.createElement("text", { x: 60, y: 57, textAnchor: "middle", className: "pm-dt1" }, N),
                                React.createElement("text", { x: 60, y: 74, textAnchor: "middle", className: "pm-dt2" }, "trade")),
                            React.createElement("div", { className: "pm-dl" },
                                React.createElement("span", null, "Terbaik", React.createElement("b", { className: tone(best.pnl) }, `${best.s} ${sg(best.pnl)}`)),
                                React.createElement("span", null, "Terpopuler", React.createElement("b", null, `${pop.s} \u00B7 ${pop.n} trade`)))),
                        syms.map((x, i) => React.createElement("div", { className: "pm-lr", key: x.s },
                            React.createElement("i", { style: { background: COL[i % COL.length] } }),
                            React.createElement("b", null, x.s),
                            React.createElement("span", null, `${x.n} \u00B7 ${(x.n / N * 100).toFixed(1)}%`),
                            React.createElement("b", { className: tone(x.pnl) }, sg(x.pnl))))));
            }
            return React.createElement("div", { className: flat ? "pg" : "pe-card" },
            React.createElement(PerfHubHead, { mode: 'all', onMode: setHub, onBack, sub: `Sorotan akun · ${!rangeText || rangeText === 'All time' ? 'Semua periode' : rangeText}` }),
            tlSummary(),
            React.createElement("div", { className: "pe-cap" },
                React.createElement("span", null,
                    React.createElement("i", { className: "dot g" }),
                    "Setoran ",
                    dep.length,
                    "\u00D7 ",
                    React.createElement("b", { className: "pos" }, fm(depSum))),
                React.createElement("span", null,
                    React.createElement("i", { className: "dot r" }),
                    "Penarikan ",
                    wdr.length,
                    "\u00D7 ",
                    React.createElement("b", { className: "neg" }, fm(wdSum)))),
            hist.length > 0 && React.createElement("button", { className: "pe-link", onClick: () => setShowDet(!showDet) },
                "Rincian ",
                showDet ? '▴' : '▾'),
            showDet && React.createElement("div", { className: "pe-chips" }, hist.slice().sort((a, b) => String(a.date).localeCompare(String(b.date))).map((h, i) => { const w = h.type === 'withdraw'; return React.createElement("div", { key: i, className: w ? 'neg' : 'pos' },
                React.createElement("span", null, fmtLong(String(h.date).slice(0, 10)) + (String(h.date).length > 10 ? ' ' + String(h.date).slice(11, 19) : '')),
                React.createElement("b", null,
                    w ? '-' : '+',
                    fm(h.amount))); })));
        })(),
        React.createElement("div", { className: "dna-title" },
            React.createElement("small", { className: "pe-sub2" }, "Rapor karakter trading berbasis data")),
        React.createElement("div", { className: "pe-card dna" },
            React.createElement("div", { className: "pe-head" },
                React.createElement("h3", { className: "dna-sh" },
                    React.createElement(Activity, { size: 18 }),
                    " Skor Keseluruhan"),
                dnaOK && React.createElement("span", { className: `dna-grade g${grade}` },
                    "Grade ",
                    grade,
                    " \u00B7 ",
                    overall)),
            !dnaOK ? React.createElement("p", { className: "pe-empty" }, "Butuh minimal 3 trade closed pada periode ini untuk membaca karakter trading.") : React.createElement(React.Fragment, null,
                React.createElement("div", { className: "dna-top" },
                    React.createElement("svg", { viewBox: "-40 0 340 260", className: "dna-radar" },
                        [25, 50, 75, 100].map(l => React.createElement("polygon", { key: l, points: dims.map((_, i) => rp(i, l).join(',')).join(' '), fill: "none", stroke: EJC("#233252"), strokeWidth: "1" })),
                        dims.map((_, i) => { const p = rp(i, 100); return React.createElement("line", { key: i, x1: "130", y1: "130", x2: p[0], y2: p[1], stroke: EJC("#233252"), strokeWidth: "1" }); }),
                        React.createElement("polygon", { points: dims.map((d, i) => rp(i, d.score).join(',')).join(' '), fill: EJC("#7c5cff"), fillOpacity: ".28", stroke: EJC("#9b82ff"), strokeWidth: "2.5" }),
                        dims.map((d, i) => { const p = rp(i, 122); return React.createElement("text", { key: d.name, x: p[0], y: p[1] + 4, textAnchor: "middle", fontSize: "11", fill: EJC("#9aa7c5") }, d.short); })),
                    React.createElement("div", { className: "dna-bars" }, dims.map(d => React.createElement("div", { key: d.name },
                        React.createElement("div", { className: "dna-barhead" },
                            React.createElement("span", null, d.name),
                            React.createElement("b", null, d.score)),
                        React.createElement("div", { className: "pe-bar" },
                            React.createElement("i", { style: { width: `${Math.max(2, d.score)}%`, background: EJC("#7c5cff") } })))))),
                React.createElement("p", { className: "dna-quick" },
                    React.createElement("b", null, "Baca cepat:"),
                    " Terkuat di ",
                    React.createElement("b", null, strong.name),
                    ", paling bisa ditingkatkan di ",
                    React.createElement("b", null, weak.name),
                    ". Grade ",
                    grade,
                    " artinya skor rata-rata ",
                    overall,
                    "/100 dari 5 dimensi di bawah."),
                React.createElement("button", { className: "pe-link", onClick: () => setDnaOpen(!dnaOpen) },
                    dnaOpen ? '▾' : '▸',
                    " Rincian skor & cara menjadi lebih baik"),
                dnaOpen && dims.map(d => { const b = BL[band(d.score)]; return React.createElement("div", { key: d.name, className: `dna-item ${b[1]}` },
                    React.createElement("div", { className: "dna-ihead" },
                        React.createElement("strong", null, d.name),
                        React.createElement("span", { className: `dna-badge ${b[1]}` },
                            d.score,
                            "/100 \u00B7 ",
                            b[0]),
                        React.createElement("small", { className: "dna-meta" }, d.meta)),
                    React.createElement("p", null, d.desc),
                    React.createElement("p", null,
                        React.createElement("b", { className: `dna-tip ${b[1]}` }, "Cara tingkatkan:"),
                        " ",
                        d.tip)); }),
                React.createElement("p", { className: "pe-note" }, "Skor edukatif berbasis data (profit factor, drawdown, konsistensi, lot & SL). Bukan rekomendasi investasi."))));
}
