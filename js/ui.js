/* ================= UI: menu, kuis, hasil (DOM overlay) ================= */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const UI={
  tab:'level',toastT:0,
  init(g,save){
    this.g=g;this.save=save;g.ui=this;
    $('#btnPause').onclick=()=>this.pause();
    document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b){Snd.unlock();Snd.click();this.act(b.dataset.act,b.dataset);}});
    this.menu();
  },
  show(id){['menu','quiz','result','pause'].forEach(k=>$('#'+k).classList.toggle('hidden',k!==id));},
  hideAll(){this.show('none');},
  showHud(on){$('#hud').classList.toggle('hidden',!on);},
  toast(msg,ms){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(this.toastT);this.toastT=setTimeout(()=>t.classList.remove('on'),ms||2200);},
  act(a,d){
    const S=this.save,g=this.g;
    if(a==='tab'){this.tab=d.t;this.menu();}
    else if(a==='diff'){S.diff=d.id;persist();this.menu();}
    else if(a==='play'){const i=+d.i;if(i<=S.unlocked||S.openAll){this.hideAll();g.start(i);}else this.toast('Selesaikan level sebelumnya dulu.');}
    else if(a==='hero'){const h=HEROES.find(x=>x.id===d.id);if(S.heroes[h.id]){S.hero=h.id;}else if(S.coins>=h.cost){S.coins-=h.cost;S.heroes[h.id]=1;S.hero=h.id;Snd.pickup();}else this.toast('Koin belum cukup.');persist();this.menu();}
    else if(a==='buy'){const it=SHOP.find(x=>x.id===d.id),lv=S.upg[it.id]||0,cost=it.base*(lv+1);if(lv>=it.max)return;if(S.coins>=cost){S.coins-=cost;S.upg[it.id]=lv+1;Snd.pickup();persist();this.menu();}else this.toast('Koin belum cukup.');}
    else if(a==='opt'){S[d.k]=!S[d.k];if(d.k==='sound')Snd.setMuted(!S.sound);if(d.k==='music')Snd.setMusic(S.music);persist();this.menu();}
    else if(a==='reset'){if(confirm('Hapus semua progres?')){localStorage.removeItem(SAVE_KEY);location.reload();}}
    else if(a==='menu'){this.g.state='menu';this.showHud(false);this.menu();}
    else if(a==='again'){this.hideAll();g.start(g.si);}
    else if(a==='next'){const n=Math.min(STAGES.length-1,g.si+1);this.hideAll();g.start(n);}
    else if(a==='resume'){this.hideAll();g.state='play';g.last=performance.now();}
  },
  pause(){if(this.g.state!=='play')return;this.g.state='pause';this.show('pause');
    $('#pause').innerHTML='<div class="center"><div class="big">Jeda</div><button class="btn" data-act="resume">Lanjut main</button><button class="btn ghost" data-act="menu">Keluar ke menu</button></div>';},

  /* ---------- menu ---------- */
  menu(){
    const S=this.save;this.show('menu');
    const tabs=[['level','Level'],['hero','Pahlawan'],['shop','Toko'],['materi','Materi'],['opt','Atur']];
    const stars=Object.values(S.stars).reduce((a,b)=>a+b,0);
    let h='<header class="top"><div class="logo"><span>SOSIO</span><b>WAR</b></div><div class="sub">Kalahkan zombie, kuasai sosiologi kelas 12</div>'+
      '<div class="pills"><span class="pill coin"><i class="ic coin"></i>'+S.coins+'</span><span class="pill star"><i class="ic star"></i>'+stars+'/'+STAGES.length*3+'</span></div></header>';
    h+='<nav class="tabs">'+tabs.map(t=>'<button class="'+(this.tab===t[0]?'on':'')+'" data-act="tab" data-t="'+t[0]+'">'+t[1]+'</button>').join('')+'</nav><main class="list">';
    if(this.tab==='level'){
      h+='<div class="diff">'+Object.values(DIFFS).map(d=>'<button class="d-'+d.id+(S.diff===d.id?' on':'')+'" data-act="diff" data-id="'+d.id+'">'+d.nama+'</button>').join('')+'</div>';
      h+='<p class="hint">'+esc((DIFFS[S.diff]||DIFFS.susah).info)+' Koin x'+(DIFFS[S.diff]||DIFFS.susah).coin+'</p>';
      h+='<div class="map">'+STAGES.map((st,i)=>{
        const lock=i>S.unlocked&&!S.openAll,B=BAB.find(b=>b.id===st.bab),n=S.stars[i]||0;
        return '<button class="node'+(lock?' lock':'')+(i===S.unlocked?' cur':'')+'" data-act="play" data-i="'+i+'"><span class="num">'+(lock?'<i class="ic lock"></i>':i+1)+'</span><span class="grow"><b>'+esc(st.nama)+'</b><small>'+(B?B.ikon+' '+esc(B.nama):'Semua bab')+'</small></span><span class="stars">'+'★'.repeat(n)+'<u>'+'★'.repeat(3-n)+'</u></span></button>';
      }).join('')+'</div>';
      h+='<p class="hint">Geser jari kiri-kanan. Tembak botol kaca untuk mengambil senjata, lalu jawab kuis sosiologi supaya senjatamu naik.</p>';
    }else if(this.tab==='hero'){
      h+=HEROES.map(x=>{const own=S.heroes[x.id],sel=S.hero===x.id;
        return '<div class="card row"><span class="grow"><h4>'+esc(x.nama)+'</h4><p>'+esc(x.info)+'</p></span><button class="btn '+(own?(sel?'ghost':'blue'):'gold')+'" data-act="hero" data-id="'+x.id+'">'+(own?(sel?'Dipakai':'Pilih'):'<i class="ic coin"></i>'+x.cost)+'</button></div>';}).join('');
    }else if(this.tab==='shop'){
      h+=SHOP.map(it=>{const lv=S.upg[it.id]||0,cost=it.base*(lv+1),max=lv>=it.max;
        return '<div class="card row"><span class="grow"><h4>'+esc(it.nama)+' <em>Lv '+lv+'/'+it.max+'</em></h4><p>'+esc(it.info)+'</p><div class="bar"><i style="width:'+lv/it.max*100+'%"></i></div></span><button class="btn gold" data-act="buy" data-id="'+it.id+'" '+(max?'disabled':'')+'>'+(max?'MAX':'<i class="ic coin"></i>'+cost)+'</button></div>';}).join('');
    }else if(this.tab==='materi'){
      h+='<p class="hint">Buku Materi berisi semua kartu konsep. Tanda ✔ muncul setelah kamu menjawab benar di game.</p>';
      h+=BAB.map(b=>{
        const qs=QUESTIONS.filter(q=>q.bab===b.id),done=qs.filter(q=>S.q[q.id]&&S.q[q.id].c>0).length;
        return '<details class="card"><summary>'+b.ikon+' '+esc(b.nama)+' <em>'+done+'/'+qs.length+'</em></summary><div class="bar"><i style="width:'+done/qs.length*100+'%"></i></div>'+
          qs.map(q=>'<div class="kc"><b>'+((S.q[q.id]&&S.q[q.id].c>0)?'✔ ':'')+esc(q.konsep)+'</b><br>'+esc(q.kartu)+'</div>').join('')+'</details>';}).join('');
      h+='<details class="card"><summary>Musuh yang pernah ditemui</summary>'+Object.keys(ENEMIES).map(k=>'<div class="kc"><b>'+(S.codexEnemy[k]?esc(ENEMIES[k].nama):'???')+'</b><br>'+(S.codexEnemy[k]?esc(ENEMIES[k].info):'Belum bertemu.')+'</div>').join('')+'</details>';
    }else{
      const sw=(k,l,i)=>'<div class="card switch"><span><h4>'+l+'</h4><p>'+i+'</p></span><button class="sw '+(S[k]?'on':'')+'" data-act="opt" data-k="'+k+'" aria-label="'+l+'"></button></div>';
      h+=sw('sound','Efek suara','Tembakan, ledakan, suara musuh')+sw('music','Musik','Musik latar saat bermain')+sw('santai','Mode santai','Jawaban salah tetap menaikkan senjata. Untuk latihan di kelas')+sw('openAll','Buka semua level','Semua level terbuka tanpa harus menamatkan berurutan');
      h+='<button class="btn danger" data-act="reset">Hapus progres</button>';
    }
    h+='</main>';$('#menu').innerHTML=h;
  },

  /* ---------- kuis ---------- */
  quiz(q,opt,onAnswer,onClose){
    const B=BAB.find(b=>b.id===q.bab);
    const order=[0,1,2,3].sort(()=>Math.random()-0.5),L='ABCD';
    this.show('quiz');$('#toast').classList.remove('on');
    let h='<div class="center q"><span class="ribbon">Kartu Materi · '+B.ikon+' '+esc(B.nama)+'</span>'+
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
    let h='<div class="center"><div class="big '+(r.win?'win':'lose')+'">'+(r.win?'Level selesai':'Pasukan gugur')+'</div><div class="tier">'+esc(r.diff.nama)+'</div>';
    if(r.win)h+='<div class="stars big-stars">'+'★'.repeat(r.stars)+'<u>'+'★'.repeat(3-r.stars)+'</u></div>';
    h+='<div class="card stat"><div><i class="ic coin"></i>Koin<b>'+r.reward+'</b></div><div>Musuh kalah<b>'+r.kills+'</b></div><div>Kuis benar<b>'+r.right+'/'+r.asked+'</b></div><div>Sisa prajurit<b>'+r.n+'</b></div></div>';
    if(r.missed.length)h+='<div class="card miss"><b>Materi yang perlu diulang</b><br>'+r.missed.map(m=>'• '+esc(m)).join('<br>')+'<br><small>Buka tab Materi di menu untuk membaca kartunya.</small></div>';
    else if(r.asked)h+='<div class="card miss"><b>Semua jawabanmu benar. Luar biasa!</b></div>';
    h+='<button class="btn" data-act="again">Main lagi</button>';
    if(r.win&&!last)h+='<button class="btn gold" data-act="next">Level berikutnya</button>';
    h+='<button class="btn ghost" data-act="menu">Menu utama</button></div>';
    $('#result').innerHTML=h;
  }
};
