/* Halaman Profil (Account management, sinkron online, backup, export) */
"use strict";
/* Sapaan di bagian atas Profil: lingkaran inisial + nama dari email login (kalau sudah masuk) */
function ProfileHead({ account }) {
    const [st, setSt] = useState(() => (window.cloudSync && window.cloudSync.getStatus()) || null);
    useEffect(() => { let off = null, t = null, tries = 0; const attach = () => { if (window.cloudSync) off = window.cloudSync.subscribe(setSt); else if (tries++ < 80) t = setTimeout(attach, 300); }; attach(); return () => { if (off) off(); clearTimeout(t); }; }, []);
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
    const [acctOpen, setAcctOpen] = useState(false);
    return React.createElement("section", null,
        React.createElement(ProfileHead, { account: activeAccount }),
        React.createElement("div", { className: "tool-grid" },
            React.createElement(AccRow, { icon: React.createElement(UserRound, { size: 18 }), title: "Account management", desc: activeAccount.name + " \u00B7 " + money(acctNowBal(activeAccount), activeAccount.currency), open: acctOpen, onToggle: () => setAcctOpen(!acctOpen) },
                React.createElement(AccountModal, { inline: true, key: activeAccount.id + ':' + accounts.length, accounts: accounts, activeAccount: activeAccount, onSelect: onSelect, onCreate: onCreate, onDelete: onDelete, onUpdate: onUpdate, onCapital: onCapital, onBackup: onBackup, onRestore: onRestore, onExport: onExport })),
            React.createElement(CloudSyncCard, null),
        React.createElement("div", { className: "tool-card" },
            React.createElement("div", { className: "tool-head" },
                React.createElement("div", { className: "tool-icon purple" },
                    React.createElement(FileJson, null)),
                React.createElement("div", null,
                    React.createElement("h2", null, "Cloud backup"),
                    React.createElement("p", null, "Buat atau pulihkan file backup JSON."))),
            React.createElement("div", { className: "button-row" },
                React.createElement("button", { className: "secondary-btn", onClick: onBackup },
                    React.createElement(Cloud, { size: 15 }),
                    " Create backup"),
                React.createElement("label", { className: "secondary-btn" },
                    React.createElement(Upload, { size: 15 }),
                    " Restore",
                    React.createElement("input", { type: "file", accept: "application/json", hidden: true, onChange: e => { var _a; return onRestore((_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]); } })))),
        React.createElement("div", { className: "tool-card" },
            React.createElement("div", { className: "tool-head" },
                React.createElement("div", { className: "tool-icon green" },
                    React.createElement(Share2, null)),
                React.createElement("div", null,
                    React.createElement("h2", null, "Export & share"),
                    React.createElement("p", null,
                        "Bagikan jurnal ",
                        activeAccount.name,
                        " ke Excel atau spreadsheet."))),
            React.createElement("button", { className: "secondary-btn", onClick: onExport },
                React.createElement(Download, { size: 16 }),
                " Share CSV")),
        React.createElement("div", { className: "tool-card" },
            React.createElement("button", { className: "pick-row", type: "button", onClick: () => hapticTest().then(msg => notify(msg)) },
                React.createElement("span", { className: "pick-ic" }, React.createElement(Zap, { size: 18 })),
                React.createElement("span", { className: "pick-tx" }, React.createElement("b", null, "Tes getar")),
                React.createElement(ChevronRight, { size: 18 }))),
        React.createElement("p", { className: "sync-note foot" }, "Edge Journal v" + APP_VERSION + " \u00B7 data tersimpan lokal di perangkat ini")));
}
