/* ================= Start & penyimpanan ================= */
const SAVE_KEY='sosiowar_v2';
function defaultSave(){return{coins:0,unlocked:0,stars:{},heroes:{komandan:1},hero:'komandan',upg:{},q:{},codexEnemy:{},sound:true,music:true,santai:false,openAll:false,diff:'susah',cleared:{}};}
function loadSave(){
  try{
    let s=JSON.parse(localStorage.getItem(SAVE_KEY));
    if(!s){const old=JSON.parse(localStorage.getItem('sosiowar_v1'));if(old)s=old;}
    return Object.assign(defaultSave(),s||{});
  }catch(e){return defaultSave();}
}
let SAVE=loadSave();
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE));}catch(e){}}
window.addEventListener('load',()=>{
  const game=new Game(document.getElementById('game'),SAVE);
  UI.init(game,SAVE);
  Snd.setMuted(!SAVE.sound);
  window.__game=game;
});
