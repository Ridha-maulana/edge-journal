/* Performa per bulan, Trader DNA, grafik tambahan */
"use strict";
function PerfExtra({ account, trades, filtered, total, maxDd, onSelectDate, view, onPickMonth, onResetAll, rangeText, mode = 'all', advancedStats }) {
    const cur = account.currency;
    const fm = n => money(n, cur);
    const sg = n => `${n > 0 ? '+' : ''}${fm(n)}`;
    const [ct, setCt] = useState('growth');
    const [showDet, setShowDet] = useState(false);
    const nowW = wib(new Date());
    const year = view.y, mSel = view.m;
    const hist = account.capitalHistory || [];
    const dep = hist.filter(h => h.type !== 'withdraw'), wdr = hist.filter(h => h.type === 'withdraw');
    const depSum = sumOf(dep, h => h.amount), wdSum = sumOf(wdr, h => h.amount);
    const start = Math.max((account.balance || 0) - depSum + wdSum, 1);
    const sorted = filtered.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    const wins = sorted.filter(t => t.pnl > 0), losses = sorted.filter(t => t.pnl < 0);
    const gW = sumOf(wins, t => t.pnl), gL = Math.abs(sumOf(losses, t => t.pnl));
    const pf = gL ? gW / gL : (gW ? Infinity : 0);
    const dayMap = {};
    sorted.forEach(t => { const k = wib(t.date).day; dayMap[k] = (dayMap[k] || 0) + (Number(t.pnl) || 0); });
    const dayKeys = Object.keys(dayMap).sort();
    const monthProfit = sumOf(sorted.filter(t => wib(t.date).month === nowW.month), t => t.pnl);
    const rrs = filtered.map(t => { const r = riskFor(t.entry, t.sl, t.lots, t.symbol), w = rewardFor(t.entry, t.tp, t.lots, t.symbol); return r && w ? w / r : null; }).filter(Boolean);
    const avgRR = rrs.length ? rrs.reduce((a, b) => a + b, 0) / rrs.length : null;
    const pcs = (v, b) => `${v > 0 ? '+' : ''}${(v / (b || 1) * 100).toFixed(2)}%`;
    const tiles = [['Gain', pcs(total, start), tone(total)], ['Abs. gain', pcs(total, start + depSum), tone(total)], ['Daily (rata-rata)', pcs(dayKeys.length ? total / dayKeys.length : 0, account.balance), tone(total)], ['Monthly (bulan ini)', pcs(monthProfit, account.balance), tone(monthProfit)], ['Drawdown', `${maxDd ? '-' : ''}${(maxDd / (account.balance || 1) * 100).toFixed(2)}%`, maxDd ? 'neg' : ''], ['Win rate', `${sorted.length ? (wins.length / sorted.length * 100).toFixed(0) : 0}%`, sorted.length ? (wins.length / sorted.length >= .5 ? 'pos' : 'neg') : ''], ['Profit factor', pf === Infinity ? '∞' : pf.toFixed(2), pf >= 1 ? 'pos' : pf > 0 ? 'neg' : ''], ['Avg R:R', avgRR ? avgRR.toFixed(1) : '—', ''], ['Trades', String(sorted.length), ''], ['Profit', sg(total), tone(total)], ['Balance', fm(account.balance), ''], ['Equity', fm(account.balance + total), tone(total)], ['Deposits', fm(depSum), 'pos'], ['Withdrawals', fm(wdSum), wdSum ? 'neg' : '']];
    let cum = 0, peak = 0;
    const cumS = [], ddS = [];
    dayKeys.forEach(k => { cum += dayMap[k]; peak = Math.max(peak, cum); cumS.push(cum); ddS.push(cum - peak); });
    const lab = dayKeys.map(k => `${k.slice(8)}/${k.slice(5, 7)}`);
    const CT = { growth: { v: cumS.map(c => c / start * 100), k: 'line', f: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`, t: 'Growth (% dari modal awal)' }, balance: { v: cumS.map(c => account.balance + c), k: 'line', f: v => `$${Math.round(v)}`, t: 'Balance / equity' }, profit: { v: cumS, k: 'line', f: v => `$${Math.round(v)}`, t: 'Profit kumulatif' }, daily: { v: dayKeys.map(k => dayMap[k]), k: 'bar', f: v => `$${Math.round(v)}`, t: 'P&L harian (WIB)' }, dd: { v: ddS, k: 'line', f: v => `$${Math.round(v)}`, t: 'Drawdown dari puncak' } }[ct];
    const allClosed = trades.filter(t => t.status === 'closed');
    const mon = Array.from({ length: 12 }, (_, i) => { const xs = allClosed.filter(t => { const w = wib(t.date); return Number(w.year) === year && w.mi === i; }); return { i, n: xs.length, pnl: sumOf(xs, t => t.pnl), wins: xs.filter(t => t.pnl > 0).length }; });
    const MN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const ms = mon[mSel];
    const mpct = v => { const p = v / (start || 1) * 100, a = Math.abs(p); return (p > 0.004 ? '+' : p < -0.004 ? '-' : '') + (a >= 10 ? a.toFixed(1) : a.toFixed(2)) + '%'; };
    const syms = [...new Set(sorted.map(t => t.symbol))].map(s => { const xs = sorted.filter(t => t.symbol === s); return { s, n: xs.length, pnl: sumOf(xs, t => t.pnl) }; }).sort((a, b) => b.n - a.n);
    const maxSym = Math.max(1, ...syms.map(x => Math.abs(x.pnl)));
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
    const dnaDD = maxDd / Math.max(account.balance, 1) * 100;
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
        React.createElement("i", { style: { width: `${Math.max(2, w)}%`, background: pos ? '#34d399' : '#ff6b81' } }));
    return React.createElement("div", { className: `pe ${mode === 'dna' ? 'only-dna' : mode === 'advanced' ? 'only-advanced' : ''}` },
        React.createElement("div", { className: "pe-card" },
            React.createElement("div", { className: "pe-head" },
                React.createElement("h3", null, "Kalender"),
                React.createElement("b", { className: tone(cmPnl) }, sg(cmPnl))),
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
            React.createElement("p", { className: "pe-note" }, "Ketuk tanggal yang punya posisi untuk membuka jurnal hari itu.")),
        React.createElement("div", { className: "pe-card" },
            React.createElement("div", { className: "pe-head" },
                React.createElement("h3", null, "Monthly gain"),
                React.createElement("div", { className: "pe-years" },
                    React.createElement("button", { onClick: () => onPickMonth(year - 1, mSel) }, "\u2039"),
                    React.createElement("span", null, year),
                    React.createElement("button", { onClick: () => onPickMonth(year + 1, mSel) }, "\u203A"))),
            React.createElement("div", { className: "pe-months" }, mon.map(m => { const mx = Math.max(1, ...mon.map(z => Math.abs(z.pnl))); return React.createElement("button", { key: m.i, className: mSel === m.i ? 'sel' : '', onClick: () => onPickMonth(year, m.i) },
                m.n > 0 && React.createElement("em", { className: `pe-mp ${m.pnl > 0 ? 'pos' : m.pnl < 0 ? 'neg' : ''}` }, mpct(m.pnl)),
                React.createElement("i", { style: { height: `${m.n ? Math.max(6, Math.abs(m.pnl) / mx * 60) : 2}px`, background: m.pnl >= 0 ? '#34d399' : '#ff6b81', opacity: m.n ? 1 : .25 } }),
                React.createElement("small", null, MN[m.i])); })),
            React.createElement("div", { className: "pe-sum" },
                React.createElement("div", null,
                    React.createElement("span", null,
                        "Gain ",
                        MN[ms.i]),
                    React.createElement("b", { className: tone(ms.pnl) }, pcs(ms.pnl, start))),
                React.createElement("div", null,
                    React.createElement("span", null, "Profit"),
                    React.createElement("b", { className: tone(ms.pnl) }, sg(ms.pnl))),
                React.createElement("div", null,
                    React.createElement("span", null, "Trades"),
                    React.createElement("b", null, ms.n)),
                React.createElement("div", null,
                    React.createElement("span", null, "Win rate"),
                    React.createElement("b", null,
                        ms.n ? Math.round(ms.wins / ms.n * 100) : 0,
                        "%")))),
        React.createElement("div", { className: "pe-card" },
            React.createElement("div", { className: "pe-tabs icon-tabs" }, [['growth', 'Growth', 'ChartUp'], ['balance', 'Balance', 'Scale'], ['profit', 'Profit', 'Coins'], ['daily', 'Daily P&L', 'ChartPie'], ['dd', 'Drawdown', 'ChartDown']].map(([k, l, ic]) => React.createElement("button", { key: k, type: "button", className: ct === k ? 'on' : '', "aria-label": l, title: l, onClick: () => setCt(k) }, React.createElement(Icon, { name: ic, size: 21 })))),
            React.createElement("p", { className: "pe-sub" }, CT.t),
            React.createElement(MiniChart, { key: ct, vals: CT.v, labels: lab, kind: CT.k, fmt: CT.f }),
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
                React.createElement("span", null, fmtLong(String(h.date).slice(0, 10))),
                React.createElement("b", null,
                    w ? '-' : '+',
                    fm(h.amount))); }))),
        React.createElement(DrillDown, { key: account.id, account: account, trades: filtered, rangeText: rangeText }),
        advancedStats,
        React.createElement("div", { className: "pe-card" },
            React.createElement("h3", null, "P&L per pair"),
            syms.length ? syms.slice().sort((a, b) => b.pnl - a.pnl).map(x => React.createElement("div", { className: "pe-row", key: x.s },
                React.createElement("div", { className: "pe-rowhead" },
                    React.createElement("strong", null, x.s),
                    React.createElement("b", { className: tone(x.pnl) }, sg(x.pnl))),
                bar(Math.abs(x.pnl) / maxSym * 100, x.pnl >= 0))) : React.createElement("p", { className: "pe-empty" }, "Belum ada data.")),
        React.createElement("div", { className: "pe-card" },
            React.createElement("h3", null, "Pair terpopuler"),
            syms.length ? syms.map(x => React.createElement("div", { className: "pe-row", key: x.s },
                React.createElement("div", { className: "pe-rowhead" },
                    React.createElement("strong", null, x.s),
                    React.createElement("span", null,
                        (x.n / sorted.length * 100).toFixed(1),
                        "% (",
                        x.n,
                        ")")),
                React.createElement("div", { className: "pe-bar" },
                    React.createElement("i", { style: { width: `${x.n / sorted.length * 100}%`, background: '#6b8dff' } })))) : React.createElement("p", { className: "pe-empty" }, "Belum ada data.")),
        React.createElement("div", { className: "dna-title" },
            React.createElement("h2", null, "Trader DNA"),
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
                        [25, 50, 75, 100].map(l => React.createElement("polygon", { key: l, points: dims.map((_, i) => rp(i, l).join(',')).join(' '), fill: "none", stroke: "#233252", strokeWidth: "1" })),
                        dims.map((_, i) => { const p = rp(i, 100); return React.createElement("line", { key: i, x1: "130", y1: "130", x2: p[0], y2: p[1], stroke: "#233252", strokeWidth: "1" }); }),
                        React.createElement("polygon", { points: dims.map((d, i) => rp(i, d.score).join(',')).join(' '), fill: "#7c5cff", fillOpacity: ".28", stroke: "#9b82ff", strokeWidth: "2.5" }),
                        dims.map((d, i) => { const p = rp(i, 122); return React.createElement("text", { key: d.name, x: p[0], y: p[1] + 4, textAnchor: "middle", fontSize: "11", fill: "#9aa7c5" }, d.short); })),
                    React.createElement("div", { className: "dna-bars" }, dims.map(d => React.createElement("div", { key: d.name },
                        React.createElement("div", { className: "dna-barhead" },
                            React.createElement("span", null, d.name),
                            React.createElement("b", null, d.score)),
                        React.createElement("div", { className: "pe-bar" },
                            React.createElement("i", { style: { width: `${Math.max(2, d.score)}%`, background: '#7c5cff' } })))))),
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
