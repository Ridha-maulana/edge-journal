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
    const [ap, setAp] = useState({ dlg: null, scroll: null });
    const [more, setMore] = useState({});
    const MT = window.METODE.useMetode();
    const EJ = useAppearance(), al = window.useAlarmSummary ? window.useAlarmSummary() : { on: 0, next: null };
    const go = (v, o) => { setAp(o || { dlg: null, scroll: null }); setPage(v); try { window.scrollTo(0, 0); } catch (e) { } };
    if (page === 'appearance')
        return React.createElement("section", null,
            React.createElement(SubHead, { title: "Tampilan aplikasi", onBack: () => go(null) }),
            React.createElement("div", { className: "acc-list" },
                React.createElement(AppearanceRows, { openDlg: ap.dlg, scrollTo: ap.scroll, homeT: homeT, onHome: onHome, headerVariant: headerVariant, onHeaderVariant: onHeaderVariant, navVariant: navVariant, onNavVariant: onNavVariant })));
    if (page === 'metode')
        return React.createElement(window.MetodePage, { onBack: () => go(null), sec: ap.sec, tab: ap.tab });
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
            sum: { name: 'Tampilan', value: themeName, color: '#ec4899', desc: (mode ? mode + ' · ' : '') + 'Ganti tema, efek, header, dan navigasi.' } },
        { id: 'metode', tc: '#eab308', icon: React.createElement(BookOpen, { size: 28 }), cat: 'STRATEGI', title: 'Metode Satu Warna', desc: 'SOP H1 mekanis: syarat Buy/Sell, aturan Skip, alarm :15/:20, dan evaluasi 100 posisi.', key: 'metode satu warna sop strategi h1 mekanis buy sell skip fibonacci', open: () => go('metode'),
            sum: { name: 'Metode Satu Warna', value: 'H1 \u00B7 Lot 0.01', color: '#eab308', desc: 'Cek chart di menit :15 atau :20. Tiga syarat lengkap = entry, kurang satu = skip.' } }
    ];
    const needle = q.trim().toLowerCase();
    const onScroll = e => { const el = e.currentTarget, max = el.scrollWidth - el.clientWidth, w = Math.min(100, el.clientWidth * 100 / Math.max(1, el.scrollWidth)); setProg({ w, l: max > 0 ? (el.scrollLeft / max) * (100 - w) : 0 }); };
    const TOOL = { risk: { name: 'KALKULATOR', tc: '#22c55e', icon: 'Calculator' }, alarm: { name: 'PENGINGAT', tc: '#f97316', icon: 'AlAlarm' }, look: { name: 'PERSONALISASI', tc: '#ec4899', icon: 'Paintbrush' }, metode: { name: 'STRATEGI', tc: '#eab308', icon: 'BookOpen' } };
    let results = null;
    if (needle) {
        const E = [];
        all.forEach(t => E.push({ tool: t.id, title: t.title, sub: t.cat.charAt(0) + t.cat.slice(1).toLowerCase() + ' \u203A buka tool', key: t.key, act: t.open, top: 1 }));
        const rk = (title, key) => E.push({ tool: 'risk', title, sub: 'Risk Calculator', key: key || '', act: () => go('risk') });
        rk('Risk %', 'persentase risiko per trade'); rk('Saldo akun', 'balance modal'); rk('Entry', 'harga masuk open'); rk('Stop loss', 'sl batas rugi'); rk('Take profit', 'tp target untung');
        rk('Lot disarankan', 'ukuran posisi volume lots'); rk('Reward', 'rasio risk reward rr'); rk('Mata uang', 'currency usd idr'); rk('Symbol', 'pair instrumen xauusd'); rk('Arah', 'long short buy sell');
        rk('Buat posisi', 'pakai lot ini jurnal catat'); rk('Tukar lot dan risk persen', 'ganti isian');
        const ar = (title, key) => E.push({ tool: 'alarm', title, sub: 'Alarm', key: key || '', act: () => setAlarmOpen(true) });
        ar('Nada dering', 'pilih dari daftar nada dering hp suara ringtone'); ar('Berbunyi selama', 'durasi menit lama bunyi'); ar('Getar saat alarm berbunyi', 'getaran vibrasi');
        ar('Hapus setelah alarm berbunyi', 'sekali pakai'); ar('Label', 'nama alarm'); ar('Ulangi', 'hari senin selasa rabu kamis jumat sabtu minggu'); ar('Jam alarm', 'waktu menit detik');
        ar('Tunda', 'snooze'); ar('Alarm susulan', 'pengingat lanjutan'); ar('Alarm baru', 'tambah buat');
        (al.names || []).forEach(n => ar(n, 'alarm saya'));
        const idx = window.apSearchIndex ? window.apSearchIndex(EJ) : [];
        idx.forEach(x => E.push({ tool: 'look', title: x.title, sub: x.sub, key: x.key, act: () => go('appearance', { dlg: x.dlg, scroll: x.scroll }) }));
        window.METODE.searchIndex(MT).forEach(x => E.push({ tool: 'metode', title: x.title, sub: x.sub, key: x.key, act: () => go('metode', { sec: x.n, tab: x.tab }) }));
        const words = needle.split(/\s+/).filter(Boolean);
        const sc = e => { const t = e.title.toLowerCase(), h = t + ' ' + e.sub.toLowerCase() + ' ' + e.key.toLowerCase(); if (!words.every(w => h.indexOf(w) >= 0)) return -1; return (e.top ? 0 : 10) + (t.indexOf(needle) === 0 ? 0 : t.indexOf(needle) > 0 ? 2 : 5) + (words.every(w => t.indexOf(w) >= 0) ? 0 : 3); };
        const hit = E.map(e => ({ e, s: sc(e) })).filter(x => x.s >= 0);
        results = ['risk', 'alarm', 'metode', 'look'].map(k => ({ k, rows: hit.filter(x => x.e.tool === k).sort((a, b) => a.s - b.s).map(x => x.e) })).filter(g => g.rows.length);
    }
    const total = results ? results.reduce((n, g) => n + g.rows.length, 0) : 0;
    return React.createElement("section", { className: "tl" },
        React.createElement(PageHeading, { title: "Trading Tools", description: "Kalkulator risk, alarm, metode, dan tampilan aplikasi.", className: "relaxed" }),
        React.createElement("div", { className: "search-box tl-search" },
            React.createElement(Search, { size: 15 }),
            React.createElement("input", { value: q, onChange: e => { setQ(e.target.value); setMore({}); }, placeholder: "Cari tool atau pengaturan\u2026", "aria-label": "Cari tool atau pengaturan" }),
            q && React.createElement("button", { type: "button", className: "tl-clear", "aria-label": "Hapus pencarian", onClick: () => { setQ(''); setMore({}); } }, React.createElement(X, { size: 15 }))),
        needle ? (total ? React.createElement("div", { className: "tl-res" },
                React.createElement("div", { className: "tl-hint" }, total + " hasil untuk \u201C" + q.trim() + "\u201D"),
                results.map(g => { const T = TOOL[g.k], open = !!more[g.k], rows = open ? g.rows : g.rows.slice(0, 6);
                    return React.createElement("div", { key: g.k, className: "tl-gp" },
                        React.createElement("div", { className: "sec-label" }, T.name),
                        React.createElement("div", { className: "tl-grp" },
                            rows.map((r, n) => React.createElement("button", { type: "button", key: g.k + n, className: "tl-li", onClick: r.act },
                                React.createElement("span", { className: "tl-lt" }, React.createElement(Icon, { name: T.icon, size: 18 })),
                                React.createElement("span", { className: "tl-lx" }, React.createElement("b", null, r.title), React.createElement("small", null, r.sub)),
                                React.createElement(ChevronRight, { size: 16 }))),
                            g.rows.length > 6 && React.createElement("button", { type: "button", className: "tl-more", onClick: () => setMore({ ...more, [g.k]: !open }) }, open ? "Tampilkan lebih sedikit" : "Tampilkan " + (g.rows.length - 6) + " lainnya")));
                }))
            : React.createElement("div", { className: "tl-none" }, "Tidak ada hasil untuk \u201C" + q.trim() + "\u201D"))
        : React.createElement(React.Fragment, null,
            React.createElement("div", { className: "tl-hint" }, "Geser untuk melihat menu tools"),
            React.createElement("div", { className: "tl-car", onScroll: onScroll }, all.map(t => React.createElement(TlCard, { key: t.id, tc: t.tc, icon: t.icon, cat: t.cat, title: t.title, desc: t.desc, onOpen: t.open }))),
            React.createElement("div", { className: "tl-sbar", "aria-hidden": "true" }, React.createElement("i", { style: { width: prog.w + '%', left: prog.l + '%' } })),
            React.createElement("div", { className: "tl-rc" },
                React.createElement("div", { className: "tl-rt" }, "RINGKASAN TOOLS"),
                React.createElement("div", { className: "tl-rs" }, 'dipakai di akun ' + account.name),
                React.createElement("div", { className: "tl-dash" }),
                all.map(t => React.createElement(TlRow, { key: t.id, name: t.sum.name, value: t.sum.value, color: t.sum.color, desc: t.sum.desc })),
                React.createElement("div", { className: "tl-rf" }, 'Geser kartu untuk membuka tool.'))),
        alarmOpen && window.AlarmPage && React.createElement(window.AlarmPage, { onClose: () => setAlarmOpen(false) }));
}