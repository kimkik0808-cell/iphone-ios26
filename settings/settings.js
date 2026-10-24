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
  let aiDraft=null;
  let aiModels=[];
  let aiStatus='';
  let aiBusy=false;
  let aiShowKey=false;
  const isSettings=()=>typeof mode!=='undefined'&&mode==='settings';
  const isDnd=()=>{try{return localStorage.getItem(DND_KEY)==='1'}catch{return false}};
  const isSilent=()=>window.__IPHONE_SOUND__?.silent===true;
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
    privacy:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M12 2 3.5 5v6c0 5.5 3.5 8.5 8.5 11 5-2.5 8.5-5.5 8.5-11V5L12 2Z"/><path d="M12 8v7m-3-3.5h6" stroke-linecap="round"/></svg>`,
    spark:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2c.7 4.2 2.8 6.3 7 7-4.2.7-6.3 2.8-7 7-.7-4.2-2.8-6.3-7-7 4.2-.7 6.3-2.8 7-7Z"/><path d="M19 15c.3 1.8 1.2 2.7 3 3-1.8.3-2.7 1.2-3 3-.3-1.8-1.2-2.7-3-3 1.8-.3 2.7-1.2 3-3Z"/></svg>`
  };
  const icon=(key,background='#88888d')=>`<span class="ios26-settings-symbol" style="background:${background}">${icons[key]||icons.gear}</span>`;
  const row=(label,key,color,value='',action='placeholder')=>`<button class="ios26-settings-item" data-s26="${action}" data-section="${key}">${icon(key,color)}<span class="ios26-settings-itemlabel">${label}</span><span class="ios26-settings-trail">${value}<span class="ios26-settings-chevron">›</span></span></button>`;
  const group=(children)=>`<section class="ios26-settings-group">${children}</section>`;
  const head=(title,back=false)=>`<header class="ios26-settings-head">${back?`<button class="ios26-settings-back" data-s26="back"><span>‹</span> ${currentLanguage()==='zh'?'设置':'설정'}</button>`:'<div class="ios26-settings-head-end"></div>'}<strong>${title}</strong><div class="ios26-settings-head-end"></div></header>`;
  function main(){
    return `${head('설정')}<main class="ios26-settings-scroll"><h1 class="ios26-settings-title">설정</h1>
    <div class="ios26-settings-search">${icons.search}<span>검색</span></div>
    <button class="ios26-settings-account" data-s26="placeholder" data-section="Apple 계정">
      <div class="ios26-settings-avatar">재</div><span class="ios26-settings-account-text"><strong>이재현</strong><small>Apple 계정, iCloud 및 기타 서비스</small></span><span class="ios26-settings-chevron">›</span>
    </button>
    ${group(row('에어플레인 모드','plane','#ff9e0b','끔')+row('Wi-Fi','wifi','#1685ee','연결됨')+row('Bluetooth','bluetooth','#1685ee','켬')+row('셀룰러','cellular','#34c759'))}
    ${group(row('알림','bell','#ff3b30')+row('사운드 및 햅틱','volume','#ff315e',isSilent()?'무음':'','sound')+row('집중 모드','moon','#675bd5',isDnd()?'방해금지 켬':'끔','focus')+row('스크린 타임','display','#6f62e4'))}
    ${group(row('일반','gear','#858589','','general')+row('언어 및 지역','gear','#858589',currentLanguage()==='zh'?'简体中文':'한국어','language')+row('디스플레이 및 밝기','display','#2688ef')+row('개인정보 보호 및 보안','privacy','#367eeb'))}
    ${group(row(locale('AI 설정','API 设置'),'spark','#5b67d7',window.__IPHONE_AI__?.configured?locale('사용자 API','自定义 API'):locale('공용 Gemini','公共 Gemini'),'ai'))}
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

  function soundPage(){
    const on=isSilent();
    return `${head('사운드 및 햅틱',true)}<main class="ios26-settings-scroll">
      <h1 class="ios26-settings-title">사운드 및 햅틱</h1>
      <section class="ios26-settings-focusstate">
        <span><strong>무음 모드</strong><p>${on?'알림음과 벨소리가 재생되지 않습니다':'알림음과 벨소리를 재생합니다'}</p></span>
        <button class="ios26-settings-switch" type="button" role="switch" aria-label="무음 모드" aria-checked="${on}" data-s26="toggle-silent"><i></i></button>
      </section>
      <p class="ios26-settings-caption">무음 모드는 문자 메시지 카카오톡 알림과 전화 벨소리에 적용됩니다</p>
      <p class="ios26-settings-caption">음악과 통화 음량에는 영향을 주지 않습니다</p>
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
  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function loadAiDraft(force=false){
    if(aiDraft&&!force)return;
    aiDraft={...(window.__IPHONE_AI__?.active||window.__IPHONE_AI__?.blank?.()||{id:'ai-'+Date.now(),name:'OpenAI',endpoint:'',apiKey:'',model:'',temperature:.7,maxTokens:''})};
  }
  function aiPage(){
    loadAiDraft();
    const profiles=window.__IPHONE_AI__?.profiles||[];
    const source=window.__IPHONE_AI__?.configured?locale('현재 사용자 API 사용 중','当前使用自定义 API'):locale('API 미설정 시 공용 Gemini를 사용합니다','未配置时使用公共 Gemini');
    const options=profiles.length?profiles.map(item=>`<option value="${safe(item.id)}" ${item.id===aiDraft.id?'selected':''}>${safe(item.name)}</option>`).join(''):`<option value="${safe(aiDraft.id)}">${safe(aiDraft.name||'OpenAI')}</option>`;
    const modelOptions=aiModels.map(item=>`<option value="${safe(item)}"></option>`).join('');
    return `${head(locale('AI 설정','API 设置'),true)}<main class="ios26-settings-scroll ios26-ai-scroll">
      <h1 class="ios26-settings-title">${locale('AI 설정','API 设置')}</h1>
      <section class="ios26-ai-presets"><div class="ios26-ai-sectionhead"><strong>${locale('사전 설정','预设配置')}</strong><span><button data-s26="ai-new" aria-label="${locale('추가','新增')}">＋</button><button class="danger" data-s26="ai-delete" aria-label="${locale('삭제','删除')}">⌫</button></span></div><select id="s26-ai-profile">${options}</select><label>${locale('설정 이름','配置名称')}<input id="s26-ai-name" value="${safe(aiDraft.name)}" maxlength="40"></label></section>
      <p class="ios26-ai-state">${safe(source)}${aiStatus?`<br><b>${safe(aiStatus)}</b>`:''}</p>
      <label class="ios26-ai-field"><span>API ${locale('주소','地址')} (Endpoint)</span><input id="s26-ai-endpoint" inputmode="url" autocapitalize="none" autocomplete="off" placeholder="https://api.openai.com/v1" value="${safe(aiDraft.endpoint)}"></label>
      <label class="ios26-ai-field"><span>API ${locale('키','密钥')} (API Key)</span><div class="ios26-ai-secret"><input id="s26-ai-key" type="${aiShowKey?'text':'password'}" autocapitalize="none" autocomplete="off" value="${safe(aiDraft.apiKey)}"><button type="button" data-s26="ai-key">${aiShowKey?'◉':'◎'}</button></div></label>
      <label class="ios26-ai-field"><span>${locale('모델','模型')} (Model)</span><div class="ios26-ai-model"><input id="s26-ai-model" list="s26-ai-models" autocapitalize="none" autocomplete="off" value="${safe(aiDraft.model)}"><button type="button" data-s26="ai-models" ${aiBusy?'disabled':''}>↻</button></div><datalist id="s26-ai-models">${modelOptions}</datalist></label>
      <label class="ios26-ai-field ios26-ai-range"><span>Temperature <b id="s26-ai-temp-value">${Number(aiDraft.temperature??.7).toFixed(1)}</b></span><input id="s26-ai-temperature" type="range" min="0" max="2" step="0.1" value="${safe(aiDraft.temperature??.7)}"></label>
      <label class="ios26-ai-field"><span>${locale('최대 출력 Tokens 선택 사항','最大输出 Tokens 可选')}</span><input id="s26-ai-tokens" type="number" inputmode="numeric" min="8" max="8192" placeholder="${locale('비워 두면 서비스 기본값 사용','留空则使用服务默认值')}" value="${safe(aiDraft.maxTokens)}"></label>
      <p class="ios26-settings-caption ios26-ai-note">${locale('API 키는 이 브라우저에만 저장됩니다 사용자 API는 카카오톡 비剧情智能回复와 Instagram 비공개 계정 연락처 답장에만 적용됩니다','API Key 仅保存在当前浏览器 自定义 API 只用于 KakaoTalk 非剧情智能回复和 Instagram 小号联系人回复')}</p>
      <div class="ios26-ai-actions"><button data-s26="ai-test" ${aiBusy?'disabled':''}>${aiBusy?locale('확인 중','正在测试'):locale('연결 테스트','测试连接')}</button><button class="primary" data-s26="ai-save">${locale('설정 저장','保存配置')}</button></div>
    </main>`;
  }
  function paint(){
    if(!isSettings())return;
    appEl.className='layer appscreen active ios26-settings-bg';
    appEl.style.display='block';
    status?.classList.add('dark');
    gesture?.classList.add('ink');
    frame.style.overflow='hidden';
    frame.style.bottom='calc(var(--safe-bottom) + 28px)';
    frame.innerHTML=`<div class="ios26-settings-root">${page==='ai'?aiPage():page==='language'?languagePage():page==='general'?generalPage():page==='sound'?soundPage():page==='dnd'?dnd():page==='focus'?focus():main()}</div>`;
  }
  const oldOpenApp=openApp;
  openApp=function(next,...args){
    if(next==='settings'){page='main';aiDraft=null;aiStatus='';aiBusy=false}
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
      else if(page==='focus'||page==='general'||page==='sound'||page==='ai')page='main';
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
      if(page==='dnd')page='focus';else if(page==='focus'||page==='general'||page==='sound'||page==='ai')page='main';else if(page==='language')page=languagePreviousPage;else return closeApp();
      paint();
    }else if(a==='focus'){page='focus';paint()}
    else if(a==='sound'){page='sound';paint()}
    else if(a==='general'){page='general';paint()}
    else if(a==='ai'){aiDraft=null;aiModels=[];aiStatus='';page='ai';paint()}
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
    else if(a==='toggle-silent'){
      window.__IPHONE_SOUND__?.setSilent(!isSilent());
      paint();
    }
    else if(a==='ai-new'){
      aiDraft=window.__IPHONE_AI__?.blank?.()||{id:'ai-'+Date.now(),name:'OpenAI',endpoint:'',apiKey:'',model:'',temperature:.7,maxTokens:''};aiModels=[];aiStatus='';paint();
    }
    else if(a==='ai-delete'){
      if(aiDraft?.id)window.__IPHONE_AI__?.remove?.(aiDraft.id);
      aiDraft=null;aiModels=[];aiStatus=locale('설정을 삭제했습니다','已删除配置');paint();
    }
    else if(a==='ai-key'){syncAiDraft();aiShowKey=!aiShowKey;paint()}
    else if(a==='ai-save'){
      syncAiDraft();
      if(!aiDraft.endpoint||!aiDraft.apiKey||!aiDraft.model){aiStatus=locale('Endpoint API Key 모델을 모두 입력해 주세요','请填写 Endpoint API Key 和模型');paint();return}
      aiDraft=window.__IPHONE_AI__?.save?.(aiDraft)||aiDraft;aiStatus=locale('설정을 저장했습니다','配置已保存');paint();
    }
    else if(a==='ai-models'){
      syncAiDraft();aiBusy=true;aiStatus=locale('모델 목록을 불러오는 중','正在读取模型列表');paint();
      window.__IPHONE_AI__?.models?.(aiDraft).then(list=>{aiModels=list;aiStatus=list.length?locale('모델 목록을 불러왔습니다','模型列表已加载'):locale('목록이 비어 있습니다 모델명을 직접 입력하세요','列表为空 请手动填写模型名称')}).catch(error=>{aiStatus=aiErrorText(error)}).finally(()=>{aiBusy=false;if(isSettings()&&page==='ai')paint()});
    }
    else if(a==='ai-test'){
      syncAiDraft();
      if(!aiDraft.endpoint||!aiDraft.apiKey||!aiDraft.model){aiStatus=locale('Endpoint API Key 모델을 모두 입력해 주세요','请填写 Endpoint API Key 和模型');paint();return}
      aiBusy=true;aiStatus=locale('연결을 확인하는 중','正在测试连接');paint();
      window.__IPHONE_AI__?.test?.(aiDraft).then(()=>{aiStatus=locale('연결에 성공했습니다','连接成功')}).catch(error=>{aiStatus=aiErrorText(error)}).finally(()=>{aiBusy=false;if(isSettings()&&page==='ai')paint()});
    }
  },true);
  function syncAiDraft(){
    if(!aiDraft)return;
    const value=id=>document.querySelector(id)?.value??'';
    aiDraft.name=value('#s26-ai-name')||aiDraft.name||'OpenAI';aiDraft.endpoint=value('#s26-ai-endpoint').trim();aiDraft.apiKey=value('#s26-ai-key').trim();aiDraft.model=value('#s26-ai-model').trim();aiDraft.temperature=Number(value('#s26-ai-temperature')||.7);aiDraft.maxTokens=value('#s26-ai-tokens').replace(/\D/g,'');
  }
  function aiErrorText(error){
    const code=String(error?.message||'request_failed');
    const map={key_or_region_error:["API 키 또는 권한을 확인해 주세요","请检查 API Key 或权限"],quota_exceeded:["API 사용 한도에 도달했습니다","API 额度已用尽"],model_unavailable:["모델 이름 또는 Endpoint를 확인해 주세요","请检查模型名称或 Endpoint"],upstream_timeout:["응답 시간이 초과되었습니다","请求超时"],upstream_network:["API 서비스에 연결할 수 없습니다","无法连接 API 服务"],invalid_configuration:["Endpoint 형식을 확인해 주세요","请检查 Endpoint 格式"],backend_missing:["Cloudflare API가 아직 배포되지 않았습니다","Cloudflare API 尚未部署"]};
    return (map[code]||["연결에 실패했습니다 설정을 확인해 주세요","连接失败 请检查配置"])[currentLanguage()==='zh'?1:0];
  }
  frame.addEventListener('input',e=>{
    if(!isSettings()||page!=='ai')return;
    if(e.target.id==='s26-ai-temperature'){if(aiDraft)aiDraft.temperature=Number(e.target.value);const out=document.querySelector('#s26-ai-temp-value');if(out)out.textContent=Number(e.target.value).toFixed(1)}
  },true);
  frame.addEventListener('change',e=>{
    if(!isSettings()||page!=='ai'||e.target.id!=='s26-ai-profile')return;
    syncAiDraft();window.__IPHONE_AI__?.select?.(e.target.value);aiDraft={...(window.__IPHONE_AI__?.active||aiDraft)};aiModels=[];aiStatus='';paint();
  },true);
  window.__IOS26_SETTINGS__={
    get dnd(){return isDnd()},
    get page(){return page},
    showDnd:()=>{page='dnd';if(isSettings())paint()},
    showSound:()=>{page='sound';if(isSettings())paint()},
    showLanguage:()=>{page='language';if(isSettings())paint()},
    showAI:()=>{page='ai';aiDraft=null;if(isSettings())paint()},
    get language(){return currentLanguage()}
  };
})();
