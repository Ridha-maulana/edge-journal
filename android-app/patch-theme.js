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

/* Alarm (v5.9.93): izin notifikasi dan alarm tepat waktu + nada alarm (res/raw/ej_alarm.wav) untuk plugin LocalNotifications.
   Nada dibuat langsung di sini (WAV 16-bit, bunyi bip bergantian ~12 detik), jadi tidak ada file biner di repo. Aman dijalankan berulang kali. */
try {
  const M = 'android/app/src/main/AndroidManifest.xml';
  if (fs.existsSync(M)) {
    let m = fs.readFileSync(M, 'utf8');
    for (const perm of ['POST_NOTIFICATIONS', 'SCHEDULE_EXACT_ALARM', 'USE_EXACT_ALARM', 'USE_FULL_SCREEN_INTENT', 'WAKE_LOCK', 'RECEIVE_BOOT_COMPLETED', 'VIBRATE']) {
      if (!m.includes('android.permission.' + perm + '"')) m = m.replace('</manifest>', '    <uses-permission android:name="android.permission.' + perm + '" />\n</manifest>');
    }
    fs.writeFileSync(M, m);
    console.log('patch-theme: izin alarm terpasang');
  }
  const rawDir = 'android/app/src/main/res/raw';
  if (fs.existsSync('android/app/src/main/res')) {
    fs.mkdirSync(rawDir, { recursive: true });
    const sr = 22050, secs = 12, n = sr * secs, buf = Buffer.alloc(44 + n * 2);
    buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
    buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28);
    buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
    for (let i = 0; i < n; i++) {
      const t = i / sr, cyc = t % 1.5; let v = 0;
      if (cyc < 1.0) {
        const k = Math.floor(cyc / 0.25), u = cyc - k * 0.25;
        if (u < 0.17) {
          const f = k % 2 ? 1046.5 : 880, env = Math.min(1, u / 0.01, (0.17 - u) / 0.02);
          v = env * (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t)) * 0.55;
        }
      }
      buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2);
    }
    fs.writeFileSync(rawDir + '/ej_alarm.wav', buf);
    console.log('patch-theme: nada alarm ej_alarm.wav dibuat');
  }
} catch (e) { console.log('patch-theme: alarm dilewati: ' + e.message); }
