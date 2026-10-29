# Panduan Sinkron Online (Firebase, gratis)

Setelah panduan ini selesai, data jurnal Anda tersimpan di akun Anda sendiri (Google Firebase) dan otomatis muncul di browser / HP mana pun setelah **Masuk**. Aplikasi tetap bisa dipakai tanpa internet; perubahan dikirim saat online.

Paket gratis Firebase (Spark) tidak memerlukan kartu kredit. Kuota gratis per hari: 50.000 baca, 20.000 tulis, penyimpanan 1 GiB. Itu jauh lebih dari cukup untuk satu jurnal pribadi. Nama menu di situs Firebase bisa sedikit berbeda dari tulisan di bawah, tapi alurnya sama.

## Langkah 1 — Buat proyek
1. Buka https://console.firebase.google.com lalu masuk dengan akun Google.
2. **Create a project** (Buat proyek), beri nama misalnya `edge-journal`.
3. Google Analytics boleh dimatikan. Lanjut sampai proyek jadi.

## Langkah 2 — Aktifkan login Email/Password
1. Menu **Build → Authentication → Get started**.
2. Tab **Sign-in method** → pilih **Email/Password** → aktifkan **Enable** → **Save**.

## Langkah 3 — Buat database Firestore
1. Menu **Build → Firestore Database → Create database**.
2. Pilih edisi **Standard**. Lokasi: `asia-southeast2 (Jakarta)` atau `asia-southeast1 (Singapore)`. **Lokasi tidak bisa diubah nanti.**
3. Pilih **Production mode** → **Create**.

## Langkah 4 — Pasang aturan keamanan (WAJIB)
1. Di Firestore buka tab **Rules**.
2. Hapus isinya, lalu tempel ini, lalu klik **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /chunks/{chunkId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

Artinya: hanya pemilik akun yang sudah login yang bisa membaca/menulis data miliknya sendiri. Orang lain tidak bisa, walaupun melihat kode di GitHub.

## Langkah 5 — Ambil konfigurasi dan tempel ke `js/firebase/firebase-config.js`
1. Klik ikon roda gigi → **Project settings → General**.
2. Di bagian **Your apps** klik ikon web `</>` → beri nama aplikasi → **Register app** (jangan centang Hosting).
3. Salin isi `firebaseConfig` (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).
4. Buka file `js/firebase/firebase-config.js` di repo, isi nilainya, simpan.

Kunci ini memang publik dan aman ada di GitHub; yang melindungi data adalah **Rules** (langkah 4) dan login Anda.

## Langkah 6 — Izinkan alamat GitHub Pages Anda
Di **Authentication → Settings → Authorized domains**, klik **Add domain**, isi `USERNAME.github.io` (ganti USERNAME dengan nama GitHub Anda).

## Langkah 7 — Unggah ke GitHub
Commit file yang berubah termasuk `js/firebase/firebase-config.js` yang sudah diisi. Tunggu GitHub Pages selesai (1–2 menit), lalu buka aplikasi **dua kali** (kali pertama mengunduh versi baru di belakang layar).

## Langkah 8 — Mulai pakai
1. **Backup dulu**: Tools → Cloud backup → Create backup.
2. Buka **Tools → Sinkron online**. Isi email + password (minimal 6 karakter) lalu **Daftar**.
3. Data di perangkat ini otomatis diunggah. Status berubah menjadi hijau "Tersinkron".
4. Di HP/browser lain: buka alamat yang sama → Tools → Sinkron online → **Masuk**. Data muncul otomatis.

## Langkah 9 — Matikan pendaftaran baru (disarankan)
Setelah akun Anda terdaftar, buka **Authentication → Settings → User actions** dan matikan **Enable create (sign-up)** (jika opsi itu tersedia). Dengan begitu orang lain tidak bisa membuat akun di proyek Anda. Anda tetap bisa Masuk di perangkat baru.

---

## Cara kerja singkat
- Setiap kali Anda menyimpan perubahan, aplikasi menunggu ±2 detik lalu mengirim data ke cloud.
- Perubahan dari perangkat lain diterima otomatis, tanpa muat ulang.
- Saat offline, data tetap tersimpan lokal dan dikirim ketika kembali online.
- Jika dua perangkat sama-sama mengubah data saat tidak saling terhubung, aplikasi **tidak menimpa diam-diam**: akan muncul pilihan "Pakai data cloud" atau "Pakai data perangkat ini". Jika Anda memilih data cloud, versi perangkat ini disimpan sebagai cadangan lokal (`edge-journal-pre-sync-backup`).
- Sinkron hanya berjalan setelah Masuk. Tanpa Masuk, aplikasi bekerja seperti sebelumnya (lokal saja).

## Sinkron belum aktif di browser lain (misalnya Brave)
Tools → Sinkron online sekarang menampilkan diagnosis kalau belum aktif:
- **firebase-config.js TIDAK terbaca** → file diblokir, tidak ditemukan, atau yang tersimpan di browser masih versi lama. Tekan **Muat ulang bersih** (data jurnal tidak terhapus).
- **apiKey / projectId KOSONG** → alamat halaman itu belum memakai `js/firebase/firebase-config.js` yang sudah diisi.
- **Alamat halaman berbeda** → bandingkan "Alamat" di browser yang berhasil dengan yang belum. Kalau Anda punya lebih dari satu repo GitHub, isi `js/firebase/firebase-config.js` di **setiap** repo yang dipakai. Satu akun Firebase yang sama bisa dipakai di semua alamat.
- Brave: tekan ikon singa (Shields) lalu matikan untuk situs ini, kemudian muat ulang.
- Uji langsung: buka `ALAMAT-APLIKASI/js/firebase/firebase-config.js` di browser tersebut. Isinya harus terlihat terisi (bukan kosong atau 404).

## Jika ada masalah
- **"Belum diaktifkan"** → `js/firebase/firebase-config.js` masih kosong atau belum terunggah. Buka aplikasi dua kali setelah mengunggah.
- **"Akses ditolak"** → Rules (langkah 4) belum dipasang atau salah ketik.
- **"Pendaftaran/Email-Password belum diaktifkan"** → ulangi langkah 2, atau pendaftaran sudah dimatikan di langkah 9 (gunakan Masuk).
- **Lupa password** → di kartu Sinkron online isi email lalu tekan **Lupa password**.
- Data tidak boleh disimpan di repo GitHub publik; karena itu data hanya ada di Firestore, bukan di GitHub.
