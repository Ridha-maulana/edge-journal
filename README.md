# Edge Journal v4.0.0

Jurnal trading pribadi (PWA) — React 19, tanpa build tool, jalan langsung di GitHub Pages.
Data tersimpan lokal (localStorage) dan bisa disinkronkan online lewat Firebase (Auth + Firestore).

## Struktur folder

```
index.html            kerangka halaman: memuat CSS dan JS sesuai urutan
manifest.webmanifest  PWA (nama, ikon)
sw.js                 service worker (mode offline) — naikkan angka cache `C` setiap rilis
assets/               ikon dan gambar login
css/                  gaya, dimuat berurutan 01 → 11 (aturan belakangan menimpa yang depan; 11-nav-center.css = menu bawah tombol tengah kotak)
js/
  splash.js           layar pembuka
  vendor/             React + ReactDOM 19 (satu berkas lokal, tanpa CDN)
  lib/                helper: format, perhitungan trading, penyimpanan, ikon, notifikasi, pembaca screenshot MT5 (mt5-parse, ocr)
  components/         komponen bersama: form, grafik, popup tambah/edit trade, Account management, kalender
  stats/              Advanced Statistics, Drill-down, Performa per bulan / Trader DNA
  pages/              Performance, My Journal, Tools, Profil
  firebase/           firebase-config.js, cloud-sync.js, cloud-ui.js (login dan kartu Sinkron online)
  app.js              komponen App (state, menu bawah, popup)
  boot.js             memasang aplikasi ke halaman
  watchdog.js, pwa.js pesan gagal-muat dan pendaftaran service worker
docs/                 panduan Firebase dan catatan perubahan (TODO.md)
```

Urutan pemuatan skrip ada di `index.html` dan penting: berkas `lib/` dulu, lalu `components/`, `stats/`, `pages/`, `firebase/cloud-ui.js`, `app.js`, terakhir `boot.js`. Semua skrip biasa (bukan modul) sehingga fungsi dan konstanta saling terlihat.

## Satu repositori: web + Android

```
(root)               aplikasi web (yang dilayani GitHub Pages)
android-app/         pembungkus Android (Capacitor) — HANYA dipakai untuk membuat APK
.github/workflows/build-apk.yml   satu-satunya workflow (dibuat manual sekali)
```

## Memperbarui lewat HP (tanpa komputer)

1. Satu kali: pastikan ada `.github/workflows/build-apk.yml` (lihat `android-app/README.md`).
2. Unggah satu berkas `release.zip` ke root repositori (**Add file → Upload files**) lalu **Commit changes**.
3. Tunggu centang hijau di tab **Actions**. Zip dibuka otomatis; berkas yang perlu dihapus ditulis di `HAPUS.txt` di dalam zip.
4. **APK hanya dibangun ulang bila zip berisi folder `android-app/`** (atau saat tombol *Run workflow* ditekan). Pembaruan web biasa selesai dalam hitungan detik dan aplikasi Android otomatis ikut karena memuat alamat web yang sama.

## Mengaktifkan GitHub Pages

**Settings → Pages → Build and deployment → Deploy from a branch → Branch: `main`, folder `/ (root)` → Save.**
Alamat aplikasi: `https://<username>.github.io/<nama-repo>/`

## Sinkron online (Firebase)

Lihat `docs/PANDUAN_FIREBASE.md`. Isi konfigurasi ada di `js/firebase/firebase-config.js`.
