# SOSIO WAR: Pasukan Sosiologi Kelas 12

Game ala iklan *Last War* (crowd-runner + zombie) dengan **materi sosiologi kelas 12 SMA**.
Setiap kali pasukan mengambil kapsul senjata, game berhenti sejenak: muncul **Kartu Materi** + **kuis**.
Jawab benar → senjata naik tingkat. Jawab salah → hanya bonus damage kecil, dan penjelasan tetap ditampilkan.

## Cara main
- Geser jari kiri/kanan (atau tombol panah / A D) untuk menggerakkan pasukan. Tembakan otomatis.
- Gerbang biru menambah prajurit, gerbang merah mengurangi. **Tembak gerbang** untuk menaikkan angkanya.
- Tembak **tong** untuk menyelamatkan prajurit, tembak **kandang Aliansi** untuk merekrut sekutu.
- Tembak **kapsul senjata biru**, ambil, lalu jawab kuis.
- Kalahkan bos di akhir level. Koin dipakai untuk membeli Pahlawan dan upgrade di Toko.

## Isi game
- 8 level, tiap level satu bab (Perubahan Sosial, Globalisasi, Konflik, Kekerasan, Integrasi & Resolusi Konflik, Multikulturalisme, Penelitian Sosial, Ujian Akhir campuran)
- 37 soal + kartu materi (di `js/sociology.js`)
- 7 senjata, 7 jenis musuh bertema masalah sosial, 4 bos, 6 sekutu, 7 utility, 5 pahlawan, toko upgrade
- Tab **Materi** = buku rangkuman semua konsep. Layar hasil menampilkan materi yang perlu diulang.
- Pengaturan: **Mode santai** (salah pun senjata naik, cocok untuk latihan kelas) dan **Buka semua level**.

## Menjalankan
Tanpa instalasi, tanpa internet. Buka `index.html` di browser, atau:
```bash
python3 -m http.server 8080   # lalu buka http://localhost:8080
```

## Push ke GitHub + GitHub Pages (Termux)
```bash
unzip sosio-war.zip && cd sosio-war
git init && git add . && git commit -m "Sosio War"
git branch -M main
git remote add origin https://github.com/USERNAME/sosio-war.git
git push -u origin main
```
Lalu di GitHub: **Settings → Pages → Source: GitHub Actions**. Workflow di `.github/workflows/pages.yml` akan mem-publish otomatis; siswa cukup membuka link-nya di HP.

## Struktur
```
index.html          halaman utama
css/style.css       tampilan menu, kuis, hasil
js/data.js          senjata, musuh, bos, sekutu, utility, pahlawan, level, toko
js/sociology.js     bank materi dan soal (tambah soal di sini)
js/game.js          mesin game (level, tembakan, tabrakan, kuis, hasil)
js/render.js        gambar karakter dan jalan (prosedural di canvas)
js/ui.js            menu dan overlay
js/audio.js         efek suara WebAudio
js/main.js          penyimpanan progres (localStorage) dan start
```

## Menambah soal
Salin satu blok di `js/sociology.js`, ubah `bab`, `konsep`, `kartu`, `q`, `o` (4 pilihan), `a` (indeks jawaban benar, mulai 0), `e` (penjelasan).
