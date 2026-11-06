/* Membuat splash Android per tema aplikasi dan mode (terang/gelap), memakai tabel warna yang sama dengan aplikasi web
   (../js/lib/appearance.js). Dijalankan oleh workflow setelah "cap add android". Menulis ke android/app/src/main/res:
   - values/ej_splash_themes.xml  : warna latar + gaya EjSplash_<tema>_<mode>
   - drawable/ejs_fg_<tema>_<mode>.xml : lingkaran warna utama + petir (vektor biasa, bukan ikon adaptif, supaya tidak ada garis kotak tipis di sekitar logo)
   Plugin EjTheme memilih gaya ini lewat Context.setSplashScreenTheme (Android 13+), berlaku pada peluncuran berikutnya.
   Aman dijalankan berulang kali; bila gagal, workflow tetap lanjut memakai splash lama. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const res = path.join('android', 'app', 'src', 'main', 'res');
function themes() {
  const src = fs.readFileSync(path.join('..', 'js', 'lib', 'appearance.js'), 'utf8');
  const style = { setProperty() {} };
  const docEl = { style, setAttribute() {}, removeAttribute() {}, classList: { add() {}, remove() {} }, dataset: {} };
  const win = { EJ_HEX: [], EJ_RGB: [], matchMedia: () => ({ matches: false, addEventListener() {} }), dispatchEvent() {} };
  const sb = { window: win, document: { documentElement: docEl, body: null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, createElement: () => ({}), head: { appendChild() {} } }, localStorage: { getItem: () => null, setItem() {} }, CustomEvent: function () {}, console, setTimeout };
  win.window = win; Object.assign(win, sb);
  vm.createContext(sb); vm.runInContext(src, sb);
  const T = sb.window.EJ.THEMES, out = {};
  for (const id of sb.window.EJ.THEME_ORDER) {
    if (!/^[a-z0-9]+$/.test(id) || id === 'custom') continue;
    out[id] = {};
    for (const m of ['light', 'dark']) { const f = T[id].gen[m].f; out[id][m] = { bg: f.bg, ac: f.ac, tx: f.tx }; }
  }
  return out;
}
const hex = s => /^#[0-9a-fA-F]{6}$/.test(s);
const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
function fg(ac, on) {
  return '<?xml version="1.0" encoding="utf-8"?>\n<vector xmlns:android="http://schemas.android.com/apk/res/android"\n    android:width="108dp"\n    android:height="108dp"\n    android:viewportWidth="108"\n    android:viewportHeight="108">\n' +
    '    <path\n        android:fillColor="' + ac + '"\n        android:pathData="M22,54 A32,32 0 1 0 86,54 A32,32 0 1 0 22,54 Z" />\n' +
    '    <group\n        android:translateX="35.5"\n        android:translateY="35.5"\n        android:scaleX="1.55"\n        android:scaleY="1.55">\n        <path\n            android:strokeColor="' + on + '"\n            android:strokeWidth="2"\n            android:strokeLineJoin="round"\n            android:strokeLineCap="round"\n            android:pathData="M13,2 L3,14 L12,14 L11,22 L21,10 L12,10 Z" />\n    </group>\n</vector>\n';
}
const adaptive = (bg, fgName) => '<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/' + bg + '" />\n    <foreground android:drawable="@drawable/' + fgName + '" />\n</adaptive-icon>\n';
let list;
try { list = themes(); } catch (e) { console.log('gen-splash: gagal membaca tema (' + e.message + '), dilewati'); process.exit(0); }
/* netral: dipakai tema "Warna sendiri" (warna buatan pengguna tidak bisa dibuat sebelumnya) */
list.neutral = { light: { bg: '#FFFFFF', ac: '#1C1D1F', tx: '#FFFFFF', on: '#FFFFFF' }, dark: { bg: '#0B0B0C', ac: '#F4F4F5', tx: '#0B0B0C', on: '#0B0B0C' } };
fs.mkdirSync(path.join(res, 'values'), { recursive: true });
fs.mkdirSync(path.join(res, 'drawable'), { recursive: true });
let xml = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n', n = 0;
for (const id of Object.keys(list)) for (const m of ['light', 'dark']) {
  const t = list[id][m]; if (!t || !hex(t.bg) || !hex(t.ac)) continue;
  const ink = t.on || (m === 'dark' ? t.bg : t.tx), on = t.on || (hex(ink) && cr(t.ac, '#ffffff') < cr(t.ac, ink) ? ink : '#ffffff');
  const key = id + '_' + m;
  xml += '    <color name="ejs_bg_' + key + '">' + t.bg + '</color>\n' +
    '    <style name="EjSplash_' + key + '" parent="Theme.SplashScreen">\n        <item name="windowSplashScreenBackground">@color/ejs_bg_' + key + '</item>\n        <item name="windowSplashScreenAnimatedIcon">@drawable/ejs_fg_' + key + '</item>\n    </style>\n';
  fs.writeFileSync(path.join(res, 'drawable', 'ejs_fg_' + key + '.xml'), fg(t.ac, hex(on) ? on : '#ffffff'));
  n++;
}
xml += '</resources>\n';
fs.writeFileSync(path.join(res, 'values', 'ej_splash_themes.xml'), xml);
console.log('gen-splash: ' + n + ' gaya splash dibuat');
