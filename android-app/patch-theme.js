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
  s = s.replace(open, '$1\n        <item name="android:statusBarColor">' + color + '</item>');
  console.log('patch-theme: ' + name + ' -> ' + color);
}
add('AppTheme.NoActionBarLaunch', '#090d18');
add('AppTheme.NoActionBar', '#0b1020');
fs.writeFileSync(p, s);
