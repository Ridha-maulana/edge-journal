/* Alarm (v5.9.93): penyimpanan lokal, jadwal, alarm susulan, bunyi di dalam aplikasi, dan notifikasi terjadwal di APK.
   - Data hanya di HP ini (localStorage "ej-alarms-v1"), tidak ikut sinkron online.
   - Aplikasi terbuka: jam dicek tiap detik, layar alarm + bunyi + getar.
   - APK (plugin LocalNotifications): alarm dijadwalkan ke Android, jadi tetap berbunyi saat aplikasi tertutup.
   - Versi web/PWA: hanya berbunyi selama aplikasi terbuka. */
"use strict";
(function () {
    const KEY = 'ej-alarms-v1', CH = 'ej-alarm-v1', BASE_ID = 1000000, LATE = 90000, MAXRING = 180000;
    const DN = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const DS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const ORDER = [1, 2, 3, 4, 5, 6, 0];
    const pad = n => String(n).padStart(2, '0');
    const subs = [], ringSubs = [];
    let st = load(), ring = [], native = null, nativeReady = false, tickTimer = null, syncChain = Promise.resolve();
    function load() {
        try {
            const s = JSON.parse(localStorage.getItem(KEY) || '{}');
            return { list: Array.isArray(s.list) ? s.list : [], fired: (s.fired && typeof s.fired === 'object') ? s.fired : {}, snz: Array.isArray(s.snz) ? s.snz : [], seq: s.seq | 0 };
        }
        catch (e) { return { list: [], fired: {}, snz: [], seq: 0 }; }
    }
    function persist(sync) {
        try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { }
        subs.slice().forEach(f => { try { f(); } catch (e) { } });
        if (sync !== false) syncNative();
    }
    const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    const hm = (h, m) => pad(h) + ':' + pad(m);
    function fmtDur(ms) {
        const tot = Math.max(1, Math.ceil(ms / 60000)), d = Math.floor(tot / 1440), h = Math.floor((tot % 1440) / 60), m = tot % 60;
        const p = [];
        if (d) p.push(d + ' hari');
        if (h) p.push(h + ' jam');
        if (m) p.push(m + ' menit');
        return p.join(' ') || '1 menit';
    }
    /* Waktu terdekat (ms) untuk jam:menit tertentu, mulai dari sekarang */
    function nextAt(h, m, now) {
        now = now || Date.now();
        const d = new Date(now); d.setHours(h, m, 0, 0);
        if (d.getTime() <= now) d.setDate(d.getDate() + 1);
        return d.getTime();
    }
    function matchDay(a, d) {
        if (a.repeat === 'once') return ymd(d) === a.date;
        return (a.days || []).indexOf(d.getDay()) >= 0;
    }
    function stepsOf(a) {
        return [{ min: 0, msg: '', s: 0 }].concat((a.follows || []).map((f, i) => ({ min: Math.max(1, +f.min || 1), msg: f.msg || '', s: i + 1 })));
    }
    /* Semua kejadian alarm (utama + susulan) pada rentang (from, to] */
    function occs(a, from, to) {
        const out = [], steps = stepsOf(a), maxMin = Math.max.apply(null, steps.map(s => s.min));
        const d = new Date(from - maxMin * 60000 - 86400000); d.setHours(0, 0, 0, 0);
        for (; d.getTime() <= to; d.setDate(d.getDate() + 1)) {
            if (!matchDay(a, d)) continue;
            const base = new Date(d.getFullYear(), d.getMonth(), d.getDate(), a.h, a.m, 0, 0).getTime();
            steps.forEach(s => {
                const t = base + s.min * 60000;
                if (t > from && t <= to) out.push({ alarm: a, aid: a.id, t, step: s.s, msg: s.msg, key: a.id + '|' + base + '|' + s.s });
            });
        }
        return out.sort((x, y) => x.t - y.t);
    }
    function titleOf(a, step) { return step === 0 ? (a.label || 'Alarm') : (a.label ? a.label + ' (susulan)' : 'Alarm susulan'); }
    function bodyOf(a, step, msg) {
        if (step === 0) return 'Alarm ' + hm(a.h, a.m);
        return msg || 'Alarm susulan';
    }
    function ringOf(o) {
        const a = o.alarm;
        return { key: o.key, aid: a.id, step: o.step, t: o.t, vib: a.vibrate !== false, title: titleOf(a, o.step), time: new Date(o.t).toTimeString().slice(0, 5), sub: o.step === 0 ? 'Alarm' : 'Alarm susulan' + (a.label ? ' · ' + a.label + ' ' + hm(a.h, a.m) : ''), msg: o.step === 0 ? (a.label || '') : (o.msg || 'Alarm susulan') };
    }
    /* Alarm berikutnya di seluruh daftar (termasuk susulan dan tunda) */
    function next(now) {
        now = now || Date.now();
        let best = null;
        st.list.forEach(a => {
            if (!a.on) return;
            const o = occs(a, now, now + 8 * 86400000)[0];
            if (o && (!best || o.t < best.t)) best = o;
        });
        st.snz.forEach(z => { if (z.t > now && (!best || z.t < best.t)) best = { t: z.t, step: -1, msg: z.msg, label: z.label, alarm: null }; });
        return best;
    }
    function repeatLabel(a) {
        if (a.repeat === 'once') return 'Sekali';
        const ds = (a.days || []).slice().sort((x, y) => ORDER.indexOf(x) - ORDER.indexOf(y));
        if (ds.length === 7) return 'Harian';
        if (ds.length === 5 && [1, 2, 3, 4, 5].every(x => ds.indexOf(x) >= 0)) return 'Sen sampai Jum';
        if (ds.length === 2 && ds.indexOf(6) >= 0 && ds.indexOf(0) >= 0) return 'Sabtu dan Minggu';
        return ds.length ? ds.map(x => DS[x]).join(', ') : 'Sekali';
    }
    /* ===== Bunyi dan getar di dalam aplikasi ===== */
    let actx = null, beepTimer = null, vibTimer = null, stopAudioTimer = null;
    function ctx() { if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (C) { try { actx = new C(); } catch (e) { } } } return actx; }
    function unlock() { const c = ctx(); if (c && c.state === 'suspended') { try { c.resume(); } catch (e) { } } }
    ['pointerdown', 'touchstart', 'keydown', 'click'].forEach(ev => document.addEventListener(ev, unlock, { passive: true }));
    function beepBurst() {
        const c = ctx(); if (!c) return;
        if (c.state === 'suspended') { try { c.resume(); } catch (e) { } }
        const t0 = c.currentTime + 0.02;
        for (let i = 0; i < 4; i++) {
            const o = c.createOscillator(), g = c.createGain(), t = t0 + i * 0.2;
            o.type = 'square'; o.frequency.value = i % 2 ? 1046 : 880;
            g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
            o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.18);
        }
    }
    function vibBurst() { try { if (typeof hapticFire === 'function') hapticFire([500, 250, 500]); else if (navigator.vibrate) navigator.vibrate([500, 250, 500]); } catch (e) { } }
    function startNoise(vib) {
        stopNoise();
        beepBurst(); beepTimer = setInterval(beepBurst, 1300);
        if (vib) { vibBurst(); vibTimer = setInterval(vibBurst, 2000); }
        stopAudioTimer = setTimeout(stopNoise, MAXRING);
    }
    function stopNoise() {
        clearInterval(beepTimer); clearInterval(vibTimer); clearTimeout(stopAudioTimer); beepTimer = vibTimer = stopAudioTimer = null;
        try { navigator.vibrate && navigator.vibrate(0); } catch (e) { }
    }
    /* ===== Layar alarm ===== */
    function emitRing() { ringSubs.slice().forEach(f => { try { f(ring.slice()); } catch (e) { } }); }
    function fire(o, quiet) {
        const r = o.alarm ? ringOf(o) : o;
        if (ring.some(x => x.key === r.key)) return;
        ring.push(r);
        if (!quiet) startNoise(r.vib);
        emitRing();
        /* Di APK, notifikasi yang ikut muncul saat aplikasi terbuka dibuang supaya bunyinya tidak dobel */
        if (native && nativeReady && document.visibilityState === 'visible' && !quiet) setTimeout(() => { try { native.removeAllDeliveredNotifications(); } catch (e) { } }, 1500);
    }
    function dismiss(key) {
        ring = ring.filter(x => x.key !== key);
        if (!ring.length) stopNoise();
        emitRing();
    }
    function snooze(key, min) {
        const r = ring.find(x => x.key === key); if (!r) return;
        min = min || 5;
        const t = Date.now() + min * 60000;
        st.snz.push({ id: 'z' + (++st.seq), t, label: r.title, msg: r.msg || r.title, vib: r.vib });
        dismiss(key); persist();
        return t;
    }
    /* ===== Pengecekan tiap detik ===== */
    function tick() {
        const now = Date.now();
        let dirty = false;
        st.list.forEach(a => {
            if (!a.on) return;
            occs(a, now - LATE, now).forEach(o => {
                if (st.fired[o.key]) return;
                st.fired[o.key] = now; dirty = true; fire(o);
            });
            if (a.repeat === 'once') {
                const steps = stepsOf(a), last = Math.max.apply(null, steps.map(s => s.min)), base = new Date(a.date + 'T' + hm(a.h, a.m) + ':00').getTime();
                if (now > base + last * 60000 + 120000) { dirty = true; if (a.del) st.list = st.list.filter(x => x.id !== a.id); else a.on = false; }
            }
        });
        const due = st.snz.filter(z => z.t <= now);
        if (due.length) {
            st.snz = st.snz.filter(z => z.t > now); dirty = true;
            due.forEach(z => { if (now - z.t < LATE * 2) fire({ key: z.id, aid: '', step: 0, t: z.t, vib: z.vib !== false, title: z.label, time: new Date(z.t).toTimeString().slice(0, 5), sub: 'Tunda', msg: z.msg || '' }); });
        }
        Object.keys(st.fired).forEach(k => { if (now - st.fired[k] > 3 * 86400000) { delete st.fired[k]; dirty = true; } });
        if (dirty) persist();
    }
    function start() {
        if (tickTimer) return;
        tickTimer = setInterval(tick, 1000);
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { tick(); syncNative(); } });
        tick(); nativeInit();
    }
    /* ===== Notifikasi terjadwal Android (plugin LocalNotifications) ===== */
    function nat() {
        try {
            const c = window.Capacitor;
            if (c && c.isNativePlatform && c.isNativePlatform()) return (c.Plugins && c.Plugins.LocalNotifications) || (c.registerPlugin && c.registerPlugin('LocalNotifications')) || null;
        }
        catch (e) { }
        return null;
    }
    async function nativeInit() {
        native = nat();
        if (!native) return;
        try {
            await native.checkPermissions();
            try { await native.createChannel({ id: CH, name: 'Alarm', description: 'Alarm Edge Journal', importance: 5, visibility: 1, sound: 'ej_alarm.wav', vibration: true, lights: true }); } catch (e) { }
            try { native.addListener('localNotificationActionPerformed', onTap); } catch (e) { }
            nativeReady = true;
            syncNative();
        }
        catch (e) { nativeReady = false; }
    }
    /* Ketuk notifikasi: buka layar alarm. Bunyi hanya bila waktunya baru lewat (di bawah 15 menit). */
    function onTap(ev) {
        try {
            const x = (ev && ev.notification && ev.notification.extra) || {};
            const now = Date.now();
            if (x.zid) { fire({ key: 'tap' + x.zid + now, aid: '', step: 0, t: now, vib: true, title: x.title || 'Alarm', time: new Date(now).toTimeString().slice(0, 5), sub: 'Tunda', msg: x.msg || '' }, false); return; }
            const a = st.list.find(z => z.id === x.aid); if (!a) return;
            const step = x.step | 0;
            const oc = occs(a, now - 2 * 86400000, now).filter(o => o.step === step).pop();
            if (oc && st.fired[oc.key] && now - st.fired[oc.key] < 180000) return; /* sudah berbunyi di aplikasi */
            if (oc) { st.fired[oc.key] = now; persist(false); fire(oc, now - oc.t > 15 * 60000); }
            else fire({ key: 'tap|' + a.id + '|' + step + '|' + now, alarm: a, aid: a.id, t: now, step, msg: (a.follows[step - 1] || {}).msg || '' }, true);
        }
        catch (e) { }
    }
    function buildNative() {
        const now = Date.now(), out = [];
        st.list.forEach(a => {
            if (!a.on) return;
            const steps = stepsOf(a), nId = BASE_ID + (a.n | 0) * 100;
            steps.forEach(s => {
                const extra = { aid: a.id, step: s.s }, title = titleOf(a, s.s), body = bodyOf(a, s.s, s.msg);
                const mk = (id, schedule) => out.push({ id, title, body, schedule: Object.assign({ allowWhileIdle: true }, schedule), channelId: CH, extra, autoCancel: true });
                if (a.repeat === 'once') {
                    const t = new Date(a.date + 'T' + hm(a.h, a.m) + ':00').getTime() + s.min * 60000;
                    if (t > now) mk(nId + s.s * 10, { at: new Date(t) });
                    return;
                }
                const days = a.days || [];
                const tot = a.h * 60 + a.m + s.min, shift = Math.floor(tot / 1440), hh = Math.floor((tot % 1440) / 60), mm = tot % 60;
                if (days.length === 7) { mk(nId + s.s * 10, { on: { hour: hh, minute: mm } }); return; }
                days.forEach((d, i) => mk(nId + s.s * 10 + (i % 7), { on: { weekday: ((d + shift) % 7) + 1, hour: hh, minute: mm } }));
            });
        });
        st.snz.forEach((z, i) => { if (z.t > now) out.push({ id: BASE_ID + 90000 + i, title: z.label || 'Alarm', body: z.msg || 'Alarm', schedule: { at: new Date(z.t), allowWhileIdle: true }, channelId: CH, extra: { zid: z.id, title: z.label, msg: z.msg }, autoCancel: true }); });
        return out;
    }
    function syncNative() {
        if (!native || !nativeReady) return;
        syncChain = syncChain.then(async () => {
            try {
                const pend = await native.getPending();
                const mine = ((pend && pend.notifications) || []).filter(p => p.id >= BASE_ID);
                if (mine.length) await native.cancel({ notifications: mine.map(p => ({ id: p.id })) });
                const list = buildNative();
                if (list.length) await native.schedule({ notifications: list });
            }
            catch (e) { }
        });
    }
    /* Izin notifikasi dan alarm tepat waktu: diminta saat alarm pertama dibuat */
    async function ensurePermission() {
        const N = native || nat();
        if (!N) return { native: false };
        const res = { native: true, ok: true };
        try {
            let p = await N.checkPermissions();
            if (p.display !== 'granted') p = await N.requestPermissions();
            res.ok = p.display === 'granted';
        }
        catch (e) { res.ok = false; }
        try {
            const e = await N.checkExactNotificationSetting();
            if (e && e.exact_alarm === 'denied') { res.exact = false; try { await N.changeExactNotificationSetting(); } catch (x) { } }
        }
        catch (e) { }
        if (!native) nativeInit();
        return res;
    }
    /* ===== Operasi daftar ===== */
    function blank(h, m, label) {
        const now = new Date(), t = nextAt(h == null ? now.getHours() : h, m == null ? now.getMinutes() : m);
        return { id: '', n: 0, h: new Date(t).getHours(), m: new Date(t).getMinutes(), repeat: 'days', days: [1, 2, 3, 4, 5], date: '', label: label || '', vibrate: true, del: false, on: true, follows: [] };
    }
    function save(a) {
        const o = Object.assign({}, a, { follows: (a.follows || []).map(f => ({ min: Math.max(1, Math.min(720, +f.min || 5)), msg: String(f.msg || '').slice(0, 80) })).sort((x, y) => x.min - y.min), label: String(a.label || '').slice(0, 60) });
        if (o.repeat !== 'once' && !(o.days && o.days.length)) o.repeat = 'once';
        if (o.repeat === 'once') o.date = ymd(new Date(nextAt(o.h, o.m)));
        o.on = true;
        if (!o.id) { o.id = 'al' + Date.now().toString(36) + (++st.seq); o.n = (st.list.reduce((m, x) => Math.max(m, x.n | 0), 0)) + 1; st.list.push(o); }
        else st.list = st.list.map(x => x.id === o.id ? Object.assign({}, x, o) : x);
        persist();
        return o;
    }
    function toggle(id, on) {
        st.list = st.list.map(a => {
            if (a.id !== id) return a;
            const b = Object.assign({}, a, { on });
            if (on && b.repeat === 'once') b.date = ymd(new Date(nextAt(b.h, b.m)));
            return b;
        });
        persist();
    }
    function remove(id) { st.list = st.list.filter(a => a.id !== id); persist(); }
    window.EJAlarm = {
        DN, DS, ORDER, pad, hm, fmtDur, nextAt, repeatLabel, next, occs, blank, save, toggle, remove, ensurePermission, start, fire, dismiss, snooze, unlock,
        get list() { return st.list; },
        get ringing() { return ring.slice(); },
        get isNative() { return !!(native && nativeReady); },
        subscribe(f) { subs.push(f); return () => { const i = subs.indexOf(f); if (i >= 0) subs.splice(i, 1); }; },
        onRing(f) { ringSubs.push(f); return () => { const i = ringSubs.indexOf(f); if (i >= 0) ringSubs.splice(i, 1); }; },
        stepsOf
    };
})();
