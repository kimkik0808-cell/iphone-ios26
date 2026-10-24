/* Shared notification and ringtone audio. Upload files into /sounds using
 * sms, kakao or ringtone with .m4a, .mp3 or .wav extensions. */
(function iphone26Sound(){
  'use strict';
  if(window.__IPHONE_SOUND__)return;
  const KEY='iphone26_silent_mode';
  const candidates={
    sms:['message.m4a','message.mp3','message.wav','sms.m4a','sms.mp3','sms.wav'],
    kakao:['kakao.mp3','kakao.m4a','kakao.wav'],
    ringtone:['ringtone.m4a','ringtone.mp3','ringtone.wav']
  };
  const active=new Map();
  let smsUnlockedAudio=null;
  let smsUnlocking=false;
  let kakaoUnlockedAudio=null;
  let kakaoUnlocking=false;
  const silent=()=>{try{return localStorage.getItem(KEY)==='1'}catch{return false}};
  function stop(type){
    const audio=active.get(type);if(!audio)return;
    active.delete(type);audio.onerror=null;audio.onended=null;audio.pause();audio.loop=false;
    if(audio===smsUnlockedAudio||audio===kakaoUnlockedAudio){
      try{audio.currentTime=0}catch{}
      return;
    }
    audio.removeAttribute('src');audio.load();
  }
  function unlockSMS(){
    if(smsUnlockedAudio||smsUnlocking)return;
    smsUnlocking=true;
    const audio=new Audio(new URL('./sounds/message.m4a',document.baseURI).href);
    audio.preload='auto';audio.playsInline=true;audio.muted=true;
    const restore=()=>{audio.pause();try{audio.currentTime=0}catch{}audio.muted=false;audio.volume=1};
    audio.play().then(()=>{
      restore();smsUnlockedAudio=audio;smsUnlocking=false;
    }).catch(()=>{
      restore();smsUnlocking=false;
    });
  }
  function unlockKakao(){
    if(kakaoUnlockedAudio||kakaoUnlocking)return;
    kakaoUnlocking=true;
    const audio=new Audio(new URL('./sounds/kakao.mp3',document.baseURI).href);
    audio.preload='auto';audio.playsInline=true;audio.muted=true;
    const restore=()=>{audio.pause();try{audio.currentTime=0}catch{}audio.muted=false;audio.volume=1};
    audio.play().then(()=>{
      restore();kakaoUnlockedAudio=audio;kakaoUnlocking=false;
    }).catch(()=>{
      restore();kakaoUnlocking=false;
    });
  }
  function unlockNotifications(){unlockSMS();unlockKakao()}
  document.addEventListener('pointerdown',unlockNotifications,{capture:true,passive:true});
  document.addEventListener('touchstart',unlockNotifications,{capture:true,passive:true});
  function stopAll(){for(const type of [...active.keys()])stop(type)}
  function play(type,loop=false){
    if(silent()||!candidates[type])return false;
    stop(type);
    const primed=type==='sms'?smsUnlockedAudio:type==='kakao'?kakaoUnlockedAudio:null;
    const audio=primed||new Audio();let index=primed?1:0,attempt=0,cancelled=false;
    audio.preload='auto';audio.loop=loop;audio.playsInline=true;audio.muted=false;audio.volume=1;active.set(type,audio);
    const next=()=>{
      if(cancelled||silent()){stop(type);return}
      if(index>=candidates[type].length){stop(type);return}
      const token=++attempt;
      audio.src=new URL('./sounds/'+candidates[type][index++],document.baseURI).href;
      const failed=()=>{if(token===attempt&&active.get(type)===audio)next()};
      audio.onerror=failed;
      audio.load();audio.play().catch(failed);
    };
    audio.addEventListener('ended',()=>{if(!loop&&active.get(type)===audio)active.delete(type)});
    const start=()=>{
      if(!primed){next();return}
      try{audio.currentTime=0}catch{}
      audio.onerror=()=>{if(active.get(type)===audio)next()};
      audio.play().catch(()=>{if(active.get(type)===audio)next()});
    };
    start();return true;
  }
  function setSilent(enabled){
    try{localStorage.setItem(KEY,enabled?'1':'0')}catch{}
    if(enabled)stopAll();
    window.dispatchEvent(new CustomEvent('iphone26:silentchange',{detail:{enabled:!!enabled}}));
  }
  window.__IPHONE_SOUND__={
    get silent(){return silent()},setSilent,
    playSMS:()=>play('sms'),playKakao:()=>play('kakao'),
    startRingtone:()=>play('ringtone',true),stopRingtone:()=>stop('ringtone'),stopAll
  };
})();
