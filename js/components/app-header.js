/* Header atas aplikasi — 9 gaya (standar + 8 desain baru), dipilih di Profil → Tampilan header */
"use strict";
const HEADER_KEY = 'ej3-header';
const HEADER_LIST = [[0, 'Standar (lama)'], [1, 'Minimal satu baris'], [2, 'Bilah kaca'], [3, 'Akun jadi judul'], [5, 'Saldo di pil akun'], [6, 'Banner gradasi'], [7, 'Status sinkron'], [9, 'Kartu mengambang'], [10, 'Strip tanggal']].concat(TPL_HEADER_LIST);
function headerVariantGet() { try {
    const v = localStorage.getItem(HEADER_KEY);
    return v !== null && /^\d+$/.test(v) && HEADER_LIST.some(x => x[0] === Number(v)) ? Number(v) : 0;
}
catch (_) {
    return 0;
} }
function headerVariantSet(v) { try {
    localStorage.setItem(HEADER_KEY, String(v));
}
catch (_) { } }
/* status sinkron awan -> teks pendek */
function useSyncText() {
    const [st, setSt] = useState(() => (window.cloudSync && window.cloudSync.getStatus && window.cloudSync.getStatus()) || null);
    const [, tick] = useState(0);
    useEffect(() => {
        let off = null, t = null, tries = 0;
        const attach = () => { if (window.cloudSync && window.cloudSync.subscribe)
            off = window.cloudSync.subscribe(setSt);
        else if (tries++ < 80)
            t = setTimeout(attach, 300); };
        attach();
        const iv = setInterval(() => tick(n => n + 1), 30000);
        return () => { if (off)
            off(); clearTimeout(t); clearInterval(iv); };
    }, []);
    if (!st || st.state === 'off' || st.state === 'signedout' || !st.user)
        return { ok: false, text: 'Tersimpan lokal' };
    if (st.state === 'offline')
        return { ok: false, text: 'Offline' };
    if (st.state === 'conflict')
        return { ok: false, text: 'Data berbeda' };
    if (st.state === 'dirty' || st.state === 'syncing')
        return { ok: true, text: 'Menyinkronkan…' };
    const ago = st.lastSyncAt ? Math.max(0, Math.round((Date.now() - st.lastSyncAt) / 60000)) : null;
    return { ok: true, text: 'Tersinkron · ' + (ago === null || ago < 1 ? 'baru saja' : ago < 60 ? ago + ' mnt lalu' : ago < 1440 ? Math.round(ago / 60) + ' jam lalu' : Math.round(ago / 1440) + ' hari lalu') };
}
function headerSession() { const h = wib(new Date()).hour; return h >= 6 && h < 12 ? 'Asia' : h >= 12 && h < 20 ? 'London' : 'New York'; }
function AppHeader(props) { const v = Number(props.variant) || 0; return v >= 11 && v <= 16 ? React.createElement(TplHeader, { n: v - 10, account: props.account, onCalendar: props.onCalendar, onAccount: props.onAccount }) : React.createElement(AppHeaderClassic, props); }
function AppHeaderClassic({ variant, account, onCalendar, onAccount }) {
    const v = Number(variant) || 0;
    const sync = useSyncText();
    const name = account.name, initial = (name || '?').trim().charAt(0).toUpperCase();
    const h = React.createElement;
    const logo = (extra) => h("div", { className: "brand-mark" }, h(Zap, { size: 18 }));
    const brand = (withTag, text) => h("div", { className: "brand" }, logo(), h("div", null, h("strong", null, text || 'EDGE JOURNAL'), withTag === 'sync' ? h("span", { className: "hd-sync" + (sync.ok ? ' ok' : '') }, h("i", { className: "hd-dot" }), sync.text) : withTag === false ? null : h("span", null, "TRADING LOGBOOK")));
    const cal = h("button", { className: "header-icon", onClick: onCalendar, "aria-label": "Buka kalender" }, h(CalendarDays, { size: 17 }));
    const av = h("span", { className: "hd-av" }, initial);
    const acc = (kids, cls) => h("button", { className: "account-switcher" + (cls ? ' ' + cls : ''), onClick: onAccount, "aria-label": "Account management" }, kids);
    const chev = h(ChevronDown, { size: 13 });
    const nameEl = h("span", { className: "acc-name" }, name);
    const wrap = (cls, kids) => h("header", { className: "topbar hd-v" + v + (cls ? ' ' + cls : '') }, kids);
    switch (v) {
        case 1: return wrap('', [h("div", { className: "brand hd-name", key: 'b' }, logo(), h("strong", null, "Edge Journal")), h("div", { className: "top-actions", key: 'r' }, cal, acc([h("i", { className: "hd-dot", key: 'd' }), nameEl, chev]))]);
        case 2: return wrap('', [brand(true), h("div", { className: "top-actions", key: 'r' }, cal, acc([av, nameEl, chev]))]);
        case 3: return wrap('', [h("button", { className: "hd-acct-title", key: 't', onClick: onAccount, "aria-label": "Account management" }, h("small", null, "AKUN AKTIF · " + account.currency), h("span", null, h("strong", null, name), chev)), h("div", { className: "top-actions", key: 'r' }, cal, logo())]);
        case 5: return wrap('', [brand(true), h("div", { className: "top-actions", key: 'r' }, cal, acc([h("span", { className: "hd-two", key: 'n' }, h("span", { className: "acc-name" }, name), h("em", null, money(acctNowBal(account), account.currency))), chev]))]);
        case 6: return wrap('', [brand(true), h("div", { className: "top-actions", key: 'r' }, cal, acc([h(UserRound, { size: 15, key: 'u' }), nameEl, chev]))]);
        case 7: return wrap('', [brand('sync'), h("div", { className: "top-actions", key: 'r' }, cal, acc([av, nameEl]))]);
        case 9: return wrap('', h("div", { className: "hd-card" }, brand(true), h("div", { className: "top-actions" }, cal, h("i", { className: "hd-sep" }), acc([av, chev]))));
        case 10: return wrap('', [h("div", { className: "hd-row", key: 'a' }, brand(true), acc([h(UserRound, { size: 15, key: 'u' }), nameEl, chev])), h("div", { className: "hd-strip", key: 'b' }, h("button", { onClick: onCalendar }, h(CalendarDays, { size: 14 }), " " + new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })), h("span", { className: "hd-ses" }, h("i", { className: "hd-dot" }), "Sesi aktif: ", h("b", null, headerSession())))]);
        default: return h("header", { className: "topbar" }, h("div", { className: "brand" }, logo(), h("div", null, h("strong", null, "EDGE JOURNAL"), h("span", null, "TRADING LOGBOOK"))), h("div", { className: "top-actions" }, cal, acc([h(UserRound, { size: 15, key: 'u' }), nameEl, chev])));
    }
}
/* kartu pemilih di Profil */
function HeaderPicker({ value, onChange }) {
    return React.createElement(PickRow, { icon: React.createElement(UserRound, { size: 18 }), title: "Tampilan header", desc: "Gaya header atas, hanya di halaman utama", value: value, options: HEADER_LIST.map(x => ({ v: x[0], l: x[1] })), onChange: onChange });
}
