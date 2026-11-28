/* Metode Satu Warna: isi SOP bawaan + penyimpanan teks hasil ubahan (v5.11.4).
   Teks ubahan ikut disimpan di data jurnal (edge-journal-v3, field "metode") sehingga ikut sinkron ke akun online.
   Selama belum diubah, field itu tidak ada dan aplikasi memakai teks bawaan di bawah ini. */
"use strict";
(function () {
    const STORE = 'edge-journal-v3', LOCAL = 'ej-metode-v1'; /* LOCAL: salinan di HP ini, dipakai selama data jurnal belum pernah tersimpan */
    /* tipe: pairs = baris "Judul | isi", lines = satu baris satu butir, text = satu paragraf */
    const TYPES = { info: 'pairs', zones: 'pairs', unlockIntro: 'text', unlock: 'lines', unlockEnd: 'text', alarmNote: 'text', alarms: 'pairs', retest: 'lines', retestDec: 'text', follow: 'lines', followDec: 'text', skipIntro: 'text', skip: 'pairs', flow: 'lines', evalIntro: 'text', modes: 'pairs' };
    const VER = 4; /* isi ubahan versi lama (sebelum SOP H1 Pure Mechanical Sistem, PDF terbaru) diabaikan, aplikasi memakai teks bawaan baru */
    const DEF = {
        info: [['Nama sistem', 'Metode Satu Warna (H1 Pure Mechanical System)'], ['Timeframe acuan', 'H1 Murni (Single Timeframe). Bebas dari lagging H4, mengunci harga diskon optimal di awal pergantian candle H1.'], ['Pasar dan ukuran lot', 'GOLD (XAU/USD) dan Major Forex Pairs. Fixed 0.01 lot (Strict Risk Management: dilarang averaging / martingale).'], ['Parameter exit', 'SL 150 pips / TP 225 pips (R:R = 1 : 1.5) atau SL 200 pips. Wajib dipasang langsung saat eksekusi posisi.'], ['Batas posisi harian', 'Maksimal 3 posisi per hari. Hanya 1 posisi per sesi: Sesi Asia, Sesi London, Sesi New York.']],
        zones: [['Follow Trend 0.0 – 100.0%', 'Follow Trend Utama: awal dorongan tren utama. Syarat: tren utama H1 selaras + bodi H1 SATU WARNA saat alarm + ruang gerak cukup.'], ['Retest / Koreksi 38.2 – 100%', 'Area ayunan normal / retest harga. Syarat: tren utama S&R selaras + bodi H1 SATU WARNA + jarak ke target tidak mepet.'], ['Lanjutan Follow Trend 100 – 161.8%', 'Breakout lanjutan menembus 100%. Wajib 1 candle ekstrem + 1 candle konfirmasi break + tren utama + bodi H1 SATU WARNA.'], ['Zona Terlarang (Ekstensi Jenuh) > 161.8%', 'Pengakhiran impulsif. DILARANG ENTRY (SKIP TOTAL) hingga aturan pembuka zona terpenuhi.']],
        unlockIntro: 'Status DILARANG ENTRY pada area > 161.8% otomatis SELESAI / BATAL dan boleh dianalisis ulang HANYA JIKA memenuhi 2 syarat validasi berikut:',
        unlock: ['Pembentukan candle ekstrem: muncul 1 candle paling atas (High tertinggi untuk tren naik) atau 1 candle paling bawah (Low terendah untuk tren turun).', 'Konfirmasi breakout: candle ekstrem tersebut WAJIB dilewati / ditembus secara terkonfirmasi oleh 1 candle berikutnya (bodi atau ekor menembus titik puncak / dasar candle ekstrem).'],
        unlockEnd: 'Setelah 2 syarat ini terpenuhi, zona terlarang resmi di-reset. Tarik ulang Fibonacci dari titik High / Low ekstrem baru tersebut. Selama syarat belum lengkap, DILARANG KERAS ENTRY.',
        alarmNote: 'Trading hanya dilakukan saat alarm berbunyi. Di luar jam alarm, aplikasi MT5 wajib ditutup (murni mekanikal).',
        alarms: [['Sesi Asia', '09:14:30 | 09:21:30 | 10:14:30 | 10:21:30'], ['Sesi London', '17:14:30 | 17:21:30 | 18:14:30 | 18:21:30'], ['Sesi New York', '21:14:30 | 21:21:30 | 22:14:30 | 22:21:30']],
        retest: ['Syarat 1: berada di zona Level 38.2% hingga 100.0% (area ayunan normal / retest harga).', 'Syarat 2: tren utama S&R H1 selaras dengan arah posisi.', 'Syarat 3: bodi candle H1 saat alarm berbunyi wajib SATU WARNA (searah).', 'Filter: jarak ke target tidak mepet (ruang gerak masih cukup).'],
        retestDec: 'ENTRY RETEST (jika syarat lengkap).',
        follow: ['Zona 0.0 – 100.0% (Follow Trend Utama): tren utama H1 selaras + bodi H1 SATU WARNA saat alarm + ruang gerak cukup.', 'Zona 100.0 – 161.8% (Lanjutan Follow Trend): wajib 1 candle ekstrem + 1 candle konfirmasi break + tren utama + bodi H1 SATU WARNA.', 'Zona > 161.8%: DILARANG ENTRY (SKIP TOTAL) hingga aturan pembuka zona terpenuhi.'],
        followDec: 'ENTRY FOLLOW TREND (jika terkonfirmasi).',
        skipIntro: 'Masalah: saat tren turun, jam alarm pertama sering kali harga sedang retest sebentar (membentuk ekor / wick), sehingga candle H1 masih berwarna Hijau. Solusi: jika tren utama H1 turun, namun candle H1 pada alarm pertama (misal 21:14:30) berwarna Hijau, SKIP JAM PERTAMA dan tutup aplikasi MT5. Buka kembali MT5 saat Alarm Opsi +1 Jam (22:14:30) berbunyi. Jika candle H1 pada jam kedua berubah warna menjadi Merah (searah), ENTRY SELL (mendapatkan harga diskon optimal di atas). Jika jam kedua tetap Hijau / tidak searah, SKIP TOTAL SESI TERSEBUT.',
        skip: [['Tembus 38.2% tanpa konfirmasi', 'Harga menembus 38.2% tetapi belum ada konfirmasi 1 candle yang melewati candle ekstrem.'], ['Zona Terlarang belum valid', 'Harga berada di Zona Terlarang (> 161.8%) dan belum ada konfirmasi 1 candle melewati candle puncak / dasar ekstrem.'], ['Warna H1 tidak searah', 'Warna bodi candle H1 saat alarm berbunyi tidak satu warna / tidak searah dengan tren utama S&R H1.'], ['Jarak ke target mepet', 'Jarak harga ke level target Fibonacci (38.2% / 50.0%) sudah terlalu dekat / mepet.'], ['Sideways murni', 'Kondisi pasar sideways murni (bodi candle H1 berjejer rata tanpa pola ayunan S&R yang jelas).'], ['Sudah ada 1 posisi', 'Sudah terdapat 1 posisi terbuka di sesi berjalan tersebut (maksimal 1 posisi per sesi).']],
        flow: ['Alarm utama sesi (:14:30 WIB): buka MT5. Cek tren utama S&R H1 dan tentukan zona Fibonacci harga saat ini (0–100% / 38–100% / 100–161.8% / > 161.8%).', 'Verifikasi filter warna dan konfirmasi breakout: apakah bodi candle H1 SATU WARNA dengan tren utama H1? Satu warna dan syarat zona lengkap: lanjut ke langkah 3. Beda warna / sedang retest wick: SKIP jam pertama, buka lagi saat Alarm Opsi +1 Jam (:14:30 jam berikutnya). Zona Terlarang (> 161.8%) belum valid breakout candle ekstrem: SKIP TOTAL SESI INI.', 'Eksekusi posisi dan parameter exit: entry lot fixed 0.01. Pasang langsung Target Profit (TP 225 pips) dan Stop Loss (SL 150 pips / 200 pips).', 'Wajib tutup aplikasi MT5 (:21:30 WIB): saat alarm penutup berbunyi, WAJIB menutup MT5. Dilarang mengintip chart atau intervensi manual (cut loss / shift SL / averaging).'],
        evalIntro: 'Jalankan seluruh aturan baku di atas secara konsisten tanpa mengubah SOP sedikit pun hingga terkumpul 100 sampel transaksi posisi. Catat setiap transaksi ke dalam logbook trading dengan mengelompokkan 4 mode evaluasi utama:',
        modes: [['1. Follow Trend', 'Eksekusi pada zona 0.0 – 100.0% yang searah dengan tren utama S&R H1.'], ['2. Retest / Koreksi', 'Eksekusi pada zona ayunan 38.2% – 100.0% setelah harga menyelesaikan retest.'], ['3. Lanjutan Break', 'Eksekusi pada zona 100.0% – 161.8% setelah terkonfirmasi candle ekstrem + break.'], ['4. Pelanggaran (Deviasi)', 'Posisi yang terambil akibat eksekusi di luar SOP (untuk mengukur tingkat kedisiplinan emosional).']]
    };
    const SECS = [
        { n: 1, id: 'parameter', title: 'Parameter sistem dan manajemen risiko', fields: [['info', 'Parameter sistem', 'Satu baris satu butir, format: Judul | isi']] },
        { n: 2, id: 'zoning', title: 'Zoning Fibonacci dan jadwal alarm 3 sesi', fields: [['zones', 'Tangga zona Fibonacci', 'Satu baris satu zona, format: Judul + rentang | isi. Warna mengikuti urutan baris.'], ['unlockIntro', 'Aturan baku zona terlarang: pembuka'], ['unlock', 'Aturan baku zona terlarang: 2 syarat validasi', 'Satu baris satu syarat'], ['unlockEnd', 'Aturan baku zona terlarang: penutup'], ['alarmNote', 'Catatan jadwal alarm'], ['alarms', 'Jadwal alarm sesi', 'Satu baris satu sesi, format: Sesi | Alarm utama | Tutup MT5 | Opsi +1 jam | Tutup opsi']] },
        { n: 3, id: 'entry', title: 'Matriks keputusan entry berdasarkan zona', fields: [['retest', 'Syarat Zona Retest (38.2 – 100%)', 'Satu baris satu syarat'], ['retestDec', 'Keputusan Retest'], ['follow', 'Syarat Follow Trend dan Lanjutan (0.0 – 161.8%)', 'Satu baris satu syarat'], ['followDec', 'Keputusan Follow Trend']] },
        { n: 4, id: 'skip', title: 'Aturan opsi +1 jam dan kondisi wajib skip', fields: [['skipIntro', 'Aturan Opsi +1 Jam'], ['skip', 'Kondisi wajib Skip', 'Satu baris satu butir, format: Judul | isi']] },
        { n: 5, id: 'alur', title: 'Checklist eksekusi dan alur disiplin kerja', fields: [['flow', 'Langkah kerja', 'Satu baris satu langkah']] },
        { n: 6, id: 'evaluasi', title: 'Target evaluasi dan dokumentasi data (100 posisi)', fields: [['evalIntro', 'Pengantar evaluasi'], ['modes', '4 mode evaluasi', 'Satu baris satu mode, format: Mode | fokus evaluasi']] }
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
        add(2, 'Aturan baku zona terlarang', 'Metode › Zona terlarang > 161.8%', d.unlockIntro + ' ' + d.unlock.join(' ') + ' ' + d.unlockEnd + ' reset fibonacci candle ekstrem breakout');
        d.alarms.forEach(p => add(2, p[0], 'Metode › Jadwal alarm', p[1] + ' alarm sesi jam'));
        d.retest.forEach((x, i) => add(3, 'Zona Retest · syarat ' + (i + 1), 'Metode › ' + x.split(':')[0].slice(0, 44), x, 'retest'));
        d.follow.forEach((x, i) => add(3, 'Zona Follow Trend · syarat ' + (i + 1), 'Metode › ' + x.split(':')[0].slice(0, 44), x, 'follow'));
        add(4, 'Aturan Opsi +1 Jam', 'Metode › Opsi +1 jam', d.skipIntro + ' opsi jam kedua');
        d.skip.forEach(p => add(4, p[0], 'Metode › Kondisi Skip', p[1] + ' skip lewati tidak entry'));
        d.flow.forEach((x, i) => add(5, 'Langkah ' + (i + 1), 'Metode › ' + x.slice(0, 44), x));
        d.modes.forEach(p => add(6, p[0], 'Metode › Evaluasi 100 posisi', p[1] + ' evaluasi mode logbook'));
        return L;
    }
    window.METODE = { DEF, SECS, TYPES, ZONES, zoneOf, zoneText, save, useMetode, toText, fromText, searchIndex, get: () => cur };
})();
