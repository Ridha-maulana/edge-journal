/* Tampilan Alarm (v5.9.93): baris di Tools, daftar alarm, lembar Tambah/Ubah alarm, layar alarm berbunyi */
"use strict";
(function () {
    const h = React.createElement, A = window.EJAlarm;
    if (!A) return;
    const P = (d) => [["path", { d }]];
    ICONS.AlAlarm = [["circle", { cx: 12, cy: 13, r: 8 }], ["path", { d: "M12 9v4l2.5 2" }], ["path", { d: "M5 3 2 6" }], ["path", { d: "m19 3 3 3" }]];
    ICONS.AlRepeat = [["path", { d: "m17 2 4 4-4 4" }], ["path", { d: "M3 11v-1a4 4 0 0 1 4-4h14" }], ["path", { d: "m7 22-4-4 4-4" }], ["path", { d: "M21 13v1a4 4 0 0 1-4 4H3" }]];
    ICONS.AlVib = [["path", { d: "M2 8v8" }], ["path", { d: "M5 6v12" }], ["path", { d: "M22 8v8" }], ["path", { d: "M19 6v12" }], ["rect", { x: 8, y: 3, width: 8, height: 18, rx: 2 }]];
    ICONS.AlMusic = [["path", { d: "M9 18V5l12-2v13" }], ["circle", { cx: 6, cy: 18, r: 3 }], ["circle", { cx: 18, cy: 16, r: 3 }]];
    ICONS.AlPlay = [["path", { d: "M6 4l14 8-14 8z" }]];
    ICONS.AlTag = [["path", { d: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8Z" }], ["circle", { cx: 7, cy: 7, r: 1.2 }]];
    ICONS.AlCheck = P("M20 6 9 17l-5-5");
    ICONS.AlBack = P("m15 18-6-6 6-6");
    ICONS.AlTrash = [["path", { d: "M3 6h18" }], ["path", { d: "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" }], ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }]];
    ICONS.AlPlus = P("M12 5v14M5 12h14");
    ICONS.AlMinus = P("M5 12h14");
    ICONS.AlTrash2 = ICONS.AlTrash;
    function toast(msg) {
        const t = document.createElement('div'); t.className = 'al-toast'; t.setAttribute('role', 'status'); t.textContent = msg;
        document.body.appendChild(t); setTimeout(() => t.classList.add('out'), 2800); setTimeout(() => t.remove(), 3300);
    }
    const ic = (n, s, w) => h(Icon, { name: n, size: s || 18, strokeWidth: w || 1.8 });
    const useNow = (ms) => { const [, set] = useState(0); useEffect(() => { const t = setInterval(() => set(x => x + 1), ms); return () => clearInterval(t); }, []); };
    const useAlarms = () => { const [, set] = useState(0); useEffect(() => A.subscribe(() => set(x => x + 1)), []); };
    function Switch({ on, onChange, label }) {
        return h("button", { type: "button", role: "switch", "aria-checked": !!on, "aria-label": label, className: "al-tg" + (on ? " on" : ""), onClick: e => { e.stopPropagation(); onChange(!on); } }, h("i", null));
    }
    /* Roda geser (jam / menit) */
    function Wheel({ n, value, onChange, label }) {
        const ref = useRef(null), cur = useRef(value), H = 44;
        useEffect(() => { if (ref.current) ref.current.scrollTop = value * H; }, []);
        useEffect(() => { if (cur.current !== value) { cur.current = value; if (ref.current) ref.current.scrollTop = value * H; } }, [value]);
        const onScroll = () => {
            const el = ref.current; if (!el) return;
            const v = Math.min(n - 1, Math.max(0, Math.round(el.scrollTop / H)));
            if (v !== cur.current) { cur.current = v; onChange(v); }
        };
        const items = [];
        for (let i = 0; i < n; i++) {
            const d = Math.abs(i - value);
            items.push(h("button", { type: "button", key: i, tabIndex: -1, className: "al-wi " + (d === 0 ? "s" : d === 1 ? "n" : "f"), onClick: () => { if (ref.current) ref.current.scrollTo({ top: i * H, behavior: 'smooth' }); } }, A.pad(i)));
        }
        return h("div", { className: "al-wcol" },
            h("small", null, label),
            h("div", { className: "al-wheel", ref: ref, onScroll: onScroll, role: "listbox", "aria-label": label },
                h("div", { className: "al-sp" }), items, h("div", { className: "al-sp" })));
    }
    const sameSet = (a, b) => a.length === b.length && a.every(x => b.indexOf(x) >= 0);
    function repeatKind(a) {
        if (a.repeat === 'once') return 'once';
        const d = a.days || [];
        if (d.length === 7) return 'daily';
        if (sameSet(d, [1, 2, 3, 4, 5])) return 'wd';
        return 'custom';
    }
    function RepeatPage({ a, set, onBack }) {
        const k = repeatKind(a);
        const pick = kind => set(kind === 'once' ? { repeat: 'once' } : { repeat: 'days', days: kind === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5] });
        const opt = (kind, text, extra) => h("button", { type: "button", key: kind, className: "al-op" + (k === kind ? " sel" : ""), onClick: () => pick(kind) }, h("b", null, text), k === kind && ic("AlCheck", 18, 2.4), extra);
        const toggleDay = d => {
            const cur = a.repeat === 'once' ? [] : (a.days || []).slice();
            const i = cur.indexOf(d);
            if (i >= 0) cur.splice(i, 1); else cur.push(d);
            set(cur.length ? { repeat: 'days', days: cur } : { repeat: 'once' });
        };
        return h(React.Fragment, null,
            h("div", { className: "al-sh" },
                h("button", { type: "button", className: "al-ib", "aria-label": "Kembali", onClick: onBack }, ic("AlBack", 22, 2)),
                h("div", { className: "al-shc" }, h("b", null, "Ulangi")),
                h("span", { className: "al-ib ph" })),
            h("div", { className: "al-sbody" },
                h("div", { className: "al-grp" }, opt('once', 'Sekali'), opt('daily', 'Harian'), opt('wd', 'Sen sampai Jum'), opt('custom', 'Kustomisasi')),
                h("div", { className: "al-cap" }, "Pilih hari"),
                h("div", { className: "al-grp" }, A.ORDER.map(d => {
                    const on = a.repeat !== 'once' && (a.days || []).indexOf(d) >= 0;
                    return h("button", { type: "button", key: d, className: "al-op", role: "checkbox", "aria-checked": on, onClick: () => toggleDay(d) }, h("b", null, A.DN[d]), h("span", { className: "al-ck" + (on ? " on" : "") }, on && ic("AlCheck", 13, 3)));
                }))));
    }
    function TonePage({ a, set, onBack }) {
        const cur = a.tone || 'klasik';
        const ids = A.TONE_IDS.concat(A.isEj ? ['sistem'] : []);
        return h(React.Fragment, null,
            h("div", { className: "al-sh" },
                h("button", { type: "button", className: "al-ib", "aria-label": "Kembali", onClick: onBack }, ic("AlBack", 22, 2)),
                h("div", { className: "al-shc" }, h("b", null, "Nada dering")),
                h("span", { className: "al-ib ph" })),
            h("div", { className: "al-sbody" },
                h("div", { className: "al-grp" }, ids.map(id => h("button", { type: "button", key: id, className: "al-op" + (cur === id ? " sel" : ""), role: "radio", "aria-checked": cur === id, onClick: () => { set({ tone: id }); A.preview(id); } },
                    h("b", null, A.toneName(id)),
                    id === 'sistem' && h("small", null, "Nada alarm bawaan HP"),
                    cur === id && ic("AlCheck", 18, 2.4)))),
                h("p", { className: "al-note" }, "Ketuk nada untuk mendengar contohnya." + (A.isEj ? "" : " Nada bawaan HP tersedia di APK terbaru."))));
    }
    function Follow({ f, i, at, sec, open, onOpen, onChange, onDel }) {
        const t = new Date(at + f.min * 60000);
        const tm = A.hm(t.getHours(), t.getMinutes(), sec ? t.getSeconds() : 0);
        const chips = [5, 10, 15, 30, 45, 60];
        return h("div", { className: "al-ti" },
            h("i", { className: "al-dot s" + Math.min(i + 1, 3) }),
            h("div", { className: "al-tc" + (open ? " open" : "") },
                h("button", { type: "button", className: "al-th", onClick: onOpen, "aria-expanded": open },
                    h("span", null, h("b", null, "+" + f.min + " menit · " + tm), h("small", null, f.msg || "Alarm susulan (tanpa pesan)")),
                    h("span", { className: "al-x", role: "button", "aria-label": "Hapus susulan", onClick: e => { e.stopPropagation(); onDel(); } }, ic("AlTrash", 16))),
                open && h("div", { className: "al-fe" },
                    h("small", null, "Bunyi lagi setelah"),
                    h("div", { className: "al-chips" }, chips.map(c => h("button", { type: "button", key: c, className: "al-cp" + (f.min === c ? " on" : ""), onClick: () => onChange({ min: c }) }, c + " mnt"))),
                    h("div", { className: "al-step" },
                        h("button", { type: "button", className: "al-rb", "aria-label": "Kurangi", onClick: () => onChange({ min: Math.max(1, f.min - 1) }) }, ic("AlMinus", 18, 2.2)),
                        h("div", null, h("em", null, f.min), h("small", null, "menit")),
                        h("button", { type: "button", className: "al-rb", "aria-label": "Tambah", onClick: () => onChange({ min: Math.min(720, f.min + 1) }) }, ic("AlPlus", 18, 2.2))),
                    h("label", { className: "al-msg" }, h("small", null, "Pesan"),
                        h("input", { type: "text", maxLength: 80, value: f.msg, placeholder: "Mis. Tutup MT5, waktu analisa habis", onChange: e => onChange({ msg: e.target.value }) })))));
    }
    function AlarmSheet({ initial, onClose, onSaved }) {
        const [a, setA] = useState(() => Object.assign({}, initial, { follows: (initial.follows || []).map(f => Object.assign({}, f)) }));
        const [page, setPage] = useState('main');
        const [open, setOpen] = useState(-1);
        useNow(1000);
        const set = p => setA(x => Object.assign({}, x, p));
        const editing = !!a.id;
        const baseAt = A.nextAt(a.h, a.m, a.s || 0);
        const sub = 'Alarm dalam ' + A.fmtDur(baseAt - Date.now(), (a.s || 0) > 0);
        const setFollow = (i, p) => setA(x => ({ ...x, follows: x.follows.map((f, j) => j === i ? Object.assign({}, f, p) : f) }));
        const addFollow = () => { const last = a.follows.length ? a.follows[a.follows.length - 1].min : 0; setA(x => ({ ...x, follows: x.follows.concat([{ min: last + 5, msg: '' }]) })); setOpen(a.follows.length); };
        const delFollow = i => { setA(x => ({ ...x, follows: x.follows.filter((_, j) => j !== i) })); setOpen(-1); };
        async function ok() {
            let r = { native: false };
            try { r = await A.ensurePermission(); } catch (e) { }
            const o = A.save(a);
            const t = A.occs(o, Date.now(), Date.now() + 8 * 86400000)[0];
            toast(t ? A.fmtDur(t.t - Date.now(), (o.s || 0) > 0) + ' lagi alarm akan berbunyi' : 'Alarm disimpan');
            if (r.native && r.ok === false) setTimeout(() => toast('Izin notifikasi ditolak. Alarm hanya berbunyi saat aplikasi terbuka.'), 3400);
            else if (r.full === false) {
                let seen = false; try { seen = !!localStorage.getItem('ej-al-fs'); localStorage.setItem('ej-al-fs', '1'); } catch (e) { }
                if (!seen) { setTimeout(() => toast('Aktifkan "Layar penuh" agar alarm tampil di layar kunci'), 3400); setTimeout(() => A.openSettings('full'), 5200); }
            }
            onSaved && onSaved(o);
            onClose();
        }
        const [sure, setSure] = useState(false);
        function del() { if (!sure) { setSure(true); setTimeout(() => setSure(false), 4000); return; } A.remove(a.id); onClose(); }
        useEffect(() => { const k = e => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, []);
        const body = page === 'repeat'
            ? h(RepeatPage, { a, set, onBack: () => setPage('main') })
            : page === 'tone'
            ? h(TonePage, { a, set, onBack: () => { A.stopPreview(); setPage('main'); } })
            : h(React.Fragment, null,
                h("div", { className: "al-sh" },
                    h("button", { type: "button", className: "al-ib", "aria-label": "Batal", onClick: onClose }, ic("X", 22, 1.8)),
                    h("div", { className: "al-shc" }, h("b", null, editing ? "Ubah alarm" : "Tambah alarm"), h("small", null, sub)),
                    h("button", { type: "button", className: "al-ib ok", "aria-label": "Simpan alarm", onClick: ok }, ic("AlCheck", 22, 2.2))),
                h("div", { className: "al-sbody" },
                    h("div", { className: "al-wheels" },
                        h(Wheel, { n: 24, value: a.h, onChange: v => set({ h: v }), label: "J" }),
                        h("span", { className: "al-colon" }, ":"),
                        h(Wheel, { n: 60, value: a.m, onChange: v => set({ m: v }), label: "M" }),
                        h("span", { className: "al-colon" }, ":"),
                        h(Wheel, { n: 60, value: a.s || 0, onChange: v => set({ s: v }), label: "D" })),
                    h("div", { className: "al-cap" }, "Alarm susulan"),
                    h("div", { className: "al-tl" },
                        h("div", { className: "al-ti" }, h("i", { className: "al-dot" }), h("div", { className: "al-tc main" }, h("b", null, A.hm(a.h, a.m, a.s)), h("small", null, a.label || "Alarm utama"))),
                        a.follows.map((f, i) => h(Follow, { key: i, f, i, at: baseAt, sec: (a.s || 0) > 0, open: open === i, onOpen: () => setOpen(open === i ? -1 : i), onChange: p => setFollow(i, p), onDel: () => delFollow(i) })),
                        a.follows.length < 6 && h("button", { type: "button", className: "al-add", onClick: addFollow }, ic("AlPlus", 16, 2.2), " Tambah alarm susulan")),
                    h("div", { className: "al-grp" },
                        h("button", { type: "button", className: "al-op", onClick: () => setPage('repeat') }, ic("AlRepeat"), h("b", null, "Ulangi"), h("small", null, A.repeatLabel(a)), ic("ChevronRight", 18, 2)),
                        h("div", { className: "al-op" }, ic("AlVib"), h("b", null, "Getar saat alarm berbunyi"), h(Switch, { on: a.vibrate !== false, onChange: v => set({ vibrate: v }), label: "Getar" })),
                        h("button", { type: "button", className: "al-op", onClick: () => setPage('tone') }, ic("AlMusic"), h("b", null, "Nada dering"), h("small", null, A.toneName(a.tone || 'klasik')), ic("ChevronRight", 18, 2)),
                        a.repeat === 'once' && h("div", { className: "al-op" }, h("span", { className: "al-sp18" }), h("b", null, "Hapus setelah alarm berbunyi"), h(Switch, { on: !!a.del, onChange: v => set({ del: v }), label: "Hapus setelah berbunyi" }))),
                    h("label", { className: "al-op al-lab" }, ic("AlTag"), h("b", null, "Label"), h("input", { type: "text", maxLength: 60, value: a.label, placeholder: "Masukkan label", onChange: e => set({ label: e.target.value }) })),
                    h("p", { className: "al-note" }, A.isEj ? "Alarm berbunyi, bergetar, dan tampil di layar kunci walau aplikasi ditutup." : A.isNative ? "Alarm berbunyi walau aplikasi ditutup. Pasang APK terbaru untuk banner Tunda/Matikan dan layar kunci." : "Versi web: alarm hanya berbunyi selama aplikasi terbuka. Pasang APK terbaru agar tetap berbunyi saat aplikasi ditutup."),
                    editing && h("button", { type: "button", className: "al-del" + (sure ? " sure" : ""), onClick: del }, ic("AlTrash"), sure ? " Ketuk lagi untuk menghapus" : " Hapus alarm")));
        return ReactDOM.createPortal(h("div", { className: "modal-backdrop sheet-layer ap-bs al-bs", onClick: e => { if (e.target === e.currentTarget) onClose(); } },
            h("div", { className: "tsel-sheet ap-bsheet al-sheet", role: "dialog", "aria-modal": "true", "aria-label": editing ? "Ubah alarm" : "Tambah alarm" }, h("div", { className: "al-grab" }), body)), document.body);
    }
    function presets() {
        const offMin = -(new Date().getTimezoneOffset()) - 420;
        return [['Asia', 'Asia open'], ['London', 'London open'], ['New York', 'New York open']].map(([n, l]) => {
            const r = (typeof sesRangeWib === 'function' ? sesRangeWib(n) : '') || '', m = /^(\d\d):(\d\d)/.exec(r);
            if (!m) return null;
            let tot = ((+m[1]) * 60 + (+m[2]) + offMin) % 1440; if (tot < 0) tot += 1440;
            return { label: l, h: Math.floor(tot / 60), m: tot % 60 };
        }).filter(Boolean);
    }
    function AlarmPage({ onClose }) {
        useNow(20000); useAlarms();
        const [sheet, setSheet] = useState(null);
        const list = A.list.slice().sort((x, y) => (x.h * 60 + x.m) - (y.h * 60 + y.m));
        const nx = A.next();
        const nxLabel = nx ? (nx.alarm ? (nx.step === 0 ? (nx.alarm.label || 'Alarm') : (nx.msg || 'Alarm susulan')) : (nx.label || 'Tunda')) : '';
        useEffect(() => { const k = e => { if (e.key === 'Escape' && !sheet) onClose(); }; document.addEventListener('keydown', k); document.body.classList.add('al-open'); return () => { document.removeEventListener('keydown', k); document.body.classList.remove('al-open'); }; }, [sheet]);
        const card = a => {
            const fl = (a.follows || []).slice().sort((x, y) => x.min - y.min);
            return h("div", { key: a.id, className: "al-card" + (a.on ? "" : " off"), role: "button", tabIndex: 0, onClick: () => setSheet(a), onKeyDown: e => { if (e.key === 'Enter') setSheet(a); } },
                h("div", { className: "al-cm" },
                    h("b", { className: "al-time" }, A.hm(a.h, a.m, a.s)),
                    h("small", null, A.repeatLabel(a) + (a.label ? " · " + a.label : "")),
                    fl.length > 0 && h("div", { className: "al-fl" }, fl.map((f, i) => {
                        const t = a.h * 60 + a.m + f.min, tm = A.hm(Math.floor((t % 1440) / 60), t % 60, a.s);
                        return h("span", { key: i }, ic("AlAlarm", 13, 2), tm + (f.msg ? " · " + f.msg : ""));
                    }))),
                h(Switch, { on: a.on, label: "Aktifkan alarm " + A.hm(a.h, a.m, a.s), onChange: v => { A.toggle(a.id, v); if (v) { const o = A.list.find(z => z.id === a.id), t = o && A.occs(o, Date.now(), Date.now() + 8 * 86400000)[0]; if (t) toast(A.fmtDur(t.t - Date.now(), !!(o && o.s)) + ' lagi alarm akan berbunyi'); } } }));
        };
        return ReactDOM.createPortal(h("div", { className: "al-page", role: "dialog", "aria-modal": "true", "aria-label": "Alarm" },
            h("div", { className: "al-bar" },
                h("button", { type: "button", className: "al-ib", "aria-label": "Kembali", onClick: onClose }, ic("AlBack", 22, 2)),
                h("b", null, "Alarm"), h("span", { className: "al-ib ph" })),
            h("div", { className: "al-scroll" },
                h("div", { className: "al-next" },
                    h("small", null, nx ? "Alarm berikutnya" : "Tidak ada alarm aktif"),
                    nx && h("b", null, "Dalam " + A.fmtDur(nx.t - Date.now(), !!(nx.alarm && nx.alarm.s))),
                    nx && h("em", null, nxLabel + " · " + A.clock(nx.t, nx.alarm))),
                list.length === 0
                    ? h("div", { className: "al-empty" },
                        h("div", { className: "al-eb" }, ic("AlAlarm", 38, 1.6)),
                        h("b", null, "Belum ada alarm"), h("small", null, "Tambah pengingat sebelum sesi trading dibuka atau saat waktu analisa habis"),
                        h("div", { className: "al-cap" }, "Cepat tambah"),
                        presets().map(p => h("button", { type: "button", key: p.label, className: "al-pr", onClick: () => setSheet(A.blank(p.h, p.m, p.label)) }, h("span", null, h("b", null, p.label), h("small", null, "Sen sampai Jum")), h("em", null, A.hm(p.h, p.m)))))
                    : list.map(card)),
            h("button", { type: "button", className: "al-fab", "aria-label": "Tambah alarm", onClick: () => setSheet(A.blank()) }, ic("AlPlus", 24, 2.2)),
            sheet && h(AlarmSheet, { key: sheet.id || 'new', initial: sheet, onClose: () => setSheet(null) })), document.body);
    }
    function AlarmRow() {
        const [open, setOpen] = useState(false);
        useAlarms();
        const on = A.list.filter(a => a.on).length;
        return h(React.Fragment, null,
            h("button", { type: "button", className: "pick-row", onClick: () => setOpen(true) },
                h("span", { className: "pick-ic" }, ic("AlAlarm", 18)),
                h("span", { className: "pick-tx" }, h("b", null, "Alarm"), h("small", null, "Pengingat sesi dan waktu analisa, bisa bunyi lagi")),
                h("span", { className: "pick-val" }, on ? on + " aktif" : "Belum ada"),
                h(ChevronRight, { size: 18 })),
            open && h(AlarmPage, { onClose: () => setOpen(false) }));
    }
    /* Layar alarm berbunyi: root React terpisah, aktif di halaman mana pun */
    function Ring() {
        const [list, setList] = useState(A.ringing);
        useEffect(() => A.onRing(setList), []);
        useEffect(() => { document.body.classList.toggle('al-ringing', list.length > 0); }, [list.length]);
        if (!list.length) return null;
        const r = list[list.length - 1];
        return h("div", { className: "al-ring", role: "alertdialog", "aria-modal": "true", "aria-label": "Alarm berbunyi" },
            h("div", { className: "al-rb2" }, ic("AlAlarm", 46, 1.6)),
            h("small", { className: "al-rs" }, r.sub),
            h("div", { className: "al-rt" }, r.time),
            r.msg && h("b", { className: "al-rm" }, r.msg),
            list.length > 1 && h("small", { className: "al-ro" }, (list.length - 1) + " alarm lain ikut berbunyi"),
            h("div", { className: "al-rbtn" },
                h("button", { type: "button", className: "snz", onClick: () => A.snooze(r.key, 5) }, "Tunda 5 menit"),
                h("button", { type: "button", className: "stp", onClick: () => A.dismiss(r.key) }, "Matikan")),
            h("small", { className: "al-rn" }, "Berbunyi dan bergetar sampai dimatikan"));
    }
    try {
        const el = document.createElement('div'); el.id = 'alarm-ring-root';
        document.body.appendChild(el);
        ReactDOM.createRoot(el).render(h(Ring));
    } catch (e) { }
    window.AlarmRow = AlarmRow;
    A.start();
})();
