/* Versi aplikasi, format uang, tanggal, waktu WIB, sesi trading, helper kecil */
"use strict";
const APP_VERSION = '5.9.95';
// Dialog & toast sendiri (alert/confirm browser diblokir di halaman terhosting)
function fmtLong(iso) { return new Date(iso + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
const money = (n, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(n) || 0);
const number = n => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(n) || 0);
const isoNow = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }; // waktu lokal HP, bukan UTC
const dateOnly = value => String(value || '').slice(0, 10);
const uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
function fmtHold(min) { if (!isFinite(min) || min <= 0)
    return '—'; if (min < 60)
    return `${Math.round(min)} mnt`; if (min < 1440) {
    const h = Math.floor(min / 60), m = Math.round(min % 60);
    return m ? `${h} j ${m} mnt` : `${h} j`;
} const d = Math.floor(min / 1440), h = Math.round((min % 1440) / 60); return h ? `${d} hr ${h} j` : `${d} hr`; }
const WIB_FMT = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', weekday: 'short' });
function wib(d) { const p = {}; WIB_FMT.formatToParts(new Date(d)).forEach(x => { p[x.type] = x.value; }); return { day: `${p.year}-${p.month}-${p.day}`, month: `${p.year}-${p.month}`, year: p.year, mi: Number(p.month) - 1, hour: Number(p.hour), wd: p.weekday }; }
/* Sesi pasar mengikuti jam asli kota (otomatis ikut musim panas/dingin), jam entry tetap WIB.
   Sydney/London/New York 08:00-17:00 waktu lokal, Tokyo 09:00-18:00. Kelompok: Asia, London, New York (jam London+NY buka bersamaan dihitung New York). */
const SES_CITY = [['Sydney', 'Australia/Sydney', 8, 17], ['Tokyo', 'Asia/Tokyo', 9, 18], ['London', 'Europe/London', 8, 17], ['New York', 'America/New_York', 8, 17]];
const _SES_FMT = {};
function _sesLocalHour(tz, ts) { const f = _SES_FMT[tz] || (_SES_FMT[tz] = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hourCycle: 'h23', hour: '2-digit' })); return Number(f.format(new Date(ts))); }
function sesOf(ts) {
    const o = {};
    SES_CITY.forEach(([n, tz, a, b]) => { const h = _sesLocalHour(tz, ts); o[n] = h >= a && h < b; });
    if (o['New York']) return 'New York';
    if (o['London']) return 'London';
    if (o['Tokyo'] || o['Sydney']) return 'Asia';
    return 'Sepi';
}
/* rentang jam WIB sebuah kelompok pada tanggal ref (default hari ini), mis. "15:00–20:00" */
function sesRangeWib(name, ref) {
    const day = wib(ref == null ? Date.now() : ref).day, base = new Date(day + 'T00:00:00+07:00').getTime();
    const on = []; for (let h = 0; h < 24; h++) on.push(sesOf(base + h * 3600000) === name);
    if (!on.some(Boolean)) return '';
    if (on.every(Boolean)) return '24 jam';
    let st = 0; for (let h = 0; h < 24; h++) { if (on[h] && !on[(h + 23) % 24]) { st = h; break; } }
    let en = st; while (on[en % 24]) en++;
    const f = x => String(x % 24).padStart(2, '0') + ':00';
    return f(st) + '–' + f(en);
}
const SESSIONS = [{ name: 'Asia' }, { name: 'London' }, { name: 'New York' }, { name: 'Sepi' }];
const sumOf = (a, f) => a.reduce((x, t) => x + (Number(f(t)) || 0), 0);
const tone = n => n > 0 ? 'pos' : n < 0 ? 'neg' : '';
