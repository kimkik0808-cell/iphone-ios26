/* Startup announcement: content is maintained in site-notice.json (zh / ko). */
(function siteNotice26(){
  'use strict';
  if(window.__SITE_NOTICE26__)return;
  window.__SITE_NOTICE26__=true;

  const fallback={
    enabled:true,version:'2026.10.21',
    zh:{
      title:'更新公告',
      updatesTitle:'本次更新内容',
      updates:[
        '修复语音留言加载问题。',
        '在「设置 → 通用 → 语言与地区」中切换中文／韩语。',
        '开启勿扰模式后，将停止显示消息通知弹窗。'
      ],
      contact:'遇到问题请联系微博：淹到你了很抱歉',
      button:'知道了，开始体验'
    },
    ko:{
      title:'업데이트 안내',
      updatesTitle:'업데이트 내용',
      updates:[
        '음성 사서함 메시지가 로딩되지 않던 문제를 수정했어요.',
        '설정 → 일반 → 언어 및 지역에서 한국어와 중국어를 변경할 수 있어요.',
        '방해금지 모드를 켜면 메시지 알림 배너가 표시되지 않아요.'
      ],
      contact:'문제가 있다면 웨이보 ‘淹到你了很抱歉’ 계정으로 문의해 주세요.',
      button:'확인하고 시작하기'
    }
  };
  const choiceKey='iphone26_ui_language';
  let showing=false,dismissed=false;

  function browserLanguage(){
    if(window.IphoneLocale?.language==='zh'||window.IphoneLocale?.language==='ko')
      return window.IphoneLocale.language;
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
        '<h3 class="site-announcement-heading"></h3>'+
        '<ul class="site-announcement-updates"></ul>'+
        '<p class="site-announcement-contact" id="site-announcement-note"></p>'+
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
      overlay.querySelector('.site-announcement-heading').textContent=
        toText(data.updatesTitle,lang==='zh'?'本次更新内容':'업데이트 내용');
      overlay.querySelector('.site-announcement-contact').textContent=
        toText(data.contact,lang==='zh'?'遇到问题请联系微博：淹到你了很抱歉':'문제가 있다면 웨이보 ‘淹到你了很抱歉’ 계정으로 문의해 주세요.');
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
        if(window.IphoneLocale) window.IphoneLocale.setLanguage(language);
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
