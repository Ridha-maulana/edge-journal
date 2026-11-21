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

/* Alarm (v5.9.94): kode Android asli (layanan alarm + banner Tunda/Matikan + layar kunci), izin, daftar komponen di manifest,
   dan nada dering (res/raw/ej_t_*.wav). Nada dibuat langsung di sini (WAV 16-bit mono), jadi tidak ada file biner di repo.
   Daftar TONES harus sama dengan TONES di js/lib/alarms.js (pratinjau di aplikasi). Aman dijalankan berulang kali. */
try {
  const path = require('path');
  const M = 'android/app/src/main/AndroidManifest.xml';
  if (fs.existsSync(M)) {
    let m = fs.readFileSync(M, 'utf8');
    for (const perm of ['POST_NOTIFICATIONS', 'SCHEDULE_EXACT_ALARM', 'USE_EXACT_ALARM', 'USE_FULL_SCREEN_INTENT', 'WAKE_LOCK', 'RECEIVE_BOOT_COMPLETED', 'VIBRATE', 'FOREGROUND_SERVICE', 'FOREGROUND_SERVICE_MEDIA_PLAYBACK']) {
      if (!m.includes('android.permission.' + perm + '"')) m = m.replace('</manifest>', '    <uses-permission android:name="android.permission.' + perm + '" />\n</manifest>');
    }
    if (!m.includes('EjAlarmService')) {
      m = m.replace('</application>',
        '    <service android:name=".EjAlarmService" android:exported="false" android:foregroundServiceType="mediaPlayback" />\n' +
        '    <receiver android:name=".EjAlarmReceiver" android:exported="false" />\n' +
        '    <receiver android:name=".EjBootReceiver" android:exported="true">\n' +
        '        <intent-filter>\n' +
        '            <action android:name="android.intent.action.BOOT_COMPLETED" />\n' +
        '            <action android:name="android.intent.action.MY_PACKAGE_REPLACED" />\n' +
        '        </intent-filter>\n' +
        '    </receiver>\n</application>');
    }
    fs.writeFileSync(M, m);
    console.log('patch-theme: izin dan komponen alarm terpasang');
  }
  const javaDir = path.join('android', 'app', 'src', 'main', 'java', 'com', 'ridha', 'edgejournal');
  if (fs.existsSync(javaDir)) {
    for (const f of ['EjAlarmCore.java', 'EjAlarmService.java', 'EjAlarmReceiver.java', 'EjAlarmPlugin.java', 'EjBootReceiver.java', 'MainActivity.java']) fs.copyFileSync(path.join('native', f), path.join(javaDir, f));
    console.log('patch-theme: kode alarm native terpasang');
  } else console.log('patch-theme: folder java belum ada, kode alarm native dilewati');
  const TONES = {
    klasik: { period: 1.5, w: 'sq', ev: [[0, 880, 0.17], [0.25, 1046.5, 0.17], [0.5, 880, 0.17], [0.75, 1046.5, 0.17]] },
    bip: { period: 1.2, w: 'sq', ev: [[0, 1318.5, 0.08], [0.14, 1318.5, 0.08], [0.28, 1318.5, 0.08], [0.42, 1318.5, 0.08]] },
    lonceng: { period: 3, w: 'bell', ev: [[0, 660, 1.4], [1, 880, 1.4], [2, 660, 1]] },
    digital: { period: 1.2, w: 'sq', ev: [[0, 784, 0.12], [0.15, 988, 0.12], [0.3, 1175, 0.12], [0.6, 784, 0.12], [0.75, 988, 0.12], [0.9, 1175, 0.12]] },
    pagi: { period: 4, w: 'soft', ev: [[0, 523.3, 0.6], [0.5, 659.3, 0.6], [1, 784, 0.6], [1.5, 1046.5, 1.2]] }
  };
  const rawDir = 'android/app/src/main/res/raw';
  if (fs.existsSync('android/app/src/main/res')) {
    fs.mkdirSync(rawDir, { recursive: true });
    const sr = 22050, TP = 2 * Math.PI;
    for (const [name, sp] of Object.entries(TONES)) {
      const n = Math.round(sr * sp.period), buf = Buffer.alloc(44 + n * 2), acc = new Float64Array(n);
      for (const [t0, f, d] of sp.ev) {
        const a = Math.round(t0 * sr), len = Math.round(d * sr);
        for (let k = 0; k < len && a + k < n; k++) {
          const t = k / sr; let v;
          if (sp.w === 'bell') v = Math.exp(-3 * t / d) * Math.min(1, t / 0.005) * (Math.sin(TP * f * t) + 0.5 * Math.sin(TP * 2.76 * f * t) * Math.exp(-6 * t / d) + 0.25 * Math.sin(TP * 5.4 * f * t) * Math.exp(-9 * t / d)) * 0.5;
          else if (sp.w === 'soft') v = Math.min(1, t / 0.08, (d - t) / 0.15) * (Math.sin(TP * f * t) + 0.15 * Math.sin(2 * TP * f * t)) * 0.5;
          else v = Math.min(1, t / 0.01, (d - t) / 0.02) * (Math.sin(TP * f * t) + 0.3 * Math.sin(2 * TP * f * t)) * 0.55;
          acc[a + k] += v;
        }
      }
      buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
      buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28);
      buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
      for (let i = 0; i < n; i++) buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(acc[i] * 32767))), 44 + i * 2);
      fs.writeFileSync(rawDir + '/ej_t_' + name + '.wav', buf);
    }
    console.log('patch-theme: nada alarm dibuat: ' + Object.keys(TONES).join(', '));
  }
} catch (e) { console.log('patch-theme: alarm dilewati: ' + e.message); }
