/* ================= SUARA =================
   Semua disintesis dengan WebAudio (tanpa file), tapi dilapis seperti desain suara sungguhan:
   benturan (noise) + badan (nada rendah) + ekor gema. Tiap senjata dan tiap musuh punya suara sendiri. */
const Snd=(()=>{
  let ac=null,master,sfxBus,musBus,verbIn,nbuf,muted=false,musicOn=true,active=0,duck=1;
  const R=Math.random,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),last={};
  const jit=(v,p)=>v*(1+(R()*2-1)*p);

  function init(){
    if(ac){if(ac.state==='suspended')ac.resume();return;}
    try{ac=new(window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
    const comp=ac.createDynamicsCompressor();
    comp.threshold.value=-16;comp.knee.value=20;comp.ratio.value=6;comp.attack.value=0.003;comp.release.value=0.2;
    master=ac.createGain();master.gain.value=muted?0:0.9;
    sfxBus=ac.createGain();sfxBus.gain.value=1;
    musBus=ac.createGain();musBus.gain.value=musicOn?0.34:0;
    sfxBus.connect(master);musBus.connect(master);master.connect(comp);comp.connect(ac.destination);
    // gema ruang (impuls dibuat dari noise yang meluruh)
    const len=Math.floor(ac.sampleRate*1.3),imp=ac.createBuffer(2,len,ac.sampleRate);
    for(let ch=0;ch<2;ch++){const d=imp.getChannelData(ch);for(let i=0;i<len;i++){const t=i/len;d[i]=(R()*2-1)*Math.pow(1-t,3.2)*(t<0.01?t*100:1);}}
    const cv=ac.createConvolver();cv.buffer=imp;
    verbIn=ac.createGain();verbIn.gain.value=1;
    const vo=ac.createGain();vo.gain.value=0.55;
    verbIn.connect(cv);cv.connect(vo);vo.connect(master);
    nbuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);
    const nd=nbuf.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=R()*2-1;
    if(ac.state==='suspended')ac.resume();
    if(musicOn)Music.start();
  }
  const ok=(name,gap)=>{const n=performance.now();if(last[name]&&n-last[name]<gap)return false;last[name]=n;return true;};
  function dest(pan){
    if(!pan||!ac.createStereoPanner)return sfxBus;
    const p=ac.createStereoPanner();p.pan.value=clamp(pan,-1,1);p.connect(sfxBus);return p;
  }
  function wire(g,o,t0,d){
    const out=dest(o.pan);g.connect(out);
    if(o.send){const s=ac.createGain();s.gain.value=o.send;g.connect(s);s.connect(verbIn);}
    active++;return (src)=>{src.onended=()=>{active--;};};
  }
  /* nada: osilator + filter + amplop */
  function tone(o){
    if(!ac||muted||active>60)return;
    const t0=ac.currentTime+(o.t||0)+0.001,d=o.d||0.1;
    const osc=ac.createOscillator();osc.type=o.type||'sine';osc.frequency.setValueAtTime(Math.max(20,o.f),t0);
    if(o.f2)osc.frequency.exponentialRampToValueAtTime(Math.max(20,o.f2),t0+d);
    if(o.det)osc.detune.value=o.det;
    if(o.vib){const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=o.vib[0];lg.gain.value=o.vib[1];l.connect(lg);lg.connect(osc.frequency);l.start(t0);l.stop(t0+d+0.05);}
    const g=ac.createGain();g.gain.setValueAtTime(0.0001,t0);
    g.gain.linearRampToValueAtTime(o.v||0.2,t0+(o.a||0.004));
    g.gain.exponentialRampToValueAtTime(0.0001,t0+d);
    let n=osc;
    if(o.lp){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(o.lp,t0);if(o.lp2)f.frequency.exponentialRampToValueAtTime(Math.max(40,o.lp2),t0+d);f.Q.value=o.q||0.8;n.connect(f);n=f;}
    n.connect(g);const done=wire(g,o,t0,d);done(osc);osc.start(t0);osc.stop(t0+d+0.05);
  }
  /* noise: benturan, desis, retakan */
  function noise(o){
    if(!ac||muted||active>60)return;
    const t0=ac.currentTime+(o.t||0)+0.001,d=o.d||0.1;
    const s=ac.createBufferSource();s.buffer=nbuf;
    const off=R()*(nbuf.duration-d-0.1);
    const f=ac.createBiquadFilter();f.type=o.type||'bandpass';f.frequency.setValueAtTime(o.f||1500,t0);
    if(o.f2)f.frequency.exponentialRampToValueAtTime(Math.max(40,o.f2),t0+d);f.Q.value=o.q||0.9;
    const g=ac.createGain();g.gain.setValueAtTime(0.0001,t0);
    g.gain.linearRampToValueAtTime(o.v||0.2,t0+(o.a||0.002));
    g.gain.exponentialRampToValueAtTime(0.0001,t0+d);
    s.connect(f);f.connect(g);const done=wire(g,o,t0,d);done(s);s.start(t0,off,d+0.05);s.stop(t0+d+0.05);
  }
  /* suara "vokal": dua osilator gergaji melewati dua formant. Dipakai untuk erangan zombie dan teriakan prajurit */
  function voice(o){
    if(!ac||muted||active>56)return;
    const t0=ac.currentTime+(o.t||0)+0.001,d=o.d||0.3;
    const mix=ac.createGain();mix.gain.setValueAtTime(0.0001,t0);
    mix.gain.linearRampToValueAtTime(o.v||0.2,t0+(o.a||0.015));mix.gain.exponentialRampToValueAtTime(0.0001,t0+d);
    const oscs=[];
    for(const det of [-9,9]){
      const os=ac.createOscillator();os.type=o.type||'sawtooth';os.detune.value=det;
      os.frequency.setValueAtTime(o.f0,t0);os.frequency.exponentialRampToValueAtTime(Math.max(30,o.f0*(o.glide||0.55)),t0+d);
      if(o.vib){const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=o.vib[0];lg.gain.value=o.vib[1];l.connect(lg);lg.connect(os.frequency);l.start(t0);l.stop(t0+d+0.05);}
      oscs.push(os);
    }
    const forms=o.form||[[700,450],[1250,800]];
    for(const fm of forms){
      const bp=ac.createBiquadFilter();bp.type='bandpass';bp.Q.value=o.q||4.5;
      bp.frequency.setValueAtTime(fm[0],t0);bp.frequency.exponentialRampToValueAtTime(Math.max(80,fm[1]),t0+d);
      const fg=ac.createGain();fg.gain.value=1/forms.length*1.8;
      for(const os of oscs)os.connect(bp);bp.connect(fg);fg.connect(mix);
    }
    const done=wire(mix,o,t0,d);done(oscs[0]);
    for(const os of oscs){os.start(t0);os.stop(t0+d+0.05);}
  }

  /* ------------ SENJATA: tiap jenis beda karakter ------------ */
  function shoot(wid){
    if(!ac||muted)return;
    const r=jit(1,0.08);
    if(wid==='pistol'){
      if(!ok('gun',48))return;
      noise({d:.07,v:.34,type:'highpass',f:2400*r,q:.7,send:.06});
      tone({f:230*r,f2:78,d:.09,v:.34,type:'triangle',lp:900});
      tone({f:2100*r,f2:700,d:.025,v:.07,type:'square'});
    }else if(wid==='smg'){
      if(!ok('gun',42))return;
      noise({d:.055,v:.3,f:3300*r,q:.9,send:.05});
      tone({f:270*r,f2:95,d:.06,v:.26,type:'triangle',lp:1200});
    }else if(wid==='ak'){
      if(!ok('gun',55))return;
      noise({d:.13,v:.46,type:'lowpass',f:7000*r,f2:800,q:.6,send:.14});
      noise({d:.03,v:.28,type:'highpass',f:3000});
      tone({f:165*r,f2:52,d:.13,v:.46,type:'sawtooth',lp:700,lp2:200});
    }else if(wid==='shotgun'){
      if(!ok('gun',120))return;
      noise({d:.3,v:.72,type:'lowpass',f:4200,f2:260,q:.5,send:.3});
      tone({f:118*r,f2:36,d:.32,v:.7,type:'sine'});
      noise({t:.2,d:.03,v:.16,f:2200,q:2});
      tone({t:.2,f:320,f2:180,d:.04,v:.1,type:'square',lp:900});
    }else if(wid==='minigun'){
      if(!ok('gun',50))return;
      noise({d:.04,v:.22,f:2400*r,q:.8});
      tone({f:150*r,f2:68,d:.045,v:.2,type:'sawtooth',lp:600});
    }else if(wid==='plasma'){
      if(!ok('gun',70))return;
      tone({f:1150*r,f2:170,d:.2,v:.2,type:'sawtooth',lp:5200,lp2:380,q:7,send:.25});
      tone({f:520*r,f2:1500,d:.14,v:.13,type:'sine',send:.25});
      noise({d:.08,v:.08,type:'highpass',f:5000});
    }else if(wid==='rail'){
      if(!ok('gun',120))return;
      tone({f:96,f2:28,d:.55,v:.7,type:'sine',send:.2});
      noise({d:.3,v:.42,type:'highpass',f:1400,f2:5200,send:.3});
      tone({f:2600,f2:180,d:.38,v:.18,type:'sawtooth',lp:7000,lp2:500,q:5,send:.3});
      tone({f:60,f2:38,d:.4,v:.3,type:'square',lp:260});
    }
  }
  /* ------------ benturan peluru ------------ */
  function hit(kind){
    if(!ac||muted||!ok('hit'+kind,38))return;
    if(kind==='metal'){noise({d:.05,v:.1,f:2800,q:3});tone({f:1250*jit(1,.1),f2:900,d:.08,v:.06,type:'triangle'});}
    else if(kind==='glass'){noise({d:.04,v:.12,type:'highpass',f:5000});tone({f:3000*jit(1,.2),d:.05,v:.05});}
    else if(kind==='wood'){noise({d:.05,v:.15,f:900,q:1.2});tone({f:160,f2:90,d:.05,v:.1,type:'triangle'});}
    else{noise({d:.035,v:.13,f:jit(700,.2),q:1.4});tone({f:jit(190,.15),f2:85,d:.05,v:.09,type:'triangle'});}
  }
  /* ------------ musuh mati: tiap jenis punya suara ------------ */
  function kill(type,x){
    if(!ac||muted||!ok('kill',55))return;
    const pan=clamp((x||0)/3.2,-1,1)*0.7;
    const splat=(v,f)=>noise({d:.13,v:v,f:f||520,q:1.1,pan});
    if(type==='runner'){voice({f0:jit(430,.15),glide:.5,d:.22,v:.17,form:[[900,600],[2100,1500]],vib:[30,18],pan});splat(.16,900);}
    else if(type==='brute'){voice({f0:jit(78,.1),glide:.6,d:.8,v:.34,form:[[420,260],[800,500]],vib:[9,5],pan,send:.2});tone({f:70,f2:32,d:.45,v:.4,pan});splat(.3,300);}
    else if(type==='ghoul'){voice({f0:jit(250,.12),glide:.45,d:.4,v:.17,form:[[650,380],[1500,900]],vib:[34,22],pan,send:.1});splat(.18,700);}
    else if(type==='spitter'){voice({f0:jit(170,.12),glide:.5,d:.42,v:.16,form:[[560,340],[1100,700]],vib:[22,14],pan});noise({d:.25,v:.13,f:1400,f2:300,q:2,pan});splat(.2,450);}
    else if(type==='helmet'){voice({f0:jit(135,.1),glide:.55,d:.42,v:.19,form:[[600,380],[1050,640]],vib:[12,6],pan});tone({f:2300*jit(1,.1),f2:1700,d:.12,v:.07,type:'triangle',pan});splat(.22,520);}
    else{voice({f0:jit(160,.18),glide:.52,d:.36,v:.18,form:[[700,430],[1250,780]],vib:[16,9],pan});splat(.2,560);}
  }
  function hurt(){
    if(!ac||muted||!ok('hurt',110))return;
    voice({f0:jit(260,.1),glide:.6,d:.16,v:.2,form:[[820,500],[1500,1000]],type:'square'});
    tone({f:120,f2:52,d:.16,v:.3,type:'triangle'});
  }
  function boom(big){
    if(!ac||muted||!ok('boom',90))return;
    const s=big?1:.7;
    noise({d:big?1:.6,v:.8*s,type:'lowpass',f:3200,f2:110,q:.5,send:.35});
    tone({f:84,f2:26,d:big?1:.6,v:.9*s,send:.2});
    for(let i=0;i<5;i++)noise({t:.03+R()*.3,d:.08+R()*.1,v:.14,f:700+R()*1800,q:1.5});
  }
  /* ------------ benda & hadiah ------------ */
  function gate(good,mag){
    if(!ac||muted)return;
    if(good){
      const b=500+clamp(mag||0,0,30)*8;
      [1,1.25,1.5,2].forEach((m,i)=>{tone({t:i*.055,f:b*m,d:.34,v:.1,type:'triangle',send:.35});tone({t:i*.055,f:b*m*2,d:.2,v:.035,send:.3});});
      noise({d:.25,v:.05,type:'highpass',f:6000,f2:9000,t:.1});
    }else{
      tone({f:230,f2:80,d:.38,v:.26,type:'sawtooth',lp:750,lp2:180,send:.12});
      tone({f:119,f2:60,d:.38,v:.2,type:'square',lp:300});noise({d:.14,v:.14,f:300,q:1});
    }
  }
  function barrel(){
    if(!ac||muted)return;
    noise({d:.1,v:.5,f:900,q:1.1,send:.1});noise({d:.05,v:.22,type:'highpass',f:3200});
    tone({f:150,f2:55,d:.18,v:.5,type:'triangle'});
    for(let i=0;i<4;i++)noise({t:.04+i*.035,d:.05,v:.12,f:1400+R()*1800,q:2});
    [784,988,1319].forEach((f,i)=>tone({t:.1+i*.07,f,d:.26,v:.1,type:'triangle',send:.3}));
  }
  function bottle(){
    if(!ac||muted)return;
    noise({d:.07,v:.5,type:'highpass',f:2000,send:.2});
    for(let i=0;i<11;i++)noise({t:R()*.3,d:.04+R()*.12,v:.1+R()*.18,type:'highpass',f:3600+R()*4200,q:1.2,pan:(R()*2-1)*.5,send:.22});
    for(let i=0;i<4;i++)tone({t:.02+R()*.2,f:3500+R()*3500,d:.22,v:.05,send:.35});
    tone({f:200,f2:90,d:.12,v:.22,type:'triangle'});
  }
  function pickup(){
    if(!ac||muted)return;
    tone({f:420,f2:1500,d:.32,v:.1,type:'sine',send:.4});
    [880,1175,1568,2093].forEach((f,i)=>tone({t:.08+i*.06,f,d:.3,v:.07,type:'triangle',send:.4}));
  }
  function ally(){
    if(!ac||muted)return;
    [523,659,784].forEach((f,i)=>tone({t:i*.08,f,d:.45,v:.11,type:'triangle',send:.35}));
    tone({t:.24,f:1047,d:.6,v:.1,send:.4});
  }
  function shield(){
    if(!ac||muted||!ok('shield',100))return;
    tone({f:1450,f2:950,d:.22,v:.14,type:'triangle',send:.3});tone({f:2180,f2:1800,d:.15,v:.07,send:.3});noise({d:.04,v:.12,type:'highpass',f:5000});
  }
  function spike(){
    if(!ac||muted)return;
    noise({d:.12,v:.35,type:'highpass',f:2500});tone({f:700,f2:200,d:.15,v:.14,type:'sawtooth',lp:2000});
    voice({f0:240,glide:.6,d:.2,v:.18,type:'square'});
  }
  function freeze(){
    if(!ac||muted)return;
    for(let i=0;i<7;i++)tone({t:R()*.35,f:2200+R()*3200,d:.3,v:.05,send:.4});
    noise({d:.45,v:.09,type:'highpass',f:6500,send:.3});tone({f:300,f2:120,d:.5,v:.12,type:'sine'});
  }
  function power(){
    if(!ac||muted)return;
    tone({f:200,f2:1800,d:.4,v:.15,type:'sawtooth',lp:600,lp2:5000,send:.3});
    [523,659,784,1047].forEach((f,i)=>tone({t:.2+i*.04,f,d:.4,v:.07,type:'triangle',send:.35}));
  }
  function heal(){
    if(!ac||muted)return;
    [659,784,988,1319].forEach((f,i)=>tone({t:i*.07,f,d:.45,v:.1,type:'sine',send:.4}));
  }
  function coin(){
    if(!ac||!ok('coin',40)||muted)return;
    tone({f:1319,d:.09,v:.07,type:'square',lp:4000});tone({t:.06,f:1760,d:.18,v:.07,type:'square',lp:4000,send:.15});
  }
  function roar(){
    if(!ac||muted)return;
    voice({f0:62,glide:.7,d:1.3,v:.5,form:[[360,220],[700,420]],vib:[7,4],q:3,send:.3});
    noise({d:1.2,v:.22,type:'lowpass',f:1200,f2:200,send:.3});tone({f:48,f2:30,d:1.3,v:.5});
  }
  function bossDie(){
    if(!ac||muted)return;
    voice({f0:75,glide:.4,d:1.6,v:.45,form:[[420,200],[800,360]],vib:[6,5],q:3,send:.4});
    for(let i=0;i<5;i++){setTimeout(()=>boom(true),i*180);}
  }
  /* ------------ UI & kuis ------------ */
  function click(){if(!ac||muted)return;tone({f:900,f2:600,d:.05,v:.07,type:'triangle'});}
  function whoosh(){if(!ac||muted)return;noise({d:.4,v:.16,f:260,f2:3400,q:1.2,a:.12,send:.2});}
  function correct(){
    if(!ac||muted)return;
    [523,659,784,1047,1319].forEach((f,i)=>{tone({t:i*.08,f,d:.55,v:.11,type:'triangle',send:.4});tone({t:i*.08,f:f*2,d:.35,v:.035,send:.4});});
    noise({t:.3,d:.4,v:.05,type:'highpass',f:7000,send:.3});
  }
  function wrong(){
    if(!ac||muted)return;
    tone({f:233,f2:200,d:.22,v:.15,type:'square',lp:900});tone({t:.2,f:175,f2:130,d:.4,v:.16,type:'square',lp:700});
    tone({f:117,f2:80,d:.55,v:.18,type:'sawtooth',lp:400});
  }
  function win(){
    if(!ac||muted)return;
    const brass=(f,t,d,v)=>{tone({t,f,d,v,type:'sawtooth',lp:2600,lp2:1200,a:.03,send:.25});tone({t,f:f*1.005,d,v:v*.7,type:'sawtooth',lp:2200,a:.03,send:.25});};
    [[392,0,.2],[523,.17,.2],[659,.34,.2],[784,.51,.75],[659,1.0,.18],[784,1.16,.22],[1047,1.34,1.1]].forEach(n=>brass(n[0],n[1],n[2],.13));
    [[196,0],[262,.51],[262,1.34]].forEach(n=>tone({t:n[1],f:n[0],d:1,v:.2,type:'triangle',send:.3}));
    noise({t:1.34,d:1.3,v:.16,type:'highpass',f:6000,send:.4});
    for(let i=0;i<8;i++)tone({t:1.4+i*.09,f:1568+i*180,d:.5,v:.04,send:.5});
  }
  function lose(){
    if(!ac||muted)return;
    [[392,0,.4],[370,.42,.4],[349,.84,.4],[262,1.26,1.4]].forEach(n=>{tone({t:n[1],f:n[0],d:n[2],v:.16,type:'sawtooth',lp:900,a:.04,vib:[5,6],send:.3});});
    tone({t:0,f:65,d:2.4,v:.2,type:'sine'});
    voice({t:.2,f0:110,glide:.5,d:1.5,v:.1,form:[[420,250],[760,400]],vib:[5,4],send:.4});
  }
  function start(){if(!ac||muted)return;tone({f:60,f2:35,d:.35,v:.5});noise({d:.5,v:.14,f:200,f2:2800,q:1,a:.2,send:.2});}

  /* ------------ MUSIK: loop aksi A-minor 126 bpm ------------ */
  const Music=(()=>{
    let timer=null,step=0,next=0;const BPM=126,SP=60/BPM/4;
    const ROOT=[55,43.65,65.41,49]; // Am F C G
    const CH=[[0,3,7],[0,4,7],[0,4,7],[0,4,7]];
    const SEMI=n=>Math.pow(2,n/12);
    const mt=(o)=>{ // nada musik langsung ke bus musik
      const t0=o.t,d=o.d,osc=ac.createOscillator();osc.type=o.type||'sawtooth';osc.frequency.setValueAtTime(o.f,t0);
      if(o.f2)osc.frequency.exponentialRampToValueAtTime(o.f2,t0+d);
      const g=ac.createGain();g.gain.setValueAtTime(0.0001,t0);g.gain.linearRampToValueAtTime(o.v,t0+(o.a||0.006));g.gain.exponentialRampToValueAtTime(0.0001,t0+d);
      let n=osc;if(o.lp){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(o.lp,t0);if(o.lp2)f.frequency.exponentialRampToValueAtTime(o.lp2,t0+d);f.Q.value=o.q||1;n.connect(f);n=f;}
      n.connect(g);g.connect(musBus);osc.start(t0);osc.stop(t0+d+0.05);
    };
    const mn=(o)=>{const s=ac.createBufferSource();s.buffer=nbuf;const f=ac.createBiquadFilter();f.type=o.type;f.frequency.value=o.f;f.Q.value=o.q||1;
      const g=ac.createGain();g.gain.setValueAtTime(o.v,o.t);g.gain.exponentialRampToValueAtTime(0.0001,o.t+o.d);s.connect(f);f.connect(g);g.connect(musBus);s.start(o.t,R()*1.5,o.d+0.02);s.stop(o.t+o.d+0.03);};
    function sched(t,s){
      const bar=Math.floor(s/16)%4,st=s%16,root=ROOT[bar];
      if(st%4===0)mt({t,f:150,f2:44,d:.16,v:.55,type:'sine'});
      if(st===4||st===12)mn({t,type:'bandpass',f:1900,q:.8,d:.13,v:.22});
      if(st%2===1)mn({t,type:'highpass',f:8500,d:.035,v:.07});
      if(st===6||st===14)mn({t,type:'highpass',f:7500,d:.12,v:.05});
      const bp=[0,3,6,8,10,11,14];
      if(bp.includes(st))mt({t,f:root*(st===6||st===14?2:1),d:.2,v:.2,type:'sawtooth',lp:520,lp2:180,q:3});
      if(st%2===0){const c=CH[bar],idx=(st/2+bar)%4,iv=[c[0],c[1],c[2],c[1]+12][idx]; // arpeggio
        mt({t,f:root*4*SEMI(iv),d:.14,v:.04,type:'square',lp:2400,lp2:900,q:2});}
      if(st===0){for(const iv of CH[bar])mt({t,f:root*4*SEMI(iv),d:SP*16*0.98,a:.35,v:.022,type:'sawtooth',lp:1300,q:.6});}
    }
    function tick(){
      if(!ac)return;
      while(next<ac.currentTime+0.2){sched(Math.max(next,ac.currentTime+0.01),step);next+=SP;step++;}
    }
    return{
      start(){if(timer||!ac)return;next=ac.currentTime+0.08;step=0;timer=setInterval(tick,40);},
      stop(){if(timer){clearInterval(timer);timer=null;}}
    };
  })();

  return{
    init,unlock:init,shoot,hit,kill,hurt,boom,gate,barrel,bottle,pickup,ally,shield,spike,freeze,power,heal,coin,roar,bossDie,click,whoosh,correct,wrong,win,lose,start,
    setMuted(m){muted=m;if(master)master.gain.value=m?0:0.9;},
    setMusic(on){musicOn=on;if(!ac)return;musBus.gain.setTargetAtTime(on?0.34*duck:0,ac.currentTime,0.1);if(on)Music.start();else Music.stop();},
    duck(on){duck=on?0.3:1;if(ac&&musicOn)musBus.gain.setTargetAtTime(0.34*duck,ac.currentTime,0.15);}
  };
})();
