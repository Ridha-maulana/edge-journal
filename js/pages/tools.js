/* Halaman Tools: kolom cari, kartu tool yang bisa digeser, ringkasan bergaya struk (v5.10.2) */
"use strict";
function TlCard({ tc, icon, cat, title, desc, onOpen }) {
    return React.createElement("div", { className: "tl-card", style: { "--tc": tc } },
        React.createElement("div", { className: "tl-kt" }, icon),
        React.createElement("div", { className: "tl-cat" }, cat),
        React.createElement("h3", null, title),
        React.createElement("p", null, desc),
        React.createElement("button", { type: "button", className: "tl-kb", onClick: onOpen }, "Buka Tool"));
}
function TlRow({ name, value, color, desc }) {
    return React.createElement(React.Fragment, null,
        React.createElement("div", { className: "tl-r1" }, React.createElement("b", null, name), React.createElement("em", { style: color ? { color } : null }, value)),
        React.createElement("div", { className: "tl-rd" }, desc),
        React.createElement("div", { className: "tl-dash" }));
}
function Tools({ homeT, onHome, headerVariant, onHeaderVariant, navVariant, onNavVariant, account, onCalcTrade }) {
    const [page, setPage] = useState(null);
    const [alarmOpen, setAlarmOpen] = useState(false);
    const [q, setQ] = useState('');
    const [prog, setProg] = useState({ w: 33, l: 0 });
    const EJ = useAppearance(), al = window.useAlarmSummary ? window.useAlarmSummary() : { on: 0, next: null };
    const go = v => { setPage(v); try { window.scrollTo(0, 0); } catch (e) { } };
    if (page === 'appearance')
        return React.createElement("section", null,
            React.createElement(SubHead, { title: "Tampilan aplikasi", onBack: () => go(null) }),
            React.createElement("div", { className: "acc-list" },
                React.createElement(AppearanceRows, { homeT: homeT, onHome: onHome, headerVariant: headerVariant, onHeaderVariant: onHeaderVariant, navVariant: navVariant, onNavVariant: onNavVariant })));
    if (page === 'risk')
        return React.createElement("section", null,
            React.createElement(SubHead, { title: "Risk calculator", onBack: () => go(null) }),
            React.createElement("div", { className: "acc-panel sp-panel" }, React.createElement(RiskCalc, { account: account, onTrade: onCalcTrade })));
    const st = EJ.state, th = EJ.THEMES[st.theme], mode = { light: 'Terang', dark: 'Gelap', auto: 'Otomatis' }[st.mode] || '';
    const themeName = th ? th.name : '';
    const bal = money(acctNowBal(account), account.currency);
    const all = [
        { id: 'risk', tc: '#22c55e', icon: React.createElement(Calculator, { size: 28 }), cat: 'KALKULATOR', title: 'Risk Calculator', desc: 'Perhitungan otomatis Stop Loss, Take Profit & ukuran lot trading.', key: 'risk calculator kalkulator stop loss take profit lot sl tp', open: () => go('risk'),
            sum: { name: 'Risk Calculator', value: 'Saldo ' + bal, desc: 'Hitung SL, TP, dan lot dari saldo akun dan risiko per trade.' } },
        { id: 'alarm', tc: '#f97316', icon: React.createElement(Icon, { name: "AlAlarm", size: 28 }), cat: 'PENGINGAT', title: 'Alarm', desc: 'Notifikasi sesi Asia, London & New York, lengkap dengan nada dan durasi.', key: 'alarm pengingat notifikasi sesi asia london new york nada', open: () => setAlarmOpen(true),
            sum: { name: 'Alarm', value: al.on + ' aktif', color: '#f97316', desc: (al.next ? 'Berikutnya ' + al.next.label + ' dalam ' + al.next.dur + '. ' : 'Belum ada alarm aktif. ') + 'Nada dan durasi bisa diatur.' } },
        { id: 'look', tc: '#ec4899', icon: React.createElement(Icon, { name: "Paintbrush", size: 28 }), cat: 'PERSONALISASI', title: 'Tampilan', desc: 'Tema, efek kartu, latar, header, dan navigasi aplikasi.', key: 'tampilan tema efek kartu latar header navigasi personalisasi warna', open: () => go('appearance'),
            sum: { name: 'Tampilan', value: themeName, color: '#ec4899', desc: (mode ? mode + ' · ' : '') + 'Ganti tema, efek, header, dan navigasi.' } }
    ];
    const needle = q.trim().toLowerCase();
    const list = needle ? all.filter(t => (t.title + ' ' + t.cat + ' ' + t.key).toLowerCase().includes(needle)) : all;
    const onScroll = e => { const el = e.currentTarget, max = el.scrollWidth - el.clientWidth, w = Math.min(100, el.clientWidth * 100 / Math.max(1, el.scrollWidth)); setProg({ w, l: max > 0 ? (el.scrollLeft / max) * (100 - w) : 0 }); };
    return React.createElement("section", { className: "tl" },
        React.createElement(PageHeading, { title: "Trading Tools", description: "Kalkulator risk, alarm, dan tampilan aplikasi.", className: "relaxed" }),
        React.createElement("div", { className: "search-box tl-search" },
            React.createElement(Search, { size: 15 }),
            React.createElement("input", { value: q, onChange: e => setQ(e.target.value), placeholder: "Cari tool: risk, alarm, tampilan…", "aria-label": "Cari tool" }),
            q && React.createElement("button", { type: "button", className: "tl-clear", "aria-label": "Hapus pencarian", onClick: () => setQ('') }, React.createElement(X, { size: 15 }))),
        list.length ? React.createElement(React.Fragment, null,
            React.createElement("div", { className: "tl-hint" }, "Geser untuk melihat menu tools"),
            React.createElement("div", { className: "tl-car" + (list.length === 1 ? " one" : ""), onScroll: onScroll, key: needle }, list.map(t => React.createElement(TlCard, { key: t.id, tc: t.tc, icon: t.icon, cat: t.cat, title: t.title, desc: t.desc, onOpen: t.open }))),
            list.length > 1 && React.createElement("div", { className: "tl-sbar", "aria-hidden": "true" }, React.createElement("i", { style: { width: prog.w + '%', left: prog.l + '%' } })))
            : React.createElement("div", { className: "tl-none" }, "Tidak ada tool untuk “" + q.trim() + "”"),
        list.length ? React.createElement("div", { className: "tl-rc" + (list.length === 1 ? " gap" : "") },
            React.createElement("div", { className: "tl-rt" }, "RINGKASAN TOOLS"),
            React.createElement("div", { className: "tl-rs" }, needle ? 'hasil pencarian: "' + q.trim() + '"' : 'dipakai di akun ' + account.name),
            React.createElement("div", { className: "tl-dash" }),
            list.map(t => React.createElement(TlRow, { key: t.id, name: t.sum.name, value: t.sum.value, color: t.sum.color, desc: t.sum.desc })),
            React.createElement("div", { className: "tl-rf" }, needle ? list.length + ' dari 3 tool.' : 'Geser kartu untuk membuka tool.')) : null,
        alarmOpen && window.AlarmPage && React.createElement(window.AlarmPage, { onClose: () => setAlarmOpen(false) }));
}
