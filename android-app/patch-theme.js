/* Dijalankan otomatis oleh Capacitor setelah "cap sync" (hook capacitor:sync:after).
   Mewarnai bilah status Android: tema peluncuran (#090d18, sama dengan latar splash) dan tema aplikasi (#0b1020, warna dasar aplikasi),
   supaya area paling atas tidak hitam sejak aplikasi dibuka. Aman dijalankan berulang kali. */
const fs = require('fs');
const p = 'android/app/src/main/res/values/styles.xml';
if (!fs.existsSync(p)) { console.log('patch-theme: styles.xml belum ada, dilewati'); process.exit(0); }
let s = fs.readFileSync(p, 'utf8');
function add(name, color) {
  const esc = name.replace(/\./g, '\\.');
  const open = new RegExp('(<style name="' + esc + '"[^>]*>)');
  const block = new RegExp('<style name="' + esc + '"[^>]*>[\\s\\S]*?</style>').exec(s);
  if (!block) { console.log('patch-theme: gaya ' + name + ' tidak ditemukan'); return; }
  if (block[0].includes('android:statusBarColor')) { console.log('patch-theme: ' + name + ' sudah berwarna'); return; }
  s = s.replace(open, '$1\n        <item name="android:statusBarColor">' + color + '</item>\n        <item name="android:windowBackground">' + color + '</item>');
  console.log('patch-theme: ' + name + ' -> ' + color);
}
add('AppTheme.NoActionBarLaunch', '@color/ej_splash_bg');
add('AppTheme.NoActionBar', '@color/ej_splash_bg');
fs.writeFileSync(p, s);

/* Nomor versi aplikasi: ikuti "version" di android-app/package.json (mis. 1.0.9) */
try {
  const ver = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
  const g = 'android/app/build.gradle';
  if (ver && fs.existsSync(g)) {
    let b = fs.readFileSync(g, 'utf8');
    b = b.replace(/versionName\s+"[^"]*"/, 'versionName "' + ver + '"');
    fs.writeFileSync(g, b);
    console.log('patch-theme: versionName -> ' + ver);
  }
} catch (e) { console.log('patch-theme: versi dilewati: ' + e.message); }

/* Splash bawaan Android mengikuti tema + mode aplikasi (Android 13+, lewat plugin EjTheme).
   Dijalankan di sini (bukan di workflow) supaya cukup dengan mengunggah release.zip. Gagal di langkah mana pun = splash lama tetap dipakai. */
try {
  const cp = require('child_process'), path = require('path');
  const javaDir = path.join('android', 'app', 'src', 'main', 'java', 'com', 'ridha', 'edgejournal');
  if (fs.existsSync(javaDir) && fs.existsSync(path.join('native', 'EjThemePlugin.java'))) {
    cp.execFileSync('node', ['gen-splash.js'], { stdio: 'inherit' });
    if (!fs.existsSync(path.join('android', 'app', 'src', 'main', 'res', 'values', 'ej_splash_themes.xml'))) throw new Error('gaya splash tema tidak terbentuk');
    for (const f of ['EjThemePlugin.java', 'MainActivity.java']) fs.copyFileSync(path.join('native', f), path.join(javaDir, f));
    console.log('patch-theme: plugin EjTheme terpasang');
  } else console.log('patch-theme: folder java belum ada, splash tema dilewati');
} catch (e) { console.log('patch-theme: splash tema dilewati: ' + e.message); }
