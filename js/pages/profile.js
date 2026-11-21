/* Halaman Profil (Account management, sinkron online, backup, export) */
"use strict";
/* Sapaan di bagian atas Profil: lingkaran inisial + nama dari email login (kalau sudah masuk) */
function useCloudStatus() {
    const [st, setSt] = useState(() => (window.cloudSync && window.cloudSync.getStatus()) || null);
    useEffect(() => { let off = null, t = null, tries = 0; const attach = () => { if (window.cloudSync) off = window.cloudSync.subscribe(setSt); else if (tries++ < 80) t = setTimeout(attach, 300); }; attach(); return () => { if (off) off(); clearTimeout(t); }; }, []);
    return st;
}
/* keterangan singkat status sinkron untuk baris "Sinkron online" */
function cloudDesc(st) {
    if (!st) return 'Memuat layanan online\u2026';
    if (!st.configured) return 'Belum aktif di browser ini';
    if (!st.user) return 'Belum masuk \u00B7 sentuh untuk masuk';
    const time = st.lastSyncAt ? new Date(st.lastSyncAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':') : '';
    return { synced: 'Tersinkron' + (time ? ' \u00B7 ' + time : ''), syncing: 'Menyinkronkan\u2026', dirty: 'Perubahan menunggu dikirim\u2026', offline: 'Offline \u2014 dikirim saat online', conflict: 'Perlu pilihan Anda', error: 'Gagal sinkron' }[st.state] || 'Terhubung';
}
/* Ringkasan status sinkron: teks pendek, jam terakhir, dan nada warna (ok/warn/bad) */
function syncShort(st) {
    if (!st) return { text: 'Memuat\u2026', tone: '', time: '' };
    if (!st.configured) return { text: 'Belum aktif', tone: '', time: '' };
    if (!st.user) return { text: 'Belum masuk', tone: '', time: '' };
    const time = st.lastSyncAt ? new Date(st.lastSyncAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':') : '';
    const m = { synced: ['Tersinkron', 'ok'], syncing: ['Menyinkronkan\u2026', 'warn'], dirty: ['Menunggu kirim', 'warn'], offline: ['Offline', 'warn'], conflict: ['Perlu pilihan', 'bad'], error: ['Gagal sinkron', 'bad'] }[st.state] || ['Online', ''];
    return { text: m[0], tone: m[1], time: st.state === 'synced' ? time : '' };
}
/* Angka kartu akun: jumlah posisi, win rate dari posisi tertutup, hasil tahun ini */
function acctStats(account) {
    const all = (account && account.trades) || [], yr = String(new Date().getFullYear());
    let closed = 0, win = 0, pnl = 0;
    all.forEach(t => { if (t.status !== 'closed') return; const v = Number(t.pnl) || 0; closed++; if (v > 0) win++; if (String(t.date || '').slice(0, 4) === yr) pnl += v; });
    return { total: all.length, closed, win: closed ? Math.round(win * 100 / closed) : 0, pnl };
}
function PfRow({ icon, title, value, tone, onOpen }) {
    return React.createElement("button", { type: "button", className: "pf-li", onClick: onOpen },
        React.createElement("span", { className: "pf-chp" }, icon),
        React.createElement("span", { className: "pf-lt" }, title),
        value ? React.createElement("span", { className: "pf-lv" + (tone ? ' ' + tone : '') }, value) : null,
        React.createElement(ChevronRight, { size: 16 }));
}
function PfTile({ icon, title, sub, onOpen }) {
    return React.createElement("button", { type: "button", className: "pf-tile", onClick: onOpen },
        icon, React.createElement("span", null, React.createElement("b", null, title), React.createElement("small", null, sub)));
}
function AccountPage({ accounts, activeAccount, onSelect, onCreate, onDelete, onUpdate, onCapital, onExport, onBackup, onRestore }) {
    const st = useCloudStatus();
    const [page, setPage] = useState(null);
    const [sure, setSure] = useState(false);
    useEffect(() => { if (!sure) return; const t = setTimeout(() => setSure(false), 4000); return () => clearTimeout(t); }, [sure]);
    const go = v => { setPage(v); try { window.scrollTo(0, 0); } catch (e) { } };
    const sy = syncShort(st), ss = acctStats(activeAccount), cur = activeAccount.currency;
    const email = st && st.user && st.user.email ? String(st.user.email) : '';
    const clean = email ? email.split('@')[0].replace(/[^A-Za-z]/g, '') : '';
    const name = clean ? clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase() : 'Trader';
    const initials = clean ? clean.slice(0, 2).toUpperCase() : String(activeAccount.name || 'T').trim().charAt(0).toUpperCase();
    const signed = !!(st && st.user);
    function logout() {
        if (!sure) { setSure(true); return; }
        setSure(false);
        try { markSignedOut(); } catch (e) { }
        try { window.cloudSync.signOut(); } catch (e) { }
    }
    if (page) {
        const titles = { account: 'Account management', sync: 'Sinkron online', backup: 'Cloud backup', export: 'Export & share' };
        const body = page === 'account'
            ? React.createElement(AccountModal, { inline: true, key: activeAccount.id + ':' + accounts.length, accounts: accounts, activeAccount: activeAccount, onSelect: onSelect, onCreate: onCreate, onDelete: onDelete, onUpdate: onUpdate, onCapital: onCapital, onBackup: onBackup, onRestore: onRestore, onExport: onExport })
            : page === 'sync' ? React.createElement(CloudSyncCard, null)
            : page === 'backup'
                ? React.createElement("div", { className: "tool-card" }, React.createElement("p", { className: "sync-note", style: { marginTop: 0 } }, "Buat atau pulihkan file backup JSON."),
                    React.createElement("div", { className: "button-row" },
                        React.createElement("button", { className: "secondary-btn", onClick: onBackup }, React.createElement(Cloud, { size: 15 }), " Create backup"),
                        React.createElement("label", { className: "secondary-btn" }, React.createElement(Upload, { size: 15 }), " Restore",
                            React.createElement("input", { type: "file", accept: "application/json", hidden: true, onChange: e => { var _a; return onRestore((_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]); } }))))
                : React.createElement("div", { className: "tool-card" }, React.createElement("p", { className: "sync-note", style: { marginTop: 0 } }, "Bagikan jurnal " + activeAccount.name + " ke CSV."),
                    React.createElement("button", { className: "secondary-btn", onClick: onExport }, React.createElement(Download, { size: 16 }), " Share CSV"));
        return React.createElement("section", null,
            React.createElement(SubHead, { title: titles[page], onBack: () => go(null) }),
            React.createElement("div", { className: "acc-panel sp-panel" }, body));
    }
    return React.createElement("section", { className: "pf" },
        React.createElement("div", { className: "pf-top" },
            React.createElement("h1", null, "Profil"),
            React.createElement("button", { type: "button", className: "pf-cb", "aria-label": "Status sinkron: " + sy.text, onClick: () => go('sync') },
                React.createElement(Cloud, { size: 20 }), signed && React.createElement("i", { className: sy.tone }))),
        React.createElement("div", { className: "pf-user" },
            React.createElement("div", { className: "prof-av" }, initials),
            React.createElement("div", { className: "t" },
                React.createElement("div", { className: "prof-name" }, "Hai, ", React.createElement("b", null, name.length > 16 ? name.slice(0, 16) : name)),
                React.createElement("div", { className: "prof-mail" }, email || 'Belum masuk \u00B7 data tersimpan di perangkat ini')),
            React.createElement("button", { type: "button", className: "pf-pill", onClick: () => go('account') }, "Akun")),
        React.createElement("div", { className: "pf-hero" },
            React.createElement("div", { className: "r1" }, React.createElement("span", null, activeAccount.name), React.createElement("span", { className: "pf-chip " + sy.tone }, sy.text + (sy.time ? ' ' + sy.time : ''))),
            React.createElement("div", { className: "big" }, money(acctNowBal(activeAccount), cur), React.createElement("small", null, "saldo")),
            ss.closed > 0 && React.createElement("div", { className: "bar", role: "img", "aria-label": "Win rate " + ss.win + " persen" }, React.createElement("i", { style: { width: ss.win + '%' } })),
            React.createElement("div", { className: "ft" }, ss.total ? (ss.closed ? 'Win rate ' + ss.win + '% \u00B7 ' : '') + ss.total + ' posisi \u00B7 ' + (ss.pnl >= 0 ? '+' : '\u2212') + money(Math.abs(ss.pnl), cur) + ' tahun ini' : 'Belum ada posisi')),
        React.createElement("div", { className: "pf-tiles" },
            React.createElement(PfTile, { icon: React.createElement(Cloud, { size: 20 }), title: "Sinkron", sub: sy.time || sy.text, onOpen: () => go('sync') }),
            React.createElement(PfTile, { icon: React.createElement(FileJson, { size: 20 }), title: "Backup", sub: "File JSON", onOpen: () => go('backup') }),
            React.createElement(PfTile, { icon: React.createElement(Share2, { size: 20 }), title: "Export", sub: "CSV", onOpen: () => go('export') })),
        React.createElement("div", { className: "pf-grp" },
            React.createElement(PfRow, { icon: React.createElement(UserRound, { size: 18 }), title: "Account management", value: activeAccount.name, onOpen: () => go('account') }),
            React.createElement(PfRow, { icon: React.createElement(Cloud, { size: 18 }), title: "Sinkron online", value: sy.text, tone: sy.tone, onOpen: () => go('sync') }),
            React.createElement(PfRow, { icon: React.createElement(FileJson, { size: 18 }), title: "Cloud backup", value: "JSON", onOpen: () => go('backup') }),
            React.createElement(PfRow, { icon: React.createElement(Share2, { size: 18 }), title: "Export & share", value: "CSV", onOpen: () => go('export') }),
            React.createElement(PfRow, { icon: React.createElement(Zap, { size: 18 }), title: "Tes getar", onOpen: () => hapticTest().then(msg => notify(msg)) })),
        signed
            ? React.createElement("button", { type: "button", className: "pf-out" + (sure ? ' sure' : ''), onClick: logout }, sure ? "Ketuk lagi untuk keluar" : "Keluar")
            : React.createElement("button", { type: "button", className: "pf-out in", onClick: () => go('sync') }, "Masuk ke akun online"),
        React.createElement("p", { className: "sync-note foot pf-ver" }, "Edge Journal v" + APP_VERSION + " \u00B7 data tersimpan lokal di perangkat ini"));
}
