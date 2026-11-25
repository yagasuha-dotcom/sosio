/* ================= UI: menu, kuis, hasil (DOM overlay) ================= */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const UI={
  tab:'level',toastT:0,
  init(g,save){
    this.g=g;this.save=save;g.ui=this;
    $('#btnPause').onclick=()=>this.pause();
    document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b){sfx.unlock();this.act(b.dataset.act,b.dataset);}});
    this.menu();
  },
  show(id){['menu','quiz','result','pause'].forEach(k=>$('#'+k).classList.toggle('hidden',k!==id));},
  hideAll(){this.show('none');},
  showHud(on){$('#hud').classList.toggle('hidden',!on);},
  toast(msg,ms){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(this.toastT);this.toastT=setTimeout(()=>t.classList.remove('on'),ms||2200);},
  act(a,d){
    const S=this.save,g=this.g;
    if(a==='tab'){this.tab=d.t;this.menu();}
    else if(a==='play'){const i=+d.i;if(i<=S.unlocked||S.openAll){this.hideAll();g.start(i);}else this.toast('Selesaikan level sebelumnya dulu.');}
    else if(a==='hero'){const h=HEROES.find(x=>x.id===d.id);if(S.heroes[h.id]){S.hero=h.id;}else if(S.coins>=h.cost){S.coins-=h.cost;S.heroes[h.id]=1;S.hero=h.id;sfx.pick();}else this.toast('Koin belum cukup.');persist();this.menu();}
    else if(a==='buy'){const it=SHOP.find(x=>x.id===d.id),lv=S.upg[it.id]||0,cost=it.base*(lv+1);if(lv>=it.max)return;if(S.coins>=cost){S.coins-=cost;S.upg[it.id]=lv+1;sfx.pick();persist();this.menu();}else this.toast('Koin belum cukup.');}
    else if(a==='opt'){S[d.k]=!S[d.k];if(d.k==='sound')sfx.setMuted(!S.sound);persist();this.menu();}
    else if(a==='reset'){if(confirm('Hapus semua progres?')){localStorage.removeItem(SAVE_KEY);location.reload();}}
    else if(a==='menu'){this.g.state='menu';this.showHud(false);this.menu();}
    else if(a==='again'){this.hideAll();g.start(g.si);}
    else if(a==='next'){const n=Math.min(STAGES.length-1,g.si+1);this.hideAll();g.start(n);}
    else if(a==='resume'){this.hideAll();g.state='play';g.last=performance.now();}
  },
  pause(){if(this.g.state!=='play')return;this.g.state='pause';this.show('pause');
    $('#pause').innerHTML='<div class="quiz"><div class="big">Jeda</div><button class="btn" data-act="resume">Lanjut main</button><button class="btn r" data-act="menu">Keluar ke menu</button></div>';},

  /* ---------- menu ---------- */
  menu(){
    const S=this.save;this.show('menu');
    const tabs=[['level','Level'],['hero','Pahlawan'],['shop','Toko'],['materi','Materi'],['opt','Atur']];
    let h='<div class="logo">SOSIO WAR</div><div class="sub">Kalahkan zombie, kuasai sosiologi kelas 12</div>';
    h+='<div class="coins"><span class="chip">🪙 '+S.coins+'</span><span class="chip">⭐ '+Object.values(S.stars).reduce((a,b)=>a+b,0)+'/'+STAGES.length*3+'</span></div>';
    h+='<div class="tabs">'+tabs.map(t=>'<button class="'+(this.tab===t[0]?'on':'')+'" data-act="tab" data-t="'+t[0]+'">'+t[1]+'</button>').join('')+'</div><div class="list">';
    if(this.tab==='level'){
      h+=STAGES.map((st,i)=>{
        const lock=i>S.unlocked&&!S.openAll,B=BAB.find(b=>b.id===st.bab),stars=S.stars[i]||0;
        return '<button class="card row '+(lock?'lock':'')+'" style="text-align:left;color:#fff;font:inherit" data-act="play" data-i="'+i+'"><span class="num">'+(lock?'🔒':i+1)+'</span><span class="grow"><h4>'+esc(st.nama)+'</h4><p>'+(B?B.ikon+' '+esc(B.nama):'📚 Semua bab')+'</p></span><span class="stars">'+'★'.repeat(stars)+'☆'.repeat(3-stars)+'</span></button>';
      }).join('');
      h+='<div class="card"><p>Geser jari kiri-kanan untuk menggerakkan pasukan. Tembak kapsul senjata, ambil, lalu jawab kuis sosiologi untuk naik senjata. Tembak gerbang merah untuk menetralkannya!</p></div>';
    }else if(this.tab==='hero'){
      h+=HEROES.map(x=>{const own=S.heroes[x.id],sel=S.hero===x.id;
        return '<div class="card row"><span class="grow"><h4>'+esc(x.nama)+(sel?' ✅':'')+'</h4><p>'+esc(x.info)+'</p></span><button class="btn '+(own?'b':'o')+'" data-act="hero" data-id="'+x.id+'">'+(own?(sel?'Dipakai':'Pilih'):'🪙 '+x.cost)+'</button></div>';}).join('');
    }else if(this.tab==='shop'){
      h+=SHOP.map(it=>{const lv=S.upg[it.id]||0,cost=it.base*(lv+1),max=lv>=it.max;
        return '<div class="card row"><span class="grow"><h4>'+esc(it.nama)+' · Lv '+lv+'/'+it.max+'</h4><p>'+esc(it.info)+'</p><div class="bar"><i style="width:'+lv/it.max*100+'%"></i></div></span><button class="btn o" data-act="buy" data-id="'+it.id+'" '+(max?'disabled':'')+'>'+(max?'MAX':'🪙 '+cost)+'</button></div>';}).join('');
    }else if(this.tab==='materi'){
      h+='<div class="card"><p>Buku Materi berisi semua kartu konsep. Tanda ✔ muncul setelah kamu menjawab benar di game.</p></div>';
      h+=BAB.map(b=>{
        const qs=QUESTIONS.filter(q=>q.bab===b.id),done=qs.filter(q=>S.q[q.id]&&S.q[q.id].c>0).length;
        return '<details class="card"><summary>'+b.ikon+' '+esc(b.nama)+' ('+done+'/'+qs.length+')</summary><div class="bar"><i style="width:'+done/qs.length*100+'%"></i></div>'+
          qs.map(q=>'<div class="kc"><b>'+((S.q[q.id]&&S.q[q.id].c>0)?'✔ ':'')+esc(q.konsep)+'</b><br>'+esc(q.kartu)+'</div>').join('')+'</details>';}).join('');
      h+='<details class="card"><summary>🧟 Musuh yang pernah ditemui</summary>'+Object.keys(ENEMIES).map(k=>'<div class="kc"><b>'+(S.codexEnemy[k]?esc(ENEMIES[k].nama):'???')+'</b><br>'+(S.codexEnemy[k]?esc(ENEMIES[k].info):'Belum bertemu.')+'</div>').join('')+'</details>';
    }else{
      const sw=(k,l,i)=>'<div class="card switch"><span><h4>'+l+'</h4><p>'+i+'</p></span><button class="sw '+(S[k]?'on':'')+'" data-act="opt" data-k="'+k+'" aria-label="'+l+'"></button></div>';
      h+=sw('sound','Suara','Efek suara permainan')+sw('santai','Mode santai','Jawaban salah tetap menaikkan senjata (cocok untuk latihan di kelas)')+sw('openAll','Buka semua level','Semua level terbuka tanpa harus menamatkan berurutan');
      h+='<button class="btn r" data-act="reset">Hapus progres</button>';
    }
    h+='</div>';$('#menu').innerHTML=h;
  },

  /* ---------- kuis ---------- */
  quiz(q,opt,onAnswer,onClose){
    const B=BAB.find(b=>b.id===q.bab);
    const order=[0,1,2,3].sort(()=>Math.random()-0.5);
    this.show('quiz');
    let h='<div class="quiz"><span class="tag">📘 Kartu Materi · '+B.ikon+' '+esc(B.nama)+'</span>'+
      '<div class="kartu"><h3>'+esc(q.konsep)+'</h3>'+esc(q.kartu)+'</div>'+
      '<div class="qbox"><div class="q">'+esc(q.q)+'</div><div class="opts">'+
      order.map(i=>'<button class="opt" data-i="'+i+'">'+esc(q.o[i])+'</button>').join('')+'</div></div>'+
      '<div class="tag" style="background:#6fd0ff">'+(opt.maxed?'Senjata sudah maksimal, jawab benar untuk bonus damage':'Jawab benar → '+esc(opt.next))+'</div>'+
      (opt.hint?'<button class="btn b" id="hintBtn">Bantuan 50:50</button>':'')+
      '<div id="fb"></div></div>';
    const root=$('#quiz');root.innerHTML=h;
    let answered=false;
    const btns=[...root.querySelectorAll('.opt')];
    const hb=root.querySelector('#hintBtn');
    if(hb)hb.onclick=()=>{hb.remove();let n=0;btns.forEach(b=>{if(+b.dataset.i!==q.a&&n<2){b.classList.add('off');b.disabled=true;n++;}});};
    btns.forEach(b=>b.onclick=()=>{
      if(answered)return;answered=true;sfx.unlock();
      const ok=+b.dataset.i===q.a;
      btns.forEach(x=>{x.disabled=true;if(+x.dataset.i===q.a)x.classList.add('ok');});
      if(!ok)b.classList.add('no');
      const msg=onAnswer(ok);
      if(hb&&hb.parentNode)hb.remove();
      $('#fb').innerHTML='<div class="fb '+(ok?'ok':'no')+'"><b>'+(ok?'Benar! ':'Belum tepat. ')+'</b>'+esc(q.e)+'<br><b>'+esc(msg)+'</b></div><br><button class="btn" id="goBtn">Lanjut bertempur</button>';
      root.querySelector('#goBtn').onclick=()=>{this.hideAll();onClose();};
    });
  },

  /* ---------- hasil ---------- */
  result(r){
    this.show('result');
    const last=r.si>=STAGES.length-1;
    let h='<div class="quiz"><div class="big">'+(r.win?'LEVEL SELESAI!':'PASUKAN GUGUR')+'</div>';
    if(r.win)h+='<div class="stars" style="text-align:center;font-size:34px">'+'★'.repeat(r.stars)+'☆'.repeat(3-r.stars)+'</div>';
    h+='<div class="card"><p>🪙 Koin didapat: <b>'+r.reward+'</b><br>🧟 Musuh dikalahkan: <b>'+r.kills+'</b><br>📘 Kuis benar: <b>'+r.right+'/'+r.asked+'</b><br>👥 Sisa prajurit: <b>'+r.n+'</b></p></div>';
    if(r.missed.length)h+='<div class="card miss"><b>Materi yang perlu diulang:</b><br>'+r.missed.map(m=>'• '+esc(m)).join('<br>')+'<br><br>Buka tab Materi di menu untuk membaca kartunya.</div>';
    else if(r.asked)h+='<div class="card miss"><b>Semua jawabanmu benar. Luar biasa!</b></div>';
    h+='<button class="btn" data-act="again">Main lagi</button>';
    if(r.win&&!last)h+='<button class="btn o" data-act="next">Level berikutnya</button>';
    h+='<button class="btn b" data-act="menu">Menu utama</button></div>';
    $('#result').innerHTML=h;
  }
};
