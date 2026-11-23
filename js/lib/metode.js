/* Metode Satu Warna: isi SOP bawaan + penyimpanan teks hasil ubahan (v5.10.6).
   Teks ubahan ikut disimpan di data jurnal (edge-journal-v3, field "metode") sehingga ikut sinkron ke akun online.
   Selama belum diubah, field itu tidak ada dan aplikasi memakai teks bawaan di bawah ini. */
"use strict";
(function () {
    const STORE = 'edge-journal-v3', LOCAL = 'ej-metode-v1'; /* LOCAL: salinan di HP ini, dipakai selama data jurnal belum pernah tersimpan */
    /* tipe: pairs = baris "Judul | isi", lines = satu baris satu butir, text = satu paragraf */
    const TYPES = { info: 'pairs', goal: 'text', alarms: 'pairs', map: 'pairs', buy: 'lines', buyDec: 'text', sell: 'lines', sellDec: 'text', skipIntro: 'text', skip: 'pairs', flow: 'lines' };
    const DEF = {
        info: [['Nama metode', 'Metode Satu Warna'], ['Timeframe acuan', 'H1 murni (single timeframe)'], ['Instrumen', 'GOLD (XAU/USD) dan major forex'], ['Ukuran lot', 'Fixed 0.01. Tanpa averaging atau martingale']],
        goal: 'Menghilangkan intervensi emosi (feeling, penasaran, overtrading) dengan mengunci keputusan trading secara biner (Entry atau Skip) berdasarkan batas struktur S&R, warna candle H1, dan jarak matematis Fibonacci.',
        alarms: [['Alarm 1 · Cek dan eksekusi', 'Menit :15 atau :20, misalnya 09:15, 10:15, dan seterusnya.'], ['Alarm 2 · Penutup MT5', '5 sampai 10 menit setelah Alarm 1, misalnya 09:25. Wajib tutup aplikasi setelah alarm ini berbunyi.']],
        map: [['Resistance (S&R atas)', 'Titik tertinggi (High) dari candle paling atas pada ayunan acuan yang sudah dilewati (break) oleh bodi atau ekor candle lain.'], ['Support (S&R bawah)', 'Titik terendah (Low) dari candle paling bawah pada ayunan acuan yang sudah dilewati (break) oleh candle lain.'], ['Fibonacci retracement', 'Ditarik dari High (0.0) ke Low (100.0) pada ayunan acuan terakhir. Level 38.2% jadi batas area retest sekaligus Take Profit (TP).']],
        buy: ['Arah tren utama H1: S&R atas (titik ekstrem candle pendek atau konsolidasi) berhasil dilewati ke atas oleh harga.', 'Warna candle H1 saat alarm: wajib HIJAU / naik (selaras tren H1).', 'Ruang Fibonacci: ada ruang gerak yang masuk akal menuju target dan tidak berada di batas puncak pembalikan.'],
        buyDec: 'ENTRY BUY (Lot 0.01). Gagal satu syarat = SKIP.',
        sell: ['Arah tren utama H1: S&R bawah dilewati ke bawah, ATAU terjadi penolakan terkonfirmasi di puncak candle paling tinggi.', 'Warna candle H1 saat alarm: wajib MERAH / turun (selaras tren H1).', 'Filter pembalikan puncak: jika candle H1 di puncak HIJAU = 2 pelanggaran (dilarang Sell).', 'Ruang Fibonacci: jarak ke level 38.2% masih cukup dan masuk akal.'],
        sellDec: 'ENTRY SELL (Lot 0.01). Gagal satu syarat = SKIP.',
        skipIntro: 'Ambil keputusan SKIP tanpa perdebatan batin bila salah satu terjadi saat alarm berbunyi:',
        skip: [['Discrepancy warna', 'Warna candle H1 berlawanan dengan tren utama (contoh: tren naik, tetapi candle H1 jam alarm merah).'], ['Fase retest mepet', 'Harga sedang retest dan jaraknya sudah terlalu mepet ke level Fibonacci target (38.2%).'], ['Sideways / tanpa breakout', 'Harga masih bolak-balik di dalam rentang S&R tanpa penembusan candle yang jelas.'], ['Curiga atau penasaran', 'Memantau chart di luar jadwal alarm resmi.']],
        flow: ['Alarm berbunyi (:15 atau :20), buka chart H1.', 'Verifikasi 3 syarat: tren S&R, warna H1, jarak Fibo.', 'Lengkap: entry Lot 0.01 + pasang TP/SL objektif. Tidak lengkap: SKIP.', 'Alarm penutup berbunyi (5 sampai 10 menit): wajib tutup MT5.', 'Dokumentasi: unggah screenshot transaksi ke Jurnal.', 'Evaluasi: kunci SOP sampai terkumpul 100 posisi. Fokus pada kepatuhan jam alarm dan persentase Win/Loss.']
    };
    const SECS = [
        { n: 1, id: 'ringkasan', title: 'Ringkasan dan tujuan', fields: [['info', 'Identitas metode', 'Satu baris satu butir, format: Judul | isi'], ['goal', 'Tujuan']] },
        { n: 2, id: 'peta', title: 'Peta chart dan rutinitas', fields: [['alarms', 'Rutinitas alarm', 'Satu baris satu butir, format: Judul | isi'], ['map', 'Peta chart', 'Satu baris satu butir, format: Judul | isi']] },
        { n: 3, id: 'entry', title: 'Syarat entry Buy dan Sell', fields: [['buy', 'Syarat Entry Buy', 'Satu baris satu syarat'], ['buyDec', 'Keputusan Buy'], ['sell', 'Syarat Entry Sell', 'Satu baris satu syarat'], ['sellDec', 'Keputusan Sell']] },
        { n: 4, id: 'skip', title: 'Aturan Skip', fields: [['skipIntro', 'Pengantar'], ['skip', 'Kondisi Skip', 'Satu baris satu butir, format: Judul | isi']] },
        { n: 5, id: 'alur', title: 'Alur kerja dan evaluasi', fields: [['flow', 'Langkah kerja', 'Satu baris satu langkah']] }
    ];
    const clone = o => JSON.parse(JSON.stringify(o));
    const str = v => typeof v === 'string';
    function clean(data) {
        const out = clone(DEF);
        if (!data || typeof data !== 'object') return out;
        Object.keys(TYPES).forEach(k => {
            const v = data[k], t = TYPES[k];
            if (t === 'text' && str(v)) out[k] = v;
            else if (t === 'lines' && Array.isArray(v) && v.every(str)) out[k] = v.filter(x => x.trim());
            else if (t === 'pairs' && Array.isArray(v) && v.every(p => Array.isArray(p) && str(p[0]) && str(p[1]))) out[k] = v.filter(p => p[0].trim() || p[1].trim()).map(p => [p[0], p[1]]);
        });
        return out;
    }
    const subs = [];
    function read() {
        try { const o = JSON.parse(localStorage.getItem(STORE) || 'null'); if (o && o.metode) return o.metode.data ? clean(o.metode.data) : clone(DEF); } catch (e) { }
        try { const m = JSON.parse(localStorage.getItem(LOCAL) || 'null'); if (m && m.data) return clean(m.data); } catch (e) { }
        return clone(DEF);
    }
    let cur = read();
    const notify = () => subs.slice().forEach(f => { try { f(cur); } catch (e) { } });
    /* data = objek isi baru; null = kembali ke teks bawaan */
    function save(data) {
        const next = data ? clean(data) : clone(DEF);
        const same = JSON.stringify(next) === JSON.stringify(DEF);
        const m = { v: 1, data: same ? null : next, t: Date.now() };
        try { localStorage.setItem(LOCAL, JSON.stringify(m)); } catch (e) { }
        try {
            const raw = localStorage.getItem(STORE), o = raw ? JSON.parse(raw) : null;
            if (o && Array.isArray(o.accounts)) {
                o.metode = m;
                localStorage.setItem(STORE, JSON.stringify(o));
            }
            if (typeof markLocalChanged === 'function') markLocalChanged();
        } catch (e) { }
        cur = next; notify();
    }
    window.addEventListener('ej-state-applied', () => { cur = read(); notify(); });
    function useMetode() {
        const [d, setD] = React.useState(cur);
        React.useEffect(() => { const f = v => setD(v); subs.push(f); setD(cur); return () => { const i = subs.indexOf(f); if (i >= 0) subs.splice(i, 1); }; }, []);
        return d;
    }
    const toText = (k, v) => TYPES[k] === 'pairs' ? v.map(p => p[0] + (p[1] ? ' | ' + p[1] : '')).join('\n') : TYPES[k] === 'lines' ? v.join('\n') : v;
    function fromText(k, s) {
        const t = TYPES[k], rows = String(s || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean);
        if (t === 'text') return String(s || '').trim();
        if (t === 'lines') return rows;
        return rows.map(r => { const i = r.indexOf('|'); return i < 0 ? [r, ''] : [r.slice(0, i).trim(), r.slice(i + 1).trim()]; });
    }
    /* indeks pencarian: tiap butir bisa dicari lewat judul atau isinya, lalu membuka bagian yang tepat */
    function searchIndex(d) {
        const L = [];
        const add = (n, title, sub, key, tab) => L.push({ n, title, sub, key: key || '', tab });
        SECS.forEach(s => add(s.n, 'Bagian ' + s.n + ': ' + s.title, 'Metode Satu Warna', 'bagian sop'));
        d.info.forEach(p => add(1, p[0], 'Metode › Ringkasan', p[1]));
        add(1, 'Tujuan metode', 'Metode › Ringkasan', d.goal);
        d.alarms.forEach(p => add(2, p[0], 'Metode › Rutinitas', p[1]));
        d.map.forEach(p => add(2, p[0], 'Metode › Peta chart', p[1]));
        d.buy.forEach((x, i) => add(3, 'Entry Buy · syarat ' + (i + 1), 'Metode › ' + x.split(':')[0].slice(0, 44), x, 'buy'));
        d.sell.forEach((x, i) => add(3, 'Entry Sell · syarat ' + (i + 1), 'Metode › ' + x.split(':')[0].slice(0, 44), x, 'sell'));
        d.skip.forEach(p => add(4, p[0], 'Metode › Aturan Skip', p[1] + ' skip lewati tidak entry'));
        d.flow.forEach((x, i) => add(5, 'Langkah ' + (i + 1), 'Metode › ' + x.slice(0, 44), x));
        return L;
    }
    window.METODE = { DEF, SECS, TYPES, save, useMetode, toText, fromText, searchIndex, get: () => cur };
})();
