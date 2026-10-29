# android-app — pembungkus Android (Capacitor)

Folder ini hanya dipakai untuk membuat APK. Aplikasi Android memuat web Edge Journal dari
GitHub Pages repositori ini, jadi pembaruan web otomatis ikut tanpa membuat APK baru.
Alamat web diisi otomatis saat build dari nama repositori (tidak perlu diedit).

- `capacitor.config.json` — warna dan splash (alamat web ditimpa otomatis oleh workflow)
- `package.json` — paket Capacitor
- `assets/` — ikon dan splash sumber
- `splash-res/` — ikon splash bulat (vektor), disalin ke proyek saat build
- `www/` — halaman cadangan
- `debug.keystore` — kunci penanda tetap agar APK baru memperbarui APK lama

Workflow: `.github/workflows/build-apk.yml` (dibuat manual sekali di GitHub).
APK dibangun hanya bila `release.zip` berisi folder `android-app/` atau tombol **Run workflow** ditekan.
Hasil: tab **Releases** repositori.
