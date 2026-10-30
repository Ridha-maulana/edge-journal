/* Versi aplikasi, format uang, tanggal, waktu WIB, sesi trading, helper kecil */
"use strict";
const APP_VERSION = '3.7.4';
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
const SESSIONS = [{ name: 'Asia', hrs: '06:00\u201312:00', test: h => h >= 6 && h < 12 }, { name: 'London', hrs: '12:00\u201320:00', test: h => h >= 12 && h < 20 }, { name: 'New York', hrs: '20:00\u201304:00', test: h => h >= 20 || h < 4 }, { name: 'Overlap', hrs: '04:00\u201306:00', test: h => h >= 4 && h < 6 }];
const sumOf = (a, f) => a.reduce((x, t) => x + (Number(f(t)) || 0), 0);
const tone = n => n > 0 ? 'pos' : n < 0 ? 'neg' : '';
