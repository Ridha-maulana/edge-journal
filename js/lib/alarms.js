/* Alarm (v5.9.98): penyimpanan lokal, jadwal, alarm susulan, nada dering, bunyi di dalam aplikasi, dan alarm native di APK.
   - Data hanya di HP ini (localStorage "ej-alarms-v1"), tidak ikut sinkron online.
   - Aplikasi terbuka (web/PWA): jam dicek tiap detik, layar alarm + nada + getar.
   - APK 1.4.0+ (plugin EjAlarm): jadwal dikirim ke AlarmManager Android, jadi alarm berbunyi walau aplikasi tertutup atau HP terkunci,
     dengan banner Tunda/Matikan, pemberitahuan "Alarm yang akan datang", dan layar alarm di atas layar kunci.
   - APK 1.3.0 (plugin LocalNotifications): jalur lama, hanya notifikasi biasa. */
"use strict";
(function () {
    const KEY = 'ej-alarms-v1', CH = 'ej-alarm-v1', BASE_ID = 1000000, LATE = 90000, MAXRING = 180000, HORIZON = 21 * 86400000, MAXITEMS = 300;
    const DN = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const DS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const ORDER = [1, 2, 3, 4, 5, 6, 0];
    /* Nada dering. Daftar ini harus sama dengan TONES di android-app/patch-theme.js (file WAV untuk APK dibuat dari sana). */
    const TONES = {
        klasik: { name: 'Alarm klasik', period: 1.5, w: 'sq', ev: [[0, 880, 0.17], [0.25, 1046.5, 0.17], [0.5, 880, 0.17], [0.75, 1046.5, 0.17]] },
        bip: { name: 'Bip cepat', period: 1.2, w: 'sq', ev: [[0, 1318.5, 0.08], [0.14, 1318.5, 0.08], [0.28, 1318.5, 0.08], [0.42, 1318.5, 0.08]] },
        lonceng: { name: 'Lonceng', period: 3, w: 'bell', ev: [[0, 660, 1.4], [1, 880, 1.4], [2, 660, 1]] },
        digital: { name: 'Digital', period: 1.2, w: 'sq', ev: [[0, 784, 0.12], [0.15, 988, 0.12], [0.3, 1175, 0.12], [0.6, 784, 0.12], [0.75, 988, 0.12], [0.9, 1175, 0.12]] },
        pagi: { name: 'Pagi', period: 4, w: 'soft', ev: [[0, 523.3, 0.6], [0.5, 659.3, 0.6], [1, 784, 0.6], [1.5, 1046.5, 1.2]] }
    };
    const TONE_IDS = ['klasik', 'bip', 'lonceng', 'digital', 'pagi'];
    const pad = n => String(n).padStart(2, '0');
    const subs = [], ringSubs = [];
    let st = load(), ring = [], native = null, nativeReady = false, ej = null, ejReady = false, tickTimer = null, syncChain = Promise.resolve();
    function load() {
        try {
            const s = JSON.parse(localStorage.getItem(KEY) || '{}');
            return { list: Array.isArray(s.list) ? s.list : [], fired: (s.fired && typeof s.fired === 'object') ? s.fired : {}, snz: Array.isArray(s.snz) ? s.snz : [], seq: s.seq | 0 };
        }
        catch (e) { return { list: [], fired: {}, snz: [], seq: 0 }; }
    }
    function persist(sync) {
        try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { }
        mirror();
        subs.slice().forEach(f => { try { f(); } catch (e) { } });
        if (sync !== false) syncNative();
    }
    /* Daftar alarm ikut disimpan di data jurnal (edge-journal-v3, field "alarms") sehingga ikut sinkron ke akun online.
       Yang ikut hanya definisi alarm; riwayat bunyi (fired) dan tunda tetap di HP ini. */
    const STORE = 'edge-journal-v3';
    function mirror() {
        try {
            const raw = localStorage.getItem(STORE); if (!raw) return;
            const o = JSON.parse(raw); if (!o || !Array.isArray(o.accounts)) return;
            const d = { v: 1, list: st.list, seq: st.seq };
            if (o.alarms ? JSON.stringify(o.alarms) === JSON.stringify(d) : !st.list.length) return;
            o.alarms = d; localStorage.setItem(STORE, JSON.stringify(o));
            if (typeof markLocalChanged === 'function') markLocalChanged();
        } catch (e) { }
    }
    /* Data baru datang dari akun online (atau login di HP baru): pakai daftar alarm dari sana */
    function reload() {
        try {
            const o = JSON.parse(localStorage.getItem(STORE) || 'null'), sa = o && o.alarms;
            if (!sa || !Array.isArray(sa.list)) { mirror(); return; }
            if (JSON.stringify(sa.list) === JSON.stringify(st.list)) return;
            st.list = sa.list; st.seq = Math.max(st.seq | 0, sa.seq | 0);
            try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { }
            subs.slice().forEach(f => { try { f(); } catch (e) { } });
            syncNative();
        } catch (e) { }
    }
    window.addEventListener('ej-state-applied', reload);
    const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    const hm = (h, m, s) => pad(h) + ':' + pad(m) + (s ? ':' + pad(s) : '');
    function toneName(id, a) { return id === 'sistem' ? 'Alarm bawaan HP' : id === 'hp' ? ((a && a.tt) || 'Nada pilihan dari HP') : (TONES[id] || TONES.klasik).name; }
    /* "1 hari 2 jam 5 menit"; detik ikut ditulis bila sec=true atau sisa waktu di bawah semenit */
    function fmtDur(ms, sec) {
        let tot = Math.max(1, Math.ceil(ms / 1000));
        const showSec = sec || tot < 60;
        if (!showSec) tot = Math.ceil(tot / 60) * 60;
        const d = Math.floor(tot / 86400), h = Math.floor((tot % 86400) / 3600), m = Math.floor((tot % 3600) / 60), s = tot % 60;
        const p = [];
        if (d) p.push(d + ' hari');
        if (h) p.push(h + ' jam');
        if (m) p.push(m + ' menit');
        if (showSec && s) p.push(s + ' detik');
        return p.join(' ') || '1 menit';
    }
    /* Waktu terdekat (ms) untuk jam:menit:detik tertentu, mulai dari sekarang */
    function nextAt(h, m, s, now) {
        now = now || Date.now();
        const d = new Date(now); d.setHours(h, m, s || 0, 0);
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
    const onceBase = a => new Date(a.date + 'T00:00:00').getTime() + ((a.h * 3600) + (a.m * 60) + (a.s || 0)) * 1000;
    const baseOfDate = (a, d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), a.h, a.m, a.s || 0, 0).getTime();
    /* Semua kejadian alarm (utama + susulan) pada rentang (from, to] */
    function occs(a, from, to) {
        const out = [], steps = stepsOf(a), maxMin = Math.max.apply(null, steps.map(s => s.min));
        const d = new Date(from - maxMin * 60000 - 86400000); d.setHours(0, 0, 0, 0);
        for (; d.getTime() <= to; d.setDate(d.getDate() + 1)) {
            if (!matchDay(a, d)) continue;
            const base = baseOfDate(a, d);
            steps.forEach(s => {
                const t = base + s.min * 60000;
                if (t > from && t <= to) out.push({ alarm: a, aid: a.id, t, step: s.s, msg: s.msg, key: a.id + '|' + base + '|' + s.s });
            });
        }
        return out.sort((x, y) => x.t - y.t);
    }
    const clock = (t, a) => { const d = new Date(t); return hm(d.getHours(), d.getMinutes(), a && a.s ? d.getSeconds() : 0); };
    function titleOf(a, step) { return step === 0 ? (a.label || 'Alarm') : (a.label ? a.label + ' (susulan)' : 'Alarm susulan'); }
    function bodyOf(a, step, msg) {
        if (step === 0) return a.label || 'Alarm';
        return msg || 'Alarm susulan';
    }
    function ringOf(o) {
        const a = o.alarm;
        return { key: o.key, aid: a.id, step: o.step, t: o.t, vib: a.vibrate !== false, tone: a.tone || 'klasik', title: titleOf(a, o.step), time: clock(o.t, a), sub: o.step === 0 ? 'Alarm' : 'Alarm susulan' + (a.label ? ' · ' + a.label + ' ' + hm(a.h, a.m, a.s) : ''), msg: o.step === 0 ? (a.label || '') : (o.msg || 'Alarm susulan') };
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
    let actx = null, beepTimer = null, vibTimer = null, stopAudioTimer = null, previewTimer = null;
    function ctx() { if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (C) { try { actx = new C(); } catch (e) { } } } return actx; }
    function unlock() { const c = ctx(); if (c && c.state === 'suspended') { try { c.resume(); } catch (e) { } } }
    ['pointerdown', 'touchstart', 'keydown', 'click'].forEach(ev => document.addEventListener(ev, unlock, { passive: true }));
    /* Satu putaran nada (sama dengan file WAV di APK, hanya didekati dengan osilator) */
    function toneBurst(id) {
        const sp = TONES[id] || TONES.klasik, c = ctx(); if (!c) return;
        if (c.state === 'suspended') { try { c.resume(); } catch (e) { } }
        const t0 = c.currentTime + 0.02;
        sp.ev.forEach(e => {
            const f = e[1], d = e[2], t = t0 + e[0], mk = (type, freq, peak, end) => {
                const o = c.createOscillator(), g = c.createGain();
                o.type = type; o.frequency.value = freq;
                g.gain.setValueAtTime(0.0001, t);
                if (sp.w === 'bell') { g.gain.exponentialRampToValueAtTime(peak, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + end); }
                else if (sp.w === 'soft') { g.gain.exponentialRampToValueAtTime(peak, t + 0.08); g.gain.setValueAtTime(peak, t + Math.max(0.09, end - 0.15)); g.gain.exponentialRampToValueAtTime(0.0001, t + end); }
                else { g.gain.exponentialRampToValueAtTime(peak, t + 0.012); g.gain.setValueAtTime(peak, t + Math.max(0.013, end - 0.03)); g.gain.exponentialRampToValueAtTime(0.0001, t + end); }
                o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + end + 0.02);
            };
            if (sp.w === 'bell') { mk('sine', f, 0.3, d); mk('sine', f * 2.76, 0.12, d * 0.4); }
            else if (sp.w === 'soft') mk('sine', f, 0.3, d);
            else mk('square', f, 0.16, d);
        });
    }
    function vibBurst() { try { if (typeof hapticFire === 'function') hapticFire([500, 250, 500]); else if (navigator.vibrate) navigator.vibrate([500, 250, 500]); } catch (e) { } }
    function startNoise(vib, tone) {
        stopNoise();
        const id = (tone && TONES[tone]) ? tone : 'klasik', per = TONES[id].period * 1000;
        toneBurst(id); beepTimer = setInterval(() => toneBurst(id), per);
        if (vib) { vibBurst(); vibTimer = setInterval(vibBurst, 2000); }
        stopAudioTimer = setTimeout(stopNoise, MAXRING);
    }
    function stopNoise() {
        clearInterval(beepTimer); clearInterval(vibTimer); clearTimeout(stopAudioTimer); beepTimer = vibTimer = stopAudioTimer = null;
        try { navigator.vibrate && navigator.vibrate(0); } catch (e) { }
    }
    /* Dengar contoh nada (tombol pada daftar Nada dering); 'sistem' memakai nada klasik sebagai contoh */
    function preview(id) {
        stopPreview();
        const k = TONES[id] ? id : 'klasik';
        toneBurst(k);
        previewTimer = setInterval(() => toneBurst(k), TONES[k].period * 1000);
        setTimeout(stopPreview, Math.min(4200, TONES[k].period * 1000 * 3 - 50));
    }
    function stopPreview() { clearInterval(previewTimer); previewTimer = null; }
    /* ===== Layar alarm ===== */
    function emitRing() { ringSubs.slice().forEach(f => { try { f(ring.slice()); } catch (e) { } }); }
    function fire(o, quiet) {
        const r = o.alarm ? ringOf(o) : o;
        if (ring.some(x => x.key === r.key)) return;
        ring.push(r);
        if (!quiet) startNoise(r.vib, r.tone);
        emitRing();
        /* Di APK lama (LocalNotifications), notifikasi yang ikut muncul saat aplikasi terbuka dibuang supaya bunyinya tidak dobel */
        if (native && nativeReady && !ejReady && document.visibilityState === 'visible' && !quiet) setTimeout(() => { try { native.removeAllDeliveredNotifications(); } catch (e) { } }, 1500);
    }
    function dismiss(key) {
        const r = ring.find(x => x.key === key);
        ring = ring.filter(x => x.key !== key);
        if (r && r.native && ejReady) { try { ej.stop(); } catch (e) { } }
        if (!ring.length) stopNoise();
        emitRing();
    }
    function snooze(key, min) {
        const r = ring.find(x => x.key === key); if (!r) return;
        min = min || 5;
        if (r.native && ejReady) {
            ring = ring.filter(x => x.key !== key);
            if (!ring.length) stopNoise();
            emitRing();
            try { ej.snooze({ min }); } catch (e) { }
            return Date.now() + min * 60000;
        }
        const t = Date.now() + min * 60000;
        st.snz.push({ id: 'z' + (++st.seq), t, label: r.title, msg: r.msg || r.title, vib: r.vib, tone: r.tone });
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
                st.fired[o.key] = now; dirty = true;
                if (ejReady) {
                    /* APK baru: alarm native yang berbunyi. Bila ternyata tidak ada yang berbunyi, aplikasi ikut berbunyi sendiri. */
                    setTimeout(() => { try { ej.getRinging().then(r => { if (!(r && r.ringing) && !ring.length) fire(o); }).catch(() => { if (!ring.length) fire(o); }); } catch (e) { fire(o); } }, 1800);
                }
                else fire(o);
            });
            if (a.repeat === 'once') {
                const steps = stepsOf(a), last = Math.max.apply(null, steps.map(s => s.min)), base = onceBase(a);
                if (now > base + last * 60000 + 120000) { dirty = true; if (a.del) st.list = st.list.filter(x => x.id !== a.id); else a.on = false; }
            }
        });
        const due = st.snz.filter(z => z.t <= now);
        if (due.length) {
            st.snz = st.snz.filter(z => z.t > now); dirty = true;
            due.forEach(z => { if (now - z.t < LATE * 2) fire({ key: z.id, aid: '', step: 0, t: z.t, vib: z.vib !== false, tone: z.tone || 'klasik', title: z.label, time: new Date(z.t).toTimeString().slice(0, 5), sub: 'Tunda', msg: z.msg || '' }); });
        }
        Object.keys(st.fired).forEach(k => { if (now - st.fired[k] > 3 * 86400000) { delete st.fired[k]; dirty = true; } });
        if (dirty) persist();
    }
    function start() {
        if (tickTimer) return;
        try {   /* HP baru: daftar kosong tetapi data jurnal sudah berisi alarm -> ambil; sebaliknya kirim alarm lama ke data jurnal */
            const o = JSON.parse(localStorage.getItem(STORE) || 'null');
            if (o && o.alarms && Array.isArray(o.alarms.list) && !st.list.length && o.alarms.list.length) reload(); else if (!(o && o.alarms)) mirror();
        } catch (e) { }
        tickTimer = setInterval(tick, 1000);
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { tick(); syncNative(); pullRinging(); } });
        tick(); nativeInit();
    }
    /* ===== Plugin native ===== */
    function plug(name) {
        try {
            const c = window.Capacitor;
            if (c && c.isNativePlatform && c.isNativePlatform()) return (c.Plugins && c.Plugins[name]) || (c.registerPlugin && c.registerPlugin(name)) || null;
        }
        catch (e) { }
        return null;
    }
    async function nativeInit() {
        /* 1) APK 1.4.0+: plugin EjAlarm */
        ej = plug('EjAlarm');
        if (ej) {
            try {
                await ej.status();
                try { ej.addListener('alarmRing', onNativeRing); ej.addListener('alarmStop', onNativeStop); } catch (e) { }
                ejReady = true;
                syncNative(); pullRinging();
                return;
            }
            catch (e) { ejReady = false; ej = null; }
        }
        /* 2) APK 1.3.0: plugin LocalNotifications */
        native = plug('LocalNotifications');
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
    function nativeRingObj(x) {
        return { key: 'n|' + (x.id || 0) + '|' + (x.at || 0), native: true, aid: '', step: x.step | 0, t: x.at || Date.now(), vib: x.vib !== false, tone: x.tone || 'klasik', title: x.body || 'Alarm', time: x.time || '', sub: x.sub || 'Alarm', msg: x.body || '' };
    }
    function onNativeRing(x) {
        if (!x) return;
        const r = nativeRingObj(x);
        stopNoise();
        fire(r, true);
    }
    function onNativeStop() {
        const had = ring.some(x => x.native);
        ring = ring.filter(x => !x.native);
        if (had) emitRing();
    }
    function pullRinging() {
        if (!ejReady) return;
        try { ej.getRinging().then(r => { if (r && r.ringing) onNativeRing(r); else onNativeStop(); }).catch(() => { }); } catch (e) { }
    }
    /* Ketuk notifikasi (APK 1.3.0): buka layar alarm. Bunyi hanya bila waktunya baru lewat (di bawah 15 menit). */
    function onTap(ev) {
        try {
            const x = (ev && ev.notification && ev.notification.extra) || {};
            const now = Date.now();
            if (x.zid) { fire({ key: 'tap' + x.zid + now, aid: '', step: 0, t: now, vib: true, tone: 'klasik', title: x.title || 'Alarm', time: new Date(now).toTimeString().slice(0, 5), sub: 'Tunda', msg: x.msg || '' }, false); return; }
            const a = st.list.find(z => z.id === x.aid); if (!a) return;
            const step = x.step | 0;
            const oc = occs(a, now - 2 * 86400000, now).filter(o => o.step === step).pop();
            if (oc && st.fired[oc.key] && now - st.fired[oc.key] < 180000) return;
            if (oc) { st.fired[oc.key] = now; persist(false); fire(oc, now - oc.t > 15 * 60000); }
            else fire({ key: 'tap|' + a.id + '|' + step + '|' + now, alarm: a, aid: a.id, t: now, step, msg: (a.follows[step - 1] || {}).msg || '' }, true);
        }
        catch (e) { }
    }
    /* Daftar kejadian untuk plugin EjAlarm: 3 minggu ke depan, urut waktu, paling banyak MAXITEMS */
    function buildEj() {
        const now = Date.now(), all = [];
        st.list.forEach(a => { if (a.on) occs(a, now, now + HORIZON).forEach(o => all.push(o)); });
        all.sort((x, y) => x.t - y.t);
        return all.slice(0, MAXITEMS).map((o, i) => {
            const a = o.alarm;
            return { id: i + 1, at: o.t, grp: o.key.slice(0, o.key.lastIndexOf('|')), step: o.step, time: clock(o.t, a), body: bodyOf(a, o.step, o.msg), sub: o.step === 0 ? 'Alarm' : 'Alarm susulan' + (a.label ? ' · ' + a.label + ' ' + hm(a.h, a.m, a.s) : ''), tone: a.tone || 'klasik', tu: a.tone === 'hp' ? (a.tu || '') : '', vib: a.vibrate !== false, snz: 5, pre: o.step === 0 };
        });
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
                    const t = onceBase(a) + s.min * 60000;
                    if (t > now) mk(nId + s.s * 10, { at: new Date(t) });
                    return;
                }
                const days = a.days || [];
                const tot = a.h * 60 + a.m + s.min, shift = Math.floor(tot / 1440), hh = Math.floor((tot % 1440) / 60), mm = tot % 60;
                if (days.length === 7) { mk(nId + s.s * 10, { on: { hour: hh, minute: mm, second: a.s || 0 } }); return; }
                days.forEach((d, i) => mk(nId + s.s * 10 + (i % 7), { on: { weekday: ((d + shift) % 7) + 1, hour: hh, minute: mm, second: a.s || 0 } }));
            });
        });
        st.snz.forEach((z, i) => { if (z.t > now) out.push({ id: BASE_ID + 90000 + i, title: z.label || 'Alarm', body: z.msg || 'Alarm', schedule: { at: new Date(z.t), allowWhileIdle: true }, channelId: CH, extra: { zid: z.id, title: z.label, msg: z.msg }, autoCancel: true }); });
        return out;
    }
    function syncNative() {
        if (ejReady) {
            syncChain = syncChain.then(async () => { try { await ej.schedule({ items: buildEj() }); } catch (e) { } });
            return;
        }
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
    /* Izin notifikasi dan layar alarm penuh: diminta saat alarm pertama dibuat */
    async function ensurePermission() {
        if (ejReady) {
            const res = { native: true, ok: true };
            try {
                let s = await ej.status();
                if (!s.notif) { await ej.requestNotif(); await new Promise(r => setTimeout(r, 900)); s = await ej.status(); }
                res.ok = !!s.notif;
                if (s.notif && s.full === false) res.full = false;
            }
            catch (e) { res.ok = false; }
            return res;
        }
        const N = native || plug('LocalNotifications');
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
    /* Buka daftar nada dering asli HP (APK 1.5.0+). Hasil: {uri,title}, null bila dibatalkan, {err:true} bila APK belum mendukung */
    async function pickRingtone(cur) {
        if (!ejReady) return { err: true };
        try { const r = await ej.pickRingtone({ uri: cur || '' }); return r && r.ok && r.uri ? { uri: r.uri, title: r.title || 'Nada pilihan dari HP' } : null; }
        catch (e) { return { err: true }; }
    }
    function openSettings(kind) { if (ejReady) { try { ej.openSettings({ kind }); } catch (e) { } } }
    /* ===== Operasi daftar ===== */
    function blank(h, m, label) {
        const now = new Date(), t = nextAt(h == null ? now.getHours() : h, m == null ? now.getMinutes() : m, 0);
        return { id: '', n: 0, h: new Date(t).getHours(), m: new Date(t).getMinutes(), s: 0, repeat: 'days', days: [1, 2, 3, 4, 5], date: '', label: label || '', vibrate: true, tone: 'klasik', del: false, on: true, follows: [] };
    }
    function save(a) {
        const o = Object.assign({}, a, { s: Math.max(0, Math.min(59, +a.s || 0)), tone: (a.tone === 'sistem' || (a.tone === 'hp' && a.tu) || TONES[a.tone]) ? a.tone : 'klasik', tu: String(a.tu || '').slice(0, 400), tt: String(a.tt || '').slice(0, 80), follows: (a.follows || []).map(f => ({ min: Math.max(1, Math.min(720, +f.min || 5)), msg: String(f.msg || '').slice(0, 80) })).sort((x, y) => x.min - y.min), label: String(a.label || '').slice(0, 60) });
        if (o.repeat !== 'once' && !(o.days && o.days.length)) o.repeat = 'once';
        if (o.repeat === 'once') o.date = ymd(new Date(nextAt(o.h, o.m, o.s)));
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
            if (on && b.repeat === 'once') b.date = ymd(new Date(nextAt(b.h, b.m, b.s || 0)));
            return b;
        });
        persist();
    }
    function remove(id) { st.list = st.list.filter(a => a.id !== id); persist(); }
    window.EJAlarm = {
        DN, DS, ORDER, TONES, TONE_IDS, pad, hm, fmtDur, nextAt, repeatLabel, toneName, next, occs, blank, save, toggle, remove, ensurePermission, openSettings, pickRingtone, reload, start, fire, dismiss, snooze, unlock, preview, stopPreview, clock,
        get list() { return st.list; },
        get ringing() { return ring.slice(); },
        get isNative() { return !!(ejReady || (native && nativeReady)); },
        get isEj() { return ejReady; },
        subscribe(f) { subs.push(f); return () => { const i = subs.indexOf(f); if (i >= 0) subs.splice(i, 1); }; },
        onRing(f) { ringSubs.push(f); return () => { const i = ringSubs.indexOf(f); if (i >= 0) ringSubs.splice(i, 1); }; },
        stepsOf
    };
})();
