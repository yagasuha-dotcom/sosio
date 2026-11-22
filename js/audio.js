/* Efek suara sederhana (WebAudio), tanpa file audio */
let _ac=null,_muted=false,_lastShoot=0;
function _ctx(){if(!_ac){try{_ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}return _ac;}
function _tone(f,d,type,vol,slide){const a=_ctx();if(!a||_muted)return;try{const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+d);g.gain.setValueAtTime(vol||0.04,t);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d);}catch(e){}}
const sfx={
  unlock(){const a=_ctx();if(a&&a.state==='suspended')a.resume();},
  setMuted(m){_muted=m;},
  shoot(){const n=Date.now();if(n-_lastShoot<70)return;_lastShoot=n;_tone(520,0.05,'square',0.008,-220);},
  hit(){_tone(190,0.05,'sawtooth',0.012,-80);},
  kill(){_tone(320,0.1,'triangle',0.03,-200);},
  gate(){_tone(440,0.16,'sine',0.05,320);},
  bad(){_tone(220,0.2,'sawtooth',0.04,-120);},
  pick(){_tone(700,0.12,'sine',0.05,420);},
  hurt(){_tone(130,0.16,'square',0.05,-70);},
  boom(){_tone(110,0.4,'sawtooth',0.07,-80);},
  correct(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>_tone(f,0.18,'triangle',0.06),i*90));},
  wrong(){_tone(210,0.35,'sawtooth',0.05,-120);},
  win(){[392,523,659,784,1047].forEach((f,i)=>setTimeout(()=>_tone(f,0.22,'triangle',0.06),i*110));},
  lose(){[330,262,196].forEach((f,i)=>setTimeout(()=>_tone(f,0.3,'sawtooth',0.05),i*200));}
};
