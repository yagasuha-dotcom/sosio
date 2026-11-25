/* ================= RENDER: semua gambar digambar prosedural di canvas (tanpa file gambar) ================= */
const TAU=Math.PI*2;
const Proj={
  W:360,H:640,top:0,base:0,unit:50,k:0.03,pf:0.44,
  set(W,H){this.W=W;this.H=H;this.top=H*0.045;this.base=H*0.80;this.unit=W/6.9;this.pf=1/(1+42*this.k);},
  p(d){return 1/(1+d*this.k);},
  y(d){const q=(this.p(d)-this.pf)/(1-this.pf);return this.top+(this.base-this.top)*q;},
  x(x,d){return this.W/2+x*this.unit*this.p(d);}
};
function txt(c,s,x,y,size,fill){
  c.font='900 '+size+'px "Arial Black","Trebuchet MS",system-ui,sans-serif';
  c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
  c.lineWidth=Math.max(2,size*0.2);c.strokeStyle='#101a36';c.strokeText(s,x,y);
  c.fillStyle=fill||'#fff';c.fillText(s,x,y);
}
function rr(c,x,y,w,h,r){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}
function circ(c,x,y,r,fill){c.fillStyle=fill;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
function shadow(c,s,w){c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.ellipse(0,0.05*s,(w||0.42)*s,0.15*s,0,0,TAU);c.fill();}

/* ---------- latar: air, jembatan, pembatas tengah, marka ---------- */
function drawBG(c,cam){
  const {W,H}=Proj;
  let g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#08163a');g.addColorStop(1,'#12306b');
  c.fillStyle=g;c.fillRect(0,0,W,H);
  c.strokeStyle='rgba(130,180,255,.10)';c.lineWidth=2;
  for(let i=0;i<16;i++){
    const yy=(i*H/16+cam*22)%H, xx=((i*137)%W);
    c.beginPath();c.moveTo(xx-26,yy);c.quadraticCurveTo(xx,yy-6,xx+26,yy);c.stroke();
  }
  const dN=-8,dF=48,EH=3.35;
  const X=Proj.x.bind(Proj),Y=Proj.y.bind(Proj);
  // dinding/rel tepi
  c.fillStyle='#2c3b63';
  c.beginPath();c.moveTo(X(-EH-.35,dN),Y(dN));c.lineTo(X(-EH-.35,dF),Y(dF));c.lineTo(X(-EH,dF),Y(dF));c.lineTo(X(-EH,dN),Y(dN));c.fill();
  c.beginPath();c.moveTo(X(EH+.35,dN),Y(dN));c.lineTo(X(EH+.35,dF),Y(dF));c.lineTo(X(EH,dF),Y(dF));c.lineTo(X(EH,dN),Y(dN));c.fill();
  // aspal
  g=c.createLinearGradient(0,Y(dF),0,Y(dN));g.addColorStop(0,'#8e90a6');g.addColorStop(1,'#cfd0dc');
  c.fillStyle=g;c.beginPath();c.moveTo(X(-EH,dN),Y(dN));c.lineTo(X(-EH,dF),Y(dF));c.lineTo(X(EH,dF),Y(dF));c.lineTo(X(EH,dN),Y(dN));c.fill();
  // pembatas tengah
  c.fillStyle='#4a5878';
  c.beginPath();c.moveTo(X(-.32,dN),Y(dN));c.lineTo(X(-.32,dF),Y(dF));c.lineTo(X(.32,dF),Y(dF));c.lineTo(X(.32,dN),Y(dN));c.fill();
  c.fillStyle='#2a3350';
  c.beginPath();c.moveTo(X(-.14,dN),Y(dN));c.lineTo(X(-.14,dF),Y(dF));c.lineTo(X(.14,dF),Y(dF));c.lineTo(X(.14,dN),Y(dN));c.fill();
  // marka lajur putus-putus
  c.fillStyle='rgba(255,255,255,.85)';
  const z0=Math.floor((cam+dN)/4)*4;
  for(let z=z0;z<cam+dF;z+=4){
    const d1=z-cam,d2=z+1.7-cam;
    for(const lx of [-1.8,1.8]){
      c.beginPath();c.moveTo(X(lx-.07,d1),Y(d1));c.lineTo(X(lx+.07,d1),Y(d1));c.lineTo(X(lx+.07,d2),Y(d2));c.lineTo(X(lx-.07,d2),Y(d2));c.fill();
    }
  }
  // tiang pagar
  const z1=Math.floor((cam+dN)/3)*3;
  for(let z=z1;z<cam+dF;z+=3){
    const d=z-cam,p=Proj.p(d),h=0.55*Proj.unit*p,w=0.14*Proj.unit*p;
    c.fillStyle='#3f4f7a';
    for(const sx of [-EH-.15,EH+.15]){c.fillRect(X(sx,d)-w/2,Y(d)-h,w,h);}
    c.fillStyle='#7f93c9';
    for(const sx of [-EH-.15,EH+.15]){c.fillRect(X(sx,d)-w/2,Y(d)-h,w,h*.18);}
  }
}

/* ---------- sprite: prajurit helm biru ---------- */
function drawSoldier(c,x,y,s,t,ph,o){
  o=o||{};const helm=o.helm||'#2f6fe8',sw=Math.sin(t*10+ph)*0.1*s;
  c.save();c.translate(x,y);shadow(c,s);
  c.fillStyle='#2a3f86';rr(c,-0.22*s,-0.5*s+sw,0.17*s,0.5*s,0.05*s);c.fill();rr(c,0.05*s,-0.5*s-sw,0.17*s,0.5*s,0.05*s);c.fill();
  c.fillStyle='#eef2fb';rr(c,-0.3*s,-1.02*s,0.6*s,0.58*s,0.14*s);c.fill();
  c.fillStyle='#3b78f0';c.fillRect(-0.3*s,-0.62*s,0.6*s,0.1*s);
  c.strokeStyle='#20232b';c.lineWidth=(o.ex==='big'?0.18:0.1)*s;c.lineCap='round';
  c.beginPath();c.moveTo(0.26*s,-0.7*s);c.lineTo(0.26*s,-(o.ex==='big'?1.6:1.45)*s);c.stroke();
  if(o.ex==='scope'){c.lineWidth=0.06*s;c.beginPath();c.moveTo(0.26*s,-1.2*s);c.lineTo(0.26*s,-1.9*s);c.stroke();}
  circ(c,0,-1.22*s,0.3*s,'#f6d2b4');
  c.fillStyle=helm;c.beginPath();c.arc(0,-1.3*s,0.37*s,Math.PI,0);c.fill();
  c.beginPath();c.ellipse(0,-1.3*s,0.4*s,0.1*s,0,0,TAU);c.fill();
  c.fillStyle='rgba(255,255,255,.45)';c.beginPath();c.ellipse(-0.14*s,-1.5*s,0.1*s,0.05*s,-0.5,0,TAU);c.fill();
  if(o.ex==='cross'){c.fillStyle='#e23b3b';c.fillRect(-0.04*s,-1.62*s,0.08*s,0.2*s);c.fillRect(-0.1*s,-1.56*s,0.2*s,0.08*s);}
  if(o.ex==='cam'){c.fillStyle='#222';c.fillRect(-0.12*s,-1.7*s,0.24*s,0.14*s);circ(c,0,-1.63*s,0.045*s,'#9fd8ff');}
  if(o.ex==='wrench'){c.strokeStyle='#cfd6e8';c.lineWidth=0.07*s;c.beginPath();c.moveTo(-0.3*s,-0.8*s);c.lineTo(-0.5*s,-1.15*s);c.stroke();}
  c.restore();
}
function drawDrone(c,x,y,s,t){
  c.save();c.translate(x,y-1.6*s+Math.sin(t*5)*0.08*s);
  c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.ellipse(0,1.65*s,0.35*s,0.12*s,0,0,TAU);c.fill();
  circ(c,0,0,0.3*s,'#aab0c8');circ(c,0,0,0.14*s,'#4a5070');circ(c,0.12*s,-0.05*s,0.05*s,'#6fffd0');
  c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=0.06*s;
  const a=t*40;for(const sx of [-1,1]){c.beginPath();c.moveTo(sx*0.4*s-Math.cos(a)*0.28*s,-0.22*s);c.lineTo(sx*0.4*s+Math.cos(a)*0.28*s,-0.22*s);c.stroke();}
  c.restore();
}
/* ---------- sprite: komandan di motor ---------- */
function drawHero(c,x,y,s,h,t){
  c.save();c.translate(x,y);shadow(c,s,0.6);
  circ(c,0,-0.18*s,0.3*s,'#1b1f2a');circ(c,0,-0.18*s,0.14*s,'#8b92a8');
  c.fillStyle='#6b7a45';rr(c,-0.28*s,-0.78*s,0.56*s,0.55*s,0.14*s);c.fill();
  c.fillStyle='#4a5530';c.fillRect(-0.28*s,-0.5*s,0.56*s,0.07*s);
  c.fillStyle=h.jacket;rr(c,-0.34*s,-1.4*s,0.68*s,0.7*s,0.16*s);c.fill();
  c.fillStyle='rgba(255,255,255,.25)';c.fillRect(-0.06*s,-1.38*s,0.12*s,0.66*s);
  c.strokeStyle=h.jacket;c.lineWidth=0.14*s;c.lineCap='round';
  c.beginPath();c.moveTo(-0.34*s,-1.25*s);c.lineTo(-0.5*s,-0.85*s);c.moveTo(0.34*s,-1.25*s);c.lineTo(0.5*s,-0.85*s);c.stroke();
  circ(c,0,-1.62*s,0.3*s,h.hair);
  c.fillStyle=h.hair;rr(c,-0.36*s,-1.65*s,0.72*s,0.65*s,0.3*s);c.fill();
  circ(c,0,-1.62*s,0.24*s,'#f6d2b4');
  c.fillStyle=h.hair;c.beginPath();c.arc(0,-1.66*s,0.27*s,Math.PI,0);c.fill();
  c.fillStyle=h.beret;c.beginPath();c.ellipse(0.04*s,-1.88*s,0.3*s,0.13*s,-0.2,0,TAU);c.fill();
  circ(c,0.12*s,-0.6*s,0.0,'#fff');
  c.restore();
}
/* ---------- sprite: musuh ---------- */
function drawZombie(c,x,y,s,e,t){
  const T=ENEMIES[e.type];s*=T.size;const f=e.flash>0;
  c.save();c.translate(x,y);shadow(c,s,0.45);
  const sw=Math.sin(t*9+e.ph)*0.12*s;c.translate(0,Math.sin(t*9+e.ph)*0.04*s);
  const K=(col)=>f?'#ffffff':col;
  c.fillStyle=K('#4b3a38');rr(c,-0.24*s,-0.5*s+sw,0.19*s,0.5*s,0.05*s);c.fill();rr(c,0.05*s,-0.5*s-sw,0.19*s,0.5*s,0.05*s);c.fill();
  c.fillStyle=K(T.shirt);rr(c,-0.34*s,-1.05*s,0.68*s,0.62*s,0.12*s);c.fill();
  c.fillStyle='rgba(0,0,0,.18)';c.fillRect(-0.2*s,-0.7*s,0.14*s,0.07*s);c.fillRect(0.06*s,-0.55*s,0.16*s,0.06*s);
  c.strokeStyle=K(T.skin);c.lineWidth=0.14*s;c.lineCap='round';
  c.beginPath();c.moveTo(-0.34*s,-0.95*s);c.lineTo(-0.52*s,-0.62*s+sw);c.moveTo(0.34*s,-0.95*s);c.lineTo(0.52*s,-0.62*s-sw);c.stroke();
  if(T.hat==='bomb'){c.fillStyle=K('#c0392b');c.fillRect(-0.34*s,-0.82*s,0.68*s,0.2*s);c.fillStyle=K('#f2d24a');for(let i=-1;i<=1;i++)c.fillRect(i*0.16*s-0.04*s,-0.86*s,0.08*s,0.28*s);}
  circ(c,0,-1.27*s,0.33*s,K(T.skin));
  if(T.hat==='spit'||T.ranged){circ(c,-0.3*s,-1.2*s,0.12*s,K('#dfe96a'));circ(c,0.3*s,-1.2*s,0.12*s,K('#dfe96a'));}
  if(!f){
    circ(c,-0.12*s,-1.3*s,0.1*s,'#fff');circ(c,0.12*s,-1.3*s,0.1*s,'#fff');
    circ(c,-0.12*s,-1.29*s,0.045*s,'#a51d1d');circ(c,0.12*s,-1.29*s,0.045*s,'#a51d1d');
    c.fillStyle='#3a1f1f';rr(c,-0.12*s,-1.13*s,0.24*s,0.08*s,0.03*s);c.fill();
  }
  if(T.hat==='helmet'){c.fillStyle=K('#7d8576');c.beginPath();c.arc(0,-1.35*s,0.38*s,Math.PI,0);c.fill();c.fillRect(-0.4*s,-1.37*s,0.8*s,0.07*s);}
  if(T.hat==='hair'){c.fillStyle=K('#e38a2b');for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*0.1*s-0.06*s,-1.5*s);c.lineTo(i*0.1*s,-1.78*s);c.lineTo(i*0.1*s+0.06*s,-1.5*s);c.fill();}}
  if(T.hat==='hood'){c.fillStyle=K('#4a3d73');c.beginPath();c.arc(0,-1.3*s,0.4*s,Math.PI*1.05,Math.PI*1.95);c.fill();}
  if(T.hat==='bandana'){c.fillStyle=K('#d63c3c');c.fillRect(-0.34*s,-1.46*s,0.68*s,0.1*s);}
  if(e.max>0&&e.hp<e.max&&T.size>=1.4){c.fillStyle='#1b1f33';c.fillRect(-0.5*s,-2.05*s,1.0*s,0.12*s);c.fillStyle='#ff7a2e';c.fillRect(-0.5*s,-2.05*s,Math.max(0,e.hp/e.max)*1.0*s,0.12*s);}
  c.restore();
}
function drawBoss(c,x,y,s,b,t){
  const B=BOSSES[b.kind],f=b.flash>0;const K=(col)=>f?'#fff':col;
  c.save();c.translate(x,y);shadow(c,s,1.3);c.translate(0,Math.sin(t*3)*0.05*s);
  const bs=2.4*s;
  c.fillStyle=K(B.body);c.beginPath();c.ellipse(0,-0.85*bs/2.4*1.2,1.15*s,1.0*s,0,0,TAU);c.fill();
  c.fillStyle=K(B.belly);c.beginPath();c.ellipse(0,-0.7*s,0.7*s,0.62*s,0,0,TAU);c.fill();
  c.strokeStyle=K(B.body);c.lineWidth=0.5*s;c.lineCap='round';
  c.beginPath();c.moveTo(-0.95*s,-1.2*s);c.lineTo(-1.3*s,-0.45*s+Math.sin(t*4)*0.1*s);c.moveTo(0.95*s,-1.2*s);c.lineTo(1.3*s,-0.45*s-Math.sin(t*4)*0.1*s);c.stroke();
  circ(c,-0.55*s,-2.28*s,0.28*s,K(B.body));circ(c,0.55*s,-2.28*s,0.28*s,K(B.body));circ(c,-0.55*s,-2.28*s,0.14*s,K(B.belly));circ(c,0.55*s,-2.28*s,0.14*s,K(B.belly));
  circ(c,0,-1.85*s,0.78*s,K(B.body));circ(c,0,-1.62*s,0.38*s,K(B.belly));circ(c,0,-1.7*s,0.12*s,K('#222'));
  if(!f){circ(c,-0.28*s,-2.0*s,0.13*s,B.eye);circ(c,0.28*s,-2.0*s,0.13*s,B.eye);circ(c,-0.28*s,-2.0*s,0.06*s,'#200');circ(c,0.28*s,-2.0*s,0.06*s,'#200');}
  c.fillStyle=K(B.accent);
  for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*0.22*s-0.1*s,-1.2*s);c.lineTo(i*0.22*s,-1.45*s);c.lineTo(i*0.22*s+0.1*s,-1.2*s);c.fill();}
  c.restore();
}
/* ---------- benda di jalan ---------- */
function drawGun(c,x,y,w,tier,rot){
  const W=WEAPONS[tier],g=W.gun;
  c.save();c.translate(x,y);c.rotate(rot||-0.12);
  if(g.glow){c.shadowColor=W.col;c.shadowBlur=w*0.3;}
  c.fillStyle='#262b3b';rr(c,-0.5*w,-0.12*w,w,0.24*w,0.05*w);c.fill();
  c.fillStyle='#161a26';rr(c,0.45*w,-0.06*w,g.len*0.45*w,0.12*w,0.03*w);c.fill();
  if(g.barrels){for(let i=-1;i<=1;i++){c.fillRect(0.45*w,i*0.07*w-0.025*w,g.len*0.5*w,0.05*w);}}
  if(g.stock){c.fillStyle='#3a2f2a';rr(c,-0.5*w-g.stock*0.5*w,-0.1*w,g.stock*0.5*w+0.05*w,0.2*w,0.04*w);c.fill();}
  c.fillStyle=W.col;rr(c,-0.1*w,0.1*w,0.18*w,g.mag*w,0.03*w);c.fill();
  c.fillRect(-0.5*w,-0.14*w,w,0.05*w);
  c.restore();
}
function drawBubbleNum(c,x,y,s,num,col){txt(c,String(Math.max(0,Math.ceil(num))),x,y,s,col);}

function drawGate(c,o,cam){
  const d=o.z-cam,p=Proj.p(d),u=Proj.unit*p;
  const pos=o.op==='x'||o.val>=0;
  const xl=Proj.x(o.x-o.w/2,d),xr=Proj.x(o.x+o.w/2,d),yb=Proj.y(d),h=1.45*u;
  // pijakan di jalan
  c.fillStyle=pos?'rgba(70,140,255,.28)':'rgba(255,70,70,.28)';
  c.fillRect(xl,yb-0.12*u,xr-xl,0.5*u);
  const g=c.createLinearGradient(0,yb-h,0,yb);
  if(pos){g.addColorStop(0,'#74b8ff');g.addColorStop(1,'#2a63e0');}else{g.addColorStop(0,'#ff8a7a');g.addColorStop(1,'#e03434');}
  c.fillStyle=g;rr(c,xl,yb-h,xr-xl,h,0.1*u);c.fill();
  c.lineWidth=Math.max(2,0.08*u);c.strokeStyle=pos?'#173a99':'#8e1b1b';c.stroke();
  c.fillStyle='rgba(255,255,255,.3)';c.fillRect(xl+0.1*u,yb-h+0.1*u,(xr-xl)-0.2*u,0.12*u);
  const val=o.op==='x'?('x'+o.val):((o.val>=0?'+':'')+o.val);
  txt(c,val,(xl+xr)/2,yb-h*0.38,0.78*u,'#fff');
  txt(c,o.lab,(xl+xr)/2,yb-h*0.82,0.34*u,pos?'#d8ecff':'#ffe0dc');
}
function drawBarrel(c,o,cam,t){
  const d=o.z-cam,p=Proj.p(d),u=Proj.unit*p,x=Proj.x(o.x,d),y=Proj.y(d),f=o.flash>0;
  c.save();c.translate(x,y);shadow(c,u,0.7);
  const w=1.15*u,h=0.95*u;
  c.fillStyle=f?'#fff':'#d97a26';rr(c,-w/2,-h,w,h,0.2*u);c.fill();
  c.fillStyle=f?'#fff':'#a85414';c.fillRect(-w/2,-h*0.7,w,0.09*u);c.fillRect(-w/2,-h*0.25,w,0.09*u);
  c.fillStyle=f?'#fff':'#f0a24a';c.beginPath();c.ellipse(0,-h,w/2,0.2*u,0,0,TAU);c.fill();
  c.strokeStyle='#101a36';c.lineWidth=Math.max(1.5,0.06*u);c.stroke();
  const n=o.give>=6?3:2;
  for(let i=0;i<n;i++)drawSoldier(c,(i-(n-1)/2)*0.42*u,-h*1.0,u*0.6,t,i*2);
  drawBubbleNum(c,0,-h*0.45,0.5*u,o.hp);
  c.restore();
}
function drawCap(c,o,cam,t,tier){
  const d=o.z-cam,p=Proj.p(d),u=Proj.unit*p,x=Proj.x(o.x,d),y=Proj.y(d),f=o.flash>0;
  c.save();c.translate(x,y);shadow(c,u,0.9);
  const g=c.createLinearGradient(-u,-1.6*u,u,0);g.addColorStop(0,'rgba(190,225,255,.9)');g.addColorStop(1,'rgba(60,120,240,.85)');
  c.fillStyle=f?'#fff':g;c.beginPath();c.ellipse(0,-0.8*u,1.05*u,0.85*u,0,0,TAU);c.fill();
  c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=Math.max(1.5,0.06*u);c.stroke();
  c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.ellipse(-0.4*u,-1.3*u,0.28*u,0.12*u,-0.6,0,TAU);c.fill();
  drawGun(c,0,-0.8*u+Math.sin(t*3)*0.04*u,1.0*u,tier);
  // tanda materi
  txt(c,'📘',0.75*u,-1.55*u,0.45*u);
  drawBubbleNum(c,0.1*u,0.35*u,0.8*u,o.hp);
  c.restore();
}
function drawCage(c,o,cam,t){
  const d=o.z-cam,p=Proj.p(d),u=Proj.unit*p,x=Proj.x(o.x,d),y=Proj.y(d),A=ALLIES[o.ally],f=o.flash>0;
  c.save();c.translate(x,y);shadow(c,u,0.8);
  c.fillStyle='rgba(255,230,140,.2)';rr(c,-0.8*u,-1.9*u,1.6*u,1.9*u,0.1*u);c.fill();
  if(o.ally==='drone')drawDrone(c,0,0,u*0.75,t);else drawSoldier(c,0,-0.05*u,u*0.75,t,o.id,{helm:A.helm,ex:A.ex});
  c.strokeStyle=f?'#fff':'#e8c24a';c.lineWidth=Math.max(2,0.07*u);
  for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*0.25*u,0);c.lineTo(i*0.25*u,-1.9*u);c.stroke();}
  c.strokeRect(-0.8*u,-1.9*u,1.6*u,1.9*u);
  txt(c,'ALIANSI',0,-2.15*u,0.32*u,'#ffe36b');
  drawBubbleNum(c,0,0.4*u,0.7*u,o.hp);
  c.restore();
}
function drawCrate(c,o,cam,t){
  const d=o.z-cam,p=Proj.p(d),u=Proj.unit*p,x=Proj.x(o.x,d),y=Proj.y(d)-Math.abs(Math.sin(t*3+o.id))*0.2*u;
  c.save();c.translate(x,y);shadow(c,u,0.5);
  const g=c.createLinearGradient(0,-1.1*u,0,0);g.addColorStop(0,'#ffe27a');g.addColorStop(1,'#ff9f2a');
  c.fillStyle=g;rr(c,-0.5*u,-1.0*u,1.0*u,1.0*u,0.16*u);c.fill();c.strokeStyle='#101a36';c.lineWidth=Math.max(2,0.07*u);c.stroke();
  txt(c,UTILS[o.u].ico,0,-0.52*u,0.62*u);
  c.restore();
}
function drawPickup(c,o,cam,t,tier){
  const d=o.z-cam,p=Proj.p(d),u=Proj.unit*p,x=Proj.x(o.x,d),y=Proj.y(d)-0.6*u;
  c.save();c.translate(x,y);
  c.shadowColor='#6fd0ff';c.shadowBlur=u*0.8;
  drawGun(c,0,Math.sin(t*6)*0.1*u,1.3*u,tier,0.2*Math.sin(t*4));
  c.restore();
}

/* ---------- peluru, partikel, teks melayang ---------- */
function drawBullet(c,b,cam){
  const d=b.z-cam;if(d<-1||d>46)return;
  const p=Proj.p(d),x=Proj.x(b.x,d),y=Proj.y(d)-0.5*Proj.unit*p;
  const d2=d-1.3,x2=Proj.x(b.x-b.vx*0.05,d2),y2=Proj.y(d2)-0.5*Proj.unit*Proj.p(d2);
  c.lineCap='round';c.strokeStyle=b.col;c.globalAlpha=.55;c.lineWidth=0.26*Proj.unit*p*(b.big?1.8:1);
  c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();
  c.globalAlpha=1;c.strokeStyle='#fff';c.lineWidth=0.09*Proj.unit*p*(b.big?1.8:1);
  c.beginPath();c.moveTo(x,y);c.lineTo((x+x2)/2,(y+y2)/2);c.stroke();
}
function drawEBullet(c,b,cam){
  const d=b.z-cam;if(d<-1||d>46)return;
  const p=Proj.p(d),x=Proj.x(b.x,d),y=Proj.y(d)-0.5*Proj.unit*p;
  circ(c,x,y,0.28*Proj.unit*p,'#b8e63a');circ(c,x,y,0.15*Proj.unit*p,'#effca0');
}

/* ---------- HUD di atas canvas ---------- */
function drawHud(c,g){
  const {W,H}=Proj;
  // progres level
  const bw=W*0.5,bx=(W-bw)/2,by=14;
  c.fillStyle='rgba(8,16,40,.75)';rr(c,bx-3,by-3,bw+6,16,8);c.fill();
  const pr=Math.max(0,Math.min(1,g.cam/Math.max(1,g.bossZ)));
  c.fillStyle='#3ddc84';rr(c,bx,by,bw*pr,10,5);c.fill();
  txt(c,(g.si+1)+'. '+g.st.nama,W/2,by+30,12);
  // koin
  txt(c,'🪙 '+g.coins,38,by+4,14);
  // senjata
  const w=WEAPONS[g.wi];
  c.fillStyle='rgba(8,16,40,.75)';rr(c,8,H-52,W*0.52,40,12);c.fill();
  drawGun(c,36,H-33,30,g.wi,0);
  txt(c,w.nama,24+W*0.27,H-38,12);
  c.fillStyle='#0a1330';rr(c,64,H-27,W*0.52-70,6,3);c.fill();
  c.fillStyle='#ffd24a';rr(c,64,H-27,(W*0.52-70)*(g.wi/(WEAPONS.length-1)),6,3);c.fill();
  // buff
  let bxx=W-14;
  const items=[];
  if(g.shield>0)items.push(['🛡️',g.shield]);
  if(g.buffs.haste>0)items.push(['⚡',Math.ceil(g.buffs.haste)]);
  if(g.buffs.quad>0)items.push(['🔥',Math.ceil(g.buffs.quad)]);
  if(g.buffs.freeze>0)items.push(['❄️',Math.ceil(g.buffs.freeze)]);
  for(const it of items){c.fillStyle='rgba(8,16,40,.75)';rr(c,bxx-52,H-52,52,40,12);c.fill();txt(c,it[0],bxx-34,H-32,18);txt(c,String(it[1]),bxx-12,H-32,14);bxx-=58;}
  // aliansi
  g.allies.forEach((a,i)=>{c.fillStyle='rgba(8,16,40,.7)';c.beginPath();c.arc(22+i*34,by+52,15,0,TAU);c.fill();txt(c,a.type==='drone'?'🤖':a.type==='medic'?'⚕️':a.type==='sniper'?'🎯':a.type==='heavy'?'💪':a.type==='engineer'?'🔧':'📰',22+i*34,by+52,16);});
  // bos
  if(g.boss&&g.boss.on&&g.boss.hp>0){
    c.fillStyle='rgba(8,16,40,.8)';rr(c,W*0.15,by+60,W*0.7,18,9);c.fill();
    c.fillStyle='#ff4a4a';rr(c,W*0.15+3,by+63,(W*0.7-6)*Math.max(0,g.boss.hp/g.boss.max),12,6);c.fill();
    txt(c,BOSSES[g.boss.kind].nama,W/2,by+92,12);
  }
}
