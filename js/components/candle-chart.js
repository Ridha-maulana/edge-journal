/* Grafik Performance: ganti Kandel / Garis (gaya TradingView) + skala H1 / Sesi / D1 */
"use strict";

/* Membentuk kandel ekuitas (P&L kumulatif) dari trade yang sudah urut waktu.
   H1   = satu kandel per jam masuk (trade tunggal = body penuh)
   Minggu = gabungan 5 kandel D1 (Senin-Jumat); Bulan = gabungan kandel minggu dalam satu bulan; Tahun (1Y) = gabungan kandel bulan dalam satu tahun.
   Sesi = gabungan kandel H1 dalam satu sesi (Asia 06-12, London 12-20, New York 20-06)
   D1   = gabungan kandel sesi dalam satu hari trading (mulai 06:00 WIB)
   Penggabungan standar OHLC: open = awal, close = akhir, high/low = ekstrem seluruh langkah. */
const CANDLE_TFS = [['H1', '1H'], ['SES', '1S'], ['D1', '1D'], ['W1', '1W'], ['M1', '1M'], ['Y1', '1Y']];
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
        else if (tf === 'W1') {
            const md = new Date(Date.UTC(Number(tday.slice(0, 4)), Number(tday.slice(5, 7)) - 1, Number(tday.slice(8, 10))));
            md.setUTCDate(md.getUTCDate() - ((md.getUTCDay() + 6) % 7));
            const fr = new Date(md.getTime() + 4 * 86400000);
            const iso = x => x.toISOString().slice(0, 10);
            k = iso(md);
            label = `Minggu ${candleDayLabel(iso(md))} \u2013 ${candleDayLabel(iso(fr))}`;
            short = candleDayLabel(iso(md));
        }
        else if (tf === 'M1') {
            k = tday.slice(0, 7);
            label = `${CANDLE_BULAN[Number(tday.slice(5, 7)) - 1]} ${tday.slice(0, 4)}`;
            short = CANDLE_BULAN[Number(tday.slice(5, 7)) - 1];
        }
        else if (tf === 'Y1') {
            k = tday.slice(0, 4);
            label = `Tahun ${tday.slice(0, 4)}`;
            short = tday.slice(0, 4);
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
const CANDLE_DEF = 120, CANDLE_MIN = 5, CANDLE_FLOOR = 8;
// tampilan awal: sebanyak kandel yang ada (maks 120); kurang dari 8 tetap selebar 8 slot, mulai dari kiri
function candleDef(n) { return Math.max(CANDLE_FLOOR, Math.min(CANDLE_DEF, n)); }
function CandleChart({ candles, tf, mode, resetKey }) {
    const isL = mode === 'line'; // mode garis: tampilan, skala, dan informasi sama dengan kandel
    const W = 500, H = 428, T = 36, B = 26, L = 6, AX = 46;
    const plotW = W - L - AX;
    const n = candles.length;
    const def = candleDef(n);
    const [count, setCount] = useState(def); // jumlah kandel yang tampak (zoom jari)
    const maxCount = Math.max(CANDLE_DEF, Math.min(500, n * 2));
    const def0 = Math.min(0, n - def); // jika kandel < 8: kandel pertama tetap di kiri
    const cnt = Math.max(CANDLE_MIN, Math.min(maxCount, count));
    const SW = plotW / cnt;
    const offMax = c => Math.max(0, n - 3); // boleh digeser sampai tinggal 3 kandel di sisi kanan
    const offMin = c => Math.min(-Math.max(3, c - 3), n - c); // dan ke ruang kosong di kanan (bebas seperti MT5)
    const clampOff = (v, c) => Math.max(offMin(c), Math.min(offMax(c), v));
    const [off, setOff] = useState(def0); // jumlah kandel digeser dari ujung kanan (terbaru)
    const [vy, setVy] = useState(0); // geser vertikal (satuan viewBox)
    const [vs, setVs] = useState(1); // skala vertikal (cubit dua jari vertikal)
    const [sel, setSel] = useState(null);
    const drag = useRef(null);
    const ptrs = useRef(new Map());
    const pinch = useRef(null);
    const svgRef = useRef(null);
    const [fresh, setFresh] = useState(true); // animasi tumbuh hanya saat jenis/skala berganti
    // ganti skala / data / tekan ulang tombol skala: kembali ke tampilan awal (120 kandel, terbaru di kanan)
    useEffect(() => { setOff(def0); setVy(0); setVs(1); setSel(null); setCount(def); setFresh(true); const tm = setTimeout(() => setFresh(false), 900); return () => clearTimeout(tm); }, [tf, n, resetKey]);
    // dua jari = zoom: cegah halaman ikut bergulir / ter-zoom browser
    useEffect(() => {
        const el = svgRef.current;
        if (!el)
            return;
        const stop = e => { if (e.touches && e.touches.length >= 2 && e.cancelable)
            e.preventDefault(); };
        el.addEventListener('touchstart', stop, { passive: false });
        el.addEventListener('touchmove', stop, { passive: false });
        return () => { el.removeEventListener('touchstart', stop); el.removeEventListener('touchmove', stop); };
    }, [n]);
    const o = clampOff(off, cnt);
    const shown = candles.slice(Math.max(0, Math.floor(n - o - cnt) - 1), Math.max(0, Math.min(n, Math.ceil(n - o) + 1)));
    let lo = Infinity, hi = -Infinity;
    shown.forEach(c => { lo = Math.min(lo, isL ? c.c : c.l); hi = Math.max(hi, isL ? c.c : c.h); });
    if (!isFinite(lo)) { lo = 0; hi = 1; }
    if (hi - lo < 1e-6) { hi += 1; lo -= 1; }
    const pad = (hi - lo) * .08;
    lo -= pad; hi += pad;
    { // skala vertikal (di sekitar tengah) lalu geser vertikal bebas
        const mid = (lo + hi) / 2, half = (hi - lo) / 2 / vs, d = vy * (hi - lo) / vs / (H - T - B);
        lo = mid - half + d; hi = mid + half + d;
    }
    const y = v => T + (hi - v) / (hi - lo) * (H - T - B);
    // posisi x: kandel terbaru di kanan, bergeser halus saat digeser
    const x = i => L + plotW - SW / 2 - ((n - 1 - i) - o) * SW;
    const ix = sel != null && sel >= 0 && sel < n ? sel : Math.min(n - 1, Math.max(0, n - 1 - Math.floor(o)));
    const act = candles[ix];
    const pair = () => { const p = [...ptrs.current.values()]; return { dx: Math.abs(p[0].x - p[1].x), dy: Math.abs(p[0].y - p[1].y) }; };
    const down = e => {
        ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        }
        catch (_) { }
        const r = e.currentTarget.getBoundingClientRect();
        if (ptrs.current.size === 2) {
            const p = [...ptrs.current.values()];
            const px = ((p[0].x + p[1].x) / 2 - r.left) / r.width * W;
            // kandel (indeks pecahan) tepat di antara dua jari — dijaga tetap di bawah jari saat zoom
            const idx = (n - 1) - o - (L + plotW - SW / 2 - px) / SW;
            const q = pair();
            pinch.current = { dx0: q.dx, dy0: q.dy, c0: cnt, v0: vs, px, idx, w: r.width };
            drag.current = null;
            return;
        }
        if (ptrs.current.size === 1)
            drag.current = { x: e.clientX, y: e.clientY, off: o, vy: vy, moved: false, w: r.width };
    };
    const move = e => {
        if (ptrs.current.has(e.pointerId))
            ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const pz = pinch.current;
        if (pz && ptrs.current.size >= 2) {
            const q = pair();
            let nc = pz.c0;
            if (pz.dx0 >= 30)
                nc = Math.max(CANDLE_MIN, Math.min(maxCount, pz.c0 * pz.dx0 / Math.max(8, q.dx)));
            if (pz.dy0 >= 40)
                setVs(Math.max(.25, Math.min(6, pz.v0 * Math.max(8, q.dy) / pz.dy0)));
            const sw2 = plotW / nc;
            // titik di antara dua jari tidak bergerak (bebas, bukan terkunci ke kandel terbaru)
            const no = (n - 1) - pz.idx - (L + plotW - sw2 / 2 - pz.px) / sw2;
            setCount(nc);
            setOff(clampOff(no, nc));
            return;
        }
        const d = drag.current;
        if (!d)
            return;
        const dx = e.clientX - d.x, dy = e.clientY - d.y;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4)
            d.moved = true;
        if (d.moved) {
            setOff(clampOff(d.off + dx / d.w * W / SW, cnt));
            setVy(Math.max(-H * .9, Math.min(H * .9, d.vy + dy / d.w * W)));
        }
    };
    const up = e => {
        ptrs.current.delete(e.pointerId);
        if (pinch.current) {
            if (ptrs.current.size < 2)
                pinch.current = null;
            drag.current = null; // sisa satu jari tidak dihitung sebagai ketukan / geser
            return;
        }
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
            if (best >= 0 && bd < Math.max(SW, 9))
                setSel(best);
        }
    };
    const cancel = e => { ptrs.current.delete(e.pointerId); if (ptrs.current.size < 2)
        pinch.current = null; drag.current = null; };
    if (!n)
        return React.createElement("svg", { viewBox: `0 0 ${W} ${H}`, className: "combo-chart candle-chart" },
            React.createElement("text", { x: W / 2, y: H / 2, textAnchor: "middle", fontSize: "12", fill: "#7d8bab" }, "Belum ada trade pada periode ini"));
    const grid = [0, 1, 2, 3].map(i => lo + (hi - lo) * (i + .5) / 4);
    const step = Math.max(1, Math.ceil(58 / SW));
    const col = c => c.c > c.o ? '#34d399' : c.c < c.o ? '#ff6b81' : '#9aa7c5';
    const bw = Math.max(1.4, SW * .62), wk = Math.max(.9, Math.min(1.6, bw * .55));
    return React.createElement("svg", { viewBox: `0 0 ${W} ${H}`, ref: svgRef, className: "combo-chart candle-chart", onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: cancel },
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "cdclip" },
                React.createElement("rect", { x: L, y: T - 4, width: plotW, height: H - T - B + 8 }))),
        grid.map((g, i) => React.createElement("g", { key: i },
            React.createElement("line", { x1: L, x2: W - AX, y1: y(g), y2: y(g), stroke: "#2a3a60", strokeWidth: "1", strokeDasharray: "3 6" }),
            React.createElement("text", { x: W - 2, y: y(g) + 3.5, textAnchor: "end", fontSize: "10", fill: "#7d8bab" }, candleNum(g)))),
        React.createElement("line", { x1: L, x2: W - AX, y1: H - B, y2: H - B, stroke: "#33466f", strokeWidth: "1" }),
        lo < 0 && hi > 0 && React.createElement("line", { x1: L, x2: W - AX, y1: y(0), y2: y(0), stroke: "#4a5f91", strokeWidth: "1", strokeDasharray: "2 3" }),
        isL && React.createElement("g", { clipPath: "url(#cdclip)" }, (() => {
            const P = shown.map(c => [x(candles.indexOf(c)), y(c.c)]);
            const lc = candles[n - 1].c >= 0 ? '#34d399' : '#ff6b81';
            const base = H - B, cls = fresh ? "cd-in" : "";
            const d = P.length > 1 ? smoothPath(P) : `M${L},${P[0][1]} L${W - AX},${P[0][1]}`;
            return React.createElement(React.Fragment, null,
                React.createElement("defs", null,
                    React.createElement("linearGradient", { id: "cdg", x1: "0", x2: "0", y1: "0", y2: "1" },
                        React.createElement("stop", { offset: "0", stopColor: lc, stopOpacity: ".38" }),
                        React.createElement("stop", { offset: "1", stopColor: lc, stopOpacity: "0" }))),
                P.length > 1 && React.createElement("path", { d: `${d} L${P[P.length - 1][0]},${base} L${P[0][0]},${base} Z`, fill: "url(#cdg)", className: `cl-area ${cls}` }),
                React.createElement("path", { d: d, pathLength: "1", className: `cl-line ${cls}`, fill: "none", stroke: lc, strokeWidth: "2.8", strokeLinecap: "round", strokeLinejoin: "round" }),
                React.createElement("line", { x1: x(ix), x2: x(ix), y1: T - 4, y2: base, stroke: "#fff", strokeOpacity: ".28", strokeDasharray: "3 3" }),
                React.createElement("circle", { cx: x(ix), cy: y(act.c), r: "4.6", fill: lc, stroke: "#0f172a", strokeWidth: "2.2" }));
        })()),
        !isL && React.createElement("g", { clipPath: "url(#cdclip)" }, shown.map(c => {
            const i = candles.indexOf(c);
            const cx = x(i);
            const top = y(Math.max(c.o, c.c)), bot = y(Math.min(c.o, c.c));
            const k = col(c);
            return React.createElement("g", { key: c.k, className: fresh ? "cd cd-in" : "cd", style: { "--i": Math.max(0, shown.indexOf(c)) }, opacity: i === ix ? 1 : .92 },
                i === ix && React.createElement("rect", { x: cx - SW / 2, y: T - 4, width: SW, height: H - T - B + 8, fill: "#fff", opacity: ".06" }),
                React.createElement("line", { x1: cx, x2: cx, y1: y(c.h), y2: y(c.l), stroke: k, strokeWidth: wk, strokeLinecap: "round" }),
                React.createElement("rect", { x: cx - bw / 2, y: top, width: bw, height: Math.max(1.8, bot - top), rx: bw > 4 ? "1.2" : "0", fill: k }));
        })),
        shown.map(c => { const i = candles.indexOf(c); return (i % step === 0 && x(i) > L + 14 && x(i) < W - AX - 14) ? React.createElement("text", { key: c.k, x: x(i), y: H - 8, textAnchor: "middle", fontSize: "9.5", fill: "#7d8bab" }, c.short) : null; }),
        React.createElement("text", { x: L, y: 13, fontSize: "11.5", fontWeight: "700", fill: "#eef2ff" },
            act.label,
            React.createElement("tspan", { fill: "#7d8bab", fontWeight: "500", dx: "6" },
                act.n,
                " trade")),
        isL && React.createElement("text", { x: L, y: 29, fontSize: "11", fontWeight: "600" },
            React.createElement("tspan", { fill: "#7d8bab", fontWeight: "500" }, "P&L "),
            React.createElement("tspan", { fill: act.c >= 0 ? '#34d399' : '#ff6b81' }, candleNum(act.c))),
        !isL && React.createElement("text", { x: L, y: 29, fontSize: "11", fontWeight: "600" },
            [['O', act.o], ['H', act.h], ['L', act.l], ['C', act.c]].map(([l, v], j) => React.createElement("tspan", { key: l, fill: col(act), dx: j ? "9" : "0" },
                React.createElement("tspan", { fill: "#7d8bab", fontWeight: "500" }, l + " "),
                candleNum(v)))),
        (Math.abs(o - def0) > 0.5 || Math.abs(vy) > 2 || Math.abs(vs - 1) > .02 || Math.abs(cnt - def) > 1) && React.createElement("text", { x: W - AX - 2, y: 13, textAnchor: "end", fontSize: "10", fill: "#5f6f94" }, "tekan skala = reset"),
        Math.abs(cnt - def) > 1 && React.createElement("text", { x: W - AX - 2, y: 29, textAnchor: "end", fontSize: "10", fill: "#5f6f94" }, Math.round(cnt) + " kandel"));
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
    const [rk, setRk] = useState(0);
    const pickTf = (v) => { setTf(v); candleSavedSet('ej3-chart-tf', v); setRk(r => r + 1); };
    const candles = useMemo(() => buildCandles(trades, tf), [trades, tf]);
    const isLine = kind !== 'candle';
    return React.createElement("div", { className: "hero-chart" },
        React.createElement("div", { className: "hc-body", key: kind + tf }, React.createElement(CandleChart, { candles: candles, tf: tf, mode: isLine ? 'line' : 'candle', resetKey: rk })),
        React.createElement("div", { className: "chart-tools" },
            React.createElement("div", { className: "ct-tf", role: "group", "aria-label": "Skala grafik" }, CANDLE_TFS.map(([k, l]) => React.createElement("button", { key: k, type: "button", className: tf === k ? 'ct-chip on' : 'ct-chip', onClick: () => pickTf(k) }, l))),
            React.createElement("button", { type: "button", className: `ct-pill ${isLine ? 'is-line' : 'is-candle'}`, role: "switch", "aria-checked": isLine, "aria-label": isLine ? "Beralih ke grafik kandel" : "Beralih ke grafik garis", onClick: () => pick(isLine ? 'candle' : 'line') },
                React.createElement("span", { className: "ct-thumb" }),
                React.createElement("svg", { className: "ct-ic ic-candle", viewBox: "0 0 24 24", width: "20", height: "20", "aria-hidden": "true" },
                    React.createElement("path", { d: "M7 3v3M7 18v3", stroke: "#ff6b81", strokeWidth: "2", strokeLinecap: "round" }),
                    React.createElement("rect", { x: 4.5, y: 6, width: 5, height: 12, rx: 1.2, fill: "#ff6b81" }),
                    React.createElement("path", { d: "M17 2v3M17 17v4", stroke: "#34d399", strokeWidth: "2", strokeLinecap: "round" }),
                    React.createElement("rect", { x: 14.5, y: 5, width: 5, height: 12, rx: 1.2, fill: "#34d399" })),
                React.createElement("svg", { className: "ct-ic ic-line", viewBox: "0 0 24 24", width: "20", height: "20", "aria-hidden": "true" },
                    React.createElement("path", { d: "M3 16c2-4 3-5 5-3s3 3 5-1 3-6 5-3 2 3 3 2", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" })))));
}
