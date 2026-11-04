/* Tampilan aplikasi: mode (terang/gelap/otomatis), tema warna, font. Dimuat di <head> agar diterapkan sebelum layar tampil pertama kali.
   Semua warna di CSS/JS berupa var(--cN) dari color-table.js; di sini nilainya dihitung ulang per mode + tema. */
(function () {
    var KEY = { mode: 'ej3-mode', theme: 'ej3-theme', font: 'ej3-font' };
    var THEMES = {
        midnight: { name: 'Midnight Blue', h: 222, ns: 1, ah: 225, sw: ['#5d83ff', '#090d18'],
            dark: { '#090d18': '#090d18' },
            light: { '#090d18': '#f2f5fb', '#0f1629': '#ffffff', '#111729': '#ffffff', '#151d32': '#f7f9fd', '#1c2640': '#dde4f2', '#202b43': '#dde4f2', '#5d83ff': '#3b5fe0' } },
        black: { name: 'Pure Black', h: 220, ns: .12, lk: .7, ah: 226, sw: ['#6f8cff', '#000000'],
            dark: { '#090d18': '#000000', '#0f1629': '#0d0f14', '#111729': '#0d0f14', '#151d32': '#12151b', '#1c2640': '#1d2027', '#202b43': '#1d2027', '#5d83ff': '#6f8cff' },
            light: { '#090d18': '#ffffff', '#0f1629': '#f4f5f7', '#111729': '#f4f5f7', '#151d32': '#eceef1', '#1c2640': '#e2e5ea', '#202b43': '#e2e5ea', '#5d83ff': '#2f4fd0' } },
        emerald: { name: 'Emerald', h: 156, ns: .9, ah: 160, sw: ['#34d399', '#08130f'],
            dark: { '#090d18': '#08130f', '#0f1629': '#0d1d17', '#111729': '#0d1d17', '#151d32': '#12261e', '#1c2640': '#1a3328', '#202b43': '#1a3328', '#5d83ff': '#34d399' },
            light: { '#090d18': '#f1f8f5', '#0f1629': '#ffffff', '#111729': '#ffffff', '#151d32': '#f6fbf8', '#1c2640': '#d7eadf', '#202b43': '#d7eadf', '#5d83ff': '#059669' } },
        amber: { name: 'Amber', h: 38, ns: .95, ah: 33, sw: ['#f7af5c', '#130f08'],
            dark: { '#090d18': '#130f08', '#0f1629': '#1c150b', '#111729': '#1c150b', '#151d32': '#241b0f', '#1c2640': '#33270f', '#202b43': '#33270f', '#5d83ff': '#f7af5c' },
            light: { '#090d18': '#fbf6ee', '#0f1629': '#ffffff', '#111729': '#ffffff', '#151d32': '#fdf9f3', '#1c2640': '#efe2cb', '#202b43': '#efe2cb', '#5d83ff': '#c26a0a' } },
        ocean: { name: 'Ocean Cyan', h: 193, ns: .95, ah: 188, sw: ['#22d3ee', '#07141a'],
            dark: { '#090d18': '#07141a', '#0f1629': '#0c1f28', '#111729': '#0c1f28', '#151d32': '#102933', '#1c2640': '#17353f', '#202b43': '#17353f', '#5d83ff': '#22d3ee' },
            light: { '#090d18': '#eff8fb', '#0f1629': '#ffffff', '#111729': '#ffffff', '#151d32': '#f5fbfd', '#1c2640': '#d3e8ef', '#202b43': '#d3e8ef', '#5d83ff': '#0891b2' } }
    };
    var THEME_ORDER = ['midnight', 'black', 'emerald', 'amber', 'ocean'];
    var STACK = "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";
    var FONTS = {
        manrope: { name: 'Manrope', desc: 'Bawaan aplikasi', gf: 'Manrope:wght@400;500;600;700;800', css: "Manrope," + STACK },
        inter: { name: 'Inter', desc: 'Netral, mudah dibaca', gf: 'Inter:wght@400;500;600;700;800', css: "Inter," + STACK },
        poppins: { name: 'Poppins', desc: 'Bulat, tegas', gf: 'Poppins:wght@400;500;600;700;800', css: "Poppins," + STACK },
        nunito: { name: 'Nunito', desc: 'Lembut, ramah', gf: 'Nunito:wght@400;500;600;700;800', css: "Nunito," + STACK },
        jakarta: { name: 'Plus Jakarta Sans', desc: 'Modern, rapi', gf: 'Plus+Jakarta+Sans:wght@400;500;600;700;800', css: "'Plus Jakarta Sans'," + STACK },
        system: { name: 'Sistem', desc: 'Font bawaan HP, paling hemat', gf: '', css: STACK }
    };
    var FONT_ORDER = ['manrope', 'inter', 'poppins', 'nunito', 'jakarta', 'system'];

    function get(k, def, ok) { try { var v = localStorage.getItem(KEY[k]); if (v && ok(v)) return v; } catch (e) { } return def; }
    var state = {
        mode: get('mode', 'dark', function (v) { return v === 'light' || v === 'dark' || v === 'auto'; }),
        theme: get('theme', 'midnight', function (v) { return !!THEMES[v]; }),
        font: get('font', 'manrope', function (v) { return !!FONTS[v]; })
    };

    /* ---- warna ---- */
    function hsl(hex) {
        var r = parseInt(hex.substr(1, 2), 16) / 255, g = parseInt(hex.substr(3, 2), 16) / 255, b = parseInt(hex.substr(5, 2), 16) / 255;
        var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
        if (d) { s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
        return [h, s, l];
    }
    function rgb(h, s, l) {
        h = ((h % 360) + 360) % 360; var c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r, g, b;
        if (h < 60) { r = c; g = x; b = 0; } else if (h < 120) { r = x; g = c; b = 0; } else if (h < 180) { r = 0; g = c; b = x; } else if (h < 240) { r = 0; g = x; b = c; } else if (h < 300) { r = x; g = 0; b = c; } else { r = c; g = 0; b = x; }
        return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
    }
    function toHex(a) { return '#' + a.map(function (v) { v = Math.max(0, Math.min(255, v)); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
    function lum(a) { var f = function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(a[0]) + .7152 * f(a[1]) + .0722 * f(a[2]); }
    function withLum(h, s, Y) { var lo = 0, hi = 1, m = .5, i; for (i = 0; i < 18; i++) { m = (lo + hi) / 2; if (lum(rgb(h, s, m)) < Y) lo = m; else hi = m; } return m; }
    var MAP = [[0, .97], [.08, .96], [.115, 1], [.14, 1], [.18, .905], [.25, .85], [.35, .74], [.5, .5], [1, .04]];
    function lmap(l) { for (var i = 1; i < MAP.length; i++) { if (l <= MAP[i][0]) { var a = MAP[i - 1], b = MAP[i]; return a[1] + (b[1] - a[1]) * (l - a[0]) / (b[0] - a[0]); } } return MAP[MAP.length - 1][1]; }

    var cache = {};
    function xf(hex, th, mode) {
        var key = hex + mode + th.name; if (cache[key]) return cache[key];
        var an = th[mode] && th[mode][hex], out;
        if (an) out = an;
        else if (hex === '#000000') out = hex;
        else {
            var c = hsl(hex), h = c[0], s = c[1], l = c[2], dark = mode === 'dark';
            var bluish = (h >= 205 && h <= 255) || s < .06, cls;
            if (bluish) cls = (l < .3 || l > .82 || s < .35 || (s < .6 && l < .35)) ? 'n' : 'a'; else cls = (s > .2 && l < .3) ? 't' : 'c';
            var rgb0 = rgb(h, s, l), Y = lum(rgb0);
            if (cls === 'n') {
                if (s >= .06) { h = th.h; s = Math.min(1, s * th.ns); }
                if (dark) { if (th.lk) l = l * th.lk; }
                else { l = lmap(l); if (s >= .06) s = Math.min(1, s * .95); }
                out = toHex(rgb(h, s, l));
            } else if (cls === 'a') {
                if (th.ah !== 225) { h = th.ah; l = withLum(h, s, Y); }
                if (!dark) l = l * .8;
                out = toHex(rgb(h, s, l));
            } else if (cls === 't') {
                if (!dark) { l = 1 - l * .55; s = s * .7; }
                out = toHex(rgb(h, s, l));
            } else {
                if (!dark && l >= .3) l = l * .8;
                out = toHex(rgb(h, s, l));
            }
        }
        cache[key] = out; return out;
    }

    /* ---- terapkan ---- */
    var mq = null;
    function resolveMode() {
        if (state.mode !== 'auto') return state.mode;
        try { return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; } catch (e) { return 'dark'; }
    }
    function applyColors() {
        var mode = resolveMode(), th = THEMES[state.theme], root = document.documentElement, st = root.style, H = window.EJ_HEX || [], R = window.EJ_RGB || [], i, v;
        for (i = 0; i < H.length; i++) st.setProperty('--c' + i, (state.theme === 'midnight' && mode === 'dark') ? H[i] : xf(H[i], th, mode));
        for (i = 0; i < R.length; i++) { var p = R[i].split(','); var hx = toHex([+p[0], +p[1], +p[2]]); if (hx === '#000000' && mode === 'light') { st.setProperty('--r' + i, '70,85,130'); continue; } v = (state.theme === 'midnight' && mode === 'dark') ? hx : xf(hx, th, mode); st.setProperty('--r' + i, parseInt(v.substr(1, 2), 16) + ',' + parseInt(v.substr(3, 2), 16) + ',' + parseInt(v.substr(5, 2), 16)); }
        st.colorScheme = mode;
        root.setAttribute('data-mode', mode); root.setAttribute('data-theme', state.theme);
        var bg = xf('#090d18', th, mode);
        api.bg = bg; api.bgRGB = [parseInt(bg.substr(1, 2), 16), parseInt(bg.substr(3, 2), 16), parseInt(bg.substr(5, 2), 16), 1]; api.resolved = mode;
        var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', bg);
    }
    var loaded = {};
    function applyFont() {
        var f = FONTS[state.font], root = document.documentElement;
        if (f.gf && !loaded[state.font]) {
            loaded[state.font] = 1;
            try { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + f.gf + '&display=swap'; document.head.appendChild(l); } catch (e) { }
        }
        root.style.setProperty('--font', f.css); root.style.fontFamily = f.css;
        var b = document.body; if (b) b.style.fontFamily = f.css;
    }
    function preload(k) { var f = FONTS[k]; if (!f || !f.gf || loaded[k]) return; loaded[k] = 1; try { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + f.gf + '&display=swap'; document.head.appendChild(l); } catch (e) { } }
    function notify() { try { window.dispatchEvent(new CustomEvent('ej-appearance')); } catch (e) { } }
    function set(k, v) {
        state[k] = v; try { localStorage.setItem(KEY[k], v); } catch (e) { }
        if (k === 'font') applyFont(); else applyColors();
        notify();
    }
    var api = {
        THEMES: THEMES, THEME_ORDER: THEME_ORDER, FONTS: FONTS, FONT_ORDER: FONT_ORDER, state: state, set: set, preload: preload, bg: '#090d18', bgRGB: [9, 13, 24, 1], resolved: 'dark',
        idx: {}
    };
    (window.EJ_HEX || []).forEach(function (h, i) { api.idx[h] = i; });
    window.EJ = api;
    /* EJC('#rrggbb') -> 'var(--cN)' (ikut mode & tema secara langsung) */
    window.EJC = function (hex) { var i = api.idx[hex]; return i == null ? hex : 'var(--c' + i + ')'; };
    applyColors(); applyFont();
    try { mq = window.matchMedia('(prefers-color-scheme: light)'); var onq = function () { if (state.mode === 'auto') { applyColors(); notify(); } }; if (mq.addEventListener) mq.addEventListener('change', onq); else if (mq.addListener) mq.addListener(onq); } catch (e) { }
    document.addEventListener('DOMContentLoaded', function () { applyFont(); });
})();
