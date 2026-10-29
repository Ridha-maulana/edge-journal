/* Simpan/unduh file dan baca file jadi data URL */
"use strict";
async function saveFile(filename, text, mime) {
    try {
        const dl = window.claude ? await window.claude.use('downloads') : null;
        if (dl) {
            await dl.save({ filename, data: text });
            notify('File siap disimpan: ' + filename);
            return;
        }
    }
    catch (e) {
        if (e && e.code === 'declined')
            return;
        notify('Gagal menyimpan file: ' + ((e === null || e === void 0 ? void 0 : e.message) || e));
        return;
    }
    // Aplikasi Android (Capacitor): unduhan blob tidak jalan di WebView, simpan lewat plugin lalu buka menu bagikan/simpan
    try {
        const cap = window.Capacitor;
        if (cap && cap.isNativePlatform && cap.isNativePlatform()) {
            const plug = n => (cap.Plugins && cap.Plugins[n]) || cap.registerPlugin(n);
            const w = await plug('Filesystem').writeFile({ path: filename, data: text, directory: 'CACHE', encoding: 'utf8' });
            await plug('Share').share({ title: filename, url: w.uri, dialogTitle: 'Simpan atau bagikan file' });
            return;
        }
    }
    catch (e) {
        if (!/cancel/i.test(String((e && e.message) || e)))
            notify('Gagal menyimpan file: ' + ((e && e.message) || e));
        return;
    }
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
/* Aplikasi Android (Capacitor): plugin native dipanggil lewat registerPlugin (halaman dimuat dari alamat jarak jauh) */
function capNative() { try { const c = window.Capacitor; return (c && c.isNativePlatform && c.isNativePlatform()) ? c : null; } catch (e) { return null; } }
function capPlugin(name) { const c = capNative(); return c ? ((c.Plugins && c.Plugins[name]) || c.registerPlugin(name)) : null; }
/* simpan blob ke cache aplikasi lalu buka menu bagikan Android (WhatsApp, Instagram, Drive, dst.) */
async function nativeShareBlob(blob, filename, title) {
    const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = () => rej(r.error); r.readAsDataURL(blob); });
    const w = await capPlugin('Filesystem').writeFile({ path: filename, data: b64, directory: 'CACHE' });
    await capPlugin('Share').share({ title: title || filename, url: w.uri, dialogTitle: title || 'Bagikan gambar' });
}
function fileToDataUrl(file) { return new Promise(resolve => { if (!file)
    return resolve(null); const reader = new FileReader(); reader.onload = () => { const img = new Image(); img.onload = () => { const scale = Math.min(1, 900 / img.width); const canvas = document.createElement('canvas'); canvas.width = img.width * scale; canvas.height = img.height * scale; canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg', .72)); }; img.src = reader.result; }; reader.readAsDataURL(file); }); }
