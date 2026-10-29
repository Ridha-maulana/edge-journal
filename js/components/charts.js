/* Grafik: combo chart, mini chart, donut, animasi hitung */
"use strict";
function useCountUp(target, ms = 900) { const [v, setV] = useState(0); const from = useRef(0); useEffect(() => { const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; if (reduce) {
    setV(target);
    from.current = target;
    return;
} const s0 = from.current, t0 = performance.now(); let raf; const step = now => { const p = Math.min(1, (now - t0) / ms); const e = 1 - Math.pow(1 - p, 3); const cur = s0 + (target - s0) * e; setV(cur); from.current = cur; if (p < 1)
    raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf); }, [target]); return v; }
function smoothPath(P) { if (P.length < 2)
    return ''; let d = `M${P[0][0]},${P[0][1]}`; for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
} return d; }
function ComboChart({ vals, labels, col, fmt }) {
    const [hv, setHv] = useState(null);
    const W = 500, H = 176, T = 18, B = 30, L = 6, R = 6;
    const n = vals.length;
    const lo = Math.min(...vals), hi = Math.max(...vals), sp = (hi - lo) || 1;
    const x = i => L + (n < 2 ? (W - L - R) / 2 : i / (n - 1) * (W - L - R));
    const y = v => T + (hi - v) / sp * (H - T - B);
    const P = vals.map((v, i) => [x(i), y(v)]);
    const d = n > 1 ? smoothPath(P) : `M${L},${y(0)} L${W - R},${y(0)}`;
    const base = H - B;
    const gid = col === '#34d399' ? 'ccg' : 'ccr';
    const ix = hv == null ? n - 1 : hv;
    const move = e => { if (n < 2)
        return; const r = e.currentTarget.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width * W; setHv(Math.max(0, Math.min(n - 1, Math.round((px - L) / ((W - L - R) / (n - 1)))))); };
    return React.createElement("svg", { viewBox: `0 0 ${W} ${H}`, className: "combo-chart", onPointerMove: move, onPointerDown: move, onPointerLeave: () => setHv(null), onPointerCancel: () => setHv(null) },
        React.createElement("defs", null,
            React.createElement("linearGradient", { id: gid, x1: "0", x2: "0", y1: "0", y2: "1" },
                React.createElement("stop", { offset: "0", stopColor: col, stopOpacity: ".4" }),
                React.createElement("stop", { offset: "1", stopColor: col, stopOpacity: "0" })),
            React.createElement("filter", { id: "ccglow", x: "-10%", y: "-30%", width: "120%", height: "160%" },
                React.createElement("feGaussianBlur", { stdDeviation: "3.5" }))),
        [.25, .5, .75].map(f => React.createElement("line", { key: f, x1: L, x2: W - R, y1: T + (H - T - B) * f, y2: T + (H - T - B) * f, stroke: "#2a3a60", strokeWidth: "1", strokeDasharray: "3 6" })),
        React.createElement("line", { x1: L, x2: W - R, y1: base, y2: base, stroke: "#33466f", strokeWidth: "1" }),
        n > 1 && React.createElement("path", { d: `${d} L${x(n - 1)},${base} L${x(0)},${base} Z`, fill: `url(#${gid})`, className: "cc-area" }),
        React.createElement("path", { d: d, pathLength: "1", className: "cc-line", fill: "none", stroke: col, strokeWidth: "9", opacity: ".28", filter: "url(#ccglow)" }),
        React.createElement("path", { d: d, pathLength: "1", className: "cc-line", fill: "none", stroke: col, strokeWidth: "3.2", strokeLinecap: "round", strokeLinejoin: "round" }),
        n > 1 && hv != null && React.createElement("line", { x1: x(ix), x2: x(ix), y1: T, y2: base, stroke: "#fff", strokeOpacity: ".28", strokeDasharray: "3 3" }),
        n > 1 && hv == null && React.createElement("circle", { cx: x(ix), cy: y(vals[ix]), r: "8", fill: col, className: "cc-pulse" }),
        n > 1 && React.createElement("circle", { cx: x(ix), cy: y(vals[ix]), r: "5", fill: col, stroke: "#0f172a", strokeWidth: "2.5", className: "cc-dot" }),
        n > 1 && React.createElement("text", { x: Math.min(Math.max(x(ix), 78), W - 78), y: "12", textAnchor: "middle", fontSize: "12", fontWeight: "700", fill: hv != null ? '#eef2ff' : col },
            hv != null ? `${labels[ix]} · ` : '',
            fmt(vals[ix])),
        n < 2 && React.createElement("text", { x: W / 2, y: H / 2, textAnchor: "middle", fontSize: "12", fill: "#7d8bab" }, "Belum ada trade pada periode ini"),
        React.createElement("text", { x: L, y: H - 9, fontSize: "11", fill: "#7d8bab" }, labels[0]),
        n > 1 && React.createElement("text", { x: W - R, y: H - 9, textAnchor: "end", fontSize: "11", fill: "#7d8bab" }, labels[n - 1]));
}
function MiniChart({ vals, labels, kind, fmt }) {
    if (!vals.length)
        return React.createElement("div", { className: "pe-empty" }, "Belum ada data untuk grafik ini.");
    const W = 500, H = 230, L = 58, R = 12, T = 14, B = 30;
    const lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
    const span = (hi - lo) || 1;
    const y = v => T + (hi - v) / span * (H - T - B);
    const n = vals.length;
    const x = i => kind === 'bar' ? L + (i + .5) * ((W - L - R) / n) : (n === 1 ? (L + W - R) / 2 : L + i * ((W - L - R) / (n - 1)));
    const grid = [0, 1, 2, 3].map(i => lo + span * i / 3);
    const col = vals[n - 1] >= 0 ? '#34d399' : '#ff6b81';
    const line = vals.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    const bw = Math.min(28, (W - L - R) / n * .7);
    return React.createElement("svg", { viewBox: `0 0 ${W} ${H}`, className: "pe-svg" },
        grid.map((g, i) => React.createElement("g", { key: i },
            React.createElement("line", { x1: L, x2: W - R, y1: y(g), y2: y(g), stroke: "#233252", strokeWidth: "1" }),
            React.createElement("text", { x: L - 6, y: y(g) + 4, textAnchor: "end", fontSize: "11", fill: "#7d8bab" }, fmt(g)))),
        React.createElement("line", { x1: L, x2: W - R, y1: y(0), y2: y(0), stroke: "#3a4d78", strokeWidth: "1.5" }),
        kind === 'bar' ? vals.map((v, i) => React.createElement("rect", { key: i, x: x(i) - bw / 2, y: Math.min(y(v), y(0)), width: bw, height: Math.max(2, Math.abs(y(v) - y(0))), rx: "3", fill: v >= 0 ? '#34d399' : '#ff6b81' })) : React.createElement(React.Fragment, null,
            n > 1 && React.createElement("polygon", { points: `${x(0)},${y(0)} ${line} ${x(n - 1)},${y(0)}`, fill: col, opacity: ".14" }),
            React.createElement("polyline", { points: line, pathLength: "1", className: "cc-line", fill: "none", stroke: col, strokeWidth: "3", strokeLinejoin: "round", strokeLinecap: "round" }),
            React.createElement("circle", { cx: x(n - 1), cy: y(vals[n - 1]), r: "5", fill: col })),
        [0, Math.floor((n - 1) / 2), n - 1].filter((v, i, a) => a.indexOf(v) === i).map(i => React.createElement("text", { key: i, x: x(i), y: H - 8, textAnchor: "middle", fontSize: "11", fill: "#7d8bab" }, labels[i])));
}
function Donut({ wins, losses }) {
    const tot = wins + losses;
    const r = 52, c = 2 * Math.PI * r;
    const wr = tot ? wins / tot * 100 : 0;
    return React.createElement("svg", { viewBox: "0 0 140 140", className: "pe-donut" },
        React.createElement("circle", { cx: "70", cy: "70", r: r, fill: "none", stroke: tot ? '#ff6b81' : '#233252', strokeWidth: "16" }),
        tot > 0 && React.createElement("circle", { cx: "70", cy: "70", r: r, fill: "none", stroke: "#34d399", strokeWidth: "16", strokeDasharray: `${c * wins / tot} ${c}`, transform: "rotate(-90 70 70)" }),
        React.createElement("text", { x: "70", y: "76", textAnchor: "middle", fontSize: "22", fontWeight: "800", fill: wr >= 50 ? '#34d399' : tot ? '#ff6b81' : '#9aa7c5' },
            tot ? wr.toFixed(1) : '0',
            "%"));
}
