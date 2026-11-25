/* ================= TEKS, LENCANA, HUD, BANNER (kanvas) ================= */
/* pilih font kanvas: Baloo 2 bila sudah termuat, kalau belum (atau offline) pakai Erica One yang tertanam.
   Memberi nama font yang tidak ada ke kanvas itu mahal, jadi hasilnya disimpan dan dicek ulang tiap 2 detik. */
let _fc={t:-9999,d:'"Erica One",Impact,sans-serif',dw:'',u:'Outfit,system-ui,sans-serif',uw:'700 '};
function fontPick(){
  const now=performance.now();if(now-_fc.t<2000)return _fc;_fc.t=now;
  try{
    const ok=(fam)=>{for(const f of document.fonts){if(f.family.replace(/["']/g,'')===fam&&f.status==='loaded')return true;}return false;};
    const b=ok('Baloo 2'),j=ok('Plus Jakarta Sans');
    _fc.d=b?FONT:'"Erica One",Impact,sans-serif';_fc.dw=b?'800 ':'';
    _fc.u=j?'"Plus Jakarta Sans",Outfit,system-ui,sans-serif':'Outfit,system-ui,sans-serif';_fc.uw=j?'800 ':'700 ';
  }catch(e){}
  return _fc;
}
/* teks game: huruf tebal Erica One, tepi gelap, blok 3D di bawah, isi bergradasi, sedikit miring */
function txt(c,s,x,y,size,fill,line,noSkew){
  c.save();
  const fp=fontPick();c.font=fp.dw+size+'px '+fp.d;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.miterLimit=2;
  if(!noSkew){c.translate(x,y);c.transform(1,0,-0.1,1,0,0);c.translate(-x,-y);}
  const col=fill||'#ffffff',lw=size<22?Math.max(2.2,size*.15):Math.max(3,size*.25),dep=size*(size<22?.07:.09);
  c.lineWidth=lw;c.strokeStyle=line||'#091233';
  c.strokeText(s,x,y+dep*1.4);c.fillStyle=line||'#091233';c.fillText(s,x,y+dep*1.4);
  c.strokeText(s,x,y);
  c.fillStyle=shade(col,-.5);c.fillText(s,x,y+dep);
  const g=c.createLinearGradient(0,y-size*.5,0,y+size*.5);g.addColorStop(0,shade(col,.6));g.addColorStop(.55,col);g.addColorStop(1,shade(col,-.06));
  c.fillStyle=g;c.fillText(s,x,y);
  c.restore();
}
/* label kecil (Outfit tebal) untuk HUD */
function lbl(c,s,x,y,size,col,align){
  c.save();const fp=fontPick();c.font=fp.uw+size+'px '+fp.u;c.textAlign=align||'center';c.textBaseline='middle';
  c.fillStyle='rgba(4,8,28,.7)';c.fillText(s,x,y+1.5);c.fillStyle=col||'#fff';c.fillText(s,x,y);c.restore();
}
/* lencana jumlah pasukan: segi enam berbingkai emas dengan kaca biru */
function hexPath(c,x,y,R){c.beginPath();for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3;i?c.lineTo(x+Math.cos(a)*R,y+Math.sin(a)*R):c.moveTo(x+Math.cos(a)*R,y+Math.sin(a)*R);}c.closePath();}
function drawBadge(c,x,y,R,n,pulse,kind){
  const k=1+Math.max(0,pulse)*0.32;R*=k;
  c.save();
  c.fillStyle='rgba(2,6,22,.38)';c.beginPath();c.ellipse(x,y+R*1.02,R*.9,R*.24,0,0,TAU);c.fill();
  if(pulse>0.05){c.globalCompositeOperation='lighter';c.fillStyle=rgr(c,x,y,R*.6,x,y,R*1.8,[[0,kind<0?'rgba(255,70,60,.55)':'rgba(90,200,255,.55)'],[1,'rgba(0,0,0,0)']]);c.beginPath();c.arc(x,y,R*1.8,0,TAU);c.fill();c.globalCompositeOperation='source-over';}
  // bingkai emas
  hexPath(c,x,y,R);c.fillStyle=lg(c,x-R,y-R,x+R,y+R,[[0,'#fff0a8'],[.35,'#f4b92e'],[.7,'#c07a10'],[1,'#ffe07a']]);c.fill();c.lineJoin='round';c.lineWidth=Math.max(2,R*.08);c.strokeStyle='#4a2a05';c.stroke();
  // kaca biru
  hexPath(c,x,y,R*.8);c.fillStyle=rgr(c,x-R*.25,y-R*.35,R*.05,x,y,R*.9,[[0,'#8fd0ff'],[.4,'#2f78ff'],[1,'#0f2a86']]);c.fill();c.lineWidth=Math.max(1.5,R*.05);c.strokeStyle='rgba(8,20,70,.9)';c.stroke();
  c.save();hexPath(c,x,y,R*.8);c.clip();c.fillStyle='rgba(255,255,255,.28)';c.beginPath();c.ellipse(x-R*.1,y-R*.55,R*.75,R*.34,-.25,0,TAU);c.fill();c.restore();
  // sudut bersinar
  for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3;circ(c,x+Math.cos(a)*R*.93,y+Math.sin(a)*R*.93,R*.05,'#fff7c8');}
  // pangkat di bawah
  c.strokeStyle='#ffe07a';c.lineWidth=Math.max(2,R*.07);c.lineCap='round';for(const dy of [0,R*.11]){c.beginPath();c.moveTo(x-R*.17,y+R*.5+dy);c.lineTo(x,y+R*.6+dy);c.lineTo(x+R*.17,y+R*.5+dy);c.stroke();}
  const s=String(n),sz=R*(s.length<=2?1.0:s.length===3?.8:.62);
  txt(c,s,x,y-R*.1,sz,kind<0&&pulse>.3?'#ffd0c8':'#ffffff');
  c.restore();
}
/* peluru musuh: gumpalan lendir (biasa) atau bola energi (bos) */
function drawEBullet(c,b,cam,t){
  const d=b.z-cam;if(d<-1||d>46)return;
  const p=Proj.p(d),u=Proj.unit*p,x=Proj.x(b.x,d),y=Proj.y(d)-.5*u,r=Math.max(3,.2*u*(b.big?1.5:1));
  if(b.big){
    c.fillStyle=rgr(c,x,y,0,x,y,r*3,[[0,'rgba(255,90,160,.55)'],[1,'rgba(255,90,160,0)']]);c.beginPath();c.arc(x,y,r*3,0,TAU);c.fill();
    c.fillStyle=rgr(c,x-r*.3,y-r*.3,r*.1,x,y,r*1.2,[[0,'#fff'],[.35,'#ff7ac0'],[1,'#7a1a8a']]);c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
    c.strokeStyle='rgba(255,220,250,.8)';c.lineWidth=Math.max(1.5,r*.18);c.beginPath();c.ellipse(x,y,r*1.4,r*.55,(t||0)*6,0,TAU);c.stroke();return;
  }
  for(let i=1;i<=3;i++){c.fillStyle='rgba(120,190,40,'+(0.5-i*.12)+')';c.beginPath();c.arc(x+Math.sin(i*2.1+x)*r*.4,y-r*(1+i*.8),r*(.7-i*.12),0,TAU);c.fill();}
  c.fillStyle=rgr(c,x,y,0,x,y,r*2.4,[[0,'rgba(190,255,70,.4)'],[1,'rgba(190,255,70,0)']]);c.beginPath();c.arc(x,y,r*2.4,0,TAU);c.fill();
  c.beginPath();c.moveTo(x,y-r*1.7);c.bezierCurveTo(x+r*1.3,y-r*.5,x+r*1.1,y+r,x,y+r);c.bezierCurveTo(x-r*1.1,y+r,x-r*1.3,y-r*.5,x,y-r*1.7);
  c.fillStyle=rgr(c,x-r*.3,y-r*.2,r*.1,x,y,r*1.3,[[0,'#eaff8a'],[.5,'#86c81e'],[1,'#3b7a12']]);c.fill();c.strokeStyle='rgba(12,40,6,.85)';c.lineWidth=Math.max(1.5,r*.2);c.stroke();
  circ(c,x-r*.35,y-r*.1,r*.25,'rgba(255,255,255,.75)');
}
/* ---------- HUD ---------- */
function glass(c,x,y,w,h,r,a){
  c.fillStyle=lg(c,0,y,0,y+h,[[0,'rgba(22,40,92,'+(a||.78)+')'],[1,'rgba(6,14,40,'+(a||.78)+')']]);rr(c,x,y,w,h,r);c.fill();
  c.strokeStyle='rgba(150,195,255,.32)';c.lineWidth=1.5;c.stroke();
  c.strokeStyle='rgba(255,255,255,.12)';c.beginPath();c.moveTo(x+r*.6,y+1.5);c.lineTo(x+w-r*.6,y+1.5);c.stroke();
}
function drawTarget(c,x,y,s){c.strokeStyle='#ff6b6b';c.lineWidth=s*.12;c.beginPath();c.arc(x,y,s*.38,0,TAU);c.moveTo(x-s*.5,y);c.lineTo(x+s*.5,y);c.moveTo(x,y-s*.5);c.lineTo(x,y+s*.5);c.stroke();}
const ALLY_ICON={medic:'heart',sniper:'target',heavy:'bolt',drone:'burst',engineer:'shield',jurnalis:'book'};
function drawSkull(c,x,y,s){c.fillStyle='#f4efe0';c.beginPath();c.arc(x,y-s*.08,s*.4,0,TAU);c.fill();rr(c,x-s*.24,y+s*.12,s*.48,s*.3,s*.1);c.fill();c.fillStyle='#2a0c10';c.beginPath();c.arc(x-s*.16,y-s*.06,s*.11,0,TAU);c.arc(x+s*.16,y-s*.06,s*.11,0,TAU);c.fill();c.fillRect(x-s*.04,y+s*.08,s*.08,s*.1);}
function drawHud(c,g){
  const {W,H}=Proj,top=10+(g.safeTop||0),t=g.t;
  // koin
  const cs=Math.round(g.coinShow||0);
  glass(c,10,top,86,32,16);c.save();c.translate(28,top+16);c.scale(Math.abs(Math.cos((g.coinSpin||0)*8))*.5+.5,1);drawIcon(c,'coin',0,0,22);c.restore();lbl(c,String(cs),63,top+17,17,'#ffe27a');
  // progres level
  const bw=W*.38,bx=W/2-bw/2+10,by=top+6,pr=clamp(g.cam/Math.max(1,g.bossZ),0,1);
  glass(c,bx-10,by-6,bw+22,24,12,.8);
  c.fillStyle='rgba(2,8,26,.85)';rr(c,bx,by+1,bw,10,5);c.fill();
  const gr=lg(c,bx,0,bx+bw,0,[[0,'#4de39a'],[.7,'#c8ff6a'],[1,'#ffe55a']]);c.fillStyle=gr;rr(c,bx,by+1,Math.max(10,bw*pr),10,5);c.fill();
  c.fillStyle='rgba(255,255,255,.4)';rr(c,bx+2,by+2,Math.max(6,bw*pr-4),3,2);c.fill();
  c.fillStyle='rgba(255,255,255,.25)';for(let i=1;i<4;i++)c.fillRect(bx+bw*i/4-1,by+1,2,10);
  circ(c,bx+Math.max(5,bw*pr),by+6,6,'#fff');circ(c,bx+Math.max(5,bw*pr),by+6,3.6,'#2f78ff');
  circ(c,bx+bw+4,by+6,10,'#3a0c14');c.strokeStyle='#ff5a4a';c.lineWidth=2;c.beginPath();c.arc(bx+bw+4,by+6,10,0,TAU);c.stroke();drawSkull(c,bx+bw+4,by+6,13);
  txt(c,'LEVEL '+(g.si+1),W/2+10,by+30,13,'#ffffff',null,true);
  // sekutu
  g.allies.forEach((a,i)=>{const ax=26+i*34,ay=top+58,col=ALLIES[a.type].helm;circ(c,ax,ay,15,'rgba(7,15,42,.85)');c.strokeStyle=col;c.lineWidth=2.6;c.beginPath();c.arc(ax,ay,15,0,TAU);c.stroke();if(a.type==='sniper')drawTarget(c,ax,ay,18);else drawIcon(c,ALLY_ICON[a.type],ax,ay,16);});
  // bos
  if(g.boss&&g.boss.on&&!g.boss.dead){
    const bw2=W*.74,x0=(W-bw2)/2,y0=top+84,fr=clamp(g.boss.hp/g.boss.max,0,1);
    glass(c,x0-6,y0-6,bw2+12,30,15,.86);c.fillStyle='rgba(2,8,26,.9)';rr(c,x0+28,y0+2,bw2-34,16,8);c.fill();
    c.fillStyle=lg(c,x0,0,x0+bw2,0,[[0,'#ff9a3a'],[1,'#ff3b3b']]);rr(c,x0+28,y0+2,Math.max(12,(bw2-34)*fr),16,8);c.fill();
    c.fillStyle='rgba(255,255,255,.3)';rr(c,x0+30,y0+3,Math.max(6,(bw2-38)*fr),4,2);c.fill();
    c.fillStyle='rgba(255,255,255,.25)';for(let i=1;i<10;i++)c.fillRect(x0+28+(bw2-34)*i/10-.5,y0+2,1,16);
    circ(c,x0+12,y0+10,13,'#3a0c14');c.strokeStyle='#ff5a4a';c.lineWidth=2;c.beginPath();c.arc(x0+12,y0+10,13,0,TAU);c.stroke();drawSkull(c,x0+12,y0+10,15);
    txt(c,BOSSES[g.boss.kind].nama.toUpperCase(),W/2,y0+40,12,'#ffd9d2',null,true);
  }
  // senjata
  const w=WEAPONS[g.wi],pw=Math.min(W*.6,236),py=H-66;
  glass(c,8,py,pw,56,16,.82);
  c.save();c.translate(48,py+27);gunArt(c,g.wi,56);c.restore();
  lbl(c,w.nama,86,py+18,13,'#fff','left');
  for(let i=0;i<WEAPONS.length;i++){const px=88+i*((pw-104)/(WEAPONS.length-1));const on=i<=g.wi;c.fillStyle=on?w.col:'rgba(120,150,210,.28)';rr(c,px-8,py+34,16,7,3.5);c.fill();if(on){c.fillStyle='rgba(255,255,255,.5)';rr(c,px-6,py+35,12,2,1);c.fill();}}
  // buff
  let bxx=W-10;const items=[];
  if(g.shield>0)items.push(['shield',g.shield,0]);
  if(g.buffs.haste>0)items.push(['bolt',Math.ceil(g.buffs.haste),g.buffs.haste/8]);
  if(g.buffs.quad>0)items.push(['flame',Math.ceil(g.buffs.quad),g.buffs.quad/8]);
  if(g.buffs.freeze>0)items.push(['snow',Math.ceil(g.buffs.freeze),g.buffs.freeze/7]);
  for(const it of items){bxx-=54;glass(c,bxx,py,50,56,16,.82);drawIcon(c,it[0],bxx+25,py+22,26);lbl(c,String(it[1]),bxx+25,py+43,14,'#fff');if(it[2]>0){c.fillStyle='rgba(255,255,255,.65)';rr(c,bxx+7,py+50,36*it[2],3,1.5);c.fill();}bxx-=4;}
  // kombo
  if(g.combo>=5&&g.comboT>0){const a=Math.min(1,g.comboT*2);c.globalAlpha=a;txt(c,'KOMBO x'+g.combo,W/2,H*.3,20+Math.min(10,g.combo*.3),'#ffcf3a');c.globalAlpha=1;}
  // banner
  if(g.banner&&g.banner.t>0){
    const b=g.banner,k=Math.min(1,(b.max-b.t)*5,b.t*3),yy=H*.36;
    c.save();c.globalAlpha=k;
    c.fillStyle=b.col||'rgba(8,20,60,.82)';c.beginPath();c.moveTo(0,yy-34);c.lineTo(W,yy-34);c.lineTo(W,yy+34);c.lineTo(0,yy+34);c.closePath();c.fill();
    c.fillStyle='rgba(255,255,255,.18)';c.fillRect(0,yy-34,W,2);c.fillRect(0,yy+32,W,2);
    c.translate((1-k)*-60,0);
    txt(c,b.title,W/2,yy-6,b.size||30,b.tc||'#ffffff');
    if(b.sub)lbl(c,b.sub,W/2,yy+22,13,'#d8e6ff');
    c.restore();
  }
  // peringatan pasukan menipis
  if(g.n<=4&&g.state==='play'){c.fillStyle='rgba(255,30,30,'+(0.08+0.07*Math.sin(t*10))+')';c.fillRect(0,0,W,H);}
}
