/* ================= DATA GAME: senjata, musuh, aliansi, utility, pahlawan, level, toko ================= */
const WEAPONS=[
  {id:'pistol', nama:'Pistol Dasar',        dmg:1.0, rate:3.2, spread:0,    pierce:0,  col:'#5ad1ff', gun:{len:.7,mag:.22,stock:0}},
  {id:'smg',    nama:'SMG Kolaborasi',      dmg:1.1, rate:5.6, spread:0.05, pierce:0,  col:'#4ee0c0', gun:{len:.8,mag:.3,stock:.15}},
  {id:'ak',     nama:'AK Solidaritas',      dmg:1.8, rate:5.0, spread:0.04, pierce:0,  col:'#ffd24a', gun:{len:1.0,mag:.35,stock:.3}},
  {id:'shotgun',nama:'Shotgun Dialog',      dmg:1.5, rate:2.4, spread:0.55, pierce:0,  col:'#ff9a2e', gun:{len:1.0,mag:.12,stock:.35}},
  {id:'minigun',nama:'Minigun Integrasi',   dmg:1.5, rate:11,  spread:0.08, pierce:0,  col:'#ff6b6b', gun:{len:1.15,mag:.4,stock:.1,barrels:3}},
  {id:'plasma', nama:'Plasma Bhinneka',     dmg:4.2, rate:3.2, spread:0.02, pierce:2,  col:'#c27bff', gun:{len:1.1,mag:.3,stock:.2,glow:1}},
  {id:'rail',   nama:'Railgun Reformasi',   dmg:15,  rate:1.5, spread:0,    pierce:99, col:'#fff06a', gun:{len:1.3,mag:.25,stock:.3,glow:1}}
];
const ENEMIES={
  walker :{nama:'Stereotip',     info:'Penilaian sempit terhadap kelompok lain. Lemah tapi banyak.', hp:6,  spd:2.4,dmg:1,r:.45,size:1,  coin:1, skin:'#7fbf6a',shirt:'#8a5a44',hat:'none'},
  runner :{nama:'Hoaks Viral',   info:'Berita bohong menyebar cepat! Larinya kencang.',              hp:4,  spd:4.4,dmg:1,r:.4, size:.9, coin:1, skin:'#9ad07a',shirt:'#d9822b',hat:'hair'},
  helmet :{nama:'Prasangka',     info:'Berlindung di balik helm kepala batu.',                       hp:13, spd:2.0,dmg:1,r:.5, size:1.05,coin:2, skin:'#6fae8a',shirt:'#5d6b53',hat:'helmet'},
  ghoul  :{nama:'Disinformasi',  info:'Bergerak zig-zag, sulit ditebak.',                            hp:9,  spd:2.8,dmg:1,r:.45,size:1,  coin:2, skin:'#b6a3d9',shirt:'#4a3d73',hat:'hood', zig:1},
  brute  :{nama:'Diskriminasi',  info:'Besar dan keras kepala. Sekali kena, banyak yang tumbang.',   hp:48, spd:1.5,dmg:6,r:.95,size:1.8,coin:6, skin:'#8aa86a',shirt:'#7a2f2f',hat:'bandana'},
  spitter:{nama:'Provokator',    info:'Memicu masalah dari jauh dengan lendir kebencian.',           hp:15, spd:1.4,dmg:2,r:.5, size:1.1,coin:3, skin:'#c7d85a',shirt:'#3f6b3a',hat:'none', ranged:1},
  bomber :{nama:'Radikalisme',   info:'Meledak saat dekat. Tembak sebelum menyentuh pasukan!',       hp:11, spd:3.0,dmg:5,r:.5, size:1.05,coin:3, skin:'#d98b6a',shirt:'#b32b2b',hat:'bomb', boom:1}
};
const BOSSES=[
  {nama:'Beruang Konflik Massal', body:'#8e93a6', belly:'#c9cddb', accent:'#ff4a4a', eye:'#ff3030'},
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
  shield:{nama:'Perisai Norma',    ico:'🛡️',info:'Menahan 3 serangan'},
  haste :{nama:'Kolaborasi',       ico:'⚡',info:'Tembakan 70% lebih cepat (8 dtk)'},
  quad  :{nama:'Inovasi',          ico:'🔥',info:'Damage x2 (8 dtk)'},
  nuke  :{nama:'Reformasi',        ico:'💥',info:'Ledakan besar membersihkan musuh'},
  freeze:{nama:'Dialog Terbuka',   ico:'❄️',info:'Semua musuh melambat (6 dtk)'},
  heal  :{nama:'Solidaritas',      ico:'💚',info:'+8 prajurit'},
  coin  :{nama:'Beasiswa',         ico:'🪙',info:'+40 koin'}
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
