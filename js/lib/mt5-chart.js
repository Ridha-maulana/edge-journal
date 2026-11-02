/* Membaca screenshot GRAFIK MT5 yang menampilkan posisi open (garis BUY/SELL, TP, SL) lewat kotak harga di sumbu kanan.
   Dipanggil dari ocr.js dengan worker Tesseract yang sama. Hasil: { entry, sl, tp, side, lots, symbol, ... } atau null. */
"use strict";
/* potong bagian canvas, perbesar, ubah ke abu-abu kontras (mode 'inv' = dibalik, 'max' = kanal terang dibalik) */
function chartCrop(src, x, y, w, h, scale, mode) {
    x = Math.max(0, Math.round(x)); y = Math.max(0, Math.round(y));
    w = Math.max(2, Math.min(src.width - x, Math.round(w))); h = Math.max(2, Math.min(src.height - y, Math.round(h)));
    const pad = 24, c = document.createElement('canvas');
    c.width = w * scale + pad * 2; c.height = h * scale + pad * 2;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
    g.imageSmoothingQuality = 'high';
    g.drawImage(src, x, y, w, h, pad, pad, w * scale, h * scale);
    const d = g.getImageData(0, 0, c.width, c.height), p = d.data;
    let lo = 255, hi = 0;
    const val = new Uint8Array(p.length / 4);
    for (let i = 0, k = 0; i < p.length; i += 4, k++) {
        const v = mode === 'max' ? Math.max(p[i], p[i + 1], p[i + 2]) : p[i] * .299 + p[i + 1] * .587 + p[i + 2] * .114;
        val[k] = v; if (v < lo) lo = v; if (v > hi) hi = v;
    }
    const span = Math.max(1, hi - lo);
    for (let i = 0, k = 0; i < p.length; i += 4, k++) {
        const v = 255 - Math.round((val[k] - lo) / span * 255); // teks gelap di latar putih
        p[i] = p[i + 1] = p[i + 2] = v; p[i + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    return c;
}
async function chartOcr(worker, canvas, psm, whitelist) {
    await worker.setParameters({ tessedit_pageseg_mode: String(psm), tessedit_char_whitelist: whitelist || '' });
    const r = await worker.recognize(canvas);
    return String((r && r.data && r.data.text) || '').trim();
}
/* cari kotak harga BERBINGKAI warna (garis TP/SL/entry) di sumbu harga sebelah kanan */
function chartFindBoxes(canvas) {
    const W = canvas.width, H = canvas.height, g = canvas.getContext('2d', { willReadFrequently: true });
    const x0 = Math.floor(W * .78), sw = W - x0;
    const px = g.getImageData(x0, 0, sw, H).data;
    const minRun = W * .07;
    const rows = [];
    for (let y = 0; y < H; y++) {
        let best = 0, bs = 0, run = 0, rs = 0, r = 0, gg = 0, b = 0, br = 0, bg = 0, bb = 0;
        for (let x = 0; x < sw; x++) {
            const i = (y * sw + x) * 4, R = px[i], G = px[i + 1], B = px[i + 2];
            const mx = Math.max(R, G, B), mn = Math.min(R, G, B);
            if (mx - mn >= 60 && mx >= 90) {
                if (!run) { rs = x; r = gg = b = 0; }
                run++; r += R; gg += G; b += B;
                if (run > best) { best = run; bs = rs; br = r / run; bg = gg / run; bb = b / run; }
            } else run = 0;
        }
        if (best >= minRun) rows.push({ y, xs: bs, xe: bs + best, r: br, g: bg, b: bb });
    }
    // gabungkan baris berurutan menjadi tepi
    const edges = [];
    for (const r of rows) {
        const e = edges[edges.length - 1];
        if (e && r.y - e.y1 <= 1 && Math.abs(r.xs - e.xs) < W * .02) { e.y1 = r.y; e.n++; }
        else edges.push({ y0: r.y, y1: r.y, xs: r.xs, xe: r.xe, r: r.r, g: r.g, b: r.b, n: 1 });
    }
    const thin = edges.filter(e => e.y1 - e.y0 + 1 <= W * .007);
    const boxes = [];
    for (let i = 0; i < thin.length - 1; i++) {
        const a = thin[i], c = thin[i + 1];
        const gap = c.y0 - a.y1;
        if (Math.abs(a.xs - c.xs) <= W * .02 && Math.abs(a.xe - c.xe) <= W * .02 && gap >= W * .012 && gap <= W * .06) {
            boxes.push({ x: x0 + Math.min(a.xs, c.xs), w: Math.max(a.xe, c.xe) - Math.min(a.xs, c.xs), y: a.y0, h: c.y1 - a.y0 + 1, color: [a.r, a.g, a.b] });
            i++;
        }
    }
    // buang kotak terisi penuh (harga terakhir/bid): bagian dalamnya terang, bukan gelap seperti latar
    const bgPx = g.getImageData(x0, Math.floor(H * .25), sw, 1).data;
    const out = [];
    for (const bx of boxes) {
        const ix = bx.x + Math.round(bx.w * .06), iw = Math.round(bx.w * .88), iy = bx.y + Math.round(bx.h * .2), ih = Math.max(2, Math.round(bx.h * .6));
        const d = g.getImageData(ix, iy, iw, ih).data, lum = [];
        for (let i = 0; i < d.length; i += 4) lum.push(d[i] * .299 + d[i + 1] * .587 + d[i + 2] * .114);
        lum.sort((p, q) => p - q);
        const med = lum[Math.floor(lum.length / 2)];
        let bgl = 0; for (let i = 0; i < bgPx.length; i += 4) bgl += bgPx[i] * .299 + bgPx[i + 1] * .587 + bgPx[i + 2] * .114; bgl /= bgPx.length / 4;
        if (Math.abs(med - bgl) < 45) out.push(bx);
    }
    return out.slice(0, 6);
}
function chartParsePrice(txt) {
    const m = String(txt || '').replace(/,/g, '.').match(/\d{2,6}\.\d{1,3}/);
    return m ? Number(m[0]) : null;
}
/* "BUY 0.01" -> 0.01 ; titik sering hilang di hasil baca, jadi digit tanpa titik dibaca 2 desimal (001 -> 0.01) */
function chartParseLots(txts) {
    const votes = {};
    for (const t of txts) {
        const after = String(t).replace(/^[^0-9]*?(?:B[UVL][YV]|SE[LI1!|]{1,3}|8UY)?[^0-9]*/i, '');
        const m = after.match(/\d+(?:[.,]\d+)?/);
        if (!m) continue;
        const s = m[0].replace(',', '.');
        let v = s.includes('.') ? Number(s) : Number(s) / 100;
        if (!isFinite(v) || v <= 0 || v > 100) continue;
        v = Math.round(v * 100) / 100;
        votes[v] = (votes[v] || 0) + 1;
    }
    let best = null, n = 0;
    for (const k in votes) if (votes[k] > n) { n = votes[k]; best = Number(k); }
    return best;
}
const CHART_LAB_VARIANTS = [[4, 'max'], [4, 'inv'], [5, 'max'], [5, 'inv']];
function chartRole(bx) {
    const all = bx.labels.join(' ').toUpperCase();
    bx.isBuy = /B[UVL][YV]|8UY/.test(all);
    bx.isSell = /SE[LI1!|]{1,2}/.test(all) && !bx.isBuy;
    bx.isTp = /\bT\s?P\b/.test(all);
    bx.isSl = /\b[S5]\s?L\b/.test(all) && !bx.isSell;
}
async function readMt5Chart(worker, canvas) {
    const W = canvas.width, H = canvas.height, notes = [];
    const boxes = chartFindBoxes(canvas);
    if (boxes.length < 2) return null;
    // harga tiap kotak + label di kiri garisnya
    for (const bx of boxes) {
        const cy = bx.y + bx.h / 2;
        let val = null;
        for (const mode of ['inv', 'max']) {
            const t = await chartOcr(worker, chartCrop(canvas, bx.x + bx.w * .04, bx.y + bx.h * .12, bx.w * .92, bx.h * .76, Math.max(2, Math.round(80 / bx.h)), mode), 7, '0123456789.');
            val = chartParsePrice(t); if (val != null) break;
        }
        bx.val = val;
        const lab = [];
        bx.labels = lab;
        for (const [sc, mode] of CHART_LAB_VARIANTS) {
            lab.push(await chartOcr(worker, chartCrop(canvas, 0, cy - W * .045, W * .22, W * .035, sc, mode), 7, 'BUYSELTP0123456789. '));
            chartRole(bx);
            if (bx.isBuy || bx.isSell || bx.isTp || bx.isSl) break;
        }
    }
    const ok = boxes.filter(b => b.val != null).sort((a, b) => a.y - b.y); // atas = harga lebih tinggi
    if (ok.length < 2) return null;
    let entryBox = ok.find(b => b.isBuy || b.isSell);
    if (!entryBox && ok.length === 3) entryBox = ok[1];
    if (!entryBox) return null;
    let side = entryBox.isBuy ? 'Long' : entryBox.isSell ? 'Short' : null;
    const others = ok.filter(b => b !== entryBox);
    if (!side) {
        const tpBox = others.find(b => b.isTp);
        if (tpBox) side = tpBox.val > entryBox.val ? 'Long' : 'Short';
    }
    if (!side) { side = 'Long'; notes.push('side'); }
    let sl = null, tp = null;
    for (const b of others) {
        const profitSide = side === 'Long' ? b.val > entryBox.val : b.val < entryBox.val;
        if (profitSide) { if (tp == null) tp = b.val; } else if (sl == null) sl = b.val;
    }
    // lot dari label entry (kumpulkan beberapa hasil baca lalu pilih yang paling sering)
    const ecy = entryBox.y + entryBox.h / 2;
    for (let i = entryBox.labels.length; i < CHART_LAB_VARIANTS.length; i++) {
        const [sc, mode] = CHART_LAB_VARIANTS[i];
        entryBox.labels.push(await chartOcr(worker, chartCrop(canvas, 0, ecy - W * .045, W * .22, W * .035, sc, mode), 7, 'BUYSELTP0123456789. '));
    }
    const lots = chartParseLots(entryBox.labels);
    if (lots == null) notes.push('lots');
    // simbol dari judul grafik
    let symRaw = '', sym = null;
    for (const mode of ['inv', 'max']) {
        const t = await chartOcr(worker, chartCrop(canvas, 0, H * .07, W * .7, H * .15, 2, mode), 6, '');
        const m = t.match(/([A-Z][A-Za-z0-9._]{2,12})\s*[^A-Za-z0-9\s]?\s*(?:M1|M5|M15|M30|H1|H4|D1|W1|MN)\b/);
        if (m) { symRaw = m[1]; sym = mt5NormSymbol(symRaw); if (sym) break; }
        if (/Gold\s*vs/i.test(t)) { symRaw = 'XAUUSD'; sym = 'XAUUSD'; break; }
    }
    if (!sym) notes.push('symbol');
    if (sl == null) notes.push('nosl');
    if (tp == null) notes.push('notp');
    return { chart: true, symbolRaw: symRaw, symbol: sym, side, lots, entry: entryBox.val, sl, tp, notes };
}
