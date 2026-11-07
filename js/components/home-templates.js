/* Isi halaman utama untuk 6 template (persis gambar rujukan). Data berasal dari halaman Performance (objek d). Gaya: css/21-home-templates.css */
"use strict";
const tpE = React.createElement;
const tpC = v => v > 0.005 ? 'pos' : v < -0.005 ? 'neg' : '';
const tpS = v => v > 0.005 ? '+' : v < -0.005 ? '-' : '';
const tpM = (v, cur) => tpS(v) + money(Math.abs(v), cur);
const tpM2 = (v, cur) => tpS(v) + new Intl.NumberFormat('en-US', { style: 'currency', currency: cur || 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(v));
const tpDay = iso => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const tpDayS = iso => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
const tpIc = (n, s, w) => tpE(Icon, { name: n, size: s || 18, strokeWidth: w || 2 });
/* skala tick bulat */
function tpNice(lo, hi, n) { if (!(hi > lo)) { hi = lo + 1; } const raw = (hi - lo) / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p, st = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; const a = Math.floor(lo / st) * st, b = Math.ceil(hi / st) * st, t = []; for (let v = a; v <= b + st / 2; v += st)
    t.push(v); return { lo: a, hi: b, ticks: t }; }
/* enam metrik standar */
function tpMetrics(d) { const c = d.cur; return [
    ['Win rate', d.winRate + '%', d.nTrades ? (d.winRate >= 50 ? 'pos' : 'neg') : ''],
    ['Profit Factor', d.pf === Infinity ? '∞' : d.pf.toFixed(2), d.nTrades ? (d.pf >= 1 ? 'pos' : 'neg') : ''],
    ['Total Trades', String(d.nTrades), ''],
    ['Avg. R:R', d.avgRR ? d.avgRR.toFixed(1) : '—', ''],
    ['Perolehan Pips', tpS(d.pips).replace('-', '') + d.pips.toFixed(1), tpC(d.pips)],
    ['Best Day', d.bestDay > 0 ? '+' + money(d.bestDay, c) : '—', d.bestDay > 0 ? 'pos' : '']
]; }
function tpActions(d, subs, ics) { ics = ics || ['Share2', 'BarChart3', 'Activity']; return tpE("div", { className: "tp-acts" },
    tpE("button", { type: "button", className: "tp-act a-share", onClick: d.onShare, "aria-label": "Bagikan ke story" }, tpIc(ics[0], 22), tpE("span", null, tpE("b", null, "Share"), subs && tpE("small", null, subs[0]))),
    tpE("button", { type: "button", className: "tp-act a-stats", onClick: d.onStats, "aria-label": "Advanced Statistics" }, tpIc('BarChart3', 22), tpE("span", null, tpE("b", null, "Stats"), subs && tpE("small", null, subs[1]))),
    tpE("button", { type: "button", className: "tp-act a-dna", onClick: d.onDna }, tpIc(ics[2], 22), tpE("span", null, tpE("b", null, "DNA"), subs && tpE("small", null, subs[2])))); }
/* teks tebal-padat dengan lebar pasti (tidak bergantung pada font yang termuat) */
function tpFit(text, fs, em, cls) { const w = Math.round(String(text).length * em * fs); return tpE("svg", { className: 'tp-fit ' + (cls || ''), viewBox: `0 0 ${w} ${Math.round(fs * 1.02)}`, role: "img", "aria-label": String(text), style: { aspectRatio: `${w}/${Math.round(fs * 1.02)}` } }, tpE("text", { x: 0, y: Math.round(fs * .86), fontSize: fs, textLength: w, lengthAdjust: "spacingAndGlyphs", fill: "currentColor", fontWeight: 900 }, text)); }
function tpGo(t) { window.dispatchEvent(new CustomEvent('ej-goto', { detail: t })); }
/* kontrol grafik kandel bersama (T3, T4, T6) */
/* Pas satu layar: tinggi grafik menyesuaikan sisa tinggi layar HP (di antara bagian atas halaman dan menu bawah), tanpa celah kosong dan tanpa scroll bila muat.
   root = elemen .tp, box = pembungkus grafik. Hasil: {root, box, m:{h,w}} (m = ukuran piksel grafik). */
function useTplFit(minH, maxH) {
    const root = useRef(null), box = useRef(null), [m, setM] = useState({ h: 0, w: 0 });
    React.useLayoutEffect(() => {
        let raf = 0, dead = false;
        const fit = () => {
            raf = 0; const el = root.current, bx = box.current; if (dead || !el || !bx) return;
            const w = bx.clientWidth; if (!w) return;
            const nav = document.querySelector('.bottom-nav'), bot = (nav ? nav.offsetHeight : 68) + 8;
            document.body.style.setProperty('--tp-bot', bot + 'px');
            const top = el.getBoundingClientRect().top + window.scrollY, avail = window.innerHeight - top - bot;
            bx.style.height = minH + 'px';
            const h = Math.round(Math.max(minH, Math.min(maxH, minH + avail - el.offsetHeight)));
            bx.style.height = h + 'px';
            setM(p => p.h === h && p.w === w ? p : { h, w });
        };
        const q = () => { if (!raf) raf = requestAnimationFrame(fit); };
        fit();
        window.addEventListener('resize', q); window.addEventListener('orientationchange', q);
        const ro = window.ResizeObserver ? new ResizeObserver(q) : null; if (ro && root.current) ro.observe(root.current);
        const t1 = setTimeout(q, 350), t2 = setTimeout(q, 1200);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(q);
        return () => { dead = true; if (raf) cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2); window.removeEventListener('resize', q); window.removeEventListener('orientationchange', q); if (ro) ro.disconnect(); };
    }, []);
    return { root, box, m };
}
function useTplChart(kindDef) { const [tf, setTf] = useState(() => candleSavedGet('ej3-chart-tf', 'SES')), [kind, setKind] = useState(() => candleSavedGet('ej3-chart-kind', kindDef || 'candle')); return { tf, kind, setTf: v => { setTf(v); candleSavedSet('ej3-chart-tf', v); }, setKind: v => { setKind(v); candleSavedSet('ej3-chart-kind', v); } }; }
function TplChips({ ctl, order }) { const list = (order || ['H1', 'SES', 'D1', 'W1', 'M1', 'Y1']).map(k => CANDLE_TFS.find(x => x[0] === k)); return tpE("div", { className: "tp-tf", role: "group", "aria-label": "Skala grafik" }, list.map(([k, l]) => tpE("button", { key: k, type: "button", className: ctl.tf === k ? 'on' : '', onClick: () => ctl.setTf(k) }, l))); }
function TplKind({ ctl }) { const line = ctl.kind !== 'candle'; return tpE("button", { type: "button", className: "tp-kind" + (line ? ' is-line' : ''), role: "switch", "aria-checked": line, "aria-label": line ? "Beralih ke grafik kandel" : "Beralih ke grafik garis", onClick: () => ctl.setKind(line ? 'candle' : 'line') },
    tpE("span", { className: "k-thumb" }),
    tpE("svg", { className: "k-c", viewBox: "0 0 24 24", width: "18", height: "18", "aria-hidden": "true" }, tpE("path", { d: "M7 3v3M7 18v3", stroke: EJC("#ff6b81"), strokeWidth: "2", strokeLinecap: "round" }), tpE("rect", { x: 4.5, y: 6, width: 5, height: 12, rx: 1.2, fill: EJC("#ff6b81") }), tpE("path", { d: "M17 2v3M17 17v4", stroke: EJC("#34d399"), strokeWidth: "2", strokeLinecap: "round" }), tpE("rect", { x: 14.5, y: 5, width: 5, height: 12, rx: 1.2, fill: EJC("#34d399") })),
    tpE("svg", { className: "k-l", viewBox: "0 0 24 24", width: "18", height: "18", "aria-hidden": "true" }, tpE("path", { d: "M3 16c2-4 3-5 5-3s3 3 5-1 3-6 5-3 2 3 3 2", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" }))); }
/* ===== T1: dasbor biru ===== */
function T1Equity({ pts, cur }) {
    const W = 700, H = 372, L = 106, R = 18, T = 26, B = 40;
    if (!pts.length) return tpE("svg", { viewBox: `0 0 ${W} ${H}`, className: "t1-eq" }, tpE("text", { x: W / 2, y: H / 2, textAnchor: "middle", fontSize: "20", fill: "currentColor", opacity: ".6" }, "Belum ada trade pada periode ini"));
    const t0 = pts[0].t, t1 = pts[pts.length - 1].t, span = Math.max(t1 - t0, 36e5);
    const lo0 = Math.min(...pts.map(p => p.eq)), hi0 = Math.max(...pts.map(p => p.eq));
    const nz = tpNice(lo0 - (hi0 - lo0) * .15 - 1, hi0 + (hi0 - lo0) * .15 + 1, 4);
    const x = t => L + (t - t0) / span * (W - L - R - 6), y = v => T + (nz.hi - v) / (nz.hi - nz.lo) * (H - T - B);
    let dl = `M${x(pts[0].t)},${y(pts[0].eq)}`;
    for (let i = 1; i < pts.length; i++) dl += ` H${x(pts[i].t)} V${y(pts[i].eq)}`;
    const last = pts[pts.length - 1], area = `${dl} V${H - B} H${x(pts[0].t)} Z`;
    const xt = [0, .5, 1].map(f => new Date(t0 + span * f)), bx = Math.min(x(last.t), W - 70);
    return tpE("svg", { viewBox: `0 0 ${W} ${H}`, className: "t1-eq", role: "img", "aria-label": "Kurva ekuitas" },
        tpE("defs", null, tpE("linearGradient", { id: "t1g", x1: "0", x2: "0", y1: "0", y2: "1" }, tpE("stop", { offset: "0", stopColor: "var(--green)", stopOpacity: ".34" }), tpE("stop", { offset: "1", stopColor: "var(--green)", stopOpacity: ".04" }))),
        nz.ticks.map((v, i) => tpE("g", { key: i }, tpE("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), className: "g-l" }), tpE("text", { x: L - 14, y: y(v) + 6, textAnchor: "end", className: "g-t" }, money(v, cur)))),
        xt.map((d, i) => tpE("line", { key: 'v' + i, x1: x(t0 + span * [0, .5, 1][i]), x2: x(t0 + span * [0, .5, 1][i]), y1: T, y2: H - B, className: "g-l" })),
        tpE("path", { d: area, fill: "url(#t1g)" }),
        tpE("path", { d: dl, fill: "none", stroke: "var(--green)", strokeWidth: "3.4", strokeLinejoin: "round" }),
        tpE("line", { x1: x(last.t), x2: x(last.t), y1: y(last.eq), y2: H - B, className: "g-d" }),
        pts.map((p, i) => tpE("circle", { key: 'c' + i, cx: x(p.t), cy: y(p.eq), r: i === pts.length - 1 ? 7 : 6, fill: "var(--green)", stroke: i === pts.length - 1 ? "var(--ej-sf)" : "none", strokeWidth: "2.5" })),
        tpE("g", { transform: `translate(${bx - 46},${y(last.eq) - 52})` }, tpE("rect", { width: 112, height: 36, rx: 8, fill: "var(--green)" }), tpE("text", { x: 56, y: 25, textAnchor: "middle", className: "g-b" }, money(last.eq, cur))),
        tpE("line", { x1: L, x2: W - R, y1: H - B, y2: H - B, className: "g-a" }),
        xt.map((dd, i) => tpE("text", { key: 'x' + i, x: [L + 22, (L + W - R) / 2 + 12, W - R - 30][i], y: H - 10, textAnchor: "middle", className: "g-t" }, dd.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }))));
}
function HomeT1({ d }) {
    const [rg, setRg] = useState('ALL');
    const c = d.cur;
    const pts = useMemo(() => {
        const hrs = { H: 1, D: 24, W: 168, M: 720 }[rg], all = d.cs.map(t => ({ t: +new Date(t.date), pnl: Number(t.pnl) || 0 })).filter(p => isFinite(p.t));
        if (!all.length) return [];
        const lastT = Math.max(...all.map(p => p.t)), cut = hrs ? lastT - hrs * 36e5 : -Infinity;
        let eq = d.startBal; const before = all.filter(p => p.t < cut), inn = all.filter(p => p.t >= cut);
        before.forEach(p => { eq += p.pnl; });
        const first = inn.length ? inn[0].t : lastT, spanAll = Math.max(lastT - first, 864e5), out = [{ t: first - spanAll * .14, eq }];
        inn.forEach(p => { eq += p.pnl; out.push({ t: p.t, eq }); });
        return out;
    }, [d.cs, d.startBal, rg]);
    const spark = d.cv, sn = spark.length, slo = Math.min(...spark), shi = Math.max(...spark), ssp = (shi - slo) || 1;
    const sp = spark.map((v, i) => [sn === 1 ? 0 : i / (sn - 1) * 340, 8 + (shi - v) / ssp * 120]);
    const sl = sp.map(p => p.join(',')).join(' ');
    const wins = d.wins, losses = d.losses, be = d.nTrades - wins - losses, tot = d.nTrades || 1;
    const R = 66, C = 2 * Math.PI * R, seg = (n, off) => ({ strokeDasharray: `${n / tot * C} ${C}`, strokeDashoffset: -off / tot * C });
    const sym = d.bySymbol.slice().sort((a, b) => b.count - a.count).slice(0, 3);
    const recent = d.cs.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
    const days = Object.entries(d.dayMap).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 3), dmax = Math.max(1, ...days.map(x => Math.abs(x[1])));
    const kpi4 = [['Database', 'Starting Balance', money(d.startBal, c), ''], ['Wallet', 'Current Balance', money(d.aNow, c), tpC(d.total)], ['BarsFill', 'Growth', tpS(d.aGrowth) + Math.abs(d.aGrowth).toFixed(2) + '%', tpC(d.growthPct)], ['Calendar', 'Active Days', String(d.activeDays), '']];
    const k6 = tpMetrics(d), ik = ['Trophy', 'LineChart', 'FileText', 'Scale', 'Target', 'Star'], nm = ['Win Rate', 'Profit Factor', 'Total Trades', 'Avg. R:R', 'Total Pips', 'Best Day'];
    return tpE("div", { className: "tp tp1" },
        tpE("section", { className: "tp-card t1-hero" },
            tpE("div", { className: "t1-hl" }, tpE("span", { className: "t1-cap" }, "TOTAL P&L"), tpE("div", { className: "t1-big " + tpC(d.total) }, tpS(d.aTotal), money(Math.abs(d.aTotal), c)), tpE("span", { className: "t1-tr " + tpC(d.total) }, tpIc(d.total >= 0 ? 'ArrowUpRight' : 'ArrowDownRight', 20, 2.2), tpE("b", null, d.trendTxt), " in selected period")),
            tpE("svg", { className: "t1-spark", viewBox: "0 0 340 140", preserveAspectRatio: "none", "aria-hidden": "true" }, tpE("defs", null, tpE("linearGradient", { id: "t1s", x1: "0", x2: "0", y1: "0", y2: "1" }, tpE("stop", { offset: "0", stopColor: "var(--ej-pr)", stopOpacity: ".3" }), tpE("stop", { offset: "1", stopColor: "var(--ej-pr)", stopOpacity: "0" }))), sn > 1 && tpE("polygon", { points: `0,140 ${sl} 340,140`, fill: "url(#t1s)" }), sn > 1 && tpE("polyline", { points: sl, fill: "none", stroke: "var(--ej-pr)", strokeWidth: "2.6", strokeLinejoin: "round", vectorEffect: "non-scaling-stroke" })),
            tpE("div", { className: "t1-acc" }, tpE("span", null, "ACTIVE ACCOUNT"), tpE("strong", null, d.acc.name), tpE("button", { type: "button", className: "t1-wal", onClick: d.onWallet, "aria-label": "Deposit dan Withdraw" }, tpIc('Wallet', 22)))),
        tpE("div", { className: "t1-k4" }, kpi4.map(([ic, l, v, t]) => tpE("div", { key: l, className: "tp-card t1-k" }, tpE("span", { className: "t1-ki" }, tpIc(ic, 26)), tpE("div", null, tpE("small", null, l), tpE("b", { className: t }, v))))),
        tpE("div", { className: "t1-k6" }, k6.map((m, i) => tpE("div", { key: i, className: "tp-card t1-k" }, tpE("span", { className: "t1-ki" }, tpIc(ik[i], 26)), tpE("small", null, nm[i]), tpE("b", { className: m[2] }, m[1] === '∞' ? tpIc('Infinity', 26, 2.6) : m[1])))),
        tpE("div", { className: "t1-mid" },
            tpE("section", { className: "tp-card t1-eqc" },
                tpE("div", { className: "t1-eh" }, tpE("span", { className: "t1-ti" }, tpIc('BarsFill', 22), "EQUITY CURVE"), tpE("div", { className: "t1-rg", role: "group", "aria-label": "Rentang kurva" }, [['H', '1H'], ['D', '1D'], ['W', '1W'], ['M', '1M'], ['ALL', 'ALL']].map(([k, l]) => tpE("button", { key: k, type: "button", className: rg === k ? 'on' : '', onClick: () => setRg(k) }, l)))),
                tpE(T1Equity, { pts: pts, cur: c })),
            tpE("div", { className: "t1-side" },
                tpE("section", { className: "tp-card t1-pb" }, tpE("span", { className: "t1-ti" }, tpIc('Activity', 20), "P&L BREAKDOWN"),
                    tpE("div", { className: "t1-pbb" },
                        tpE("div", { className: "t1-donut" }, tpE("svg", { viewBox: "0 0 160 160", "aria-hidden": "true" }, tpE("g", { transform: "rotate(-90 80 80)", fill: "none", strokeWidth: "26" }, tpE("circle", { cx: 80, cy: 80, r: R, className: "dn-bg" }), wins > 0 && tpE("circle", { cx: 80, cy: 80, r: R, className: "dn-w", style: seg(wins, 0) }), losses > 0 && tpE("circle", { cx: 80, cy: 80, r: R, className: "dn-l", style: seg(losses, wins) }), be > 0 && tpE("circle", { cx: 80, cy: 80, r: R, className: "dn-b", style: seg(be, wins + losses) }))), tpE("div", { className: "t1-dc" }, tpE("b", null, d.nTrades), tpE("small", null, "TRADES"))),
                        tpE("ul", { className: "t1-lg" }, [['dn-w', 'Wins', wins], ['dn-l', 'Losses', losses], ['dn-b', 'BE', be]].map(([k, l, n]) => tpE("li", { key: l }, tpE("i", { className: k }), tpE("span", null, l, tpE("b", null, n + ' (' + Math.round(n / tot * (d.nTrades ? 100 : 0)) + '%)'))))))),
                tpE("section", { className: "tp-card t1-in" }, tpE("span", { className: "t1-ti" }, tpIc('BarsFill', 20), "INSTRUMENTS"), sym.length ? sym.map(s => tpE("div", { key: s.symbol, className: "t1-ir" }, tpE("b", null, s.symbol), tpE("em", null, s.count), tpE("div", { className: "t1-bar" }, tpE("i", { style: { width: Math.max(6, s.count / tot * 100) + '%' } })), tpE("span", null, Math.round(s.count / tot * 100) + '%'))) : tpE("small", { className: "t1-none" }, "Belum ada data")))),
        tpE("section", { className: "tp-card t1-rt" },
            tpE("div", { className: "t1-eh" }, tpE("span", { className: "t1-ti" }, tpIc('FileText', 22), "RECENT TRADES"), tpE("button", { type: "button", className: "t1-va", onClick: () => tpGo('journal') }, "View All", tpIc('ChevronRight', 16, 2.4))),
            tpE("div", { className: "t1-tb", role: "table" },
                tpE("div", { className: "t1-tr0", role: "row" }, ['DATE', 'PAIR', 'TYPE', 'LOTS', 'ENTRY', 'EXIT', 'PIPS', 'P&L'].map(x => tpE("span", { key: x }, x))),
                recent.map(t => { const pp = pipsOf(t), pl = Number(t.pnl) || 0; return tpE("div", { key: t.id, className: "t1-trr", role: "row" }, tpE("span", null, tpDayS(t.date)), tpE("span", null, t.symbol), tpE("span", null, tpE("i", { className: t.side === 'Long' ? 'buy' : 'sell' }, t.side === 'Long' ? 'BUY' : 'SELL')), tpE("span", null, Number(t.lots).toFixed(2)), tpE("span", null, Number(t.entry).toFixed(2)), tpE("span", null, Number(t.exit).toFixed(2)), tpE("span", { className: tpC(pp) }, tpS(pp) + Math.abs(pp).toFixed(2)), tpE("span", { className: tpC(pl) }, tpM2(pl, c))); }),
                !recent.length && tpE("div", { className: "t1-none" }, "Belum ada trade pada periode ini"))),
        tpE("div", { className: "t1-two" },
            tpE("section", { className: "tp-card t1-dp" }, tpE("span", { className: "t1-ti" }, tpIc('BarsFill', 22), "DAILY P&L"), days.map(([k, v]) => tpE("div", { key: k, className: "t1-dr" }, tpE("span", null, tpDayS(k)), tpE("b", { className: tpC(v) }, tpM2(v, c)), tpE("div", { className: "t1-bar" }, tpE("i", { className: v < 0 ? 'neg' : '', style: { width: Math.max(4, Math.abs(v) / dmax * 100) + '%' } })))), !days.length && tpE("small", { className: "t1-none" }, "Belum ada data")),
            tpE("section", { className: "tp-card t1-rk" }, tpE("span", { className: "t1-ti" }, tpIc('Shield', 22), "RISK METRICS"),
                tpE("div", { className: "t1-rkg" }, [['Max Drawdown', d.ddTxt, ''], ['Expectancy (R)', d.expR == null ? '—' : tpS(d.expR) + Math.abs(d.expR).toFixed(2), d.expR == null ? '' : tpC(d.expR)], ['Sharpe Ratio', d.sharpe == null ? '-' : d.sharpe.toFixed(2), ''], ['Avg. Trade (Pips)', d.nTrades ? tpS(d.pips / d.nTrades) + Math.abs(d.pips / d.nTrades).toFixed(1) : '—', d.nTrades ? tpC(d.pips) : '']].map(([l, v, t]) => tpE("div", { key: l }, tpE("small", null, l), tpE("b", { className: t }, v)))))),
        tpE("div", { className: "tp-card t1-ac" }, tpActions(d)));
}
/* ===== T2: organik hijau ===== */
function T2Area({ pts, fit }) {
    const W = 640, H = fit && fit.w ? Math.max(150, Math.round(W * fit.h / fit.w)) : 300, L = 70, R = 14, T = 36, B = 36;
    if (!pts.length) return tpE("svg", { viewBox: `0 0 ${W} ${H}`, className: "t2-ch" }, tpE("text", { x: W / 2, y: H / 2, textAnchor: "middle", className: "g-t" }, "Belum ada trade pada periode ini"));
    const vals = pts.map(p => p.v), lo0 = Math.min(0, ...vals), hi0 = Math.max(0, ...vals), nz = tpNice(lo0, hi0 + (hi0 - lo0) * .1, 4);
    const n = pts.length, x = i => L + (n > 1 ? i / (n - 1) : 1) * (W - L - R - 8), y = v => T + (nz.hi - v) / (nz.hi - nz.lo) * (H - T - B);
    const P = pts.map((p, i) => [x(i), y(p.v)]), ln = smoothPath(P), last = P[P.length - 1], first = P[0];
    const area = `${ln} L${last[0]},${y(Math.max(nz.lo, 0))} L${first[0]},${y(Math.max(nz.lo, 0))} Z`;
    const lastV = pts[n - 1].v;
    const ix = n > 4 ? [0, .25, .5, .75, 1].map(f => Math.round((n - 1) * f)) : pts.map((_, i) => i), lab = ix.filter((v, i) => ix.indexOf(v) === i && pts[v].lb);
    const cand = lab.map(i => { const w = pts[i].lb.length * 12.6 + 14, a = i === n - 1 ? "end" : i === 0 ? "start" : "middle", cx = Math.min(Math.max(x(i), L + 20), W - R - 22); return { i, a, x: cx, l: a === "end" ? cx - w : a === "start" ? cx : cx - w / 2, r: a === "end" ? cx : a === "start" ? cx + w : cx + w / 2 }; });
    const xl = []; [cand[cand.length - 1]].concat(cand.slice(0, -1)).forEach(o => { if (o && !xl.some(q => o.l < q.r && o.r > q.l)) xl.push(o); });
    return tpE("svg", { viewBox: `0 0 ${W} ${H}`, className: "t2-ch", role: "img", "aria-label": "Grafik total P&L" },
        tpE("defs", null, tpE("linearGradient", { id: "t2g", x1: "0", x2: "0", y1: "0", y2: "1" }, tpE("stop", { offset: "0", stopColor: "var(--ej-pr)", stopOpacity: ".32" }), tpE("stop", { offset: "1", stopColor: "var(--ej-pr)", stopOpacity: ".02" }))),
        nz.ticks.map((v, i) => tpE("g", { key: i }, tpE("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), className: v === 0 ? "g-a" : "g-l" }), tpE("text", { x: L - 12, y: y(v) + 6, textAnchor: "end", className: "g-t" }, tpS(v) + Math.abs(v).toFixed(v % 1 ? 1 : 0)))),
        tpE("path", { d: area, fill: "url(#t2g)" }),
        tpE("path", { d: ln, fill: "none", stroke: "var(--ej-pr)", strokeWidth: "3.6", strokeLinecap: "round" }),
        tpE("circle", { cx: last[0], cy: last[1], r: 7, fill: "var(--ej-pr)", stroke: "var(--ej-sf)", strokeWidth: "2.5" }),
        tpE("g", { transform: `translate(${Math.min(last[0] - 56, W - 118)},${last[1] - 54})` }, tpE("rect", { width: 112, height: 38, rx: 11, fill: "var(--ej-pr)" }), tpE("text", { x: 56, y: 27, textAnchor: "middle", className: "g-b2", style: { fill: 'var(--onacc)' } }, tpS(lastV) + Math.abs(lastV).toFixed(2))),
        xl.map(o => tpE("text", { key: 'x' + o.i, x: o.x, y: H - 8, textAnchor: o.a, className: "g-t", style: o.i === n - 1 ? { fontWeight: 700, fill: 'var(--ej-ik)' } : null }, pts[o.i].lb)));
}
function HomeT2({ d }) {
    const ctl = useTplChart('line'), c = d.cur, fit = useTplFit(120, 460);
    const pts = useMemo(() => {
        const cd = buildCandles(d.cs, ctl.tf);
        if (!cd.length) return [];
        return [{ v: 0, lb: '' }].concat(cd.map(x => ({ v: x.c, lb: x.short })));
    }, [d.cs, ctl.tf]);
    const k = [['Saldo Awal', money(d.startBal, c), '', 'Coins', 'k1'], ['Saldo Sekarang', money(d.aNow, c), tpC(d.total), 'BarsThin', 'k2'], ['Pertumbuhan', tpS(d.aGrowth) + Math.abs(d.aGrowth).toFixed(2) + '%', tpC(d.growthPct), 'TrendingUp', 'k3'], ['Hari Aktif', String(d.activeDays), '', 'Calendar', 'k4']];
    const st = [['Win Rate', d.winRate + '%', 'Trophy'], ['Profit Factor', d.pf === Infinity ? '∞' : d.pf.toFixed(2), 'LineChart'], ['Total Trade', String(d.nTrades), 'BarsFill'], ['Rata-rata R:R', d.avgRR ? d.avgRR.toFixed(1) : '—', 'TrendingUp'], ['Perolehan Pips', tpS(d.pips).replace('-', '') + d.pips.toFixed(1), 'Target'], ['Hari Terbaik', d.bestDay > 0 ? '+' + money(d.bestDay, c) : '—', 'Star']];
    const good = d.total >= 0;
    return tpE("div", { className: "tp tp2", ref: fit.root },
        tpE("i", { className: "t2-blob b1", "aria-hidden": "true" }), tpE("i", { className: "t2-blob b2", "aria-hidden": "true" }),
        tpE("section", { className: "tp-card t2-main" },
            tpE("div", { className: "t2-mh" }, tpE("button", { type: "button", className: "t2-ttl", onClick: d.onStats }, "Total P&L", tpIc('ChevronRight', 18, 2.4)), tpE("button", { type: "button", className: "t2-accb", onClick: d.onAccount }, tpE("span", null, tpIc('Wallet', 14), d.acc.name), tpIc('ChevronDown', 14, 2.4))),
            tpE("div", { className: "t2-big " + tpC(d.total) }, tpS(d.aTotal), money(Math.abs(d.aTotal), c)),
            tpE("span", { className: "t2-tr " + tpC(d.total) }, tpIc(good ? 'TrendingUp' : 'TrendingDown', 16, 2.4), tpE("b", null, d.trendTxt), " dalam periode ini"),
            tpE("div", { className: "t2-q" }, "Proses kecil setiap hari,", tpE("br"), "hasil besar nanti."),
            tpE("div", { className: "t2-fb", ref: fit.box }, tpE(T2Area, { pts: pts, fit: fit.m })),
            tpE("div", { className: "t2-rg", role: "group", "aria-label": "Skala grafik" }, CANDLE_TFS.map(([key, l]) => tpE("button", { key: key, type: "button", className: ctl.tf === key ? 'on' : '', onClick: () => ctl.setTf(key) }, l)))),
        tpE("div", { className: "t2-k4" }, k.map(([l, v, t, ic, cl]) => tpE("div", { key: l, className: "tp-card t2-k" }, tpE("span", { className: "t2-ki " + cl }, tpIc(ic, 20)), tpE("small", null, l), tpE("b", { className: t }, v)))),
        tpE("div", { className: "t2-two" },
            tpE("section", { className: "tp-card t2-in" }, tpE("div", { className: "t2-ih" }, tpE("span", { className: "t2-ti" }, tpE("i", { className: "t2-ii" }, tpIc('BarsFill', 14, 2.2)), "Insight Minggu Ini"), tpE("span", { className: "t2-bd " + (good ? '' : 'warn') }, tpIc(good ? 'Star' : 'Info', 14, 2.2), good ? "Performa Solid" : "Perlu Evaluasi")),
                tpE("p", null, d.nTrades ? tpE(React.Fragment, null, "Kamu ", good ? "naik" : "turun", " ", tpE("b", null, d.trendTxt), " dengan ", d.nTrades, " trade. ", good ? "Pertahankan manajemen risiko yang konsisten!" : "Evaluasi lagi rencana dan risikonya.") : "Belum ada trade. Catat trade pertamamu untuk melihat insight.")),
            tpE("section", { className: "tp-card t2-nt" }, tpE("i", { className: "t2-ii n" }, tpIc('Leaf', 14, 2.2)), tpE("b", { className: "t2-nti" }, "Catatan Jurnal"), tpE("p", null, "Apa yang kamu pelajari hari ini?"), tpE("button", { type: "button", className: "t2-nb", onClick: () => tpGo('journal') }, tpE("span", null, tpIc('Pencil', 14, 2.2), "Tulis Catatan"), tpIc('ChevronRight', 14, 2.4)))),
        tpE("section", { className: "tp-card t2-st" }, tpE("div", { className: "t2-sh" }, tpE("span", { className: "t2-ti" }, "Statistik Trading"), tpE("button", { type: "button", className: "t2-va", onClick: d.onStats }, "Lihat Semua", tpIc('ChevronRight', 14, 2.4))),
            tpE("div", { className: "t2-sg" }, st.map(([l, v, ic], i) => tpE("div", { key: l }, tpE("span", { className: "t2-si" }, tpIc(ic, 16)), tpE("small", { title: l }, tpE("span", { className: "lf" }, ['Win Rate', 'Profit Factor', 'Trades', 'Avg R:R', 'Pips', 'Hari Terbaik'][i]), tpE("span", { className: "ls" }, ['Win Rate', 'PF', 'Trade', 'R:R', 'Pips', 'Terbaik'][i])), tpE("b", { className: i < 2 ? (i === 0 ? (d.winRate >= 50 ? 'pos' : 'neg') : (d.pf >= 1 ? 'pos' : 'neg')) : (i === 4 ? tpC(d.pips) : i === 5 ? (d.bestDay > 0 ? 'pos' : '') : '') }, v)))),
            tpActions(d)));
}
/* ===== bagian bersama T5/T6 ===== */
function tpFacts(d, sel, setSel) { const f = d.heroFx || {}; return tpE("div", { className: "tp-fx", role: "group", "aria-label": "Rentang data" }, [['tahun', f.years], ['bulan', f.months], ['minggu', f.weeks], ['hari', f.days], ['sesi', f.sessions]].map(([k, v]) => tpE("button", { key: k, type: "button", className: sel === k ? 'on' : '', onClick: () => setSel(k) }, tpE("b", null, v == null ? 0 : v), " ", k))); }
function tpBest(d) { return tpE("div", { className: "tp-bd" }, tpE("span", null, tpE("i", { className: "dt-g" }), "Bulan terbaik: ", tpE("b", null, d.bestTxt)), tpE("span", null, tpE("i", { className: "dt-r" }), "Drawdown terdalam: ", tpE("b", null, d.ddTxt))); }
/* ===== T5: hijau bersih ===== */
function T5Bars({ vals, si, onPick, fit }) {
    const W = 1000, H = fit && fit.w ? Math.max(260, Math.round(W * fit.h / fit.w)) : 430, T = 78, B = 64, AX = 150, PW = W - AX - 6;
    const n = vals.length;
    if (!n) return tpE("svg", { viewBox: `0 0 ${W} ${H}`, className: "t5-ch" }, tpE("text", { x: W / 2, y: H / 2, textAnchor: "middle", className: "g-t" }, "Belum ada trade pada periode ini"));
    const lo0 = Math.min(0, ...vals.map(v => v.v)), hi0 = Math.max(0, ...vals.map(v => v.v)), pad = (hi0 - lo0) * .06 || 1, lo = lo0 < 0 ? lo0 - pad : 0, hi = hi0 + pad;
    const y = v => T + (hi - v) / (hi - lo) * (H - T - B), slot = PW / n, bw = Math.min(slot * .72, 120);
    const ticks = [0, 1, 2, 3].map(i => hi - (hi - lo) * i / 3);
    const bx = si * slot + slot / 2, dv = vals[si].v - vals[si].o;
    const ix = [0, Math.round((n - 1) / 2), n - 1].filter((v, i, a) => a.indexOf(v) === i);
    const cand = ix.map(k => { const w = vals[k].lb.length * 19 + 20, a = k === n - 1 && n > 1 ? "end" : k === 0 ? "start" : "middle", cx = Math.min(Math.max(k * slot + slot / 2, 0), PW + 4); return { k, a, x: cx, l: a === "end" ? cx - w : a === "start" ? cx : cx - w / 2, r: a === "end" ? cx : a === "start" ? cx + w : cx + w / 2 }; });
    const xl = []; [cand[cand.length - 1]].concat(cand.slice(0, -1)).forEach(o => { if (o && !xl.some(q => o.l < q.r && o.r > q.l)) xl.push(o); });
    return tpE("svg", { viewBox: `0 0 ${W} ${H}`, className: "t5-ch", role: "img", "aria-label": "Grafik batang P&L kumulatif" },
        tpE("defs", null, tpE("linearGradient", { id: "t5g", x1: "0", x2: "0", y1: "0", y2: "1" }, tpE("stop", { offset: "0", stopColor: "var(--ej-pr)" }), tpE("stop", { offset: "1", stopColor: "var(--ej-pr)", stopOpacity: ".04" }))),
        ticks.map((v, i) => tpE("g", { key: i }, tpE("line", { x1: 0, x2: PW, y1: y(v), y2: y(v), className: "g-l" }), tpE("text", { x: W - 4, y: y(v) + 11, textAnchor: "end", className: "g-t" }, candleNum(v)))),
        vals.map((p, i) => { const y0 = y(Math.max(lo, 0)), y1 = y(p.v), top = Math.min(y0, y1), h = Math.max(4, Math.abs(y0 - y1)); return tpE("g", { key: i, onClick: () => onPick && onPick(i), style: { cursor: 'pointer' } }, tpE("rect", { x: i * slot, y: 0, width: slot, height: H - B + 20, fill: "transparent" }), tpE("rect", { x: i * slot + (slot - bw) / 2, y: top, width: bw, height: h, rx: 8, fill: "url(#t5g)", opacity: i === si ? 1 : .6 })); }),
        tpE("circle", { cx: bx, cy: y(vals[si].v) - 2, r: 9, fill: "var(--ej-sf)", stroke: "var(--ej-pr)", strokeWidth: "5", pointerEvents: "none" }),
        tpE("g", { pointerEvents: "none", transform: `translate(${Math.min(Math.max(bx - 88, 0), PW - 178)},${Math.max(4, y(vals[si].v) - 82)})` }, tpE("rect", { width: 176, height: 62, rx: 16, fill: "var(--ej-pr)" }), tpE("text", { x: 88, y: 43, textAnchor: "middle", className: "g-b2", style: { fill: "var(--onacc)" } }, tpS(dv) + Math.abs(dv).toFixed(2))),
        xl.map(o => tpE("text", { key: 'x' + o.k, x: o.x, y: H - 14, textAnchor: o.a, className: "g-t" }, vals[o.k].lb)));
}
function HomeT5({ d }) {
    const fit = useTplFit(150, 480), ctl = useTplChart('line'), c = d.cur, [pick, setPick] = useState(null);
    useEffect(() => { setPick(null); }, [ctl.tf]);
    const vis = useMemo(() => buildCandles(d.cs, ctl.tf).slice(-14), [d.cs, ctl.tf]);
    const vals = useMemo(() => vis.map(x => ({ v: x.c, o: x.o, lb: x.short })), [vis]);
    const si = vis.length ? (pick != null && pick < vis.length ? pick : vis.length - 1) : 0, act = vis[si] || null;
    const rows = [['Saldo awal', money(d.startBal, c), ''], ['Sekarang', money(d.aNow, c), tpC(d.total)], ['Pertumbuhan', tpS(d.aGrowth) + Math.abs(d.aGrowth).toFixed(2) + '%', tpC(d.growthPct)], ['Hari aktif', String(d.activeDays), '']];
    const k6 = tpMetrics(d), ic = ['Trophy', 'Infinity', 'BarsFill', 'TrendingUp', 'Target', 'Calendar'];
    const dv = act ? act.c - act.o : 0, dp = act ? act.pc - act.po : 0, dpc = act && d.startBal ? dv / d.startBal * 100 : 0;
    return tpE("div", { className: "tp tp5", ref: fit.root },
        tpE("section", { className: "tp-card t5-hero" },
            tpE("div", { className: "t5-top" }, tpE("div", { className: "t5-pl" }, tpE("span", { className: "t5-cap" }, "TOTAL P&L"), tpE("div", { className: "t5-big " + tpC(d.total) }, tpS(d.aTotal), money(Math.abs(d.aTotal), c)), tpE("span", { className: "t5-tr " + tpC(d.total) }, tpIc(d.total >= 0 ? 'TrendingUp' : 'TrendingDown', 14, 2.4), d.trendTxt)),
                tpE("div", { className: "t5-ac" }, tpE("span", { className: "t5-ai" }, tpIc('BarsFill', 20)), tpE("div", null, tpE("small", null, "Akun aktif"), tpE("strong", null, d.acc.name)))),
            tpE("div", { className: "t5-fb", ref: fit.box }, tpE(T5Bars, { vals: vals, si: si, onPick: setPick, fit: fit.m })),
            tpE("div", { className: "tp-fx", role: "group", "aria-label": "Skala grafik" }, CANDLE_TFS.map(([k, l]) => tpE("button", { key: k, type: "button", className: ctl.tf === k ? 'on' : '', onClick: () => ctl.setTf(k) }, l))),
            tpE("div", { className: "t5-st" }, rows.map(([l, v, t]) => tpE("div", { key: l }, tpE("small", null, l), tpE("b", { className: t }, v))))),
        act && tpE("section", { className: "tp-card t5-act" }, tpE("div", { className: "t5-ah" }, tpE("b", null, act.label.replace(' · ', ' • ')), tpE("span", null, act.n, " trade")),
            tpE("div", { className: "t5-av " + tpC(dv) }, tpE("b", null, tpS(dv) + Math.abs(dv).toFixed(2)), tpE("span", null, tpS(dpc) + Math.abs(dpc).toFixed(2) + '%')),
            tpE("div", { className: "t5-oh" }, tpE("b", null, tpS(dp) + Math.abs(dp).toFixed(1) + ' pips'), tpE("i", null, "|"), [['O', act.o], ['H', act.h], ['L', act.l], ['C', act.c]].map(([k, v]) => tpE("span", { key: k }, k, " ", tpE("b", null, tpS(v) + Math.abs(v).toFixed(v >= 100 ? 0 : 2))))),
            tpE("button", { type: "button", className: "t5-dt", onClick: () => d.onOpen && d.onOpen(act, ctl.tf) }, "Lihat detail", tpIc('ChevronRight', 15, 2.4))),
        tpE("section", { className: "tp-card t5-m" }, tpE("div", { className: "t5-mg" }, k6.map((m, i) => tpE("div", { key: m[0] }, tpE("span", { className: "t5-mi" }, tpIc(ic[i], 18)), tpE("div", null, tpE("small", null, m[0]), tpE("b", { className: m[2] }, m[1]))))), tpActions(d)));
}
/* ===== T6: kaca lembut ===== */
function HomeT6({ d }) {
    const fit = useTplFit(170, 480), ctl = useTplChart('candle'), [sel, setSel] = useState('hari'), c = d.cur;
    const rows = [['Saldo awal', money(d.startBal, c), ''], ['Sekarang', money(d.aNow, c), tpC(d.total)], ['Pertumbuhan', tpS(d.aGrowth) + Math.abs(d.aGrowth).toFixed(2) + '%', tpC(d.growthPct)], ['Hari aktif', String(d.activeDays), '']];
    const m = tpMetrics(d);
    return tpE("div", { className: "tp tp6", ref: fit.root },
        tpE("i", { className: "t6-blob b1", "aria-hidden": "true" }), tpE("i", { className: "t6-blob b2", "aria-hidden": "true" }), tpE("i", { className: "t6-blob b3", "aria-hidden": "true" }),
        tpE("section", { className: "tp-card t6-pl" }, tpE("div", { className: "t6-l" }, tpE("span", { className: "t6-cap" }, "TOTAL P&L"), tpE("div", { className: "t6-big " + tpC(d.total) }, tpS(d.aTotal), money(Math.abs(d.aTotal), c)), tpE("span", { className: "t6-tr " + tpC(d.total) }, tpIc(d.total >= 0 ? 'TrendingUp' : 'TrendingDown', 14, 2.4), d.trendTxt + " in selected period")), tpE("div", { className: "t6-r" }, tpE("span", { className: "t6-cap" }, "ACTIVE ACCOUNT"), tpE("strong", null, d.acc.name), tpE("button", { type: "button", onClick: d.onWallet, "aria-label": "Deposit dan Withdraw" }, tpIc('Wallet', 18)))),
        tpFacts(d, sel, setSel),
        tpE("div", { className: "tp-card t6-st" }, rows.map(([l, v, t]) => tpE("div", { key: l }, tpE("small", null, l), tpE("b", { className: t }, v)))),
        tpE("section", { className: "tp-card t6-ch" }, tpE("button", { type: "button", className: "t6-more", onClick: d.onStats, "aria-label": "Statistik lanjutan" }, tpIc('MoreHorizontal', 20)), tpE("div", { className: "t6-fb", ref: fit.box }, tpE(HeroChart, { trades: d.cs, startBal: d.startBal, onOpen: d.onOpen, hh: fit.m.w ? Math.max(200, Math.round(500 * fit.m.h / fit.m.w)) : 360, ro: 1.3, fs: 1.45, floor: 5, upCol: 'var(--t-dk)', ext: ctl, hideTools: true, persist: true })), tpE("div", { className: "t6-ft" }, tpE(TplChips, { ctl }), tpE(TplKind, { ctl }))),
        tpE("div", { className: "tp-card t6-m" }, m.map(([l, v, t]) => tpE("div", { key: l }, tpE("small", null, l), tpE("b", { className: t }, v)))),
        tpActions(d));
}
function HomeTemplate({ n, d }) { useEffect(() => { tplFontLoad(n); }, [n]); return [null, HomeT1, HomeT2, null, null, HomeT5, HomeT6][n] ? React.createElement([null, HomeT1, HomeT2, null, null, HomeT5, HomeT6][n], { d }) : null; }
