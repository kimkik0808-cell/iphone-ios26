/* Website launch notice. Text is configured ONLY in site-notice.json. */
(function siteNotice26(){
  'use strict';
  if(window.__SITE_NOTICE26__) return;
  window.__SITE_NOTICE26__=true;

  const fallback={
    enabled:true,
    title:'업데이트 안내',
    version:'2026.10.21',
    creator:'imsryforyan',
    updates:[
      '설정 앱에 방해금지 모드가 추가되었어요.',
      'Instagram 좋아요와 카카오톡 알림 배너를 구현했어요.',
      'fromm에 새로운 대화와 팬 답장 모음이 추가되었어요.'
    ],
    note:'이 웹사이트는 비공식 팬메이드 인터랙티브 프로젝트입니다.',
    button:'확인하고 시작하기'
  };
  let showing=false;
  let dismissed=false;

  function render(config){
    if(dismissed || !config || config.enabled===false) return;
    if(showing) return;
    showing=true;

    const value=(key,def='')=>typeof config[key]==='string'?config[key]:def;
    const overlay=document.createElement('div');
    overlay.id='site-announcement-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-labelledby','site-announcement-title');
    overlay.setAttribute('aria-describedby','site-announcement-note');
    overlay.innerHTML=
      '<div class="site-announcement-panel">'+
        '<button type="button" class="site-announcement-close" aria-label="닫기">×</button>'+
        '<div class="site-announcement-label">NOTICE</div>'+
        '<h2 id="site-announcement-title" class="site-announcement-title"></h2>'+
        '<div class="site-announcement-version"></div>'+
        '<div class="site-announcement-credit">'+
          '<span class="site-announcement-credit-icon">♥</span>'+
          '<span class="site-announcement-credit-text"><small>제작자 / CREATOR</small><strong></strong></span>'+
        '</div>'+
        '<h3 class="site-announcement-heading">업데이트 내용</h3>'+
        '<ul class="site-announcement-updates"></ul>'+
        '<p class="site-announcement-note" id="site-announcement-note"></p>'+
        '<button type="button" class="site-announcement-enter"></button>'+
      '</div>';

    overlay.querySelector('.site-announcement-title').textContent=value('title','업데이트 안내');
    overlay.querySelector('.site-announcement-version').textContent=value('version');
    overlay.querySelector('.site-announcement-credit-text strong').textContent=value('creator','imsryforyan');
    overlay.querySelector('.site-announcement-note').textContent=value('note');
    overlay.querySelector('.site-announcement-enter').textContent=value('button','확인하고 시작하기');

    const list=overlay.querySelector('.site-announcement-updates');
    const messages=Array.isArray(config.updates)?config.updates.filter(x=>typeof x==='string'&&x.trim()):[];
    for(const entry of messages.slice(0,12)){
      const item=document.createElement('li');
      item.textContent=entry;
      list.appendChild(item);
    }
    if(!messages.length){
      overlay.querySelector('.site-announcement-heading').hidden=true;
      list.hidden=true;
    }

    document.body.appendChild(overlay);
    const priorFocus=document.activeElement;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const exit=()=>{
      dismissed=true;
      showing=false;
      document.body.style.overflow=previousOverflow;
      overlay.remove();
      if(priorFocus && typeof priorFocus.focus==='function' && priorFocus.isConnected)priorFocus.focus();
      document.removeEventListener('keydown',onKey);
    };
    const onKey=event=>{
      if(event.key==='Escape'){
        event.preventDefault();exit();
      }else if(event.key==='Tab'){
        const buttons=[...overlay.querySelectorAll('button')];
        if(!buttons.length)return;
        const first=buttons[0],last=buttons[buttons.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
      }
    };
    overlay.querySelector('.site-announcement-close').addEventListener('click',exit);
    overlay.querySelector('.site-announcement-enter').addEventListener('click',exit);
    document.addEventListener('keydown',onKey);
    overlay.querySelector('.site-announcement-enter').focus();
  }

  const noticeURL=new URL('./site-notice.json',document.baseURI);
  noticeURL.searchParams.set('t',String(Date.now()));
  fetch(noticeURL.href,{cache:'no-store'})
    .then(response=>{if(!response.ok)throw new Error('Notice fetch: '+response.status);return response.json()})
    .then(render)
    .catch(()=>render(fallback));
})();
