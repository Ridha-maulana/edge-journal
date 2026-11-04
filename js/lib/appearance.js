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
        roboto: { name: 'Roboto', desc: 'Netral, ringkas', gf: 'Roboto:wght@400;500;700;900', css: "Roboto," + STACK },
        montserrat: { name: 'Montserrat', desc: 'Lebar, tegas', gf: 'Montserrat:wght@400;500;600;700;800', css: "Montserrat," + STACK },
        dmsans: { name: 'DM Sans', desc: 'Geometris, bersih', gf: 'DM+Sans:wght@400;500;600;700', css: "'DM Sans'," + STACK },
        lexend: { name: 'Lexend', desc: 'Lega, mudah dibaca', gf: 'Lexend:wght@400;500;600;700;800', css: "Lexend," + STACK },
        plex: { name: 'IBM Plex Sans', desc: 'Teknis, serius', gf: 'IBM+Plex+Sans:wght@400;500;600;700', css: "'IBM Plex Sans'," + STACK },
        jetbrains: { name: 'JetBrains Mono', desc: 'Mono, angka sejajar', gf: 'JetBrains+Mono:wght@400;500;600;700;800', css: "'JetBrains Mono',ui-monospace,Menlo,monospace" },
        opensans: { name: 'Open Sans', desc: 'Ramah, klasik', gf: 'Open+Sans:wght@400;500;600;700;800', css: "'Open Sans'," + STACK },
        lato: { name: 'Lato', desc: 'Hangat, seimbang', gf: 'Lato:wght@400;700;900', css: "Lato," + STACK },
        source: { name: 'Source Sans 3', desc: 'Ringkas, profesional', gf: 'Source+Sans+3:wght@400;500;600;700;800', css: "'Source Sans 3'," + STACK },
        worksans: { name: 'Work Sans', desc: 'Tegas, modern', gf: 'Work+Sans:wght@400;500;600;700;800', css: "'Work Sans'," + STACK },
        outfit: { name: 'Outfit', desc: 'Geometris, tipis', gf: 'Outfit:wght@400;500;600;700;800', css: "Outfit," + STACK },
        grotesk: { name: 'Space Grotesk', desc: 'Teknis, unik', gf: 'Space+Grotesk:wght@400;500;600;700', css: "'Space Grotesk'," + STACK },
        sora: { name: 'Sora', desc: 'Futuristik, lebar', gf: 'Sora:wght@400;500;600;700;800', css: "Sora," + STACK },
        rubik: { name: 'Rubik', desc: 'Sudut halus', gf: 'Rubik:wght@400;500;600;700;800', css: "Rubik," + STACK },
        mulish: { name: 'Mulish', desc: 'Minimal, lembut', gf: 'Mulish:wght@400;500;600;700;800', css: "Mulish," + STACK },
        quicksand: { name: 'Quicksand', desc: 'Bulat, ringan', gf: 'Quicksand:wght@400;500;600;700', css: "Quicksand," + STACK },
        figtree: { name: 'Figtree', desc: 'Ramah, bersih', gf: 'Figtree:wght@400;500;600;700;800', css: "Figtree," + STACK },
        vietnam: { name: 'Be Vietnam Pro', desc: 'Rapi, tegas', gf: 'Be+Vietnam+Pro:wght@400;500;600;700;800', css: "'Be Vietnam Pro'," + STACK },
        noto: { name: 'Noto Sans', desc: 'Netral, lengkap', gf: 'Noto+Sans:wght@400;500;600;700;800', css: "'Noto Sans'," + STACK },
        system: { name: 'Sistem', desc: 'Font bawaan HP, paling hemat', gf: '', css: STACK }
    };
    var FONT_ORDER = ['manrope', 'inter', 'poppins', 'nunito', 'jakarta', 'system', 'roboto', 'montserrat', 'dmsans', 'lexend', 'plex', 'jetbrains', 'opensans', 'lato', 'source', 'worksans', 'outfit', 'grotesk', 'sora', 'rubik', 'mulish', 'quicksand', 'figtree', 'vietnam', 'noto'];


    /* ---- tema berbasis pasangan warna (latar + aksen): tema baru & "Warna sendiri" ---- */
    function mix(a, b, k) { var i, o = []; for (i = 0; i < 3; i++) o.push(Math.round(parseInt(a.substr(1 + 2 * i, 2), 16) * (1 - k) + parseInt(b.substr(1 + 2 * i, 2), 16) * k)); return toHex(o); }
    function fill(sp, dark) {
        var b = hsl(sp.bg), h = b[0], s = b[1], f = {}, k;
        for (k in sp) f[k] = sp[k];
        if (dark) {
            f.pn = f.pn || toHex(rgb(h, s, Math.min(b[2] + .04, .5)));
            f.bd = f.bd || toHex(rgb(h, s, Math.min(b[2] + .11, .6)));
            f.tx = f.tx || toHex(rgb(h, Math.min(s, .2), .9));
            f.mu = f.mu || toHex(rgb(h, Math.min(s, .14), .6));
        } else {
            f.pn = f.pn || toHex(rgb(h, s * .5, .99));
            f.bd = f.bd || toHex(rgb(h, s, Math.max(b[2] - .09, 0)));
            f.tx = f.tx || toHex(rgb(h, Math.min(s, .3), .12));
            f.mu = f.mu || toHex(rgb(h, Math.min(s, .15), .42));
        }
        f.p2 = f.p2 || mix(f.pn, f.bd, .3);
        return f;
    }
    function side(sp, dark) {
        var f = fill(sp, dark), b = hsl(f.bg), a = hsl(f.ac), an = {}, ay = lum([parseInt(f.ac.substr(1, 2), 16), parseInt(f.ac.substr(3, 2), 16), parseInt(f.ac.substr(5, 2), 16)]);
        an['#090d18'] = f.bg; an['#0f1629'] = f.pn; an['#111729'] = f.pn; an['#151d32'] = f.p2; an['#1c2640'] = f.bd; an['#202b43'] = f.bd; an['#5d83ff'] = f.ac;
        an['#eef2ff'] = f.tx; an['#ffffff'] = f.tx; an['#8590a8'] = f.mu; an['#7d8bab'] = f.mu; an['#8a94ab'] = f.mu;
        return { anch: an, h: b[0], ns: Math.min(1.3, b[1] / .45), ah: a[0], aL: a[2], ac: (1 - Math.abs(2 * a[2] - 1)) * a[1], txl: hsl(f.tx)[2], on: ay > .4 ? (dark ? f.bg : f.tx) : '#ffffff', f: f };
    }
    function gen(name, sw, d, l) { return { name: name, sw: sw, gen: { dark: side(d, true), light: side(l, false) } }; }
    function derive(bg, ac) {
        var b = hsl(bg), a = hsl(ac), dk = b[2] < .5, D, L;
        var dac = a[2] < .55 ? toHex(rgb(a[0], a[1], .66)) : ac, lac = a[2] > .42 ? toHex(rgb(a[0], a[1], .36)) : ac;
        if (dk) { D = { bg: bg, ac: dac }; L = { bg: toHex(rgb(b[0], Math.min(b[1], .35), .95)), ac: lac }; }
        else { L = { bg: bg, ac: lac }; D = { bg: toHex(rgb(b[0], Math.min(b[1], .4), .085)), ac: dac }; }
        return [D, L];
    }
    function buildCustom(c) { var dl = derive(c.bg, c.ac); THEMES.custom = gen('Warna sendiri', [c.ac, c.bg], dl[0], dl[1]); }
    function validHex(v) { return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v); }
    var custom = { bg: '#0a0a0a', ac: '#c9c6bf' };
    try { var cj = JSON.parse(localStorage.getItem('ej3-custom') || 'null'); if (cj && validHex(cj.bg) && validHex(cj.ac)) custom = { bg: cj.bg.toLowerCase(), ac: cj.ac.toLowerCase() }; } catch (e) { }
    THEMES.white = gen('Putih · Hitam', ['#2e2c29', '#f4f3ef'], { bg: '#151515', pn: '#1c1c1c', bd: '#2b2b2b', ac: '#c9c6bf', tx: '#e4e2dd', mu: '#8f8c86' }, { bg: '#f4f3ef', pn: '#fbfaf7', bd: '#e2e0d9', ac: '#2e2c29', tx: '#232220', mu: '#6b6862' });
    THEMES.grey = gen('Abu-abu · Hitam', ['#33373c', '#a9adb3'], { bg: '#1b1d20', pn: '#23262a', bd: '#33373c', ac: '#aeb4bd', tx: '#e0e3e7', mu: '#8a9099' }, { bg: '#e8e9eb', pn: '#f4f5f6', bd: '#d5d8db', ac: '#33373c', tx: '#1f2226', mu: '#656b73' });
    THEMES.midblack = gen('Midnight · Hitam', ['#9fb0d6', '#1c2a52'], { bg: '#0e1320', pn: '#151c2e', bd: '#243049', ac: '#9fb0d6', tx: '#e1e6f2', mu: '#8590a8' }, { bg: '#eceff5', pn: '#f8f9fc', bd: '#d9dfeb', ac: '#1c2640', tx: '#161d30', mu: '#5f6b85' });
    THEMES.midwhite = gen('Midnight · Putih', ['#dbe3f4', '#1c2a52'], { bg: '#0e1320', pn: '#151c2e', bd: '#243049', ac: '#dbe3f4', tx: '#e1e6f2', mu: '#8590a8' }, { bg: '#edf0f7', pn: '#f9fafd', bd: '#dadfec', ac: '#2a3b6b', tx: '#161d30', mu: '#5f6b85' });
    THEMES.blackwhite = gen('Pure Black · Putih', ['#cfd0d4', '#050505'], { bg: '#050505', pn: '#0e0e0f', bd: '#1e1e20', ac: '#cfd0d4', tx: '#e6e6e8', mu: '#86868c' }, { bg: '#f7f7f8', pn: '#ffffff', bd: '#e4e4e7', ac: '#18181b', tx: '#18181b', mu: '#6a6a70' });
    THEMES.forest = gen('Forest', ['#86c79a', '#0c1410'], { bg: '#0c1410', pn: '#121c16', bd: '#1f2e25', ac: '#86c79a', tx: '#e3ece6', mu: '#85978b' }, { bg: '#f0f4ef', pn: '#fbfdfa', bd: '#d9e3d6', ac: '#3f7a52', tx: '#16201a', mu: '#5d7064' });
    THEMES.coffee = gen('Coffee', ['#d4a574', '#15100d'], { bg: '#15100d', pn: '#1d1713', bd: '#2f251e', ac: '#d4a574', tx: '#eae2d9', mu: '#9a8b7d' }, { bg: '#f6f1ea', pn: '#fdfaf5', bd: '#e6dccf', ac: '#8a5a2b', tx: '#2a201a', mu: '#7a6a5c' });
    THEMES.slate = gen('Slate', ['#7fb4d9', '#0f1419'], { bg: '#0f1419', pn: '#161d25', bd: '#25303b', ac: '#7fb4d9', tx: '#e1e8ee', mu: '#87939f' }, { bg: '#eef2f5', pn: '#fbfcfd', bd: '#d8e0e7', ac: '#2f6c93', tx: '#16202a', mu: '#5f6c78' });
    THEMES.teal = gen('Teal Lembut', ['#6ccbc3', '#0b1415'], { bg: '#0b1415', pn: '#111e1f', bd: '#1e3234', ac: '#6ccbc3', tx: '#e0eeec', mu: '#84989a' }, { bg: '#eef6f5', pn: '#fbfefd', bd: '#d3e6e4', ac: '#1d7d78', tx: '#13201f', mu: '#5b7270' });
    THEMES.slatesalju = gen('Slate Salju', ['#50586c', '#dce2f0'], { bg: '#12151c', pn: '#1a1e27', bd: '#272c38', ac: '#c3cde4' }, { bg: '#edf0f7', pn: '#fafbfd', bd: '#d5dbe9', ac: '#50586c' });
    THEMES.rose = gen('Rose Krem', ['#815854', '#f9ebde'], { bg: '#19110f', pn: '#221816', bd: '#35261f', ac: '#e6c3ad' }, { bg: '#f9f1ea', pn: '#fffaf6', bd: '#ecdccf', ac: '#815854' });
    THEMES.sakura = gen('Biru Sakura', ['#6a7ba2', '#ffdfde'], { bg: '#11141d', pn: '#191d29', bd: '#272d3e', ac: '#f3c9c8' }, { bg: '#fdf1f0', pn: '#fffafa', bd: '#f0d8d7', ac: '#5a6b94' });
    THEMES.navymint = gen('Navy Mint', ['#00203f', '#adefd1'], { bg: '#021a30', pn: '#06243f', bd: '#0f3556', ac: '#adefd1' }, { bg: '#eef9f4', pn: '#fbfffd', bd: '#cfeade', ac: '#00203f' });
    THEMES.terakota = gen('Terakota', ['#cf8360', '#f5c7b8'], { bg: '#1a100c', pn: '#241812', bd: '#3a261d', ac: '#e08c68' }, { bg: '#fcf1ec', pn: '#fff9f6', bd: '#f1d9cd', ac: '#b5603a' });
    THEMES.navyamber = gen('Navy Amber', ['#f2aa4c', '#101820'], { bg: '#101820', pn: '#17212c', bd: '#253240', ac: '#f2aa4c' }, { bg: '#fbf5ea', pn: '#fffcf6', bd: '#efe2c9', ac: '#b46a0f' });
    THEMES.pasir = gen('Pasir', ['#a07855', '#d4b996'], { bg: '#17120d', pn: '#201a14', bd: '#33291f', ac: '#d4b996' }, { bg: '#f6efe3', pn: '#fcf8f0', bd: '#e5d9c4', ac: '#8c6a45' });
    THEMES.hitamputih = gen('Hitam Putih', ['#ffffff', '#000000'], { bg: '#000000', pn: '#0b0b0b', bd: '#1a1a1a', ac: '#ffffff', tx: '#ffffff', mu: '#8a8a8a' }, { bg: '#ffffff', pn: '#f5f5f5', bd: '#e5e5e5', ac: '#000000', tx: '#000000', mu: '#6b6b6b' });
    buildCustom(custom);
    THEME_ORDER = THEME_ORDER.concat(['white', 'grey', 'midblack', 'midwhite', 'blackwhite', 'forest', 'coffee', 'slate', 'teal', 'slatesalju', 'rose', 'sakura', 'navymint', 'terakota', 'navyamber', 'pasir', 'hitamputih', 'custom']);

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
        var g = th.gen && th.gen[mode], an = g ? g.anch[hex] : (th[mode] && th[mode][hex]), out;
        if (an) out = an;
        else if (hex === '#000000') out = hex;
        else {
            var c = hsl(hex), h = c[0], s = c[1], l = c[2], dark = mode === 'dark';
            var bluish = (h >= 205 && h <= 255) || s < .06, cls;
            if (bluish) cls = (l < .3 || l > .82 || s < .35 || (s < .6 && l < .35)) ? 'n' : 'a'; else cls = (s > .2 && l < .3) ? 't' : 'c';
            var rgb0 = rgb(h, s, l), Y = lum(rgb0);
            if (cls === 'n') {
                if (g) {
                    if (s >= .06) { h = g.h; s = Math.min(1, s * g.ns); }
                    if (dark) { if (l > .82) l = Math.min(l, g.txl); }
                    else { var l0 = l; l = lmap(l); if (l0 > .82 && l < g.txl) l = g.txl; }
                } else {
                    if (s >= .06) { h = th.h; s = Math.min(1, s * th.ns); }
                    if (dark) { if (th.lk) l = l * th.lk; }
                    else { l = lmap(l); if (s >= .06) s = Math.min(1, s * .95); }
                }
                out = toHex(rgb(h, s, l));
            } else if (cls === 'a') {
                if (g) {
                    h = g.ah;
                    if (l < .55) { s = Math.min(s, .5) * .5; l = dark ? l * .85 : lmap(l); }
                    else { l = Math.max(.06, Math.min(.96, g.aL * l / .6804)); s = Math.min(.9, g.ac / (1 - Math.abs(2 * l - 1) + .001)); }
                } else {
                    if (th.ah !== 225) { h = th.ah; l = withLum(h, s, Y); }
                    if (!dark) l = l * .8;
                }
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
        st.setProperty('--onacc', th.gen ? th.gen[mode].on : '#fff');
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
    function setCustom(c) {
        if (c.bg && validHex(c.bg)) custom.bg = c.bg.toLowerCase();
        if (c.ac && validHex(c.ac)) custom.ac = c.ac.toLowerCase();
        try { localStorage.setItem('ej3-custom', JSON.stringify(custom)); } catch (e) { }
        buildCustom(custom); cache = {};
        if (state.theme !== 'custom') { state.theme = 'custom'; try { localStorage.setItem(KEY.theme, 'custom'); } catch (e) { } }
        applyColors(); notify();
    }
    function preview(bg, ac, mode) { var dl = derive(bg, ac), s = side(dl[mode === 'light' ? 1 : 0], mode !== 'light'); var f = s.f; return { bg: f.bg, pn: f.pn, bd: f.bd, tx: f.tx, mu: f.mu, ac: f.ac, on: s.on }; }
    var api = {
        THEMES: THEMES, THEME_ORDER: THEME_ORDER, FONTS: FONTS, FONT_ORDER: FONT_ORDER, state: state, set: set, preload: preload, custom: custom, validHex: validHex, setCustom: setCustom, preview: preview, bg: '#090d18', bgRGB: [9, 13, 24, 1], resolved: 'dark',
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
