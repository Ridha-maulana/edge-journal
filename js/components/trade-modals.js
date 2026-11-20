/* Popup tambah/edit trade, tutup posisi, hitung risiko */
"use strict";
function AddTradeForm({ account, onClose, onSave, initial, prefill }) {
    const h = React.createElement;
    const pf = prefill && !prefill.calc ? prefill : null;
    const cf = prefill && prefill.calc ? prefill : null;
    const str = v => v == null ? '' : String(v);
    const [tzMode, setTzMode] = useState(mt5GetTz());
    const [form, setForm] = useState(pf ? { symbol: pf.symbol, side: pf.side, date: pf.date, closeDate: pf.closeDate || '', entry: str(pf.entry), exit: str(pf.exit), lots: String(pf.lots), sl: str(pf.sl), tp: str(pf.tp), fees: String(pf.fees || 0), exitMethod: pf.exitMethod || '', setup: '', review: '', brokerPnl: pf.net != null ? String(pf.net) : '', screenshots: [] }
        : cf ? { symbol: cf.symbol, side: cf.side, date: isoNow(), closeDate: '', entry: str(cf.entry), exit: '', lots: String(cf.lots), sl: str(cf.sl), tp: str(cf.tp), fees: '0', exitMethod: '', setup: '', review: '', brokerPnl: '', screenshots: [] }
            : initial ? { ...initial, entry: str(initial.entry), exit: str(initial.exit), lots: str(initial.lots), sl: str(initial.sl), tp: str(initial.tp), fees: str(initial.fees || 0), closeDate: initial.closeDate || '', exitMethod: initial.exitMethod || '', setup: initial.setup || '', review: initial.review || '', brokerPnl: '', screenshots: initial.screenshots || [] }
                : { symbol: 'XAUUSD', side: 'Long', date: isoNow(), closeDate: '', entry: '', exit: '', lots: '0.01', sl: '', tp: '', fees: '0', exitMethod: '', setup: '', review: '', brokerPnl: '', screenshots: [] });
    const [closed, setClosed] = useState(!!(pf ? (!pf.chart && pf.exit != null) : initial ? initial.status === 'closed' : false));
    const [adjOpen, setAdjOpen] = useState(false);
    const [adjPct, setAdjPct] = useState('1');
    const fileRef = useRef(null);
    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
    const risk = riskFor(form.entry, form.sl, form.lots, form.symbol);
    const reward = rewardFor(form.entry, form.tp, form.lots, form.symbol);
    const baseBal = acctCapAt(account, form.date || isoNow()); /* modal pada waktu entry yang dipilih */
    const riskPct = risk ? risk / baseBal * 100 : 0;
    const dist = Number(form.entry) && Number(form.sl) ? Math.abs(Number(form.entry) - Number(form.sl)) : 0;
    const adjRisk = baseBal * (Number(adjPct) || 0) / 100;
    const adjLots = dist ? Math.max(0.01, Math.floor(adjRisk / (dist * contractSize(form.symbol)) * 100) / 100) : 0;
    const MAXSHOT = 3;
    async function addShots(files) { const urls = await Promise.all([...files].map(fileToDataUrl)); setForm(f => ({ ...f, screenshots: [...f.screenshots, ...urls.filter(Boolean)].slice(0, MAXSHOT) })); }
    function handlePaste(e) { const items = [...((e.clipboardData && e.clipboardData.items) || [])].filter(x => x.type.startsWith('image/')); if (items.length) { e.preventDefault(); addShots(items.map(x => x.getAsFile()).filter(Boolean)); } }
    const dupTicket = !!(pf && pf.ticket && (account.trades || []).some(t => t.mt5Ticket === pf.ticket));
    function changeTz(v) { mt5SetTz(v); setTzMode(v); setForm(f => ({ ...f, date: mt5ToWib(pf.rawOpen, v), closeDate: mt5ToWib(pf.rawClose, v) })); }
    function pickMethod(m) { const px = m === 'TP' ? form.tp : m === 'SL' ? form.sl : m === 'BE' ? form.entry : form.exit; setForm(f => ({ ...f, exitMethod: m, exit: px !== '' && px != null ? String(px) : f.exit })); }
    const preview = closed && form.exit !== '' && Number(form.entry) ? (form.brokerPnl !== '' && !isNaN(Number(form.brokerPnl)) ? Number(form.brokerPnl) : pnlFor({ ...form, entry: Number(form.entry), lots: Number(form.lots) || 0, fees: Number(form.fees) || 0 }, form.exit)) : null;
    function submit(e) {
        e.preventDefault();
        const extra = pf ? { mt5Ticket: pf.ticket || undefined, source: 'screenshot' } : {};
        const hasBroker = closed && form.brokerPnl !== '' && !isNaN(Number(form.brokerPnl));
        const data = { ...form, ...extra, exit: closed ? form.exit : '', closeDate: closed ? (form.closeDate || isoNow()) : '', exitMethod: closed ? (form.exitMethod || 'Manual') : '', review: closed ? form.review : (form.review || ''), mt5Net: hasBroker ? Number(form.brokerPnl) : null };
        delete data.brokerPnl;
        data.pnl = closed && data.exit !== '' ? (hasBroker ? Number(form.brokerPnl) : pnlFor(data, data.exit)) : 0;
        onSave(data);
    }
    const cn = (pf && pf.notes) || [];
    const scanBox = pf && (pf.chart ? h("div", { className: "scan-result" },
        h("strong", null, "Hasil baca screenshot (Pro)"),
        h("small", null, "Grafik MT5 terbaca sebagai posisi open. Periksa tiap kolom sebelum disimpan."),
        h("small", { className: "warn" }, "Waktu buka tidak ada di gambar grafik, jadi diisi waktu sekarang. Sesuaikan di kolom Tanggal & waktu jika posisi dibuka lebih awal."),
        cn.includes('lots') && h("small", { className: "warn" }, "Ukuran lot tidak terbaca jelas, diisi 0.01. Periksa kolom Lots."),
        cn.includes('side') && h("small", { className: "warn" }, "Arah (Buy/Sell) tidak terbaca, dipilih Long. Periksa."),
        !pf.symbolKnown && h("small", { className: "warn" }, "Simbol tidak terbaca, dipilih XAUUSD. Silakan ganti jika salah."),
        cn.includes('nosl') && h("small", { className: "warn" }, "Garis SL tidak terbaca, kolom Stop loss dikosongkan."),
        cn.includes('notp') && h("small", { className: "warn" }, "Garis TP tidak terbaca, kolom Take profit dikosongkan.")) : h("div", { className: "scan-result" },
        h("strong", null, "Hasil baca screenshot (Pro)"),
        h("small", null, "Periksa tiap kolom sebelum disimpan — pembacaan teks bisa keliru."),
        pf.ticket && h("small", null, "Tiket MT5: #", pf.ticket),
        !pf.symbolKnown && h("small", { className: "warn" }, "Simbol \"", pf.symbolRaw, "\" tidak ada di daftar, dipilih XAUUSD. Silakan ganti jika salah."),
        !pf.hasOpen && h("small", { className: "warn" }, "Waktu buka tidak terbaca (baris detail posisi tidak ikut di screenshot). Tanggal di bawah memakai waktu tutup — sesuaikan. SL/TP juga perlu diisi manual."),
        dupTicket && h("small", { className: "warn" }, "Peringatan: tiket ini sudah pernah dicatat di akun ini."),
        h("label", null, "Zona waktu server MT5",
            h("select", { value: tzMode, onChange: e => changeTz(e.target.value) }, MT5_TZ_OPTIONS.map(o => h("option", { key: o.v, value: o.v }, o.l)))),
        h("small", null, "Waktu ditampilkan dalam WIB (UTC+7).")));
    const closeBox = closed && h("div", { className: "at-close" },
        h("label", null, "Harga exit", h("input", { inputMode: "decimal", value: form.exit, required: true, placeholder: "2735.80", onChange: e => set('exit', e.target.value) })),
        h("div", { className: "at-lbl" }, "Cara keluar"),
        h("div", { className: "at-chips", role: "group", "aria-label": "Cara keluar" }, ['TP', 'SL', 'BE', 'Manual'].map(m => h("button", { type: "button", key: m, className: (form.exitMethod === m ? 'on ' : '') + 'm-' + m.toLowerCase(), "aria-pressed": form.exitMethod === m, onClick: () => pickMethod(m) }, m))),
        h("label", null, "Waktu close (WIB)", h(DateField, { withTime: true, value: form.closeDate || isoNow(), onChange: v => set('closeDate', v) })),
        h("label", null, h("span", null, "P&L dari broker ", h("em", { className: "optional" }, "(opsional)")), h("input", { inputMode: "decimal", value: form.brokerPnl, placeholder: "Kosong = dihitung otomatis", onChange: e => set('brokerPnl', e.target.value) })),
        h("label", null, "Catatan / review", h("textarea", { value: form.review, placeholder: "Apa yang berjalan baik? Apa yang perlu diperbaiki?", onChange: e => set('review', e.target.value) })),
        preview != null && h("div", { className: "close-preview" }, h("span", null, "Net P&L"), h("strong", { className: preview >= 0 ? 'positive' : 'negative' }, preview >= 0 ? '+' : '', money(preview))));
    const formEl = h("form", { onSubmit: submit, onPaste: handlePaste, className: "add-trade" },
        scanBox,
        h("div", { className: "form-grid at-one" },
            h("label", null, "Symbol", h(TSelect, { title: "Symbol", value: form.symbol, options: SYMBOLS, onChange: v => set('symbol', v) })),
            h("label", null, "Tanggal & waktu", h(DateField, { withTime: true, value: form.date, onChange: v => set('date', v) }))),
        h("label", null, "Trade setup / alasan entry", h("textarea", { value: form.setup, onChange: e => set('setup', e.target.value), placeholder: "Contoh: breakout + retest di resistance H1..." })),
        h("div", { className: "direction" },
            h("button", { type: "button", className: form.side === 'Long' ? 'selected long' : '', "aria-pressed": form.side === 'Long', onClick: () => set('side', 'Long') }, "Long / Buy"),
            h("button", { type: "button", className: form.side === 'Short' ? 'selected short' : '', "aria-pressed": form.side === 'Short', onClick: () => set('side', 'Short') }, "Short / Sell")),
        h("div", { className: "form-grid" },
            h("label", null, "Entry level", h("input", { inputMode: "decimal", value: form.entry, onChange: e => set('entry', e.target.value), placeholder: "2728.40", required: true })),
            h("label", null, "Lots", h("input", { type: "number", step: "0.01", min: "0", value: form.lots, onChange: e => set('lots', e.target.value) })),
            h("label", null, "Stop loss", h("input", { inputMode: "decimal", value: form.sl, onChange: e => set('sl', e.target.value), placeholder: "2720.00" })),
            h("label", null, "Take profit", h("input", { inputMode: "decimal", value: form.tp, onChange: e => set('tp', e.target.value), placeholder: "2745.00" }))),
        h("div", { className: "calc-result" },
            h("div", null, h("span", null, "Risk USD"), h("strong", { className: "negative" }, money(risk))),
            h("div", null, h("span", null, "Risk %"), h("strong", { className: "negative" }, riskPct.toFixed(2), "%")),
            h("div", null, h("span", null, "Reward"), h("strong", { className: "positive" }, money(reward))),
            h("div", null, h("span", null, "R:R"), h("strong", null, risk ? (reward / risk).toFixed(2) : '—'))),
        h("label", null, "Biaya (fees)", h("input", { type: "number", step: "0.01", value: form.fees, onChange: e => set('fees', e.target.value) })),
        h("div", { className: "at-seg", role: "group", "aria-label": "Status posisi" },
            h("button", { type: "button", className: closed ? '' : 'on', "aria-pressed": !closed, onClick: () => setClosed(false) }, "Terbuka"),
            h("button", { type: "button", className: closed ? 'on' : '', "aria-pressed": closed, onClick: () => setClosed(true) }, "Sudah ditutup")),
        closeBox,
        h("div", { className: "at-lbl" }, "Screenshot"),
        form.screenshots.length > 0 && h("div", { className: "at-shots" }, form.screenshots.map((src, i) => h("div", { key: i }, h("img", { src: src, alt: "Screenshot " + (i + 1) }), h("button", { type: "button", "aria-label": "Hapus screenshot " + (i + 1), onClick: () => setForm(f => ({ ...f, screenshots: f.screenshots.filter((_, j) => j !== i) })) }, h(X, { size: 13 }))))),
        h("input", { ref: fileRef, type: "file", accept: "image/*", multiple: true, hidden: true, onChange: e => { addShots(e.target.files || []); e.target.value = ''; } }),
        h("button", { type: "button", className: "at-add", disabled: form.screenshots.length >= MAXSHOT, onClick: () => fileRef.current && fileRef.current.click() }, h(Icon, { name: "Image", size: 18 }), form.screenshots.length >= MAXSHOT ? "Maksimal " + MAXSHOT + " screenshot" : "Tambah screenshot"),
        adjOpen && h("div", { className: "at-adj" },
            h("label", null, "Risiko per trade (%)", h("input", { type: "number", step: "0.1", min: "0", value: adjPct, onChange: e => setAdjPct(e.target.value) })),
            dist ? h(React.Fragment, null,
                h("div", { className: "at-adjr" }, h("div", null, h("span", null, "Risiko"), h("strong", { className: "negative" }, money(adjRisk))), h("div", null, h("span", null, "Lot disarankan"), h("strong", null, adjLots.toFixed(2)))),
                h("small", null, "Dari modal pada waktu entry ", money(baseBal), " dan jarak SL ", dist.toFixed(5).replace(/\.?0+$/, ''), "."),
                h("button", { type: "button", className: "secondary-btn", onClick: () => { set('lots', adjLots.toFixed(2)); setAdjOpen(false); } }, "Pakai ", adjLots.toFixed(2), " lot")) : h("small", { className: "warn" }, "Isi Entry level dan Stop loss dulu untuk menghitung lot.")),
        h("div", { className: "fs-actions" },
            h("button", { type: "button", className: "secondary-btn", "aria-expanded": adjOpen, onClick: () => setAdjOpen(o => !o) }, h(Target, { size: 15 }), " Hitung lot"),
            h("button", { className: "primary-btn", type: "submit" }, h(Plus, { size: 17 }), closed ? " Simpan trade" : " Simpan posisi")));
    return h("div", { className: "modal-backdrop fs" },
        h("div", { className: "modal wide-modal fs" },
            h("div", { className: "modal-head" },
                h("div", null,
                    h("p", { className: "eyebrow" }, initial ? 'Edit trade' : pf ? 'Trade baru · dari screenshot' : 'Trade baru · input manual'),
                    h("h2", null, initial ? 'Ubah trade' : 'Tambah trade')),
                h("button", { className: "icon-btn", type: "button", "aria-label": "Tutup", onClick: onClose }, h(X, { size: 19 }))),
            formEl));
}
function AddTradeModal(props) { return React.createElement(AddTradeForm, props); }
function CloseTradeModal({ trade, onClose, onSave }) { var _a; const [form, setForm] = useState({ tradeId: trade.id, exit: (trade.tp !== null && trade.tp !== undefined && trade.tp !== '') ? trade.tp : ((_a = trade.exit) !== null && _a !== void 0 ? _a : trade.entry), closeDate: isoNow(), exitMethod: (trade.tp !== null && trade.tp !== undefined && trade.tp !== '') ? 'TP' : 'Manual', fees: '0', review: '' }); const set = (k, v) => setForm({ ...form, [k]: v }); function method(m) { const exit = m === 'TP' ? trade.tp : m === 'SL' ? trade.sl : m === 'BE' ? trade.entry : form.exit; setForm({ ...form, exit: exit !== null && exit !== void 0 ? exit : '', exitMethod: m }); } return React.createElement("div", { className: "modal-backdrop fs" },
    React.createElement("div", { className: "modal compact-modal fs" },
        React.createElement("div", { className: "modal-head" },
            React.createElement("div", null,
                React.createElement("p", { className: "eyebrow" },
                    "CLOSE POSITION / ",
                    trade.symbol),
                React.createElement("h2", null, "Close trade")),
            React.createElement("button", { className: "icon-btn", onClick: onClose },
                React.createElement(X, { size: 19 }))),
        React.createElement("div", { className: "close-methods" },
            React.createElement("button", { className: form.exitMethod === 'TP' ? 'selected tp' : '', onClick: () => method('TP') }, "TP"),
            React.createElement("button", { className: form.exitMethod === 'SL' ? 'selected sl' : '', onClick: () => method('SL') }, "SL"),
            React.createElement("button", { className: form.exitMethod === 'BE' ? 'selected be' : '', onClick: () => method('BE') }, "BE"),
            React.createElement("button", { className: form.exitMethod === 'Manual' ? 'selected manual' : '', onClick: () => method('Manual') }, "Manual")),
        React.createElement("label", null,
            "Harga close",
            React.createElement("input", { inputMode: "decimal", value: form.exit, onChange: e => set('exit', e.target.value) })),
        React.createElement("label", null,
            "Tanggal close",
            React.createElement(DateField, { withTime: true, value: form.closeDate, onChange: v => set('closeDate', v) })),
        React.createElement("label", null,
            "Fees / commission",
            React.createElement("input", { type: "number", step: "0.01", value: form.fees, onChange: e => set('fees', e.target.value) })),
        React.createElement("label", null,
            "Post-trade review",
            React.createElement("textarea", { value: form.review, onChange: e => set('review', e.target.value), placeholder: "Apa yang berjalan baik? Apa yang perlu diperbaiki?" })),
        React.createElement("div", { className: "close-preview" },
            React.createElement("span", null, "Net P&L preview"),
            React.createElement("strong", { className: pnlFor({ ...trade, fees: Number(form.fees) }, Number(form.exit)) >= 0 ? 'positive' : 'negative' },
                pnlFor({ ...trade, fees: Number(form.fees) }, Number(form.exit)) >= 0 ? '+' : '',
                money(pnlFor({ ...trade, fees: Number(form.fees) }, Number(form.exit))))),
        React.createElement("div", { className: "fs-actions" },
            React.createElement("button", { type: "button", className: "secondary-btn", onClick: onClose }, "Batal"),
            React.createElement("button", { className: "primary-btn", onClick: () => onSave(form) },
                React.createElement(CheckIcon, null),
                " Save close & review")))); }
function CheckIcon() { return React.createElement("span", { className: "check-icon" }, "\u2713"); }
function AdjustRiskModal({ calc, suggestedLots, onClose, onApply }) { const [riskPct, setRiskPct] = useState(calc.riskPct || '1'); const riskAmount = Number(calc.balance || 0) * Number(riskPct || 0) / 100; const lots = Number(calc.entry) && Number(calc.sl) ? riskAmount / (Math.abs(Number(calc.entry) - Number(calc.sl)) * contractSize(calc.symbol)) : suggestedLots; return React.createElement("div", { className: "modal-backdrop" },
    React.createElement("div", { className: "modal compact-modal" },
        React.createElement("div", { className: "modal-head" },
            React.createElement("div", null,
                React.createElement("p", { className: "eyebrow" }, "RISK MANAGEMENT"),
                React.createElement("h2", null, "Adjust risk")),
            React.createElement("button", { className: "icon-btn", onClick: onClose },
                React.createElement(X, { size: 19 }))),
        React.createElement("p", { className: "muted" },
            "Posisi disesuaikan berdasarkan balance ",
            money(calc.balance),
            " dan jarak SL."),
        React.createElement("label", null,
            "Risk percentage",
            React.createElement("input", { type: "number", step: "0.1", value: riskPct, onChange: e => setRiskPct(e.target.value) })),
        React.createElement("div", { className: "calc-result" },
            React.createElement("div", null,
                React.createElement("span", null, "Risk amount"),
                React.createElement("strong", { className: "negative" }, money(riskAmount))),
            React.createElement("div", null,
                React.createElement("span", null, "Suggested lots"),
                React.createElement("strong", null, lots ? lots.toFixed(2) : '—')),
            React.createElement("div", null,
                React.createElement("span", null, "Contract"),
                React.createElement("strong", null, contractSize(calc.symbol).toLocaleString()))),
        React.createElement("button", { className: "primary-btn", onClick: () => onApply(lots ? lots.toFixed(2) : calc.lots) }, "Apply lot size"))); }
