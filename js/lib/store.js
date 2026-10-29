/* Penyimpanan lokal (localStorage): data awal, load, save, normalisasi, validasi backup */
"use strict";
const seedTrades = [
    { id: 't1', symbol: 'XAUUSD', side: 'Long', date: '2026-10-20T09:20', entry: 2728.4, exit: 2735.8, lots: 0.02, sl: 2720, tp: 2745, pnl: 148, fees: 0, status: 'closed', exitMethod: 'TP', setup: 'Breakout sesi London', review: 'Eksekusi sesuai rencana.', screenshots: [] },
    { id: 't2', symbol: 'EURUSD', side: 'Short', date: '2026-10-18T14:10', entry: 1.1764, exit: 1.1749, lots: 0.1, sl: 1.1780, tp: 1.1730, pnl: 115, fees: 0, status: 'closed', exitMethod: 'TP', setup: 'Rejection resistance H4', review: 'Sabar menunggu konfirmasi.', screenshots: [] },
    { id: 't3', symbol: 'XAUUSD', side: 'Short', date: '2026-10-15T10:00', entry: 2716.9, exit: 2720.2, lots: 0.01, sl: 2722, tp: 2710, pnl: -66, fees: 0, status: 'closed', exitMethod: 'SL', setup: 'Counter trend', review: 'Stop terlalu dekat.', screenshots: [] },
    { id: 't4', symbol: 'GBPJPY', side: 'Long', date: '2026-10-12T08:40', entry: 201.2, exit: 202.05, lots: 0.03, sl: 200.7, tp: 202.4, pnl: 176, fees: 0, status: 'closed', exitMethod: 'Manual', setup: 'Continuation setup', review: 'Good trade.', screenshots: [] },
    { id: 't5', symbol: 'XAUUSD', side: 'Long', date: '2026-10-21T07:45', entry: 2732.1, exit: null, lots: 0.02, sl: 2724, tp: 2745, pnl: 0, fees: 0, status: 'open', exitMethod: '', setup: 'Retest support M15', review: '', screenshots: [] }
];
const seedAccounts = [
    { id: 'gold-50', name: 'Gold 50', firstDeposit: '2026-09-01', currency: 'USD', balance: 6049.5, trades: seedTrades },
    { id: 'demo-account', name: 'Demo Account', firstDeposit: '2026-01-01', currency: 'USD', balance: 10000, trades: [] }
];
function loadStore() {
    var _a, _b;
    try {
        const saved = JSON.parse(localStorage.getItem('edge-journal-v3'));
        if ((_a = saved === null || saved === void 0 ? void 0 : saved.accounts) === null || _a === void 0 ? void 0 : _a.length)
            return saved;
        const old = JSON.parse(localStorage.getItem('edge-journal-v2') || localStorage.getItem('edge-trades'));
        if ((_b = old === null || old === void 0 ? void 0 : old.accounts) === null || _b === void 0 ? void 0 : _b.length)
            return { activeAccountId: old.activeAccountId || old.accounts[0].id, accounts: old.accounts };
        if (Array.isArray(old))
            return { activeAccountId: 'gold-50', accounts: [{ ...seedAccounts[0], trades: old }, seedAccounts[1]] };
    }
    catch { }
    return { activeAccountId: 'gold-50', accounts: seedAccounts };
}
function markLocalChanged() {
    try { const m = JSON.parse(localStorage.getItem('edge-sync-meta') || '{}'); m.dirty = true; m.localRev = (m.localRev || 0) + 1; localStorage.setItem('edge-sync-meta', JSON.stringify(m)); } catch (e) { }
    try { if (window.cloudSync && window.cloudSync.localChanged) window.cloudSync.localChanged(); } catch (e) { }
}
function saveStore(activeAccountId, accounts) { localStorage.setItem('edge-journal-v3', JSON.stringify({ activeAccountId, accounts })); markLocalChanged(); }
function normalizeAccounts(accounts) { return (accounts || []).map(a => ({ ...a, capitalHistory: Array.isArray(a.capitalHistory) ? a.capitalHistory : [] })); }
function validateBackup(data) {
    if (!data || typeof data !== 'object' || !Array.isArray(data.accounts) || !data.accounts.length)
        return null;
    const ids = new Set();
    const accounts = data.accounts.map(account => {
        if (!account || typeof account !== 'object' || typeof account.id !== 'string' || !account.id.trim() || typeof account.name !== 'string' || !account.name.trim() || !['USD', 'EUR', 'IDR', 'GBP'].includes(account.currency) || !Number.isFinite(Number(account.balance)) || !Array.isArray(account.trades) || ids.has(account.id))
            return null;
        ids.add(account.id);
        const trades = account.trades.map(trade => {
            const optionalNumber = value => value === '' || value === null || value === undefined || Number.isFinite(Number(value));
            if (!trade || typeof trade !== 'object' || typeof trade.id !== 'string' || !trade.id.trim() || !SYMBOLS.includes(trade.symbol) || !['Long', 'Short'].includes(trade.side) || !['open', 'closed'].includes(trade.status) || !Number.isFinite(Number(trade.entry)) || Number(trade.lots) <= 0 || !optionalNumber(trade.exit) || !optionalNumber(trade.sl) || !optionalNumber(trade.tp) || !optionalNumber(trade.fees) || !optionalNumber(trade.pnl) || (trade.screenshots !== undefined && !Array.isArray(trade.screenshots)))
                return null;
            return { ...trade, entry: Number(trade.entry), exit: trade.exit === '' || trade.exit === null || trade.exit === undefined ? null : Number(trade.exit), lots: Number(trade.lots), sl: trade.sl === '' || trade.sl === null || trade.sl === undefined ? null : Number(trade.sl), tp: trade.tp === '' || trade.tp === null || trade.tp === undefined ? null : Number(trade.tp), fees: Number(trade.fees) || 0, pnl: Number(trade.pnl) || 0, screenshots: Array.isArray(trade.screenshots) ? trade.screenshots.filter(x => typeof x === 'string') : [] };
        });
        if (trades.some(trade => !trade))
            return null;
        return { ...account, balance: Number(account.balance), trades, capitalHistory: Array.isArray(account.capitalHistory) ? account.capitalHistory : [] };
    });
    if (accounts.some(account => !account))
        return null;
    const activeAccountId = accounts.some(account => account.id === data.activeAccountId) ? data.activeAccountId : accounts[0].id;
    return { activeAccountId, accounts };
}
