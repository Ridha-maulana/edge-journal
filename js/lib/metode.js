/* Metode Satu Warna: isi SOP bawaan + penyimpanan teks hasil ubahan (v5.10.6).
   Teks ubahan ikut disimpan di data jurnal (edge-journal-v3, field "metode") sehingga ikut sinkron ke akun online.
   Selama belum diubah, field itu tidak ada dan aplikasi memakai teks bawaan di bawah ini. */
"use strict";
(function () {
    const STORE = 'edge-journal-v3', LOCAL = 'ej-metode-v1'; /* LOCAL: salinan di HP ini, dipakai selama data jurnal belum pernah tersimpan */
    /* tipe: pairs = baris "Judul | isi", lines = satu baris satu butir, text = satu paragraf */
    const TYPES = { info: 'pairs', goal: 'text', alarms: 'pairs', map: 'pairs', buy: 'lines', buyDec: 'text', sell: 'lines', sellDec: 'text', skipIntro: 'text', skip: 'pairs', flow: 'lines' };
    const DEF = {
        info: [['Nama sistem', 'Metode Satu Warna (mekanis murni)'], ['Peran timeframe', 'H1 = tren utama (arah dominan). H4 = konfirmasi eksekusi / entry posisi.'], ['Pasar dan ukuran lot', 'GOLD (XAU/USD) dan major forex. Fixed 0.01 (strict risk dan money management).'], ['Batas posisi harian', 'Maksimal 3 posisi per hari. Hanya 1 posisi per sesi: Asia, London, New York.']],
        goal: 'Bukan mencari sistem 100% winrate, melainkan menekan kebocoran modal akibat keputusan berdasarkan feeling dan meningkatkan winrate objektif (misalnya 53% menjadi 56%+) menuju data 100 posisi.',
        alarms: [['Sesi Asia', 'Alarm utama 09:14:30. Alarm tutup 09:21:30. Opsi kedua 10:14:30 (tutup 10:21:30).'], ['Sesi London', 'Alarm utama 17:14:30. Alarm tutup 17:21:30. Opsi kedua 18:14:30 (tutup 18:21:30).'], ['Sesi New York', 'Alarm utama 21:14:30. Alarm tutup 21:21:30. Opsi kedua 22:14:30 (tutup 22:21:30).']],
        map: [['Struktur S&R baku', 'Garis S&R mengunci candle paling atas (High) dan candle paling bawah (Low) yang sudah terkonfirmasi di-break oleh bodi atau ekor candle berikutnya.'], ['Fibonacci retracement', 'Ditarik dari High (0.0) ke Low (100.0) ayunan acuan. Level 38.2% dan 50.0% sebagai area retest / ruang gerak, serta 161.8% sebagai proyeksi lanjutan.']],
        buy: ['Tren utama H1: naik (S&R atas berhasil tertembus ke atas).', 'Warna candle H4 (alarm): wajib HIJAU / naik (searah H1).', 'Syarat Fibonacci: masih ada ruang gerak terukur menuju target dan tidak sedang mepet puncak.'],
        buyDec: 'ENTRY BUY (maksimal 1 posisi per sesi).',
        sell: ['Tren utama H1: turun (S&R bawah tertembus atau penolakan puncak terkonfirmasi).', 'Warna candle H4 (alarm): wajib MERAH / turun (searah H1).', 'Filter retest: jika candle H4/H1 masih hijau (sedang buat wick), SKIP jam pertama dan tunggu Opsi Kedua (+1 jam).'],
        sellDec: 'ENTRY SELL (jika syarat lengkap).',
        skipIntro: 'Jika saat alarm pertama jam sesi (misalnya 21:14:30) tren utama H1 menunjukkan arah turun namun candle H4/H1 masih berwarna hijau (sedang retest / membentuk ekor), dilarang masuk. Tutup MT5, lalu buka kembali saat alarm Opsi Kedua (22:14:30). Jika warna sudah berubah searah (merah), barulah boleh ENTRY SELL. Jika masih hijau atau tidak selaras, SKIP total sesi tersebut.',
        skip: [['Warna H4 berlawanan', 'Warna candle H4 berlawanan dengan arah tren utama H1 setelah dicek pada opsi kedua.'], ['Retest terlalu mepet', 'Harga sedang retest dan jaraknya sudah terlalu dekat atau mepet dengan level target Fibonacci.'], ['Sideways murni', 'Harga bergerak rata ke samping tanpa pola ayunan.'], ['Sudah 1 posisi di sesi ini', 'Sudah membuka 1 posisi pada sesi berjalan tersebut (maksimal 1 posisi per sesi).']],
        flow: ['Alarm utama sesi (:14:30): cek tren H1 dan warna H4, lalu evaluasi syarat jarak Fibonacci.', 'Searah dan syarat lengkap: eksekusi entry (0.01), pasang SL (150/200) dan TP (225), lalu tutup MT5 (:21:30).', 'Belum searah / beda warna (sedang retest/wick): SKIP jam pertama dan tunggu alarm Opsi Kedua (+1 jam).', 'Cek Opsi Kedua (:14:30): jika searah, entry. Jika tetap beda warna, SKIP total sesi ini.', 'Dokumentasi jurnal: unggah screenshot transaksi setelah posisi selesai (HIT TP / HIT SL).', 'Evaluasi 100 posisi: dilarang mengubah SOP hingga tercapai kuota 100 sampel transaksi.']
    };
    const SECS = [
        { n: 1, id: 'ringkasan', title: 'Parameter utama dan tujuan', fields: [['info', 'Parameter utama', 'Satu baris satu butir, format: Judul | isi'], ['goal', 'Prinsip psikologi']] },
        { n: 2, id: 'peta', title: 'Peta S&R, Fibonacci dan jadwal alarm', fields: [['map', 'Peta S&R dan Fibonacci', 'Satu baris satu butir, format: Judul | isi'], ['alarms', 'Jadwal alarm sesi', 'Satu baris satu butir, format: Judul | isi']] },
        { n: 3, id: 'entry', title: 'Aturan entry Buy dan Sell', fields: [['buy', 'Syarat Entry Buy', 'Satu baris satu syarat'], ['buyDec', 'Keputusan Buy'], ['sell', 'Syarat Entry Sell', 'Satu baris satu syarat'], ['sellDec', 'Keputusan Sell']] },
        { n: 4, id: 'skip', title: 'Opsi kedua dan kondisi Skip', fields: [['skipIntro', 'Mekanisme Opsi Kedua'], ['skip', 'Kondisi wajib Skip sesi', 'Satu baris satu butir, format: Judul | isi']] },
        { n: 5, id: 'alur', title: 'Alur kerja harian dan jurnal', fields: [['flow', 'Langkah kerja', 'Satu baris satu langkah']] }
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
        d.info.forEach(p => add(1, p[0], 'Metode › Parameter', p[1]));
        add(1, 'Prinsip psikologi', 'Metode › Parameter', d.goal);
        d.alarms.forEach(p => add(2, p[0], 'Metode › Jadwal alarm', p[1]));
        d.map.forEach(p => add(2, p[0], 'Metode › Peta S&R', p[1]));
        d.buy.forEach((x, i) => add(3, 'Entry Buy · syarat ' + (i + 1), 'Metode › ' + x.split(':')[0].slice(0, 44), x, 'buy'));
        d.sell.forEach((x, i) => add(3, 'Entry Sell · syarat ' + (i + 1), 'Metode › ' + x.split(':')[0].slice(0, 44), x, 'sell'));
        d.skip.forEach(p => add(4, p[0], 'Metode › Kondisi Skip', p[1] + ' skip lewati tidak entry'));
        d.flow.forEach((x, i) => add(5, 'Langkah ' + (i + 1), 'Metode › ' + x.slice(0, 44), x));
        add(4, 'Opsi Kedua (+1 jam)', 'Metode › Opsi kedua', d.skipIntro + ' opsi kedua jam berikutnya');
        return L;
    }
    window.METODE = { DEF, SECS, TYPES, save, useMetode, toText, fromText, searchIndex, get: () => cur };
})();
