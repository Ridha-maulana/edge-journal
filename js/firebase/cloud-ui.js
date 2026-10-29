/* Tampilan login dan kartu Sinkron online (memakai cloud-sync.js) */
"use strict";
async function cleanReload() {
    try { const rs = await navigator.serviceWorker.getRegistrations(); await Promise.all(rs.map(r => r.unregister())); } catch (e) { }
    try { const ks = await caches.keys(); await Promise.all(ks.map(k => caches.delete(k))); } catch (e) { }
    location.reload();
}
function markSignedOut() {
    try { localStorage.removeItem('edge-auth-hint'); } catch (e) { }
    try { sessionStorage.removeItem('edge-gate-skip'); } catch (e) { }
    try { window.dispatchEvent(new Event('edge-gate-reset')); } catch (e) { }
}
/* Halaman masuk di awal aplikasi. Hanya aktif jika Firebase sudah dikonfigurasi.
   Sudah masuk -> langsung ke aplikasi (tanpa menunggu). Muncul lagi hanya setelah Keluar manual di kartu Sinkron online. */
function AuthGate({ children }) {
    const cfg = window.FIREBASE_CONFIG;
    const configured = !!(cfg && cfg.apiKey && cfg.projectId);
    const readHint = () => { try { return localStorage.getItem('edge-auth-hint') === '1'; } catch (e) { return false; } };
    const [hint0, setHint0] = useState(readHint);
    const [st, setSt] = useState(() => (window.cloudSync && window.cloudSync.getStatus()) || null);
    const [skip, setSkip] = useState(() => { try { return sessionStorage.getItem('edge-gate-skip') === '1'; } catch (e) { return false; } });
    const [entered, setEntered] = useState(false);
    const [late, setLate] = useState(false);
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');

    let view = 'app';
    if (configured && !skip) {
        if (!st) view = hint0 || late ? 'app' : 'check';
        else if (st.user) {
            if (entered || hint0 || late) view = 'app';
            else if (st.state === 'conflict') view = 'conflict';
            else if (st.state === 'syncing') view = 'check';
        }
        else if (!st.ready) view = hint0 ? 'app' : (late ? 'login' : 'check');
        else if (hint0 && st.state === 'offline') view = 'app';
        else view = 'login';
    }
    const hasUser = !!(st && st.user);

    useEffect(() => {
        if (!configured) return;
        let off = null, t = null, tries = 0;
        const attach = () => { if (window.cloudSync) off = window.cloudSync.subscribe(setSt); else if (tries++ < 30) t = setTimeout(attach, 200); else setLate(true); };
        attach();
        return () => { if (off) off(); clearTimeout(t); };
    }, []);
    useEffect(() => {
        const f = () => setSkip(false);
        window.addEventListener('edge-gate-reset', f);
        return () => window.removeEventListener('edge-gate-reset', f);
    }, []);
    useEffect(() => { if (hasUser) { try { localStorage.setItem('edge-auth-hint', '1'); } catch (e) { } } }, [hasUser]);
    useEffect(() => {
        if (view === 'app' && hasUser) setEntered(true);
        if (view === 'login') { setEntered(false); setHint0(false); }
    }, [view, hasUser]);
    useEffect(() => {
        if (view !== 'check') return;
        const t = setTimeout(() => setLate(true), 8000);
        return () => clearTimeout(t);
    }, [view]);
    useEffect(() => { if (view !== 'app' && window.__hideSplash) window.__hideSplash(); }, [view]);

    if (view === 'app') return children;

    const cs = window.cloudSync;
    async function run(fn) {
        setBusy(true); setMsg('');
        try { await fn(); } catch (e) { setMsg((e && e.message) || 'Terjadi kesalahan.'); }
        setBusy(false);
    }
    const heroBrand = React.createElement("div", { className: "gate-hero" },
        React.createElement("div", { className: "gate-hero-brand" },
            React.createElement("div", { className: "gate-hero-mark" }, React.createElement(Zap, { size: 26 })),
            React.createElement("div", null, React.createElement("strong", null, "EDGE JOURNAL"), React.createElement("span", null, "TRADING LOGBOOK"))));
    const brand = React.createElement("div", { className: "gate-brand" },
        React.createElement("div", { className: "gate-mark" }, React.createElement(Zap, { size: 30 })),
        React.createElement("div", null, React.createElement("strong", null, "EDGE JOURNAL"), React.createElement("span", null, "TRADING LOGBOOK")));
    if (view === 'check') return React.createElement("div", { className: "gate" }, brand,
        React.createElement("p", { className: "gate-note" }, st && st.user ? 'Menyinkronkan data…' : 'Memeriksa akun…'));
    if (view === 'conflict') return React.createElement("div", { className: "gate" }, brand,
        React.createElement("div", { className: "gate-box" },
            React.createElement("h1", null, "Pilih data yang dipakai"),
            React.createElement("p", null, "Perangkat ini dan cloud sama-sama sudah memiliki data jurnal yang berbeda. Pilih salah satu."),
            React.createElement("button", { className: "gate-btn", onClick: () => { if (window.confirm('Data di perangkat ini akan diganti dengan data cloud. Versi perangkat ini disimpan sebagai cadangan lokal. Lanjutkan?')) run(() => cs.resolveConflict('cloud')); } }, "Pakai data cloud"),
            React.createElement("button", { className: "gate-sec", style: { width: '100%', marginTop: 10 }, onClick: () => { if (window.confirm('Data di cloud akan diganti dengan data perangkat ini. Lanjutkan?')) run(() => cs.resolveConflict('local')); } }, "Pakai data perangkat ini"),
            msg && React.createElement("p", { className: "gate-err" }, msg)));
    const err = msg || (st && st.state === 'offline' && st.message) || '';
    return React.createElement("div", { className: "gate gate-art" }, heroBrand,
        React.createElement("form", { className: "gate-box", onSubmit: e => { e.preventDefault(); if (email && pw) run(() => cs.signIn(email, pw)); } },
            React.createElement("h1", null, "Masuk"),
            React.createElement("p", null, "Data jurnal tersimpan online di akun Anda dan otomatis muncul di perangkat mana pun."),
            React.createElement("label", null, "Email",
                React.createElement("input", { type: "email", name: "email", autoComplete: "username", inputMode: "email", value: email, onChange: e => setEmail(e.target.value), placeholder: "email@anda.com" })),
            React.createElement("label", null, "Password",
                React.createElement("input", { type: "password", name: "password", autoComplete: "current-password", value: pw, onChange: e => setPw(e.target.value), placeholder: "Password" })),
            err && React.createElement("p", { className: "gate-err" }, err),
            React.createElement("button", { className: "gate-btn", type: "submit", disabled: busy || !email || !pw }, busy ? 'Memproses…' : 'Masuk'),
            React.createElement("div", { className: "gate-row" },
                React.createElement("button", { className: "gate-sec", type: "button", disabled: busy || !email || !pw, onClick: () => run(() => cs.signUp(email, pw)) }, "Daftar baru"),
                React.createElement("button", { className: "gate-sec", type: "button", disabled: busy || !email, onClick: () => run(async () => { await cs.resetPassword(email); setMsg('Email reset password dikirim. Periksa kotak masuk/spam.'); }) }, "Lupa password")),
            React.createElement("button", { className: "gate-link", type: "button", onClick: () => { try { sessionStorage.setItem('edge-gate-skip', '1'); } catch (e) { } setSkip(true); } }, "Lanjut tanpa masuk (data hanya di perangkat ini)")));
}
function CloudSyncCard() {
    const [st, setSt] = useState(() => (window.cloudSync && window.cloudSync.getStatus()) || null);
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');
    useEffect(() => {
        let off = null, t = null, tries = 0;
        const attach = () => { if (window.cloudSync) off = window.cloudSync.subscribe(setSt); else if (tries++ < 80) t = setTimeout(attach, 300); };
        attach();
        return () => { if (off) off(); clearTimeout(t); };
    }, []);
    async function run(fn, okMsg) {
        setBusy(true); setMsg('');
        try { await fn(); if (okMsg) setMsg(okMsg); } catch (e) { setMsg((e && e.message) || 'Terjadi kesalahan.'); }
        setBusy(false);
    }
    const cs = window.cloudSync;
    const head = React.createElement("div", { className: "tool-head" },
        React.createElement("div", { className: "tool-icon green" }, React.createElement(Cloud, null)),
        React.createElement("div", null,
            React.createElement("h2", null, "Sinkron online"),
            React.createElement("p", null, "Data tersimpan di akun Anda dan bisa dibuka dari browser atau HP mana pun.")));
    if (!st) return React.createElement("div", { className: "tool-card" }, head, React.createElement("p", { className: "sync-note" }, "Memuat layanan online…"));
    if (!st.configured) {
        const fc = window.FIREBASE_CONFIG;
        const rows = [
            ['Alamat halaman', location.origin + location.pathname],
            ['firebase-config.js', fc ? 'terbaca' : 'TIDAK terbaca (diblokir / tidak ditemukan / cache lama)'],
            ['apiKey', fc && fc.apiKey ? 'terisi' : 'KOSONG'],
            ['projectId', fc && fc.projectId ? 'terisi' : 'KOSONG'],
            ['Versi aplikasi', APP_VERSION]
        ];
        return React.createElement("div", { className: "tool-card" }, head,
            React.createElement("p", { className: "sync-note" }, "Belum aktif di browser ini. Penyebab umum: file lama masih tersimpan di cache browser, atau alamat halaman ini berbeda dengan alamat yang sudah diisi Firebase."),
            React.createElement("div", { className: "sync-diag" }, rows.map(r => React.createElement("div", { key: r[0] }, React.createElement("span", null, r[0]), React.createElement("b", null, r[1])))),
            React.createElement("div", { className: "button-row" },
                React.createElement("button", { className: "secondary-btn", onClick: cleanReload }, "Muat ulang bersih")),
            React.createElement("p", { className: "sync-note" }, "Tombol ini hanya membersihkan cache aplikasi. Data jurnal tidak dihapus."));
    }
    const time = st.lastSyncAt ? new Date(st.lastSyncAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':') : '';
    const label = { synced: 'Tersinkron' + (time ? ' · ' + time : ''), syncing: 'Menyinkronkan…', dirty: 'Perubahan menunggu dikirim…', offline: 'Offline — dikirim saat online', conflict: 'Perlu pilihan Anda', error: 'Gagal sinkron' }[st.state] || '';
    if (!st.user) return React.createElement("div", { className: "tool-card" }, head,
        React.createElement("div", { className: "calc-grid compact-calc" },
            React.createElement("label", null, "Email",
                React.createElement("input", { type: "email", autoComplete: "username", inputMode: "email", value: email, onChange: e => setEmail(e.target.value), placeholder: "email@anda.com" })),
            React.createElement("label", null, "Password",
                React.createElement("input", { type: "password", autoComplete: "current-password", value: pw, onChange: e => setPw(e.target.value), placeholder: "minimal 6 karakter" }))),
        React.createElement("div", { className: "button-row" },
            React.createElement("button", { className: "secondary-btn", disabled: busy || !email || !pw, onClick: () => run(() => cs.signIn(email, pw)) }, busy ? 'Memproses…' : 'Masuk'),
            React.createElement("button", { className: "secondary-btn", disabled: busy || !email || !pw, onClick: () => run(() => cs.signUp(email, pw)) }, "Daftar"),
            React.createElement("button", { className: "secondary-btn", disabled: busy || !email, onClick: () => run(() => cs.resetPassword(email), 'Email reset password dikirim. Periksa kotak masuk/spam.') }, "Lupa password")),
        (msg || st.message) && React.createElement("p", { className: "sync-note warn" }, msg || st.message));
    return React.createElement("div", { className: "tool-card" }, head,
        React.createElement("p", { className: "sync-note" }, "Masuk sebagai ", React.createElement("strong", null, st.user.email)),
        React.createElement("p", { className: "sync-note" }, "Alamat aplikasi: ", React.createElement("strong", null, location.origin + location.pathname)),
        React.createElement("p", { className: 'sync-status ' + st.state }, label),
        st.state === 'conflict' && React.createElement("div", { className: "sync-conflict" },
            React.createElement("p", null, st.message),
            React.createElement("div", { className: "button-row" },
                React.createElement("button", { className: "secondary-btn", onClick: () => { if (window.confirm('Data di perangkat ini akan diganti dengan data cloud. Versi perangkat ini disimpan sebagai cadangan lokal. Lanjutkan?')) run(() => cs.resolveConflict('cloud')); } }, "Pakai data cloud"),
                React.createElement("button", { className: "secondary-btn", onClick: () => { if (window.confirm('Data di cloud akan diganti dengan data perangkat ini. Lanjutkan?')) run(() => cs.resolveConflict('local')); } }, "Pakai data perangkat ini"))),
        (st.state === 'error' || st.state === 'offline') && st.message && React.createElement("p", { className: "sync-note warn" }, st.message),
        msg && React.createElement("p", { className: "sync-note warn" }, msg),
        React.createElement("div", { className: "button-row" },
            React.createElement("button", { className: "secondary-btn", disabled: busy || st.state === 'conflict', onClick: () => run(() => cs.syncNow()) }, "Sinkronkan sekarang"),
            React.createElement("button", { className: "secondary-btn", disabled: busy, onClick: () => run(() => { markSignedOut(); return cs.signOut(); }) }, "Keluar")));
}
