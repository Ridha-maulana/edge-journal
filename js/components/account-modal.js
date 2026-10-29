/* Account management (dipakai di popup dan di halaman Profil) */
"use strict";
function AccountModal({ inline = false, initialMode = 'manage', accounts, activeAccount, onClose, onSelect, onCreate, onDelete, onUpdate, onCapital, onBackup, onRestore, onExport }) {
    const [mode, setMode] = useState(initialMode);
    const [editing, setEditing] = useState(false);
    const [nameDraft, setNameDraft] = useState('');
    const [form, setForm] = useState({ name: '', firstDeposit: new Date().toISOString().slice(0, 10), currency: 'USD', balance: '' });
    const [capital, setCapital] = useState({ type: 'deposit', amount: '', date: new Date().toISOString().slice(0, 10), note: '' });
    const set = (k, v) => setForm({ ...form, [k]: v });
    const setCapitalField = (k, v) => setCapital({ ...capital, [k]: v });
    function submit(e) { e.preventDefault(); if (form.name.trim())
        onCreate(form); }
    function submitCapital(e) { e.preventDefault(); if (Number(capital.amount) > 0) {
        onCapital(capital);
        setCapital({ ...capital, amount: '', note: '' });
    } }
    function saveName() { const n = nameDraft.trim(); if (!n) {
        notify('Nama akun tidak boleh kosong.');
        return;
    } if (n === activeAccount.name) {
        setEditing(false);
        return;
    } if (accounts.some(a => a.id !== activeAccount.id && a.name.toLowerCase() === n.toLowerCase())) {
        notify('Nama akun sudah dipakai akun lain.');
        return;
    } askConfirm(`Apakah Anda yakin ingin mengubah nama akun "${activeAccount.name}" menjadi "${n}"?`, 'Ya, ubah', false).then(ok => { if (ok) {
        onUpdate({ name: n });
        setEditing(false);
        notify('Nama akun diperbarui.');
    } }); }
    const rootProps = inline ? { className: "tool-card acct-inline" } : { className: "modal-backdrop center", onClick: e => { if (e.target === e.currentTarget)
            onClose(); } };
    const innerProps = inline ? { className: "acct-inline-body" } : { className: "modal wide-modal" };
    return React.createElement("div", rootProps,
        React.createElement("div", innerProps,
            React.createElement("div", { className: "modal-head" },
                React.createElement("div", null,
                    React.createElement("p", { className: "eyebrow" }, "ACCOUNT / SETTINGS"),
                    React.createElement("h2", null, "Account management")),
                !inline && React.createElement("button", { className: "icon-btn", onClick: onClose },
                    React.createElement(X, { size: 19 }))),
            React.createElement("div", { className: "account-tabs" },
                React.createElement("button", { className: mode === 'manage' ? 'active' : '', onClick: () => setMode('manage') }, "Accounts"),
                React.createElement("button", { className: mode === 'capital' ? 'active' : '', onClick: () => setMode('capital') }, "Deposit / WD"),
                React.createElement("button", { className: mode === 'new' ? 'active' : '', onClick: () => setMode('new') }, "Add account"),
                React.createElement("button", { className: mode === 'backup' ? 'active' : '', onClick: () => setMode('backup') }, "Backup")),
            mode === 'manage' && React.createElement(React.Fragment, null,
                React.createElement("div", { className: "account-summary" },
                    React.createElement("div", { className: "as-head" },
                        React.createElement("span", null, "ACTIVE ACCOUNT"),
                        !editing && React.createElement("button", { type: "button", className: "as-edit", onClick: () => { setNameDraft(activeAccount.name); setEditing(true); } }, "\u270E Edit")),
                    editing ? React.createElement("div", { className: "as-edit-row" },
                        React.createElement("input", { value: nameDraft, maxLength: 24, autoFocus: true, placeholder: "Nama akun", onChange: e => setNameDraft(e.target.value) }),
                        React.createElement("div", { className: "as-actions" },
                            React.createElement("button", { type: "button", onClick: () => setEditing(false) }, "Batal"),
                            React.createElement("button", { type: "button", className: "ok", onClick: saveName }, "Simpan"))) : React.createElement("strong", null, activeAccount.name),
                    React.createElement("small", null,
                        "Saldo saat ini ",
                        money(activeAccount.balance, activeAccount.currency),
                        " \u00B7 First deposit ",
                        activeAccount.firstDeposit || '—')),
                React.createElement("div", { className: "account-list" }, accounts.map(a => React.createElement("div", { key: a.id, className: a.id === activeAccount.id ? 'account-list-item selected' : 'account-list-item', onClick: () => onSelect(a.id), role: "button", tabIndex: 0, onKeyDown: e => e.key === 'Enter' && onSelect(a.id) },
                    React.createElement("div", { className: "account-avatar" }, a.name.slice(0, 1).toUpperCase()),
                    React.createElement("div", null,
                        React.createElement("strong", null, a.name),
                        React.createElement("small", null,
                            a.currency,
                            " \u00B7 ",
                            money(a.balance, a.currency),
                            " \u00B7 ",
                            a.trades.length,
                            " trades")),
                    React.createElement("button", { className: "account-delete", "aria-label": `Hapus ${a.name}`, onClick: e => { e.stopPropagation(); askConfirm(`Apakah Anda yakin ingin menghapus akun ${a.name}? Seluruh data trade di akun ini (${a.trades.length} trade) akan ikut terhapus dan tidak bisa dikembalikan.`).then(ok => { if (ok)
                            onDelete(a.id); }); } },
                        React.createElement(Trash2, { size: 15 })),
                    React.createElement(ChevronRight, { size: 16 }))))),
            mode === 'capital' && React.createElement(React.Fragment, null,
                React.createElement("div", { className: "capital-balance" },
                    React.createElement("span", null,
                        "Saldo akun ",
                        activeAccount.name),
                    React.createElement("strong", null, money(activeAccount.balance, activeAccount.currency))),
                React.createElement("form", { onSubmit: submitCapital },
                    React.createElement("div", { className: "capital-toggle" },
                        React.createElement("button", { type: "button", className: capital.type === 'deposit' ? 'active deposit' : '', onClick: () => setCapitalField('type', 'deposit') }, "Deposit modal"),
                        React.createElement("button", { type: "button", className: capital.type === 'withdraw' ? 'active withdraw' : '', onClick: () => setCapitalField('type', 'withdraw') }, "Withdraw / WD")),
                    React.createElement("div", { className: "form-grid" },
                        React.createElement("label", null,
                            "Jumlah",
                            React.createElement("input", { type: "number", min: "0.01", step: "0.01", value: capital.amount, onChange: e => setCapitalField('amount', e.target.value), placeholder: "1000", required: true })),
                        React.createElement("label", null,
                            "Tanggal",
                            React.createElement(DateField, { value: capital.date, onChange: v => setCapitalField('date', v), required: true }))),
                    React.createElement("label", null,
                        "Catatan (opsional)",
                        React.createElement("input", { value: capital.note, onChange: e => setCapitalField('note', v), placeholder: "Contoh: tambah modal / tarik profit" })),
                    React.createElement("button", { className: "primary-btn", type: "submit" },
                        capital.type === 'deposit' ? React.createElement(Plus, { size: 16 }) : React.createElement(ArrowDownRight, { size: 16 }),
                        " Simpan ",
                        capital.type === 'deposit' ? 'deposit' : 'WD')),
                React.createElement("div", { className: "capital-history" },
                    (activeAccount.capitalHistory || []).slice().reverse().map(item => React.createElement("div", { className: "capital-row", key: item.id },
                        React.createElement("span", { className: item.type === 'deposit' ? 'capital-kind deposit' : 'capital-kind withdraw' }, item.type === 'deposit' ? 'DEP' : 'WD'),
                        React.createElement("div", null,
                            React.createElement("strong", null, item.note || (item.type === 'deposit' ? 'Deposit modal' : 'Withdraw')),
                            React.createElement("small", null, item.date)),
                        React.createElement("b", { className: item.type === 'deposit' ? 'positive' : 'negative' },
                            item.type === 'deposit' ? '+' : '-',
                            money(item.amount, activeAccount.currency)))),
                    !(activeAccount.capitalHistory || []).length && React.createElement("p", { className: "empty-copy" }, "Belum ada riwayat Deposit/WD."))),
            mode === 'new' && React.createElement("form", { onSubmit: submit },
                React.createElement("label", null,
                    "Account name",
                    React.createElement("input", { autoFocus: true, value: form.name, onChange: e => set('name', e.target.value), placeholder: "Live Gold 01", required: true })),
                React.createElement("div", { className: "form-grid three" },
                    React.createElement("label", null,
                        "First deposit",
                        React.createElement(DateField, { value: form.firstDeposit, onChange: v => set('firstDeposit', v) })),
                    React.createElement("label", null,
                        "Currency",
                        React.createElement(TSelect, { title: "Mata uang", value: form.currency, options: ['USD', 'EUR', 'IDR', 'GBP'], onChange: v => set('currency', v) })),
                    React.createElement("label", null,
                        "Opening balance",
                        React.createElement("input", { type: "number", value: form.balance, onChange: e => set('balance', e.target.value), placeholder: "10000" }))),
                React.createElement("button", { className: "primary-btn", type: "submit" },
                    React.createElement(Plus, { size: 16 }),
                    " Create account")),
            mode === 'backup' && React.createElement("div", { className: "backup-panel" },
                React.createElement("div", { className: "backup-row" },
                    React.createElement("div", { className: "tool-icon purple" },
                        React.createElement(Cloud, null)),
                    React.createElement("div", null,
                        React.createElement("strong", null, "Create Cloud Backup"),
                        React.createElement("p", null, "Unduh seluruh akun dan trade dalam satu file JSON yang bisa dipulihkan.")),
                    React.createElement("button", { className: "secondary-btn", onClick: onBackup },
                        React.createElement(Download, { size: 14 }),
                        " Backup")),
                React.createElement("div", { className: "backup-row" },
                    React.createElement("div", { className: "tool-icon green" },
                        React.createElement(Upload, null)),
                    React.createElement("div", null,
                        React.createElement("strong", null, "Restore Last Backup"),
                        React.createElement("p", null, "Masukkan file JSON backup yang pernah disimpan.")),
                    React.createElement("label", { className: "secondary-btn" },
                        React.createElement(Upload, { size: 14 }),
                        " Restore",
                        React.createElement("input", { type: "file", accept: "application/json", hidden: true, onChange: e => { var _a; return onRestore((_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]); } }))),
                React.createElement("div", { className: "backup-row" },
                    React.createElement("div", { className: "tool-icon orange" },
                        React.createElement(Share2, null)),
                    React.createElement("div", null,
                        React.createElement("strong", null, "Share CSV"),
                        React.createElement("p", null, "Ekspor trade akun aktif untuk spreadsheet.")),
                    React.createElement("button", { className: "secondary-btn", onClick: onExport },
                        React.createElement(Download, { size: 14 }),
                        " CSV")),
                React.createElement("p", { className: "helper-note" },
                    React.createElement(CircleHelp, { size: 13 }),
                    " Backup file ini bekerja lokal tanpa server; formatnya siap dipindahkan ke perangkat lain."))));
}
