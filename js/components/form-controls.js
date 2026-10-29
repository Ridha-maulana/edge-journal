/* Pilihan (TSelect) dan pemilih tanggal/waktu (DateField) */
"use strict";
function TSelect({ value, onChange, options, title }) {
    const [open, setOpen] = useState(false);
    const opts = options.map(o => typeof o === 'string' ? { v: o, l: o } : o);
    const cur = opts.find(o => o.v === value) || opts[0];
    return React.createElement(React.Fragment, null,
        React.createElement("button", { type: "button", className: "tsel", onClick: () => setOpen(true) },
            React.createElement("span", null, cur.l),
            React.createElement(ChevronDown, { size: 15 })),
        open && ReactDOM.createPortal(React.createElement("div", { className: "modal-backdrop center top sheet-layer", onClick: e => { if (e.target === e.currentTarget)
                setOpen(false); } },
            React.createElement("div", { className: "tsel-sheet" },
                React.createElement("div", { className: "tsel-title" }, title || 'Pilih'),
                opts.map(o => React.createElement("button", { type: "button", key: o.v, className: o.v === value ? 'on' : '', onClick: () => { setOpen(false); onChange(o.v); } },
                    React.createElement("span", null, o.l),
                    React.createElement("i", null))))), document.body));
}
function DateField({ value, onChange, withTime, min }) {
    const p2 = n => String(n).padStart(2, '0');
    const parse = v => { const x = v ? new Date(withTime ? v : v + 'T12:00') : new Date(); return isNaN(x) ? new Date() : x; };
    const [open, setOpen] = useState(false);
    const [d, setD] = useState(parse(value));
    const [cur, setCur] = useState(parse(value));
    const show = value ? (withTime ? `${fmtLong(value.slice(0, 10))}, ${value.slice(11, 16)}` : fmtLong(value.slice(0, 10))) : 'Pilih tanggal';
    function openIt() { const x = parse(value); setD(x); setCur(new Date(x.getFullYear(), x.getMonth(), 1)); setOpen(true); }
    const y = cur.getFullYear(), m = cur.getMonth(), days = new Date(y, m + 1, 0).getDate(), off = (new Date(y, m, 1).getDay() + 6) % 7;
    const sel = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
    const done = () => { onChange(withTime ? `${sel}T${p2(d.getHours())}:${p2(d.getMinutes())}` : sel); setOpen(false); };
    const col = (n, val, set) => Array.from({ length: n }, (_, i) => React.createElement("button", { type: "button", key: i, className: i === val ? 'on' : '', ref: i === val ? (el => { if (el && el.parentNode) {
            el.parentNode.scrollTop = el.offsetTop - el.parentNode.clientHeight / 2 + 18;
        } }) : null, onClick: () => set(i) }, p2(i)));
    return React.createElement(React.Fragment, null,
        React.createElement("button", { type: "button", className: "dfield", onClick: openIt },
            React.createElement("span", null, show),
            React.createElement(CalendarDays, { size: 16 })),
        open && ReactDOM.createPortal(React.createElement("div", { className: "modal-backdrop center top sheet-layer", onClick: e => { if (e.target === e.currentTarget)
                setOpen(false); } },
            React.createElement("div", { className: "dp-sheet" },
                React.createElement("div", { className: "dp-head" },
                    React.createElement("span", { className: "dp-nav" },
                        React.createElement("button", { type: "button", className: "icon-btn", onClick: () => setCur(new Date(y - 1, m, 1)) }, "\u00AB"),
                        React.createElement("button", { type: "button", className: "icon-btn", onClick: () => setCur(new Date(y, m - 1, 1)) },
                            React.createElement(ChevronLeft, { size: 16 }))),
                    React.createElement("strong", null, cur.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })),
                    React.createElement("span", { className: "dp-nav" },
                        React.createElement("button", { type: "button", className: "icon-btn", onClick: () => setCur(new Date(y, m + 1, 1)) },
                            React.createElement(ChevronRight, { size: 16 })),
                        React.createElement("button", { type: "button", className: "icon-btn", onClick: () => setCur(new Date(y + 1, m, 1)) }, "\u00BB"))),
                React.createElement("div", { className: "dp-week" }, ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(x => React.createElement("span", { key: x }, x))),
                React.createElement("div", { className: "dp-grid" },
                    Array.from({ length: off }, (_, i) => React.createElement("i", { key: 'e' + i })),
                    Array.from({ length: days }, (_, i) => { const day = i + 1, iso = `${y}-${p2(m + 1)}-${p2(day)}`; return React.createElement("button", { type: "button", key: iso, disabled: !!min && iso < min, className: iso === sel ? 'on' : '', onClick: () => setD(new Date(y, m, day, d.getHours(), d.getMinutes())) }, day); })),
                withTime && React.createElement("div", { className: "dp-time" },
                    React.createElement("div", { className: "dp-col" }, col(24, d.getHours(), h => setD(new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, d.getMinutes())))),
                    React.createElement("b", null, ":"),
                    React.createElement("div", { className: "dp-col" }, col(60, d.getMinutes(), mi => setD(new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), mi))))),
                React.createElement("div", { className: "dp-actions" },
                    React.createElement("button", { type: "button", onClick: () => setOpen(false) }, "Batal"),
                    React.createElement("button", { type: "button", onClick: done }, "Setel")))), document.body));
}
