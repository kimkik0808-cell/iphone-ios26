(function settings26Module(){
  'use strict';
  if(window.__IOS26_SETTINGS_LOADED__) return;
  window.__IOS26_SETTINGS_LOADED__=true;
  const frame=document.querySelector('#appcontent');
  const appEl=document.querySelector('#app');
  const status=document.querySelector('#status');
  const gesture=document.querySelector('#gesture');
  const DND_KEY='iphone26_dnd_enabled';
  const LANG_KEY='iphone26_ui_language';
  const LANG_SET_KEY='iphone26_settings_language_confirmed_v1';
  const currentLanguage=()=>window.IphoneLocale?.language||
    (()=>{try{return localStorage.getItem(LANG_KEY)||'ko'}catch{return 'ko'}})();
  const locale=(ko,zh)=>currentLanguage()==='zh'?zh:ko;
  let page='main';
  let languagePreviousPage='general';
  let toastTimer=0;
  const isSettings=()=>typeof mode!=='undefined'&&mode==='settings';
  const isDnd=()=>{try{return localStorage.getItem(DND_KEY)==='1'}catch{return false}};
  const icons={
    chevron:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m14.7 4.5-7.5 7.5 7.5 7.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    search:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5" stroke-linecap="round"/></svg>`,
    moon:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.8 16.1A8.6 8.6 0 0 1 8 3.2 8.8 8.8 0 1 0 20.8 16.1Z"/></svg>`,
    plane:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="m22 3-2 16-6.9-4.6-3.1 5.5-2-1 1.9-6.1-7.9-2 1-2 8.7.5L22 3Z"/></svg>`,
    wifi:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 8c6.4-5.4 13.6-5.4 20 0M5 12c4.7-4.1 9.3-4.1 14 0M9 16c2-1.8 4-1.8 6 0" stroke-linecap="round"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>`,
    bluetooth:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M7 6 17 18l-5 4V2l5 4L7 18" stroke-linejoin="round"/></svg>`,
    cellular:`<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="15" width="3.5" height="6" rx=".5"/><rect x="8" y="11" width="3.5" height="10" rx=".5"/><rect x="13" y="7" width="3.5" height="14" rx=".5"/><rect x="18" y="3" width="3.5" height="18" rx=".5"/></svg>`,
    bell:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8a6 6 0 0 0-12 0v5l-2 3v1h16v-1l-2-3V8Zm-9 11h6a3 3 0 0 1-6 0Z"/></svg>`,
    volume:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M4 9h4l6-5v16l-6-5H4zM18 8a6 6 0 0 1 0 8M20 5a10 10 0 0 1 0 14" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
    display:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 7v3m0 4v3M7 12h3m4 0h3" stroke-linecap="round"/></svg>`,
    gear:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><circle cx="12" cy="12" r="3.2"/><path d="m10 2-.5 2.5-2.2 1.2L5 4.7 2.8 8.3l2 1.8v3.8l-2 1.8L5 19.3l2.3-1 2.2 1.2L10 22h4l.5-2.5 2.2-1.2 2.3 1 2.2-3.6-2-1.8v-3.8l2-1.8L19 4.7l-2.3 1-2.2-1.2L14 2z" stroke-linejoin="round"/></svg>`,
    privacy:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M12 2 3.5 5v6c0 5.5 3.5 8.5 8.5 11 5-2.5 8.5-5.5 8.5-11V5L12 2Z"/><path d="M12 8v7m-3-3.5h6" stroke-linecap="round"/></svg>`
  };
  const icon=(key,background='#88888d')=>`<span class="ios26-settings-symbol" style="background:${background}">${icons[key]||icons.gear}</span>`;
  const row=(label,key,color,value='',action='placeholder')=>`<button class="ios26-settings-item" data-s26="${action}" data-section="${key}">${icon(key,color)}<span class="ios26-settings-itemlabel">${label}</span><span class="ios26-settings-trail">${value}<span class="ios26-settings-chevron">›</span></span></button>`;
  const group=(children)=>`<section class="ios26-settings-group">${children}</section>`;
  const head=(title,back=false)=>`<header class="ios26-settings-head">${back?`<button class="ios26-settings-back" data-s26="back"><span>‹</span> 설정</button>`:'<div class="ios26-settings-head-end"></div>'}<strong>${title}</strong><div class="ios26-settings-head-end"></div></header>`;
  function main(){
    return `${head('설정')}<main class="ios26-settings-scroll"><h1 class="ios26-settings-title">설정</h1>
    <div class="ios26-settings-search">${icons.search}<span>검색</span></div>
    <button class="ios26-settings-account" data-s26="placeholder" data-section="Apple 계정">
      <div class="ios26-settings-avatar">재</div><span class="ios26-settings-account-text"><strong>이재현</strong><small>Apple 계정, iCloud 및 기타 서비스</small></span><span class="ios26-settings-chevron">›</span>
    </button>
    ${group(row('에어플레인 모드','plane','#ff9e0b','끔')+row('Wi-Fi','wifi','#1685ee','연결됨')+row('Bluetooth','bluetooth','#1685ee','켬')+row('셀룰러','cellular','#34c759'))}
    ${group(row('알림','bell','#ff3b30')+row('사운드 및 햅틱','volume','#ff315e')+row('집중 모드','moon','#675bd5',isDnd()?'방해금지 켬':'끔','focus')+row('스크린 타임','display','#6f62e4'))}
    ${group(row('일반','gear','#858589','','general')+row('언어 및 지역','gear','#858589',currentLanguage()==='zh'?'简体中文':'한국어','language')+row('디스플레이 및 밝기','display','#2688ef')+row('개인정보 보호 및 보안','privacy','#367eeb'))}
    </main>`;
  }
  function focus(){
    return `${head('집중 모드',true)}<main class="ios26-settings-scroll">
      <h1 class="ios26-settings-title">집중 모드</h1>
      <div class="ios26-settings-focushead"><div class="ios26-settings-focusicon">${icons.moon}</div>
      <strong>집중 모드</strong><small>중요한 순간에 방해를 줄이세요.</small></div>
      ${group(row('방해금지 모드','moon','#6958d8',isDnd()?'켬':'끔','dnd')+row('수면','moon','#8c75c8','설정 안 됨')+row('업무','gear','#9c8dbd','설정 안 됨')+row('개인 시간','privacy','#83adcf','설정 안 됨'))}
      <p class="ios26-settings-caption">방해금지 모드가 켜져 있는 동안에는 Instagram 및 카카오톡 알림 배너가 표시되지 않습니다.</p>
    </main>`;
  }
  function dnd(){
    const on=isDnd();
    return `${head('방해금지 모드',true)}<main class="ios26-settings-scroll">
      <div class="ios26-settings-focushead"><div class="ios26-settings-focusicon">${icons.moon}</div>
        <strong>방해금지 모드</strong><small>${on?'켬':'끔'}</small></div>
      <section class="ios26-settings-focusstate">
        <span><strong>방해금지 모드</strong><p>${on?'알림 배너가 표시되지 않습니다.':'Instagram · 카카오톡 알림을 받을 수 있습니다.'}</p></span>
        <button class="ios26-settings-switch" type="button" role="switch" aria-label="방해금지 모드" aria-checked="${on}" data-s26="toggle"><i></i></button>
      </section>
      <p class="ios26-settings-subtitle">알림 설정</p>
      ${group(row('사람','privacy','#94939b','추후 지원')+row('앱','bell','#94939b','추후 지원')+row('옵션','gear','#94939b','추후 지원'))}
      <p class="ios26-settings-focusinfo">이 가상 iPhone에서는 방해금지 모드의 알림 배너 표시 여부만 실제로 동작합니다. 다른 설정은 추후 구현될 예정입니다.</p>
    </main>`;
  }

  function generalPage(){
    return head(locale('일반','通用'),true)
      +'<main class="ios26-settings-scroll">'
      +'<h1 class="ios26-settings-title">'+locale('일반','通用')+'</h1>'
      +group(
        row('정보','gear','#858589','','placeholder')
        +row('소프트웨어 업데이트','gear','#858589','','placeholder')
        +row('언어 및 지역','gear','#858589',currentLanguage()==='zh'?'简体中文':'한국어','language')
        +row('날짜 및 시간','gear','#858589','','placeholder')
        +row('키보드','gear','#858589','','placeholder')
      )+'</main>';
  }
  function languagePage(){
    const lang=currentLanguage();
    return head(locale('언어 및 지역','语言与地区'),true)
      +'<main class="ios26-settings-scroll">'
      +'<h1 class="ios26-settings-title">'+locale('언어 및 지역','语言与地区')+'</h1>'
      +'<p class="ios26-settings-subtitle">'+locale('iPhone 언어','iPhone 语言')+'</p>'
      +'<section class="ios26-settings-group">'
      +'<button class="ios26-settings-item" data-s26="lang" data-lang="ko">'
      +'<span class="ios26-settings-itemlabel" style="font-weight:'+(lang==='ko'?710:450)+'">한국어</span>'
      +'<span class="ios26-settings-trail">'+(lang==='ko'?'✓':'')+'</span></button>'
      +'<button class="ios26-settings-item" data-s26="lang" data-lang="zh">'
      +'<span class="ios26-settings-itemlabel" style="font-weight:'+(lang==='zh'?710:450)+'">简体中文</span>'
      +'<span class="ios26-settings-trail">'+(lang==='zh'?'✓':'')+'</span></button></section>'
      +'<p class="ios26-settings-caption">'+locale(
        '선택한 언어는 앱, 메시지, 알림에 적용되고 저장됩니다. 업데이트 안내 언어는 별도로 선택할 수 있어요.',
        '选择后，手机界面、应用内容、聊天及通知将切换语言并保存。更新公告的语言可独立切换。'
      )+'</p>'
      +group(row('지역','gear','#858589',locale('대한민국','韩国'),'placeholder'))
      +'</main>';
  }
  function paint(){
    if(!isSettings())return;
    appEl.className='layer appscreen active ios26-settings-bg';
    appEl.style.display='block';
    status?.classList.add('dark');
    gesture?.classList.add('ink');
    frame.style.overflow='hidden';
    frame.style.bottom='calc(var(--safe-bottom) + 28px)';
    frame.innerHTML=`<div class="ios26-settings-root">${page==='language'?languagePage():page==='general'?generalPage():page==='dnd'?dnd():page==='focus'?focus():main()}</div>`;
  }
  const oldOpenApp=openApp;
  openApp=function(next,...args){
    if(next==='settings')page='main';
    return oldOpenApp.call(this,next,...args);
  };
  const oldRender=render;
  render=function(...args){
    if(isSettings()){paint();return}
    oldRender.apply(this,args);
  };
  const oldBack=back;
  back=function(...args){
    if(isSettings()){
      if(page==='dnd')page='focus';
      else if(page==='focus'||page==='general')page='main';
      else if(page==='language')page=languagePreviousPage;
      else return closeApp();
      paint();
      return;
    }
    return oldBack.apply(this,args);
  };
  frame.addEventListener('click',e=>{
    if(!isSettings())return;
    const btn=e.target.closest('[data-s26]');
    if(!btn)return;
    e.preventDefault();e.stopImmediatePropagation();
    const a=btn.dataset.s26;
    if(a==='back'){
      if(page==='dnd')page='focus';else if(page==='focus'||page==='general')page='main';else if(page==='language')page=languagePreviousPage;else return closeApp();
      paint();
    }else if(a==='focus'){page='focus';paint()}
    else if(a==='general'){page='general';paint()}
    else if(a==='language'){languagePreviousPage=page;page='language';paint()}
    else if(a==='lang'){
      const requested=btn.dataset.lang==='zh'?'zh':'ko';
      try{localStorage.setItem(LANG_SET_KEY,'1')}catch{}
      if(window.IphoneLocale)window.IphoneLocale.setLanguage(requested);
      else{try{localStorage.setItem(LANG_KEY,requested)}catch{}}
      paint();
    }
    else if(a==='dnd'){page='dnd';paint()}
    else if(a==='toggle'){
      const next=!isDnd();
      try{localStorage.setItem(DND_KEY,next?'1':'0')}catch{}
      window.dispatchEvent(new CustomEvent('ios26:dndchange',{detail:{enabled:next}}));
      paint();
    }
  },true);
  window.__IOS26_SETTINGS__={
    get dnd(){return isDnd()},
    get page(){return page},
    showDnd:()=>{page='dnd';if(isSettings())paint()},
    showLanguage:()=>{page='language';if(isSettings())paint()},
    get language(){return currentLanguage()}
  };
})();