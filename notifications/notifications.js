(function ios26NotificationModule(){
  'use strict';
  if(window.__IOS26_NOTIF_LOADED__)return;
  window.__IOS26_NOTIF_LOADED__=true;

  const device=document.querySelector('#device');
  if(!device)return;
  const stack=document.createElement('div');
  stack.id='ios26-notice-stack';
  stack.setAttribute('aria-live','polite');
  stack.setAttribute('aria-atomic','false');
  device.appendChild(stack);

  const DND_KEY='iphone26_dnd_enabled';
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const isDnd=()=>{try{return localStorage.getItem(DND_KEY)!=='0'}catch{return true}};
  const canDisplay=()=>!isDnd() && (typeof isLocked==='undefined'||!isLocked) && !document.hidden;

  const instagramIcon=`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="nig26" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#ffcb54"/><stop offset=".28" stop-color="#fa5c39"/><stop offset=".56" stop-color="#d5268c"/><stop offset=".83" stop-color="#8c46cc"/><stop offset="1" stop-color="#4159c7"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#nig26)"/><rect x="14" y="14" width="36" height="36" rx="10" stroke="white" stroke-width="4.3" fill="none"/><circle cx="32" cy="32" r="8.7" fill="none" stroke="white" stroke-width="4.3"/><circle cx="43" cy="21" r="3" fill="white"/></svg>`;
  const kakaoIcon=`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#FEE500"/><ellipse cx="32" cy="29.5" rx="24" ry="18" fill="#3b2923"/><path d="M18 44l-3.7 12 14-9.4" fill="#3b2923"/><text x="32" y="34" fill="#fee500" font-family="Arial,Helvetica,sans-serif" font-size="12" font-weight="900" text-anchor="middle">TALK</text></svg>`;
  const igFans=[
    'hyunjae_daily','deobi._love','h_j_lover','yourmoon_23',
    'onlyhyunjae','deobi.zip','lovely_jjae','theboyz_fanclub',
    'hyunjae_archive','forever_theb','jh_fan_diary','sunnydeobi',
    'hyunjae_bear','our_hyunjae','daily_theb','deobi_now',
    'my_star_jh','jj._love','soft_hyunjae','always_deobi'
  ];
  const igMessages=[
    '회원님의 사진을 좋아합니다. ❤️',
    '회원님의 게시물을 좋아합니다.',
    '회원님의 사진에 좋아요를 눌렀습니다.',
    '님 외 여러 명이 회원님의 게시물을 좋아합니다.',
    '회원님의 릴스를 좋아합니다.'
  ];
  const kktSenders=[
    '알 수 없는 계정','확인되지 않은 사용자','모르는 사람',
    '알 수 없는 계정','낯선 계정','알 수 없는 계정'
  ];
  const kktMessages=[
    '오빠 왜 답장 안 해요? 메시지 봤잖아요.',
    '또 번호 바꿨네… 그래도 연락할 수 있어.',
    '오늘 스케줄 끝나고 어디 가요?',
    '내 메시지 좀 봐줘요. 계속 기다렸는데.',
    '언제 답장할 거예요? 계속 보내도 되죠?',
    '팬이니까 이 정도는 알려줘도 되잖아요.',
    '차단해도 다시 연락할 거예요.',
    '오늘도 연락했는데 왜 읽지 않아요?',
    '오빠 지금 어디예요? 답장 한 번만 해줘요.',
    '계속 기다리는 사람도 있다고요.'
  ];
  let counter=0;
  let generation=0;
  let tickTimer=0;
  let eraseTimer=0;
  let displayed=null;

  const clearNotice=()=>{
    clearTimeout(eraseTimer);
    eraseTimer=0;
    if(displayed){
      displayed.remove();
      displayed=null;
    }
    stack.replaceChildren();
  };
  function removeNotice(){
    if(!displayed)return;
    const node=displayed;
    clearTimeout(eraseTimer);
    eraseTimer=0;
    displayed=null;
    node.classList.add('ios26-notice-leaving');
    setTimeout(()=>node.remove(),230);
  }
  function navigate(name){
    removeNotice();
    if(typeof isLocked!=='undefined'&&isLocked)return;
    if(typeof openApp!=='function')return;
    if(name==='instagram'){
      openApp('instagram');
      const tab=document.querySelector('#ig14 [data-a="tab"][data-v="profile"]');
      if(tab) tab.click();
      else if(window.__IG14_TEST__){
        window.__IG14_TEST__.state.activeTab='profile';
        window.__IG14_TEST__.render();
      }
      document.querySelector('#ig14 [data-a="detail"][data-id="own1"]')?.click();
    }else{
      // Banner-only fictional contacts are not inserted into KakaoTalk's actual chat list.
      openApp('kakao');
      document.querySelector('#kkt15 [data-k15="chat"][data-id="unknown"]')?.click();
    }
  }
  function nextData(){
    const i=counter++;
    // A celebrity receives many fan-like notifications: IG most often, KKT intermittently.
    const kind=(i%5===3||i%7===5)?'kakao':'instagram';
    if(kind==='instagram'){
      const name=igFans[(i*7+Math.floor(i/igFans.length))%igFans.length];
      const message=i%6===4?
        name+'님 외 '+(12+(i*7)%68)+'명이 회원님의 게시물을 좋아합니다.' :
        igMessages[i%igMessages.length];
      return {kind,name:'Instagram',sender:name+'님',message,icon:instagramIcon};
    }
    return {kind,name:'카카오톡',
      sender:kktSenders[(i*3+Math.floor(i/6))%kktSenders.length],
      message:kktMessages[(i*5+Math.floor(i/5))%kktMessages.length],
      icon:kakaoIcon};
  }
  function show(kind){
    if(!canDisplay())return false;
    const info=nextData();
    if(kind==='instagram' && info.kind!=='instagram'){
      info.kind='instagram';info.name='Instagram';info.sender=igFans[(counter*5)%igFans.length]+'님';
      info.message=igMessages[counter%igMessages.length];info.icon=instagramIcon;
    }
    if(kind==='kakao' && info.kind!=='kakao'){
      info.kind='kakao';info.name='카카오톡';
      info.sender=kktSenders[counter%kktSenders.length];info.message=kktMessages[counter%kktMessages.length];info.icon=kakaoIcon;
    }
    clearNotice();
    const node=document.createElement('button');
    node.type='button';
    node.className='ios26-notice';
    node.dataset.notification=info.kind;
    node.setAttribute('aria-label',info.name+' 알림: '+info.sender+' '+info.message);
    node.innerHTML=`<div class="ios26-notice-top"><span class="ios26-notice-icon">${info.icon}</span><span class="ios26-notice-app">${esc(info.name)}</span><span class="ios26-notice-time">지금</span></div><div class="ios26-notice-content"><strong>${esc(info.sender)}</strong><p>${esc(info.message)}</p></div><div class="ios26-notice-handle"></div>`;
    stack.appendChild(node);
    displayed=node;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{if(node.isConnected)node.classList.add('ios26-notice-visible')}));
    eraseTimer=setTimeout(removeNotice,4600);
    node.addEventListener('click',()=>navigate(info.kind));
    let touchY=null;
    node.addEventListener('touchstart',e=>{touchY=e.touches[0]?.clientY??null},{passive:true});
    node.addEventListener('touchend',e=>{
      if(touchY!==null && touchY-(e.changedTouches[0]?.clientY??touchY)>35){
        e.preventDefault();e.stopPropagation();removeNotice();
      }
      touchY=null;
    },{passive:false});
    return true;
  }
  function stop(){
    generation++;
    clearTimeout(tickTimer);
    tickTimer=0;
    clearNotice();
  }
  function schedule(initialDelay=1500){
    stop();
    if(!canDisplay())return;
    const token=generation;
    function tick(){
      if(token!==generation||!canDisplay())return;
      show();
      tickTimer=setTimeout(tick,5000);
    }
    tickTimer=setTimeout(tick,initialDelay);
  }
  window.addEventListener('ios26:dndchange',e=>{
    if(e.detail?.enabled===true){stop();}
    else if(e.detail?.enabled===false){schedule(900);}
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)stop();
    else if(canDisplay())schedule(1100);
  });
  if(typeof lockOff==='function'){
    const oldLockOff=lockOff;
    lockOff=function(...args){
      const result=oldLockOff.apply(this,args);
      if(canDisplay())schedule(1200);
      else stop();
      return result;
    };
  }
  if(canDisplay())schedule(1200);
  window.__IOS26_NOTIFICATIONS__={
    show,stop,replay:()=>{if(canDisplay())schedule(100);},
    get enabled(){return !isDnd()},
    get shown(){return displayed?[displayed.dataset.notification]:[]},
    get count(){return counter}
  };
})();