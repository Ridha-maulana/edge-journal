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
/* Modal sekarang (setelah deposit/WD, tanpa P&L) — dasar semua hitungan % profit/loss */
function acctCapBal(account) { return Math.max(Number(account && account.balance) || 0, 1); }
/* Modal akun pada waktu tertentu: modal awal + deposit - WD yang waktunya sudah tercapai (sampai detik; catatan lama tanpa jam dianggap mulai 00:00). Posisi lama tidak berubah saat ada WD/deposit baru. */
function acctCapAt(account, date) {
    const h = (account && account.capitalHistory) || [], key = v => { const s = String(v || ''); return s.length <= 10 ? s + 'T00:00:00' : s.length === 16 ? s + ':00' : s.slice(0, 19); }, tk = key(date);
    let dep = 0, wd = 0, depTo = 0, wdTo = 0;
    h.forEach(x => { const a = Number(x.amount) || 0, w = x.type === 'withdraw', on = !x.date || key(x.date) <= tk; if (w) { wd += a; if (on) wdTo += a; } else { dep += a; if (on) depTo += a; } });
    const cap = (Number(account && account.balance) || 0) - dep + wd + depTo - wdTo;
    return cap >= 1 ? cap : acctCapBal(account);
}
/* % satu posisi = P&L / modal pada tanggal posisi itu */
function tradePct(account, t) { return (Number(t && t.pnl) || 0) / acctCapAt(account, t && t.date) * 100; }
function pctSum(account, list) { return (list || []).reduce((a, t) => a + (t.status === 'closed' ? tradePct(account, t) : 0), 0); }
function withPct(account, list) { return (list || []).map(t => t.status === 'closed' ? { ...t, pct: tradePct(account, t) } : t); }
function tradePips(t) { return t && t.status === 'closed' ? pipsOf(t) : 0; }
function fmtPctS(v) { const x = Number(v) || 0; return (x > 0 ? '+' : x < 0 ? '-' : '') + Math.abs(x).toFixed(2) + '%'; }
function fmtPipsS(v) { const x = Number(v) || 0; return (x > 0 ? '+' : x < 0 ? '-' : '') + Math.abs(x).toFixed(1) + ' pips'; }

/* Saldo akun saat ini = modal (setelah deposit/WD) + total P&L trade closed; sama dengan 'Sekarang' di Performance */
function acctNowBal(account) { const tr = (account && account.trades) || []; return (Number(account && account.balance) || 0) + tr.reduce((a, t) => a + (t.status === 'closed' ? Number(t.pnl) || 0 : 0), 0); }
