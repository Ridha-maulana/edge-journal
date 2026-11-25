/* Metode Satu Warna: isi SOP bawaan + penyimpanan teks hasil ubahan (v5.11.4).
   Teks ubahan ikut disimpan di data jurnal (edge-journal-v3, field "metode") sehingga ikut sinkron ke akun online.
   Selama belum diubah, field itu tidak ada dan aplikasi memakai teks bawaan di bawah ini. */
"use strict";
(function () {
    const STORE = 'edge-journal-v3', LOCAL = 'ej-metode-v1'; /* LOCAL: salinan di HP ini, dipakai selama data jurnal belum pernah tersimpan */
    /* tipe: pairs = baris "Judul | isi", lines = satu baris satu butir, text = satu paragraf */
    const TYPES = { info: 'pairs', zones: 'pairs', alarms: 'pairs', retest: 'lines', retestDec: 'text', follow: 'lines', followDec: 'text', skipIntro: 'text', skip: 'pairs', flow: 'lines' };
    const VER = 3; /* isi ubahan versi lama (sebelum SOP H1 Murni 3) diabaikan, aplikasi memakai teks bawaan baru */
    const DEF = {
        info: [['Nama sistem', 'Metode Satu Warna (H1 Murni)'], ['Timeframe acuan', 'H1 Murni (Single Timeframe). Bebas lagging H4, eksekusi harga diskon optimal di awal pergantian candle.'], ['Pasar dan ukuran lot', 'GOLD (XAU/USD) dan major forex. Fixed 0.01 (dilarang averaging / martingale).'], ['Parameter exit', 'SL 150 pips / TP 225 pips (R:R = 1:1.5) atau SL 200 pips. Set langsung saat entry.'], ['Batas posisi harian', 'Maksimal 3 posisi per hari. Hanya 1 posisi per sesi: Asia, London, New York.']],
        zones: [['Follow Trend 0.0 – 100.0%', 'Awal dorongan tren utama. Syarat: tren H1 + satu warna H1 + jarak mencukupi.'], ['Retest / Koreksi 38.2 – 100%', 'Area ayunan normal. Retest + tren S&R + satu warna H1. Ruang cukup, tidak mepet.'], ['Lanjutan Follow Trend 100 – 161.8%', 'Dorongan breakout lanjutan. Wajib 1 candle ekstrem + 1 candle konfirmasi break + tren utama + satu warna.'], ['Ekstensi Jenuh > 161.8%', 'DILARANG ENTRY. Pengakhiran impulsif, potensi pembalikan (reversal).']],
        alarms: [['Sesi Asia', '09:14:30 | 09:21:30 | 10:14:30 | 10:21:30'], ['Sesi London', '17:14:30 | 17:21:30 | 18:14:30 | 18:21:30'], ['Sesi New York', '21:14:30 | 21:21:30 | 22:14:30 | 22:21:30']],
        retest: ['Syarat 1: berada di dalam rentang koreksi Fibonacci 38.2% hingga 100%.', 'Syarat 2: tren utama S&R H1 selaras dengan arah posisi.', 'Syarat 3: warna candle H1 saat alarm wajib SATU WARNA (searah).', 'Filter: ruang gerak ke level tujuan masih mencukupi (tidak mepet).'],
        retestDec: 'ENTRY RETEST (jika syarat lengkap).',
        follow: ['Zona 0.0 – 100.0%: follow trend utama jika syarat warna dan tren H1 selaras.', 'Penembusan level 100%: menuju 161.8% wajib konfirmasi 1 candle ekstrem + 1 candle break lanjutan.', 'Syarat utama: tren utama H1 dan candle H1 jam alarm SATU WARNA.'],
        followDec: 'ENTRY FOLLOW TREND (jika terkonfirmasi).',
        skipIntro: 'Jika tren utama H1 turun tetapi candle H1 pada alarm pertama masih Hijau (sedang buat ekor/retest), SKIP jam pertama. Tutup MT5, lalu cek alarm Opsi +1 Jam. Jika candle H1 jam kedua berubah Merah, barulah boleh ENTRY SELL (mendapatkan harga diskon optimal). Jika jam kedua tetap Hijau atau tidak selaras, SKIP TOTAL SESI TERSEBUT.',
        skip: [['Tembus 38.2% tanpa konfirmasi', 'Harga sudah tembus 38.2% tetapi belum ada konfirmasi 1 candle yang melewati candle ekstrem.'], ['Warna H1 tidak searah', 'Warna candle H1 jam alarm tidak satu arah dengan tren utama S&R H1.'], ['Jarak ke target mepet', 'Jarak harga ke level target Fibonacci (38.2% / 50.0%) sudah terlalu mepet atau dekat.'], ['Sideways murni', 'Harga dalam fase sideways murni (bodi candle H1 berjejer rata tanpa pola ayunan).'], ['Sudah ada 1 posisi', 'Sudah ada 1 posisi terbuka di sesi berjalan tersebut (maksimal 1 posisi per sesi).']],
        flow: ['Alarm utama sesi (:14:30): cek tren S&R H1 dan tentukan zona Fibo (38–100% Retest ATAU 100–161% Lanjutan).', 'Zona Retest (38–100%): cek searah dan warna H1, lalu entry (0.01) + SL (150/200) dan TP (225), kemudian tutup MT5 (:21:30).', 'Zona Lanjutan (100–161%): cek konfirmasi candle ekstrem + 1 candle break, entry jika searah H1.', 'Belum terkonfirmasi / beda warna (retest wick): SKIP jam pertama dan tunggu alarm Opsi +1 Jam.', 'Alarm Opsi +1 Jam (:14:30): jika H1 berubah searah, entry. Jika tetap beda warna, SKIP total sesi ini.', 'Dokumentasi jurnal: simpan screenshot transaksi, evaluasi hingga 100 sampel posisi tanpa mengubah SOP.']
    };
    const SECS = [
        { n: 1, id: 'parameter', title: 'Parameter sistem dan manajemen risiko', fields: [['info', 'Parameter sistem', 'Satu baris satu butir, format: Judul | isi']] },
        { n: 2, id: 'zoning', title: 'Zoning Fibonacci dan visualisasi aturan', fields: [['zones', 'Tangga zona Fibonacci', 'Satu baris satu zona, format: Judul + rentang | isi. Warna mengikuti urutan baris.'], ['alarms', 'Jadwal alarm sesi', 'Satu baris satu sesi, format: Sesi | Utama | Tutup | +1 jam | Tutup (jam hh:mm:ss)']] },
        { n: 3, id: 'entry', title: 'Matriks keputusan entry berdasarkan zona', fields: [['retest', 'Syarat Zona Retest (38.2 – 100%)', 'Satu baris satu syarat'], ['retestDec', 'Keputusan Retest'], ['follow', 'Syarat Follow Trend dan Lanjutan (0.0 – 161.8%)', 'Satu baris satu syarat'], ['followDec', 'Keputusan Follow Trend']] },
        { n: 4, id: 'skip', title: 'Aturan opsi +1 jam dan kondisi wajib skip', fields: [['skipIntro', 'Aturan Opsi +1 Jam'], ['skip', 'Kondisi wajib Skip', 'Satu baris satu butir, format: Judul | isi']] },
        { n: 5, id: 'alur', title: 'Alur kerja dan 100 data posisi', fields: [['flow', 'Langkah kerja', 'Satu baris satu langkah']] }
    ];
    /* pilihan alasan entry di form Tambah trade: tiap id disimpan di trade.zone */
    const ZONES = [
        { id: 'retest', name: 'Retest / Koreksi', range: '38.2 – 100%', tone: 'a' },
        { id: 'follow', name: 'Follow Trend', range: '0.0 – 100.0%', tone: 'g' },
        { id: 'lanjut', name: 'Lanjutan Follow Trend', range: '100 – 161.8%', tone: 'g' },
        { id: 'jenuh', name: 'Ekstensi Jenuh', range: '> 161.8%', tone: 'r', banned: true, note: 'Dilarang entry' }
    ];
    const zoneOf = id => ZONES.find(z => z.id === id) || null;
    const zoneText = id => { const z = zoneOf(id); return z ? z.name + ' ' + z.range : ''; };
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
        try { const o = JSON.parse(localStorage.getItem(STORE) || 'null'); if (o && o.metode) return (o.metode.data && o.metode.v === VER) ? clean(o.metode.data) : clone(DEF); } catch (e) { }
        try { const m = JSON.parse(localStorage.getItem(LOCAL) || 'null'); if (m && m.data && m.v === VER) return clean(m.data); } catch (e) { }
        return clone(DEF);
    }
    let cur = read();
    const notify = () => subs.slice().forEach(f => { try { f(cur); } catch (e) { } });
    /* data = objek isi baru; null = kembali ke teks bawaan */
    function save(data) {
        const next = data ? clean(data) : clone(DEF);
        const same = JSON.stringify(next) === JSON.stringify(DEF);
        const m = { v: VER, data: same ? null : next, t: Date.now() };
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
        d.zones.forEach(p => add(2, p[0], 'Metode › Zona Fibonacci', p[1] + ' zona fibonacci'));
        d.alarms.forEach(p => add(2, p[0], 'Metode › Jadwal alarm', p[1] + ' alarm sesi jam'));
        d.retest.forEach((x, i) => add(3, 'Zona Retest · syarat ' + (i + 1), 'Metode › ' + x.split(':')[0].slice(0, 44), x, 'retest'));
        d.follow.forEach((x, i) => add(3, 'Zona Follow Trend · syarat ' + (i + 1), 'Metode › ' + x.split(':')[0].slice(0, 44), x, 'follow'));
        add(4, 'Aturan Opsi +1 Jam', 'Metode › Opsi +1 jam', d.skipIntro + ' opsi jam kedua');
        d.skip.forEach(p => add(4, p[0], 'Metode › Kondisi Skip', p[1] + ' skip lewati tidak entry'));
        d.flow.forEach((x, i) => add(5, 'Langkah ' + (i + 1), 'Metode › ' + x.slice(0, 44), x));
        return L;
    }
    window.METODE = { DEF, SECS, TYPES, ZONES, zoneOf, zoneText, save, useMetode, toText, fromText, searchIndex, get: () => cur };
})();
