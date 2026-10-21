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
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const apps={
    instagram:{
      name:'Instagram',sender:'hyunjae_love님',
      message:'회원님의 게시물을 좋아합니다. ❤️',
      icon:`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="nig26" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#ffcb54"/><stop offset=".28" stop-color="#fa5c39"/><stop offset=".56" stop-color="#d5268c"/><stop offset=".83" stop-color="#8c46cc"/><stop offset="1" stop-color="#4159c7"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#nig26)"/><rect x="14" y="14" width="36" height="36" rx="10" stroke="white" stroke-width="4.3" fill="none"/><circle cx="32" cy="32" r="8.7" fill="none" stroke="white" stroke-width="4.3"/><circle cx="43" cy="21" r="3" fill="white"/></svg>`
    },
    kakao:{
      name:'카카오톡',sender:'알 수 없는 계정',
      message:'지금 숙소 근처인데 잠깐만 나와주면 안 돼요?',
      icon:`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#FEE500"/><ellipse cx="32" cy="29.5" rx="24" ry="18" fill="#3b2923"/><path d="M18 44l-3.7 12 14-9.4" fill="#3b2923"/><text x="32" y="34" fill="#fee500" font-family="Arial,Helvetica,sans-serif" font-size="12" font-weight="900" text-anchor="middle">TALK</text></svg>`
    }
  };
  let launched=false;
  const active=new Map();
  const timers=[];
  function remove(name){
    const item=active.get(name);
    if(!item)return;
    clearTimeout(item.dismiss);
    active.delete(name);
    item.node.classList.add('ios26-notice-leaving');
    timers.push(setTimeout(()=>item.node.remove(),260));
  }
  function navigate(name){
    remove(name);
    if(typeof isLocked!=='undefined'&&isLocked)return;
    if(typeof openApp!=='function')return;
    if(name==='instagram'){
      openApp('instagram');
      const profileTab=document.querySelector('#ig14 [data-a="tab"][data-v="profile"]');
      if(profileTab){profileTab.click()}
      else if(window.__IG14_TEST__){
        window.__IG14_TEST__.state.activeTab='profile';
        window.__IG14_TEST__.render();
      }
      const firstPost=document.querySelector('#ig14 [data-a="detail"][data-id="own1"]');
      if(firstPost)firstPost.click();
    }else if(name==='kakao'){
      openApp('kakao');
      const thread=document.querySelector('#kkt15 [data-k15="chat"][data-id="unknown"]');
      if(thread)thread.click();
    }
  }
  function show(name){
    const info=apps[name];
    if(!info)return;
    remove(name);
    const button=document.createElement('button');
    button.type='button';
    button.className='ios26-notice';
    button.dataset.notification=name;
    button.setAttribute('aria-label',info.name+' 알림: '+info.sender+' '+info.message);
    button.innerHTML=`<div class="ios26-notice-top"><span class="ios26-notice-icon">${info.icon}</span><span class="ios26-notice-app">${esc(info.name)}</span><span class="ios26-notice-time">지금</span></div><div class="ios26-notice-content"><strong>${esc(info.sender)}</strong><p>${esc(info.message)}</p></div><div class="ios26-notice-handle"></div>`;
    stack.appendChild(button);
    const record={node:button,dismiss:0};
    active.set(name,record);
    requestAnimationFrame(()=>requestAnimationFrame(()=>button.classList.add('ios26-notice-visible')));
    record.dismiss=setTimeout(()=>remove(name),6500);
    button.addEventListener('click',()=>navigate(name));
    let startY=null;
    button.addEventListener('touchstart',e=>{startY=e.touches[0]?.clientY??null},{passive:true});
    button.addEventListener('touchend',e=>{
      if(startY!==null&&startY-(e.changedTouches[0]?.clientY??startY)>35){
        e.preventDefault();
        e.stopPropagation();
        remove(name);
      }
      startY=null;
    },{passive:false});
  }
  function begin(){
    if(launched)return;
    launched=true;
    timers.push(setTimeout(()=>show('instagram'),2600));
    timers.push(setTimeout(()=>show('kakao'),10200));
  }
  if(typeof lockOff==='function'){
    const previousUnlock=lockOff;
    lockOff=function(...args){
      const result=previousUnlock.apply(this,args);
      begin();
      return result;
    };
  }
  if(typeof isLocked!=='undefined'&&!isLocked)begin();
  window.__IOS26_NOTIFICATIONS__={
    show,
    dismiss:remove,
    replay:()=>{show('instagram');timers.push(setTimeout(()=>show('kakao'),4200));},
    get shown(){return [...active.keys()]}
  };
})();