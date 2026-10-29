/* Komponen utama App: state, menu bawah, popup */
"use strict";
function App() {
    const initial = useMemo(loadStore, []);
    const [tab, setTab] = useState('performance');
    const [accounts, setAccounts] = useState(normalizeAccounts(initial.accounts));
    const [activeAccountId, setActiveAccountId] = useState(initial.activeAccountId);
    const [period, setPeriod] = useState('All time');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [navHidden, setNavHidden] = useState(false);
    const [showAccount, setShowAccount] = useState(false);
    const [accountMode, setAccountMode] = useState('manage');
    const [showAdd, setShowAdd] = useState(false);
    const [closingTrade, setClosingTrade] = useState(null);
    const [editingTrade, setEditingTrade] = useState(null);
    const [prefill, setPrefill] = useState(null);
    const [scan, setScan] = useState(null);
    const [batch, setBatch] = useState(null);
    const [expanded, setExpanded] = useState(null);
    const [journalFilters, setJournalFilters] = useState({ search: '', status: 'all', side: 'all', date: '' });
    window.__applyRemoteState = text => {
        try {
            const d = JSON.parse(text);
            if (!d || !Array.isArray(d.accounts) || !d.accounts.length || d.accounts.some(a => !a || typeof a.id !== 'string' || !Array.isArray(a.trades)))
                return false;
            const next = normalizeAccounts(d.accounts);
            const active = next.some(a => a.id === d.activeAccountId) ? d.activeAccountId : next[0].id;
            localStorage.setItem('edge-journal-v3', JSON.stringify({ activeAccountId: active, accounts: next }));
            setAccounts(next); setActiveAccountId(active);
            return true;
        } catch (e) { return false; }
    };
    useEffect(() => { if (window.__hideSplash) window.__hideSplash(); }, []);
    useEffect(() => { setExpanded(null); }, [tab]);
    useEffect(() => { const lastY = new WeakMap(); let lastEl = null; const onScroll = e => { const t = e.target === document ? document.documentElement : e.target; if (!t || t.nodeType !== 1)
        return; if (t.closest && t.closest('.modal-backdrop,.dp-sheet,.tsel-sheet,[data-confirm]'))
        return; const y = t === document.documentElement ? (window.scrollY || t.scrollTop || 0) : t.scrollTop; const prev = lastY.get(t) || 0; lastY.set(t, y); if (y === prev)
        return; lastEl = t; if (y <= 70)
        setNavHidden(false);
    else if (y > prev + 6)
        setNavHidden(true); }; const onClick = () => setTimeout(() => { if (lastEl && !document.body.contains(lastEl)) { lastEl = null; setNavHidden(false); } }, 60); document.addEventListener('scroll', onScroll, { passive: true, capture: true }); document.addEventListener('click', onClick, true); return () => { document.removeEventListener('scroll', onScroll, true); document.removeEventListener('click', onClick, true); }; }, []);
    useEffect(() => { document.body.classList.toggle('popup-open', !!(showAdd || editingTrade || closingTrade || showAccount)); }, [showAdd, editingTrade, closingTrade, showAccount]);
    useEffect(() => { const f = () => { const n = document.querySelector('.bottom-nav'); if (n) document.documentElement.style.setProperty('--nav-h', n.offsetHeight + 'px'); }; f(); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
    const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];
    const trades = (activeAccount === null || activeAccount === void 0 ? void 0 : activeAccount.trades) || [];
    function persist(nextAccounts = accounts, nextActive = activeAccountId) { setAccounts(nextAccounts); setActiveAccountId(nextActive); saveStore(nextActive, nextAccounts); }
    function persistTrades(nextTrades) { persist(accounts.map(a => a.id === activeAccountId ? { ...a, trades: nextTrades } : a)); }
    function selectAccount(id) { persist(accounts, id); setJournalFilters({ search: '', status: 'all', side: 'all', date: '' }); }
    function addAccount(data) { const account = { ...data, id: uid('account'), balance: Number(data.balance) || 0, trades: [] }; persist([...accounts, account], account.id); setShowAccount(false); }
    function deleteAccount(id) { if (accounts.length <= 1) {
        notify('Minimal harus ada satu akun.');
        return;
    } const remaining = accounts.filter(a => a.id !== id); const nextActive = id === activeAccountId ? remaining[0].id : activeAccountId; persist(remaining, nextActive); }
    function recordCapital(data) { const amount = Number(data.amount) || 0; if (amount <= 0)
        return; const delta = data.type === 'withdraw' ? -amount : amount; const updated = accounts.map(a => a.id === activeAccountId ? { ...a, balance: Number(a.balance || 0) + delta, capitalHistory: [...(a.capitalHistory || []), { id: uid('capital'), type: data.type, amount, date: data.date, note: data.note || '' }] } : a); persist(updated); }
    function updateAccount(patch) { persist(accounts.map(a => a.id === activeAccountId ? { ...a, ...patch } : a)); }
    function closePopups() { setBatch(null); setShowAdd(false); setPrefill(null); setEditingTrade(null); setClosingTrade(null); setShowAccount(false); setAccountMode('manage'); document.querySelectorAll('[data-confirm]').forEach(n => n.dispatchEvent(new Event('confirm-cancel'))); }
    function goTab(t) { closePopups(); setNavHidden(false); if (t === 'performance' && tab === 'performance')
        window.dispatchEvent(new Event('perf-home')); setTab(t); window.scrollTo(0, 0); }
    function openAdd() { setEditingTrade(null); setClosingTrade(null); setPrefill(null); setShowAdd(true); }
    async function scanScreenshot(files) { files = [].concat(files || []).filter(Boolean); if (!files.length) return; setScan({ p: 0, t: 'Menyiapkan\u2026' }); try {
        const texts = await ocrImageFiles(files, (p, t) => setScan({ p, t }));
        // gabungkan semua gambar; posisi dengan tiket sama (screenshot tumpang tindih) hanya dihitung sekali
        const seen = new Set(), rows = [];
        for (const tx of texts) for (const r of parseMt5Text(tx).rows) { const key = r.ticket ? 't' + r.ticket : [r.side, r.lots, r.entry, r.exit, r.closeTime].join('|'); if (seen.has(key)) continue; seen.add(key); rows.push(r); }
        rows.sort((x, y) => String(y.closeTime).localeCompare(String(x.closeTime)));
        const pick = rows.find(r => r.detailed) || rows[0] || null;
        setScan(null);
        if (!pick) { notify('Data trade tidak terbaca. Coba screenshot yang lebih jelas (Riwayat MT5, ketuk posisinya agar detail terbuka) atau isi manual.'); return; }
        setEditingTrade(null); setClosingTrade(null);
        const full = rows.filter(r => r.detailed);
        if (full.length >= 2) { setBatch(rows); return; }
        setPrefill(buildPrefill(pick, mt5GetTz())); setShowAdd(true);
    }
    catch (e) { setScan(null); notify(e && e.message === 'ocr-load' ? 'Mesin pembaca teks gagal dimuat. Pastikan internet aktif lalu coba lagi.' : 'Screenshot gagal dibaca. Coba lagi atau isi manual.'); } }
    function addTrade(data) { const trade = { ...data, id: uid('trade'), entry: Number(data.entry), exit: data.exit ? Number(data.exit) : null, lots: Number(data.lots) || 0, sl: data.sl ? Number(data.sl) : null, tp: data.tp ? Number(data.tp) : null, fees: Number(data.fees) || 0, status: data.exit ? 'closed' : 'open', pnl: data.exit ? (data.mt5Net != null ? data.mt5Net : pnlFor(data, data.exit)) : 0, review: data.review || '', screenshots: data.screenshots || [] }; delete trade.mt5Net; persistTrades([trade, ...trades]); setShowAdd(false); setPrefill(null); setTab('journal'); }
    function addTrades(list) { const made = list.map(pf => { const t = { id: uid('trade'), symbol: pf.symbol, side: pf.side, date: pf.date, closeDate: pf.closeDate, entry: Number(pf.entry), exit: Number(pf.exit), lots: Number(pf.lots) || 0, sl: pf.sl == null ? null : Number(pf.sl), tp: pf.tp == null ? null : Number(pf.tp), fees: Number(pf.fees) || 0, status: 'closed', exitMethod: pf.exitMethod, setup: '', review: '', screenshots: [], mt5Ticket: pf.ticket, source: 'screenshot' }; t.pnl = pf.net != null ? pf.net : pnlFor(t, t.exit); return t; }); if (!made.length) return; persistTrades([...made, ...trades]); setBatch(null); setTab('journal'); notify(made.length + ' trade dicatat dari screenshot.'); }
    function closeTrade(data) { const trade = trades.find(t => t.id === data.tradeId); if (!trade)
        return; const updated = { ...trade, exit: Number(data.exit), closeDate: data.closeDate, fees: Number(data.fees) || 0, exitMethod: data.exitMethod, status: 'closed', pnl: pnlFor({ ...trade, fees: Number(data.fees) || 0 }, Number(data.exit)), review: data.review || '' }; persistTrades(trades.map(t => t.id === trade.id ? updated : t)); setClosingTrade(null); setExpanded(trade.id); }
    function updateTrade(data) { const old = trades.find(t => t.id === data.id); if (!old)
        return; const closed = !!data.exit; const fees = Number(data.fees) || 0; const trade = { ...old, ...data, entry: Number(data.entry), exit: closed ? Number(data.exit) : null, lots: Number(data.lots) || 0, sl: data.sl ? Number(data.sl) : null, tp: data.tp ? Number(data.tp) : null, fees, status: closed ? 'closed' : 'open', pnl: closed ? pnlFor({ ...data, fees }, data.exit) : 0, closeDate: closed ? (old.closeDate || data.date) : undefined }; persistTrades(trades.map(t => t.id === data.id ? trade : t)); setEditingTrade(null); notify('Trade diperbarui.'); }
    function deleteTrade(id) { const t = trades.find(x => x.id === id); askConfirm(`Apakah Anda yakin ingin menghapus trade ${t ? `${t.symbol} ${t.side} (${fmtLong(dateOnly(t.date))})` : 'ini'}? Data trade ini tidak bisa dikembalikan.`).then(ok => { if (!ok)
        return; persistTrades(trades.filter(x => x.id !== id)); setExpanded(null); notify('Trade dihapus.'); }); }
    function exportCsv() { const header = 'Tanggal Entry,Tanggal Close,Symbol,Arah,Status,Entry,Exit,Lots,SL,TP,Exit Method,PnL,Fees,Setup,Review\n'; const body = trades.map(t => { var _a, _b, _c; return [t.date, t.closeDate || '', t.symbol, t.side, t.status, t.entry, (_a = t.exit) !== null && _a !== void 0 ? _a : '', t.lots, (_b = t.sl) !== null && _b !== void 0 ? _b : '', (_c = t.tp) !== null && _c !== void 0 ? _c : '', t.exitMethod || '', t.pnl, t.fees || 0, `"${String(t.setup || '').replaceAll('"', '""')}"`, `"${String(t.review || '').replaceAll('"', '""')}"`].join(','); }).join('\n'); saveFile(`edge-journal-${activeAccount.name.toLowerCase().replaceAll(' ', '-')}.csv`, header + body, 'text/csv'); }
    function backupJson() { const stamp = isoNow().slice(0, 10); saveFile(`edge-journal-backup-${stamp}.json`, JSON.stringify({ version: 3, appVersion: APP_VERSION, exportedAt: new Date().toISOString(), activeAccountId, accounts }, null, 2), 'application/json'); }
    function restoreJson(file) { if (!file)
        return; const reader = new FileReader(); reader.onload = () => { try {
        const restored = validateBackup(JSON.parse(reader.result));
        if (restored) {
            persist(restored.accounts, restored.activeAccountId);
            notify('Backup berhasil dipulihkan.');
        }
        else
            notify('File backup tidak dikenali atau formatnya tidak lengkap.');
    }
    catch {
        notify('File backup tidak valid.');
    } }; reader.readAsText(file); }
    function chooseCalendarDate(date) { setJournalFilters({ ...journalFilters, date }); setTab('journal'); setShowCalendar(false); }
    return React.createElement("div", { className: "app-shell" },
        React.createElement("header", { className: "topbar" },
            React.createElement("div", { className: "brand" },
                React.createElement("div", { className: "brand-mark" },
                    React.createElement(Zap, { size: 18 })),
                React.createElement("div", null,
                    React.createElement("strong", null, "EDGE JOURNAL"),
                    React.createElement("span", null, "TRADING LOGBOOK"))),
            React.createElement("div", { className: "top-actions" },
                React.createElement("button", { className: "header-icon", onClick: () => setShowCalendar(true), "aria-label": "Buka kalender" },
                    React.createElement(CalendarDays, { size: 17 })),
                React.createElement("button", { className: "account-switcher", onClick: () => { setAccountMode('manage'); setShowAccount(true); }, "aria-label": "Account management" },
                    React.createElement(UserRound, { size: 15 }),
                    React.createElement("span", { className: "acc-name" }, activeAccount.name),
                    React.createElement(ChevronDown, { size: 13 })))),
        React.createElement("div", { className: "desktop-layout" },
            React.createElement("aside", { className: "side-nav" },
                React.createElement("div", { className: "side-nav-title" }, "WORKSPACE"),
                React.createElement(NavItem, { active: tab === 'performance' && !showAdd, onClick: () => goTab('performance'), icon: React.createElement(BarChart3, null), label: "Performance" }),
                React.createElement(NavItem, { active: tab === 'journal' && !showAdd, onClick: () => goTab('journal'), icon: React.createElement(BookOpen, null), label: "My Journal" }),
                React.createElement(NavItem, { active: tab === 'tools' && !showAdd, onClick: () => goTab('tools'), icon: React.createElement(SlidersHorizontal, null), label: "Tools" }),
                React.createElement(NavItem, { active: tab === 'account' && !showAdd, onClick: () => goTab('account'), icon: React.createElement(UserRound, null), label: "Profil" }),
                React.createElement("div", { className: "side-nav-foot" },
                    React.createElement("span", null, "ACTIVE ACCOUNT"),
                    React.createElement("strong", null, activeAccount.name),
                    React.createElement("small", null, money(activeAccount.balance, activeAccount.currency)))),
            React.createElement("main", { className: "main-content" },
                tab === 'performance' && React.createElement(Performance, { onSelectDate: chooseCalendarDate, onWallet: () => { setAccountMode('capital'); setShowAccount(true); }, account: activeAccount, trades: trades, period: period, setPeriod: setPeriod, customStart: customStart, customEnd: customEnd, setCustomStart: setCustomStart, setCustomEnd: setCustomEnd }),
                tab === 'journal' && React.createElement(Journal, { account: activeAccount, trades: trades, filters: journalFilters, setFilters: setJournalFilters, expanded: expanded, setExpanded: setExpanded, onAdd: openAdd, onScan: scanScreenshot, onDelete: deleteTrade, onClose: setClosingTrade, onEdit: setEditingTrade }),
                tab === 'account' && React.createElement(AccountPage, { accounts: accounts, activeAccount: activeAccount, onSelect: selectAccount, onCreate: addAccount, onDelete: deleteAccount, onUpdate: updateAccount, onCapital: recordCapital, onExport: exportCsv, onBackup: backupJson, onRestore: restoreJson }),
                tab === 'tools' && React.createElement(Tools, { account: activeAccount, trades: trades, onAdd: openAdd, onExport: exportCsv, onBackup: backupJson, onRestore: restoreJson, onNewAccount: () => setShowAccount(true) }))),
        React.createElement("nav", { className: navHidden ? "bottom-nav nav-hidden" : "bottom-nav" },
            React.createElement(NavItem, { active: tab === 'performance' && !showAdd, onClick: () => goTab('performance'), icon: React.createElement(BarChart3, null), label: "Performance" }),
            React.createElement(NavItem, { active: tab === 'journal' && !showAdd, onClick: () => goTab('journal'), icon: React.createElement(BookOpen, null), label: "My Journal" }),
            React.createElement("button", { type: "button", className: showAdd ? "nav-item nav-add active" : "nav-item nav-add", "aria-label": "Tambah posisi", onClick: openAdd }, React.createElement(CandlePlus, null), React.createElement("span", null, "Add trade")),
            React.createElement(NavItem, { active: tab === 'tools' && !showAdd, onClick: () => goTab('tools'), icon: React.createElement(SlidersHorizontal, null), label: "Tools" }),
            React.createElement(NavItem, { active: tab === 'account' && !showAdd, onClick: () => goTab('account'), icon: React.createElement(UserRound, null), label: "Profil" })),
        showAdd && React.createElement(AddTradeModal, { account: activeAccount, prefill: prefill, onClose: () => { setShowAdd(false); setPrefill(null); }, onSave: addTrade }),
        batch && React.createElement(ImportListModal, { account: activeAccount, rows: batch, onClose: () => setBatch(null), onSave: addTrades }),
        scan && React.createElement(ScanOverlay, { progress: scan.p, text: scan.t }),
        editingTrade && React.createElement(AddTradeModal, { initial: editingTrade, account: activeAccount, onClose: () => setEditingTrade(null), onSave: updateTrade }),
        closingTrade && React.createElement(CloseTradeModal, { trade: closingTrade, onClose: () => setClosingTrade(null), onSave: closeTrade }),
        showAccount && React.createElement(AccountModal, { initialMode: accountMode, accounts: accounts, activeAccount: activeAccount, onClose: () => { setShowAccount(false); setAccountMode('manage'); }, onSelect: selectAccount, onCreate: addAccount, onDelete: deleteAccount, onUpdate: updateAccount, onCapital: recordCapital, onBackup: backupJson, onRestore: restoreJson, onExport: exportCsv }),
        showCalendar && React.createElement(CalendarModal, { trades: trades, onClose: () => setShowCalendar(false), onSelectDate: chooseCalendarDate }));
}
