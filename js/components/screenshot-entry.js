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
                React.createElement("span", null, "Screenshot Trade Entry ", React.createElement("em", { className: "beta-tag" }, "Pro"), React.createElement("small", { className: "add-menu-sub" }, "Riwayat MT5 atau chart posisi open")))));
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
    return { symbol: row.symbol || 'XAUUSD', symbolRaw: row.symbolRaw, symbolKnown: !!row.symbol, side: row.side, entry: row.entry, exit: row.exit, lots: row.lots, sl: row.sl, tp: row.tp, fees: Math.round(feeTotal * 100) / 100, exitMethod: method, ticket: row.ticket, shot: row.shot || '', profit: row.profit, net, rawOpen: row.openTime || row.closeTime, rawClose: row.closeTime, hasOpen, date: openW, closeDate: closeW };
}
/* hasil baca grafik MT5 (posisi open) -> isi awal form Tambah trade. Waktu buka tidak ada di grafik, jadi diisi waktu sekarang. */
function buildChartPrefill(ch) {
    return { chart: true, notes: ch.notes || [], symbol: ch.symbol || 'XAUUSD', symbolRaw: ch.symbolRaw, symbolKnown: !!ch.symbol, side: ch.side, entry: ch.entry, exit: null, lots: ch.lots || 0.01, sl: ch.sl, tp: ch.tp, fees: 0, exitMethod: undefined, ticket: '', profit: null, net: null, hasOpen: true, rawOpen: '', rawClose: '', date: isoNow(), closeDate: '' };
}
/* Layar daftar (v5.11.5): beberapa posisi dari satu screenshot. Ketuk posisi untuk membuka halaman Tambah trade dan memilih zona entry, simpan satu per satu.
   Tiket yang sudah tercatat ditandai dan harus dicentang dulu kalau tetap mau dicatat ulang. */
function ImportListModal({ account, rows, onClose, onAdd, onDone }) {
    const [tz, setTz] = useState(mt5GetTz());
    const full = rows.filter(r => r.detailed);
    const skipped = rows.length - full.length;
    const items = useMemo(() => full.map(r => buildPrefill(r, tz)), [rows, tz]);
    const have = new Set((account.trades || []).map(t => t.mt5Ticket).filter(Boolean));
    const [saved, setSaved] = useState({}); /* tiket -> id zona, untuk yang disimpan di layar ini */
    const [again, setAgain] = useState(new Set()); /* tiket ganda yang dicentang: tetap dicatat ulang */
    const [openPf, setOpenPf] = useState(null);
    const isDup = pf => have.has(pf.ticket) && !(pf.ticket in saved);
    const usable = items.filter(pf => !isDup(pf) || again.has(pf.ticket) || (pf.ticket in saved));
    const nSaved = Object.keys(saved).length;
    const toggleAgain = t => { const n = new Set(again); n.has(t) ? n.delete(t) : n.add(t); setAgain(n); };
    function changeTz(v) { mt5SetTz(v); setTz(v); }
    const fmt = s => s ? new Date(s).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':') : '-';
    const h = React.createElement, M = window.METODE;
    const row = (pf, i) => {
        const dup = isDup(pf), zid = saved[pf.ticket], z = zid && M ? M.zoneOf(zid) : null, canOpen = !dup || again.has(pf.ticket);
        const idx = usable.findIndex(u => u.ticket === pf.ticket);
        const open = () => { if (canOpen && !z) setOpenPf({ pf, n: idx + 1 }); };
        return h("div", { key: pf.ticket, className: "imp-row" + (z ? " done" : dup && !canOpen ? " dup" : " need") },
            dup && h("button", { type: "button", className: "imp-ck" + (again.has(pf.ticket) ? " on" : ""), role: "checkbox", "aria-checked": again.has(pf.ticket), "aria-label": "Catat ulang tiket " + pf.ticket, onClick: () => toggleAgain(pf.ticket) }, h("span", { className: "imp-box" }, again.has(pf.ticket) ? "\u2713" : "")),
            h("button", { type: "button", className: "imp-main", disabled: !canOpen || !!z, onClick: open },
                h("span", { className: "imp-t1" },
                    h("b", null, pf.symbol), h("em", { className: pf.side === 'Long' ? 'positive' : 'negative' }, pf.side), h("span", { className: "imp-lots" }, pf.lots),
                    h("strong", { className: (pf.net || 0) >= 0 ? 'positive' : 'negative' }, (pf.net || 0) >= 0 ? '+' : '', (pf.net || 0).toFixed(2))),
                h("small", null, pf.entry + " \u2192 " + pf.exit + " \u00B7 " + pf.exitMethod),
                h("small", null, fmt(pf.date) + " \u2192 " + fmt(pf.closeDate) + " \u00B7 #" + pf.ticket),
                h("span", { className: "imp-st" },
                    z ? h(React.Fragment, null, h("em", { className: "zs-chip " + z.tone }, z.name + " " + z.range), h("span", { className: "imp-ok" }, "\u2713 Tersimpan"))
                        : dup ? h("span", { className: "imp-warn" }, canOpen ? "Sudah tercatat \u00B7 akan dicatat ulang" : "Tiket sudah tercatat \u00B7 centang untuk catat ulang")
                            : h("em", { className: "zs-chip need" }, "Pilih zona entry"))),
            canOpen && !z && h(ChevronRight, { size: 20, className: "imp-go" }));
    };
    return h(React.Fragment, null,
        h("div", { className: "modal-backdrop fs" },
            h("div", { className: "modal wide-modal fs" },
                h("div", { className: "modal-head" },
                    h("div", null,
                        h("p", { className: "eyebrow" }, "SCREENSHOT ENTRY / PRO"),
                        h("h2", null, items.length + " posisi terbaca")),
                    h("button", { className: "icon-btn", type: "button", "aria-label": "Tutup", onClick: onClose }, h(X, { size: 19 }))),
                h("div", { className: "imp-prog" }, h("span", null, nSaved + " dari " + usable.length + " tersimpan"), h("div", { className: "imp-bar" }, h("i", { style: { width: (usable.length ? nSaved / usable.length * 100 : 0) + '%' } }))),
                h("div", { className: "scan-result" },
                    h("small", null, "Ketuk posisi untuk memilih zona entry, lalu simpan satu per satu."),
                    skipped > 0 && h("small", { className: "warn" }, skipped + " kartu dilewati karena infonya tidak lengkap (belum diketuk/dibuka di MT5)."),
                    h("label", null, "Zona waktu server MT5",
                        h("select", { value: tz, onChange: e => changeTz(e.target.value) }, MT5_TZ_OPTIONS.map(o => h("option", { key: o.v, value: o.v }, o.l)))),
                    h("small", null, "Waktu ditampilkan dalam WIB (UTC+7).")),
                items.map(row),
                h("div", { className: "fs-actions import-actions" },
                    h("button", { type: "button", className: "secondary-btn", onClick: onClose }, "Batal"),
                    h("button", { type: "button", className: "primary-btn", disabled: !nSaved, onClick: () => onDone(nSaved) }, nSaved ? "Selesai \u00B7 " + nSaved + " tersimpan" : "Selesai")),
                nSaved < usable.length && h("div", { className: "zs-hint" }, (usable.length - nSaved) + " posisi belum disimpan dan tidak akan tercatat"))),
        openPf && h(AddTradeModal, { key: openPf.pf.ticket, account, prefill: openPf.pf, step: "Posisi " + openPf.n + " dari " + usable.length + " \u00B7 #" + openPf.pf.ticket, saveLabel: "Simpan & kembali",
            onClose: () => setOpenPf(null),
            onSave: data => { onAdd(data); setSaved(sv => ({ ...sv, [openPf.pf.ticket]: data.zone })); setOpenPf(null); } }));
}
