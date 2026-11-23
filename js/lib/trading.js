/* Simbol, ukuran kontrak, hitung P&L, risk, reward, pips, filter periode */
"use strict";
const CONTRACT_SIZES = { XAUUSD: 100, GOLD: 100, EURUSD: 100000, GBPUSD: 100000, USDJPY: 100000, GBPJPY: 100000, AUDUSD: 100000, USDCAD: 100000, USDCHF: 100000, NAS100: 1, BTCUSD: 1 };
const SYMBOLS = Object.keys(CONTRACT_SIZES);
/* ukuran kontrak: simbol bawaan dari tabel; simbol lain ditebak dari namanya (emas, perak, minyak, indeks, kripto), selain itu dianggap pair forex */
function contractSize(symbol) { if (CONTRACT_SIZES[symbol]) return CONTRACT_SIZES[symbol]; const u = String(symbol || '').toUpperCase(); if (/^(XAU|GOLD)/.test(u)) return 100; if (/^(XAG|SILVER)/.test(u)) return 5000; if (/(OIL|WTI|BRENT|XTI|XBR)/.test(u)) return 1000; if (/^(US30|US500|US100|NAS|SPX|DJ|DAX|GER|DE40|DE30|UK100|FTSE|JP225|NIKKEI|HK50|FRA40|AUS200|STOXX|USTEC|BTC|ETH|LTC|XRP|SOL|DOGE|ADA)/.test(u)) return 1; return 100000; }
/* simbol trade boleh simbol apa saja (bukan hanya daftar bawaan) */
function isTradeSymbol(s) { return typeof s === 'string' && /^[A-Za-z0-9._#$+\-]{2,24}$/.test(s); }
/* daftar pilihan simbol: bawaan + simbol lain yang pernah dicatat di semua akun + simbol yang sedang dipilih */
function symbolOptions(current) { const out = SYMBOLS.slice(), seen = new Set(out); const add = s => { if (isTradeSymbol(s) && !seen.has(s)) { seen.add(s); out.push(s); } }; try { const raw = JSON.parse(localStorage.getItem('edge-journal-v3') || '{}'); ((raw && raw.accounts) || []).forEach(a => ((a && a.trades) || []).forEach(t => add(t && t.symbol))); } catch (e) { } add(current); return out; }
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
/* ===== Hitungan % baku (time-weighted): P&L posisi ÷ equity SAAT POSISI DIBUKA ===== */
/* equity = modal pada waktu itu (deposit - WD yang sudah lewat) + P&L semua posisi yang sudah tertutup sebelum posisi dibuka */
const _eqKey = v => { const s = String(v || ''); return s.length <= 10 ? s + 'T00:00:00' : s.length === 16 ? s + ':00' : s.slice(0, 19); };
function acctEquityAt(account, date, excludeId) {
    const k = _eqKey(date), cap = acctCapAt(account, date);
    const real = ((account && account.trades) || []).reduce((a, t) => a + (t.status === 'closed' && t.id !== excludeId && _eqKey(t.closeDate || t.date) <= k ? Number(t.pnl) || 0 : 0), 0);
    const eq = cap + real;
    return eq >= 1 ? eq : Math.max(cap, 1);
}
const _EQC = new WeakMap();
function acctBases(account) { /* id posisi -> equity saat dibuka (dihitung sekali, di-cache) */
    const tr = (account && account.trades) || [], c = _EQC.get(tr);
    if (c && c.h === account.capitalHistory && c.b === account.balance && c.n === tr.length) return c.m;
    const cls = tr.filter(t => t.status === 'closed'), byOpen = cls.slice().sort((x, y) => _eqKey(x.date) < _eqKey(y.date) ? -1 : _eqKey(x.date) > _eqKey(y.date) ? 1 : 0);
    const byClose = cls.map(t => ({ k: _eqKey(t.closeDate || t.date), p: Number(t.pnl) || 0 })).sort((x, y) => x.k < y.k ? -1 : x.k > y.k ? 1 : 0);
    const m = {}; let i = 0, run = 0;
    byOpen.forEach(t => { const k = _eqKey(t.date); while (i < byClose.length && byClose[i].k <= k) { run += byClose[i].p; i++; }
        const self = _eqKey(t.closeDate || t.date) <= k ? Number(t.pnl) || 0 : 0, cap = acctCapAt(account, t.date), eq = cap + run - self;
        m[t.id] = eq >= 1 ? eq : Math.max(cap, 1); });
    _EQC.set(tr, { h: account.capitalHistory, b: account.balance, n: tr.length, m });
    return m;
}
/* % satu posisi = P&L / equity saat dibuka */
function tradePct(account, t) { const b = t && acctBases(account)[t.id]; return (Number(t && t.pnl) || 0) / (b || acctEquityAt(account, t && t.date, t && t.id)) * 100; }
/* gabung dua persen secara berantai: (1+a)(1+b)-1 */
function chainAdd(a, b) { return ((1 + (Number(a) || 0) / 100) * (1 + (Number(b) || 0) / 100) - 1) * 100; }
function pctChain(account, list) { return (list || []).reduce((a, t) => t.status === 'closed' ? chainAdd(a, tradePct(account, t)) : a, 0); }
/* drawdown maksimum (%) dari kurva pertumbuhan berantai: tidak terpengaruh deposit/WD */
function ddChain(account, list) { let idx = 100, peak = 100, dd = 0; (list || []).filter(t => t.status === 'closed').slice().sort((a, b) => _eqKey(a.closeDate || a.date) < _eqKey(b.closeDate || b.date) ? -1 : 1).forEach(t => { idx *= 1 + tradePct(account, t) / 100; peak = Math.max(peak, idx); dd = Math.max(dd, (peak - idx) / peak * 100); }); return dd; }
function withPct(account, list) { return (list || []).map(t => t.status === 'closed' ? { ...t, pct: tradePct(account, t) } : t); }
function tradePips(t) { return t && t.status === 'closed' ? pipsOf(t) : 0; }
function fmtPctS(v) { const x = Number(v) || 0; return (x > 0 ? '+' : x < 0 ? '-' : '') + Math.abs(x).toFixed(2) + '%'; }
function fmtPipsS(v) { const x = Number(v) || 0; return (x > 0 ? '+' : x < 0 ? '-' : '') + Math.abs(x).toFixed(1) + ' pips'; }

/* Saldo akun saat ini = modal (setelah deposit/WD) + total P&L trade closed; sama dengan 'Sekarang' di Performance */
function acctNowBal(account) { const tr = (account && account.trades) || []; return (Number(account && account.balance) || 0) + tr.reduce((a, t) => a + (t.status === 'closed' ? Number(t.pnl) || 0 : 0), 0); }
