/* ================= Start & penyimpanan ================= */
const SAVE_KEY='sosiowar_v1';
function defaultSave(){return{coins:0,unlocked:0,stars:{},heroes:{komandan:1},hero:'komandan',upg:{},q:{},codexEnemy:{},sound:true,santai:false,openAll:false};}
function loadSave(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));return Object.assign(defaultSave(),s||{});}catch(e){return defaultSave();}}
let SAVE=loadSave();
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE));}catch(e){}}
window.addEventListener('load',()=>{
  const game=new Game(document.getElementById('game'),SAVE);
  UI.init(game,SAVE);
  sfx.setMuted(!SAVE.sound);
  window.__game=game;
});
