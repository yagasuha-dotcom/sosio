/* ================= DATA GAME ================= */
/* dps per prajurit = dmg x rate. Tiap tingkat naik pelan, bukan loncat. */
const WEAPONS=[
  {id:'pistol', nama:'Pistol Dasar',        dmg:1.0, rate:3.2, spread:0,    pierce:0,  col:'#6fd6ff', hot:'#e6faff', len:.7},
  {id:'smg',    nama:'SMG Kolaborasi',      dmg:0.95,rate:5.8, spread:0.06, pierce:0,  col:'#5df0cf', hot:'#e8fff8', len:.8},
  {id:'ak',     nama:'AK Solidaritas',      dmg:1.75,rate:4.6, spread:0.045,pierce:0,  col:'#ffd34d', hot:'#fff6cf', len:1.0},
  {id:'shotgun',nama:'Shotgun Dialog',      dmg:1.25,rate:2.3, spread:0.6,  pierce:0,  col:'#ff9f3a', hot:'#ffe9c9', len:1.0, pellets:1},
  {id:'minigun',nama:'Minigun Integrasi',   dmg:1.1, rate:11,  spread:0.09, pierce:0,  col:'#ff6b6b', hot:'#ffe1e1', len:1.15},
  {id:'plasma', nama:'Plasma Bhinneka',     dmg:3.6, rate:3.4, spread:0.02, pierce:2,  col:'#c98bff', hot:'#f4e6ff', len:1.1},
  {id:'rail',   nama:'Railgun Reformasi',   dmg:11,  rate:1.6, spread:0,    pierce:99, col:'#fff27a', hot:'#ffffff', len:1.3}
];
/* hp dasar sudah cukup tebal; dikali tingkat kesulitan dan level */
const ENEMIES={
  walker :{nama:'Stereotip',     info:'Penilaian sempit terhadap kelompok lain. Lemah tapi banyak.', hp:14, spd:2.5,dmg:2,r:.45,size:.92,  coin:1, skin:'#86b778',shirt:'#8a5a44',hat:'none'},
  runner :{nama:'Hoaks Viral',   info:'Berita bohong menyebar cepat! Larinya kencang.',              hp:9,  spd:4.6,dmg:2,r:.4, size:.9,coin:1, skin:'#9ad07a',shirt:'#d9822b',hat:'hair'},
  helmet :{nama:'Prasangka',     info:'Berlindung di balik helm kepala batu.',                       hp:30, spd:2.1,dmg:3,r:.5, size:1.1,coin:2, skin:'#6fae8a',shirt:'#5d6b53',hat:'helmet'},
  ghoul  :{nama:'Disinformasi',  info:'Bergerak zig-zag, sulit ditebak.',                            hp:20, spd:3.0,dmg:2,r:.45,size:1.08,  coin:2, skin:'#b6a3d9',shirt:'#4a3d73',hat:'hood', zig:1},
  brute  :{nama:'Diskriminasi',  info:'Besar dan keras kepala. Sekali kena, banyak yang tumbang.',   hp:140,spd:1.6,dmg:9,r:.95,size:1.75,coin:6, skin:'#8aa86a',shirt:'#7a2f2f',hat:'bandana'},
  spitter:{nama:'Provokator',    info:'Memicu masalah dari jauh dengan lendir kebencian.',           hp:34, spd:1.4,dmg:3,r:.5, size:.95,coin:3, skin:'#c7d85a',shirt:'#3f6b3a',hat:'none', ranged:1},
  bomber :{nama:'Radikalisme',   info:'Meledak saat dekat. Tembak sebelum menyentuh pasukan!',       hp:24, spd:3.2,dmg:8,r:.5, size:.95,coin:3, skin:'#d98b6a',shirt:'#b32b2b',hat:'bomb', boom:1}
};
/* kenop penyetelan keseimbangan */
const TUNE={ramp:0.06,prog:0.35,bossHp:620,bossRamp:0.3,startRamp:1.0,startBase:9,cap:60,gap:0.02,maxShow:28,rbE:140,rbB:110,warm:0.55};
/* tingkat kesulitan. hp/cnt/dmg = musuh; gain = jumlah prajurit yang didapat dari gerbang dan tong */
const DIFFS={
  sedang    :{id:'sedang',    nama:'Sedang',    info:'Untuk latihan. Musuh biasa, rezeki prajurit cukup.',                      hp:0.8, cnt:0.85,dmg:0.85,gain:1.0, spd:1.0,  boss:1.0, bad:0.08, coin:1.0, bottle:1.0, startN:0},
  susah     :{id:'susah',     nama:'Susah',     info:'Musuh lebih tebal dan banyak. Salah ambil gerbang langsung terasa.',      hp:1.0, cnt:1.0, dmg:1.0, gain:0.95,spd:1.03, boss:1.15,bad:0.16, coin:1.5, bottle:1.1, startN:-1},
  nightmare :{id:'nightmare', nama:'Nightmare', info:'Hampir tanpa ampun. Setiap prajurit berharga, setiap peluru harus kena.', hp:1.3, cnt:1.15,dmg:1.3, gain:0.85,spd:1.1,  boss:1.5, bad:0.26, coin:2.2, bottle:1.3, startN:-2}
};
const BOSSES=[
  {nama:'Badak Batu Konflik Massal', body:'#7a6f9a', belly:'#b8aed6', accent:'#ff5a3a', eye:'#ff3030'},
  {nama:'Golem Ketimpangan',      body:'#8b7a66', belly:'#b9a68c', accent:'#ffb02e', eye:'#ffd24a'},
  {nama:'Raja Hoaks',             body:'#7b4fb8', belly:'#b995ee', accent:'#6fffd0', eye:'#6fffd0'},
  {nama:'Naga Intoleransi',       body:'#b8453a', belly:'#f0a07a', accent:'#ffe36b', eye:'#fff06a'}
];
const ALLIES={
  medic   :{nama:'Paramedis Solidaritas', info:'Menambah 1 prajurit tiap 3 detik',        helm:'#f4f7ff',ex:'cross'},
  sniper  :{nama:'Sniper Analis Data',    info:'Tembakan tembus bernilai besar',           helm:'#2f8f4e',ex:'scope'},
  heavy   :{nama:'Pasukan Berat Gotong Royong',info:'Damage seluruh pasukan +25%',         helm:'#d63c3c',ex:'big'},
  drone   :{nama:'Drone Literasi Digital',info:'Menembak otomatis ke musuh terdekat',      helm:'#9aa0b8',ex:'rotor'},
  engineer:{nama:'Insinyur Sosial',       info:'Perisai gratis tiap 9 detik',             helm:'#f2c230',ex:'wrench'},
  jurnalis:{nama:'Jurnalis Investigatif', info:'Koin hasil level +25%',                    helm:'#8a5be6',ex:'cam'}
};
const UTILS={
  shield:{nama:'Perisai Norma',    ico:'shield',info:'Menahan 3 serangan'},
  haste :{nama:'Kolaborasi',       ico:'bolt',info:'Tembakan 70% lebih cepat (8 dtk)'},
  quad  :{nama:'Inovasi',          ico:'flame',info:'Damage x2 (8 dtk)'},
  nuke  :{nama:'Reformasi',        ico:'burst',info:'Ledakan besar membersihkan musuh'},
  freeze:{nama:'Dialog Terbuka',   ico:'snow',info:'Semua musuh melambat (6 dtk)'},
  heal  :{nama:'Solidaritas',      ico:'heart',info:'+8 prajurit'},
  coin  :{nama:'Beasiswa',         ico:'coin',info:'+40 koin'}
};
const HEROES=[
  {id:'komandan',nama:'Komandan Sari',   cost:0,   info:'Pemimpin motor tangguh. Mulai dengan +3 prajurit.', startBonus:3, hair:'#f2c75a',jacket:'#6b7f3a',beret:'#1d1d24'},
  {id:'peneliti',nama:'Peneliti Raka',   cost:150, info:'Kuis punya tombol bantuan 50:50 (1x per kuis).',     hint:1,       hair:'#3a2a22',jacket:'#2f6fe8',beret:'#f2f2f2'},
  {id:'aktivis', nama:'Aktivis Dinda',   cost:300, info:'Kecepatan tembak +20%.',                             rate:.2,      hair:'#d9482f',jacket:'#d94b8c',beret:'#ffdd55'},
  {id:'mediator',nama:'Mediator Bima',   cost:450, info:'Mulai dengan 2 perisai. Dialog Terbuka lebih lama.', shield:2,freezeBonus:3,hair:'#222',jacket:'#2fa8a0',beret:'#ffffff'},
  {id:'insinyur',nama:'Insinyur Laras',  cost:600, info:'Tong prajurit memberi +50% prajurit.',               barrelBonus:.5,hair:'#7a4a2a',jacket:'#e08a2d',beret:'#2f2f3a'}
];
const STAGES=[
  {id:0,nama:'Jembatan Perubahan',   bab:'perubahan',   boss:0,rows:22,intro:'Masyarakat selalu berubah. Hadapi arus perubahan sosial!'},
  {id:1,nama:'Gerbang Globalisasi',  bab:'globalisasi', boss:1,rows:24,intro:'Dunia makin terhubung. Saring pengaruh yang masuk.'},
  {id:2,nama:'Zona Konflik',         bab:'konflik',     boss:0,rows:26,intro:'Benturan kepentingan memanas. Pahami akar konflik.'},
  {id:3,nama:'Lorong Kekerasan',     bab:'kekerasan',   boss:3,rows:28,intro:'Kekerasan punya banyak wajah. Lindungi yang lemah.'},
  {id:4,nama:'Meja Perdamaian',      bab:'resolusi',    boss:1,rows:30,intro:'Integrasi dan resolusi konflik: cari jalan damai.'},
  {id:5,nama:'Nusantara Bhinneka',   bab:'multikultur', boss:2,rows:32,intro:'Berbeda-beda tetapi tetap satu. Rawat keberagaman.'},
  {id:6,nama:'Laboratorium Riset',   bab:'penelitian',  boss:2,rows:34,intro:'Jadilah peneliti sosial yang teliti dan beretika.'},
  {id:7,nama:'Ujian Akhir Semesta',  bab:'semua',       boss:3,rows:38,intro:'Semua bab bercampur. Buktikan pemahamanmu!'}
];
const SHOP=[
  {id:'start', nama:'Prajurit Awal',  info:'+2 prajurit di awal level', max:5, base:60},
  {id:'dmg',   nama:'Kekuatan Tembak',info:'+8% damage',                 max:5, base:80},
  {id:'rate',  nama:'Kecepatan Tembak',info:'+6% kecepatan tembak',      max:5, base:80},
  {id:'shield',nama:'Perisai Awal',   info:'+1 perisai di awal level',   max:3, base:120},
  {id:'wpn',   nama:'Senjata Awal',   info:'Mulai satu tingkat lebih tinggi', max:3, base:200}
];
const GATE_GOOD=['Toleransi','Gotong Royong','Dialog','Mediasi','Literasi','Empati','Musyawarah','Kolaborasi','Integrasi'];
const GATE_BAD =['Hoaks','Diskriminasi','Etnosentrisme','Prasangka','Provokasi','Apatis','Stereotip','Intoleransi'];
