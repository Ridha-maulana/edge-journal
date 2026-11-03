/* Kalkulator risk di halaman Tools: arah Long/Short, lot atau risk %, saldo akun, hasil risk/reward (nominal dan %), saran lot */
"use strict";
const rcNum = v => { const n = Number(String(v == null ? '' : v).replace(',', '.')); return isFinite(n) ? n : 0; };
const rcFix = (n, d = 2) => Math.round(n * Math.pow(10, d)) / Math.pow(10, d);
const rcMoney = (n, cur) => { try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0); } catch (_) { return money(n, cur); } };
function RiskCalc({ account, onTrade }) {
    const cur = account.currency || 'USD';
    const [symbol, setSymbol] = useState('XAUUSD');
    const [side, setSide] = useState('Long');
    const [entry, setEntry] = useState('');
    const [sl, setSl] = useState('');
    const [tp, setTp] = useState('');
    const [lots, setLots] = useState('0.01');
    const [riskIn, setRiskIn] = useState('1');
    const [byRisk, setByRisk] = useState(false);
    const [sugIn, setSugIn] = useState('1');
    const [bal, setBal] = useState(String(rcFix(acctNowBal(account))));
    useEffect(() => { setBal(String(rcFix(acctNowBal(account)))); }, [account.id]);
    const e = rcNum(entry), s = rcNum(sl), t = rcNum(tp), b = rcNum(bal);
    const cs = contractSize(symbol), pip = pipSizeOf(symbol) || 0.0001;
    const hasE = entry !== '' && e > 0, hasS = sl !== '' && s > 0, hasT = tp !== '' && t > 0;
    const slDist = hasE && hasS ? Math.abs(e - s) : 0, tpDist = hasE && hasT ? Math.abs(t - e) : 0;
    const slOk = hasE && hasS ? (side === 'Long' ? s < e : s > e) : null;
    const tpOk = hasE && hasT ? (side === 'Long' ? t > e : t < e) : null;
    const fitLots = pct => slDist > 0 && b > 0 && pct > 0 ? Math.floor((b * pct / 100) / (slDist * cs) * 100 + 1e-9) / 100 : 0;
    const lotsEff = byRisk ? fitLots(rcNum(riskIn)) : rcNum(lots);
    const risk = slOk === true && lotsEff > 0 ? slDist * lotsEff * cs : 0;
    const reward = tpOk === true && lotsEff > 0 ? tpDist * lotsEff * cs : 0;
    const riskPct = b > 0 ? risk / b * 100 : 0, rewardPct = b > 0 ? reward / b * 100 : 0;
    const rr = risk > 0 && reward > 0 ? reward / risk : 0;
    const sug = fitLots(rcNum(sugIn));
    const sugRisk = sug > 0 ? slDist * sug * cs : 0;
    const warns = [];
    if (hasE && hasS && slDist === 0) warns.push('Stop loss sama dengan entry.');
    else if (slOk === false) warns.push(side === 'Long' ? 'Untuk Long, stop loss harus di bawah entry.' : 'Untuk Short, stop loss harus di atas entry.');
    if (tpOk === false) warns.push(side === 'Long' ? 'Untuk Long, take profit harus di atas entry.' : 'Untuk Short, take profit harus di bawah entry.');
    if (byRisk && hasE && hasS && slOk && b <= 0) warns.push('Isi saldo akun untuk menghitung lot dari risk %.');
    if (byRisk && hasE && hasS && slOk && b > 0 && lotsEff === 0) warns.push('Risk % terlalu kecil untuk lot minimum 0.01 pada jarak stop loss ini.');
    function swap() {
        if (!byRisk) { if (b > 0 && risk > 0) setRiskIn(String(rcFix(risk / b * 100))); setByRisk(true); }
        else { if (lotsEff > 0) setLots(String(rcFix(lotsEff))); setByRisk(false); }
    }
    const neg = v => '−' + rcMoney(v, cur);
    const pct = v => rcFix(v, 2).toFixed(2) + '%';
    const canTrade = hasE && hasS && slOk === true && lotsEff > 0 && tpOk !== false;
    return React.createElement("div", { className: "rc" },
        React.createElement("div", { className: "calc-grid compact-calc" },
            React.createElement("label", null, "Symbol", React.createElement(TSelect, { title: "Symbol", value: symbol, options: SYMBOLS, onChange: setSymbol })),
            React.createElement("div", { className: "rc-side" }, React.createElement("span", null, "Arah"),
                React.createElement("div", { className: "rc-seg" },
                    React.createElement("button", { type: "button", className: side === 'Long' ? 'on long' : '', onClick: () => setSide('Long') }, "Long"),
                    React.createElement("button", { type: "button", className: side === 'Short' ? 'on short' : '', onClick: () => setSide('Short') }, "Short"))),
            React.createElement("label", null, "Entry", React.createElement("input", { inputMode: "decimal", value: entry, onChange: ev => setEntry(ev.target.value), placeholder: "4050" })),
            React.createElement("label", { className: "rc-lots" }, byRisk ? "Risk %" : "Lots",
                byRisk ? React.createElement("input", { inputMode: "decimal", value: riskIn, onChange: ev => setRiskIn(ev.target.value), placeholder: "1" })
                    : React.createElement("input", { inputMode: "decimal", value: lots, onChange: ev => setLots(ev.target.value), placeholder: "0.01" }),
                React.createElement("button", { type: "button", className: "rc-swap", "aria-label": "Tukar isian lot dan risk persen", onClick: swap }, React.createElement(ArrowUpDown, { size: 14 }))),
            React.createElement("label", null, "Stop loss", React.createElement("input", { inputMode: "decimal", value: sl, onChange: ev => setSl(ev.target.value), placeholder: "4040" })),
            React.createElement("label", null, "Take profit", React.createElement("input", { inputMode: "decimal", value: tp, onChange: ev => setTp(ev.target.value), placeholder: "4060" })),
            React.createElement("label", null, "Saldo akun", React.createElement("input", { inputMode: "decimal", value: bal, onChange: ev => setBal(ev.target.value), placeholder: "6000" })),
            React.createElement("div", { className: "rc-cur" }, React.createElement("span", null, "Mata uang"), React.createElement("div", null, cur))),
        byRisk && React.createElement("div", { className: "rc-hint" }, "Lot dihitung dari risk %: ", React.createElement("b", null, lotsEff > 0 ? rcFix(lotsEff).toFixed(2) : '—')),
        React.createElement("div", { className: "rc-res" },
            React.createElement("div", null, React.createElement("small", null, "Risk"), React.createElement("b", { className: "negative" }, risk > 0 ? neg(risk) : '—'), React.createElement("i", { className: "negative" }, risk > 0 && b > 0 ? '−' + pct(riskPct) : '')),
            React.createElement("div", null, React.createElement("small", null, "Reward"), React.createElement("b", { className: "positive" }, reward > 0 ? '+' + rcMoney(reward, cur) : '—'), React.createElement("i", { className: "positive" }, reward > 0 && b > 0 ? '+' + pct(rewardPct) : ''))),
        (slDist > 0 || tpDist > 0 || rr > 0) && React.createElement("div", { className: "rc-meta" },
            rr > 0 && React.createElement("span", null, "R:R 1 : ", rcFix(rr).toString()),
            slDist > 0 && React.createElement("span", null, "SL ", rcFix(slDist / pip, 1), " pips"),
            tpDist > 0 && React.createElement("span", null, "TP ", rcFix(tpDist / pip, 1), " pips")),
        warns.map((w, i) => React.createElement("p", { key: i, className: "rc-warn" }, w)),
        React.createElement("div", { className: "rc-adj" },
            React.createElement("h4", null, React.createElement(Target, { size: 15 }), " Atur risk & ukuran posisi"),
            React.createElement("div", { className: "rc-adj-row" },
                React.createElement("label", null, "Risk %", React.createElement("input", { inputMode: "decimal", value: sugIn, onChange: ev => setSugIn(ev.target.value), placeholder: "1" })),
                React.createElement("div", { className: "rc-out" }, React.createElement("span", null, "Lot disarankan"), React.createElement("b", null, sug > 0 ? sug.toFixed(2) : '—'))),
            sug > 0 && React.createElement("p", { className: "rc-note" }, "Risk sekitar ", rcMoney(sugRisk, cur), " (", pct(b > 0 ? sugRisk / b * 100 : 0), " dari saldo)."),
            !(slDist > 0 && slOk) && React.createElement("p", { className: "rc-note" }, "Isi entry dan stop loss yang valid dulu untuk menghitung lot."),
            React.createElement("div", { className: "rc-btns" },
                React.createElement("button", { type: "button", className: "secondary-btn", disabled: !(sug > 0), onClick: () => { setLots(sug.toFixed(2)); setByRisk(false); } }, "Pakai lot ini"),
                React.createElement("button", { type: "button", className: "primary-btn", disabled: !canTrade, onClick: () => onTrade && onTrade({ symbol, side, entry: e, lots: rcFix(lotsEff) || 0.01, sl: hasS ? s : null, tp: hasT ? t : null }) }, "Buat posisi"))));
}
