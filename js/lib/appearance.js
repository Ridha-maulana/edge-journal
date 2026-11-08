/* Tampilan aplikasi: mode (terang/gelap/otomatis), tema warna, font. Dimuat di <head> agar diterapkan sebelum layar tampil pertama kali.
   Semua warna di CSS/JS berupa var(--cN) dari color-table.js; di sini nilainya dihitung ulang per mode + tema. */
(function () {
    var KEY = { mode: 'ej3-mode', theme: 'ej3-theme', font: 'ej3-font', fx: 'ej3-fx', fxs: 'ej3-fxs' };
    /* efek tampilan yang bisa dinyalakan sendiri-sendiri: latar, kartu, tombol, ikon (kartu), hdr (ikon header), nav (ikon menu bawah), gerak */
    var FX_KEYS = ['latar', 'kartu', 'tombol', 'ikon', 'hdr', 'nav', 'gerak'];
    var FX_DEFAULT = ['latar', 'kartu', 'tombol', 'ikon', 'hdr', 'gerak'];
    var THEMES = {};
    var THEME_ORDER = [];
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
        system: { name: 'Sistem', desc: 'Font bawaan HP, paling hemat', gf: '', css: STACK },
        sfpro: { name: 'SF Pro (Apple)', desc: 'Font iPhone & Mac; di Android tampil mirip (Inter)', gf: 'Inter:wght@400;500;600;700;800', css: "-apple-system,BlinkMacSystemFont,'SF Pro Text','SF Pro Display',Inter," + STACK },
        sfrounded: { name: 'SF Rounded (Apple)', desc: 'Bulat ala Apple; di Android tampil Nunito', gf: 'Nunito:wght@400;500;600;700;800', css: "ui-rounded,'SF Pro Rounded',Nunito," + STACK },
        helvetica: { name: 'Helvetica Neue (Apple)', desc: 'Klasik Apple; di Android tampil Arimo', gf: 'Arimo:wght@400;500;600;700', css: "'Helvetica Neue',Helvetica,Arimo," + STACK },
        avenir: { name: 'Avenir Next (Apple)', desc: 'Hangat, geometris; di Android Nunito Sans', gf: 'Nunito+Sans:wght@400;500;600;700;800', css: "'Avenir Next',Avenir,'Nunito Sans'," + STACK },
        futura: { name: 'Futura (Apple)', desc: 'Geometris klasik; di Android tampil Jost', gf: 'Jost:wght@400;500;600;700;800', css: "Futura,'Futura PT',Jost," + STACK },
        newyork: { name: 'New York (Apple)', desc: 'Serif ala Apple; di Android Source Serif', gf: 'Source+Serif+4:wght@400;500;600;700;800', css: "ui-serif,'New York','Source Serif 4',Georgia,serif" },
        sfmono: { name: 'SF Mono (Apple)', desc: 'Mono ala Apple, angka sejajar', gf: 'Roboto+Mono:wght@400;500;600;700', css: "ui-monospace,'SF Mono',SFMono-Regular,'Roboto Mono',Menlo,monospace" },
        intertight: { name: 'Inter Tight', desc: 'Inter lebih rapat, hemat tempat', gf: 'Inter+Tight:wght@400;500;600;700;800', css: "'Inter Tight'," + STACK },
        albert: { name: 'Albert Sans', desc: 'Modern, geometris halus', gf: 'Albert+Sans:wght@400;500;600;700;800', css: "'Albert Sans'," + STACK },
        onest: { name: 'Onest', desc: 'Bersih, tegas, modern', gf: 'Onest:wght@400;500;600;700;800', css: "Onest," + STACK },
        geist: { name: 'Geist', desc: 'Gaya pengembang, tajam, rapi', gf: 'Geist:wght@400;500;600;700;800', css: "Geist," + STACK },
        schibsted: { name: 'Schibsted Grotesk', desc: 'Editorial, jelas', gf: 'Schibsted+Grotesk:wght@400;500;600;700;800', css: "'Schibsted Grotesk'," + STACK },
        hanken: { name: 'Hanken Grotesk', desc: 'Netral, nyaman dibaca', gf: 'Hanken+Grotesk:wght@400;500;600;700;800', css: "'Hanken Grotesk'," + STACK },
        instrument: { name: 'Instrument Sans', desc: 'Modern, ringkas', gf: 'Instrument+Sans:wght@400;500;600;700', css: "'Instrument Sans'," + STACK },
        redhat: { name: 'Red Hat Display', desc: 'Tegas, ramah', gf: 'Red+Hat+Display:wght@400;500;600;700;800', css: "'Red Hat Display'," + STACK },
        urbanist: { name: 'Urbanist', desc: 'Geometris, lapang', gf: 'Urbanist:wght@400;500;600;700;800', css: "Urbanist," + STACK },
        publicsans: { name: 'Public Sans', desc: 'Netral, jelas', gf: 'Public+Sans:wght@400;500;600;700;800', css: "'Public Sans'," + STACK },
        karla: { name: 'Karla', desc: 'Grotesk hangat', gf: 'Karla:wght@400;500;600;700;800', css: "Karla," + STACK },
        barlow: { name: 'Barlow', desc: 'Industrial, ringkas', gf: 'Barlow:wght@400;500;600;700;800', css: "Barlow," + STACK },
        heebo: { name: 'Heebo', desc: 'Netral, ringan', gf: 'Heebo:wght@400;500;600;700;800', css: "Heebo," + STACK },
        cabin: { name: 'Cabin', desc: 'Humanis, lembut', gf: 'Cabin:wght@400;500;600;700', css: "Cabin," + STACK },
        raleway: { name: 'Raleway', desc: 'Elegan, tipis', gf: 'Raleway:wght@400;500;600;700;800', css: "Raleway," + STACK },
        josefin: { name: 'Josefin Sans', desc: 'Vintage geometris', gf: 'Josefin+Sans:wght@400;500;600;700', css: "'Josefin Sans'," + STACK },
        archivo: { name: 'Archivo', desc: 'Grotesk kokoh', gf: 'Archivo:wght@400;500;600;700;800', css: "Archivo," + STACK },
        epilogue: { name: 'Epilogue', desc: 'Editorial, berkarakter', gf: 'Epilogue:wght@400;500;600;700;800', css: "Epilogue," + STACK },
        overpass: { name: 'Overpass', desc: 'Terinspirasi Highway Gothic', gf: 'Overpass:wght@400;500;600;700;800', css: "Overpass," + STACK },
        librefranklin: { name: 'Libre Franklin', desc: 'Klasik Amerika, tegas', gf: 'Libre+Franklin:wght@400;500;600;700;800', css: "'Libre Franklin'," + STACK },
        bricolage: { name: 'Bricolage Grotesque', desc: 'Unik, ekspresif', gf: 'Bricolage+Grotesque:wght@400;500;600;700;800', css: "'Bricolage Grotesque'," + STACK },
        lexenddeca: { name: 'Lexend Deca', desc: 'Lega, mudah dibaca', gf: 'Lexend+Deca:wght@400;500;600;700;800', css: "'Lexend Deca'," + STACK },
        lora: { name: 'Lora', desc: 'Serif, hangat', gf: 'Lora:wght@400;500;600;700', css: "Lora,Georgia,serif" },
        merriweather: { name: 'Merriweather', desc: 'Serif, nyaman dibaca layar', gf: 'Merriweather:wght@400;700;900', css: "Merriweather,Georgia,serif" },
        playfair: { name: 'Playfair Display', desc: 'Serif, elegan', gf: 'Playfair+Display:wght@400;500;600;700;800', css: "'Playfair Display',Georgia,serif" },
        robotomono: { name: 'Roboto Mono', desc: 'Mono, angka sejajar', gf: 'Roboto+Mono:wght@400;500;600;700', css: "'Roboto Mono',ui-monospace,Menlo,monospace" },
        firacode: { name: 'Fira Code', desc: 'Mono, gaya kode', gf: 'Fira+Code:wght@400;500;600;700', css: "'Fira Code',ui-monospace,Menlo,monospace" },
        plexmono: { name: 'IBM Plex Mono', desc: 'Mono, teknis', gf: 'IBM+Plex+Mono:wght@400;500;600;700', css: "'IBM Plex Mono',ui-monospace,Menlo,monospace" },
        spacemono: { name: 'Space Mono', desc: 'Mono, retro-futuristik', gf: 'Space+Mono:wght@400;700', css: "'Space Mono',ui-monospace,Menlo,monospace" },
        dmmono: { name: 'DM Mono', desc: 'Mono, lembut', gf: 'DM+Mono:wght@400;500', css: "'DM Mono',ui-monospace,Menlo,monospace" },
        fredoka: { name: 'Fredoka', desc: 'Bulat, ceria', gf: 'Fredoka:wght@400;500;600;700', css: "Fredoka," + STACK },
        baloo: { name: 'Baloo 2', desc: 'Bulat, ramah', gf: 'Baloo+2:wght@400;500;600;700;800', css: "'Baloo 2'," + STACK },
        atkinson: { name: 'Atkinson Hyperlegible', desc: 'Sangat jelas, ramah penglihatan', gf: 'Atkinson+Hyperlegible:wght@400;700', css: "'Atkinson Hyperlegible'," + STACK },
        nunitosans: { name: 'Nunito Sans', desc: 'Lembut, jernih', gf: 'Nunito+Sans:wght@400;500;600;700;800', css: "'Nunito Sans'," + STACK },
        jost: { name: 'Jost', desc: 'Geometris, ala Futura', gf: 'Jost:wght@400;500;600;700;800', css: "Jost," + STACK },
        ptsans: { name: 'PT Sans', desc: 'Humanis, hangat', gf: 'PT+Sans:wght@400;700', css: "'PT Sans'," + STACK },
        ubuntu: { name: 'Ubuntu', desc: 'Bersahabat, khas', gf: 'Ubuntu:wght@400;500;700', css: "Ubuntu," + STACK },
        titillium: { name: 'Titillium Web', desc: 'Teknis, tajam', gf: 'Titillium+Web:wght@400;600;700', css: "'Titillium Web'," + STACK },
        kumbh: { name: 'Kumbh Sans', desc: 'Geometris, lapang', gf: 'Kumbh+Sans:wght@400;500;600;700;800', css: "'Kumbh Sans'," + STACK },
        syne: { name: 'Syne', desc: 'Modern, ekspresif', gf: 'Syne:wght@400;500;600;700;800', css: "Syne," + STACK },
        readex: { name: 'Readex Pro', desc: 'Lega, mudah dibaca', gf: 'Readex+Pro:wght@400;500;600;700', css: "'Readex Pro'," + STACK },
        sarabun: { name: 'Sarabun', desc: 'Rapi, ringkas', gf: 'Sarabun:wght@400;500;600;700;800', css: "Sarabun," + STACK },
        prompt: { name: 'Prompt', desc: 'Tegas, modern', gf: 'Prompt:wght@400;500;600;700;800', css: "Prompt," + STACK },
        gabarito: { name: 'Gabarito', desc: 'Bulat, berkarakter', gf: 'Gabarito:wght@400;500;600;700;800', css: "Gabarito," + STACK },
        wixmadefor: { name: 'Wix Madefor Display', desc: 'Bersih, elegan', gf: 'Wix+Madefor+Display:wght@400;500;600;700;800', css: "'Wix Madefor Display'," + STACK },
        redditsans: { name: 'Reddit Sans', desc: 'Ramah, jelas', gf: 'Reddit+Sans:wght@400;500;600;700;800', css: "'Reddit Sans'," + STACK },
        afacad: { name: 'Afacad', desc: 'Ringan, bersih', gf: 'Afacad:wght@400;500;600;700', css: "Afacad," + STACK },
        sourceserif: { name: 'Source Serif 4', desc: 'Serif, nyaman dibaca', gf: 'Source+Serif+4:wght@400;500;600;700;800', css: "'Source Serif 4',Georgia,serif" },
        crimson: { name: 'Crimson Pro', desc: 'Serif, klasik', gf: 'Crimson+Pro:wght@400;500;600;700;800', css: "'Crimson Pro',Georgia,serif" },
        spectral: { name: 'Spectral', desc: 'Serif, editorial', gf: 'Spectral:wght@400;500;600;700;800', css: "Spectral,Georgia,serif" },
        sourcecode: { name: 'Source Code Pro', desc: 'Mono, gaya kode', gf: 'Source+Code+Pro:wght@400;500;600;700', css: "'Source Code Pro',ui-monospace,Menlo,monospace" },
        geistmono: { name: 'Geist Mono', desc: 'Mono, tajam', gf: 'Geist+Mono:wght@400;500;600;700;800', css: "'Geist Mono',ui-monospace,Menlo,monospace" },
        inconsolata: { name: 'Inconsolata', desc: 'Mono, ringkas', gf: 'Inconsolata:wght@400;500;600;700;800', css: "Inconsolata,ui-monospace,Menlo,monospace" }
    };
    var FONT_ORDER = ['manrope', 'inter', 'poppins', 'nunito', 'jakarta', 'system', 'roboto', 'montserrat', 'dmsans', 'lexend', 'plex', 'jetbrains', 'opensans', 'lato', 'source', 'worksans', 'outfit', 'grotesk', 'sora', 'rubik', 'mulish', 'quicksand', 'figtree', 'vietnam', 'noto', 'sfpro', 'sfrounded', 'helvetica', 'avenir', 'futura', 'newyork', 'sfmono', 'intertight', 'albert', 'onest', 'geist', 'schibsted', 'hanken', 'instrument', 'redhat', 'urbanist', 'publicsans', 'karla', 'barlow', 'heebo', 'cabin', 'raleway', 'josefin', 'archivo', 'epilogue', 'overpass', 'librefranklin', 'bricolage', 'lexenddeca', 'lora', 'merriweather', 'playfair', 'robotomono', 'firacode', 'plexmono', 'spacemono', 'dmmono', 'fredoka', 'baloo', 'atkinson', 'nunitosans', 'jost', 'ptsans', 'ubuntu', 'titillium', 'kumbh', 'syne', 'readex', 'sarabun', 'prompt', 'gabarito', 'wixmadefor', 'redditsans', 'afacad', 'sourceserif', 'crimson', 'spectral', 'sourcecode', 'geistmono', 'inconsolata'];


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
        f.so = f.so || mix(f.pn, f.ac, dark ? .2 : .14);
        return f;
    }
    function side(sp, dark) {
        var f = fill(sp, dark), b = hsl(f.bg), a = hsl(f.ac), an = {}, ay = lum([parseInt(f.ac.substr(1, 2), 16), parseInt(f.ac.substr(3, 2), 16), parseInt(f.ac.substr(5, 2), 16)]);
        an['#090d18'] = f.bg; an['#0f1629'] = f.pn; an['#111729'] = f.pn; an['#151d32'] = f.p2; an['#1c2640'] = f.bd; an['#202b43'] = f.bd; an['#5d83ff'] = f.ac;
        an['#18284b'] = f.pn; an['#131c35'] = f.pn; an['#10182b'] = f.pn; an['#10182a'] = f.pn; an['#2a3a60'] = f.bd; an['#202d47'] = f.bd; an['#162144'] = f.so; an['#112250'] = f.so; an['#172454'] = f.so;
        an['#eef2ff'] = f.tx; an['#ffffff'] = f.tx; an['#8590a8'] = f.mu; an['#7d8bab'] = f.mu; an['#8a94ab'] = f.mu;
        return { anch: an, h: b[0], ns: Math.min(1.3, b[1] / .45), ah: a[0], aL: a[2], ac: (1 - Math.abs(2 * a[2] - 1)) * a[1], txl: hsl(f.tx)[2], on: ay > .4 ? (dark ? f.bg : f.tx) : '#ffffff', f: f, dk: dark };
    }
    function gen(name, sw, d, l) { return { name: name, sw: sw, gen: { dark: side(d, true), light: side(l, false) } }; }
    function derive(bg, ac) {
        var b = hsl(bg), a = hsl(ac), dk = b[2] < .5, D, L;
        var dac = a[2] < .55 ? toHex(rgb(a[0], a[1], .66)) : ac, lac = a[2] > .42 ? toHex(rgb(a[0], a[1], .36)) : ac;
        if (dk) { D = { bg: bg, ac: dac }; L = { bg: toHex(rgb(b[0], Math.min(b[1], .35), .95)), ac: lac }; }
        else { L = { bg: bg, ac: lac }; D = { bg: toHex(rgb(b[0], Math.min(b[1], .4), .085)), ac: dac }; }
        return [D, L];
    }
    function buildCustom(c) { var dl = derive(c.bg, c.ac); THEMES.custom = gen('Warna sendiri', [c.ac, c.bg], dl[0], dl[1]); THEMES.custom.grad = [dl[1].ac, dl[0].ac]; THEMES.custom.tag = 'Pilih latar dan aksen sendiri'; THEMES.custom.cat = 'Kustom'; }
    function validHex(v) { return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v); }
    var custom = { bg: '#0a0a0a', ac: '#c9c6bf' };
    try { var cj = JSON.parse(localStorage.getItem('ej3-custom') || 'null'); if (cj && validHex(cj.bg) && validHex(cj.ac)) custom = { bg: cj.bg.toLowerCase(), ac: cj.ac.toLowerCase() }; } catch (e) { }
    /* 78 tema aplikasi (sumber: gambar rujukan; 29-48 = seri "Soft & Muted"; 49-78 = seri "Dasar & netral"). Tiap tema: [id, nama, sifat, kategori, terang[canvas,surface,ink,primary,soft], gelap[...]] */
    var RAW = [
        ['mint', 'Mint Finance', 'Bersih · profesional · terpercaya', 'Dashboard & finance', ['#f4f8f6', '#ffffff', '#19312f', '#20a67a', '#ddf4ec'], ['#0d1f1b', '#142c27', '#f1fbf7', '#3fd09c', '#173c34']],
        ['indigo', 'Indigo SaaS', 'Teknologis · fokus · premium', 'SaaS & productivity', ['#f5f7ff', '#ffffff', '#18233d', '#5b67f1', '#e9ecff'], ['#0f1225', '#1a1f3d', '#f4f5ff', '#7d8aff', '#283064']],
        ['coral', 'Warm Coral', 'Humanis · kreatif · berani', 'Brand & commerce', ['#fff8f4', '#ffffff', '#2b1c1a', '#f27d61', '#ffe9e0'], ['#241310', '#351e19', '#fff3ee', '#ff9c82', '#532a20']],
        ['ocean', 'Ocean Blue', 'Tenang · kredibel · digital', 'Fintech & digital', ['#f3f8fc', '#ffffff', '#17314a', '#2789c4', '#ddeffb'], ['#0b1e2c', '#123149', '#eef8ff', '#4db7f0', '#194969']],
        ['sage', 'Forest Sage', 'Natural · stabil · sustainable', 'Climate & wellness', ['#f4f8f3', '#ffffff', '#21382a', '#5b9b72', '#e1f1e5'], ['#102117', '#183524', '#f0fbf2', '#76c98d', '#214b31']],
        ['violet', 'Violet Night', 'Kreatif · premium · eksperimental', 'Creative tools', ['#f8f6ff', '#ffffff', '#29213f', '#8b6cf2', '#eee9ff'], ['#171126', '#251a3f', '#f8f3ff', '#a996ff', '#3a2a61']],
        ['amber', 'Solar Amber', 'Optimistis · hangat · energetic', 'Events & lifestyle', ['#fffaef', '#ffffff', '#3b2d16', '#e6a629', '#fff0c8'], ['#241a08', '#3a290d', '#fff8e6', '#ffc94d', '#5b410e']],
        ['berry', 'Rose Berry', 'Humanis · fashionable · expressive', 'Fashion & social', ['#fff5f8', '#ffffff', '#3b1e2c', '#d85c83', '#fbe0ea'], ['#26111b', '#3c1828', '#fff1f6', '#f47fa3', '#5b2540']],
        ['cyan', 'Slate Cyan', 'Modern · teknis · jelas', 'Analytics & hardware', ['#f2fafb', '#ffffff', '#1c343a', '#2aaec0', '#d9f4f6'], ['#0e2024', '#15363b', '#f3fcfd', '#58d0de', '#1c555d']],
        ['lemon', 'Lemon Graphite', 'Berani · editorial · kontras', 'Editorial & media', ['#f8faf0', '#ffffff', '#252a1a', '#a9b938', '#eef3cd'], ['#191d14', '#2b321a', '#f4f7e8', '#d4e24d', '#424b1d']],
        ['plum', 'Plum Luxe', 'Elegan · artsy · sophisticated', 'Luxury & portfolio', ['#fbf7fc', '#ffffff', '#33203a', '#a567c2', '#f0e1f5'], ['#1e1222', '#321b39', '#fff4ff', '#c58adf', '#522c5e']],
        ['aqua', 'Aqua Breeze', 'Segar · ringan · friendly', 'Travel & health', ['#f0faf9', '#ffffff', '#163a39', '#26a69a', '#d7f2ef'], ['#0d2423', '#133b39', '#effffd', '#55d2c5', '#1c514d']],
        ['mono', 'Mono Minimal', 'Fokus · timeless · universal', 'System & portfolio', ['#f5f6f7', '#ffffff', '#1c2328', '#5d6870', '#e3e7e9'], ['#121517', '#20272b', '#f2f5f6', '#aab8be', '#36434a']],
        ['github', 'GitHub', 'Developer · open source', 'Code & documentation', ['#f6f8fa', '#ffffff', '#24292f', '#2f81f7', '#ddf4ff'], ['#0d1117', '#161b22', '#f0f6fc', '#58a6ff', '#1f6feb']],
        ['facebook', 'Facebook', 'Social · community', 'Community & social', ['#f0f2f5', '#ffffff', '#1c1e21', '#1877f2', '#e7f3ff'], ['#18191a', '#242526', '#f5f6f7', '#4599ff', '#263951']],
        ['youtube', 'YouTube', 'Video · creator', 'Video & creator', ['#fff7f7', '#ffffff', '#0f0f0f', '#ff0000', '#ffe5e5'], ['#0f0f0f', '#212121', '#ffffff', '#ff0000', '#4a1717']],
        ['telegram', 'Telegram', 'Messaging · fast', 'Messaging & community', ['#f2fafe', '#ffffff', '#17212b', '#229ed9', '#ddf3ff'], ['#17212b', '#202b36', '#f5fbff', '#2aabee', '#1f4b65']],
        ['x', 'X / Twitter', 'Minimal · conversation', 'News & conversation', ['#f7f7f7', '#ffffff', '#0f1419', '#000000', '#e7e7e7'], ['#000000', '#16181c', '#f7f9f9', '#ffffff', '#2f3336']],
        ['instagram', 'Instagram', 'Visual · expressive', 'Visual & creator', ['#fff5fa', '#ffffff', '#262626', '#d62976', '#fde3ef'], ['#121212', '#1f1f1f', '#f5f5f5', '#e1306c', '#4a2035']],
        ['whatsapp', 'WhatsApp', 'Messaging · friendly', 'Chat & customer care', ['#f0fbf5', '#ffffff', '#111b21', '#25d366', '#d9fdd3'], ['#111b21', '#202c33', '#e9edef', '#25d366', '#075e54']],
        ['discord', 'Discord', 'Community · gaming', 'Gaming & community', ['#f4f5ff', '#ffffff', '#23272a', '#5865f2', '#e3e5ff'], ['#1e1f22', '#2b2d31', '#f2f3f5', '#5865f2', '#3f437a']],
        ['linkedin', 'LinkedIn', 'Career · professional', 'Career & business', ['#f3f6f8', '#ffffff', '#172b4d', '#0a66c2', '#d9edff'], ['#101214', '#1d2226', '#f3f6f8', '#70b5f9', '#16437e']],
        ['spotify', 'Spotify', 'Music · energetic', 'Music & audio', ['#f2fbf5', '#ffffff', '#191414', '#1db954', '#d6f5e0'], ['#121212', '#181818', '#ffffff', '#1db954', '#1e5d35']],
        ['tiktok', 'TikTok', 'Short video · bold', 'Video & youth', ['#fff4f6', '#ffffff', '#121212', '#fe2c55', '#e6fafa'], ['#121212', '#1f1f1f', '#ffffff', '#25f4ee', '#fe2c55']],
        ['reddit', 'Reddit', 'Forum · playful', 'Forum & discussion', ['#fff6f2', '#ffffff', '#1a1a1b', '#ff4500', '#ffe1d3'], ['#1a1a1b', '#272729', '#f6f7f8', '#ff4500', '#63301e']],
        ['slack', 'Slack', 'Work · collaborative', 'Team & productivity', ['#fcf7fc', '#ffffff', '#1d1c1d', '#611f69', '#f1e3f3'], ['#1a1d21', '#222529', '#f8f8f8', '#e01e5a', '#3f2a45']],
        ['netflix', 'Netflix', 'Entertainment · cinematic', 'Streaming & media', ['#fff6f6', '#ffffff', '#221f1f', '#e50914', '#ffe0e0'], ['#141414', '#221f1f', '#f5f5f1', '#e50914', '#5b1a1d']],
        ['google', 'Google', 'Universal · optimistic', 'Search & productivity', ['#f5f8ff', '#ffffff', '#202124', '#4285f4', '#e8f0fe'], ['#202124', '#303134', '#e8eaed', '#8ab4f8', '#3c4043']],
        ['softblue', 'Soft Blue CRM', 'Tenang · rapi · komunikatif', 'CRM & customer support', ['#f3f7f9', '#ffffff', '#243642', '#739bb3', '#e2edf2'], ['#17252d', '#21343d', '#ecf3f5', '#8fb8cd', '#2f4854']],
        ['lavender', 'Calm Lavender', 'Lembut · fokus · kreatif', 'Productivity & notes', ['#f7f5fa', '#ffffff', '#332e3f', '#9a8db5', '#eae5f1'], ['#211d28', '#30283b', '#f3eff8', '#b6a8d0', '#51436a']],
        ['dustyrose', 'Dusty Rose Shop', 'Hangat · feminin · modern', 'E-commerce & fashion', ['#fbf5f5', '#ffffff', '#3d2930', '#c98291', '#f3e1e4'], ['#2b1b20', '#3b252b', '#f7edef', '#d99ba7', '#653f48']],
        ['olive', 'Olive Admin', 'Stabil · natural · grounded', 'Admin & operations', ['#f6f7f1', '#ffffff', '#2f3529', '#87936a', '#e6ebd9'], ['#1d261c', '#293426', '#f0f3e9', '#a8b98b', '#48583c']],
        ['sandstone', 'Sandstone Blog', 'Editorial · hangat · nyaman', 'Blog & content', ['#fbf7f2', '#ffffff', '#3d332c', '#b89270', '#f1e5d8'], ['#2a211c', '#3a2d25', '#f5eee5', '#c9a685', '#5d4938']],
        ['mistyteal', 'Misty Teal Care', 'Menenteramkan · bersih · humanis', 'Healthcare & wellness', ['#f1f8f7', '#ffffff', '#243b3a', '#6fa5a1', '#dcedea'], ['#152726', '#1f3735', '#edf8f6', '#86c2bc', '#31534f']],
        ['powder', 'Powder Blue Edu', 'Terbuka · jelas · optimistis', 'Education & course', ['#f3f7fc', '#ffffff', '#27364a', '#7f9fc4', '#e1eaf5'], ['#182231', '#25334a', '#eff5fc', '#9db9dd', '#3a506e']],
        ['clay', 'Clay Orange Food', 'Ramah · energik · appetizing', 'Food & restaurant', ['#fbf6f2', '#ffffff', '#3b2c25', '#c68a68', '#f1e2d7'], ['#2a1c17', '#3b2820', '#fbf0e9', '#d7a083', '#5b3a2b']],
        ['dusk', 'Dusk Purple Events', 'Berkarakter · malam · premium', 'Events & ticketing', ['#f6f3f8', '#ffffff', '#302838', '#88749c', '#e8e0ed'], ['#201a26', '#2d2335', '#f3edf7', '#a58dba', '#4d3c59']],
        ['steel', 'Steel Gray B2B', 'Profesional · ringkas · solid', 'B2B & analytics', ['#f4f6f7', '#ffffff', '#263238', '#71808a', '#e3e8ea'], ['#171d20', '#242c30', '#edf2f3', '#94a7b0', '#3b4c54']],
        ['softmint', 'Soft Mint Finance', 'Aman · ringan · terpercaya', 'Finance & fintech', ['#f1f8f5', '#ffffff', '#21372f', '#69a58f', '#dceee6'], ['#14251f', '#20352c', '#edf8f2', '#86c3a7', '#315645']],
        ['babyblue', 'Baby Blue SaaS', 'Friendly · cepat · digital', 'SaaS & dashboard', ['#f2f7fa', '#ffffff', '#253641', '#78a7c5', '#dfecf3'], ['#16262e', '#213641', '#edf5f8', '#92bdd7', '#355365']],
        ['blush', 'Blush Wellness', 'Soft · personal · caring', 'Beauty & wellness', ['#fbf6f7', '#ffffff', '#3c2e32', '#c996a0', '#f1e2e5'], ['#2a1d21', '#3a272c', '#f8eff1', '#d9aeb5', '#61434a']],
        ['sageeco', 'Sage Agriculture', 'Organik · tenang · earthy', 'Agriculture & eco', ['#f4f7f1', '#ffffff', '#2d3729', '#8ea17a', '#e4ecde'], ['#1b2519', '#293525', '#eff5ea', '#a9be91', '#43563a']],
        ['oatmeal', 'Oatmeal Retail', 'Sederhana · lembut · timeless', 'Retail & catalog', ['#faf7f1', '#ffffff', '#3d342a', '#b49a79', '#eee5d8'], ['#29221b', '#382e24', '#f5eee3', '#c9b292', '#594836']],
        ['mutednavy', 'Muted Navy Logistics', 'Teratur · dapat dipercaya · teknis', 'Logistics & tracking', ['#f2f6f8', '#ffffff', '#263640', '#687f91', '#dde7ec'], ['#17242b', '#22343e', '#edf4f7', '#89a8ba', '#354d5a']],
        ['dustyaqua', 'Dusty Aqua Travel', 'Segar · santai · eksploratif', 'Travel & booking', ['#f0f7f7', '#ffffff', '#263a3a', '#6ba6a6', '#dbecec'], ['#152525', '#203838', '#edf8f7', '#87c4c2', '#315453']],
        ['lilac', 'Soft Lilac Creator', 'Imajinatif · ringan · personal', 'Creator & portfolio', ['#f7f4f9', '#ffffff', '#342b3a', '#a38bb5', '#ece4f0'], ['#211a27', '#30233a', '#f2ecf5', '#bda6cc', '#514064']],
        ['warmgray', 'Warm Gray Portfolio', 'Netral · dewasa · minimal', 'Portfolio & agency', ['#f6f5f3', '#ffffff', '#302f2c', '#8d8982', '#e8e6e2'], ['#1d1c1a', '#2a2926', '#f2f1ef', '#ada9a0', '#4a4741']],
        ['palecoral', 'Pale Coral Community', 'Ramah · aktif · approachable', 'Community & membership', ['#fcf6f4', '#ffffff', '#3e2b29', '#c98278', '#f1dfdc'], ['#2b1b19', '#3a2522', '#f8efec', '#d99a8f', '#60413b']],
        ['puremono', 'Pure Monochrome', 'Hitam · putih · universal', 'System & UI dasar', ['#f7f7f7', '#ffffff', '#16181d', '#30343b', '#e7e8ea'], ['#111214', '#1c1e22', '#f5f5f5', '#e5e7eb', '#30343b']],
        ['softwhite', 'Soft White', 'Putih lembut · bersih · minimal', 'Landing & editorial', ['#fafaf8', '#ffffff', '#252a2e', '#8e959c', '#eff0ee'], ['#17191b', '#24272a', '#f4f5f5', '#b9c0c4', '#3a4146']],
        ['charcoal', 'Charcoal', 'Gelap · kuat · modern', 'Dashboard & dark UI', ['#f1f2f3', '#ffffff', '#202328', '#454a50', '#dee1e4'], ['#141618', '#202328', '#f2f4f5', '#90979d', '#30363c']],
        ['coolgray', 'Cool Gray', 'Netral · tenang · teknis', 'Analytics & admin', ['#f3f5f6', '#ffffff', '#27323a', '#7a8791', '#e1e6e9'], ['#172027', '#232d34', '#f0f4f5', '#9eadb5', '#37464f']],
        ['warmgray2', 'Warm Gray', 'Hangat · dewasa · nyaman', 'Portfolio & content', ['#f6f4f1', '#ffffff', '#302b27', '#8c8177', '#e9e4df'], ['#211e1b', '#2d2824', '#f2efec', '#b1a59c', '#4a4039']],
        ['silvermist', 'Silver Mist', 'Ringan · elegan · understated', 'Corporate & product', ['#f5f7f8', '#ffffff', '#2a343a', '#87939a', '#e2e7e9'], ['#171d20', '#242c30', '#f0f3f4', '#a8b5bb', '#3b474d']],
        ['navycore', 'Navy Core', 'Aman · profesional · terpercaya', 'Finance & enterprise', ['#f1f5f8', '#ffffff', '#1c3041', '#314e68', '#dce7ef'], ['#101d28', '#1a2b38', '#f2f7fa', '#6c91ae', '#29445b']],
        ['midnight', 'Midnight Blue', 'Premium · dalam · fokus', 'SaaS & night mode', ['#f1f5f9', '#ffffff', '#1b2a3c', '#263b57', '#dce5f0'], ['#0e1825', '#152438', '#eef4fa', '#668cb4', '#283e59']],
        ['slateblue', 'Slate Blue', 'Kalem · digital · rapi', 'Productivity & tools', ['#f3f6fa', '#ffffff', '#263548', '#5e718b', '#e0e7f0'], ['#172131', '#202e42', '#f0f4f9', '#8ca4c0', '#344961']],
        ['oceanblue', 'Ocean Blue', 'Segar · kredibel · luas', 'Travel & booking', ['#f0f7f9', '#ffffff', '#1f3540', '#327e9d', '#d9ebf0'], ['#10262f', '#183640', '#edf7fa', '#5fa5bf', '#24586c']],
        ['skyblue', 'Sky Blue', 'Terbuka · ringan · friendly', 'Education & community', ['#f1f8fc', '#ffffff', '#233847', '#5f9fca', '#ddeef7'], ['#132530', '#1d3542', '#eff8fc', '#8ac1e2', '#2b556b']],
        ['steelblue', 'Steel Blue', 'Stabil · solid · enterprise', 'B2B & logistics', ['#f2f6f8', '#ffffff', '#273943', '#577486', '#dce6ea'], ['#142027', '#202f38', '#edf4f6', '#7e9baa', '#304a58']],
        ['powderblue', 'Powder Blue', 'Lembut · calm · approachable', 'Health & wellness', ['#f3f7fa', '#ffffff', '#263845', '#7e9fbb', '#e0ebf2'], ['#17242c', '#233640', '#f0f7fa', '#a0bcd2', '#385262']],
        ['cyansea', 'Cyan Sea', 'Aktif · bersih · modern', 'Healthcare & data', ['#f0f8f8', '#ffffff', '#20373a', '#4b9ba5', '#dcedee'], ['#122629', '#1d373b', '#edf9f9', '#76c2c8', '#2d5b5f']],
        ['deepteal', 'Deep Teal', 'Tenang · kuat · natural', 'Finance & wellness', ['#f1f7f6', '#ffffff', '#203638', '#326c72', '#d9e9e7'], ['#102425', '#193335', '#edf7f6', '#5e9da0', '#2d5556']],
        ['aqua2', 'Aqua', 'Segar · optimistis · clear', 'Apps & startup', ['#f1f8f8', '#ffffff', '#243b3d', '#55a6a8', '#dceded'], ['#122728', '#1d3738', '#ecf8f8', '#7cc8c7', '#2e5a5b']],
        ['bluegray', 'Blue Gray', 'Mature · tenang · trustworthy', 'Enterprise & analytics', ['#f3f6f8', '#ffffff', '#293943', '#6f8797', '#e0e7eb'], ['#172329', '#24343c', '#eff5f7', '#94afbc', '#3a515b']],
        ['denim', 'Denim', 'Casual · digital · reliable', 'Product & marketplace', ['#f1f5f8', '#ffffff', '#233548', '#486a87', '#dde8f0'], ['#14202a', '#1d2f3d', '#eff6fb', '#6f97b6', '#304b61']],
        ['cobalt', 'Cobalt', 'Tegas · energik · precise', 'Dev tools & charts', ['#f1f5fb', '#ffffff', '#1e3048', '#3f6fb0', '#dce7f7'], ['#111c2a', '#1c2c41', '#eff5ff', '#72a0d9', '#2d4c73']],
        ['royalblue', 'Royal Blue', 'Berani · fokus · modern', 'SaaS & action UI', ['#f2f4fc', '#ffffff', '#202c4a', '#4a63b8', '#e0e5f7'], ['#11182a', '#1b2740', '#eff2ff', '#8197e0', '#354a83']],
        ['indigo2', 'Indigo', 'Kreatif · premium · smart', 'Creative & productivity', ['#f4f4fa', '#ffffff', '#292941', '#6668a9', '#e4e4f1'], ['#18182a', '#24243a', '#f1f2ff', '#9193d0', '#414270']],
        ['deepindigo', 'Deep Indigo', 'Malam · tenang · premium', 'Media & portfolio', ['#f3f3f9', '#ffffff', '#26263d', '#4d4c82', '#e1e1ef'], ['#171622', '#222238', '#f0f0fb', '#7776b5', '#35345e']],
        ['dustypurple', 'Dusty Purple', 'Soft · artistik · quiet', 'Creator & lifestyle', ['#f6f4f8', '#ffffff', '#302b39', '#887c9e', '#e8e2ee'], ['#201b27', '#2d2536', '#f2edf6', '#a99bbe', '#4e405f']],
        ['blackgold', 'Black Gold', 'Mewah · kontras · editorial', 'Luxury & finance', ['#f8f6f0', '#ffffff', '#28251e', '#9b855a', '#eee7d7'], ['#151411', '#242019', '#f5f1e7', '#c0a66b', '#4f4227']],
        ['graphite', 'Graphite', 'Teknis · tajam · restrained', 'Developer & dashboard', ['#f3f4f5', '#ffffff', '#20252a', '#596169', '#e0e3e5'], ['#131619', '#202428', '#f1f3f4', '#8c969d', '#343c42']],
        ['cloudgray', 'Cloud Gray', 'Ringan · airy · modern', 'Minimal web & docs', ['#f7f8f8', '#ffffff', '#2b3337', '#9aa5aa', '#e9eced'], ['#191d1f', '#262c2f', '#f2f5f5', '#bac4c8', '#414a4f']],
        ['ashgray', 'Ash Gray', 'Serius · neutral · dependable', 'Admin & internal tools', ['#f3f5f4', '#ffffff', '#29312f', '#78817e', '#e1e6e4'], ['#171d1b', '#242b29', '#eef4f1', '#9daaa5', '#3a4742']],
        ['snowink', 'Snow & Ink', 'Kontras · bersih · editorial', 'News & documentation', ['#fbfbfa', '#ffffff', '#15191d', '#2b333a', '#eceeed'], ['#111315', '#1b1e21', '#f5f6f6', '#e0e4e5', '#333a3f']],
        ['mistblue', 'Mist Blue', 'Dingin · lembut · calm', 'Booking & healthcare', ['#f2f7f9', '#ffffff', '#263a44', '#7897a8', '#dfebef'], ['#15242b', '#22343d', '#eef6f8', '#9bb9c7', '#38535f']],
        ['deepsea', 'Deep Sea', 'Gelap · oceanic · premium', 'Travel & data visualization', ['#eff6f7', '#ffffff', '#1f343b', '#2e6474', '#d8e8eb'], ['#102228', '#19343b', '#ecf6f7', '#5a9aa5', '#2a555f']]
    ];
    function spec(a, dark) {
        return { bg: a[0], pn: a[1], tx: a[2], ac: a[3], so: a[4], bd: mix(a[1], a[2], dark ? .14 : .10), mu: mix(a[1], a[2], .70), p2: mix(a[1], a[4], dark ? .55 : .4) };
    }
    RAW.forEach(function (r) {
        var th = gen(r[1], [r[5][3], r[4][0]], spec(r[5], true), spec(r[4], false));
        th.tag = r[2]; th.cat = r[3]; th.no = THEME_ORDER.length + 1; th.grad = [r[4][3], r[5][3]]; th.lt = r[4]; th.dk = r[5];
        THEMES[r[0]] = th; THEME_ORDER.push(r[0]);
    });
    buildCustom(custom);
    THEME_ORDER.push('custom');

    function get(k, def, ok) { try { var v = localStorage.getItem(KEY[k]); if (v && ok(v)) return v; } catch (e) { } return def; }
    var state = {
        mode: get('mode', 'dark', function (v) { return v === 'light' || v === 'dark' || v === 'auto'; }),
        theme: get('theme', 'mint', function (v) { return !!THEMES[v]; }),
        font: get('font', 'manrope', function (v) { return !!FONTS[v]; }),
        fx: 'on',
        fxs: {}
    };
    /* efek: baca daftar efek aktif; bila belum ada, ikuti pilihan lama (ej3-fx: on -> efek bawaan, off -> tanpa efek) */
    (function () {
        var raw = null, i, list;
        try { raw = localStorage.getItem(KEY.fxs); } catch (e) { }
        if (raw !== null) list = raw.split(',').filter(function (k) { return FX_KEYS.indexOf(k) >= 0; });
        else list = get('fx', 'on', function (v) { return v === 'on' || v === 'off'; }) === 'off' ? [] : FX_DEFAULT.slice();
        for (i = 0; i < FX_KEYS.length; i++) state.fxs[FX_KEYS[i]] = list.indexOf(FX_KEYS[i]) >= 0;
        state.fx = list.length ? 'on' : 'off';
    })();

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
                    if (l < .55) { var tt = Math.max(0, Math.min(1, (l - .08) / .42)); cache[key] = mix(g.f.pn, g.f.so, .12 + .88 * tt); return cache[key]; }
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
        for (i = 0; i < H.length; i++) st.setProperty('--c' + i, xf(H[i], th, mode));
        for (i = 0; i < R.length; i++) { var p = R[i].split(','); var hx = toHex([+p[0], +p[1], +p[2]]); if (hx === '#000000' && mode === 'light') { st.setProperty('--r' + i, '70,85,130'); continue; } v = xf(hx, th, mode); st.setProperty('--r' + i, parseInt(v.substr(1, 2), 16) + ',' + parseInt(v.substr(3, 2), 16) + ',' + parseInt(v.substr(5, 2), 16)); }
        var gs = th.gen[mode], f = gs.f, dk = mode === 'dark', fxOn = !!state.fxs.tombol;
        var ga = th.grad[0], gb = th.grad[1], inkD = dk ? f.bg : f.tx;
        function cr(a, b) { var la = lum([parseInt(a.substr(1, 2), 16), parseInt(a.substr(3, 2), 16), parseInt(a.substr(5, 2), 16)]), lb = lum([parseInt(b.substr(1, 2), 16), parseInt(b.substr(3, 2), 16), parseInt(b.substr(5, 2), 16)]); return (Math.max(la, lb) + .05) / (Math.min(la, lb) + .05); }
        var stops = fxOn ? [f.ac, mix(ga, gb, .5)] : [f.ac];
        function worst(c) { return Math.min.apply(null, stops.map(function (s) { return cr(c, s); })); }
        st.setProperty('--onacc', worst('#ffffff') >= worst(inkD) ? '#ffffff' : inkD);
        /* logo: bolt harus kontras dengan lingkarannya (tema mono seperti X / Twitter: aksen = ink, jadi bolt berwarna aksen hilang) */
        st.setProperty('--ej-lgf', cr(f.ac, f.tx) >= 2.4 ? f.ac : f.bg);
        /* logo layar pembuka: bolt harus kontras di seluruh gradasi lingkaran; bila tidak ada warna yang cukup kontras (tema X / Twitter: gradasi hitam-putih), lingkaran dibuat solid warna aksen */
        var b85 = H[85] ? xf(H[85], th, mode) : '#ffffff', ends = fxOn ? [f.ac, ga, gb, mix(ga, gb, .5)] : [f.ac];
        function worstE(c) { return Math.min.apply(null, ends.map(function (e) { return cr(c, e); })); }
        var cands = [b85, '#ffffff', inkD], spf = null, spg = fxOn ? 'linear-gradient(135deg,' + ga + ',' + gb + ')' : f.ac;
        for (i = 0; i < cands.length; i++) { if (worstE(cands[i]) >= 2.4) { spf = cands[i]; break; } }
        if (!spf) { spg = f.ac; spf = cr('#ffffff', f.ac) >= cr(inkD, f.ac) ? '#ffffff' : inkD; }
        st.setProperty('--ej-spf', spf); st.setProperty('--ej-spg', spg);
        function rgb2(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
        function trip(h) { return parseInt(h.substr(1, 2), 16) + ',' + parseInt(h.substr(3, 2), 16) + ',' + parseInt(h.substr(5, 2), 16); }
        st.setProperty('--accg', fxOn ? 'linear-gradient(135deg,' + ga + ',' + gb + ')' : f.ac);
        st.setProperty('--ej-cv', f.bg); st.setProperty('--ej-sf', f.pn); st.setProperty('--ej-ik', f.tx); st.setProperty('--ej-pr', f.ac); st.setProperty('--ej-so', f.so);
        st.setProperty('--fx-a', f.pn); st.setProperty('--fx-b', f.pn);
        st.setProperty('--ej-bd', f.bd); st.setProperty('--fx-bd', f.bd); st.setProperty('--fx-gl', trip(f.ac)); st.setProperty('--fx-so', trip(f.so));
        var ds = Math.abs(lum(rgb2(f.so)) - lum(rgb2(f.bg))), kk = ds < .06 ? 1 : Math.max(.22, .06 / ds);
        function sa(al) { return 'rgba(' + trip(f.so) + ',' + (al * kk).toFixed(2) + ')'; }
        st.setProperty('--fx-s95', sa(.95)); st.setProperty('--fx-s60', sa(.6)); st.setProperty('--fx-s55', sa(.55)); st.setProperty('--fx-s90', sa(.9)); st.setProperty('--fx-sh', 'rgba(0,0,0,.10)');
        st.setProperty('--fx-hi', dk ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.85)');
        root.setAttribute('data-fx', state.fx);
        root.setAttribute('data-fxl', state.fxs.latar ? '1' : '0'); root.setAttribute('data-fxk', state.fxs.kartu ? '1' : '0'); root.setAttribute('data-fxb', state.fxs.tombol ? '1' : '0');
        root.setAttribute('data-fxi', state.fxs.ikon ? '1' : '0'); root.setAttribute('data-fxh', state.fxs.hdr ? '1' : '0'); root.setAttribute('data-fxn', state.fxs.nav ? '1' : '0'); root.setAttribute('data-fxg', state.fxs.gerak ? '1' : '0');
        st.colorScheme = mode;
        root.setAttribute('data-mode', mode); root.setAttribute('data-theme', state.theme);
        var bg = xf('#090d18', th, mode);
        api.bg = bg; api.bgRGB = [parseInt(bg.substr(1, 2), 16), parseInt(bg.substr(3, 2), 16), parseInt(bg.substr(5, 2), 16), 1]; api.resolved = mode;
        var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', bg);
    }
    var loaded = {};
    /* muat font dari Google Fonts; bila permintaan bobot ditolak, coba bobot 400;700 lalu nama saja (agar tidak jatuh ke font sistem) */
    function loadGf(k) {
        var f = FONTS[k]; if (!f || !f.gf || loaded[k]) return; loaded[k] = 1;
        try {
            var fam = f.gf.split(':')[0], tries = [f.gf, fam + ':wght@400;700', fam], n = 0;
            (function next() {
                var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + tries[n] + '&display=swap';
                l.onerror = function () { try { l.parentNode && l.parentNode.removeChild(l); } catch (e) { } if (++n < tries.length) next(); };
                document.head.appendChild(l);
            })();
        } catch (e) { }
    }
    function applyFont() {
        var f = FONTS[state.font], root = document.documentElement;
        loadGf(state.font);
        root.style.setProperty('--font', f.css); root.style.fontFamily = f.css;
        var b = document.body; if (b) b.style.fontFamily = f.css;
    }
    function preload(k) { loadGf(k); }
    function notify() { try { window.dispatchEvent(new CustomEvent('ej-appearance')); } catch (e) { } }
    function saveFx() {
        var list = FX_KEYS.filter(function (k) { return state.fxs[k]; });
        state.fx = list.length ? 'on' : 'off';
        try { localStorage.setItem(KEY.fxs, list.join(',')); localStorage.setItem(KEY.fx, state.fx); } catch (e) { }
        applyColors(); notify();
    }
    function setFx(k, v) { if (FX_KEYS.indexOf(k) < 0) return; state.fxs[k] = !!v; saveFx(); }
    function setFxAll(on) { FX_KEYS.forEach(function (k) { state.fxs[k] = !!on; }); saveFx(); }
    function set(k, v) {
        if (k === 'fx') { setFxAll(v === 'on' || v === true); return; }
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
        THEMES: THEMES, THEME_ORDER: THEME_ORDER, FONTS: FONTS, FONT_ORDER: FONT_ORDER, state: state, set: set, setFx: setFx, setFxAll: setFxAll, FX_KEYS: FX_KEYS, preload: preload, custom: custom, validHex: validHex, setCustom: setCustom, preview: preview, bg: '#090d18', bgRGB: [9, 13, 24, 1], resolved: 'dark',
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
