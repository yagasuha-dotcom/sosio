# SOSIO WAR: Pasukan Sosiologi Kelas 12

Game ala iklan *Last War* (crowd-runner + zombie) dengan materi sosiologi kelas 12 SMA. Setiap kali pasukan mengambil botol senjata, game berhenti sejenak: muncul Kartu Materi + kuis. Jawab benar, senjata naik tingkat. Jawab salah, senjata tidak naik dan penjelasan tetap ditampilkan.

## Cara main
- Geser jari kiri/kanan (atau panah / A D) untuk menggerakkan pasukan. Tembakan otomatis.
- Gerbang biru menambah prajurit, gerbang merah mengurangi. Tembak gerbang untuk menaikkan angkanya.
- Tembak tong kayu untuk merekrut prajurit. Tembak kandang Aliansi untuk merekrut sekutu.
- Pecahkan botol kaca berisi senjata, ambil, lalu jawab kuis.
- Rintangan: paku di jalan (hindari), blok beton (tembak sebelum menabrak), tong merah (meledak, ledakannya melukai zombie di sekitarnya).
- Kalahkan bos di akhir level. Koin dipakai untuk Pahlawan dan upgrade di Toko.

## Tingkat kesulitan
Sedang, Susah (bawaan), dan Nightmare. Makin sulit: musuh lebih tebal dan banyak, gerbang lebih sering menjebak, rezeki prajurit lebih sedikit, koin hadiah lebih besar.
Angka keseimbangan ada di `TUNE` dan `DIFFS` pada `js/data.js`.

## Isi game
- 8 level, tiap level satu bab sosiologi.
- 37 soal + kartu materi (`js/sociology.js`).
- 7 senjata, 7 jenis musuh bertema masalah sosial, 4 bos, 6 sekutu, 5 pahlawan, toko upgrade.
- Gambar dan efek suara dibuat dengan kode: efek suara tiap senjata dan tiap musuh berbeda.
- Musik: 4 lagu tempur (`assets/audio/tempur-1..4.mp3`) diputar ACAK saat bermain (habis satu, lanjut lagu acak lain), dan `assets/audio/kuis.mp3` diputar saat menjawab kuis.
- Lagu lobby: `assets/audio/lobby.mp3` diputar berulang di menu (saat memilih level/mode). Berhenti saat level dimulai, lanjut lagi saat kembali ke menu.
- Lagu pendek: `menang.mp3` (level selesai), `kalah.mp3` (pasukan gugur), `salah.mp3` (salah menjawab kuis; lagu kuis dikecilkan sebentar). Semuanya ikut tombol **Lagu**; kalau Lagu mati, dipakai suara bawaan yang ikut tombol Efek suara.
- Dua tombol terpisah: **Lagu** (musik) dan **Efek suara** (tembakan, ledakan, bunyi tombol). Ada di tab Atur, di layar Jeda, dan sebagai tombol kecil di bawah tombol jeda saat bermain.
- Bawaan saat pertama dibuka: Lagu NYALA, Efek suara MATI.
- Font: Baloo 2 + Plus Jakarta Sans (dimuat dari Google Fonts, ada cadangan font sistem bila offline).

## Menjalankan
Tanpa instalasi. Buka `index.html` di browser, atau:
```
python3 -m http.server 8080
```
lalu buka http://localhost:8080

## Tambahan v3 (digabung dengan versi lagu dan UI berwarna)
- Monster digambar ulang bergaya bestiary fantasi: goblin, imp bersayap, orc berhelm, hantu berkerudung, minotaur, katak berlendir, imp pembawa bom. Bos: badak batu, golem berhalo, raja iblis, naga (`js/monsters.js`).
- Lencana jumlah pasukan segi enam, teks bergaya 3D, HUD kaca, banner level dan bos, kombo pembunuhan (`js/hud.js`).
- Peluru lendir musuh baru, getar (opsional), jeda otomatis saat pindah aplikasi, tutorial singkat di permainan pertama.
- Performa: latar jembatan di-cache, vinyet lewat CSS, sprite digambar di awal, resolusi turun otomatis bila HP lambat.
- Bisa dipasang ke layar utama (PWA, `manifest.json` + `sw.js`). File lagu di `assets/audio` tidak ikut di-cache offline.
- Font canvas memakai Baloo 2 (cadangan offline: Erica One, tertanam di `css/fonts.css`).
