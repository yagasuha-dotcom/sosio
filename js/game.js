/* ================= MESIN GAME ================= */
const ROAD=3.2, RS=11;
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

class Game{
  constructor(cv,save){
    this.cv=cv;this.c=cv.getContext('2d');this.save=save;this.ui=null;
    this.state='menu';this.cam=0;this.t=0;this.shake=0;this.redFlash=0;this.keys={};this.dragging=false;
    this.n=0;this.sqx=0;this.targetX=0;this.wi=0;this.allies=[];this.objs=[];this.enemies=[];this.bul=[];this.ebul=[];this.parts=[];this.texts=[];
    this.buffs={haste:0,quad:0,freeze:0};this.boss=null;this.bossZ=100;this.st=STAGES[0];this.si=0;this.coins=0;this.shield=0;this.uid=0;
    this.resize();addEventListener('resize',()=>this.resize());this.bind();
    this.last=performance.now();requestAnimationFrame(t=>this.loop(t));
  }
  resize(){
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const w=this.cv.clientWidth||360,h=this.cv.clientHeight||640;
    this.cv.width=Math.round(w*dpr);this.cv.height=Math.round(h*dpr);this.dpr=dpr;Proj.set(w,h);
  }
  bind(){
    const cv=this.cv;
    cv.addEventListener('pointerdown',e=>{sfx.unlock();this.dragging=true;this.px0=e.clientX;this.sx0=this.targetX;try{cv.setPointerCapture(e.pointerId);}catch(_){}});
    cv.addEventListener('pointermove',e=>{if(this.dragging)this.targetX=this.sx0+(e.clientX-this.px0)/Proj.unit*1.3;});
    const up=()=>{this.dragging=false;};
    cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
    addEventListener('keydown',e=>{this.keys[e.key]=true;});
    addEventListener('keyup',e=>{this.keys[e.key]=false;});
  }
  loop(now){
    const dt=Math.min(0.05,Math.max(0,(now-this.last)/1000));this.last=now;
    if(this.state==='play')this.update(dt);
    else if(this.state==='win'){this.updateFx(dt);this.winT-=dt;if(this.winT<=0)this.finish(true);}
    else if(this.state==='menu'){this.cam+=3*dt;}
    this.render();
    requestAnimationFrame(t=>this.loop(t));
  }

  /* ---------- memulai level ---------- */
  start(si){
    const st=STAGES[si],S=this.save,up=S.upg;
    this.si=si;this.st=st;this.hero=HEROES.find(h=>h.id===S.hero)||HEROES[0];
    this.cam=0;this.t=0;this.speed=5.5;
    this.n0=this.n=10+2*si+(this.hero.startBonus||0)+2*(up.start||0);
    this.sqx=0;this.targetX=0;
    this.wi=Math.min(WEAPONS.length-1,Math.floor(si/3)+(up.wpn||0));
    this.dmgMul=1+0.08*(up.dmg||0);
    this.rateMul=1+0.06*(up.rate||0)+(this.hero.rate||0);
    this.shield=(this.hero.shield||0)+(up.shield||0);
    this.buffs={haste:0,quad:0,freeze:0};
    this.allies=[];this.objs=[];this.enemies=[];this.bul=[];this.ebul=[];this.parts=[];this.texts=[];
    this.coins=0;this.kills=0;this.fireT=0;this.uid=0;this.shake=0;this.redFlash=0;
    this.asked=0;this.right=0;this.missed=[];this.askedIds=new Set();this.seenEnemy={};
    this.seed=(Date.now()&0xffffff)+si*131;this.rnd=mulberry32(this.seed);
    this.build();
    this.state='play';
    this.ui.showHud(true);
    this.ui.toast(st.intro,3200);
  }

  /* ---------- pembuat level ---------- */
  mkId(){return ++this.uid;}
  pickEnemy(prog){
    const si=this.si,pool=[['walker',10]];
    if(prog>0.12)pool.push(['runner',5]);
    if(prog>0.35)pool.push(['helmet',5]);
    if(si>=1)pool.push(['ghoul',4]);
    if(si>=1&&prog>0.4)pool.push(['brute',2]);
    if(si>=2)pool.push(['spitter',3]);
    if(si>=3)pool.push(['bomber',3]);
    let tot=0;for(const p of pool)tot+=p[1];let r=this.rnd()*tot;
    for(const p of pool){r-=p[1];if(r<=0)return p[0];}
    return 'walker';
  }
  enemyScale(prog){return (1+0.2*this.si)*(1+prog*0.6);}
  addEnemy(type,x,z,sc){
    const T=ENEMIES[type],hp=Math.round(T.hp*sc);
    this.enemies.push({k:'e',id:this.mkId(),type,x,z,hp,max:hp,ph:this.rnd()*6,flash:0,on:false,fire:1+this.rnd()*2,r:T.r,zx:this.rnd()*6});
  }
  horde(z,cnt,prog){
    const sc=this.enemyScale(prog);
    for(let i=0;i<cnt;i++)this.addEnemy(this.pickEnemy(prog),(this.rnd()*2-1)*2.7,z+this.rnd()*7,sc);
  }
  build(){
    const st=this.st,r=this.rnd;let z=16;
    const capsEvery=this.si<3?6:5;
    for(let i=0;i<st.rows;i++){
      const prog=i/st.rows;z+=RS;
      if(i===0)this.rowBarrels(z,prog,false);
      else if(i===1)this.rowGates(z,prog);
      else if(i%capsEvery===capsEvery-1)this.rowWeapon(z,prog);
      else this.rowRandom(z,prog);
    }
    this.bossZ=z+22;
    const hp=Math.round(700*(1+0.6*this.si));
    this.boss={k:'boss',id:this.mkId(),kind:st.boss,x:0,z:this.bossZ,hp,max:hp,on:false,r:1.6,flash:0,tFire:2,tSum:5,dead:false};
    this.bossIntro=false;
  }
  rowRandom(z,prog){
    const r=this.rnd()*100;
    if(r<24)this.rowGates(z,prog);
    else if(r<48)this.horde(z,4+Math.floor(this.rnd()*3)+Math.floor(this.si*0.8),prog);
    else if(r<64)this.rowBarrels(z,prog,false);
    else if(r<78)this.rowBarrels(z,prog,true);
    else if(r<87)this.rowCage(z,prog);
    else if(r<94)this.rowCrate(z,prog);
    else this.rowElite(z,prog);
  }
  rowGates(z,prog){
    const r=this.rnd,base=Math.round(6+r()*8+prog*8),m=r();
    let A,B;
    if(m<0.55){A={op:'+',val:base+Math.round(r()*6)};B={op:'+',val:-Math.round(base*0.9+r()*8)};}
    else if(m<0.88){A={op:'+',val:-Math.round(base*0.5+r()*6)};B={op:'+',val:Math.round(base*0.6+r()*5)};}
    else{A={op:'x',val:2};B={op:'+',val:-Math.round(base*0.6+6)};}
    const left=r()<0.5;
    const mk=(g,x)=>{const pos=g.op==='x'||g.val>=0;this.objs.push({k:'gate',id:this.mkId(),x,z,w:2.8,op:g.op,val:g.val,lab:g.op==='x'?'Sinergi':(pos?GATE_GOOD[Math.floor(r()*GATE_GOOD.length)]:GATE_BAD[Math.floor(r()*GATE_BAD.length)]),used:false});};
    mk(A,left?-1.65:1.65);mk(B,left?1.65:-1.65);
  }
  addBarrel(x,z,prog){
    const hp=Math.round((6+this.rnd()*6)*(1+0.18*this.si)*(1+prog*0.5));
    const bonus=1+(this.hero.barrelBonus||0);
    this.objs.push({k:'barrel',id:this.mkId(),x,z,hp,max:hp,give:Math.round((2+hp*0.22)*bonus),r:.85,flash:0});
  }
  rowBarrels(z,prog,withHorde){
    const n=2+Math.floor(this.rnd()*2),xs=[-2.2,-0.9,0.9,2.2].sort(()=>this.rnd()-0.5).slice(0,n);
    xs.forEach(x=>this.addBarrel(x,z+this.rnd()*3,prog));
    if(withHorde)this.horde(z+4,3+Math.floor(this.si*0.8),prog);
  }
  rowCage(z,prog){
    const owned=this.allies.map(a=>a.type),keys=Object.keys(ALLIES);
    const ally=keys[Math.floor(this.rnd()*keys.length)];
    const hp=Math.round(18*this.enemyScale(prog));
    this.objs.push({k:'cage',id:this.mkId(),x:(this.rnd()*2-1)*2,z,hp,max:hp,ally,r:.95,flash:0});
    this.horde(z+3,3,prog);
  }
  rowCrate(z,prog){
    const keys=Object.keys(UTILS),u=keys[Math.floor(this.rnd()*keys.length)];
    this.objs.push({k:'crate',id:this.mkId(),x:(this.rnd()*2-1)*2.4,z,u,r:.8});
    this.horde(z+3,3+Math.floor(this.si*0.5),prog);
  }
  rowElite(z,prog){
    const sc=this.enemyScale(prog);
    this.addEnemy(this.si>=1?'brute':'helmet',(this.rnd()*2-1)*1.8,z,sc);
    if(this.si>=2){this.addEnemy('spitter',-2,z+5,sc);this.addEnemy('spitter',2,z+5,sc);}
    this.horde(z+4,3,prog);
  }
  rowWeapon(z,prog){
    const left=this.rnd()<0.5,x=left?-1.75:1.75,hp=Math.round(16*(1+0.25*this.si)*(1+prog*0.4)+10);
    this.objs.push({k:'cap',id:this.mkId(),x,z,hp,max:hp,r:1.0,flash:0});
    this.horde(z+2,4+Math.floor(this.si),prog);
    this.addBarrel(left?1.8:-1.8,z+6,prog);
  }

  /* ---------- utilitas ---------- */
  halfW(){return clamp(0.5+Math.sqrt(this.n)*0.12,0.6,1.6);}
  text(x,z,s,col,size){this.texts.push({x,z,y:1.2,s,col:col||'#fff',life:1.1,size:size||1});}
  burst(x,z,y,col,n,spd){for(let i=0;i<n;i++)this.parts.push({x,z,y:y||0.6,vx:(Math.random()-0.5)*(spd||4),vy:Math.random()*(spd||4),vz:(Math.random()-0.3)*(spd||4),life:0.5+Math.random()*0.4,col,size:0.12+Math.random()*0.14});}
  hurt(k){
    if(this.state!=='play')return;
    if(this.shield>0){this.shield--;this.text(this.sqx,this.cam+1,'🛡️','#8fd3ff');sfx.pick();return;}
    const lost=Math.min(k,this.n);this.n-=lost;this.shake=Math.max(this.shake,0.3);this.redFlash=0.25;sfx.hurt();
    this.text(this.sqx,this.cam+1.3,'-'+lost,'#ff5a5a');
    if(this.n<=0){this.n=0;this.finish(false);}
  }

  /* ---------- update utama ---------- */
  update(dt){
    this.t+=dt;
    const K=this.keys;
    if(K.ArrowLeft||K.a||K.A)this.targetX-=7*dt;
    if(K.ArrowRight||K.d||K.D)this.targetX+=7*dt;
    const lim=ROAD-0.35;this.targetX=clamp(this.targetX,-lim,lim);
    this.sqx+=(this.targetX-this.sqx)*Math.min(1,dt*14);
    this.cam+=this.speed*dt;
    for(const k in this.buffs)if(this.buffs[k]>0)this.buffs[k]-=dt;
    this.shake=Math.max(0,this.shake-dt);this.redFlash=Math.max(0,this.redFlash-dt);
    this.fire(dt);this.updateAllies(dt);
    this.updateEnemies(dt);this.updateBoss(dt);this.updateObjs(dt);
    this.updateBullets(dt);this.updateFx(dt);
    this.objs=this.objs.filter(o=>!o.dead&&o.z-this.cam>-4);
    this.enemies=this.enemies.filter(e=>e.hp>0&&e.z-this.cam>-3);
  }
  fire(dt){
    const w=WEAPONS[this.wi],rate=w.rate*this.rateMul*(this.buffs.haste>0?1.7:1);
    this.fireT-=dt;
    if(this.fireT>0)return;
    this.fireT=1/rate;
    const nb=Math.min(1+Math.floor(this.n/5),10),dm=this.dmgMul*(this.buffs.quad>0?2:1);
    const dmg=w.dmg*dm*Math.max(1,this.n)/nb*0.7,hw=Math.min(this.halfW(),1.4);
    for(let j=0;j<nb;j++){
      const o=(j-(nb-1)/2),lx=nb>1?o*(hw*2/(nb-1)):0;
      this.bul.push({x:this.sqx+lx,pz:this.cam+0.5,z:this.cam+0.5,vx:o*w.spread*1.6,vz:26,dmg,pierce:w.pierce,col:w.col,hit:{},gv:0.5/nb,big:w.id==='rail'||w.id==='plasma'});
    }
    sfx.shoot();
  }
  updateAllies(dt){
    const dmgBase=14*(1+0.25*this.si);
    for(const a of this.allies){
      a.t+=dt;
      if(a.type==='medic'&&a.t>3){a.t=0;this.n+=1;this.text(this.sqx+a.off,this.cam+1,'+1','#7dffa8');}
      else if(a.type==='sniper'&&a.t>1.1){a.t=0;this.bul.push({x:this.sqx+a.off,pz:this.cam,z:this.cam,vx:0,vz:34,dmg:dmgBase*this.dmgMul,pierce:99,col:'#ff4b4b',hit:{},big:true});}
      else if(a.type==='drone'&&a.t>0.45){
        a.t=0;let best=null,bd=99;
        for(const e of this.enemies){const d=e.z-this.cam;if(d>1&&d<30&&e.hp>0&&d<bd){bd=d;best=e;}}
        if(best){const tt=Math.max(0.2,(best.z-this.cam)/26);this.bul.push({x:this.sqx+a.off,pz:this.cam,z:this.cam,vx:clamp((best.x-(this.sqx+a.off))/tt,-6,6),vz:26,dmg:2.2*(1+0.3*this.si)*this.dmgMul,pierce:0,col:'#6fffd0',hit:{}});}
      }
      else if(a.type==='engineer'&&a.t>9){a.t=0;if(this.shield<3){this.shield++;this.text(this.sqx+a.off,this.cam+1,'🛡️','#8fd3ff');}}
    }
  }
  updateEnemies(dt){
    const slow=this.buffs.freeze>0?0.25:1;
    for(const e of this.enemies){
      if(e.hp<=0)continue;
      const T=ENEMIES[e.type],d=e.z-this.cam;e.flash=Math.max(0,e.flash-dt);
      if(!e.on){if(d<40){e.on=true;this.scaleUp(e);this.seenFirst(e.type);}else continue;}
      if(T.ranged&&d<=14){
        e.z+=this.speed*dt;
        e.fire-=dt*slow;
        if(e.fire<=0){e.fire=2.2;this.ebul.push({x:e.x,z:e.z,tx:this.sqx,dmg:Math.ceil(T.dmg)});}
      }else e.z-=T.spd*dt*slow;
      let tx=this.sqx;
      if(T.zig)tx+=Math.sin(this.t*3+e.zx)*1.6;
      e.x+=clamp(tx-e.x,-1,1)*(T.spd>3?1.7:0.9)*dt*slow;e.x=clamp(e.x,-ROAD+0.3,ROAD-0.3);
      const dd=e.z-this.cam;
      if(dd<0.9&&dd>-2){
        if(Math.abs(e.x-this.sqx)<this.halfW()+e.r+0.2){
          this.hurt(Math.ceil(T.dmg*(1+0.1*this.si)));
          this.burst(e.x,e.z,0.8,T.boom?'#ff9a2e':'#9be86a',10,5);
          if(T.boom){sfx.boom();this.shake=0.4;}
          e.hp=0;
        }
      }
    }
    for(const b of this.ebul){
      b.z-=9*dt;b.x+=clamp(b.tx-b.x,-1,1)*1.5*dt;
      if(b.z-this.cam<0.8){if(Math.abs(b.x-this.sqx)<this.halfW()+0.4)this.hurt(b.dmg);b.dead=true;}
    }
    this.ebul=this.ebul.filter(b=>!b.dead&&b.z-this.cam>-2);
  }
  rb(m){return clamp(1+(this.n-this.n0)/m,1,m>=200?2.4:3);}
  scaleUp(e){if(e.scaled)return;e.scaled=true;e.hp=Math.round(e.hp*this.rb(220));e.max=e.hp;}
  seenFirst(type){
    if(this.seenEnemy[type])return;this.seenEnemy[type]=1;
    const T=ENEMIES[type],S=this.save;
    if(!S.codexEnemy[type]){S.codexEnemy[type]=1;persist();this.ui.toast('Musuh baru: '+T.nama+'. '+T.info,3200);}
  }
  updateBoss(dt){
    const b=this.boss;if(!b||b.dead)return;
    b.flash=Math.max(0,b.flash-dt);
    const d=b.z-this.cam;
    if(!b.on){if(d<42){b.on=true;b.hp=b.max=Math.round(b.max*this.rb(150));this.ui.toast('BOS: '+BOSSES[b.kind].nama+'!',3000);sfx.boom();}else return;}
    const slow=this.buffs.freeze>0?0.4:1;
    if(d>13)b.z-=2.2*dt*slow;else b.z=this.cam+13;
    b.x=Math.sin(this.t*0.9)*1.8;
    b.tFire-=dt*slow;b.tSum-=dt*slow;
    if(b.tFire<=0){b.tFire=2.4;for(const ox of [-1.6,0,1.6])this.ebul.push({x:b.x+ox*0.6,z:b.z,tx:this.sqx+ox*0.5,dmg:3+Math.floor(this.si*0.7)});}
    if(b.tSum<=0){b.tSum=6;const sc=this.enemyScale(0.8);for(let i=0;i<4;i++)this.addEnemy(i%2?'runner':'walker',(this.rnd()*2-1)*2.6,b.z+1+i*0.6,sc);for(const e of this.enemies)if(!e.on&&e.z-this.cam<45)e.on=true;}
  }
  updateObjs(dt){
    for(const o of this.objs){
      const d=o.z-this.cam;o.flash=Math.max(0,(o.flash||0)-dt);
      if(o.k==='gate'&&!o.used&&d<0.2&&d>-2){
        o.used=true;
        if(Math.abs(this.sqx-o.x)<=o.w/2+0.15){
          const old=this.n;
          if(o.op==='x')this.n=Math.min(Math.ceil(this.n*o.val),this.n+30);
          else this.n=Math.max(1,this.n+o.val);
          const dlt=this.n-old;
          this.text(this.sqx,this.cam+1.4,(dlt>=0?'+':'')+dlt,dlt>=0?'#7dc4ff':'#ff6b6b',1.4);
          if(dlt>=0)sfx.gate();else{sfx.bad();this.shake=0.15;}
        }
      }
      if(o.k==='crate'&&d<0.9&&d>-1&&Math.abs(o.x-this.sqx)<this.halfW()+0.7){o.dead=true;this.applyUtil(o.u);}
      if(o.k==='wp'){
        o.x+=(this.sqx-o.x)*Math.min(1,dt*5);o.z-=7*dt;
        if(o.z-this.cam<0.8){o.dead=true;this.openQuiz();return;}
      }
    }
  }
  applyUtil(u){
    const U=UTILS[u];sfx.pick();this.text(this.sqx,this.cam+1.5,U.ico+' '+U.nama,'#ffe36b',1.2);
    if(u==='shield')this.shield+=3;
    else if(u==='haste')this.buffs.haste=8;
    else if(u==='quad')this.buffs.quad=8;
    else if(u==='freeze')this.buffs.freeze=6+(this.hero.freezeBonus||0);
    else if(u==='heal')this.n+=8;
    else if(u==='coin')this.coins+=40;
    else if(u==='nuke'){
      sfx.boom();this.shake=0.6;
      const dmg=45*(1+0.5*this.si);
      for(const e of this.enemies){if(e.on&&e.hp>0){e.hp-=dmg;e.flash=0.2;if(e.hp<=0)this.killEnemy(e,true);}}
      if(this.boss&&this.boss.on&&!this.boss.dead){this.boss.hp-=dmg*3;this.boss.flash=0.2;if(this.boss.hp<=0)this.bossDead();}
      this.ebul=[];
    }
  }
  killEnemy(e,quiet){
    const T=ENEMIES[e.type];e.hp=0;this.kills++;
    this.burst(e.x,e.z,0.8,'#9be86a',8,4);if(!quiet)sfx.kill();
    if(Math.random()<0.45)this.coins+=T.coin;
    if(T.boom){
      this.burst(e.x,e.z,0.8,'#ff9a2e',16,6);
      for(const o of this.enemies)if(o!==e&&o.hp>0&&Math.abs(o.x-e.x)<2.2&&Math.abs(o.z-e.z)<2.2){o.hp-=12*this.enemyScale(0.4);o.flash=0.2;if(o.hp<=0)this.killEnemy(o,true);}
    }
  }
  bossDead(){
    const b=this.boss;if(b.dead)return;b.dead=true;b.hp=0;
    for(let i=0;i<5;i++)this.burst(b.x+(Math.random()-0.5)*2,b.z,1.2,['#ffd24a','#ff7a2e','#fff'][i%3],16,8);
    for(const e of this.enemies)e.hp=0;this.ebul=[];
    this.coins+=100+this.si*20;sfx.boom();this.state='win';this.winT=1.8;this.shake=0.8;
  }
  allyJoin(type){
    const A=ALLIES[type];
    if(this.allies.find(a=>a.type===type)){this.n+=4;this.text(this.sqx,this.cam+1.4,'+4 (duplikat)','#7dffa8');return;}
    if(this.allies.length>=4)this.allies.shift();
    this.allies.push({type,t:0,off:[-1.5,1.5,-2.3,2.3][this.allies.length%4]});
    this.allies.forEach((a,i)=>{a.off=[-1.5,1.5,-2.3,2.3][i];});
    if(type==='heavy')this.dmgMul+=0.25;
    this.ui.toast('Aliansi bergabung: '+A.nama+'. '+A.info,2600);sfx.pick();
  }

  /* ---------- peluru & tabrakan ---------- */
  updateBullets(dt){
    const targets=[];
    for(const e of this.enemies)if(e.on&&e.hp>0)targets.push(e);
    for(const o of this.objs)if((o.k==='barrel'||o.k==='cap'||o.k==='cage'||o.k==='gate')&&o.z-this.cam<42)targets.push(o);
    if(this.boss&&this.boss.on&&!this.boss.dead)targets.push(this.boss);
    for(const b of this.bul){
      b.pz=b.z;b.z+=b.vz*dt;b.x+=b.vx*dt;
      if(b.z-this.cam>46){b.dead=true;continue;}
      for(const t of targets){
        if(t.dead||t.hp<=0&&t.k!=='gate')continue;
        if(t.z<b.pz-0.5||t.z>b.z+0.5)continue;
        const hx=t.k==='gate'?t.w/2:(t.r||0.5)+0.15;
        if(Math.abs(b.x-t.x)>hx||b.hit[t.id])continue;
        b.hit[t.id]=1;this.onHit(b,t);
        if(t.k!=='gate'){if(b.pierce>0)b.pierce--;else{b.dead=true;break;}}
      }
    }
    this.bul=this.bul.filter(b=>!b.dead);
    for(const b of this.bul){b.hx=0;}
  }
  onHit(b,t){
    if(t.k==='gate'){if(t.op!=='x'&&t.val<20){t.acc=(t.acc||0)+(b.gv||0.1);if(t.acc>=1){t.acc-=1;t.val+=1;}}return;}
    t.hp-=b.dmg;t.flash=0.08;sfx.hit();
    if(t.k==='e'){if(t.hp<=0)this.killEnemy(t);}
    else if(t.k==='boss'){if(t.hp<=0)this.bossDead();}
    else if(t.hp<=0){
      t.dead=true;
      if(t.k==='barrel'){this.n+=t.give;this.text(t.x,t.z,'+'+t.give,'#7dc4ff',1.4);this.burst(t.x,t.z,1,'#ffb04a',12,5);sfx.gate();}
      else if(t.k==='cap'){this.burst(t.x,t.z,1,'#6fd0ff',16,6);this.objs.push({k:'wp',id:this.mkId(),x:t.x,z:t.z});sfx.pick();}
      else if(t.k==='cage'){this.burst(t.x,t.z,1,'#ffe36b',16,6);this.allyJoin(t.ally);}
    }
  }
  updateFx(dt){
    for(const p of this.parts){p.x+=p.vx*dt;p.z+=p.vz*dt;p.y+=p.vy*dt;p.vy-=9*dt;p.life-=dt;}
    this.parts=this.parts.filter(p=>p.life>0&&p.y>-0.5);
    for(const t of this.texts){t.life-=dt;t.y+=1.2*dt;}
    this.texts=this.texts.filter(t=>t.life>0);
  }

  /* ---------- kuis sosiologi ---------- */
  pickQuestion(){
    const S=this.save,st=this.st;
    let pool=st.bab==='semua'?QUESTIONS.slice():QUESTIONS.filter(q=>q.bab===st.bab);
    let fresh=pool.filter(q=>!this.askedIds.has(q.id));
    if(!fresh.length){pool=QUESTIONS.slice();fresh=pool.filter(q=>!this.askedIds.has(q.id));}
    if(!fresh.length){this.askedIds.clear();fresh=pool;}
    const unseen=fresh.filter(q=>!(S.q[q.id]&&S.q[q.id].c>0));
    const src=unseen.length?unseen:fresh;
    return src[Math.floor(Math.random()*src.length)];
  }
  openQuiz(){
    const q=this.pickQuestion();this.askedIds.add(q.id);
    this.state='quiz';this.dragging=false;
    const nextIdx=Math.min(WEAPONS.length-1,this.wi+1),maxed=this.wi>=WEAPONS.length-1;
    this.ui.quiz(q,{hint:!!this.hero.hint,santai:this.save.santai,next:WEAPONS[nextIdx].nama,maxed},(ok)=>{
      const S=this.save;
      S.q[q.id]=S.q[q.id]||{a:0,c:0};S.q[q.id].a++;if(ok)S.q[q.id].c++;persist();
      this.asked++;
      let msg;
      if(ok){
        this.right++;
        if(!maxed){this.wi++;msg='Senjata naik: '+WEAPONS[this.wi].nama+'!';}
        else{this.dmgMul+=0.2;msg='Senjata sudah maksimal. Damage +20%!';}
        this.n+=5;this.coins+=15;sfx.correct();
      }else{
        this.missed.push(q.konsep);
        if(S.santai&&!maxed){this.wi++;msg='Mode santai: senjata tetap naik ke '+WEAPONS[this.wi].nama+'.';}
        else{this.dmgMul+=0.15;msg='Belum tepat. Damage +15%. Pelajari kartunya ya!';}
        sfx.wrong();
      }
      return msg;
    },()=>{this.state='play';this.last=performance.now();});
  }

  /* ---------- akhir level ---------- */
  finish(win){
    if(this.state==='over'||this.state==='done')return;
    const S=this.save;this.state=win?'done':'over';this.ui.showHud(false);
    let stars=0,reward=this.coins;
    const acc=this.asked?this.right/this.asked:0;
    if(win){
      stars=1;if(acc>=0.6)stars++;if(this.n>=this.n0+10)stars++;
      reward+=stars*30+this.si*20;
      if(this.allies.find(a=>a.type==='jurnalis'))reward=Math.round(reward*1.25);
      S.stars[this.si]=Math.max(S.stars[this.si]||0,stars);
      if(this.si+1<STAGES.length)S.unlocked=Math.max(S.unlocked,this.si+1);
      sfx.win();
    }else{reward=Math.round(reward*0.5);sfx.lose();}
    S.coins+=reward;persist();
    this.ui.result({win,stars,reward,si:this.si,right:this.right,asked:this.asked,kills:this.kills,n:this.n,missed:[...new Set(this.missed)]});
  }

  /* ---------- gambar ---------- */
  render(){
    const c=this.c,dpr=this.dpr;
    c.setTransform(dpr,0,0,dpr,0,0);
    c.save();
    if(this.shake>0)c.translate((Math.random()-0.5)*8*this.shake,(Math.random()-0.5)*8*this.shake);
    drawBG(c,this.cam);
    if(this.state==='menu'){c.restore();return;}
    const cam=this.cam,t=this.t,list=[];
    for(const o of this.objs)list.push([o.z-cam,o]);
    for(const e of this.enemies)if(e.hp>0&&e.on)list.push([e.z-cam,e]);
    if(this.boss&&this.boss.on&&!this.boss.dead)list.push([this.boss.z-cam,this.boss]);
    list.sort((a,b)=>b[0]-a[0]);
    const nextTier=Math.min(WEAPONS.length-1,this.wi+1);
    for(const [d,o] of list){
      if(d>46||d<-3)continue;
      const p=Proj.p(d),u=Proj.unit*p;
      if(o.k==='gate')drawGate(c,o,cam);
      else if(o.k==='barrel')drawBarrel(c,o,cam,t);
      else if(o.k==='cap')drawCap(c,o,cam,t,nextTier);
      else if(o.k==='cage')drawCage(c,o,cam,t);
      else if(o.k==='crate')drawCrate(c,o,cam,t);
      else if(o.k==='wp')drawPickup(c,o,cam,t,nextTier);
      else if(o.k==='e')drawZombie(c,Proj.x(o.x,d),Proj.y(d),u*0.55,o,t);
      else if(o.k==='boss')drawBoss(c,Proj.x(o.x,d),Proj.y(d),u*0.8,o,t);
    }
    for(const b of this.ebul)drawEBullet(c,b,cam);
    for(const b of this.bul)drawBullet(c,b,cam);
    this.drawSquad(c);
    for(const p of this.parts){const d=p.z-cam,pp=Proj.p(d);c.fillStyle=p.col;c.globalAlpha=Math.max(0,Math.min(1,p.life*2));c.beginPath();c.arc(Proj.x(p.x,d),Proj.y(d)-p.y*Proj.unit*pp,p.size*Proj.unit*pp,0,TAU);c.fill();}
    c.globalAlpha=1;
    for(const tx of this.texts){const d=tx.z-cam,pp=Proj.p(d);c.globalAlpha=Math.min(1,tx.life*2);txt(c,tx.s,Proj.x(tx.x,d),Proj.y(d)-tx.y*Proj.unit*pp,0.5*Proj.unit*pp*tx.size*1.6);}
    c.globalAlpha=1;
    c.restore();
    if(this.redFlash>0){c.fillStyle='rgba(255,0,0,'+(this.redFlash*1.2)+')';c.fillRect(0,0,Proj.W,Proj.H);}
    if(this.state==='play'||this.state==='quiz'||this.state==='win')drawHud(c,this);
  }
  drawSquad(c){
    const t=this.t,s=Proj.unit*0.5,nd=Math.min(this.n,46);
    const cols=Math.max(2,Math.ceil(Math.sqrt(nd*1.3))),items=[];
    for(let i=0;i<nd;i++){
      const row=Math.floor(i/cols),col=i%cols,rowsN=Math.ceil(nd/cols);
      const cx=(col-(Math.min(cols,nd-row*cols)-1)/2)*0.46+Math.sin(i*12.9)*0.07;
      items.push([-0.4-row*0.5-Math.cos(i*7.3)*0.05,cx,i]);
    }
    items.push([0.3,0,-1,'hero']);
    this.allies.forEach((a,i)=>items.push([0.1,a.off,100+i,'ally',a]));
    items.sort((a,b)=>b[0]-a[0]);
    for(const it of items){
      const d=it[0],x=Proj.x(this.sqx+it[1],d),y=Proj.y(d),sc=s*Proj.p(d);
      if(it[3]==='hero')drawHero(c,x,y,sc*1.25,this.hero,t);
      else if(it[3]==='ally'){const A=ALLIES[it[4].type];if(it[4].type==='drone')drawDrone(c,x,y,sc*1.1,t);else drawSoldier(c,x,y,sc*1.1,t,it[2],{helm:A.helm,ex:A.ex});}
      else drawSoldier(c,x,y,sc,t,it[2]);
    }
    const bx=Proj.x(this.sqx,-0.6),by=Proj.y(-0.6)+Proj.unit*0.55;
    c.fillStyle='#2f78ff';c.beginPath();c.arc(bx,by,Proj.unit*0.42,0,TAU);c.fill();c.lineWidth=3;c.strokeStyle='#fff';c.stroke();
    txt(c,String(this.n),bx,by,Proj.unit*0.42*(this.n>=100?0.8:1));
  }
}
