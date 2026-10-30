/* Grafik Performance: ganti Kandel / Garis (gaya TradingView) + skala H1 / Sesi / D1 */
"use strict";

/* Membentuk kandel ekuitas (P&L kumulatif) dari trade yang sudah urut waktu.
   H1   = satu kandel per jam masuk (trade tunggal = body penuh)
   Sesi = gabungan kandel H1 dalam satu sesi (Asia 06-12, London 12-20, New York 20-06)
   D1   = gabungan kandel sesi dalam satu hari trading (mulai 06:00 WIB)
   Penggabungan standar OHLC: open = awal, close = akhir, high/low = ekstrem seluruh langkah. */
const CANDLE_TFS = [['H1', 'H1'], ['SES', 'Sesi'], ['D1', 'D1']];
const CANDLE_BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const CANDLE_SESI = ['Asia', 'London', 'New York'];
function candleDayLabel(day) { return `${day.slice(8, 10)} ${CANDLE_BULAN[Number(day.slice(5, 7)) - 1]}`; }
function buildCandles(trades, tf) {
    const out = [];
    let eq = 0, cur = null;
    trades.forEach(t => {
        const d = new Date(t.date);
        if (isNaN(d))
            return;
        const w = wib(d);
        const tday = wib(new Date(d.getTime() - 6 * 3600 * 1000)).day;
        const si = w.hour >= 6 && w.hour < 12 ? 0 : w.hour >= 12 && w.hour < 20 ? 1 : 2;
        const hh = String(w.hour).padStart(2, '0');
        let k, label, short;
        if (tf === 'H1') {
            k = `${w.day} ${hh}`;
            label = `${candleDayLabel(w.day)} ${hh}:00`;
            short = `${w.day.slice(8, 10)}/${w.day.slice(5, 7)} ${hh}`;
        }
        else if (tf === 'SES') {
            k = `${tday}|${si}`;
            label = `${candleDayLabel(tday)} · ${CANDLE_SESI[si]}`;
            short = `${tday.slice(8, 10)}/${tday.slice(5, 7)} ${['AS', 'LDN', 'NY'][si]}`;
        }
        else {
            k = tday;
            label = candleDayLabel(tday);
            short = candleDayLabel(tday);
        }
        const before = eq, after = eq + (Number(t.pnl) || 0);
        eq = after;
        if (cur && cur.k === k) {
            cur.c = after;
            cur.h = Math.max(cur.h, before, after);
            cur.l = Math.min(cur.l, before, after);
            cur.n++;
        }
        else {
            cur = { k, label, short, o: before, c: after, h: Math.max(before, after), l: Math.min(before, after), n: 1 };
            out.push(cur);
        }
    });
    return out;
}
function candleNum(v) {
    const a = Math.abs(v);
    const s = a >= 10000 ? (a / 1000).toFixed(1) + 'k' : a >= 1000 ? (a / 1000).toFixed(2) + 'k' : a >= 100 ? a.toFixed(0) : a.toFixed(2);
    return (v < 0 ? '-' : v > 0 ? '+' : '') + s;
}
function CandleChart({ candles, tf }) {
    const W = 500, H = 214, T = 36, B = 26, L = 6, AX = 46;
    const SW = tf === 'D1' ? 26 : tf === 'SES' ? 22 : 18;
    const plotW = W - L - AX;
    const vis = Math.max(4, Math.floor(plotW / SW));
    const n = candles.length;
    const maxOff = Math.max(0, n - vis);
    const [off, setOff] = useState(0); // jumlah kandel digeser dari ujung kanan (terbaru)
    const [sel, setSel] = useState(null);
    const drag = useRef(null);
    useEffect(() => { setOff(0); setSel(null); }, [tf, n]);
    const o = Math.max(0, Math.min(maxOff, off));
    const shown = candles.slice(Math.max(0, Math.floor(n - o - vis)), Math.ceil(n - o));
    let lo = Infinity, hi = -Infinity;
    shown.forEach(c => { lo = Math.min(lo, c.l); hi = Math.max(hi, c.h); });
    if (!isFinite(lo)) { lo = 0; hi = 1; }
    if (hi - lo < 1e-6) { hi += 1; lo -= 1; }
    const pad = (hi - lo) * .08;
    lo -= pad; hi += pad;
    const y = v => T + (hi - v) / (hi - lo) * (H - T - B);
    // posisi x: kandel terbaru di kanan, bergeser halus saat digeser
    const x = i => L + plotW - SW / 2 - ((n - 1 - i) - o) * SW;
    const ix = sel != null && sel >= 0 && sel < n ? sel : Math.min(n - 1, Math.max(0, n - 1 - Math.floor(o)));
    const act = candles[ix];
    const down = e => { drag.current = { x: e.clientX, off: o, moved: false, w: e.currentTarget.getBoundingClientRect().width }; try {
        e.currentTarget.setPointerCapture(e.pointerId);
    }
    catch (_) { } };
    const move = e => {
        const d = drag.current;
        if (!d)
            return;
        const dx = e.clientX - d.x;
        if (Math.abs(dx) > 4)
            d.moved = true;
        if (d.moved) {
            const unit = dx / d.w * W / SW;
            setOff(Math.max(0, Math.min(maxOff, d.off + unit)));
        }
    };
    const up = e => {
        const d = drag.current;
        drag.current = null;
        if (d && !d.moved) {
            const r = e.currentTarget.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width * W;
            let best = -1, bd = 1e9;
            shown.forEach(c => { const i = candles.indexOf(c); const dd = Math.abs(x(i) - px); if (dd < bd) {
                bd = dd;
                best = i;
            } });
            if (best >= 0 && bd < SW)
                setSel(best);
        }
    };
    if (!n)
        return React.createElement("svg", { viewBox: `0 0 ${W} ${H}`, className: "combo-chart candle-chart" },
            React.createElement("text", { x: W / 2, y: H / 2, textAnchor: "middle", fontSize: "12", fill: "#7d8bab" }, "Belum ada trade pada periode ini"));
    const grid = [0, 1, 2, 3].map(i => lo + (hi - lo) * (i + .5) / 4);
    const step = Math.max(1, Math.ceil(64 / SW));
    const col = c => c.c > c.o ? '#34d399' : c.c < c.o ? '#ff6b81' : '#9aa7c5';
    const bw = SW * .62;
    return React.createElement("svg", { viewBox: `0 0 ${W} ${H}`, className: "combo-chart candle-chart", onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: () => { drag.current = null; } },
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "cdclip" },
                React.createElement("rect", { x: L, y: T - 4, width: plotW, height: H - T - B + 8 }))),
        grid.map((g, i) => React.createElement("g", { key: i },
            React.createElement("line", { x1: L, x2: W - AX, y1: y(g), y2: y(g), stroke: "#2a3a60", strokeWidth: "1", strokeDasharray: "3 6" }),
            React.createElement("text", { x: W - 2, y: y(g) + 3.5, textAnchor: "end", fontSize: "10", fill: "#7d8bab" }, candleNum(g)))),
        React.createElement("line", { x1: L, x2: W - AX, y1: H - B, y2: H - B, stroke: "#33466f", strokeWidth: "1" }),
        lo < 0 && hi > 0 && React.createElement("line", { x1: L, x2: W - AX, y1: y(0), y2: y(0), stroke: "#4a5f91", strokeWidth: "1", strokeDasharray: "2 3" }),
        React.createElement("g", { clipPath: "url(#cdclip)" }, shown.map(c => {
            const i = candles.indexOf(c);
            const cx = x(i);
            const top = y(Math.max(c.o, c.c)), bot = y(Math.min(c.o, c.c));
            const k = col(c);
            return React.createElement("g", { key: c.k, opacity: i === ix ? 1 : .92 },
                i === ix && React.createElement("rect", { x: cx - SW / 2, y: T - 4, width: SW, height: H - T - B + 8, fill: "#fff", opacity: ".06" }),
                React.createElement("line", { x1: cx, x2: cx, y1: y(c.h), y2: y(c.l), stroke: k, strokeWidth: "1.6", strokeLinecap: "round" }),
                React.createElement("rect", { x: cx - bw / 2, y: top, width: bw, height: Math.max(1.8, bot - top), rx: "1.2", fill: k }));
        })),
        shown.map(c => { const i = candles.indexOf(c); return (i % step === 0 && x(i) > L + 14 && x(i) < W - AX - 14) ? React.createElement("text", { key: c.k, x: x(i), y: H - 8, textAnchor: "middle", fontSize: "9.5", fill: "#7d8bab" }, c.short) : null; }),
        React.createElement("text", { x: L, y: 13, fontSize: "11.5", fontWeight: "700", fill: "#eef2ff" },
            act.label,
            React.createElement("tspan", { fill: "#7d8bab", fontWeight: "500", dx: "6" },
                act.n,
                " trade")),
        React.createElement("text", { x: L, y: 29, fontSize: "11", fontWeight: "600" },
            [['O', act.o], ['H', act.h], ['L', act.l], ['C', act.c]].map(([l, v], j) => React.createElement("tspan", { key: l, fill: col(act), dx: j ? "9" : "0" },
                React.createElement("tspan", { fill: "#7d8bab", fontWeight: "500" }, l + " "),
                candleNum(v)))),
        o > 0.5 && React.createElement("text", { x: W - AX - 2, y: 13, textAnchor: "end", fontSize: "10", fill: "#7d8bab" }, "← geser →"));
}

function candleSavedGet(k, d) { try {
    return localStorage.getItem(k) || d;
}
catch (_) {
    return d;
} }
function candleSavedSet(k, v) { try {
    localStorage.setItem(k, v);
}
catch (_) { } }
function HeroChart({ trades, line }) {
    const [kind, setKind] = useState(() => candleSavedGet('ej3-chart-kind', 'line'));
    const [tf, setTf] = useState(() => candleSavedGet('ej3-chart-tf', 'SES'));
    const pick = (k) => { setKind(k); candleSavedSet('ej3-chart-kind', k); };
    const pickTf = (v) => { setTf(v); candleSavedSet('ej3-chart-tf', v); };
    const candles = useMemo(() => buildCandles(trades, tf), [trades, tf]);
    const ic = (paths) => React.createElement("svg", { viewBox: "0 0 24 24", width: "17", height: "17", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, paths);
    return React.createElement("div", { className: "hero-chart" },
        kind === 'candle' ? React.createElement(CandleChart, { candles: candles, tf: tf }) : line,
        React.createElement("div", { className: "chart-tools" },
            React.createElement("div", { className: "ct-seg", role: "group", "aria-label": "Jenis grafik" },
                React.createElement("button", { type: "button", className: kind === 'candle' ? 'ct-btn on' : 'ct-btn', onClick: () => pick('candle'), "aria-label": "Grafik kandel", title: "Kandel" },
                    ic([React.createElement("path", { key: 1, d: "M7 3v3M7 17v4" }), React.createElement("rect", { key: 2, x: 4.5, y: 6, width: 5, height: 11, rx: 1 }), React.createElement("path", { key: 3, d: "M17 7v2M17 18v3" }), React.createElement("rect", { key: 4, x: 14.5, y: 9, width: 5, height: 9, rx: 1 })]),
                    React.createElement("span", null, "Kandel")),
                React.createElement("button", { type: "button", className: kind === 'line' ? 'ct-btn on' : 'ct-btn', onClick: () => pick('line'), "aria-label": "Grafik garis", title: "Garis" },
                    ic([React.createElement("path", { key: 1, d: "M3 17l5-6 4 3 8-9" })]),
                    React.createElement("span", null, "Garis"))),
            kind === 'candle' && React.createElement("div", { className: "ct-seg ct-tf", role: "group", "aria-label": "Skala kandel" }, CANDLE_TFS.map(([k, l]) => React.createElement("button", { key: k, type: "button", className: tf === k ? 'ct-btn on' : 'ct-btn', onClick: () => pickTf(k) }, l)))));
}
