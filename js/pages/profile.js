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
function ProfileHead({ account }) {
    const st = useCloudStatus();
    const email = st && st.user && st.user.email ? String(st.user.email) : '';
    const clean = email ? email.split('@')[0].replace(/[^A-Za-z]/g, '') : '';
    const name = clean ? clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase() : 'Trader';
    const initials = clean ? clean.slice(0, 2).toUpperCase() : String(account.name || 'T').trim().charAt(0).toUpperCase();
    return React.createElement("div", { className: "prof-head" },
        React.createElement("h1", null, "Profil"),
        React.createElement("div", { className: "prof-hello" },
            React.createElement("div", { className: "prof-av" }, initials),
            React.createElement("div", null,
                React.createElement("div", { className: "prof-name" }, "Hai, ", React.createElement("b", null, name.length > 16 ? name.slice(0, 16) : name)),
                React.createElement("div", { className: "prof-mail" }, email || 'Belum masuk \u00B7 data tersimpan di perangkat ini'))));
}
function AccountPage({ accounts, activeAccount, onSelect, onCreate, onDelete, onUpdate, onCapital, onExport, onBackup, onRestore }) {
    const [openKey, setOpenKey] = useState(null);
    const st = useCloudStatus();
    const tog = k => () => setOpenKey(openKey === k ? null : k);
    return React.createElement("section", null,
        React.createElement(ProfileHead, { account: activeAccount }),
        React.createElement("div", { className: "tool-grid acc-list" },
            React.createElement(AccRow, { icon: React.createElement(UserRound, { size: 18 }), title: "Account management", desc: activeAccount.name + " \u00B7 " + money(acctNowBal(activeAccount), activeAccount.currency), open: openKey === 'acct', onToggle: tog('acct') },
                React.createElement(AccountModal, { inline: true, key: activeAccount.id + ':' + accounts.length, accounts: accounts, activeAccount: activeAccount, onSelect: onSelect, onCreate: onCreate, onDelete: onDelete, onUpdate: onUpdate, onCapital: onCapital, onBackup: onBackup, onRestore: onRestore, onExport: onExport })),
            React.createElement(AccRow, { icon: React.createElement(Cloud, { size: 18 }), title: "Sinkron online", desc: cloudDesc(st), open: openKey === 'sync', onToggle: tog('sync') },
                React.createElement(CloudSyncCard, null)),
            React.createElement(AccRow, { icon: React.createElement(FileJson, { size: 18 }), title: "Cloud backup", desc: "Buat atau pulihkan file backup JSON", open: openKey === 'backup', onToggle: tog('backup') },
                React.createElement("div", { className: "tool-card" },
                    React.createElement("div", { className: "button-row" },
                        React.createElement("button", { className: "secondary-btn", onClick: onBackup },
                            React.createElement(Cloud, { size: 15 }),
                            " Create backup"),
                        React.createElement("label", { className: "secondary-btn" },
                            React.createElement(Upload, { size: 15 }),
                            " Restore",
                            React.createElement("input", { type: "file", accept: "application/json", hidden: true, onChange: e => { var _a; return onRestore((_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]); } }))))),
            React.createElement(AccRow, { icon: React.createElement(Share2, { size: 18 }), title: "Export & share", desc: "Bagikan jurnal " + activeAccount.name + " ke CSV", open: openKey === 'export', onToggle: tog('export') },
                React.createElement("div", { className: "tool-card" },
                    React.createElement("button", { className: "secondary-btn", onClick: onExport },
                        React.createElement(Download, { size: 16 }),
                        " Share CSV"))),
            React.createElement("button", { className: "pick-row", type: "button", onClick: () => hapticTest().then(msg => notify(msg)) },
                React.createElement("span", { className: "pick-ic" }, React.createElement(Zap, { size: 18 })),
                React.createElement("span", { className: "pick-tx" }, React.createElement("b", null, "Tes getar")),
                React.createElement(ChevronRight, { size: 18 }))),
        React.createElement("p", { className: "sync-note foot" }, "Edge Journal v" + APP_VERSION + " \u00B7 data tersimpan lokal di perangkat ini"));
}
