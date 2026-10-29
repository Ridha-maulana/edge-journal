/* Kalender trade */
"use strict";
function CalendarModal({ trades, onClose, onSelectDate }) {
    const [cursor, setCursor] = useState(new Date());
    const year = cursor.getFullYear(), month = cursor.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (new Date(year, month, 1).getDay() + 6) % 7;
    const info = trades.reduce((acc, t) => { const k = dateOnly(t.date); const x = (acc[k] || (acc[k] = { pnl: 0, count: 0 })); x.pnl += t.status === 'closed' ? (Number(t.pnl) || 0) : 0; x.count += 1; return acc; }, {});
    const monthPnl = Object.keys(info).filter(k => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).reduce((a, k) => a + info[k].pnl, 0);
    const cells = [];
    for (let i = 0; i < offset; i++)
        cells.push(React.createElement("div", { className: "cal-cell empty", key: `e${i}` }));
    for (let day = 1; day <= daysInMonth; day++) {
        const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const v = info[iso];
        cells.push(React.createElement("button", { key: iso, className: `cal-cell ${v ? (v.pnl > 0 ? 'win' : v.pnl < 0 ? 'loss' : 'flat') : ''}`, onClick: () => v && onSelectDate(iso) },
            React.createElement("span", { className: "cal-day" }, day),
            v && React.createElement(React.Fragment, null,
                React.createElement("b", null,
                    v.pnl >= 0 ? '+' : '',
                    Math.round(v.pnl * 100) / 100),
                React.createElement("small", null,
                    v.count,
                    " posisi"))));
    }
    return React.createElement("div", { className: "calendar-page" },
        React.createElement("div", { className: "cal-top" },
            React.createElement("button", { className: "icon-btn", onClick: onClose, "aria-label": "Kembali" },
                React.createElement(ChevronLeft, { size: 18 })),
            React.createElement("strong", null, "Calendar"),
            React.createElement("span", { className: monthPnl >= 0 ? 'positive' : 'negative' },
                monthPnl >= 0 ? '+' : '',
                money(monthPnl))),
        React.createElement("div", { className: "cal-nav" },
            React.createElement("button", { className: "icon-btn", onClick: () => setCursor(new Date(year, month - 1, 1)) },
                React.createElement(ChevronLeft, { size: 16 })),
            React.createElement("strong", null, cursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })),
            React.createElement("button", { className: "icon-btn", onClick: () => setCursor(new Date(year, month + 1, 1)) },
                React.createElement(ChevronRight, { size: 16 }))),
        React.createElement("div", { className: "cal-week" }, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(x => React.createElement("span", { key: x }, x))),
        React.createElement("div", { className: "cal-grid" }, cells),
        React.createElement("p", { className: "helper-note" },
            React.createElement(CalendarDays, { size: 13 }),
            " Ketuk tanggal yang punya posisi untuk melihat jurnal hari itu."));
}
