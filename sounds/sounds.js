/* Shared notification and ringtone audio. Upload files into /sounds using
 * sms, kakao or ringtone with .m4a, .mp3 or .wav extensions. */
(function iphone26Sound(){
  'use strict';
  if(window.__IPHONE_SOUND__)return;
  const KEY='iphone26_silent_mode';
  const candidates={
    sms:['sms.m4a','sms.mp3','sms.wav'],
    kakao:['kakao.mp3','kakao.m4a','kakao.wav'],
    ringtone:['ringtone.m4a','ringtone.mp3','ringtone.wav']
  };
  const active=new Map();
  const silent=()=>{try{return localStorage.getItem(KEY)==='1'}catch{return false}};
  function stop(type){
    const audio=active.get(type);if(!audio)return;
    active.delete(type);audio.onerror=null;audio.pause();audio.removeAttribute('src');audio.load();
  }
  function stopAll(){for(const type of [...active.keys()])stop(type)}
  function play(type,loop=false){
    if(silent()||!candidates[type])return false;
    stop(type);
    const audio=new Audio();let index=0,attempt=0,cancelled=false;
    audio.preload='auto';audio.loop=loop;audio.playsInline=true;active.set(type,audio);
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
    const oldStop=audio.pause.bind(audio);
    audio.pause=()=>{cancelled=true;oldStop()};
    next();return true;
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
