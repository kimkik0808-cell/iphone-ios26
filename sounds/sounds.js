/* Shared notification and ringtone audio. Upload files into /sounds using
 * sms, kakao or ringtone with .m4a, .mp3 or .wav extensions. */
(function iphone26Sound(){
  'use strict';
  if(window.__IPHONE_SOUND__)return;
  const KEY='iphone26_silent_mode';
  const candidates={
    sms:['message.m4a','message.mp3','message.wav','sms.m4a','sms.mp3','sms.wav'],
    kakao:['kakao.mp3','kakao.m4a','kakao.wav'],
    ringtone:['call.m4a','ringtone.m4a','ringtone.mp3','ringtone.wav']
  };
  const active=new Map();
  const buffers=new Map();
  const loading=new Map();
  const failed=new Set();
  const AudioContextClass=window.AudioContext||window.webkitAudioContext;
  let audioContext=null;
  const silent=()=>{try{return localStorage.getItem(KEY)==='1'}catch{return false}};

  function stop(type){
    const item=active.get(type);if(!item)return;
    active.delete(type);
    if(item.kind==='buffer'){
      item.node.onended=null;
      try{item.node.stop()}catch{}
      try{item.node.disconnect()}catch{}
      return;
    }
    const audio=item.audio;
    audio.onerror=null;audio.onended=null;audio.pause();audio.loop=false;
    audio.removeAttribute('src');audio.load();
  }
  function stopAll(){for(const type of [...active.keys()])stop(type)}

  async function loadBuffer(type){
    if(!audioContext||!candidates[type])return null;
    if(buffers.has(type))return buffers.get(type);
    if(failed.has(type))return null;
    if(loading.has(type))return loading.get(type);
    const task=(async()=>{
      for(const file of candidates[type]){
        try{
          const response=await fetch(new URL('./sounds/'+file,document.baseURI).href,{cache:'force-cache'});
          if(!response.ok)continue;
          const data=await response.arrayBuffer();
          const buffer=await audioContext.decodeAudioData(data.slice(0));
          buffers.set(type,buffer);failed.delete(type);
          return buffer;
        }catch{}
      }
      failed.add(type);return null;
    })();
    loading.set(type,task);
    try{return await task}finally{loading.delete(type)}
  }

  function unlockNotifications(){
    if(!AudioContextClass)return;
    if(!audioContext)audioContext=new AudioContextClass();
    audioContext.resume?.().catch(()=>{});
    try{
      const silentBuffer=audioContext.createBuffer(1,1,22050);
      const source=audioContext.createBufferSource();
      const gain=audioContext.createGain();
      gain.gain.value=0;
      source.buffer=silentBuffer;
      source.connect(gain);
      gain.connect(audioContext.destination);
      source.start(0);
    }catch{}
    loadBuffer('sms');
    loadBuffer('kakao');
    loadBuffer('ringtone');
  }
  document.addEventListener('pointerdown',unlockNotifications,{capture:true,passive:true});
  document.addEventListener('touchstart',unlockNotifications,{capture:true,passive:true});

  function playBuffer(type,loop=false){
    if(!audioContext||!buffers.has(type))return false;
    const node=audioContext.createBufferSource();
    node.buffer=buffers.get(type);node.loop=loop;node.connect(audioContext.destination);
    const item={kind:'buffer',node};active.set(type,item);
    node.onended=()=>{if(!loop&&active.get(type)===item){active.delete(type);try{node.disconnect()}catch{}}};
    audioContext.resume?.().catch(()=>{});
    try{node.start(0);return true}catch{active.delete(type);return false}
  }

  function playHTML(type,loop=false){
    const audio=new Audio();let index=0,attempt=0,cancelled=false;
    const item={kind:'html',audio};active.set(type,item);
    audio.preload='auto';audio.loop=loop;audio.playsInline=true;audio.muted=false;audio.volume=1;
    const next=()=>{
      if(cancelled||silent()){stop(type);return}
      if(index>=candidates[type].length){stop(type);return}
      const token=++attempt;
      audio.src=new URL('./sounds/'+candidates[type][index++],document.baseURI).href;
      const failed=()=>{if(token===attempt&&active.get(type)===item)next()};
      audio.onerror=failed;audio.load();audio.play().catch(failed);
    };
    audio.onended=()=>{if(!loop&&active.get(type)===item)active.delete(type)};
    next();return true;
  }

  function play(type,loop=false){
    if(silent()||!candidates[type])return false;
    stop(type);
    if(type==='sms'||type==='kakao'||type==='ringtone'){
      if(playBuffer(type,loop))return true;
      if(audioContext){
        loadBuffer(type).then(buffer=>{
          if(!buffer||silent())return;
          stop(type);playBuffer(type,loop);
        });
        return true;
      }
    }
    return playHTML(type,loop);
  }

  function setSilent(enabled){
    try{localStorage.setItem(KEY,enabled?'1':'0')}catch{}
    if(enabled)stopAll();
    window.dispatchEvent(new CustomEvent('iphone26:silentchange',{detail:{enabled:!!enabled}}));
  }
  window.__IPHONE_SOUND__={
    get silent(){return silent()},setSilent,
    readyFor:type=>buffers.has(type),
    shouldDefer:type=>!!AudioContextClass&&!buffers.has(type)&&!failed.has(type),
    playSMS:()=>play('sms'),playKakao:()=>play('kakao'),
    startRingtone:()=>play('ringtone',true),stopRingtone:()=>stop('ringtone'),stopAll
  };
})();
