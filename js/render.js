/* ================= RENDER =================
   Semua gambar dibuat dengan kode (tanpa file gambar). Karakter dirender sekali ke kanvas kecil (sprite)
   dengan bayangan, kilau, dan garis tepi, lalu dipakai berulang supaya ringan di HP. */
const TAU=Math.PI*2;
const FONT='"Baloo 2","Erica One","Fredoka","Arial Black","Roboto Black","Segoe UI Black",Impact,system-ui,sans-serif';
const Proj={
  W:360,H:640,top:0,base:0,unit:50,k:0.03,pf:0.44,
  set(W,H){this.W=W;this.H=H;this.top=H*0.045;this.base=H*0.80;this.unit=W/6.9;this.pf=1/(1+42*this.k);},
  p(d){return 1/(1+d*this.k);},
  y(d){const q=(this.p(d)-this.pf)/(1-this.pf);return this.top+(this.base-this.top)*q;},
  x(x,d){return this.W/2+x*this.unit*this.p(d);}
};
/* ---------- alat gambar ---------- */
function shade(h,a){
  if(h[0]!=='#')return h;
  if(h.length===4)h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];
  const n=parseInt(h.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;
  if(a>=0){r+=(255-r)*a;g+=(255-g)*a;b+=(255-b)*a;}else{r*=1+a;g*=1+a;b*=1+a;}
  return 'rgb('+(r|0)+','+(g|0)+','+(b|0)+')';
}
function lg(c,x0,y0,x1,y1,st){const g=c.createLinearGradient(x0,y0,x1,y1);for(const s of st)g.addColorStop(s[0],s[1]);return g;}
function rgr(c,x,y,r0,x1,y1,r1,st){const g=c.createRadialGradient(x,y,r0,x1,y1,r1);for(const s of st)g.addColorStop(s[0],s[1]);return g;}
function rr(c,x,y,w,h,r){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}
function circ(c,x,y,r,fill){c.fillStyle=fill;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
function ell(c,x,y,rx,ry,fill,rot){c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,rot||0,0,TAU);c.fill();}
function cap(c,x0,y0,x1,y1,w,col){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();}
/* kapsul dengan garis tepi + warna + kilau (dipakai untuk lengan, kaki, laras) */
function limb(c,x0,y0,x1,y1,w,col,out,hi){
  cap(c,x0,y0,x1,y1,w+5,out||'rgba(9,22,64,.7)');cap(c,x0,y0,x1,y1,w,col);
  if(hi!==false)cap(c,x0-w*.18,y0,x1-w*.18,y1,Math.max(2,w*.24),hi||shade(col,.35));
}
let _sh=null;
function shadow(c,x,y,w,h,a){
  if(!_sh){_sh=document.createElement('canvas');_sh.width=64;_sh.height=24;const s=_sh.getContext('2d');s.fillStyle=rgr(s,32,12,0,32,12,32,[[0,'rgba(4,8,24,.95)'],[.6,'rgba(4,8,24,.55)'],[1,'rgba(4,8,24,0)']]);s.save();s.translate(32,12);s.scale(1,.375);s.translate(-32,-12*(1/.375)*0.375/0.375*0.375);s.restore();s.clearRect(0,0,64,24);s.save();s.scale(1,.75);s.fillStyle=rgr(s,32,16,0,32,16,32,[[0,'rgba(4,8,24,.95)'],[.6,'rgba(4,8,24,.55)'],[1,'rgba(4,8,24,0)']]);s.fillRect(0,0,64,32);s.restore();}
  c.globalAlpha=Math.min(1,(a||.3)*1.15);c.drawImage(_sh,x-w*1.05,y-h*1.15,w*2.1,h*2.3);c.globalAlpha=1;
}
/* ---------- cache sprite ---------- */
const SPR={};
function spr(key,w,h,ax,ay,fig,fn){
  let s=SPR[key];if(s)return s;
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;
  const c=cv.getContext('2d');c.translate(ax,ay);c.lineJoin='round';c.lineCap='round';fn(c);
  return SPR[key]={cv,ax,ay,fig};
}
function blit(c,s,x,y,H,flash){
  const k=H/s.fig,w=s.cv.width*k,h=s.cv.height*k,px=x-s.ax*k,py=y-s.ay*k;
  c.drawImage(s.cv,px,py,w,h);
  if(flash){c.globalAlpha=s.fig>=300?.3:.6;c.drawImage(flashOf(s),px,py,w,h);c.globalAlpha=1;}
}
function flashOf(s){
  if(!s.fl){
    const cv=document.createElement('canvas');cv.width=s.cv.width;cv.height=s.cv.height;
    const c=cv.getContext('2d');c.drawImage(s.cv,0,0);c.globalCompositeOperation='source-atop';
    c.fillStyle='#fff';c.fillRect(0,0,cv.width,cv.height);s.fl=cv;
  }
  return s.fl;
}
const OUT='rgba(9,22,64,.72)';

/* ================= PRAJURIT (tampak dari belakang, helm biru seperti referensi) ================= */
function soldierSprite(fr,helm,ex){
  helm=helm||'#4a95ff';ex=ex||'';
  return spr('sol|'+fr+'|'+helm+'|'+ex,170,230,85,214,196,c=>{
    const ph=fr*Math.PI/2,sw=Math.sin(ph)*11,bob=Math.abs(Math.cos(ph))*3;
    const big=ex==='big';c.save();if(big)c.scale(1.12,1.12);
    // kaki
    for(const sd of [-1,1]){
      const lx=sd*14,fy=-12+sd*sw;
      limb(c,lx,-80-bob,lx,fy-6,19,'#2f489f',OUT,'#5578dd');
      ell(c,lx,fy+1,13,8,'#151824');ell(c,lx-3,fy-1,6,3,'rgba(255,255,255,.14)');
    }
    // senapan (di belakang badan)
    limb(c,34,-112-bob,44,-190-bob,8,'#252b3a',OUT,'#6a728a');
    limb(c,34,-119-bob,31,-100-bob,9,'#14161e',OUT,'#2c303f');
    limb(c,44,-186-bob,46,-196-bob,5,'#10121a',OUT,'#444a5c');
    if(ex==='scope'){cap(c,40,-150-bob,41,-166-bob,7,'#0e1118');circ(c,41,-168-bob,4.5,'#6fffd0');}
    // badan
    c.translate(0,-bob);
    c.fillStyle=lg(c,-36,-140,36,-70,[[0,'#ffffff'],[.55,'#ece9dc'],[1,'#c9c6b6']]);
    rr(c,-35,-142,70,72,20);c.fill();c.strokeStyle=OUT;c.lineWidth=3;c.stroke();
    c.fillStyle='rgba(60,70,110,.16)';rr(c,-35,-100,70,30,12);c.fill();
    // tali & ransel
    c.fillStyle='#3563cf';rr(c,-18,-140,9,60,3);c.fill();rr(c,9,-140,9,60,3);c.fill();
    c.fillStyle=lg(c,0,-130,0,-92,[[0,'#6188e6'],[1,'#3a58b8']]);rr(c,-21,-128,42,38,10);c.fill();c.strokeStyle=OUT;c.lineWidth=2.5;c.stroke();
    c.fillStyle='rgba(255,255,255,.35)';rr(c,-16,-124,32,6,3);c.fill();
    c.fillStyle='#233a86';rr(c,-35,-84,70,11,3);c.fill();ell(c,0,-78.5,7,4.5,'#d8dbe8');
    // lengan menuju senapan
    limb(c,-31,-128,-24,-155,17,'#f3f1e6',OUT,'#ffffff');circ(c,-24,-158,8.5,'#f3c9a5');
    limb(c,31,-128,38,-150,17,'#f3f1e6',OUT,'#ffffff');circ(c,40,-153,8.5,'#f3c9a5');
    if(ex==='wrench'){limb(c,-24,-160,-30,-184,5,'#cfd6e8',OUT,'#ffffff');}
    // leher & telinga
    ell(c,0,-142,11,8,'#e8b78f');
    circ(c,-27,-166,8,'#efc29c');circ(c,27,-166,8,'#efc29c');
    // helm
    c.fillStyle=rgr(c,-11,-188,3,0,-170,36,[[0,shade(helm,.7)],[.35,helm],[1,shade(helm,-.38)]]);
    c.beginPath();c.arc(0,-170,31,Math.PI*.96,Math.PI*.04+Math.PI*2);c.lineTo(31,-166);c.lineTo(-31,-166);c.closePath();c.fill();
    c.strokeStyle=OUT;c.lineWidth=3;c.stroke();
    c.fillStyle=shade(helm,-.28);c.beginPath();c.ellipse(0,-160,34,9,0,0,TAU);c.fill();c.strokeStyle=OUT;c.lineWidth=2.5;c.stroke();
    c.fillStyle=lg(c,0,-166,0,-154,[[0,shade(helm,.1)],[1,shade(helm,-.35)]]);c.beginPath();c.ellipse(0,-159,31,7,0,0,Math.PI);c.fill();
    c.strokeStyle='rgba(255,255,255,.28)';c.lineWidth=2.5;c.beginPath();c.moveTo(0,-198);c.lineTo(0,-176);c.stroke();
    ell(c,-13,-190,12,6,'rgba(255,255,255,.62)',-.55);ell(c,-17,-192,4,2.4,'rgba(255,255,255,.95)',-.55);
    if(ex==='cross'){c.fillStyle='#fff';rr(c,-6,-180,12,30,2);c.fill();rr(c,-15,-171,30,12,2);c.fill();c.fillStyle='#e63c3c';rr(c,-3.5,-177,7,24,1.5);c.fill();rr(c,-12,-168.5,24,7,1.5);c.fill();}
    if(ex==='cam'){c.fillStyle='#1a1d28';rr(c,-13,-208,26,15,3);c.fill();circ(c,0,-200.5,5,'#9fd8ff');circ(c,-1.5,-202,1.8,'#fff');}
    c.restore();
  });
}
/* ================= KOMANDAN DI MOTOR ================= */
function heroSprite(h,fr){
  return spr('hero|'+h.id+'|'+fr,260,260,130,240,220,c=>{
    const v=Math.sin(fr*Math.PI/2)*1.5;
    // ban belakang
    ell(c,0,-26,22,34,'#14161c');ell(c,0,-26,15,26,'#2a2d38');c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=3;c.beginPath();c.ellipse(0,-30,19,28,0,Math.PI*1.1,Math.PI*1.7);c.stroke();
    for(let i=0;i<5;i++){c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=2;c.beginPath();c.moveTo(-20,-50+i*12);c.lineTo(20,-50+i*12);c.stroke();}
    // knalpot
    limb(c,-34,-40,-46,-84,11,'#8b92a8',OUT,'#d6dcec');ell(c,-46,-86,6,4,'#2c2f3a');
    // bodi motor
    c.fillStyle=lg(c,-34,-110,34,-50,[[0,'#8c9c58'],[.5,'#68783c'],[1,'#3e4b22']]);
    rr(c,-34,-112,68,62,22);c.fill();c.strokeStyle=OUT;c.lineWidth=3.5;c.stroke();
    c.fillStyle='rgba(255,255,255,.22)';rr(c,-24,-108,22,8,4);c.fill();
    // jok & tangki
    c.fillStyle='#232733';rr(c,-26,-98,52,30,12);c.fill();
    // kaki pengendara
    limb(c,-20,-94,-42,-62,18,shade(h.jacket,-.35),OUT,false);limb(c,20,-94,42,-62,18,shade(h.jacket,-.35),OUT,false);
    ell(c,-42,-58,9,6,'#171922');ell(c,42,-58,9,6,'#171922');
    // badan jaket
    c.fillStyle=lg(c,-34,-170,34,-100,[[0,shade(h.jacket,.3)],[.6,h.jacket],[1,shade(h.jacket,-.3)]]);
    rr(c,-34,-172,68,76,24);c.fill();c.strokeStyle=OUT;c.lineWidth=3.5;c.stroke();
    c.fillStyle='rgba(255,255,255,.2)';rr(c,-5,-168,10,68,3);c.fill();
    c.fillStyle=shade(h.jacket,-.35);rr(c,-34,-112,68,9,3);c.fill();
    // lengan ke setang
    limb(c,-34,-156,-46,-122,17,h.jacket,OUT,shade(h.jacket,.35));limb(c,34,-156,46,-122,17,h.jacket,OUT,shade(h.jacket,.35));
    circ(c,-46,-120,8.5,'#f3c9a5');circ(c,46,-120,8.5,'#f3c9a5');
    cap(c,-58,-116,58,-116,7,'#1c1f2a');cap(c,-58,-117,58,-117,2.5,'#6f7690');
    // senapan komandan
    limb(c,50,-120+v,56,-206+v,9,'#262c3b',OUT,'#707893');
    // rambut kuncir
    c.fillStyle=lg(c,0,-200,0,-150,[[0,shade(h.hair,.25)],[1,shade(h.hair,-.3)]]);
    c.beginPath();c.moveTo(-18,-168);c.quadraticCurveTo(-30,-130,-14,-118);c.quadraticCurveTo(-4,-138,4,-168);c.closePath();c.fill();c.strokeStyle=OUT;c.lineWidth=2.5;c.stroke();
    // kepala
    ell(c,0,-190,29,31,'#efc29c');
    c.fillStyle=rgr(c,-8,-206,3,0,-190,36,[[0,shade(h.hair,.3)],[.5,h.hair],[1,shade(h.hair,-.4)]]);
    c.beginPath();c.arc(0,-192,31,Math.PI*.92,Math.PI*2.08);c.lineTo(28,-176);c.quadraticCurveTo(0,-168,-28,-176);c.closePath();c.fill();c.strokeStyle=OUT;c.lineWidth=3;c.stroke();
    ell(c,-12,-208,12,5,'rgba(255,255,255,.4)',-.5);
    // baret
    c.fillStyle=lg(c,0,-222,0,-200,[[0,shade(h.beret,.3)],[1,shade(h.beret,-.2)]]);
    c.beginPath();c.ellipse(6,-210,36,15,-.14,0,TAU);c.fill();c.strokeStyle=OUT;c.lineWidth=3;c.stroke();
    circ(c,6,-224,4,shade(h.beret,.2));
  });
}

/* ================= IKON VEKTOR ================= */
function drawIcon(c,name,x,y,s,col){
  c.save();c.translate(x,y);c.scale(s/20,s/20);c.lineJoin='round';c.lineCap='round';
  const fillOut=(f)=>{c.fillStyle=f;c.fill();c.strokeStyle='rgba(8,16,44,.8)';c.lineWidth=2;c.stroke();};
  if(name==='shield'){c.beginPath();c.moveTo(0,-10);c.lineTo(9,-6);c.quadraticCurveTo(9,5,0,10);c.quadraticCurveTo(-9,5,-9,-6);c.closePath();fillOut(col||lg(c,0,-10,0,10,[[0,'#9fe0ff'],[1,'#2f86ff']]));c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1.6;c.beginPath();c.moveTo(0,-6);c.lineTo(0,6);c.stroke();}
  else if(name==='bolt'){c.beginPath();c.moveTo(3,-10);c.lineTo(-7,2);c.lineTo(-1,2);c.lineTo(-3,10);c.lineTo(7,-3);c.lineTo(1,-3);c.closePath();fillOut(col||lg(c,0,-10,0,10,[[0,'#fff8a0'],[1,'#ffb41f']]));}
  else if(name==='flame'){c.beginPath();c.moveTo(0,-11);c.bezierCurveTo(8,-3,9,3,5,8);c.bezierCurveTo(3,11,-3,11,-5,8);c.bezierCurveTo(-9,3,-6,-3,-2,-6);c.bezierCurveTo(-2,-3,0,-3,0,-11);c.closePath();fillOut(col||lg(c,0,-11,0,11,[[0,'#ffd24a'],[1,'#ff4a1f']]));}
  else if(name==='burst'){c.beginPath();for(let i=0;i<16;i++){const a=i/16*TAU,r=i%2?5:11;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();fillOut(col||lg(c,0,-11,0,11,[[0,'#fff3a0'],[1,'#ff6a1f']]));}
  else if(name==='snow'){c.strokeStyle='#e6f7ff';c.lineWidth=2.6;for(let i=0;i<3;i++){const a=i*Math.PI/3;c.beginPath();c.moveTo(Math.cos(a)*10,Math.sin(a)*10);c.lineTo(-Math.cos(a)*10,-Math.sin(a)*10);c.stroke();}c.strokeStyle='#7fd0ff';c.lineWidth=1.2;for(let i=0;i<3;i++){const a=i*Math.PI/3;c.beginPath();c.moveTo(Math.cos(a)*10,Math.sin(a)*10);c.lineTo(-Math.cos(a)*10,-Math.sin(a)*10);c.stroke();}}
  else if(name==='heart'){c.beginPath();c.moveTo(0,9);c.bezierCurveTo(-13,-1,-8,-11,0,-5);c.bezierCurveTo(8,-11,13,-1,0,9);c.closePath();fillOut(col||lg(c,0,-10,0,10,[[0,'#8affb0'],[1,'#1fbf5f']]));}
  else if(name==='coin'){c.beginPath();c.arc(0,0,9.5,0,TAU);fillOut(lg(c,-7,-8,7,8,[[0,'#fff1a0'],[.5,'#ffc929'],[1,'#d88a00']]));c.strokeStyle='rgba(150,90,0,.7)';c.lineWidth=1.6;c.beginPath();c.arc(0,0,6,0,TAU);c.stroke();c.fillStyle='rgba(150,90,0,.75)';c.fillRect(-1.2,-4,2.4,8);}
  else if(name==='book'){c.beginPath();c.moveTo(-10,-7);c.lineTo(0,-5);c.lineTo(10,-7);c.lineTo(10,8);c.lineTo(0,10);c.lineTo(-10,8);c.closePath();fillOut(lg(c,-10,0,10,0,[[0,'#6fb2ff'],[1,'#2f6fe0']]));c.strokeStyle='#fff';c.lineWidth=1.4;c.beginPath();c.moveTo(0,-5);c.lineTo(0,10);c.stroke();}
  c.restore();
}

/* ================= SENJATA (dipakai di botol, HUD, pickup) ================= */
function gunArt(c,tier,L){
  const W=WEAPONS[tier],u=L/100,col=W.col;
  c.save();c.scale(u,u);c.lineJoin='round';c.lineCap='round';
  const steel=lg(c,0,-10,0,10,[[0,'#6d7590'],[.5,'#3a4056'],[1,'#1d2130']]);
  const dark='#1b1e2a',O='rgba(6,10,30,.85)';
  const body=(x,y,w,h,r,f)=>{rr(c,x,y,w,h,r);c.fillStyle=f||steel;c.fill();c.strokeStyle=O;c.lineWidth=2.4;c.stroke();};
  if(tier===0){ // pistol
    body(-30,-12,60,13,3);body(-6,0,16,26,4,dark);body(24,-8,20,6,2,'#4a5167');
    c.fillStyle=col;c.fillRect(-26,-8,50,2.4);
  }else if(tier===1){ // smg
    body(-34,-11,70,15,3);body(-8,3,12,30,3,dark);body(10,3,12,14,3,dark);body(34,-7,18,6,2,'#4a5167');body(-46,-9,14,10,2,dark);
    c.fillStyle=col;c.fillRect(-30,-7,64,2.4);
  }else if(tier===2){ // AK
    c.beginPath();c.moveTo(-50,-2);c.lineTo(-30,-9);c.lineTo(-30,6);c.lineTo(-47,12);c.closePath();c.fillStyle='#8a5430';c.fill();c.strokeStyle=O;c.lineWidth=2.4;c.stroke();
    body(-30,-10,36,15,3);body(4,-8,24,13,3,'#9a6236');body(26,-5,26,6,2,'#4b5165');
    c.beginPath();c.moveTo(-4,5);c.lineTo(8,5);c.quadraticCurveTo(14,18,20,32);c.lineTo(8,32);c.quadraticCurveTo(0,20,-4,5);c.fillStyle=dark;c.fill();c.strokeStyle=O;c.lineWidth=2.4;c.stroke();
    body(-18,5,8,16,2,dark);c.fillStyle=col;c.fillRect(-26,-6,52,2.2);body(46,-9,4,6,1,'#4b5165');
  }else if(tier===3){ // shotgun
    c.beginPath();c.moveTo(-50,0);c.lineTo(-28,-8);c.lineTo(-28,6);c.lineTo(-46,13);c.closePath();c.fillStyle='#7a4a26';c.fill();c.strokeStyle=O;c.lineWidth=2.4;c.stroke();
    body(-28,-9,28,14,3);body(0,-7,36,12,5,'#8a5430');body(-10,-6,62,5,2,'#3d4358');body(-10,0,58,5,2,'#2c3144');
    body(-12,4,8,16,2,dark);c.fillStyle=col;c.fillRect(-24,-6,18,2.2);
  }else if(tier===4){ // minigun
    body(-40,-14,30,28,6);body(-12,-12,16,24,3,'#4a5167');
    for(let i=-1;i<=1;i++){body(4,i*7-3,46,7,3,i===0?'#7c849c':'#4b5165');}
    c.strokeStyle=col;c.lineWidth=2.6;c.beginPath();c.moveTo(14,-12);c.lineTo(14,12);c.moveTo(34,-12);c.lineTo(34,12);c.stroke();
    body(-26,12,14,16,3,dark);body(-46,-4,10,8,2,dark);
  }else if(tier===5){ // plasma
    c.shadowColor=col;c.shadowBlur=16;
    body(-40,-11,70,22,10,lg(c,0,-11,0,11,[[0,'#6a4aa8'],[1,'#2a1d52']]));c.shadowBlur=0;
    body(26,-7,26,14,6,'#4a3a7c');body(-14,8,12,24,3,dark);
    c.fillStyle=rgr(c,-4,0,1,-4,0,12,[[0,'#fff'],[.4,col],[1,'rgba(201,139,255,0)']]);c.beginPath();c.arc(-4,0,12,0,TAU);c.fill();
    c.strokeStyle=col;c.lineWidth=2.4;c.beginPath();c.moveTo(10,-6);c.lineTo(46,-6);c.moveTo(10,6);c.lineTo(46,6);c.stroke();
  }else{ // railgun
    c.shadowColor=col;c.shadowBlur=14;
    body(-40,-10,44,20,6,steel);body(0,-9,60,6,2,'#c9ced9');body(0,3,60,6,2,'#c9ced9');c.shadowBlur=0;
    for(let i=0;i<4;i++){c.fillStyle=col;c.fillRect(8+i*13,-12,5,24);c.strokeStyle=O;c.lineWidth=1.6;c.strokeRect(8+i*13,-12,5,24);}
    body(-12,8,12,22,3,dark);body(-52,-6,12,12,3,dark);
  }
  c.restore();
}

/* ================= BENDA DI JALAN ================= */
function barrelSprite(red){
  return spr('barrel|'+(red?'r':'w'),180,210,90,194,126,c=>{
    const base=red?'#d8362c':'#e88a2c',H=122;
    // badan tong dengan lengkung
    c.beginPath();c.moveTo(-46,-H);c.bezierCurveTo(-60,-H*.7,-60,-H*.3,-46,-6);c.lineTo(46,-6);c.bezierCurveTo(60,-H*.3,60,-H*.7,46,-H);c.closePath();
    c.fillStyle=lg(c,-56,0,56,0,[[0,shade(base,-.5)],[.22,shade(base,-.1)],[.45,shade(base,.35)],[.7,base],[1,shade(base,-.55)]]);c.fill();c.strokeStyle=OUT;c.lineWidth=4;c.stroke();
    if(!red){c.strokeStyle='rgba(90,40,10,.3)';c.lineWidth=2;for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*14,-H+4);c.quadraticCurveTo(i*15.5,-H/2,i*14,-8);c.stroke();}}
    ell(c,0,-6,46,12,shade(base,-.5));
    // pita logam
    for(const hy of [-H*.78,-H*.22]){
      c.fillStyle=lg(c,0,hy-6,0,hy+6,[[0,'#8a92a8'],[.5,'#4b5268'],[1,'#262b3a']]);
      c.beginPath();c.moveTo(-54,hy-5);c.quadraticCurveTo(0,hy+5,54,hy-5);c.lineTo(54,hy+6);c.quadraticCurveTo(0,hy+16,-54,hy+6);c.closePath();c.fill();c.strokeStyle=OUT;c.lineWidth=2.5;c.stroke();
    }
    if(red){ // pita kuning peringatan + api
      c.save();c.beginPath();c.moveTo(-52,-H*.58);c.quadraticCurveTo(0,-H*.5,52,-H*.58);c.lineTo(52,-H*.4);c.quadraticCurveTo(0,-H*.32,-52,-H*.4);c.closePath();c.clip();
      c.fillStyle='#ffd23a';c.fillRect(-60,-H*.7,120,60);c.fillStyle='#1a1a22';for(let i=-8;i<8;i++){c.beginPath();c.moveTo(i*16,-H*.7);c.lineTo(i*16+9,-H*.7);c.lineTo(i*16-3,-H*.2);c.lineTo(i*16-12,-H*.2);c.fill();}
      c.restore();
    }
    // tutup atas
    ell(c,0,-H,48,15,shade(base,.45));ell(c,0,-H,40,11,shade(base,-.1));c.strokeStyle=OUT;c.lineWidth=3;c.beginPath();c.ellipse(0,-H,48,15,0,0,TAU);c.stroke();
    ell(c,-12,-H-3,16,4,'rgba(255,255,255,.4)',-.1);
    if(red)drawIcon(c,'flame',0,-H,18);
  });
}
function bottleSprite(tier){
  return spr('bottle|'+tier,270,170,135,150,120,c=>{
    const gl=lg(c,0,-110,0,0,[[0,'rgba(190,235,255,.55)'],[.45,'rgba(70,160,255,.6)'],[1,'rgba(20,80,200,.8)']]);
    // badan botol: kapsul horizontal, leher di kiri
    const body=()=>{c.beginPath();c.moveTo(-40,-100);c.bezierCurveTo(60,-108,112,-98,118,-60);c.bezierCurveTo(124,-24,100,-8,50,-6);c.lineTo(-40,-14);c.bezierCurveTo(-62,-18,-72,-34,-84,-42);c.lineTo(-104,-42);c.lineTo(-104,-70);c.lineTo(-84,-70);c.bezierCurveTo(-72,-80,-62,-96,-40,-100);c.closePath();};
    body();c.fillStyle=gl;c.fill();
    // cairan biru di bawah
    c.save();body();c.clip();c.fillStyle='rgba(30,110,255,.55)';c.fillRect(-120,-48,260,60);c.fillStyle='rgba(180,230,255,.5)';c.fillRect(-120,-49,260,3);c.restore();
    // senjata di dalam
    c.save();c.translate(18,-56);c.rotate(-.04);gunArt(c,tier,128);c.restore();
    // kaca depan: tepi, kilau
    body();c.strokeStyle='rgba(20,50,130,.9)';c.lineWidth=4.5;c.stroke();
    body();c.strokeStyle='rgba(230,248,255,.75)';c.lineWidth=1.8;c.stroke();
    ell(c,10,-88,64,6,'rgba(255,255,255,.7)',-.03);
    c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=4;c.beginPath();c.moveTo(100,-80);c.quadraticCurveTo(110,-60,100,-34);c.stroke();
    ell(c,-62,-60,3,10,'rgba(255,255,255,.7)');
    for(const b of [[70,-22,4],[84,-30,2.6],[-10,-24,3]])circ(c,b[0],b[1],b[2],'rgba(255,255,255,.5)');
    // gabus
    c.fillStyle=lg(c,0,-72,0,-40,[[0,'#d9a066'],[1,'#8a5a2a']]);rr(c,-124,-74,28,36,5);c.fill();c.strokeStyle=OUT;c.lineWidth=3;c.stroke();
    c.strokeStyle='rgba(60,30,10,.45)';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-118+i*8,-70);c.lineTo(-118+i*8,-42);c.stroke();}
    cap(c,-100,-72,-94,-72,3,'#7a7f94');cap(c,-100,-40,-94,-40,3,'#7a7f94');
  });
}
function crateSprite(){
  return spr('crate',160,160,80,146,110,c=>{
    c.fillStyle=lg(c,0,-110,0,0,[[0,'#6f8a4a'],[1,'#3a4b26']]);rr(c,-56,-104,112,98,10);c.fill();c.strokeStyle=OUT;c.lineWidth=4;c.stroke();
    c.fillStyle='rgba(255,255,255,.18)';rr(c,-50,-98,100,12,5);c.fill();
    c.fillStyle='#2b3820';rr(c,-56,-70,112,10,2);c.fill();rr(c,-56,-30,112,10,2);c.fill();
    for(const sx of [-40,40])for(const sy of [-64,-24]){circ(c,sx,sy,3.2,'#aab28a');}
    c.fillStyle='#f3f0df';rr(c,-30,-92,60,60,12);c.fill();c.strokeStyle=OUT;c.lineWidth=3;c.stroke();
  });
}
function blockSprite(){
  return spr('block',240,170,120,150,120,c=>{
    c.beginPath();c.moveTo(-98,-6);c.lineTo(-84,-110);c.lineTo(84,-110);c.lineTo(98,-6);c.closePath();
    c.fillStyle=lg(c,0,-110,0,0,[[0,'#bfc3cf'],[1,'#7e8394']]);c.fill();c.strokeStyle=OUT;c.lineWidth=4.5;c.stroke();
    c.save();c.beginPath();c.rect(-90,-86,180,32);c.clip();
    c.fillStyle='#f5f5f5';c.fillRect(-100,-90,200,40);c.fillStyle='#e23a2f';for(let i=-9;i<9;i++){c.beginPath();c.moveTo(i*24,-90);c.lineTo(i*24+14,-90);c.lineTo(i*24-6,-50);c.lineTo(i*24-20,-50);c.fill();}c.restore();
    c.strokeStyle=OUT;c.lineWidth=3;c.strokeRect(-90,-86,180,32);
    ell(c,0,-108,84,10,'#d6d9e3');c.strokeStyle='rgba(0,0,0,.2)';c.lineWidth=2;c.beginPath();c.moveTo(-60,-30);c.lineTo(-40,-44);c.lineTo(-52,-60);c.moveTo(50,-26);c.lineTo(66,-40);c.stroke();
    circ(c,-70,-24,6,'#ff9a2e');circ(c,70,-24,6,'#ff9a2e');
  });
}

/* ================= LATAR: jembatan malam di atas laut =================
   Bagian yang tidak bergerak (laut, badan jalan, pagar) digambar sekali ke kanvas cache. */
function fogOverlay(c){
  const {W,H}=Proj;
  if(!fogOverlay.g||fogOverlay.h!==H){const g=c.createLinearGradient(0,0,0,H*.24);g.addColorStop(0,'rgba(8,20,54,.96)');g.addColorStop(1,'rgba(8,20,54,0)');fogOverlay.g=g;fogOverlay.h=H;}
  c.fillStyle=fogOverlay.g;c.fillRect(0,0,W,H*.24);
}
function vignette(c){fogOverlay(c);}
let _bgKey='',_bgSea=null,_bgRoad=null;
function bgCaches(){
  const W0=Proj.W,H0=Proj.H,dpr=Proj.dpr||1,key=Math.round(W0)+'x'+Math.round(H0)+'x'+dpr;
  if(key===_bgKey)return;_bgKey=key;
  const mkc=()=>{const cv=document.createElement('canvas');cv.width=Math.round(W0*dpr);cv.height=Math.round(H0*dpr);const x=cv.getContext('2d');x.scale(dpr,dpr);return [cv,x];};
  let c;
  [_bgSea,c]=mkc();
  {
  const {W,H}=Proj,X=(x,d)=>Proj.x(x,d),Y=(d)=>Proj.y(d),P=(d)=>Proj.p(d);
  const dN=-8,dF=50,EH=3.35,U=Proj.unit;
  c.fillStyle=lg(c,0,0,0,H,[[0,'#08142e'],[.5,'#0b2150'],[1,'#123a7a']]);c.fillRect(0,0,W,H);

  }
  [_bgRoad,c]=mkc();
  {
  const {W,H}=Proj,X=(x,d)=>Proj.x(x,d),Y=(d)=>Proj.y(d),P=(d)=>Proj.p(d);
  const dN=-8,dF=50,EH=3.35,U=Proj.unit;
  // balok bawah jembatan (tebal tepi)
  c.fillStyle='#1c2750';
  for(const sd of [-1,1]){c.beginPath();c.moveTo(X(sd*(EH+.05),dN),Y(dN));c.lineTo(X(sd*(EH+.05),dF),Y(dF));c.lineTo(X(sd*(EH+.9),dF),Y(dF)+3);c.lineTo(X(sd*(EH+1.2),dN),Y(dN)+U*.8);c.closePath();c.fill();}
  // aspal
  let g=c.createLinearGradient(0,Y(dF),0,Y(dN));g.addColorStop(0,'#6d7391');g.addColorStop(.35,'#8f93ab');g.addColorStop(1,'#c4c6d6');
  c.fillStyle=g;c.beginPath();c.moveTo(X(-EH,dN),Y(dN));c.lineTo(X(-EH,dF),Y(dF));c.lineTo(X(EH,dF),Y(dF));c.lineTo(X(EH,dN),Y(dN));c.closePath();c.fill();
  // lajur tengah gelap (celah jembatan)
  c.fillStyle='#2b3354';c.beginPath();c.moveTo(X(-.3,dN),Y(dN));c.lineTo(X(-.3,dF),Y(dF));c.lineTo(X(.3,dF),Y(dF));c.lineTo(X(.3,dN),Y(dN));c.fill();
  c.fillStyle='#161c35';c.beginPath();c.moveTo(X(-.14,dN),Y(dN));c.lineTo(X(-.14,dF),Y(dF));c.lineTo(X(.14,dF),Y(dF));c.lineTo(X(.14,dN),Y(dN));c.fill();
  c.strokeStyle='rgba(255,210,90,.55)';c.lineWidth=1.8;
  for(const sx of [-.3,.3]){c.beginPath();c.moveTo(X(sx,dN),Y(dN));c.lineTo(X(sx,dF),Y(dF));c.stroke();}
  // garis tepi kuning
  c.strokeStyle='rgba(255,205,70,.8)';c.lineWidth=2.4;
  for(const sx of [-EH+.18,EH-.18]){c.beginPath();c.moveTo(X(sx,dN),Y(dN));c.lineTo(X(sx,dF),Y(dF));c.stroke();}
  // pagar pembatas: dinding beton + rel + tiang
  for(const sd of [-1,1]){
    c.fillStyle=lg(c,0,0,0,H,[[0,'#3a4672'],[1,'#8892b8']]);
    c.beginPath();c.moveTo(X(sd*EH,dN),Y(dN));c.lineTo(X(sd*EH,dF),Y(dF));c.lineTo(X(sd*(EH+.3),dF),Y(dF));c.lineTo(X(sd*(EH+.3),dN),Y(dN));c.closePath();c.fill();
    c.strokeStyle='#c9d3f0';c.lineWidth=2.2;c.beginPath();
    for(let d=dN;d<=dF;d+=2){const y=Y(d)-.72*U*P(d),xx=X(sd*(EH+.15),d);d===dN?c.moveTo(xx,y):c.lineTo(xx,y);}c.stroke();
    c.strokeStyle='#8e9bc8';c.lineWidth=1.6;c.beginPath();
    for(let d=dN;d<=dF;d+=2){const y=Y(d)-.42*U*P(d),xx=X(sd*(EH+.15),d);d===dN?c.moveTo(xx,y):c.lineTo(xx,y);}c.stroke();
  }
  }
}
function drawBG(c,cam,t){
  bgCaches();
  const {W,H}=Proj,X=(x,d)=>Proj.x(x,d),Y=(d)=>Proj.y(d),P=(d)=>Proj.p(d);
  const dN=-8,dF=50,EH=3.35,U=Proj.unit;
  c.drawImage(_bgSea,0,0,W,H);
  c.strokeStyle='rgba(150,200,255,.10)';c.lineWidth=2;c.lineCap='round';
  for(let i=0;i<22;i++){
    const yy=((i*H/22+cam*26)%H),xx=(i*173.7%W),w=14+(i%5)*9+Math.sin(t*1.3+i)*3;
    c.beginPath();c.moveTo(xx-w,yy);c.quadraticCurveTo(xx,yy-5,xx+w,yy);c.stroke();
  }
  c.fillStyle='rgba(190,225,255,.5)';
  for(let i=0;i<26;i++){const yy=((i*H/26+cam*30)%H),xx=(i*97.3+Math.sin(t+i)*6)%W;c.globalAlpha=.25+.25*Math.sin(t*3+i*2);c.fillRect(xx,yy,2,2);}
  c.globalAlpha=1;
  // kerlip lampu kota jauh di kiri-kanan atas
  for(let i=0;i<28;i++){const side=i%2?1:-1,xx=W/2+side*(W*.30+((i*53)%100)/100*W*.2),yy=H*.02+((i*37)%100)/100*H*.1;c.fillStyle='rgba(255,214,140,'+(0.25+0.2*Math.sin(t*2+i))+')';c.fillRect(xx,yy,2.4,2.4);}
  c.drawImage(_bgRoad,0,0,W,H);
  // sambungan melintang
  c.strokeStyle='rgba(30,38,72,.35)';c.lineWidth=1.6;
  const zj=Math.floor((cam+dN)/9)*9;
  for(let z=zj;z<cam+dF;z+=9){const d=z-cam;c.beginPath();c.moveTo(X(-EH,d),Y(d));c.lineTo(X(EH,d),Y(d));c.stroke();}
  // garis lajur putus-putus
  c.fillStyle='rgba(255,255,255,.82)';
  const z0=Math.floor((cam+dN)/4)*4;
  for(let z=z0;z<cam+dF;z+=4){
    const d1=z-cam,d2=z+1.8-cam;
    for(const lx of [-1.75,1.75]){c.beginPath();c.moveTo(X(lx-.07,d1),Y(d1));c.lineTo(X(lx+.07,d1),Y(d1));c.lineTo(X(lx+.07,d2),Y(d2));c.lineTo(X(lx-.07,d2),Y(d2));c.fill();}
  }
  const z1=Math.floor((cam+dN)/3)*3;
  for(let z=z1;z<cam+dF;z+=3){
    const d=z-cam,p=P(d),h=.78*U*p,w=.15*U*p;
    for(const sd of [-1,1]){const xx=X(sd*(EH+.15),d);c.fillStyle='#46568a';c.fillRect(xx-w/2,Y(d)-h,w,h);c.fillStyle='#b9c6ee';c.fillRect(xx-w/2,Y(d)-h,w,h*.16);}
    if(((z/3)|0)%2===0){for(const sd of [-1,1]){const xx=X(sd*(EH+.02),d),yy=Y(d)-.05*U*p;c.fillStyle=((z/3|0)%4===0)?'#ff7a2e':'#f4f4ff';c.fillRect(xx-w*.6,yy-.14*U*p,w*1.2,.14*U*p);}}
  }
  // tiang lampu + cahaya hangat di jalan
  const zl=Math.floor((cam+dN)/14)*14;
  for(let z=zl;z<cam+dF;z+=14){
    const d=z-cam;if(d<-4)continue;const p=P(d);
    for(const sd of [-1,1]){
      const bx=X(sd*(EH+.3),d),by=Y(d),hh=2.3*U*p;
      c.strokeStyle='#59658f';c.lineWidth=Math.max(1.5,.07*U*p);c.beginPath();c.moveTo(bx,by);c.lineTo(bx,by-hh);c.quadraticCurveTo(bx,by-hh-.25*U*p,bx-sd*.5*U*p,by-hh-.22*U*p);c.stroke();
      const lx=bx-sd*.55*U*p,ly=by-hh-.2*U*p;
      c.globalCompositeOperation='lighter';
      c.fillStyle=rgr(c,lx,ly,0,lx,ly,.9*U*p,[[0,'rgba(255,230,170,.95)'],[.25,'rgba(255,200,110,.35)'],[1,'rgba(255,180,80,0)']]);c.beginPath();c.arc(lx,ly,.9*U*p,0,TAU);c.fill();
      const gx=X(sd*1.7,d),gy=Y(d);
      c.fillStyle=rgr(c,gx,gy,0,gx,gy,1.7*U*p,[[0,'rgba(255,215,140,.20)'],[1,'rgba(255,190,100,0)']]);c.beginPath();c.ellipse(gx,gy,1.9*U*p,.6*U*p,0,0,TAU);c.fill();
      c.globalCompositeOperation='source-over';
    }
  }
  // menara jembatan gantung + kabel
  const zp=Math.floor((cam+dN)/60)*60;
  for(let z=zp;z<cam+dF+60;z+=60){
    const d=z-cam;if(d>dF||d<-6)continue;const p=P(d),hp=8*U*p;
    for(const sd of [-1,1]){
      const bx=X(sd*(EH+1.1),d),by=Y(d)+.3*U*p;
      c.fillStyle=lg(c,bx-.3*U*p,0,bx+.3*U*p,0,[[0,'#2c3866'],[.5,'#5a6aa5'],[1,'#27325c']]);c.fillRect(bx-.28*U*p,by-hp,.56*U*p,hp);
      c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1.5;c.strokeRect(bx-.28*U*p,by-hp,.56*U*p,hp);
      c.strokeStyle='rgba(200,215,255,.45)';c.lineWidth=Math.max(1.2,.05*U*p);
      for(const dd of [-26,26]){const d2=d+dd,x2=X(sd*(EH+.2),d2),y2=Y(d2)-.7*U*P(d2);c.beginPath();c.moveTo(bx,by-hp);c.quadraticCurveTo((bx+x2)/2,(by-hp+y2)/2+.5*U*p,x2,y2);c.stroke();}
      c.fillStyle='#ff3b3b';c.globalAlpha=.6+.4*Math.sin(t*4+z);c.beginPath();c.arc(bx,by-hp,Math.max(1.5,.1*U*p),0,TAU);c.fill();c.globalAlpha=1;
    }
    // palang melintang di atas menara
    c.fillStyle='#3a4678';c.fillRect(X(-(EH+1.1),d)-.3*U*p,Y(d)+.3*U*p-hp,X(EH+1.1,d)-X(-(EH+1.1),d)+.6*U*p,Math.max(2,.22*U*p));
  }
}

/* ================= OBJEK DI JALAN ================= */
function numPlate(c,x,y,u,n,size){txt(c,String(Math.max(0,Math.ceil(n))),x,y,size||0.55*u);}
function drawGate(c,o,cam,t){
  const d=o.z-cam,p=Proj.p(d),u=Proj.unit*p,pos=o.op==='x'||o.val>=0,gold=o.op==='x';
  const xl=Proj.x(o.x-o.w/2,d),xr=Proj.x(o.x+o.w/2,d),yb=Proj.y(d),wd=xr-xl,h=Math.min(1.55*u,wd*.58),ins=wd*.045;
  const A=gold?['#fff0a0','#ffb62a','#7a4a00','#ffd34d']:pos?['#9ad4ff','#2f78ff','#0f2a78','#59a8ff']:['#ffa496','#e83a3a','#6c0f12','#ff6a5a'];
  // pijakan bercahaya di aspal
  c.globalCompositeOperation='lighter';
  c.fillStyle=rgr(c,(xl+xr)/2,yb,0,(xl+xr)/2,yb,wd*.62,[[0,gold?'rgba(255,190,60,.38)':pos?'rgba(70,140,255,.38)':'rgba(255,70,60,.38)'],[1,'rgba(0,0,0,0)']]);
  c.beginPath();c.ellipse((xl+xr)/2,yb+.05*u,wd*.58,.34*u,0,0,TAU);c.fill();c.globalCompositeOperation='source-over';
  // ketebalan papan (sisi bawah)
  c.fillStyle=A[2];c.beginPath();c.moveTo(xl,yb);c.lineTo(xr,yb);c.lineTo(xr-ins*.4,yb+.17*u);c.lineTo(xl+ins*.4,yb+.17*u);c.closePath();c.fill();
  // papan utama
  c.beginPath();c.moveTo(xl,yb);c.lineTo(xr,yb);c.lineTo(xr-ins,yb-h);c.lineTo(xl+ins,yb-h);c.closePath();
  c.fillStyle=lg(c,0,yb-h,0,yb,[[0,A[0]],[.35,A[3]],[1,A[1]]]);c.fill();
  c.lineWidth=Math.max(2,.07*u);c.strokeStyle=A[2];c.stroke();
  // kaca dalam + garis kilau miring
  c.save();c.clip();
  c.fillStyle='rgba(255,255,255,.17)';
  for(let i=-2;i<8;i++){const sx=xl+i*wd*.2+((t*.04)%.2)*wd;c.beginPath();c.moveTo(sx,yb);c.lineTo(sx+wd*.08,yb);c.lineTo(sx+wd*.08+h*.5,yb-h);c.lineTo(sx+h*.5,yb-h);c.fill();}
  c.fillStyle='rgba(255,255,255,.35)';c.fillRect(xl,yb-h,wd,h*.1);
  c.restore();
  c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=Math.max(1,.025*u);
  c.beginPath();c.moveTo(xl+wd*.04,yb-h*.06);c.lineTo(xr-wd*.04,yb-h*.06);c.lineTo(xr-ins-wd*.03,yb-h*.94);c.lineTo(xl+ins+wd*.03,yb-h*.94);c.closePath();c.stroke();
  // baut sudut
  for(const [bx,by] of [[xl+wd*.07,yb-h*.12],[xr-wd*.07,yb-h*.12],[xl+ins+wd*.06,yb-h*.88],[xr-ins-wd*.06,yb-h*.88]])circ(c,bx,by,Math.max(1.5,.04*u),'rgba(255,255,255,.75)');
  // angka dan label
  const val=gold?('×'+o.val):((o.val>=0?'+':'−')+Math.abs(o.val));
  const pul=o.pulse>0?1+o.pulse*1.4:1;
  txt(c,val,(xl+xr)/2,yb-h*.38,h*.62*pul);
  txt(c,o.lab,(xl+xr)/2,yb-h*.82,Math.min(h*.2,wd*.12),pos?'#e8f4ff':'#fff0ee');
}
function drawSpike(c,o,cam,t){
  const d=o.z-cam,p=Proj.p(d),u=Proj.unit*p,xl=Proj.x(o.x-o.w/2,d),xr=Proj.x(o.x+o.w/2,d),yb=Proj.y(d),wd=xr-xl;
  c.fillStyle='#2a2f42';rr(c,xl,yb-.2*u,wd,.26*u,.06*u);c.fill();c.strokeStyle=OUT;c.lineWidth=Math.max(1.5,.05*u);c.stroke();
  c.fillStyle='#ffcf3a';for(let i=0;i<wd/(.5*u);i++){c.fillRect(xl+i*.5*u+.06*u,yb-.15*u,.22*u,.1*u);}
  const n=Math.max(4,Math.round(wd/(.24*u)));
  for(let i=0;i<n;i++){
    const sx=xl+(i+.5)*wd/n,sw=wd/n*.42;
    c.fillStyle=lg(c,sx-sw,0,sx+sw,0,[[0,'#8d96b0'],[.5,'#f2f5ff'],[1,'#7b839d']]);
    c.beginPath();c.moveTo(sx-sw,yb-.2*u);c.lineTo(sx,yb-.2*u-.52*u);c.lineTo(sx+sw,yb-.2*u);c.closePath();c.fill();c.strokeStyle=OUT;c.lineWidth=Math.max(1,.03*u);c.stroke();
  }
  if(o.used){c.fillStyle='rgba(255,60,60,.28)';c.fillRect(xl,yb-.8*u,wd,.9*u);}
}
function drawBarrelObj(c,o,cam,t,red){
  const d=o.z-cam,p=Proj.p(d),u=Proj.unit*p,x=Proj.x(o.x,d),y=Proj.y(d),f=o.flash>0,H=1.18*u;
  shadow(c,x,y+.02*u,.7*u,.2*u,.32);
  blit(c,barrelSprite(red),x,y,H,f);
  if(!red){
    const n=o.give>=7?3:2,top=y-H*.97;
    for(let i=0;i<n;i++){const sx=x+(i-(n-1)/2)*.3*u;blit(c,soldierSprite((Math.floor(t*8+i)%4),'#4a95ff',''),sx,top+.06*u-Math.abs(i-(n-1)/2)*.0,.78*u);}
  }
  numPlate(c,x,y-H*.42,u,o.hp,.5*u);
}
function drawBlockObj(c,o,cam){
  const d=o.z-cam,p=Proj.p(d),u=Proj.unit*p,x=Proj.x(o.x,d),y=Proj.y(d),f=o.flash>0;
  shadow(c,x,y,1.3*u,.22*u,.3);blit(c,blockSprite(),x,y,1.1*u,f);numPlate(c,x,y-.37*u,u,o.hp,.46*u);
}
function drawBottleObj(c,o,cam,t,tier){
  const d=o.z-cam,p=Proj.p(d),u=Proj.unit*p,x=Proj.x(o.x,d),y=Proj.y(d),f=o.flash>0,bob=Math.sin(t*2.4+o.id)*.04*u;
  shadow(c,x,y,1.2*u,.2*u,.3);
  c.globalCompositeOperation='lighter';c.fillStyle=rgr(c,x,y-.5*u,0,x,y-.5*u,1.5*u,[[0,'rgba(90,180,255,.28)'],[1,'rgba(90,180,255,0)']]);c.beginPath();c.arc(x,y-.5*u,1.5*u,0,TAU);c.fill();c.globalCompositeOperation='source-over';
  blit(c,bottleSprite(tier),x,y-.1*u+bob,1.18*u,f);
  numPlate(c,x+.1*u,y+.42*u,u,o.hp,.62*u);
  drawIcon(c,'book',x-.6*u,y-1.08*u+bob,.46*u);
}
function drawCageObj(c,o,cam,t){
  const d=o.z-cam,p=Proj.p(d),u=Proj.unit*p,x=Proj.x(o.x,d),y=Proj.y(d),A=ALLIES[o.ally],f=o.flash>0;
  shadow(c,x,y,.9*u,.2*u,.3);
  c.fillStyle='rgba(255,226,120,.16)';rr(c,x-.8*u,y-1.8*u,1.6*u,1.8*u,.1*u);c.fill();
  if(o.ally==='drone')drawDroneSprite(c,x,y-.95*u,1.2*u,t);else blit(c,soldierSprite(Math.floor(t*6)%4,A.helm,A.ex),x,y-.06*u,1.22*u);
  c.strokeStyle=f?'#fff':'#e8c24a';c.lineWidth=Math.max(2,.07*u);
  for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(x+i*.25*u,y);c.lineTo(x+i*.25*u,y-1.8*u);c.stroke();}
  c.beginPath();c.rect(x-.8*u,y-1.8*u,1.6*u,1.8*u);c.stroke();
  c.fillStyle='#e8c24a';c.fillRect(x-.86*u,y-1.86*u,1.72*u,.12*u);
  txt(c,'ALIANSI',x,y-2.12*u,.3*u,'#ffe36b');numPlate(c,x,y+.38*u,u,o.hp,.6*u);
}
function drawDroneSprite(c,x,y,s,t){
  const hv=Math.sin(t*5)*.05*s;
  c.save();c.translate(x,y+hv);
  shadow(c,0,s*.9-hv,.35*s,.1*s,.2);
  ell(c,0,0,.34*s,.22*s,lg(c,0,-.2*s,0,.2*s,[[0,'#d5dbef'],[1,'#7e86a6']]));c.strokeStyle=OUT;c.lineWidth=2.4;c.beginPath();c.ellipse(0,0,.34*s,.22*s,0,0,TAU);c.stroke();
  circ(c,.13*s,-.02*s,.07*s,'#6fffd0');
  const a=t*38;c.strokeStyle='rgba(235,240,255,.85)';c.lineWidth=Math.max(1.5,.05*s);
  for(const sx of [-1,1]){cap(c,sx*.42*s-Math.cos(a)*.3*s,-.22*s,sx*.42*s+Math.cos(a)*.3*s,-.22*s,Math.max(1.5,.05*s),'rgba(235,240,255,.85)');}
  c.restore();
}
function drawCrateObj(c,o,cam,t){
  const d=o.z-cam,p=Proj.p(d),u=Proj.unit*p,x=Proj.x(o.x,d),y0=Proj.y(d),bob=Math.abs(Math.sin(t*3+o.id))*.14*u;
  shadow(c,x,y0,.6*u,.16*u,.3);
  c.globalCompositeOperation='lighter';c.fillStyle=rgr(c,x,y0-.5*u,0,x,y0-.5*u,1.1*u,[[0,'rgba(255,230,140,.3)'],[1,'rgba(255,230,140,0)']]);c.beginPath();c.arc(x,y0-.5*u,1.1*u,0,TAU);c.fill();c.globalCompositeOperation='source-over';
  blit(c,crateSprite(),x,y0-bob,1.0*u);drawIcon(c,UTILS[o.u].ico,x,y0-bob-.56*u,.55*u);
}
function drawPickupObj(c,o,cam,t,tier){
  const d=o.z-cam,p=Proj.p(d),u=Proj.unit*p,x=Proj.x(o.x,d),y=Proj.y(d)-.6*u;
  c.save();c.translate(x,y);
  c.globalCompositeOperation='lighter';c.fillStyle=rgr(c,0,0,0,0,0,1.4*u,[[0,'rgba(120,210,255,.5)'],[1,'rgba(120,210,255,0)']]);c.beginPath();c.arc(0,0,1.4*u,0,TAU);c.fill();c.globalCompositeOperation='source-over';
  c.translate(0,Math.sin(t*6)*.1*u);c.rotate(.2*Math.sin(t*4));gunArt(c,tier,1.5*u);c.restore();
}
/* ---------- musuh dan bos ---------- */
function drawEnemy(c,x,y,s,e,t){
  const T=ENEMIES[e.type],fr=Math.floor(t*7+e.ph)&3,f=e.flash>0;
  shadow(c,x,y+.01*s,.55*s*T.size,.15*s*T.size,.3);
  const dy=(e.hop||0);
  blit(c,zombieSprite(e.type,fr),x,y-dy,1.12*s*T.size,f);
  if(T.size>=1.4&&e.hp<e.max){ // bar hp makhluk besar
    const w=.9*s*T.size,hh=Math.max(3,.09*s),yy=y-2.25*s*T.size*.9;
    c.fillStyle='rgba(8,14,36,.85)';rr(c,x-w/2-2,yy-2,w+4,hh+4,hh);c.fill();
    c.fillStyle='#ff5a2e';rr(c,x-w/2,yy,Math.max(hh,w*Math.max(0,e.hp/e.max)),hh,hh/2);c.fill();
  }
}
function drawBossObj(c,x,y,s,b,t){
  const fr=Math.floor(t*3)&1;
  shadow(c,x,y,1.5*s,.3*s,.35);
  blit(c,bossSprite(b.kind,fr),x,y+Math.sin(t*3)*.03*s,3.1*s,b.flash>0);
}
/* ---------- peluru, partikel, teks ---------- */
function drawBullet(c,b,cam){
  const d=b.z-cam;if(d<-1||d>46)return;
  const p=Proj.p(d),u=Proj.unit*p,x=Proj.x(b.x,d),y=Proj.y(d)-.55*u;
  const len=b.beam?5:1.9,d2=d-len,u2=Proj.unit*Proj.p(d2),x2=Proj.x(b.x-b.vx*.07,d2),y2=Proj.y(d2)-.55*u2;
  const r=Math.max(1.4,(b.big?.2:.12)*u*(b.sz||1));
  let dx=x2-x,dy=y2-y;const L=Math.hypot(dx,dy)||1;dx/=L;dy/=L;const nx=-dy,ny=dx;
  const g=c.createLinearGradient(x,y,x2,y2);g.addColorStop(0,b.col);g.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=g;c.beginPath();c.moveTo(x2,y2);c.quadraticCurveTo(x+nx*r*1.1+dx*r*.2,y+ny*r*1.1+dy*r*.2,x+nx*r,y+ny*r);
  c.arc(x,y,r,Math.atan2(ny,nx),Math.atan2(-ny,-nx),true);c.quadraticCurveTo(x-nx*r*1.1+dx*r*.2,y-ny*r*1.1+dy*r*.2,x2,y2);c.fill();
  c.fillStyle=b.hot||'#fff';c.beginPath();c.arc(x,y,r*.55,0,TAU);c.fill();
  c.fillStyle=rgr(c,x,y,0,x,y,r*2.6,[[0,b.col],[1,'rgba(0,0,0,0)']]);c.globalAlpha=.4;c.beginPath();c.arc(x,y,r*2.6,0,TAU);c.fill();c.globalAlpha=1;
}
function drawParticle(c,q,cam){
  const d=q.z-cam;if(d<-5||d>48)return;
  const pp=Proj.p(d),u=Proj.unit*pp,x=Proj.x(q.x,d),y=Proj.y(d)-q.y*u,a=Math.max(0,Math.min(1,q.life/q.max*1.6));
  c.globalAlpha=a;
  if(q.k==='spark'){c.strokeStyle=q.col;c.lineWidth=Math.max(1.4,q.size*u*.5);c.beginPath();c.moveTo(x,y);c.lineTo(x-q.vx*.05*u,y+q.vy*.05*u);c.stroke();}
  else if(q.k==='puff'){const r=q.size*u*(1+(1-a)*1.8);c.fillStyle=q.col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
  else if(q.k==='ring'){const r=q.size*u*(1+(1-a)*7);c.strokeStyle=q.col;c.lineWidth=Math.max(2,.12*u*a);c.beginPath();c.ellipse(x,y,r,r*.5,0,0,TAU);c.stroke();}
  else if(q.k==='glass'){c.save();c.translate(x,y);c.rotate(q.rot);c.fillStyle=q.col;const r=q.size*u;c.beginPath();c.moveTo(0,-r);c.lineTo(r*.7,r*.6);c.lineTo(-r*.6,r*.5);c.closePath();c.fill();c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=1;c.stroke();c.restore();}
  else if(q.k==='wood'){c.save();c.translate(x,y);c.rotate(q.rot);c.fillStyle=q.col;const r=q.size*u;c.fillRect(-r,-r*.35,r*2,r*.7);c.restore();}
  else{c.fillStyle=q.col;c.beginPath();c.arc(x,y,Math.max(1,q.size*u),0,TAU);c.fill();}
  c.globalAlpha=1;
}
function drawFloatText(c,tx,cam){
  const d=tx.z-cam;if(d<-5||d>48)return;
  const pp=Proj.p(d),u=Proj.unit*pp,x=Proj.x(tx.x,d),y=Proj.y(d)-tx.y*u;
  c.globalAlpha=Math.min(1,tx.life*2.2);
  const k=tx.life>.9?1+(tx.life-.9)*3:1;
  txt(c,tx.s,x,y,.52*u*tx.size*1.5*k,tx.col);c.globalAlpha=1;
}

