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
- Semua gambar dan suara dibuat dengan kode (tanpa file aset): efek suara tiap senjata dan tiap musuh berbeda, plus musik latar.

## Menjalankan
Tanpa instalasi. Buka `index.html` di browser, atau:
```
python3 -m http.server 8080
```
lalu buka http://localhost:8080
