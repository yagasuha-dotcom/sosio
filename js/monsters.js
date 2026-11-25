/* ================= MONSTER: gaya bestiary fantasi, semua digambar dengan kode =================
   Tiap makhluk punya siluet sendiri: goblin, imp bersayap, orc berhelm, hantu berkerudung,
   minotaur, katak berlendir, imp pembawa bom. Garis tepi hangat gelap + bayangan sel 3 nada. */
const MO='rgba(18,10,30,.9)';
function mg(c,x,y,rx,ry,col){return rgr(c,x-rx*.35,y-ry*.5,1,x,y,Math.max(rx,ry)*1.2,[[0,shade(col,.5)],[.42,col],[1,shade(col,-.55)]]);}
function mb(c,x,y,rx,ry,col,rot,lw){c.save();c.translate(x,y);c.rotate(rot||0);c.fillStyle=mg(c,0,0,rx,ry,col);c.beginPath();c.ellipse(0,0,rx,ry,0,0,TAU);c.fill();c.strokeStyle=MO;c.lineWidth=lw||Math.max(3,Math.min(rx,ry)*.13);c.stroke();c.restore();}
function ml(c,x0,y0,x1,y1,w,col){cap(c,x0,y0,x1,y1,w+6,MO);cap(c,x0,y0,x1,y1,w,col);cap(c,x0-w*.2,y0,x1-w*.2,y1,Math.max(2,w*.22),shade(col,.4));}
function mp(c,pts,col,lw){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=col;c.fill();c.strokeStyle=MO;c.lineWidth=lw||3.5;c.stroke();}
function mq(c,x,y,w,h,col,r){rr(c,x,y,w,h,r||4);c.fillStyle=col;c.fill();c.strokeStyle=MO;c.lineWidth=3;c.stroke();}
function meye(c,x,y,rx,ry,iris,look){ell(c,x,y,rx,ry,'#fffbe8');c.strokeStyle=MO;c.lineWidth=2.6;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.stroke();ell(c,x+(look||0),y+ry*.1,rx*.58,ry*.82,iris);ell(c,x+(look||0),y+ry*.1,rx*.17,ry*.7,'#150a10');circ(c,x+rx*.22,y-ry*.35,rx*.2,'#fff');}
function tooth(c,x,y,w,h,up){c.fillStyle='#f6f0d8';c.beginPath();c.moveTo(x-w/2,y);c.lineTo(x,y+(up?-h:h));c.lineTo(x+w/2,y);c.closePath();c.fill();c.strokeStyle=MO;c.lineWidth=1.8;c.stroke();}
function brow(c,x0,y0,x1,y1,w){cap(c,x0,y0,x1,y1,w||7,MO);}
function horn(c,x,y,tx,ty,w,col){const mx=(x+tx)/2+(tx-x)*.05,my=(y+ty)/2+Math.abs(ty-y)*.15;c.beginPath();c.moveTo(x-w/2,y);c.quadraticCurveTo(mx-w*.3,my,tx,ty);c.quadraticCurveTo(mx+w*.5,my+w*.3,x+w/2,y);c.closePath();c.fillStyle=col;c.fill();c.strokeStyle=MO;c.lineWidth=3;c.stroke();}

/* ----- tiap makhluk digambar menghadap kamera, kaki di (0,0) ----- */
const CREATURE={
 walker(c,fr){ // Goblin pentungan
  const s=Math.sin(fr*1.5708)*7,bob=Math.abs(Math.cos(fr*1.5708))*3,SK='#7cbd50',CL='#a06f3c';
  for(const d of [-1,1]){ml(c,d*16,-58-bob,d*17,-14+d*s,17,SK);mb(c,d*19,-8+d*s*.8,17,9,'#4f8a35');for(const t of [-1,1])tooth(c,d*19+t*7,-3,5,7,false);}
  mb(c,0,-92-bob,41,45,CL);
  for(let i=-4;i<=4;i++)mp(c,[[i*10-6,-52-bob],[i*10,-40-bob],[i*10+6,-52-bob]],shade(CL,-.1),2.5);
  c.strokeStyle='#5a3a1c';c.lineWidth=7;c.beginPath();c.moveTo(-40,-84-bob);c.quadraticCurveTo(0,-72-bob,40,-84-bob);c.stroke();circ(c,0,-76-bob,6,'#caa060');
  ml(c,-36,-104-bob,-58,-76+s,15,SK);mb(c,-61,-72+s,11,10,SK);for(const t of [-1,0,1])tooth(c,-61+t*6,-64+s,4,7,false);
  ml(c,58,-126,76,-184,11,'#8a5a2c');mb(c,78,-190,18,26,'#946134',.25);for(const p of [[70,-196],[86,-188],[80,-176]])circ(c,p[0],p[1],3.5,'#cfd3dc');
  ml(c,36,-104-bob,56,-124,15,SK);mb(c,58,-124,11,10,SK);
  for(const d of [-1,1]){mp(c,[[d*28,-132],[d*94,-182],[d*30,-158]],SK,3.5);mp(c,[[d*38,-140],[d*80,-173],[d*38,-155]],'#e9a0a0',0.1);}
  mb(c,0,-140-bob*.5,38,33,SK);
  c.strokeStyle='#3d2a18';c.lineWidth=4;for(const x of [-10,0,10]){c.beginPath();c.moveTo(x,-170);c.lineTo(x+3,-182);c.stroke();}
  meye(c,-14,-144,10,8,'#f2d230');meye(c,14,-144,10,8,'#f2d230');brow(c,-27,-158,-6,-150,6);brow(c,27,-158,6,-150,6);
  mb(c,0,-132,9,7,shade(SK,-.18));
  mb(c,0,-118,22,9,'#2a0d10',0,3);tooth(c,-8,-122,6,8,false);tooth(c,8,-122,6,8,false);tooth(c,-14,-112,7,13,true);tooth(c,14,-112,7,13,true);ell(c,0,-114,9,4,'#d86a78');
  circ(c,-26,-128,3,shade(SK,-.3));circ(c,24,-124,2.4,shade(SK,-.3));
 },
 runner(c,fr){ // Imp bersayap pembawa megafon
  const f=[0,1,0,-1][fr&3]*20,RD='#e4573a',bob=[0,-4,0,-4][fr&3];
  for(const d of [-1,1]){
    const tipy=-170-f*d*0+f,midy=-118+f*.3;
    c.beginPath();c.moveTo(d*14,-130+bob);c.quadraticCurveTo(d*62,-168+f,d*112,-178+f*1.3);
    for(let i=1;i<=3;i++)c.quadraticCurveTo(d*(112-i*24),-142+f*.5+(i%2)*12,d*(112-i*24-10),-136+f*.4+i*6);
    c.lineTo(d*18,-98+bob);c.closePath();c.fillStyle=lg(c,0,-170,0,-100,[[0,'#b13a5a'],[1,'#6a1f3a']]);c.fill();c.strokeStyle=MO;c.lineWidth=3.5;c.stroke();
    c.strokeStyle='rgba(30,8,20,.6)';c.lineWidth=3;for(const x of [58,80,96]){c.beginPath();c.moveTo(d*16,-124+bob);c.lineTo(d*x,-150+f*.8);c.stroke();}
  }
  c.strokeStyle=MO;c.lineWidth=9;c.beginPath();c.moveTo(18,-80+bob);c.quadraticCurveTo(60,-60,52,-100);c.stroke();c.strokeStyle='#c84a30';c.lineWidth=4;c.stroke();mp(c,[[46,-100+bob],[58,-114+bob],[64,-98+bob]],RD,2.5);
  for(const d of [-1,1]){ml(c,d*10,-82+bob,d*14,-56+bob,10,RD);for(const t of [-1,1])tooth(c,d*14+t*4,-52+bob,3,6,false);}
  mb(c,0,-106+bob,25,29,RD);mb(c,0,-98+bob,15,19,'#f3a073',0,0.1);
  for(const d of [-1,1])mp(c,[[d*20,-148+bob],[d*52,-170+bob],[d*24,-134+bob]],RD,3);
  mb(c,0,-144+bob,29,26,RD);horn(c,-14,-166+bob,-26,-196+bob,10,'#f0e2b8');horn(c,14,-166+bob,26,-196+bob,10,'#f0e2b8');
  meye(c,-12,-146+bob,10,9,'#ffd23a');meye(c,12,-146+bob,10,9,'#ffd23a');brow(c,-24,-160+bob,-5,-152+bob,6);brow(c,24,-160+bob,5,-152+bob,6);
  mb(c,0,-130+bob,17,8,'#2a0d10',0,3);tooth(c,-6,-133+bob,5,8,false);tooth(c,6,-133+bob,5,8,false);
  ml(c,-18,-100+bob,-44,-112+bob,9,RD);ml(c,18,-100+bob,38,-118+bob,9,RD);
  c.save();c.translate(54,-122+bob);c.rotate(-.5);mp(c,[[0,-8],[34,-24],[34,24],[0,8]],'#f2c230',3);ell(c,36,0,6,24,'#c8901a');c.restore();
 },
 helmet(c,fr){ // Orc berhelm dengan perisai
  const s=Math.sin(fr*1.5708)*6,bob=Math.abs(Math.cos(fr*1.5708))*2.5,SK='#5f8f55',IR='#838aa0';
  for(const d of [-1,1]){ml(c,d*20,-70-bob,d*21,-18+d*s,23,IR);mb(c,d*22,-9+d*s*.8,21,11,'#2f323f');}
  mp(c,[[-34,-82-bob],[34,-82-bob],[42,-52-bob],[-42,-52-bob]],'#a8322f',3);
  mb(c,0,-112-bob,46,42,IR);for(const p of [[-22,-120],[0,-132],[22,-120],[-12,-98],[12,-98]])circ(c,p[0],p[1]-bob,3.2,'#d6dae6');
  c.strokeStyle='rgba(20,22,34,.6)';c.lineWidth=3;c.beginPath();c.moveTo(0,-148-bob);c.lineTo(0,-80-bob);c.stroke();
  for(const d of [-1,1]){mb(c,d*52,-140-bob,23,16,'#9aa0b6',d*.3);mp(c,[[d*44,-152-bob],[d*52,-176-bob],[d*60,-152-bob]],'#c9cddc',3);}
  ml(c,58,-130-bob,70,-168,16,SK);mb(c,72,-172,11,10,SK);mp(c,[[62,-172],[92,-236],[104,-224],[84,-168]],'#c3c9d6',3.5);cap(c,66,-172,88,-166,9,'#5a3a1c');
  ml(c,-44,-126-bob,-52,-102,17,SK);
  mb(c,-52,-96,32,32,'#8a5a2c');c.strokeStyle='rgba(30,16,6,.5)';c.lineWidth=2.5;for(const x of [-70,-60,-52,-44,-34]){c.beginPath();c.moveTo(x,-118);c.lineTo(x,-74);c.stroke();}
  c.strokeStyle='#9aa0b6';c.lineWidth=6;c.beginPath();c.arc(-52,-96,31,0,TAU);c.stroke();mb(c,-52,-96,10,10,'#c9cddc');for(const a of [0,1.57,3.14,4.71])mp(c,[[-52+Math.cos(a)*31-4,-96+Math.sin(a)*31],[-52+Math.cos(a)*44,-96+Math.sin(a)*44],[-52+Math.cos(a)*31+4,-96+Math.sin(a)*31]],'#d6dae6',2);
  mb(c,0,-162-bob*.5,35,30,SK);
  mb(c,0,-190-bob*.5,38,26,IR);mq(c,-40,-176-bob*.5,80,10,'#5e6477',4);horn(c,-30,-200,-58,-234,13,'#efe5c4');horn(c,30,-200,58,-234,13,'#efe5c4');mq(c,-5,-176,10,30,'#7a8096',3);
  mp(c,[[-5,-212],[0,-246],[5,-212]],'#c4382f',3);
  meye(c,-14,-160,9,7,'#ff4a3a');meye(c,14,-160,9,7,'#ff4a3a');brow(c,-26,-170,-6,-163,7);brow(c,26,-170,6,-163,7);
  mb(c,0,-140,22,10,'#2a1410',0,3);tooth(c,-15,-146,8,16,true);tooth(c,15,-146,8,16,true);
 },
 ghoul(c,fr){ // Hantu berkerudung melayang
  const sw=Math.sin(fr*1.5708)*10,up=6+Math.cos(fr*1.5708)*4;
  c.save();c.translate(0,-up);
  c.fillStyle=rgr(c,0,-100,10,0,-100,120,[[0,'rgba(170,110,255,.5)'],[1,'rgba(170,110,255,0)']]);c.beginPath();c.arc(0,-100,120,0,TAU);c.fill();
  c.beginPath();c.moveTo(-28,-176);c.quadraticCurveTo(-62,-150,-54,-100);c.lineTo(-62,-34);
  for(let i=0;i<5;i++){c.lineTo(-62+i*25+12,-4+(i%2?18:0)+sw*(i%2?1:-1)*.6);c.lineTo(-62+(i+1)*25,-34-((i%2)?0:6));}
  c.lineTo(54,-100);c.quadraticCurveTo(62,-150,28,-176);c.closePath();
  c.fillStyle=lg(c,0,-190,0,-4,[[0,'#7a55d6'],[.5,'#4a2f94'],[1,'rgba(40,22,90,.25)']]);c.fill();c.strokeStyle=MO;c.lineWidth=3.5;c.stroke();
  c.strokeStyle='rgba(210,180,255,.4)';c.lineWidth=2.5;for(const x of [-22,0,24]){c.beginPath();c.moveTo(x,-120);c.quadraticCurveTo(x+sw*.5,-70,x-4,-26);c.stroke();}
  for(const d of [-1,1]){const hx=d*(66+sw*.3),hy=-92+sw*.6;mp(c,[[d*38,-136],[d*70,-118],[hx,hy],[d*44,-104]],'#3f2a82',3);ml(c,hx,hy,hx+d*8,hy+22,7,'#e6e0f6');for(const t of [-1,0,1])cap(c,hx+d*8+t*6,hy+22,hx+d*8+t*9,hy+40,3.5,'#e6e0f6');}
  mb(c,0,-160,38,38,'#4a2f94');c.beginPath();c.moveTo(-34,-150);c.quadraticCurveTo(0,-214,34,-150);c.fillStyle='#5a3fb4';c.fill();mp(c,[[-38,-150],[0,-222],[38,-150],[0,-196]],'#5a3fb4',3.5);
  ell(c,0,-156,24,22,'#0a0614');
  for(const d of [-1,1]){c.fillStyle=rgr(c,d*11,-160,0,d*11,-160,18,[[0,'rgba(240,190,255,1)'],[1,'rgba(200,100,255,0)']]);c.beginPath();c.arc(d*11,-160,18,0,TAU);c.fill();ell(c,d*11,-160,7,10,'#fbe6ff',d*.5);}
  for(let i=-2;i<=2;i++)circ(c,i*6,-142+Math.abs(i)*2,2.2,'#e8c8ff');
  c.restore();
 },
 brute(c,fr){ // Minotaur perkasa dengan gada berduri
  const s=Math.sin(fr*1.5708)*6,bob=Math.abs(Math.cos(fr*1.5708))*3,FU='#8f5c3a';
  for(const d of [-1,1]){ml(c,d*26,-84-bob,d*28,-20+d*s,32,FU);mp(c,[[d*28-18,-18+d*s],[d*28+18,-18+d*s],[d*28+22,2],[d*28-22,2]],'#2a2128',3);}
  mp(c,[[-52,-96-bob],[52,-96-bob],[60,-62-bob],[-60,-62-bob]],'#a8322f',3.5);mq(c,-52,-104-bob,104,12,'#4a2e1c',4);circ(c,0,-98-bob,8,'#d9b04a');
  mb(c,0,-148-bob,62,58,FU);ell(c,0,-140-bob,36,40,'#b87a52');c.strokeStyle='rgba(60,28,14,.5)';c.lineWidth=3.5;c.beginPath();c.moveTo(0,-176-bob);c.lineTo(0,-110-bob);for(const y of [-150,-130])c.moveTo(-24,y-bob),c.lineTo(24,y-bob);c.stroke();
  cap(c,-58,-190-bob,40,-100-bob,10,'#2a1a10');cap(c,58,-190-bob,-40,-100-bob,10,'#2a1a10');circ(c,0,-146-bob,9,'#d9b04a');
  mb(c,-74,-130-bob,26,24,FU);ml(c,-70,-130-bob,-92,-84+s,28,FU);mb(c,-95,-76+s,19,17,FU);mq(c,-108,-94+s,26,12,'#5a5f70',4);
  ml(c,64,-170-bob,78,-206,26,FU);mb(c,80,-212,18,16,FU);
  ml(c,82,-208,98,-262,10,'#6a4220');mb(c,100,-268,26,36,'#7d5530',.2);for(const p of [[88,-282],[116,-278],[92,-254],[118,-252],[102,-296]])mp(c,[[p[0]-5,p[1]],[p[0],p[1]-14],[p[0]+5,p[1]]],'#d6dae6',2.5);
  for(const d of [-1,1])mb(c,d*45,-206-bob,14,10,'#7a4a2e',d*.5);
  horn(c,-30,-210-bob,-78,-250,18,'#efe6c8');horn(c,30,-210-bob,78,-250,18,'#efe6c8');
  mb(c,0,-206-bob,44,38,FU);mb(c,0,-190-bob,27,21,'#c98a60');ell(c,-9,-188-bob,4,6,'#4a2418');ell(c,9,-188-bob,4,6,'#4a2418');
  c.strokeStyle='#e2b54a';c.lineWidth=5;c.beginPath();c.arc(0,-176-bob,9,.2,Math.PI-.2);c.stroke();
  meye(c,-19,-216-bob,9,8,'#ff3a2a');meye(c,19,-216-bob,9,8,'#ff3a2a');brow(c,-32,-230-bob,-8,-222-bob,9);brow(c,32,-230-bob,8,-222-bob,9);
  tooth(c,-14,-172-bob,7,14,true);tooth(c,14,-172-bob,7,14,true);
 },
 spitter(c,fr){ // Katak berlendir dengan kantung racun
  const pulse=[0,5,9,5][fr&3],hop=[0,-3,-5,-3][fr&3],GR='#a8c24a';
  for(const d of [-1,1]){mb(c,d*52,-34,26,32,GR,d*.4);ml(c,d*58,-18,d*70,-6,13,GR);for(const t of [-1,0,1]){cap(c,d*74+t*8,-6,d*84+t*11,-2,7,MO);cap(c,d*74+t*8,-6,d*84+t*11,-2,3.5,'#d4e07a');}}
  mb(c,0,-66+hop,54,48,GR);ell(c,0,-54+hop,34,32,'#e6ec9a');for(const p of [[-30,-88],[34,-78],[-42,-62],[44,-50],[10,-98],[-12,-76]])circ(c,p[0],p[1]+hop,4.5,'#6f8a2c');
  for(const d of [-1,1])ml(c,d*36,-62+hop,d*44,-26,13,GR);
  mb(c,0,-84+hop,30+pulse,22+pulse,'#ffa13a');c.fillStyle='rgba(255,230,160,.6)';c.beginPath();c.ellipse(-8,-92+hop,10,5,-.4,0,TAU);c.fill();
  mb(c,0,-122+hop,48,30,GR);
  for(const d of [-1,1]){mb(c,d*28,-146+hop,17,17,GR);meye(c,d*28,-147+hop,12,12,'#f2d230');ell(c,d*28,-146+hop,3,9,'#150a10');}
  c.strokeStyle=MO;c.lineWidth=4;c.beginPath();c.moveTo(-38,-116+hop);c.quadraticCurveTo(0,-98+hop+pulse*.4,38,-116+hop);c.stroke();
  mb(c,0,-110+hop,24,10+pulse*.5,'#2a0d10',0,3);ell(c,0,-106+hop,12,5,'#d86a78');
  c.fillStyle='#9ee33a';for(const x of [-14,-4,10]){c.beginPath();c.moveTo(x-3,-102+hop);c.quadraticCurveTo(x,-88+hop+pulse,x+3,-102+hop);c.fill();c.strokeStyle='rgba(30,60,10,.7)';c.lineWidth=1.5;c.stroke();}
  circ(c,-10,-128+hop,3,'#5a7a22');circ(c,10,-128+hop,3,'#5a7a22');
 },
 bomber(c,fr){ // Imp kamikaze membawa bom
  const s=Math.sin(fr*1.5708)*7,bob=Math.abs(Math.cos(fr*1.5708))*3,RD='#dc5230';
  for(const d of [-1,1]){ml(c,d*14,-52-bob,d*15,-12+d*s,16,RD);mb(c,d*17,-7+d*s*.8,15,8,'#8a2e1c');}
  mb(c,0,-90-bob,36,40,RD);mq(c,-26,-110-bob,52,46,'#3a2c28',8);c.strokeStyle='#caa060';c.lineWidth=3;for(const x of [-12,12]){c.beginPath();c.moveTo(x,-108-bob);c.lineTo(x,-66-bob);c.stroke();}circ(c,0,-86-bob,5,'#ffcf3a');
  ml(c,-34,-110-bob,-30,-168,13,RD);ml(c,34,-110-bob,30,-168,13,RD);
  for(const d of [-1,1])mp(c,[[d*26,-134],[d*76,-158],[d*28,-148]],RD,3.5);
  mb(c,0,-138-bob*.5,34,31,RD);
  for(const i of [-2,-1,0,1,2])mp(c,[[i*10-7,-162],[i*11,-196+Math.abs(i)*7],[i*10+7,-162]],i%2?'#ffb02e':'#ff6a2e',3);
  meye(c,-13,-140,10,10,'#fff0a0');meye(c,13,-140,10,10,'#fff0a0');ell(c,-13,-140,2.5,8,'#a01010');ell(c,13,-140,2.5,8,'#a01010');brow(c,-26,-156,-5,-148,7);brow(c,26,-156,5,-148,7);
  mb(c,0,-124,24,13,'#2a0d10',0,3);for(let i=-3;i<=3;i++)tooth(c,i*6,-132,5,9,false);ell(c,0,-118,10,4,'#d86a78');
  circ(c,-24,-128,3,'#40281c');circ(c,22,-148,2.6,'#40281c');
  mb(c,0,-206,27,27,'#25262e');ell(c,-9,-216,9,6,'rgba(255,255,255,.5)',-.5);c.fillStyle='#e8e6da';c.beginPath();c.arc(0,-204,8,0,TAU);c.fill();ell(c,-3,-205,2,2.4,'#25262e');ell(c,3,-205,2,2.4,'#25262e');
  mq(c,-7,-236,14,10,'#8a8a96',2);c.strokeStyle=MO;c.lineWidth=7;c.beginPath();c.moveTo(0,-236);c.quadraticCurveTo(14,-252,4,-262);c.stroke();c.strokeStyle='#caa060';c.lineWidth=3.5;c.stroke();
  const k=fr&1?1:.7;c.fillStyle=rgr(c,4,-264,0,4,-264,26*k,[[0,'#fff'],[.3,'#ffe25a'],[1,'rgba(255,120,20,0)']]);c.beginPath();c.arc(4,-264,26*k,0,TAU);c.fill();
 }
};
const CFIG={walker:182,runner:204,helmet:250,ghoul:232,brute:300,spitter:158,bomber:272};
function zombieSprite(type,fr){
  return spr('mon|'+type+'|'+fr,300,330,150,316,CFIG[type],c=>{CREATURE[type](c,fr);});
}

/* ================= BOS ================= */
function bossSprite(kind,fr){
  const B=BOSSES[kind];
  return spr('boss|'+kind+'|'+fr,520,500,260,478,400,c=>{
    const sw=fr?7:-7;
    if(kind===0){ // Badak batu
      for(const d of [-1,1]){ml(c,d*72,-110,d*80,-30,52,shade(B.body,-.15));mp(c,[[d*80-34,-24],[d*80+34,-24],[d*80+40,-2],[d*80-40,-2]],'#2d2838',4);}
      mb(c,0,-190,148,110,B.body);for(let i=-3;i<=3;i++)mp(c,[[i*36-16,-262+Math.abs(i)*9],[i*36,-312+Math.abs(i)*14],[i*36+16,-262+Math.abs(i)*9]],'#d6c9a8',4);
      mb(c,0,-170,92,70,B.belly);c.strokeStyle='rgba(40,30,70,.35)';c.lineWidth=4;for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*22,-230);c.quadraticCurveTo(i*26,-180,i*20,-130);c.stroke();}
      ml(c,-126,-210,-170,-120+sw,54,B.body);ml(c,126,-210,170,-120-sw,54,B.body);mb(c,-176,-110+sw,36,32,shade(B.body,-.1));mb(c,176,-110-sw,36,32,shade(B.body,-.1));
      for(const d of [-1,1])for(const t of [-1,0,1])mp(c,[[d*176+t*16-8,-86+d*0],[d*176+t*16,-60],[d*176+t*16+8,-86]],'#f0e6c8',3);
      mb(c,0,-286,96,78,B.body);for(const d of [-1,1])mb(c,d*70,-330,20,28,shade(B.body,-.1),d*.4);
      mp(c,[[-14,-300],[14,-300],[26,-380],[0,-420],[-26,-380]],'#d6c9a8',5);horn(c,-52,-290,-104,-376,30,'#efe3c0');horn(c,52,-290,104,-376,30,'#efe3c0');
      mb(c,0,-254,62,44,shade(B.body,.15));for(const d of [-1,1])ell(c,d*22,-262,7,9,'#2a2238');
      for(const d of [-1,1]){meye(c,d*44,-304,17,14,B.eye);brow(c,d*68,-326,d*22,-312,11);}
      c.strokeStyle=MO;c.lineWidth=5;c.beginPath();c.moveTo(-52,-232);c.quadraticCurveTo(0,-214,52,-232);c.stroke();for(const d of [-1,1])tooth(c,d*34,-232,14,30,true);
      for(const p of [[-90,-250],[100,-240],[-120,-180],[130,-160]])circ(c,p[0],p[1],6,shade(B.body,-.3));
    }else if(kind===1){ // Golem berhalo
      for(const d of [-1,1]){mb(c,d*96,-330,70,16,'rgba(255,200,80,.0)');c.strokeStyle=B.accent;c.lineWidth=9;c.shadowColor=B.accent;c.shadowBlur=18;c.beginPath();c.ellipse(d*96,-352+d*0,60,16,d*.15,0,TAU);c.stroke();c.shadowBlur=0;c.strokeStyle='rgba(255,240,180,.7)';c.lineWidth=3;c.stroke();}
      for(const d of [-1,1]){mq(c,d*64-42,-124,84,112,shade(B.body,-.2),16);mq(c,d*64-50,-26,100,28,'#5a4c3e',8);}
      mq(c,-120,-300,240,190,B.body,40);mq(c,-92,-272,184,140,B.belly,30);
      c.strokeStyle=B.accent;c.lineWidth=8;c.shadowColor=B.accent;c.shadowBlur=20;c.beginPath();c.moveTo(-52,-286);c.lineTo(-18,-230);c.lineTo(-54,-188);c.lineTo(-20,-146);c.moveTo(56,-296);c.lineTo(24,-240);c.lineTo(70,-196);c.moveTo(0,-250);c.lineTo(8,-200);c.stroke();c.shadowBlur=0;
      for(const d of [-1,1]){mq(c,d*132-34,-326,68,62,shade(B.body,.1),24);ml(c,d*136,-280,d*180,-170+d*sw*-1,64,B.body);mq(c,d*190-52,-170+d*sw*-1,104,92,shade(B.body,-.05),26);for(const t of [-1,0,1])mq(c,d*190+t*30-12,-100+d*sw*-1,24,38,'#7a6a54',9);}
      mq(c,-64,-390,128,100,B.body,32);mq(c,-48,-366,96,40,'#1a1420',12);
      c.fillStyle=B.eye;c.shadowColor=B.eye;c.shadowBlur=22;rr(c,-38,-356,28,16,5);c.fill();rr(c,10,-356,28,16,5);c.fill();c.shadowBlur=0;
      for(const p of [[-56,-380],[56,-380],[-100,-220],[100,-220]])circ(c,p[0],p[1],6,shade(B.body,-.3));
    }else if(kind===2){ // Raja iblis biru
      for(const d of [-1,1]){c.beginPath();c.moveTo(d*50,-280);c.quadraticCurveTo(d*190,-450,d*250,-300);for(let i=1;i<=3;i++)c.quadraticCurveTo(d*(250-i*52),-250+(i%2)*26,d*(250-i*60-16),-230+i*20);c.lineTo(d*64,-190);c.closePath();c.fillStyle=lg(c,0,-420,0,-200,[[0,'#3a2a8a'],[1,'#17114a']]);c.fill();c.strokeStyle=MO;c.lineWidth=5;c.stroke();c.strokeStyle='rgba(120,100,230,.5)';c.lineWidth=4;for(const x of [110,160,205]){c.beginPath();c.moveTo(d*56,-270);c.lineTo(d*x,-360+Math.abs(x-160)*.3);c.stroke();}}
      for(const d of [-1,1]){ml(c,d*40,-100,d*46,-26,46,'#4a3aa0');mp(c,[[d*46-30,-20],[d*46+30,-20],[d*46+36,0],[d*46-36,0]],'#1c1630',4);}
      mp(c,[[-80,-270],[80,-270],[110,-60],[-110,-60]],'#7a1c3a',5);mb(c,0,-190,96,100,'#4a3aa0');mb(c,0,-176,56,64,'#7e6fd6');
      for(const i of [-1,0,1])circ(c,i*26,-210+Math.abs(i)*6,9,'#ffd24a');
      ml(c,-90,-250,-150,-170+sw,42,'#4a3aa0');ml(c,90,-250,150,-190-sw,42,'#4a3aa0');mb(c,-156,-160+sw,26,24,'#4a3aa0');mb(c,156,-180-sw,26,24,'#4a3aa0');
      c.save();c.translate(160,-196-sw);c.rotate(-.5);mp(c,[[0,-14],[66,-44],[66,44],[0,14]],'#f2c230',4);ell(c,68,0,10,44,'#b8851a');c.restore();
      mb(c,0,-300,70,64,'#4a3aa0');horn(c,-44,-330,-98,-410,26,'#f0e2b8');horn(c,44,-330,98,-410,26,'#f0e2b8');
      for(const d of [-1,1])mp(c,[[d*62,-306],[d*124,-330],[d*66,-284]],'#4a3aa0',4);
      for(const x of [-36,-18,0,18,36])mp(c,[[x-10,-356],[x,-420+Math.abs(x)*.5],[x+10,-356]],x%36?'#ff9a2e':'#ffd24a',4);
      for(const d of [-1,1]){meye(c,d*28,-306,16,13,B.eye);brow(c,d*50,-326,d*14,-314,10);}
      mb(c,0,-268,36,16,'#14081c',0,4);for(let i=-3;i<=3;i++)tooth(c,i*10,-276,8,14,false);
      for(const p of [[-210,-150],[220,-300],[-190,-330]]){c.save();c.translate(p[0],p[1]);c.rotate(p[0]*.004);mq(c,-24,-30,48,60,'#f0ecda',4);c.fillStyle='#2a2a3a';for(let i=0;i<4;i++)c.fillRect(-16,-22+i*11,32,4);c.restore();}
    }else{ // Naga hijau
      for(const d of [-1,1]){c.beginPath();c.moveTo(d*60,-250);c.quadraticCurveTo(d*200,-440,d*258,-290);c.lineTo(d*226,-290);c.lineTo(d*246,-220);c.lineTo(d*196,-240);c.lineTo(d*208,-170);c.lineTo(d*130,-190);c.lineTo(d*70,-160);c.closePath();c.fillStyle=lg(c,d*60,-400,d*240,-180,[[0,'#7fc15a'],[1,'#2f6a3a']]);c.fill();c.strokeStyle=MO;c.lineWidth=5;c.stroke();c.strokeStyle='rgba(20,50,25,.6)';c.lineWidth=4;for(const x of [120,170,214]){c.beginPath();c.moveTo(d*66,-248);c.lineTo(d*x,-300+Math.abs(x-170)*.4);c.stroke();}}
      for(const d of [-1,1]){ml(c,d*58,-96,d*62,-24,48,'#4f9a48');for(const t of [-1,0,1])mp(c,[[d*62+t*20-9,-24],[d*62+t*20,2],[d*62+t*20+9,-24]],'#f0e6c8',3);}
      c.beginPath();c.moveTo(0,-60);c.quadraticCurveTo(210,-30,230,-100);c.quadraticCurveTo(250,-140,214,-130);c.strokeStyle=MO;c.lineWidth=30;c.stroke();c.strokeStyle='#4f9a48';c.lineWidth=22;c.stroke();mp(c,[[206,-146],[250,-140],[222,-100]],'#f0e6c8',4);
      mb(c,0,-170,104,104,'#4f9a48');mb(c,0,-160,68,84,'#e6d49a');c.strokeStyle='rgba(120,90,40,.5)';c.lineWidth=4;for(let i=0;i<5;i++){c.beginPath();c.moveTo(-60,-220+i*28);c.quadraticCurveTo(0,-210+i*28,60,-220+i*28);c.stroke();}
      for(let i=-2;i<=2;i++)mp(c,[[i*30-12,-262+Math.abs(i)*6],[i*30,-296+Math.abs(i)*8],[i*30+12,-262+Math.abs(i)*6]],'#f0e6c8',3.5);
      ml(c,-84,-210,-128,-130+sw,40,'#4f9a48');ml(c,84,-210,128,-130-sw,40,'#4f9a48');for(const d of [-1,1])for(const t of [-1,0,1])mp(c,[[d*134+t*14-7,-106+d*0],[d*134+t*14,-80],[d*134+t*14+7,-106]],'#f0e6c8',3);
      ml(c,0,-250,0,-286,56,'#4f9a48');mb(c,0,-326,84,70,'#4f9a48');for(const d of [-1,1]){horn(c,d*50,-364,d*110,-440,26,'#f0e6c8');horn(c,d*60,-336,d*128,-380,20,'#d8c898');mp(c,[[d*74,-330],[d*136,-340],[d*84,-306]],'#4f9a48',4);}
      mb(c,0,-300,56,36,'#6bb860');for(const d of [-1,1])ell(c,d*18,-306,6,8,'#1c3a20');
      mb(c,0,-286,40,24,'#2a0a06',0,4);c.fillStyle=rgr(c,0,-284,0,0,-284,42,[[0,'#fff6a0'],[.5,'#ff9a2e'],[1,'rgba(255,60,20,0)']]);c.beginPath();c.arc(0,-284,42,0,TAU);c.fill();for(let i=-2;i<=2;i++)tooth(c,i*14,-300,9,18,false);
      for(const d of [-1,1]){meye(c,d*38,-344,16,12,B.eye);brow(c,d*60,-362,d*16,-352,10);}
    }
  });
}
