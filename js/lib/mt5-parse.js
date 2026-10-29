/* Membaca teks hasil OCR dari screenshot Riwayat MT5 (tab Posisi) dan mengubah jam server MT5 ke WIB */
"use strict";
const MT5_TZ_OPTIONS = [
    { v: 'auto-us', l: 'GMT+2 / GMT+3 otomatis (umum: XM, MRG)' },
    { v: 'gmt2', l: 'GMT+2 tetap' },
    { v: 'gmt3', l: 'GMT+3 tetap' },
    { v: 'gmt0', l: 'GMT+0' },
    { v: 'wib', l: 'Sudah WIB (tanpa konversi)' }
];
function mt5GetTz() { try {
    const v = localStorage.getItem('edge-mt5-tz');
    if (MT5_TZ_OPTIONS.some(o => o.v === v))
        return v;
}
catch (e) { } return 'auto-us'; }
function mt5SetTz(v) { try {
    localStorage.setItem('edge-mt5-tz', v);
}
catch (e) { } }
/* hari ke-n (0 = Minggu) dalam bulan: untuk aturan jam musim panas AS (Minggu ke-2 Maret s.d. Minggu ke-1 November) */
function mt5NthSunday(y, m0, n) { const first = new Date(Date.UTC(y, m0, 1)).getUTCDay(); return 1 + ((7 - first) % 7) + (n - 1) * 7; }
function mt5OffsetHours(mode, y, mo, d) {
    if (mode === 'gmt2')
        return 2;
    if (mode === 'gmt3')
        return 3;
    if (mode === 'gmt0')
        return 0;
    if (mode === 'wib')
        return 7;
    const start = Date.UTC(y, 2, mt5NthSunday(y, 2, 2)), end = Date.UTC(y, 10, mt5NthSunday(y, 10, 1)), cur = Date.UTC(y, mo - 1, d);
    return cur >= start && cur < end ? 3 : 2;
}
/* "2026.10.27 08:15:01" (jam server) -> "2026-10-27T12:15" (WIB) */
function mt5ToWib(str, mode) {
    const m = String(str || '').match(/(\d{4})[.\-/](\d{2})[.\-/](\d{2})[ T]+(\d{1,2}):(\d{2})/);
    if (!m)
        return '';
    const y = +m[1], mo = +m[2], d = +m[3], h = +m[4], mi = +m[5];
    if (mode === 'wib')
        return `${m[1]}-${m[2]}-${m[3]}T${String(h).padStart(2, '0')}:${m[5]}`;
    const off = mt5OffsetHours(mode, y, mo, d);
    const ms = Date.UTC(y, mo - 1, d, h, mi) - off * 3600000 + 7 * 3600000;
    return new Date(ms).toISOString().slice(0, 16);
}
const MT5_NUM = /-?\d{1,3}(?:[   ]\d{3})+[.,]\d+|-?\d+[.,]\d+/g;
const MT5_DT = /(\d{4})[.\-/](\d{2})[.\-/](\d{2})[ T]+(\d{1,2}):(\d{2})(?::(\d{2}))?/;
const MT5_HEAD = /([A-Za-z][A-Za-z0-9._]{1,14})\s*[,;]\s*(buy|b[uv]y|se[l1!|iI]{1,3})\s+(\d+(?:[.,]\d+)?)/i;
function mt5Num(s) { return Number(String(s).replace(/[   ]/g, '').replace(',', '.')); }
function mt5Numbers(line) { return (String(line).match(MT5_NUM) || []).map(mt5Num); }
/* samakan nama simbol broker (XAUUSDm, GOLD., EURUSD.pro) dengan daftar simbol aplikasi */
function mt5NormSymbol(raw) {
    const u = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!u)
        return null;
    if (SYMBOLS.includes(u))
        return u;
    const hit = SYMBOLS.find(s => u.startsWith(s));
    if (hit)
        return hit;
    if (u.startsWith('XAU'))
        return 'XAUUSD';
    if (u.startsWith('GOLD'))
        return 'GOLD';
    return null;
}
/* hasil: { rows: [...], pick: row terbaik atau null } */
function parseMt5Text(text) {
    const lines = String(text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const rows = [];
    for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(MT5_HEAD);
        if (!m)
            continue;
        const side = /^b/i.test(m[2]) ? 'Long' : 'Short';
        const lots = mt5Num(m[3]);
        const dt = lines[i].match(MT5_DT);
        const row = { symbolRaw: m[1], symbol: mt5NormSymbol(m[1]), side, lots, closeTime: dt ? dt[0] : '', openTime: '', ticket: '', entry: null, exit: null, profit: null, sl: null, tp: null, swap: 0, commission: 0 };
        // baris harga: entry -> exit, profit
        for (let j = i + 1; j <= Math.min(i + 2, lines.length - 1); j++) {
            if (MT5_HEAD.test(lines[j]))
                break;
            const nums = mt5Numbers(lines[j]);
            if (nums.length >= 2) {
                row.entry = Math.abs(nums[0]);
                row.exit = Math.abs(nums[1]);
                if (nums.length >= 3)
                    row.profit = Math.abs(nums[2]);
                var after = j;
                break;
            }
        }
        if (row.entry === null)
            continue;
        // tanda profit dari arah dan harga (lebih andal daripada membaca tanda minus hasil OCR)
        if (row.profit !== null) {
            const move = (side === 'Long' ? row.exit - row.entry : row.entry - row.exit);
            row.profit = (move < 0 ? -1 : 1) * row.profit;
        }
        // blok detail (hanya ada jika posisi dibuka/diketuk): #tiket, Buka, S/L, T/P, Swap, Komisi
        for (let j = after + 1; j <= Math.min(after + 4, lines.length - 1); j++) {
            if (MT5_HEAD.test(lines[j]))
                break;
            const tk = lines[j].match(/#\s*(\d{5,})/);
            if (tk && !row.ticket) {
                row.ticket = tk[1];
                const od = lines[j].match(MT5_DT);
                if (od)
                    row.openTime = od[0];
                const a = lines[j + 1], b = lines[j + 2];
                if (a && !MT5_HEAD.test(a)) {
                    const n = mt5Numbers(a);
                    if (n.length >= 1)
                        row.sl = Math.abs(n[0]) || null;
                    if (n.length >= 2)
                        row.swap = n[1];
                }
                if (b && !MT5_HEAD.test(b)) {
                    const n = mt5Numbers(b);
                    if (n.length >= 1)
                        row.tp = Math.abs(n[0]) || null;
                    if (n.length >= 2)
                        row.commission = n[1];
                }
                break;
            }
        }
        row.detailed = !!row.ticket;
        rows.push(row);
    }
    const pick = rows.find(r => r.detailed) || rows[0] || null;
    return { rows, pick };
}
