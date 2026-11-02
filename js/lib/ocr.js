/* Membaca teks dari gambar di HP (OCR) memakai Tesseract.js. Dimuat hanya saat fitur Screenshot Trade Entry dipakai. */
"use strict";
const OCR_SRC = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
let _ocrLoading = null;
function loadTesseract() {
    if (window.Tesseract)
        return Promise.resolve(window.Tesseract);
    if (_ocrLoading)
        return _ocrLoading;
    _ocrLoading = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = OCR_SRC;
        s.onload = () => window.Tesseract ? resolve(window.Tesseract) : reject(new Error('ocr-missing'));
        s.onerror = () => { _ocrLoading = null; reject(new Error('ocr-load')); };
        document.head.appendChild(s);
    });
    return _ocrLoading;
}
/* gambar -> canvas abu-abu berkontras tinggi (tema gelap MT5 dibalik jadi teks hitam di latar putih) */
function prepareOcrCanvas(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            try {
                const maxSide = 2600;
                let scale = img.width < 1400 ? 2 : 1;
                scale = Math.min(scale, maxSide / Math.max(img.width, img.height));
                const w = Math.max(1, Math.round(img.width * scale)), h = Math.max(1, Math.round(img.height * scale));
                const c = document.createElement('canvas');
                c.width = w;
                c.height = h;
                const g = c.getContext('2d', { willReadFrequently: true });
                g.drawImage(img, 0, 0, w, h);
                const col = document.createElement('canvas'); // salinan berwarna untuk membaca garis TP/SL di grafik
                col.width = w;
                col.height = h;
                col.getContext('2d').drawImage(c, 0, 0);
                c._color = col;
                const d = g.getImageData(0, 0, w, h), px = d.data;
                let sum = 0;
                const n = px.length / 4;
                for (let i = 0; i < px.length; i += 16)
                    sum += px[i] * .299 + px[i + 1] * .587 + px[i + 2] * .114;
                const dark = sum / (n / 4) < 128;
                for (let i = 0; i < px.length; i += 4) {
                    let v = px[i] * .299 + px[i + 1] * .587 + px[i + 2] * .114;
                    if (dark)
                        v = 255 - v;
                    px[i] = px[i + 1] = px[i + 2] = v;
                }
                g.putImageData(d, 0, 0);
                URL.revokeObjectURL(url);
                resolve(c);
            }
            catch (e) {
                URL.revokeObjectURL(url);
                reject(e);
            }
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('img')); };
        img.src = url;
    });
}
/* Banyak gambar sekaligus: mesin dimuat sekali, gambar dibaca satu per satu. onProgress(0..1, teks) -> array teks per gambar */
async function ocrImageFiles(files, onProgress) {
    const list = [...files], total = list.length, texts = [];
    texts.charts = [];
    let cur = 0;
    const report = (p, t) => { try {
        onProgress && onProgress(Math.min(0.99, (cur + p) / total), (total > 1 ? 'Gambar ' + Math.min(cur + 1, total) + ' dari ' + total + ' \u00B7 ' : '') + t);
    }
    catch (e) { } };
    report(0.02, 'Menyiapkan gambar\u2026');
    const T = await loadTesseract();
    report(0.06, 'Memuat mesin pembaca teks\u2026');
    const worker = await T.createWorker('eng', 1, { logger: m => { if (m && m.status === 'recognizing text')
            report(0.3 + 0.7 * (m.progress || 0), 'Membaca teks\u2026');
        else if (m && /load|init/i.test(m.status || ''))
            report(0.1 + 0.2 * (m.progress || 0), 'Memuat data bahasa\u2026'); } });
    try {
        await worker.setParameters({ tessedit_pageseg_mode: '6', preserve_interword_spaces: '1' });
        for (cur = 0; cur < total; cur++) {
            report(0.1, 'Menyiapkan gambar\u2026');
            try {
                const canvas = await prepareOcrCanvas(list[cur]);
                const { data } = await worker.recognize(canvas);
                texts.push(data.text || '');
                // bukan riwayat MT5 -> coba baca sebagai grafik posisi open (garis BUY/SELL, TP, SL)
                let chart = null;
                try {
                    if (typeof readMt5Chart === 'function' && !(typeof parseMt5Text === 'function' && parseMt5Text(data.text || '').rows.length)) {
                        report(0.9, 'Membaca grafik\u2026');
                        chart = await readMt5Chart(worker, canvas._color);
                        await worker.setParameters({ tessedit_pageseg_mode: '6', tessedit_char_whitelist: '' });
                    }
                }
                catch (e) {
                    chart = null;
                }
                texts.charts.push(chart);
                if (canvas._color)
                    canvas._color.width = canvas._color.height = 1;
                canvas.width = canvas.height = 1; // lepaskan memori gambar
            }
            catch (e) {
                texts.push('');
                texts.charts.push(null);
            }
        }
        return texts;
    }
    finally {
        try {
            await worker.terminate();
        }
        catch (e) { }
    }
}
