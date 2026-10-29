/* Item menu, judul halaman, kartu metrik */
"use strict";
function NavItem({ active, onClick, icon, label }) { return React.createElement("button", { type: "button", className: active ? 'nav-item active' : 'nav-item', "aria-current": active ? 'page' : undefined, onClick: onClick },
    icon,
    React.createElement("span", null, label)); }
function PageHeading({ eyebrow, title, description, action }) { return React.createElement("div", { className: "page-heading" },
    React.createElement("div", null,
        React.createElement("p", { className: "eyebrow" }, eyebrow),
        React.createElement("h1", null, title),
        React.createElement("p", { className: "muted" }, description)),
    action); }
function Metric({ label, value, icon, accent, sub, tone }) { return React.createElement("div", { className: "metric" },
    React.createElement("div", { className: `metric-icon ${accent}` }, icon),
    React.createElement("span", null, label),
    React.createElement("strong", { className: tone ? `val-${tone}` : '' }, value),
    sub && React.createElement("small", { className: String(sub).trim().startsWith('-') ? 'sub-neg' : String(sub).trim().startsWith('+') ? 'sub-pos' : '' }, sub)); }
