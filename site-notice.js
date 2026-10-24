/* Startup announcement: content is maintained in site-notice.json (zh / ko). */
(function siteNotice26(){
  'use strict';
  if(window.__SITE_NOTICE26__)return;
  window.__SITE_NOTICE26__=true;

  const fallback={
    "enabled": true,
    "version": "2026.10.24 · 01",
    "zh": {
      "title": "更新公告",
      "updatesTitle": "本次更新内容",
      "updates": [
        "支持用户自行接入 API",
        "以韩文版为基础完善全站中文翻译，修复部分页面语言混杂的问题",
        "完善备忘录的中韩双语显示、搜索及编辑功能",
        "提升 M4A 及中文文件名音乐的播放兼容性，修复专辑图片无法显示的问题"
      ],
      "historyButton": "查看历史公告",
      "hideHistoryButton": "收起历史公告",
      "historyTitle": "历史公告",
      "contact": "遇到问题请联系微博/抖音：淹到你了很抱歉",
      "button": "知道了，开始体验",
      "help": "看不到最新更新？请先在 Safari 无痕浏览中打开网站确认。若无痕模式仍是旧版，请等待网站完成部署；必要时再清除该网站的缓存和数据（这会重置已保存的聊天进度及设置）。"
    },
    "ko": {
      "title": "업데이트 안내",
      "updatesTitle": "이번 업데이트",
      "updates": [
        "사용자가 직접 API를 연결할 수 있도록 지원해요",
        "한국어 버전을 기준으로 전체 중국어 번역을 개선하고 일부 화면에서 언어가 섞여 표시되던 문제를 수정했어요",
        "메모 앱의 한중 이중 언어 표시 검색 및 편집 기능을 개선했어요",
        "M4A 및 중국어 파일명 음악의 재생 호환성을 높이고 앨범 이미지가 표시되지 않던 문제를 수정했어요"
      ],
      "historyButton": "지난 업데이트 보기",
      "hideHistoryButton": "지난 업데이트 접기",
      "historyTitle": "지난 업데이트",
      "contact": "문제가 있다면 웨이보/더우인 ‘淹到你了很抱歉’ 계정으로 문의해 주세요.",
      "button": "확인하고 시작하기",
      "help": "최신 업데이트가 보이지 않나요? 먼저 Safari 개인정보 보호 브라우징에서 열어 확인해 주세요. 그래도 이전 버전이라면 배포가 완료될 때까지 기다려 주세요. 사이트 데이터를 삭제하면 저장된 대화 진행 상황과 설정이 초기화될 수 있어요."
    },
    "history": [
      {
        "version": "2026.10.22 · 01",
        "zh": {
          "title": "上一次更新",
          "updatesTitle": "更新内容",
          "updates": [
            "修复语音留言加载问题。",
            "在「设置 → 通用 → 语言与地区」中切换中文／韩语。",
            "开启勿扰模式后，将停止显示消息通知弹窗。",
            "KakaoTalk 新增可自主输入的聊天回复，并修复消息弹窗显示异常。",
            "更新 KakaoTalk「陌生聊天」消息内容，消息会随通知逐条出现。"
          ]
        },
        "ko": {
          "title": "이전 업데이트",
          "updatesTitle": "업데이트 내용",
          "updates": [
            "음성 사서함 메시지가 로딩되지 않던 문제를 수정했어요.",
            "설정 → 일반 → 언어 및 지역에서 한국어와 중국어를 변경할 수 있어요.",
            "방해금지 모드를 켜면 메시지 알림 배너가 표시되지 않아요.",
            "카카오톡에 자유 입력 대화 응답 기능을 추가하고 메시지 팝업 표시 오류를 수정했어요.",
            "카카오톡 ‘알 수 없는 채팅’의 메시지 내용을 업데이트했어요. 알림이 올 때마다 하나씩 표시돼요."
          ]
        }
      }
    ]
  };
  const choiceKey='iphone26_notice_language_v1';
  let showing=false,dismissed=false;

  function browserLanguage(){
    try{
      // Notice language is independent of the iPhone language in Settings.
      const saved=localStorage.getItem(choiceKey);
      if(saved==='zh'||saved==='ko')return saved;
    }catch{}
    return 'ko';
  }
  const toText=(value,defaultText='')=>typeof value==='string'?value:defaultText;

  function render(config){
    if(dismissed||showing||!config||config.enabled===false)return;
    showing=true;
    let historyExpanded=false;

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
        '<button type="button" class="site-announcement-history-toggle" aria-expanded="false"></button>'+
        '<div class="site-announcement-history" hidden></div>'+
        '<p class="site-announcement-help" id="site-announcement-help"></p>'+
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
      overlay.querySelector('.site-announcement-help').textContent=
        toText(data.help, fallback[lang].help);
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

      const historyRecords=Array.isArray(config.history)?config.history:[];
      const historyButton=overlay.querySelector('.site-announcement-history-toggle');
      const historyBox=overlay.querySelector('.site-announcement-history');
      historyButton.hidden=!historyRecords.length;
      historyButton.textContent=historyExpanded
        ?toText(data.hideHistoryButton,lang==='zh'?'收起历史公告':'지난 업데이트 접기')
        :toText(data.historyButton,lang==='zh'?'查看历史公告':'지난 업데이트 보기');
      historyButton.setAttribute('aria-expanded',String(historyExpanded));
      historyBox.hidden=!historyExpanded||!historyRecords.length;
      historyBox.replaceChildren();
      if(historyExpanded){
        const sectionTitle=document.createElement('h3');
        sectionTitle.className='site-announcement-history-title';
        sectionTitle.textContent=toText(data.historyTitle,lang==='zh'?'历史公告':'지난 업데이트');
        historyBox.appendChild(sectionTitle);
        for(const record of historyRecords){
          if(!record||typeof record!=='object')continue;
          const recordData=record[lang]&&typeof record[lang]==='object'?record[lang]:record;
          const article=document.createElement('article');
          article.className='site-announcement-history-card';
          const header=document.createElement('div');
          header.className='site-announcement-history-head';
          const name=document.createElement('strong');
          name.textContent=toText(record.version);
          header.appendChild(name);
          const recordList=document.createElement('ul');
          recordList.className='site-announcement-history-list';
          const recordLines=Array.isArray(recordData.updates)?recordData.updates.filter(x=>typeof x==='string'&&x.trim()):[];
          for(const entry of recordLines.slice(0,12)){
            const item=document.createElement('li');
            item.textContent=entry;
            recordList.appendChild(item);
          }
          article.append(header,recordList);
          historyBox.appendChild(article);
        }
      }
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
        // This changes the announcement only, not the simulated phone UI.
        setLanguage(language);
      });
    });
    overlay.querySelector('.site-announcement-history-toggle').addEventListener('click',()=>{
      historyExpanded=!historyExpanded;
      setLanguage(language);
      if(historyExpanded)overlay.querySelector('.site-announcement-history').scrollIntoView({block:'nearest'});
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
