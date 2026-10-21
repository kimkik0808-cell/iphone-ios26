/* Startup announcement: content is maintained in site-notice.json (zh / ko). */
(function siteNotice26(){
  'use strict';
  if(window.__SITE_NOTICE26__)return;
  window.__SITE_NOTICE26__=true;

  const fallback={
    enabled:true,version:'2026.10.21',creator:'imsryforyan',
    zh:{
      title:'更新公告',creatorLabel:'创作者 / CREATOR',
      updatesTitle:'本次更新内容',
      updates:['设置 App 已加入勿扰模式，可控制消息通知。',
        'Instagram 点赞与 KakaoTalk 消息会以 iOS 风格横幅显示。',
        'fromm 新增互动聊天和粉丝回复合集。'],
      note:'本站为非官方粉丝制作的互动体验，模拟手机内部界面仍以韩语呈现。',
      button:'知道了，开始体验'
    },
    ko:{
      title:'업데이트 안내',creatorLabel:'제작자 / CREATOR',
      updatesTitle:'업데이트 내용',
      updates:['설정 앱에 방해금지 모드가 추가되어 알림 배너를 제어할 수 있어요.',
        'Instagram 좋아요와 카카오톡 메시지가 iOS 스타일 배너로 표시돼요.',
        'fromm에 새로운 대화와 팬 답장 모음이 추가되었어요.'],
      note:'이 웹사이트는 비공식 팬메이드 인터랙티브 프로젝트입니다. 가상 iPhone의 시스템 언어는 한국어입니다.',
      button:'확인하고 시작하기'
    }
  };
  const choiceKey='iphone26_notice_language';
  let showing=false,dismissed=false;

  function browserLanguage(){
    try{
      const saved=localStorage.getItem(choiceKey);
      if(saved==='zh'||saved==='ko')return saved;
    }catch{}
    const languages=Array.isArray(navigator.languages)&&navigator.languages.length
      ? navigator.languages:[navigator.language||'ko'];
    const first=String(languages[0]||'ko').toLowerCase();
    return first.startsWith('zh')?'zh':'ko';
  }
  const toText=(value,defaultText='')=>typeof value==='string'?value:defaultText;

  function render(config){
    if(dismissed||showing||!config||config.enabled===false)return;
    showing=true;

    const overlay=document.createElement('div');
    overlay.id='site-announcement-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-labelledby','site-announcement-title');
    overlay.setAttribute('aria-describedby','site-announcement-note');
    overlay.innerHTML=
      '<div class="site-announcement-panel">'+
        '<button type="button" class="site-announcement-close" aria-label="닫기">×</button>'+
        '<div class="site-announcement-top">'+
          '<div class="site-announcement-label">NOTICE</div>'+
          '<div class="site-announcement-languages" role="group" aria-label="Language / 언어 / 语言">'+
            '<button type="button" data-language="zh" lang="zh-CN">中文</button>'+
            '<button type="button" data-language="ko" lang="ko">한국어</button>'+
          '</div>'+
        '</div>'+
        '<h2 id="site-announcement-title" class="site-announcement-title"></h2>'+
        '<div class="site-announcement-version"></div>'+
        '<div class="site-announcement-credit">'+
          '<span class="site-announcement-credit-icon">♥</span>'+
          '<span class="site-announcement-credit-text"><small></small><strong></strong></span>'+
        '</div>'+
        '<h3 class="site-announcement-heading"></h3>'+
        '<ul class="site-announcement-updates"></ul>'+
        '<p class="site-announcement-note" id="site-announcement-note"></p>'+
        '<button type="button" class="site-announcement-enter"></button>'+
      '</div>';

    const textFor=(language)=>{
      const localContent=config[language];
      if(localContent&&typeof localContent==='object'&&!Array.isArray(localContent))
        return localContent;
      // Backwards compatibility with old single-language notices.
      if(typeof config.title==='string')return config;
      return fallback[language];
    };
    const setLanguage=(language)=>{
      const lang=language==='zh'?'zh':'ko';
      const data=textFor(lang);
      overlay.lang=lang==='zh'?'zh-CN':'ko';
      overlay.querySelector('.site-announcement-title').textContent=
        toText(data.title,lang==='zh'?'更新公告':'업데이트 안내');
      overlay.querySelector('.site-announcement-version').textContent=toText(config.version);
      overlay.querySelector('.site-announcement-credit-text small').textContent=
        toText(data.creatorLabel,lang==='zh'?'创作者 / CREATOR':'제작자 / CREATOR');
      overlay.querySelector('.site-announcement-credit-text strong').textContent=
        toText(config.creator,'imsryforyan');
      overlay.querySelector('.site-announcement-heading').textContent=
        toText(data.updatesTitle,lang==='zh'?'本次更新内容':'업데이트 내용');
      overlay.querySelector('.site-announcement-note').textContent=toText(data.note);
      overlay.querySelector('.site-announcement-enter').textContent=
        toText(data.button,lang==='zh'?'知道了，开始体验':'확인하고 시작하기');
      overlay.querySelector('.site-announcement-close').setAttribute('aria-label',
        lang==='zh'?'关闭':'닫기');

      const list=overlay.querySelector('.site-announcement-updates');
      list.replaceChildren();
      const lines=Array.isArray(data.updates)?data.updates.filter(x=>typeof x==='string'&&x.trim()):[];
      for(const entry of lines.slice(0,12)){
        const item=document.createElement('li');
        item.textContent=entry;
        list.appendChild(item);
      }
      overlay.querySelector('.site-announcement-heading').hidden=!lines.length;
      list.hidden=!lines.length;
      overlay.querySelectorAll('[data-language]').forEach(button=>{
        const selected=button.dataset.language===lang;
        button.classList.toggle('active',selected);
        button.setAttribute('aria-pressed',String(selected));
      });
      try{localStorage.setItem(choiceKey,lang)}catch{}
    };

    const priorFocus=document.activeElement;
    const previousOverflow=document.body.style.overflow;
    document.body.appendChild(overlay);
    document.body.style.overflow='hidden';

    let language=browserLanguage();
    setLanguage(language);

    const exit=()=>{
      dismissed=true;showing=false;
      document.body.style.overflow=previousOverflow;
      overlay.remove();
      document.removeEventListener('keydown',onKey);
      if(priorFocus&&priorFocus.isConnected&&typeof priorFocus.focus==='function')
        priorFocus.focus();
    };
    const onKey=event=>{
      if(event.key==='Escape'){event.preventDefault();exit();return;}
      if(event.key==='Tab'){
        const buttons=[...overlay.querySelectorAll('button:not([disabled])')];
        const first=buttons[0],last=buttons[buttons.length-1];
        if(event.shiftKey&&document.activeElement===first){
          event.preventDefault();last.focus();
        }else if(!event.shiftKey&&document.activeElement===last){
          event.preventDefault();first.focus();
        }
      }
    };
    overlay.querySelectorAll('[data-language]').forEach(button=>{
      button.addEventListener('click',()=>{
        language=button.dataset.language==='zh'?'zh':'ko';
        setLanguage(language);
      });
    });
    overlay.querySelector('.site-announcement-close').addEventListener('click',exit);
    overlay.querySelector('.site-announcement-enter').addEventListener('click',exit);
    document.addEventListener('keydown',onKey);
    overlay.querySelector('.site-announcement-enter').focus();

    window.__SITE_NOTICE26_DIAG__={
      get language(){return language},
      get showing(){return showing},
      switchTo:setLanguage
    };
  }

  const noticeURL=new URL('./site-notice.json',document.baseURI);
  noticeURL.searchParams.set('t',String(Date.now()));
  fetch(noticeURL.href,{cache:'no-store'})
    .then(response=>{if(!response.ok)throw new Error('Notice fetch '+response.status);return response.json()})
    .then(render)
    .catch(()=>render(fallback));
})();
