/* Menu tombol + (Manual / Screenshot) dan layar tunggu saat screenshot dibaca */
"use strict";
function AddMenu({ onManual, onScreenshot, onClose }) {
    return React.createElement(React.Fragment, null,
        React.createElement("div", { className: "add-menu-backdrop", onClick: onClose }),
        React.createElement("div", { className: "add-menu", role: "menu" },
            React.createElement("button", { type: "button", className: "add-menu-item", role: "menuitem", onClick: onManual },
                React.createElement("span", { className: "add-menu-ico" }, React.createElement(Plus, { size: 17 })),
                React.createElement("span", null, "Manual Trade Entry")),
            React.createElement("button", { type: "button", className: "add-menu-item", role: "menuitem", onClick: onScreenshot },
                React.createElement("span", { className: "add-menu-ico" }, React.createElement(Camera, { size: 17 })),
                React.createElement("span", null, "Screenshot Trade Entry ", React.createElement("em", { className: "beta-tag" }, "Beta"), React.createElement("small", { className: "add-menu-sub" }, "Bisa pilih banyak gambar")))));
}
function ScanOverlay({ progress, text }) {
    const pct = Math.max(0, Math.min(100, Math.round((progress || 0) * 100)));
    return React.createElement("div", { className: "scan-overlay", role: "status" },
        React.createElement("div", { className: "scan-card" },
            React.createElement("div", { className: "scan-spinner" }),
            React.createElement("strong", null, "Membaca data trade dari screenshot…"),
            React.createElement("span", null, text || 'Mohon tunggu'),
            React.createElement("div", { className: "scan-bar" }, React.createElement("i", { style: { width: pct + '%' } }))));
}
/* ubah hasil baca (parseMt5Text) jadi isi awal form Tambah trade */
function buildPrefill(row, tzMode) {
    const hasOpen = !!row.openTime;
    const openW = mt5ToWib(row.openTime || row.closeTime, tzMode);
    const closeW = mt5ToWib(row.closeTime, tzMode);
    const tol = Math.max(0.011, Math.abs(row.entry) * 0.0001); // toleransi selip harga (slippage)
    const near = (a, b) => a != null && b != null && Math.abs(a - b) <= tol;
    const method = near(row.exit, row.tp) ? 'TP' : near(row.exit, row.sl) ? 'SL' : 'Manual';
    const feeTotal = -((Number(row.swap) || 0) + (Number(row.commission) || 0));
    const net = row.profit == null ? null : row.profit + (Number(row.swap) || 0) + (Number(row.commission) || 0);
    return { symbol: row.symbol || 'XAUUSD', symbolRaw: row.symbolRaw, symbolKnown: !!row.symbol, side: row.side, entry: row.entry, exit: row.exit, lots: row.lots, sl: row.sl, tp: row.tp, fees: Math.round(feeTotal * 100) / 100, exitMethod: method, ticket: row.ticket, profit: row.profit, net, rawOpen: row.openTime || row.closeTime, rawClose: row.closeTime, hasOpen, date: openW, closeDate: closeW };
}
/* Layar daftar: beberapa posisi sekaligus dari satu screenshot. Hanya kartu berinformasi lengkap yang bisa dipilih. */
function ImportListModal({ account, rows, onClose, onSave }) {
    const [tz, setTz] = useState(mt5GetTz());
    const full = rows.filter(r => r.detailed);
    const skipped = rows.length - full.length;
    const items = useMemo(() => full.map(r => buildPrefill(r, tz)), [rows, tz]);
    const have = new Set((account.trades || []).map(t => t.mt5Ticket).filter(Boolean));
    const isDup = pf => have.has(pf.ticket);
    const [off, setOff] = useState(() => new Set(full.filter(r => have.has(r.ticket)).map(r => r.ticket)));
    const picked = items.filter(pf => !off.has(pf.ticket));
    const toggle = t => { const n = new Set(off); n.has(t) ? n.delete(t) : n.add(t); setOff(n); };
    function changeTz(v) { mt5SetTz(v); setTz(v); }
    const fmt = s => s ? new Date(s).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':') : '-';
    return React.createElement("div", { className: "modal-backdrop fs" },
        React.createElement("div", { className: "modal wide-modal fs" },
            React.createElement("div", { className: "modal-head" },
                React.createElement("div", null,
                    React.createElement("p", { className: "eyebrow" }, "SCREENSHOT ENTRY / BETA"),
                    React.createElement("h2", null, items.length + " posisi terbaca")),
                React.createElement("button", { className: "icon-btn", onClick: onClose }, React.createElement(X, { size: 19 }))),
            React.createElement("div", { className: "scan-result" },
                React.createElement("small", null, "Centang posisi yang mau dicatat. Hanya kartu dengan info lengkap (tiket, waktu buka, SL, TP) yang dibaca."),
                skipped > 0 && React.createElement("small", { className: "warn" }, skipped + " kartu dilewati karena infonya tidak lengkap (belum diketuk/dibuka di MT5)."),
                React.createElement("label", null, "Zona waktu server MT5",
                    React.createElement("select", { value: tz, onChange: e => changeTz(e.target.value) }, MT5_TZ_OPTIONS.map(o => React.createElement("option", { key: o.v, value: o.v }, o.l)))),
                React.createElement("small", null, "Waktu ditampilkan dalam WIB (UTC+7).")),
            items.map(pf => {
                const on = !off.has(pf.ticket), dup = isDup(pf);
                return React.createElement("button", { type: "button", key: pf.ticket, className: "import-row" + (on ? " on" : ""), onClick: () => toggle(pf.ticket) },
                    React.createElement("span", { className: "import-check" }, on ? "✓" : ""),
                    React.createElement("span", { className: "import-body" },
                        React.createElement("strong", null, pf.symbol + " ", React.createElement("em", { className: pf.side === 'Long' ? 'positive' : 'negative' }, pf.side), " " + pf.lots, React.createElement("b", { className: (pf.net || 0) >= 0 ? 'positive' : 'negative' }, (pf.net || 0) >= 0 ? '+' : '', (pf.net || 0).toFixed(2))),
                        React.createElement("small", null, pf.entry + " → " + pf.exit + " · " + pf.exitMethod),
                        React.createElement("small", null, fmt(pf.date) + " → " + fmt(pf.closeDate)),
                        React.createElement("small", null, "SL " + (pf.sl == null ? '-' : pf.sl) + " · TP " + (pf.tp == null ? '-' : pf.tp) + " · #" + pf.ticket),
                        dup && React.createElement("small", { className: "warn" }, "Tiket ini sudah tercatat di akun ini.")));
            }),
            React.createElement("div", { className: "fs-actions import-actions" },
                React.createElement("button", { type: "button", className: "secondary-btn", onClick: onClose }, "Batal"),
                React.createElement("button", { type: "button", className: "primary-btn", disabled: !picked.length, onClick: () => onSave(picked) }, "Simpan " + picked.length + " trade"))));
}
