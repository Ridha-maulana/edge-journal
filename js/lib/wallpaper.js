/* Latar aplikasi (v5.9.53): lapisan tetap di belakang seluruh aplikasi. Data gambar di js/lib/wallpapers.js (dibuat docs/gen-wallpapers.py).
   Standar (EJ.state.bg === '') = tidak ada lapisan, latar tema/template halaman utama dipakai seperti biasa. */
(function () {
    var EJ = window.EJ; if (!EJ || !window.EJ_WP) return;
    var CATS = [['dasar', 'Dasar'], ['doff', 'Doff'], ['kaca', 'Kaca'], ['anime', 'Anime'], ['pola', 'Pola']];
    var LIST = window.EJ_WP.map(function (r) { return { k: r[0] + ':' + r[1], cat: r[0], name: r[1], tone: r[2], thumb: r[3], full: r[4] || r[3] }; });
    var BY = {}; LIST.forEach(function (w) { BY[w.k] = w; });
    var layer = null, art = null, dim = null, curK = '';
    /* nada latar vs mode: latar terang di mode gelap (atau sebaliknya) otomatis diredupkan agar teks tetap terbaca; 'a' = ikut warna tema */
    function need(w, mode) {
        var n = 0;
        if (w.tone === 'm') n = .42;
        else if (w.tone !== 'a' && ((w.tone === 'l' && mode === 'dark') || (w.tone === 'd' && mode === 'light'))) n = .8;
        if (w.cat === 'anime') n = Math.max(n, .6); /* gambar ramai: teks tanpa kotak di Tools/Profil tetap terbaca */
        return n;
    }
    function dimOf(w) { return Math.max(((EJ.state.bgd | 0) / 100), need(w, EJ.resolved)); }
    function ensure() {
        if (layer && layer.parentNode) return;
        layer = document.createElement('div'); layer.id = 'ej-wp'; layer.setAttribute('aria-hidden', 'true');
        art = document.createElement('div'); art.className = 'wp-art';
        dim = document.createElement('div'); dim.className = 'wp-dim';
        layer.appendChild(art); layer.appendChild(dim); document.documentElement.appendChild(layer); curK = '';
    }
    EJ.bgApply = function () {
        var w = BY[EJ.state.bg], root = document.documentElement;
        if (!w) { root.removeAttribute('data-bgw'); if (layer && layer.parentNode) layer.parentNode.removeChild(layer); layer = null; return; }
        ensure();
        if (curK !== w.k) { art.innerHTML = w.full.replace(/@/g, 'w'); curK = w.k; art.style.filter = w.cat === 'anime' ? 'blur(1.4px)' : ''; art.style.transform = w.cat === 'anime' ? 'scale(1.03)' : ''; }
        dim.style.opacity = dimOf(w).toFixed(2);
        root.setAttribute('data-bgw', '1'); root.setAttribute('data-bgwt', w.tone);
    };
    EJ.WP = { CATS: CATS, LIST: LIST, BY: BY, thumb: function (w, u) { return w.thumb.replace(/@/g, 't' + u); }, auto: function (w) { return !!w && need(w, EJ.resolved) > (EJ.state.bgd | 0) / 100 + .005; } };
    EJ.bgApply();
})();
