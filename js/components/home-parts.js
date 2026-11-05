/* Header dan menu bawah milik 6 template halaman utama (persis gambar rujukan). Gaya: css/21-home-templates.css */
"use strict";
const tpI = (name, size, sw) => React.createElement(Icon, { name, size: size || 20, strokeWidth: sw || 2 });
function TplHeader({ n, account, onCalendar, onAccount }) {
    useEffect(() => { tplFontLoad(n); }, [n]);
    const h = React.createElement;
    const now = new Date();
    const dText = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const dLong = now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).replace(/\./g, '');
    const logo = h("span", { className: "ht-logo" }, tpI('Zap', 18, 2));
    const brand = (a, b) => h("div", { className: "ht-brand" }, logo, h("div", { className: "ht-bt" }, h("strong", null, a), h("span", null, b)));
    const dateChip = h("button", { type: "button", className: "ht-date", onClick: onCalendar, "aria-label": "Buka kalender" }, tpI('CalendarDays', 18), h("span", null, dText), tpI('ChevronDown', 14, 2.2));
    const calBtn = h("button", { type: "button", className: "ht-cal", onClick: onCalendar, "aria-label": "Buka kalender" }, tpI('CalendarDays', 18));
    const accChip = h("button", { type: "button", className: "ht-acc", onClick: onAccount, "aria-label": "Account management" }, tpI('UserRound', 18), h("span", null, account.name), tpI('ChevronDown', 14, 2.2));
    const wrap = (kids) => h("header", { className: "ht ht" + n }, kids);
    switch (n) {
        case 1: return wrap([brand('EDGE JOURNAL', 'TRADING LOGBOOK'), h("div", { className: "ht-r", key: 'r' }, dateChip, accChip)]);
        case 2: return wrap([
            h("div", { className: "ht-row", key: 'a' }, brand('Edge Journal', 'Trading Logbook'), accChip),
            h("div", { className: "ht-row ht-row2", key: 'b' },
                h("div", { className: "ht-hello" }, h("strong", null, "Halo, Trader!"), h("span", null, "Disiplin hari ini, hasil besar nanti", tpI('Leaf', 16, 2))),
                h("button", { type: "button", className: "ht-dcard", onClick: onCalendar, "aria-label": "Buka kalender" }, tpI('CalendarDays', 24), h("div", null, h("b", null, dLong), h("span", null, "Tetap konsisten", tpI('Leaf', 12, 2)))))
        ]);
        case 3: return wrap([
            h("div", { className: "ht-row", key: 'a' }, brand('EDGE JOURNAL', 'TRADING LOGBOOK'), h("div", { className: "ht-cap" }, h("span", null, "DISCIPLINE"), h("span", null, "BUILDS"), h("span", null, "FREEDOM"), h("i", null))),
            h("div", { className: "ht-r", key: 'b' }, calBtn, accChip)
        ]);
        case 4: return wrap([
            h("div", { className: "ht-row", key: 'a' }, h("div", { className: "ht-title" }, h("strong", null, tpFit("EDGE", 118, .59), h("span", { className: "ht-bolt" }, tpI('Zap', 30, 2.4))), h("strong", null, tpFit("JOURNAL", 118, .56)), h("em", null, "TRADING LOGBOOK")), h("div", { className: "ht-cap" }, h("span", null, "DISCIPLINE"), h("span", null, "TRACKS"), h("span", null, "PROGRESS"), h("i", null))),
            h("div", { className: "ht-r", key: 'b' }, calBtn, accChip)
        ]);
        case 5: return wrap([brand('EDGE JOURNAL', 'TRADING LOGBOOK'), h("div", { className: "ht-r", key: 'r' }, dateChip, accChip)]);
        default: return wrap([brand('EDGE JOURNAL', 'TRADING LOGBOOK'), h("div", { className: "ht-r", key: 'r' }, calBtn, accChip)]);
    }
}
function TplNav({ n, tab, showAdd, navHidden, goTab, openAdd }) {
    useEffect(() => { tplFontLoad(n); }, [n]);
    const h = React.createElement;
    const d = TPL_NAV[n] || TPL_NAV[1];
    const on = [tab === 'performance' && !showAdd, tab === 'journal' && !showAdd, !!showAdd, tab === 'tools' && !showAdd, tab === 'account' && !showAdd];
    const go = [() => goTab('performance'), () => goTab('journal'), openAdd, () => goTab('tools'), () => goTab('account')];
    return h("nav", { className: "bottom-nav bn bn" + n + (navHidden ? " nav-hidden" : "") },
        d.labels.map((l, i) => h("button", { key: i, type: "button", className: "bt-item" + (on[i] ? " on" : ""), "aria-current": on[i] ? 'page' : undefined, onClick: go[i] }, h("span", { className: "bt-ic" }, tpI(d.icons[i], 24, n === 2 || n === 4 ? 2.2 : 1.9)), h("span", { className: "bt-lb" }, l))),
        d.cap && h("div", { className: "bt-cap", "aria-hidden": "true" }, d.cap.map((t, i) => h("span", { key: i }, t)), h("i", null)));
}
