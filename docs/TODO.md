# TODO — Jurnale Trading Journal

## PWA jurnal trading mobile-first
- [x] Aplikasi harus dapat dijalankan di browser Chrome, terutama pada layar HP, dengan antarmuka PWA responsif dan nyaman digunakan.
- [x] Pertahankan jurnal trading untuk mencatat, melihat, mengubah, dan menghapus detail setiap transaksi.
- [x] Pertahankan dashboard performa yang merangkum hasil trading melalui metrik utama dan visualisasi perkembangan.
- [x] Pertahankan kalkulator risiko untuk membantu menghitung ukuran posisi dan batas risiko berdasarkan akun atau modal.
- [x] Pertahankan pengelolaan beberapa akun trading beserta modal dan perubahan saldonya.
- [x] Pertahankan kalender trading untuk meninjau aktivitas dan hasil transaksi berdasarkan tanggal.
- [x] Pertahankan ekspor dan pencadangan data lokal ke berkas yang dapat disimpan pengguna.
- [x] Pertahankan pemulihan data jurnal dari berkas cadangan dengan validasi sebelum impor.
- [x] Pertahankan kemampuan unggah dan melampirkan screenshot pada catatan trade.
- [x] Data jurnal harus disimpan persisten sepenuhnya di penyimpanan browser perangkat tanpa backend cloud untuk data jurnal.
- [x] Sediakan route manifest `/manus-routes.json` yang mendeklarasikan halaman aplikasi.
- [x] Sediakan server preview self-contained pada port 3000 dan konfigurasi PWA yang valid.

## Performance v2
- [x] Halaman Performance dibagi menjadi tiga bagian: ringkasan informasi umum, Advanced Statistics, dan Trader DNA.
- [x] Bagian ringkasan menampilkan kartu informasi umum bergaya referensi, grafik, metrik utama, dan tombol Bagikan ke story.
- [x] Tombol Advanced Statistics dan Trader DNA ditempatkan bersama tombol Bagikan ke story dan membuka halaman detail penuh dengan tombol kembali seperti alur Kalender.
- [x] Advanced Statistics dimulai dari pengaturan Periode dan berlanjut hingga Pair terpopuler.
- [x] Layout Performance menyesuaikan HP, tablet, dan laptop.
- [x] Versi aplikasi dinaikkan menjadi 2.0.0.

## Performance v2.0.1
- [x] Panel `Profitability · ...% menang` dipindahkan ke bawah bagian `Distribusi win / loss`.
- [x] Jarak judul, panel, dan baris tabel Advanced Statistics dirapikan agar teks dan nilai tidak terpotong pada layar kecil.
- [x] Navigasi bawah Performance, My Journal, dan Tools diberi transisi, highlight, glow, dan animasi ikon saat berpindah tab.
- [x] Versi aplikasi dinaikkan menjadi 2.0.1.

## Performance v2.0.2
- [x] Seluruh blok Advanced Statistics dipindahkan setelah Distribusi win / loss, termasuk Profitability, baris Total Trades sampai Withdrawals, dan catatan perhitungan Pips.
- [x] Jarak vertikal antara metrik Performance, Bagikan ke story, dan tombol detail disamakan tanpa ruang flex kosong.
- [x] Animasi navigasi bawah disederhanakan menjadi transisi standar yang halus.
- [x] Halaman Performance memiliki animasi masuk ringan saat pertama dibuka atau saat tab Performance dipilih.
- [x] Versi aplikasi dinaikkan menjadi 2.0.2.

## Performance v2.0.3
- [x] Judul `Advanced Statistics` dan subjudul `Statistik lengkap akun · ... trade` tetap berada di posisi atas.
- [x] Hanya kartu tabel Advanced Statistics beserta isinya yang dipindahkan ke bawah Distribusi win / loss.
- [x] Margin tambahan antara metrik Perolehan Pips dan tombol Bagikan ke story dihapus agar jarak antar bagian konsisten.
- [x] Versi aplikasi dinaikkan menjadi 2.0.3.

## Performance v2.0.4
- [x] Heading `OVERVIEW / ACCOUNT`, `Performance`, dan deskripsi analisis di halaman utama dihapus.
- [x] Ikon dompet dipindahkan ke bawah nama Active Account.
- [x] Judul dan subjudul Advanced Statistics ditempatkan setelah bagian Periode.
- [x] Animasi muncul ringan ditambahkan untuk tabel/matriks Performance dan judul Advanced Statistics.
- [x] Versi aplikasi dinaikkan menjadi 2.0.4.

## Performance v2.0.5
- [x] Animasi khusus kartu Performance dibuat lebih hidup namun tetap halus.
- [x] Saldo utama mendapat efek muncul ringan.
- [x] Garis grafik digambar bertahap dan area grafik muncul dengan fade-in.
- [x] Kartu data, legenda, dan tombol aksi muncul berurutan dengan jeda singkat.
- [x] Animasi tidak diterapkan ke halaman lain.
- [x] Versi aplikasi dinaikkan menjadi 2.0.5.

## Performance v2.0.6
- [x] Sweep cahaya halus ditambahkan pada permukaan kartu Performance.
- [x] Animasi saldo dibuat lebih terlihat dengan bounce ringan.
- [x] Grafik menggambar garis lebih lama, area grafik fade-in, dan titik akhir grafik membesar singkat.
- [x] Data, legenda, dan tombol aksi muncul bertahap dengan timing yang lebih terasa.
- [x] Versi aplikasi dinaikkan menjadi 2.0.6.

## UI Animation v2.1.0
- [x] Staggered entrance diterapkan pada kartu, statistik, teks, legenda, dan tombol dengan jeda bertahap 50–100 ms.
- [x] Easing modern `cubic-bezier(0.16, 1, 0.3, 1)` digunakan pada entrance dan transisi utama dengan durasi 400–600 ms.
- [x] Hover dan tap micro-interaction ditambahkan pada tombol, kartu statistik, selector, dan tab.
- [x] Grafik Performance tumbuh dari kiri ke kanan melalui path drawing dan area fade-in.
- [x] Angka utama Performance kembali menggunakan counting-up dari 0 saat pertama kali dimuat.
- [x] Reduced-motion fallback tetap tersedia untuk pengguna yang menonaktifkan animasi.
- [x] Versi aplikasi dinaikkan menjadi 2.1.0.

## Performance v2.1.1
- [x] Kartu utama Performance diposisikan di tengah area layar atas–bawah.
- [x] Overview Performance tidak dapat ditarik atau discroll vertikal; gerakan yang tersisa hanya animasi internal kartu.
- [x] Halaman detail Advanced Statistics dan Trader DNA tetap memiliki scroll untuk konten panjang.
- [x] Versi aplikasi dinaikkan menjadi 2.1.1.

## Layout v2.1.2
- [x] Perilaku scroll overview Performance dikembalikan seperti sebelumnya.
- [x] Kartu Performance tidak lagi terkunci di tengah atau mengunci overflow layar.
- [x] Posisi awal konten dibuat lebih dekat ke header.
- [x] Penyesuaian jarak atas berlaku konsisten pada Performance, My Journal, dan Tools.
- [x] Versi aplikasi dinaikkan menjadi 2.1.2.

## Layout v2.1.3
- [x] Posisi awal konten dinaikkan lagi sekitar seperempat jarak agar lebih dekat ke bagian atas.
- [x] Penyesuaian berlaku untuk Performance, My Journal, dan Tools.
- [x] Ikon dompet disamakan dengan bentuk tombol ikon kalender di header.
- [x] Indikator titik merah pada detail Advanced Statistics disembunyikan.
- [x] Versi aplikasi dinaikkan menjadi 2.1.3.

## Advanced Statistics v2.1.4
- [x] Titik hijau/merah yang melayang di pojok halaman dihapus dari DOM tampilan Advanced Statistics.
- [x] Penyebabnya diperbaiki pada selector `.performance-detail-page .dot`, bukan pada overlay Chrome.
- [x] Versi aplikasi dinaikkan menjadi 2.1.4.

## Button interaction v2.1.5
- [x] Menghapus kotak focus dan tap highlight sementara pada semua tombol.
- [x] Menghapus animasi transisi kotak sementara pada Performance, My Journal, dan Tools.
- [x] Tombol kalender, dompet, Advanced Statistics, Trader DNA, Bagikan ke story, backup, restore, CSV, akun, dan Add Trade langsung menampilkan bentuk finalnya.
- [x] Animasi hover/active yang halus tetap dipertahankan tanpa outline kotak.
- [x] Versi aplikasi dinaikkan menjadi 2.1.5.

## Haptic feedback v2.1.6
- [x] Menambahkan getar singkat sekitar 12 ms saat tombol disentuh pada HP/perangkat touch.
- [x] Berlaku untuk tombol kalender, dompet, navigasi, Performance, My Journal, Tools, backup, restore, CSV, akun, Add Trade, dan tombol lainnya.
- [x] Tidak berjalan pada desktop, browser/perangkat yang tidak mendukung `navigator.vibrate()`, atau mode reduced motion.
- [x] Versi aplikasi dinaikkan menjadi 2.1.6.

## Selective haptic v2.1.7
- [x] Getar tombol diperlunak menjadi 8 ms agar lebih halus.
- [x] Tombol kalender header tetap dapat memberi getar saat ikon kalender disentuh.
- [x] Isi kalender/modal kalender tidak memberi getar.
- [x] Semua tombol, diagram, tab, dan kontrol pada Advanced Statistics serta Trader DNA tidak memberi getar.
- [x] Versi aplikasi dinaikkan menjadi 2.1.7.

## Haptic UX tiers v2.2.0
- [x] Aksi utama seperti FAB/Add Trade menggunakan getar tegas 18 ms.
- [x] Navigasi bawah dan filter/dropdown/kalender menggunakan tick ringan 10 ms.
- [x] Tombol simpan, deposit, tambah akun, dan backup menggunakan pola sukses `[15, 30, 20]`.
- [x] Tombol hapus akun/log menggunakan pola peringatan `[40, 40, 40]`.
- [x] Advanced Statistics dan Trader DNA tetap tidak memberi getar pada tombol maupun diagram.
- [x] Versi aplikasi dinaikkan menjadi 2.2.0.

## Splash, haptic, dan menu bawah v2.3.0
- [x] Layar pembuka kini menampilkan logo + tulisan `EDGE JOURNAL / TRADING LOGBOOK` tepat di tengah layar, dengan animasi halus (logo muncul, bolt tergambar, tulisan menyusul) lalu memudar ke aplikasi. Teks "Memuat Edge Journal…" di bagian atas yang membuat logo terlihat naik dihapus.
- [x] Font Google tidak lagi memblokir tampilan pertama sehingga splash muncul langsung.
- [x] Ikon aplikasi (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`) diganti ke logo bolt outline bergradien biru sesuai referensi.
- [x] Getar sentuhan pertama diperbaiki: Chrome memblokir `navigator.vibrate()` sebelum ada user activation (untuk sentuhan baru terjadi saat jari diangkat). Jika belum ada aktivasi, getar ditunda ke `pointerup`; setelah itu getar langsung di `pointerdown`.
- [x] Getar menu bawah dipicu bersamaan dengan pindah tab (event click) sehingga selalu sinkron, termasuk di sentuhan pertama.
- [x] Menu bawah dipercantik: efek tekan (scale) instan, ikon naik sedikit saat ditekan, indikator garis di atas tab aktif, label tab aktif lebih tebal, bayangan atas, dan `touch-action: manipulation` agar tanpa jeda ketuk.
- [x] Cache service worker dinaikkan ke `edge-journal-v2`; versi aplikasi menjadi 2.3.0.

## Splash tanpa pergantian logo v2.3.1
- [x] Ikon maskable (dipakai Android untuk splash dan ikon layar utama) diganti: latar gelap `#090d18` + logo bolt di tengah, tanpa kotak biru besar.
- [x] Animasi splash dimulai dari posisi dan ukuran yang sama persis dengan splash Android (selisih ±1 px), lalu logo menyusut ke kiri dan tulisan `EDGE JOURNAL / TRADING LOGBOOK` muncul. Tidak ada logo yang berganti.
- [x] Animasi splash dikecualikan dari aturan lama `*{animation:none!important}` (baris "Animasi dasar tetap ringan") yang mematikan semua animasi. Bagian aplikasi lain tidak berubah.
- [x] Service worker v3: cache lebih dulu lalu perbarui di belakang layar, sehingga aplikasi terbuka cepat dan splash Android lebih singkat. Bisa dibuka offline.

## Serah-terima splash tanpa lompatan v2.3.2
- [x] Titik awal animasi disesuaikan dengan logo splash Android hasil ukur video HP: lebar ±33,45% lebar layar, tepat di tengah layar penuh. Sebelumnya logo melompat naik ±36 px dan mengecil ±12% saat halaman mengambil alih.
- [x] Jeda awal animasi dipersingkat (0,2 s menjadi 0,08 s) sehingga logo langsung bergerak.
- [x] Lama splash dihitung dari saat animasi benar-benar tampil (`animationstart`), bukan dari awal pemuatan, sehingga animasi selalu terlihat penuh walau halaman lambat dimuat.
- [x] Menambahkan `preconnect` ke CDN React agar pemuatan lebih cepat.

## Splash Android tanpa tulisan v2.3.3
- [x] Tulisan "Edge Journal — Jurnal Trading Forex" di bagian bawah splash Android berasal dari `name` di `manifest.webmanifest`. `name` diganti karakter tak terlihat (U+2060) agar tulisan tidak tampil; nama di layar utama tetap memakai `short_name` ("Edge Journal").
- [x] Cache service worker dinaikkan ke `edge-journal-v4`.
- Catatan: nama splash tersimpan di aplikasi terpasang, jadi perubahan baru terlihat setelah Chrome memperbarui aplikasi atau setelah install ulang.

## Splash Android kosong, animasi langsung v2.3.4
- [x] Penyebab "logo naik": di dalam splash Android sendiri, ikon mula-mula di y≈1004 lalu digeser sistem naik ke y=960 (42 px), kemudian animasi halaman menurunkannya lagi. Ini tidak bisa dikontrol dari kode web.
- [x] `icon-maskable-512.png` (gambar yang dipakai Android untuk splash) diganti warna latar polos `#090d18`. Splash Android tampil layar gelap tanpa logo.
- [x] Animasi halaman langsung muncul dari tengah layar: logo besar fade-in lalu menyusut ke kiri sambil tulisan muncul, tanpa pergeseran vertikal.
- [x] Cache service worker dinaikkan ke `edge-journal-v5`; versi aplikasi 2.3.4.
- Catatan: gambar splash tersimpan di aplikasi terpasang, jadi perlu install ulang agar berlaku. Jika ikon layar utama tampak kosong gelap di peluncur lain, kembalikan `icon-maskable-512.png` ke versi sebelumnya.

## Ikon splash baru agar tidak tertahan cache v2.3.5
- [x] Hasil ukur video: saat dibuka dari layar utama, splash Android masih menampilkan logo lama (turun-naik di y 1067 > 1008 > 960, lalu animasi halaman mulai di y 1003). Ini terjadi karena aplikasi terpasang masih memakai gambar splash lama. Saat refresh tidak ada splash Android, sehingga animasi terlihat mulus.
- [x] `icon-maskable-512.png` diganti nama menjadi `icon-maskable-v3-512.png` (isinya warna polos `#090d18`) supaya tidak tertahan cache GitHub Pages / Chrome dan lebih mudah memicu pembaruan aplikasi. `manifest.webmanifest`, `sw.js` diperbarui. `apple-touch-icon` memakai `icon-512.png`.
- Hapus file lama `icon-maskable-512.png` dari GitHub (tidak dipakai lagi).

## Sinkron online (Firebase) v2.4.0
- [x] Modul baru `cloud-sync.js` (Firebase Auth email/password + Cloud Firestore, SDK 10.11.1 dari CDN gstatic). Data tetap lokal; saat login perubahan dikirim ke `users/{uid}` (dipecah per 200.000 karakter) dan perubahan dari perangkat lain diterima otomatis.
- [x] Penyelesaian bentrok: transaksi Firestore menolak tulis dengan basis usang; jika dua perangkat sama-sama berubah, pengguna diberi pilihan data cloud / data perangkat. Versi lokal disimpan di `edge-journal-pre-sync-backup` sebelum ditimpa.
- [x] Kartu "Sinkron online" di Tools (login, daftar, lupa password, status, sinkron sekarang, keluar).
- [x] `firebase-config.js` (diisi pengguna) dan `PANDUAN_FIREBASE.md`. Selama konfigurasi kosong aplikasi berjalan seperti sebelumnya.
- [x] Diuji: 12 skenario mesin sinkron (2 perangkat, offline, bentrok, data besar + emoji) dan alur UI dua perangkat. Belum diuji dengan proyek Firebase sungguhan.

## Halaman masuk di awal aplikasi v2.4.1
- [x] `AuthGate`: jika Firebase sudah dikonfigurasi, aplikasi menampilkan halaman Masuk lebih dulu (email, password, Daftar baru, Lupa password).
- [x] Sudah masuk -> langsung ke aplikasi tanpa menunggu (penanda `edge-auth-hint`), juga saat offline. Halaman masuk muncul lagi hanya setelah "Keluar" manual di kartu Sinkron online (atau sesi login habis).
- [x] Login baru di perangkat lain: halaman "Menyinkronkan data…" tampil dulu agar data cloud sudah dimuat sebelum aplikasi terbuka (tanpa kedip data awal). Jika terjadi konflik data, pilihan "Pakai data cloud / perangkat ini" ditampilkan langsung.
- [x] Tombol "Lanjut tanpa masuk" (hanya untuk sesi itu) agar tidak terkunci saat lupa password / tidak ada internet. Dapat dihapus jika tidak diinginkan.
- [x] Jika `firebase-config.js` masih kosong, tidak ada halaman masuk (aplikasi berjalan seperti sebelumnya).
- [x] Diuji: 7 skenario di aplikasi sungguhan (pertama kali, password salah, login, buka ulang, keluar manual, lewati, perangkat kedua). Belum diuji dengan proyek Firebase sungguhan di HP.

## Diagnosis sinkron + SW lebih kuat v2.4.2
- [x] Kartu Sinkron online saat belum aktif menampilkan diagnosis: alamat halaman, apakah `firebase-config.js` terbaca, apiKey/projectId terisi, versi aplikasi. Tombol "Muat ulang bersih" menghapus cache aplikasi + service worker tanpa menghapus data jurnal.
- [x] Alamat aplikasi ditampilkan di kartu saat sudah masuk (untuk membandingkan antar browser).
- [x] Service worker v9: pasang ulang berkas dengan `cache:'reload'`, pembaruan di belakang layar memakai `cache:'no-cache'`, dan fallback ke `index.html` hanya untuk navigasi (sebelumnya berkas lain yang gagal ikut dibalas HTML).
- Catatan: penyebab pasti Brave belum aktif belum diketahui; diagnosis ini untuk membedakan antara berkas diblokir, cache lama, atau repo/alamat yang berbeda.

## Rentang tanggal, urutan kartu, label %, login bergambar v2.5.0
- [x] Penyebab kotak "Custom Date Range" muncul di halaman utama Performance: kotak memakai lapisan `z-index 30` sedangkan halaman Advanced Statistics / Trader DNA memakai `40`, sehingga kotak tertutup di belakang halaman detail. Saat pengguna menekan kembali, kotak baru terlihat di atas halaman utama. Sekarang kotak memakai lapisan `top` (z-index 80) sehingga langsung tampil di atas Advanced Statistics / Trader DNA.
- [x] Kotak hanya ditampilkan di halaman Advanced Statistics / Trader DNA, dan otomatis ditutup (dianggap Cancel) bila meninggalkan halaman itu.
- [x] Urutan kartu Advanced Statistics: judul "Statistik lengkap akun" → Kalender → Monthly gain → kartu lain seperti urutan sebelumnya (grafik Growth, performa per minggu/hari/sesi, dst.).
- [x] Monthly gain: setiap bulan yang punya trade menampilkan persen di atas batang. Profit hijau (+), rugi merah (-), tampilan sama.
- [x] Halaman login memakai gambar `login-art.webp` (bidang kuas putih sebagai latar logo EDGE JOURNAL). Berkas baru, ±71 KB, dimasukkan ke cache offline.
- [x] Diuji: alur rentang tanggal 8 langkah, urutan kartu, label % (bulan profit dan rugi), tampilan login di 2 ukuran layar, regresi login/sinkron.

## Pembagian sesi baru v2.5.1
- [x] Performa per sesi (WIB, jam entry) memakai pembagian baru: Asia 06.00–12.00, London 12.00–20.00, New York 20.00–04.00 (melewati tengah malam), Overlap 04.00–06.00. Menggantikan pembagian lama (London–New York dan "Sepi" dihapus).
- [x] Catatan di bawah kartu ikut diperbarui. Diuji: trade pada jam 0, 3, 4, 5, 6, 11, 12, 19, 20, 23 masuk ke sesi yang benar, total 10 dari 10 posisi.

## Menu bawah 5 slot + halaman Akun v2.6.0
- [x] Urutan menu bawah (kiri ke kanan): Performance, My Journal, tombol Tambah posisi (tengah), Tools, Akun. Menu samping (desktop) juga mendapat item Akun.
- [x] Tombol tengah "Tambah posisi": ikon candlestick + plus (baru), tanpa tulisan, membuka form Tambah trade dari halaman mana pun. Getar sedikit lebih kuat dari menu biasa.
- [x] Menu Akun (ikon orang, ada tulisan): halaman baru berisi kartu Sinkron online (masuk/keluar, status), kartu Akun trading (nama, saldo, jumlah trade; tombol Kelola/ganti akun, Deposit/WD, Tambah akun, Backup), dan versi aplikasi. Kartu di Tools tetap ada.
- [x] Ikon lama (Performance, My Journal, Tools) tidak diubah. Lebar menu menyesuaikan 5 slot; layar ≤380px memakai tulisan lebih kecil.
- [x] Diuji di layar 390 dan 360: urutan, tombol + tepat di tengah, tidak ada tulisan terpotong, semua menu membuka halaman yang benar, regresi login/sinkron/Advanced Statistics lolos.

## Menu bawah gaya Material + Tools lebih ringkas v2.7.0
- [x] Animasi menu bawah mengikuti referensi video (Google Play): penanda aktif berupa pil hanya di belakang ikon (58×30 px), ada jarak 4 px ke tulisan, pil melebar dari tengah saat dipilih dan mengecil saat ditinggalkan (±0,24 detik), ikon sedikit memantul. Kotak penanda lama yang membungkus ikon + tulisan dan garis di atas tab dihapus.
- [x] Tombol tekan (belum aktif) menampilkan pil abu-abu sempit seperti efek tekan Material.
- [x] Tools tidak lagi menampilkan kartu Sinkron online dan Account management karena sudah ada di halaman Akun. Tools kini: Risk calculator, Cloud backup, Export & share.
- [x] Diuji: pil sejajar dengan ikon (selisih 0 px), urutan frame animasi, navigasi 5 menu di layar 390 dan 360, isi Tools dan Akun.

## Drill-down performa: Bulan > Minggu > Hari > Sesi > Win/Loss v2.8.0
- [x] Di Advanced Statistics, 4 kartu terpisah (Performa per minggu, Performa per hari, Performa per sesi, Distribusi win / loss) diganti satu kartu drill-down dengan 5 level: Bulan -> Minggu -> Hari -> Sesi -> Win/Loss. Level **Bulan** (performa per bulan) ditambahkan.
- [x] Data memakai semua trade closed pada akun aktif (nyata, bukan data contoh). Minggu mengikuti baris Kalender (Senin-Minggu), hari dari tanggal entry, sesi dari jam entry WIB (Asia 06-12, London 12-20, New York 20-04, Overlap 04-06).
- [x] Breadcrumb 5 tombol (hanya level yang sudah dikunjungi yang bisa diklik), kartu dengan dot warna, subtitle, tag, posisi/WR/profit, progress bar, dan kotak sorotan "terbaik".
- [x] Tombol **Kunci**: semua level bisa dibuka langsung dengan data agregat dari semua bulan/minggu/hari, lengkap dengan tag hari/minggu/bulan. Level Win/Loss terkunci menampilkan 4 kartu sesi + Ringkasan Total.
- [x] Level Win/Loss (normal) menampilkan donut chart + statistik (menang, kalah, win rate, rata-rata win/loss, trade terbaik/terburuk).
- [x] Tombol Kembali dan Selanjutnya di bawah setiap level. Selanjutnya otomatis memilih data pertama yang ada.
- [x] Kode perhitungan lama untuk 4 kartu dihapus dari PerfExtra. Kartu Kalender, Monthly gain, Growth, tabel Advanced Statistics, P&L per pair, dan Trader DNA tidak berubah.
- [x] Cache service worker dinaikkan ke `edge-journal-v11`; versi aplikasi 2.8.0.


## v2.8.1 — Penyempurnaan kartu Performa (drill-down)
- Warna & efek kartu Performa disamakan dengan tab Growth/Balance/Profit/Daily P&L/Drawdown: tombol aktif biru, efek hover naik + tekan mengecil, palet app (#34d399 / #ff6b81).
- Kotak info kecil di semua level: hari (abu), minggu (ungu), bulan (biru), sesi (titik warna).
  - Bulan: N minggu, N hari, N sesi, lalu posisi, WR, %, profit.
  - Minggu: bulan, hari, sesi, lalu posisi, WR, %, profit.
  - Hari: bulan, minggu, sesi, lalu posisi, WR, %, profit.
  - Sesi: hari, minggu, bulan, lalu posisi, WR, %, profit.
  - Win/Loss: Win / Loss, Win Rate, Avg. Win / Loss, Perolehan Pips (donut tetap ada di mode normal).
- Persen (%) dihitung dari modal awal (sama seperti Gain / Monthly gain).
- File berubah: index.html, sw.js (cache edge-journal-v12), TODO.md, UPLOAD_ONLY_CHANGED_FILES.txt

## v2.8.2 — Menu bawah & halaman Tambah trade
- Tombol Tambah posisi di menu bawah: hanya ikon, tanpa warna latar/bayangan (ikut gaya tab lain; saat aktif ikon jadi putih).
- Tambah trade bukan pop up lagi, tapi halaman biasa seperti Trading Tools (tombol X di kanan atas untuk kembali ke halaman sebelumnya). Edit trade tetap berupa pop up.
- Trading Tools sekarang hanya berisi Risk calculator.
- Halaman Akun, urutan: Akun trading, Sinkron online, Cloud backup, Export & share.
- File berubah: index.html, sw.js (cache edge-journal-v13), TODO.md, UPLOAD_ONLY_CHANGED_FILES.txt

## v2.8.3 — Penyempurnaan tombol Tambah posisi
- Ikon Tambah posisi di menu bawah diperbesar (31px) dan berada tepat di tengah bar (vertikal & horizontal).
- Saat diklik/aktif, ada animasi yang sama dengan 4 ikon lain (pil biru melebar + ikon membal).
- Halaman Tambah trade: fitur Screenshots / chart dihilangkan. Pop up Edit trade tetap menampilkan screenshot lama bila ada.
- File berubah: index.html, sw.js (cache edge-journal-v14), TODO.md, UPLOAD_ONLY_CHANGED_FILES.txt

## v2.8.4 — Menu bawah: kotak sudut tumpul
- Kelima menu (Performance, My Journal, Tambah posisi, Tools, Akun) sekarang sama besar (70×54 px di layar 390).
- Penanda aktif berupa kotak sudut tumpul biru seperti tab Growth/Balance/Profit; hanya kotaknya yang beranimasi (naik saat hover, mengecil saat ditekan). Ikon dan tulisan tidak lagi membal/bergerak.
- Ikon Tambah posisi sama ukurannya dengan ikon lain (24px) dan berada di tengah kotak.
- File berubah: index.html, sw.js (cache edge-journal-v15), TODO.md, UPLOAD_ONLY_CHANGED_FILES.txt

## v2.8.5 — Performa per bulan satu data dengan Monthly gain
- Kartu Performa per bulan/minggu/hari/sesi sekarang memakai tahun dan bulan yang sama dengan Monthly gain dan Kalender (satu sumber: trade closed). Ganti tahun di Monthly gain → kartu ikut; pilih bulan di salah satunya → yang lain ikut.
- Hanya bulan yang ada datanya yang ditampilkan (dinamis). Jika tahun terpilih tidak punya data (mis. 2028) kartu disembunyikan, muncul lagi otomatis saat ada data.
- Tombol tahun ‹ 2026 › di kartu ini melompat ke tahun berikutnya/sebelumnya yang ada datanya.
- Mode Kunci menggabungkan data hanya pada tahun terpilih.
- Bulan, hari, dan sesi dihitung dengan zona waktu WIB yang sama seperti Monthly gain.
- File berubah: index.html, sw.js (cache edge-journal-v16), TODO.md, UPLOAD_ONLY_CHANGED_FILES.txt

## v2.8.6 — Hierarki penyaringan: Periode → Monthly gain → kartu Performa per bulan
- Kartu Performa per bulan/minggu/hari/sesi memakai data yang sudah lolos Periode, termasuk bulan/tahun yang dipilih di Monthly gain (satu data dengan kartu lain).
- Klik grafik bulan di Monthly gain (tahun berapa pun) → kartu hanya menampilkan bulan itu. Pindah tahun di Monthly gain → kartu ikut pindah.
- Kartu tidak lagi hilang: bila tidak ada data pada periode terpilih, kartu tetap tampil dengan pesan kosong. Klik "Semua waktu" untuk kembali normal (semua bulan).
- Tombol tahun di dalam kartu (v2.8.5) dihapus karena tahun diatur dari Monthly gain.
- File berubah: index.html, sw.js (cache edge-journal-v17), TODO.md, UPLOAD_ONLY_CHANGED_FILES.txt

## v2.8.7 — Menu bawah simpel, pop up layar penuh, format jam
- Menu bawah mengikuti contoh video: ikon + tulisan, tanpa kotak/pil, kelima menu sama ukuran (76×74 di layar 390). Menu aktif berwarna putih. Tombol tengah sekarang punya tulisan "Add trade".
- Tambah trade kembali berupa pop up, tetapi layar penuh tanpa jarak di atas. Berlaku juga untuk Edit trade, Close trade, dan konfirmasi hapus.
- Bagian "Screenshots / chart" dihapus dari form tambah/edit (paste gambar juga dinonaktifkan).
- Dua tombol di bawah (Calculate / Adjust risk & Save open trade; Batal & Save close; Batal & Ya hapus) sama besar dan simetris.
- Jam memakai titik dua (21:15, bukan 21.15) di form, jurnal, "Closed at", info sinkron, dan jam sesi (06:00–12:00).
- File berubah: index.html, sw.js (cache edge-journal-v18), TODO.md, UPLOAD_ONLY_CHANGED_FILES.txt

## v2.8.8 — Ikon di Advanced Statistics, menu bawah saat ditekan, Akun → Profil
- Advanced Statistics: tulisan di tombol diganti ikon dan disusun satu baris seperti menu bawah.
  - Performa: Bulan (kalender), Minggu (kalender rentang), Hari (kalender harian), Sesi (jam), Win/Loss (piala), Kunci (gembok terbuka/tertutup).
  - Grafik: Growth (grafik naik), Balance (timbangan), Profit (koin), Daily P&L (grafik pie), Drawdown (grafik turun).
  - Tombol tetap punya aria-label/title untuk aksesibilitas.
- Menu bawah: kotak biru bersudut tumpul hanya muncul selama ditekan dan langsung hilang saat jari dilepas (tanpa animasi lanjutan). Menu halaman aktif tetap ditandai warna putih.
- Menu dan halaman "Akun" diganti menjadi "Profil" (isi halaman tetap sama).
- File berubah: index.html, sw.js (cache edge-journal-v19), TODO.md, UPLOAD_ONLY_CHANGED_FILES.txt

## v2.8.9 — Account management di Profil, menu bawah tanpa animasi, menu tetap tampil di popup
- Halaman Profil: kartu "Akun trading" (4 tombol) diganti kartu Account management lengkap (tab Accounts / Deposit / WD / Add account / Backup, daftar akun dengan pilih & hapus, kartu Active account + Edit nama). Urutan: Account management → Sinkron online → Cloud backup → Export & share.
- Menu bawah: animasi kotak saat ditekan dihapus; hanya ikon + tulisan (halaman aktif tetap putih).
- Menu bawah tetap tampil di bawah popup Tambah trade, Edit, Tutup posisi, dan konfirmasi Hapus (popup tetap layar penuh di atas menu).
  - Saat popup terbuka, menekan menu lain menutup popup lalu pindah halaman; "Add trade" ditandai putih selama popup tambah terbuka.
- File berubah: index.html, sw.js (cache edge-journal-v20), TODO.md, UPLOAD_ONLY_CHANGED_FILES.txt

## v2.8.10 — Perbaikan Symbol & Tanggal di Tambah trade, simbol GOLD, form Add account di Profil
- Perbaikan: pilihan Symbol dan Tanggal & waktu di popup Tambah trade / Edit tidak muncul karena tertutup popup layar penuh. Sekarang daftar pilihan dan kalender tampil di atas popup (juga untuk Currency / First deposit di Add account).
- Symbol baru GOLD (untuk broker yang tidak memakai XAUUSD): ukuran kontrak 100, 1 pip = 0.10, hitungan P&L, pips, dan statistik sama dengan XAUUSD.
- Profil → Account management → Add account: label di atas kolom, kolom isi, tanggal, mata uang, dan tombol "Create account" bergaya sama seperti popup (lebih rapi).
- File berubah: index.html, sw.js (cache edge-journal-v21), TODO.md, UPLOAD_ONLY_CHANGED_FILES.txt

## v2.8.11 — Kartu Profitability bisa digeser, menu bawah hilang saat scroll
- Advanced Statistics → kartu Profitability: daftar statistik sekarang berupa slide yang digeser ke samping (maksimal 10 data per slide, dibagi rata: 8/8/8/7). Garis penanda slide di atas (kuning), nomor slide dan tombol "GESER ›" di bawah; garis penanda juga bisa diketuk.
- Menu bawah: otomatis tersembunyi saat halaman di-scroll ke bawah dan muncul lagi hanya setelah kembali ke kepala halaman. Tetap tampil saat popup Tambah/Edit/Hapus terbuka dan saat pindah halaman.
- File berubah: index.html, sw.js (cache edge-journal-v22), TODO.md, UPLOAD_ONLY_CHANGED_FILES.txt

## v2.8.12 — Active account di atas, menu Performance = kembali ke halaman utama
- Profil → Account management → tab Accounts: kartu ACTIVE ACCOUNT sekarang di paling atas, daftar akun di bawahnya (berlaku juga di popup Account management).
- Performance: saat sedang di Advanced Statistics (atau Trader DNA), cukup tekan menu "Performance" di bar bawah sekali untuk kembali ke halaman utama Performance (tanpa tombol kembali di atas).
- File berubah: index.html, sw.js (cache edge-journal-v23), TODO.md, UPLOAD_ONLY_CHANGED_FILES.txt

## v3.0.0 — Struktur folder baru (repositori baru edge-journal-v3.0.0)
- Kode dipecah dari satu index.html besar menjadi folder: css/ (10 file berurutan), js/lib, js/components, js/stats, js/pages, js/firebase, assets/, docs/.
- Perilaku aplikasi sama persis dengan v2.8.12 (CSS identik baris per baris; semua tes regresi lolos).
- File sisa proyek lama dihapus: server.js, package.json, app.config.ts, manus-routes.json, UPDATE_v2.4.2.md, GITHUB_UPLOAD.md, icon-maskable-512.png.
- Service worker memakai nama cache baru ("ej3-...") dan hanya membersihkan cache miliknya sendiri; daftar file precache mengikuti struktur baru.
- Rencana berikutnya: import riwayat trade MT5 (CSV/Excel dari portal broker) bila sudah ada contoh berkasnya.

## v3.1.0 — Screenshot Trade Entry (Beta)
- Tombol + di My Journal sekarang membuka menu kecil: "Manual Trade Entry" dan "Screenshot Trade Entry (Beta)". Tombol "Add trade" di header dan bar bawah tetap langsung ke form manual.
- Screenshot Trade Entry: pilih gambar dari galeri -> layar "Membaca data trade dari screenshot..." -> form Tambah trade terisi (symbol, arah, tanggal & waktu, entry, exit, lots, SL, TP, biaya) untuk diperiksa lalu disimpan.
- Pembaca teks (OCR) memakai Tesseract.js dari jsDelivr, dimuat hanya saat fitur dipakai dan berjalan di HP (gambar tidak dikirim ke server). Pemakaian pertama perlu internet (unduhan beberapa MB), berikutnya biasanya lebih cepat karena disimpan browser.
- Format yang dikenali: Riwayat posisi MT5 (Android/iOS), tampilan "GOLD, buy 0.04 ..." beserta baris harga. Jika posisi diketuk sehingga detail terbuka (tiket, waktu Buka, S/L, T/P, Swap, Komisi), semua kolom terisi lengkap; tanpa detail, waktu buka/SL/TP harus diisi manual.
- Jam server MT5 diubah ke WIB. Pilihan zona waktu ada di form (default GMT+2/GMT+3 otomatis mengikuti jam musim panas AS) dan diingat di perangkat.
- Profit memakai angka bersih dari MT5 (profit + swap + komisi). Nomor tiket disimpan (mt5Ticket) untuk peringatan jika tiket yang sama dicatat dua kali.
- v3.1.1: satu screenshot berisi beberapa posisi dibaca sekaligus. Muncul daftar posisi berinformasi lengkap (centang, bisa dimatikan) lalu "Simpan N trade" mencatat semuanya. Kartu yang belum diketuk (tanpa tiket/SL/TP) dilewati dan diberi tahu jumlahnya. Tiket yang sudah tercatat otomatis tidak dicentang.
- v3.2.0: React dinaikkan dari 18.3.1 ke 19.2.8. React 19 tidak lagi menyediakan berkas CDN biasa (UMD), jadi React + ReactDOM dibundel menjadi satu berkas lokal js/vendor/react-19.2.8.min.js (dari paket resmi npm). Manfaat: tidak bergantung CDN, bisa dibuka offline sejak pemasangan pertama. Untuk memperbarui React di masa depan: bundel ulang berkas itu dari paket npm react & react-dom versi baru, ganti namanya di index.html dan sw.js.
- v3.2.1: Screenshot Trade Entry bisa memilih banyak gambar sekaligus (tanpa batas tetap; dibaca satu per satu, ada penunjuk "Gambar 2 dari 5"). Posisi dari semua gambar digabung; tiket yang sama di dua screenshot dihitung sekali; hasil diurutkan terbaru dulu.
- v3.2.2: Splash Android menampilkan logo lagi. Ikon splash baru `assets/icon-maskable-v4-512.png` (latar gelap + logo biru-bolt 62,7% kanvas, meniru logo splash halaman) menggantikan ikon polos v3. Animasi splash halaman kini mulai langsung terlihat penuh (tanpa fade-in) dari titik yang sama sehingga tidak ada layar kosong di antara splash Android dan splash halaman. Catatan: Android menggeser logo splash-nya sendiri (±40 px naik) sekali di awal, tidak bisa dikontrol dari kode web. Gambar splash tersimpan di aplikasi terpasang: pasang ulang aplikasi dari Chrome agar berlaku. Footer Profil kini menampilkan versi React yang dipakai.
- v3.2.3: ikon aplikasi baru `icon-maskable-v5-512.png`: lingkaran biru bergradien + bolt putih di tengah kanvas gelap (ikon layar utama jadi berlogo seperti MT5, bukan lingkaran gelap polos). Menggantikan v4. Animasi splash: di tab browser kembali seperti sebelumnya (logo memudar masuk); hanya saat dibuka sebagai aplikasi terpasang (display-mode standalone) logo langsung tampil karena sudah terlihat di splash Android. Logo awal berbentuk bulat dan berubah menjadi kotak membulat saat menyusut.
- v3.2.4: export CSV/backup juga jalan di aplikasi Android (Capacitor) lewat Filesystem + Share; di browser tetap unduhan biasa.
- v3.2.5: getar tombol/menu di aplikasi Android (Capacitor) memakai plugin Haptics; plugin Filesystem/Share dipanggil lewat registerPlugin (mode alamat jarak jauh). Di browser tetap navigator.vibrate.
- v3.2.6: tombol "Tes getar" di Profil (melaporkan jalur getar yang dipakai dan pesan error plugin). Getar di aplikasi Android: jika plugin gagal otomatis kembali ke navigator.vibrate; durasi minimum 20 ms untuk motor getar linear.
- v3.2.7: getar di aplikasi Android memakai durasi yang sama dengan versi web (tanpa minimum 20 ms) agar selembut di web.
- v3.3.0: logo splash bersudut tumpul (radius ±21%, mengikuti gambar ikon dari pengguna). Ukuran awal animasi halaman = ukuran logo splash Android hasil ukur video: 47,11% lebar layar, tepat di tengah (bentuk bulat sebelumnya dihapus). Bagikan ke story: di aplikasi Android gambar disimpan ke cache lalu menu bagikan Android dibuka (Simpan dan Bagikan sama-sama memakai menu itu); pembuatan gambar tidak lagi menunggu font lebih dari 0,8 detik (sebelumnya "Menyiapkan gambar…" bisa beberapa detik).
- File baru: js/lib/mt5-parse.js, js/lib/ocr.js, js/components/screenshot-entry.js. File berubah: index.html, sw.js (cache ej3-3.1.0), js/app.js, js/pages/journal.js, js/components/trade-modals.js, js/lib/format.js, css/10-profile-add-trade.css.
- v3.3.1: logo splash kembali bulat penuh (sesuai permintaan, dari awal sampai akhir animasi, tanpa berubah jadi kotak tumpul). Ukuran awal animasi = lingkaran splash Android hasil ukur video terbaru: 48,8% lebar layar, tepat di tengah. Ikon splash Android digambar sebagai vektor lingkaran (splash-res di repo Android) agar tidak bergantung pada gambar dari alat pembuat ikon.
- v3.3.2: perbaikan transisi splash Android → web berdasarkan video: (1) di repo Android, latar ikon splash kini memuat kotak gelap #090D18 sehingga HyperOS tidak lagi mengisi sudut dengan hitam (kotak hitam di belakang lingkaran hilang); (2) lingkaran web mulai dengan ukuran sama dengan lingkaran Android (47,2% lebar layar, bukan 48,8%) dan dipusatkan ke tengah layar penuh (bilah status menggeser halaman web ±43 px ke bawah, dikoreksi lewat --sy); mode "tanpa fade-in" kini juga aktif di aplikasi Capacitor (sebelumnya hanya display-mode standalone).
- v3.3.3: ikon aplikasi bulat penuh tanpa cincin gelap. Ikon "maskable" baru (icon-maskable-v6-512.png) berupa gradasi biru memenuhi seluruh kanvas (bukan lingkaran kecil di atas latar gelap), sehingga pemotongan bulat oleh launcher menghasilkan lingkaran biru bersih. Ikon biasa icon-192/512 kini lingkaran penuh; apple-touch-icon memakai ikon penuh v6. Di repo Android: icon-background.png dan icon-only.png diganti gradasi penuh tanpa transparansi (sebelumnya kotak tumpul di atas transparan, yang diisi hitam oleh HyperOS). Ikon di layar utama yang sudah terpasang sebagai PWA mungkin perlu dihapus lalu dipasang ulang agar gambarnya diperbarui.
- v3.4.0: tampilan dan desain TIDAK berubah (tetap seperti v3.3.3; percobaan tema v4 "Liquid Glass"/"Telegram Glass" dibatalkan). Perubahan hanya pada pengelolaan berkas: web dan pembungkus Android (folder android-app/) digabung dalam satu repositori dengan satu release.zip dan satu workflow (.github/workflows/build-apk.yml). APK dibangun hanya bila zip berisi android-app/ atau tombol Run workflow ditekan; alamat web untuk APK diisi otomatis dari nama repositori.
- v3.4.1: bilah status Android (area paling atas, sebelumnya hitam) kini berwarna #0b1020 mengikuti warna dasar aplikasi, sama seperti di Chrome. Memakai plugin @capacitor/status-bar (ditambah di android-app/package.json dan capacitor.config.json) plus pemanggilan cadangan di js/pwa.js. Perlu APK baru (release.zip berisi android-app/).
