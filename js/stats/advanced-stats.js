/* Advanced Statistics: kartu Profitability yang bisa digeser */
"use strict";
function AdvSlides({ rows, note }) {
    const MAX = 10;
    const count = Math.max(1, Math.ceil(rows.length / MAX));
    const per = Math.ceil(rows.length / count);
    const slides = [];
    for (let i = 0; i < rows.length; i += per)
        slides.push(rows.slice(i, i + per));
    const [idx, setIdx] = useState(0);
    const ref = useRef(null);
    function onScroll() { const el = ref.current; if (!el || !el.clientWidth)
        return; const i = Math.round(el.scrollLeft / el.clientWidth); if (i !== idx)
        setIdx(i); }
    function go(i) { const el = ref.current; if (el)
        el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' }); setIdx(i); }
    const last = slides.length - 1;
    return React.createElement("div", { className: "adv-car" },
        React.createElement("div", { className: "adv-segs" }, slides.map((_, i) => React.createElement("button", { type: "button", key: i, className: i <= idx ? 'on' : '', "aria-label": `Slide ${i + 1}`, onClick: () => go(i) }, React.createElement("i", null)))),
        React.createElement("div", { className: "adv-slides", ref: ref, onScroll: onScroll }, slides.map((rs, i) => React.createElement("div", { className: "adv-slide", key: i },
            rs.map(([l, v, t]) => React.createElement("div", { className: "adv-row", key: l },
                React.createElement("span", null, l),
                React.createElement("b", { className: t }, v)))))),
        React.createElement("div", { className: "adv-foot" },
            React.createElement("span", null, `${idx + 1} / ${slides.length}`),
            React.createElement("button", { type: "button", className: "adv-next", onClick: () => go(idx >= last ? 0 : idx + 1) }, idx >= last ? '‹ ULANGI' : 'GESER ›')),
        React.createElement("p", { className: "pe-note adv-note" }, note));
}
function AdvancedStats({ account, filtered, total, maxDd, hwm, view, part = 'all' }) {
    const cur = account.currency;
    const fm = n => money(n, cur);
    const sg = n => `${n > 0 ? '+' : ''}${fm(n)}`;
    const tn = n => n > 0 ? 'pos' : n < 0 ? 'neg' : '';
    const pf1 = (n, d = 1) => `${n > 0 ? '+' : ''}${n.toFixed(d)}`;
    const MSx = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const cl = filtered.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    const n = cl.length;
    const wins = cl.filter(t => t.pnl > 0), losses = cl.filter(t => t.pnl < 0);
    const gW = sumOf(wins, t => t.pnl), gL = Math.abs(sumOf(losses, t => t.pnl));
    const wr = n ? wins.length / n * 100 : 0;
    const pf = gL ? gW / gL : (gW ? Infinity : 0);
    const hist = account.capitalHistory || [];
    const depSum = sumOf(hist.filter(h => h.type !== 'withdraw'), h => h.amount), wdSum = sumOf(hist.filter(h => h.type === 'withdraw'), h => h.amount);
    const start = Math.max((account.balance || 0) - depSum + wdSum, 1);
    const rrs = cl.map(t => { const r = riskFor(t.entry, t.sl, t.lots, t.symbol), w = rewardFor(t.entry, t.tp, t.lots, t.symbol); return r && w ? w / r : null; }).filter(Boolean);
    const avgRR = rrs.length ? rrs.reduce((a, b) => a + b, 0) / rrs.length : null;
    const rsA = cl.map(t => { const r = riskFor(t.entry, t.sl, t.lots, t.symbol); return r ? (Number(t.pnl) || 0) / r : null; }).filter(v => v !== null);
    const aL = losses.length ? gL / losses.length : 0;
    const expR = rsA.length ? rsA.reduce((a, b) => a + b, 0) / rsA.length : (aL && n ? (total / n) / aL : 0);
    const rf = maxDd ? total / maxDd : (total > 0 ? Infinity : 0);
    const avgW = wins.length ? gW / wins.length : 0, avgL = losses.length ? -gL / losses.length : 0;
    const longs = cl.filter(t => t.side === 'Long'), shorts = cl.filter(t => t.side === 'Short');
    const wrOf = a => a.length ? Math.round(a.filter(t => t.pnl > 0).length / a.length * 100) : 0;
    const dm = {};
    cl.forEach(t => { const k = dateOnly(t.date); dm[k] = (dm[k] || 0) + (Number(t.pnl) || 0); });
    const dk = Object.keys(dm);
    const bestK = dk.length ? dk.reduce((a, b) => dm[b] > dm[a] ? b : a) : null;
    const days = dk.length;
    let ws = 0, ls = 0, mw = 0, ml = 0;
    cl.forEach(t => { if (t.pnl > 0) {
        ws++;
        ls = 0;
        mw = Math.max(mw, ws);
    }
    else if (t.pnl < 0) {
        ls++;
        ws = 0;
        ml = Math.max(ml, ls);
    }
    else {
        ws = 0;
        ls = 0;
    } });
    const vk = `${view.y}-${String(view.m + 1).padStart(2, '0')}`;
    const inM = cl.filter(t => dateOnly(t.date).startsWith(vk));
    const mPnl = sumOf(inM, t => t.pnl);
    const pips = cl.map(pipsOf);
    const totalPips = pips.reduce((a, b) => a + b, 0);
    const mPips = sumOf(inM, pipsOf);
    const tpP = wins.map(pipsOf), slP = losses.map(t => Math.abs(pipsOf(t)));
    const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
    const mx = a => a.length ? Math.max(...a) : 0;
    const holds = cl.filter(t => t.closeDate && t.date).map(t => (new Date(t.closeDate) - new Date(t.date)) / 60000).filter(v => isFinite(v) && v >= 0);
    const avgHold = holds.length ? holds.reduce((a, b) => a + b, 0) / holds.length : 0;
    const style = avgHold <= 0 ? '' : avgHold < 60 ? 'Scalping' : avgHold < 1440 ? 'Day trading' : avgHold < 10080 ? 'Swing' : 'Position';
    const rows = [
        ['Total Trades', String(n), ''],
        ['Profit Factor', pf === Infinity ? '∞' : pf.toFixed(2), n ? (pf >= 1 ? 'pos' : 'neg') : ''],
        ['Avg. R:R', avgRR ? avgRR.toFixed(1) : '—', ''],
        ['Expectancy', `${pf1(expR, 2)}R · ${sg(n ? total / n : 0)}`, tn(expR)],
        ['Recovery Factor', rf === Infinity ? '∞' : rf.toFixed(1), n ? (rf >= 1 ? 'pos' : 'neg') : ''],
        ['Avg. Win / Loss', `${sg(avgW)} / ${sg(avgL)}`, ''],
        ['Gross Profit', sg(gW), gW ? 'pos' : ''],
        ['Gross Loss', gL ? `-${fm(gL)}` : fm(0), gL ? 'neg' : ''],
        ['Longs Won', `${wrOf(longs)}% (${longs.length})`, ''],
        ['Shorts Won', `${wrOf(shorts)}% (${shorts.length})`, ''],
        ['Best Day', bestK ? `${sg(dm[bestK])} · ${pf1(dm[bestK] / (account.balance || 1) * 100, 2)}%` : '—', bestK ? tn(dm[bestK]) : ''],
        ['Avg Daily Gain', days ? `${sg(total / days)} · ${pf1(total / days / (account.balance || 1) * 100, 2)}%` : '—', days ? tn(total) : ''],
        ['Max Win Streak', `${mw}×`, mw ? 'pos' : ''],
        ['Max Loss Streak', `${ml}×`, ml ? 'neg' : ''],
        ['Avg Hold', holds.length ? `${fmtHold(avgHold)} · ${style}` : '—', ''],
        ['Perolehan Pips', `${pf1(totalPips)} pips`, tn(totalPips)],
        [`Profit Pips ${MSx[view.m]}`, `${pf1(mPips)} pips`, tn(mPips)],
        ['Average TP Pips', `${avg(tpP).toFixed(1)} pips`, tpP.length ? 'pos' : ''],
        ['Average SL Pips', `${avg(slP).toFixed(1)} pips`, slP.length ? 'neg' : ''],
        ['Max TP Pips', `${mx(tpP).toFixed(1)} pips`, tpP.length ? 'pos' : ''],
        ['Max SL Pips', `${mx(slP).toFixed(1)} pips`, slP.length ? 'neg' : ''],
        ['Profit', sg(total), tn(total)],
        ['Gain', `${pf1(total / start * 100, 2)}%`, tn(total)],
        ['Abs. Gain', `${pf1(total / (start + depSum) * 100, 2)}%`, tn(total)],
        [`Gain ${MSx[view.m]}`, `${pf1(mPnl / start * 100, 2)}% · ${sg(mPnl)}`, tn(mPnl)],
        ['Max Drawdown', maxDd ? `-${fm(maxDd)} · -${(maxDd / (account.balance || 1) * 100).toFixed(2)}%` : fm(0), maxDd ? 'neg' : ''],
        ['High Water Mark', `${hwm > 0 ? '+' : ''}${fm(hwm)}`, hwm > 0 ? 'pos' : ''],
        ['Balance', fm(account.balance), ''],
        ['Equity', fm(account.balance + total), tn(total)],
        ['Deposits', fm(depSum), depSum ? 'pos' : ''],
        ['Withdrawals', fm(wdSum), wdSum ? 'neg' : '']
    ];
    const title = React.createElement("div", { className: "adv-title" },
            React.createElement("h2", null, "Advanced Statistics"),
            React.createElement("small", null,
                "Statistik lengkap akun \u00B7 ",
                n,
                " trade"));
    const card = React.createElement("div", { className: "adv-card" },
            React.createElement("div", { className: "adv-prof" },
                React.createElement("div", { className: "adv-profhead" },
                    React.createElement("b", { className: n ? (wr >= 50 ? 'pos' : 'neg') : '' },
                        "Profitability \u00B7 ",
                        wr.toFixed(0),
                        "% menang"),
                    React.createElement("span", null,
                        wins.length,
                        " W / ",
                        losses.length,
                        " L")),
                React.createElement("div", { className: "adv-bar" },
                    React.createElement("i", { style: { width: `${wr}%` } }))),
            React.createElement(AdvSlides, { rows: rows, note: "Pips dihitung dari harga entry ke harga close: XAUUSD / GOLD 1 pip = 0.10 poin harga, pair JPY 0.01, pair lain 0.0001, NAS100 dan BTCUSD 1 poin. Average/Max TP dari trade menang, SL dari trade kalah. Avg Hold dari waktu buka sampai close. Bulan mengikuti pilihan di Kalender dan Monthly gain." }));
    if (part === 'title')
        return React.createElement("div", { className: "adv adv-title-only" }, title);
    if (part === 'card')
        return React.createElement("div", { className: "adv adv-card-only" }, card);
    return React.createElement("div", { className: "adv" }, title, card);
}
