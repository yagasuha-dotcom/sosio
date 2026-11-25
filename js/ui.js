/* ================= UI: menu, kuis, hasil (DOM overlay) ================= */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const ACC=['#38bdf8','#a78bfa','#fb7185','#fbbf24','#34d399','#f472b6','#22d3ee','#ff9f43'];
const UI={
  tab:'level',toastT:0,
  init(g,save){
    this.g=g;this.save=save;g.ui=this;
    /* sentuhan pertama di mana saja: buka kunci suara supaya lagu lobby bisa mulai */
    document.addEventListener('pointerdown',()=>Snd.unlock(),{once:true});
    $('#btnPause').onclick=()=>this.pause();
    $('#btnMus').onclick=()=>this.quick('music');
    $('#btnSfx').onclick=()=>this.quick('sound');
    document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b){Snd.unlock();Snd.click();this.act(b.dataset.act,b.dataset);}});
    this.menu();
  },
  show(id){['menu','quiz','result','pause'].forEach(k=>$('#'+k).classList.toggle('hidden',k!==id));},
  hideAll(){this.show('none');},
  syncHud(){const S=this.save;if(!S)return;$('#btnMus').classList.toggle('off',!S.music);$('#btnSfx').classList.toggle('off',!S.sound);},
  quick(k){const S=this.save;Snd.unlock();S[k]=!S[k];if(k==='sound')Snd.setMuted(!S.sound);if(k==='music')Snd.setMusic(S.music);persist();this.syncHud();if(k==='sound'&&S.sound)Snd.click();this.toast((k==='music'?'Lagu ':'Efek suara ')+(S[k]?'NYALA':'MATI'),1200);},
  showHud(on){$('#hud').classList.toggle('hidden',!on);},
  toast(msg,ms){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(this.toastT);this.toastT=setTimeout(()=>t.classList.remove('on'),ms||2200);},
  act(a,d){
    const S=this.save,g=this.g;
    if(a==='tab'){this.tab=d.t;this.menu();}
    else if(a==='diff'){S.diff=d.id;persist();this.menu();}
    else if(a==='play'){const i=+d.i;if(i<=S.unlocked||S.openAll){this.hideAll();g.start(i);}else this.toast('Selesaikan level sebelumnya dulu.');}
    else if(a==='hero'){const h=HEROES.find(x=>x.id===d.id);if(S.heroes[h.id]){S.hero=h.id;}else if(S.coins>=h.cost){S.coins-=h.cost;S.heroes[h.id]=1;S.hero=h.id;Snd.pickup();}else this.toast('Koin belum cukup.');persist();this.menu();}
    else if(a==='buy'){const it=SHOP.find(x=>x.id===d.id),lv=S.upg[it.id]||0,cost=it.base*(lv+1);if(lv>=it.max)return;if(S.coins>=cost){S.coins-=cost;S.upg[it.id]=lv+1;Snd.pickup();persist();this.menu();}else this.toast('Koin belum cukup.');}
    else if(a==='opt'){S[d.k]=!S[d.k];if(d.k==='sound')Snd.setMuted(!S.sound);if(d.k==='music')Snd.setMusic(S.music);persist();this.syncHud();if(this.g.state==='pause')this.renderPause();else this.menu();}
    else if(a==='reset'){if(confirm('Hapus semua progres?')){localStorage.removeItem(SAVE_KEY);location.reload();}}
    else if(a==='menu'){this.g.state='menu';Snd.stopJingles();Snd.bgm('stop');Snd.bgmPause(false);this.showHud(false);this.menu();}
    else if(a==='again'){this.hideAll();g.start(g.si);}
    else if(a==='next'){const n=Math.min(STAGES.length-1,g.si+1);this.hideAll();g.start(n);}
    else if(a==='resume'){Snd.bgmPause(false);this.hideAll();g.state='play';g.last=performance.now();}
  },
  pause(){if(this.g.state!=='play')return;this.g.state='pause';Snd.bgmPause(true);this.show('pause');this.renderPause();},
  renderPause(){
    const S=this.save,sw=(k,l)=>'<div class="card switch" style="--c:'+(k==='music'?'#ff6bd6':'#38bdf8')+'"><span><h4>'+l+'</h4></span><button class="sw '+(S[k]?'on':'')+'" data-act="opt" data-k="'+k+'" aria-label="'+l+'"></button></div>';
    $('#pause').innerHTML='<div class="center"><div class="res-emoji">⏸️</div><div class="big win">Jeda</div>'+sw('music','🎵 Lagu')+sw('sound','🔊 Efek suara (tembakan, tombol)')+'<button class="btn" data-act="resume">Lanjut main</button><button class="btn ghost" data-act="menu">Keluar ke menu</button></div>';
  },

  /* ---------- menu ---------- */
  menu(){
    const S=this.save;this.show('menu');Snd.bgm('lobby');
    const tabs=[['level','🗺️','Level'],['hero','🦸','Pahlawan'],['shop','🛒','Toko'],['materi','📚','Materi'],['opt','⚙️','Atur']];
    const stars=Object.values(S.stars).reduce((a,b)=>a+b,0);
    const curI=Math.min(S.unlocked,STAGES.length-1);
    let h='<header class="top"><span class="eyebrow">Sosiologi · Kelas 12</span><div class="logo"><span>SOSIO</span><b>WAR</b></div><div class="sub">Kalahkan monster, kuasai sosiologi kelas 12</div>'+
      '<div class="pills"><span class="pill coin"><i class="ic coin"></i>'+S.coins+'</span><span class="pill star"><i class="ic star"></i>'+stars+'/'+STAGES.length*3+'</span><span class="pill lvl">🏁 Level '+(curI+1)+'</span></div></header>';
    h+='<nav class="tabs">'+tabs.map(t=>'<button class="'+(this.tab===t[0]?'on':'')+'" data-act="tab" data-t="'+t[0]+'"><em>'+t[1]+'</em>'+t[2]+'</button>').join('')+'</nav><main class="list">';
    if(this.tab==='level'){
      const cs=STAGES[curI],cb=BAB.find(b=>b.id===cs.bab);
      h+='<div class="hero-card"><span class="grow"><small>Lanjutkan misi</small><h3>Level '+(curI+1)+' · '+esc(cs.nama)+'</h3><p>'+(cb?cb.ikon+' '+esc(cb.nama):'Semua bab')+'</p></span><button class="btn gold" data-act="play" data-i="'+curI+'">▶ Main</button></div>';
      h+='<div class="diff">'+Object.values(DIFFS).map(d=>'<button class="d-'+d.id+(S.diff===d.id?' on':'')+'" data-act="diff" data-id="'+d.id+'">'+d.nama+'</button>').join('')+'</div>';
      h+='<p class="hint">'+esc((DIFFS[S.diff]||DIFFS.susah).info)+' Koin x'+(DIFFS[S.diff]||DIFFS.susah).coin+'</p>';
      h+='<div class="map">'+STAGES.map((st,i)=>{
        const lock=i>S.unlocked&&!S.openAll,B=BAB.find(b=>b.id===st.bab),n=S.stars[i]||0;
        return '<button class="node'+(lock?' lock':'')+(i===S.unlocked?' cur':'')+'" style="--c:'+ACC[i%ACC.length]+'" data-act="play" data-i="'+i+'"><span class="num">'+(lock?'<i class="ic lock"></i>':i+1)+'</span><span class="grow"><b>'+esc(st.nama)+'</b><small>'+(B?B.ikon+' '+esc(B.nama):'Semua bab')+'</small></span><span class="stars">'+'★'.repeat(n)+'<u>'+'★'.repeat(3-n)+'</u></span></button>';
      }).join('')+'</div>';
      h+='<p class="hint">Geser jari kiri-kanan. Tembak botol kaca untuk mengambil senjata, lalu jawab kuis sosiologi supaya senjatamu naik.</p>';
    }else if(this.tab==='hero'){
      h+=HEROES.map((x,hi)=>{const own=S.heroes[x.id],sel=S.hero===x.id;
        return '<div class="card row" style="--c:'+ACC[(hi+2)%ACC.length]+'"><span class="avatar">'+esc(x.nama.charAt(0))+'</span><span class="grow"><h4>'+esc(x.nama)+'</h4><p>'+esc(x.info)+'</p></span><button class="btn '+(own?(sel?'ghost':'blue'):'gold')+'" data-act="hero" data-id="'+x.id+'">'+(own?(sel?'Dipakai':'Pilih'):'<i class="ic coin"></i>'+x.cost)+'</button></div>';}).join('');
    }else if(this.tab==='shop'){
      h+=SHOP.map((it,si2)=>{const lv=S.upg[it.id]||0,cost=it.base*(lv+1),max=lv>=it.max;
        return '<div class="card row" style="--c:'+ACC[(si2+4)%ACC.length]+'"><span class="grow"><h4>'+esc(it.nama)+' <em>Lv '+lv+'/'+it.max+'</em></h4><p>'+esc(it.info)+'</p><div class="bar"><i style="width:'+lv/it.max*100+'%"></i></div></span><button class="btn gold" data-act="buy" data-id="'+it.id+'" '+(max?'disabled':'')+'>'+(max?'MAX':'<i class="ic coin"></i>'+cost)+'</button></div>';}).join('');
    }else if(this.tab==='materi'){
      h+='<p class="hint">Buku Materi berisi semua kartu konsep. Tanda ✔ muncul setelah kamu menjawab benar di game.</p>';
      h+=BAB.map((b,bi)=>{
        const qs=QUESTIONS.filter(q=>q.bab===b.id),done=qs.filter(q=>S.q[q.id]&&S.q[q.id].c>0).length;
        return '<details class="card" style="--c:'+ACC[bi%ACC.length]+'"><summary>'+b.ikon+' '+esc(b.nama)+' <em>'+done+'/'+qs.length+'</em></summary><div class="bar"><i style="width:'+done/qs.length*100+'%"></i></div>'+
          qs.map(q=>'<div class="kc"><b>'+((S.q[q.id]&&S.q[q.id].c>0)?'✔ ':'')+esc(q.konsep)+'</b><br>'+esc(q.kartu)+'</div>').join('')+'</details>';}).join('');
      h+='<details class="card" style="--c:#ff5470"><summary>🧟 Musuh yang pernah ditemui</summary>'+Object.keys(ENEMIES).map(k=>'<div class="kc"><b>'+(S.codexEnemy[k]?esc(ENEMIES[k].nama):'???')+'</b><br>'+(S.codexEnemy[k]?esc(ENEMIES[k].info):'Belum bertemu.')+'</div>').join('')+'</details>';
    }else{
      const sw=(k,l,i)=>'<div class="card switch" style="--c:'+(k==='music'?'#ff6bd6':k==='sound'?'#38bdf8':k==='santai'?'#34d399':k==='haptic'?'#ff9f43':'#fbbf24')+'"><span><h4>'+l+'</h4><p>'+i+'</p></span><button class="sw '+(S[k]?'on':'')+'" data-act="opt" data-k="'+k+'" aria-label="'+l+'"></button></div>';
      h+=sw('sound','🔊 Efek suara','Tembakan, ledakan, suara musuh, bunyi tombol')+sw('music','🎵 Lagu','Lagu tempur (acak) dan lagu saat menjawab kuis')+sw('haptic','📳 Getar','Getar saat terkena serangan dan ledakan (khusus HP)')+sw('santai','🌴 Mode santai','Jawaban salah tetap menaikkan senjata. Untuk latihan di kelas')+sw('openAll','🔓 Buka semua level','Semua level terbuka tanpa harus menamatkan berurutan');
      h+='<button class="btn danger" data-act="reset">Hapus progres</button>';
    }
    h+='</main>';$('#menu').innerHTML=h;
  },

  /* ---------- kuis ---------- */
  quiz(q,opt,onAnswer,onClose){
    const B=BAB.find(b=>b.id===q.bab);
    const order=[0,1,2,3].sort(()=>Math.random()-0.5),L='ABCD';
    this.show('quiz');$('#toast').classList.remove('on');$('#toast').classList.remove('on');
    let h='<div class="center q"><span class="ribbon">📘 Kartu Materi · '+B.ikon+' '+esc(B.nama)+'</span>'+
      '<div class="kartu"><h3>'+esc(q.konsep)+'</h3>'+esc(q.kartu)+'</div>'+
      '<div class="qbox"><div class="qt">'+esc(q.q)+'</div><div class="opts">'+
      order.map((i,k)=>'<button class="opt" data-i="'+i+'"><b>'+L[k]+'</b><span>'+esc(q.o[i])+'</span></button>').join('')+'</div></div>'+
      '<div class="reward">'+(opt.maxed?'Senjata sudah maksimal. Jawab benar untuk bonus damage':'Jawab benar untuk naik ke '+esc(opt.next))+'</div>'+
      (opt.hint?'<button class="btn blue" id="hintBtn">Bantuan 50:50</button>':'')+
      '<div id="fb"></div></div>';
    const root=$('#quiz');root.innerHTML=h;root.scrollTop=0;
    let answered=false;
    const btns=[...root.querySelectorAll('.opt')];
    const hb=root.querySelector('#hintBtn');
    if(hb)hb.onclick=()=>{hb.remove();let n=0;btns.forEach(b=>{if(+b.dataset.i!==q.a&&n<2){b.classList.add('off');b.disabled=true;n++;}});};
    btns.forEach(b=>b.onclick=()=>{
      if(answered)return;answered=true;Snd.unlock();
      const ok=+b.dataset.i===q.a;
      btns.forEach(x=>{x.disabled=true;if(+x.dataset.i===q.a)x.classList.add('ok');});
      if(!ok)b.classList.add('no');
      const msg=onAnswer(ok);
      if(hb&&hb.parentNode)hb.remove();
      $('#fb').innerHTML='<div class="fb '+(ok?'ok':'no')+'"><b>'+(ok?'Benar! ':'Belum tepat. ')+'</b>'+esc(q.e)+'<br><b>'+esc(msg)+'</b></div><button class="btn" id="goBtn">Lanjut bertempur</button>';
      root.querySelector('#goBtn').onclick=()=>{Snd.click();this.hideAll();onClose();};
      root.scrollTo({top:root.scrollHeight,behavior:'smooth'});
    });
  },

  /* ---------- hasil ---------- */
  result(r){
    this.show('result');
    const last=r.si>=STAGES.length-1;
    let h='<div class="center"><div class="res-emoji">'+(r.win?'🏆':'💀')+'</div><div class="big '+(r.win?'win':'lose')+'">'+(r.win?'Level selesai':'Pasukan gugur')+'</div><div class="tier">'+esc(r.diff.nama)+'</div>';
    if(r.win)h+='<div class="stars big-stars">'+'★'.repeat(r.stars)+'<u>'+'★'.repeat(3-r.stars)+'</u></div>';
    h+='<div class="card stat"><div class="tile t-gold"><span class="ti">🪙</span><small>Koin</small><b>'+r.reward+'</b></div><div class="tile t-red"><span class="ti">⚔️</span><small>Musuh kalah</small><b>'+r.kills+'</b></div><div class="tile t-violet"><span class="ti">🧠</span><small>Kuis benar</small><b>'+r.right+'/'+r.asked+'</b></div><div class="tile t-green"><span class="ti">🪖</span><small>Sisa prajurit</small><b>'+r.n+'</b></div><div class="tile t-gold" style="grid-column:1/-1"><span class="ti">🔥</span><small>Kombo terbaik</small><b>x'+(r.combo||0)+'</b></div></div>';
    if(r.missed.length)h+='<div class="card miss"><b>📖 Materi yang perlu diulang</b><br>'+r.missed.map(m=>'• '+esc(m)).join('<br>')+'<br><small>Buka tab Materi di menu untuk membaca kartunya.</small></div>';
    else if(r.asked)h+='<div class="card miss good"><b>🌟 Semua jawabanmu benar. Luar biasa!</b></div>';
    h+='<button class="btn" data-act="again">🔁 Main lagi</button>';
    if(r.win&&!last)h+='<button class="btn gold" data-act="next">Level berikutnya ➜</button>';
    h+='<button class="btn ghost" data-act="menu">🏠 Menu utama</button></div>';
    if(r.win){const cols=['#ffc83d','#ff6bd6','#7fdcff','#2ee59d','#9b6bff','#ff5470'];h+='<div class="confetti">'+Array.from({length:34},(_,i)=>'<i style="left:'+(Math.random()*100)+'%;background:'+cols[i%cols.length]+';animation-duration:'+(2.2+Math.random()*2.4)+'s;animation-delay:'+(Math.random()*1.2)+'s"></i>').join('')+'</div>';}
    $('#result').innerHTML=h;
  }
};
