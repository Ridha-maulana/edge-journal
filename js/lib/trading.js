/* Simbol, ukuran kontrak, hitung P&L, risk, reward, pips, filter periode */
"use strict";
const CONTRACT_SIZES = { XAUUSD: 100, GOLD: 100, EURUSD: 100000, GBPUSD: 100000, USDJPY: 100000, GBPJPY: 100000, AUDUSD: 100000, USDCAD: 100000, USDCHF: 100000, NAS100: 1, BTCUSD: 1 };
const SYMBOLS = Object.keys(CONTRACT_SIZES);
function contractSize(symbol) { return CONTRACT_SIZES[symbol] || 100000; }
function pnlFor(trade, exit = trade.exit) { if (exit === null || exit === undefined || exit === '')
    return 0; const gross = (trade.side === 'Long' ? Number(exit) - Number(trade.entry) : Number(trade.entry) - Number(exit)) * Number(trade.lots) * contractSize(trade.symbol); return gross - (Number(trade.fees) || 0); }
function riskFor(entry, sl, lots, symbol) { return entry && sl && lots ? Math.abs(Number(entry) - Number(sl)) * Number(lots) * contractSize(symbol) : 0; }
function rewardFor(entry, tp, lots, symbol) { return entry && tp && lots ? Math.abs(Number(tp) - Number(entry)) * Number(lots) * contractSize(symbol) : 0; }
function withinPeriod(date, period, startDate, endDate) { const d = new Date(date); const now = new Date(); if (period === 'Custom date range') {
    if (startDate && dateOnly(date) < startDate)
        return false;
    if (endDate && dateOnly(date) > endDate)
        return false;
    return true;
} if (period === 'All time')
    return true; if (period === 'Year-to-date')
    return d.getFullYear() === now.getFullYear(); if (period === 'Monthly')
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); if (period === 'Weekly') {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return d >= start;
} return true; }
function pipSizeOf(sym) { const u = String(sym || '').toUpperCase(); if (u.includes('XAU') || u === 'GOLD')
    return .1; if (u.includes('XAG'))
    return .01; if (u.includes('JPY'))
    return .01; if (u.includes('BTC') || u.includes('ETH') || u.includes('NAS') || u.includes('US30') || u.includes('SPX'))
    return 1; return .0001; }
function pipsOf(t) { if (t.exit === null || t.exit === undefined || t.exit === '')
    return 0; const d = t.side === 'Long' ? Number(t.exit) - Number(t.entry) : Number(t.entry) - Number(t.exit); return d / pipSizeOf(t.symbol); }

/* Modal awal akun (dasar perhitungan %) — sama dengan kartu Performance */
function acctStartBal(account) { const h = (account && account.capitalHistory) || []; const dep = h.filter(x => x.type !== 'withdraw').reduce((a, x) => a + (Number(x.amount) || 0), 0), wd = h.filter(x => x.type === 'withdraw').reduce((a, x) => a + (Number(x.amount) || 0), 0); return Math.max(((account && account.balance) || 0) - dep + wd, 1); }
function tradePips(t) { return t && t.status === 'closed' ? pipsOf(t) : 0; }
function fmtPctS(v) { const x = Number(v) || 0; return (x > 0 ? '+' : x < 0 ? '-' : '') + Math.abs(x).toFixed(2) + '%'; }
function fmtPipsS(v) { const x = Number(v) || 0; return (x > 0 ? '+' : x < 0 ? '-' : '') + Math.abs(x).toFixed(1) + ' pips'; }

/* Saldo akun saat ini = modal (setelah deposit/WD) + total P&L trade closed; sama dengan 'Sekarang' di Performance */
function acctNowBal(account) { const tr = (account && account.trades) || []; return (Number(account && account.balance) || 0) + tr.reduce((a, t) => a + (t.status === 'closed' ? Number(t.pnl) || 0 : 0), 0); }
