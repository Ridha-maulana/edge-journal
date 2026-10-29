/* Edge Journal — Sinkron online (Firebase Auth + Cloud Firestore)
   - Data tetap disimpan lokal (localStorage) sehingga aplikasi tetap bisa dipakai offline.
   - Jika login, setiap perubahan dikirim ke Firestore (users/{uid}) dan perubahan dari perangkat lain diterima otomatis.
   - Jika firebase-config.js belum diisi, modul ini tidak melakukan apa pun. */

const STORE_KEY = 'edge-journal-v3';
const META_KEY = 'edge-sync-meta';
const SAFE_KEY = 'edge-journal-pre-sync-backup';
const CHUNK = 200000;                       // karakter per dokumen (batas Firestore 1 MiB per dokumen)
const FIREBASE_VERSION = '10.11.1';

/* ---------- util ---------- */
export function splitText(text, size = CHUNK) {
    const out = [];
    let i = 0;
    while (i < text.length) {
        let end = Math.min(i + size, text.length);
        if (end < text.length) {                       // jangan memotong pasangan surrogate (emoji)
            const c = text.charCodeAt(end - 1);
            if (c >= 0xD800 && c <= 0xDBFF) end--;
        }
        out.push(text.slice(i, end));
        i = end;
    }
    return out.length ? out : [''];
}

export function friendlyError(e) {
    const code = (e && e.code) || '';
    const map = {
        'auth/invalid-email': 'Format email tidak valid.',
        'auth/missing-password': 'Password belum diisi.',
        'auth/weak-password': 'Password terlalu lemah (minimal 6 karakter).',
        'auth/email-already-in-use': 'Email ini sudah terdaftar. Silakan pilih Masuk.',
        'auth/user-not-found': 'Akun tidak ditemukan.',
        'auth/wrong-password': 'Email atau password salah.',
        'auth/invalid-credential': 'Email atau password salah.',
        'auth/invalid-login-credentials': 'Email atau password salah.',
        'auth/too-many-requests': 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.',
        'auth/network-request-failed': 'Tidak ada koneksi internet.',
        'auth/operation-not-allowed': 'Pendaftaran/Email-Password belum diaktifkan di Firebase (atau pendaftaran baru dimatikan).',
        'auth/user-disabled': 'Akun ini dinonaktifkan.',
        'permission-denied': 'Akses ditolak. Periksa Rules Firestore (lihat PANDUAN_FIREBASE.md).',
        'unavailable': 'Tidak ada koneksi ke server.',
    };
    if (map[code]) return map[code];
    if (code.startsWith('auth/') || code.startsWith('firestore/')) return 'Gagal: ' + code;
    return (e && e.message) || 'Terjadi kesalahan.';
}

function isNetworkError(e) {
    const code = (e && e.code) || '';
    return code === 'auth/network-request-failed' || code === 'unavailable' || code === 'deadline-exceeded' || code === 'failed-precondition' ||
        (typeof navigator !== 'undefined' && navigator.onLine === false) || /network|offline|Failed to fetch|Load failed/i.test((e && e.message) || '');
}

/* ---------- mesin sinkronisasi (tidak bergantung pada Firebase, mudah diuji) ---------- */
export function createEngine(deps) {
    const { storage, backend, applyState } = deps;
    const now = deps.now || (() => Date.now());
    const later = deps.setTimeout || ((f, ms) => setTimeout(f, ms));
    const cancel = deps.clearTimeout || (id => clearTimeout(id));
    let deviceId = deps.deviceId || null;

    let status = { configured: true, ready: false, user: null, state: 'signedout', lastSyncAt: 0, message: '' };
    const subs = new Set();
    let uid = null, unsub = null, timer = null, retryTimer = null, pushing = false, queued = false, sessionToken = 0;

    const emit = () => subs.forEach(f => { try { f({ ...status }); } catch (e) { /* abaikan */ } });
    const set = patch => { status = { ...status, ...patch }; emit(); };
    const loadMeta = () => { try { return JSON.parse(storage.getItem(META_KEY)) || {}; } catch (e) { return {}; } };
    const saveMeta = m => { try { storage.setItem(META_KEY, JSON.stringify(m)); } catch (e) { /* penuh? abaikan */ } };
    const hasLocal = () => storage.getItem(STORE_KEY) !== null;

    function ensureDeviceId() {
        const m = loadMeta();
        if (!deviceId) deviceId = m.deviceId || ('d' + Math.random().toString(36).slice(2, 10) + now().toString(36));
        if (m.deviceId !== deviceId) { m.deviceId = deviceId; saveMeta(m); }
        return deviceId;
    }
    function setSynced(m, message) {
        set({ state: 'synced', lastSyncAt: (m || loadMeta()).lastSyncAt || 0, message: message || '' });
    }
    function setConflict() {
        cancel(timer); cancel(retryTimer);
        set({ state: 'conflict', message: 'Data di cloud dan di perangkat ini sama-sama berubah. Pilih data yang dipakai.' });
    }
    function fail(e) {
        if (isNetworkError(e)) {
            set({ state: 'offline', message: 'Menunggu koneksi internet…' });
            scheduleRetry(15000);
        } else {
            set({ state: 'error', message: friendlyError(e) });
            scheduleRetry(60000);
        }
    }
    function scheduleRetry(ms) {
        cancel(retryTimer);
        const token = sessionToken;
        retryTimer = later(() => { if (token === sessionToken && uid && status.state !== 'conflict') reconcile(); }, ms);
    }

    async function onUser(user) {
        sessionToken++;
        if (unsub) { try { unsub(); } catch (e) { /* */ } unsub = null; }
        cancel(timer); cancel(retryTimer);
        if (!user) { uid = null; set({ ready: true, user: null, state: 'signedout', message: '' }); return; }
        ensureDeviceId();
        uid = user.uid;
        set({ ready: true, user: { uid: user.uid, email: user.email || '' }, state: 'syncing', message: '' });
        let m = loadMeta();
        if (m.uid !== uid) {                 // perangkat ini belum pernah disinkronkan dengan akun ini
            m = { uid, lastSyncAt: 0, dirty: hasLocal(), localRev: m.localRev || 0, deviceId };
            saveMeta(m);
        }
        await reconcile();
        if (uid === user.uid) startSub();
    }

    async function reconcile() {
        if (!uid) return;
        const token = sessionToken;
        try {
            const cloud = await backend.getMeta(uid);
            if (token !== sessionToken) return;
            const m = loadMeta();
            if (!cloud) {
                if (hasLocal()) { m.dirty = true; saveMeta(m); return await push(); }
                return setSynced(m);
            }
            if (cloud.updatedAt === m.lastSyncAt) return m.dirty ? await push() : setSynced(m);
            if (cloud.updatedAt < m.lastSyncAt && hasLocal()) {      // cloud pernah direset: kirim ulang data lokal
                m.lastSyncAt = cloud.updatedAt; m.dirty = true; saveMeta(m);
                return await push();
            }
            if (!hasLocal() || !m.dirty) return await pull();
            return setConflict();
        } catch (e) { fail(e); }
    }

    async function pull() {
        const token = sessionToken;
        set({ state: 'syncing', message: '' });
        const r = await backend.readAll(uid);
        if (token !== sessionToken) return;
        if (!r) { setSynced(loadMeta()); return; }
        const current = storage.getItem(STORE_KEY);
        if (current !== null) { try { storage.setItem(SAFE_KEY, current); } catch (e) { /* abaikan */ } }
        if (!applyState(r.text)) { set({ state: 'error', message: 'Data di cloud tidak dapat dibaca.' }); return; }
        const m = loadMeta();
        m.uid = uid; m.lastSyncAt = r.meta.updatedAt; m.dirty = false; saveMeta(m);
        setSynced(m, 'Data terbaru dimuat dari cloud.');
    }

    async function push() {
        if (!uid) return;
        if (pushing) { queued = true; return; }
        pushing = true;
        const token = sessionToken;
        try {
            set({ state: 'syncing', message: '' });
            const text = storage.getItem(STORE_KEY);
            if (text === null) { setSynced(loadMeta()); return; }
            const m = loadMeta();
            const revAtStart = m.localRev || 0;
            const base = m.lastSyncAt || 0;
            const updatedAt = Math.max(now(), base + 1);
            const chunks = splitText(text);
            const res = await backend.write(uid, base, { updatedAt, device: deviceId, chunks: chunks.length, size: text.length }, chunks);
            if (token !== sessionToken) return;
            if (res === 'conflict') { setConflict(); return; }
            const m2 = loadMeta();
            m2.uid = uid; m2.lastSyncAt = updatedAt;
            m2.dirty = (m2.localRev || 0) !== revAtStart;
            saveMeta(m2);
            if (m2.dirty) { set({ state: 'dirty', lastSyncAt: updatedAt, message: '' }); queued = true; }
            else setSynced(m2);
        } catch (e) { fail(e); }
        finally {
            pushing = false;
            if (queued && uid && status.state !== 'conflict') { queued = false; later(() => push(), 400); } else queued = false;
        }
    }

    function localChanged() {
        if (!uid || status.state === 'conflict') return;
        set({ state: 'dirty', message: '' });
        cancel(timer);
        timer = later(() => push(), 2000);
    }

    function startSub() {
        if (!uid || unsub) return;
        const token = sessionToken;
        unsub = backend.subscribe(uid, meta => {
            if (token !== sessionToken || !meta) return;
            const m = loadMeta();
            if (meta.device === deviceId) return;                 // perubahan dari perangkat ini sendiri
            if (meta.updatedAt <= (m.lastSyncAt || 0)) return;
            if (pushing || status.state === 'conflict') return;
            if (m.dirty) { setConflict(); return; }
            pull().catch(fail);
        }, e => fail(e));
    }

    async function resolveConflict(choice) {
        if (!uid) return;
        try {
            if (choice === 'cloud') { await pull(); }
            else {
                const cloud = await backend.getMeta(uid);
                const m = loadMeta();
                m.lastSyncAt = cloud ? cloud.updatedAt : 0; m.dirty = true; saveMeta(m);
                await push();
            }
        } catch (e) { fail(e); }
    }

    return {
        subscribe(fn) { subs.add(fn); try { fn({ ...status }); } catch (e) { /* */ } return () => subs.delete(fn); },
        getStatus: () => ({ ...status }),
        onUser, reconcile, localChanged, resolveConflict,
        syncNow: () => reconcile(),
        _debug: () => ({ uid, pushing, meta: loadMeta() }),
    };
}

/* ---------- adaptor Firebase ---------- */
async function boot() {
    const cfg = window.FIREBASE_CONFIG;
    const ls = window.localStorage;

    if (!cfg || !cfg.apiKey || !cfg.projectId) {
        window.cloudSync = {
            configured: false,
            subscribe(fn) { fn({ configured: false, ready: true, user: null, state: 'off', message: '' }); return () => { }; },
            getStatus: () => ({ configured: false, ready: true, user: null, state: 'off', message: '' }),
            localChanged() { }, syncNow() { }, resolveConflict() { },
            async signIn() { throw new Error('Sinkron online belum diaktifkan.'); }, async signUp() { throw new Error('Sinkron online belum diaktifkan.'); },
            async signOut() { }, async resetPassword() { throw new Error('Sinkron online belum diaktifkan.'); },
        };
        window.dispatchEvent(new Event('cloudsync-ready'));
        return;
    }

    const base = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/`;
    let fb;
    try {
        const [appM, authM, fsM] = await Promise.all([
            import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')]);
        fb = { ...appM, ...authM, ...fsM };
    } catch (e) {
        // Belum pernah termuat & sedang offline: tetap pakai data lokal, coba lagi nanti.
        window.cloudSync = {
            configured: true,
            subscribe(fn) { fn({ configured: true, ready: true, user: null, state: 'offline', message: 'Tidak dapat memuat layanan online. Periksa koneksi lalu muat ulang.' }); return () => { }; },
            getStatus: () => ({ configured: true, ready: true, user: null, state: 'offline', message: '' }),
            localChanged() { }, syncNow() { }, resolveConflict() { },
            async signIn() { throw new Error('Layanan online belum termuat. Periksa koneksi internet.'); }, async signUp() { throw new Error('Layanan online belum termuat. Periksa koneksi internet.'); },
            async signOut() { }, async resetPassword() { throw new Error('Layanan online belum termuat.'); },
        };
        window.dispatchEvent(new Event('cloudsync-ready'));
        return;
    }

    const app = fb.initializeApp(cfg);
    const auth = fb.getAuth(app);
    const db = fb.getFirestore(app);
    const metaRef = uid => fb.doc(db, 'users', uid);
    const chunkRef = (uid, i) => fb.doc(db, 'users', uid, 'chunks', 'c' + String(i).padStart(4, '0'));

    const backend = {
        async getMeta(uid) { const s = await fb.getDoc(metaRef(uid)); return s.exists() ? s.data() : null; },
        async readAll(uid) {
            for (let attempt = 0; attempt < 3; attempt++) {
                const meta = await backend.getMeta(uid);
                if (!meta) return null;
                const snap = await fb.getDocs(fb.collection(db, 'users', uid, 'chunks'));
                const parts = snap.docs.map(d => d.data()).filter(d => d.v === meta.updatedAt).sort((a, b) => a.i - b.i);
                if (parts.length === meta.chunks) return { meta, text: parts.map(p => p.t).join('') };
                await new Promise(r => setTimeout(r, 600));          // data sedang ditulis perangkat lain, coba lagi
            }
            throw new Error('Data cloud belum konsisten, coba lagi sebentar.');
        },
        async write(uid, baseUpdatedAt, meta, chunks) {
            return fb.runTransaction(db, async tx => {
                const cur = await tx.get(metaRef(uid));
                if (cur.exists() && cur.data().updatedAt > baseUpdatedAt) return 'conflict';
                tx.set(metaRef(uid), meta);
                chunks.forEach((t, i) => tx.set(chunkRef(uid, i), { i, v: meta.updatedAt, t }));
                const oldN = cur.exists() ? (cur.data().chunks || 0) : 0;
                for (let i = chunks.length; i < oldN; i++) tx.delete(chunkRef(uid, i));
                return 'ok';
            });
        },
        subscribe(uid, cb, onErr) {
            return fb.onSnapshot(metaRef(uid), s => cb(s.exists() ? s.data() : null), onErr);
        },
    };

    const engine = createEngine({
        storage: ls,
        backend,
        applyState(text) {
            if (typeof window.__applyRemoteState === 'function') return window.__applyRemoteState(text);
            try { JSON.parse(text); ls.setItem(STORE_KEY, text); return true; } catch (e) { return false; }   // aplikasi belum tampil: dibaca saat mulai
        },
    });

    const wrap = fn => async (...a) => { try { return await fn(...a); } catch (e) { throw new Error(friendlyError(e)); } };
    window.cloudSync = {
        configured: true,
        subscribe: engine.subscribe, getStatus: engine.getStatus,
        localChanged: engine.localChanged, syncNow: engine.syncNow, resolveConflict: engine.resolveConflict,
        signIn: wrap((email, pw) => fb.signInWithEmailAndPassword(auth, email.trim(), pw)),
        signUp: wrap((email, pw) => fb.createUserWithEmailAndPassword(auth, email.trim(), pw)),
        signOut: wrap(() => fb.signOut(auth)),
        resetPassword: wrap(email => fb.sendPasswordResetEmail(auth, email.trim())),
    };
    window.dispatchEvent(new Event('cloudsync-ready'));

    fb.onAuthStateChanged(auth, user => { engine.onUser(user ? { uid: user.uid, email: user.email } : null); });
    window.addEventListener('online', () => engine.syncNow());
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') engine.syncNow(); });
}

if (typeof window !== 'undefined' && !window.__SYNC_TEST) { boot(); }
