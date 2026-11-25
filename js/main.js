/* ================= Start & penyimpanan ================= */
const SAVE_KEY='sosiowar_v2';
function defaultSave(){return{coins:0,unlocked:0,stars:{},heroes:{komandan:1},hero:'komandan',upg:{},q:{},codexEnemy:{},sound:false,music:true,haptic:true,santai:false,openAll:false,diff:'susah',cleared:{},tut:0};}
function loadSave(){
  try{
    let s=JSON.parse(localStorage.getItem(SAVE_KEY));
    if(!s){const old=JSON.parse(localStorage.getItem('sosiowar_v1'));if(old)s=old;}
    const o=Object.assign(defaultSave(),s||{});
    /* sekali saja: awal buka = efek suara MATI, lagu NYALA */
    if(!o.audioV3){o.sound=false;o.music=true;o.audioV3=1;}
    return o;
  }catch(e){return defaultSave();}
}
let SAVE=loadSave();
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE));}catch(e){}}
/* menggambar semua sprite lebih dulu (sedikit demi sedikit) supaya tidak patah saat monster pertama muncul */
function warmSprites(done){
  const jobs=[];
  for(let f=0;f<4;f++)jobs.push(()=>soldierSprite(f,'#4a95ff',''));
  Object.values(ALLIES).forEach(a=>{for(let f=0;f<4;f++)jobs.push(()=>soldierSprite(f,a.helm,a.ex));});
  HEROES.forEach(h=>{for(let f=0;f<4;f++)jobs.push(()=>heroSprite(h,f));});
  Object.keys(ENEMIES).forEach(t=>{for(let f=0;f<4;f++)jobs.push(()=>flashOf(zombieSprite(t,f)));});
  [0,1,2,3].forEach(k=>[0,1].forEach(f=>jobs.push(()=>flashOf(bossSprite(k,f)))));
  jobs.push(()=>barrelSprite(false),()=>barrelSprite(true),()=>crateSprite(),()=>blockSprite());
  for(let i=0;i<WEAPONS.length;i++)jobs.push(()=>bottleSprite(i));
  let i=0;
  (function step(){const t0=performance.now();while(i<jobs.length&&performance.now()-t0<10){try{jobs[i++]();}catch(e){i++;}}
    if(i<jobs.length)setTimeout(step,0);else if(done)done();})();
}
if(document.fonts&&document.fonts.load){document.fonts.load('800 20px "Baloo 2"');document.fonts.load('600 14px "Plus Jakarta Sans"');}
window.addEventListener('load',()=>{
  const game=new Game(document.getElementById('game'),SAVE);
  UI.init(game,SAVE);
  Snd.setMuted(!SAVE.sound);Snd.setMusic(SAVE.music);UI.syncHud();
  window.__game=game;
  warmSprites(()=>{window.__ready=true;});
  if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){navigator.serviceWorker.register('sw.js').catch(()=>{});}
});

document.addEventListener('visibilitychange',()=>{const st=window.__game&&window.__game.state;if(st==='play'||st==='quiz'||st==='menu')Snd.bgmPause(document.hidden);});
