/* Shared Korean / Simplified Chinese localization for the simulated iPhone.
 * Dictionary: ./locales/ui-zh.json.  Changes do not rewrite stored messages.
 */
(function iphone26Locale() {
  'use strict';
  if (window.IphoneLocale) return;

  const KEY='iphone26_ui_language';
  function selectedLanguage() {
    try {
      const saved=localStorage.getItem(KEY);
      if(saved==='ko'||saved==='zh')return saved;
    } catch {}
    const languages=Array.isArray(navigator.languages)&&navigator.languages.length
      ?navigator.languages:[navigator.language||'ko'];
    return /^zh\b/i.test(languages[0]||'')?'zh':'ko';
  }

  let language=selectedLanguage();
  let dict={};
  let dictionaryReady=false;
  const originalText=new WeakMap();
  const originalAttribute=new WeakMap();
  const listeners=new Set();
  const tracked=new Set();
  let scanning=false;
  let scheduled=false;

  const SKIP='script,style,code,pre,[contenteditable],[data-no-translate],#site-announcement-overlay';
  const SKIP_TEXT='textarea,input,select,option';
  const trackedAttributes=['placeholder','title','aria-label','alt'];

  function translateString(input) {
    if(typeof input!=='string'||language!=='zh')return input;
    const matched=input.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const core=matched?matched[2]:input;
    if(Object.prototype.hasOwnProperty.call(dict,core))
      return (matched?matched[1]:'')+dict[core]+(matched?matched[3]:'');
    let output=core;
    // Dynamic Korean dates, weekday labels and numeric counters.
    const weekday={'일요일':'星期日','월요일':'星期一','화요일':'星期二',
      '수요일':'星期三','목요일':'星期四','금요일':'星期五','토요일':'星期六'};
    output=output.replace(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(일요일|월요일|화요일|수요일|목요일|금요일|토요일)?/g,
      (_,y,m,d,day)=>y+'年'+m+'月'+d+'日'+(day?' '+weekday[day]:''));
    output=output.replace(/(\d{1,2})월\s*(\d{1,2})일(?:\s*(일요일|월요일|화요일|수요일|목요일|금요일|토요일))?/g,
      (_,m,d,day)=>m+'月'+d+'日'+(day?' '+weekday[day]:''));
    output=output.replace(/\b(오전|오후)\s*(\d{1,2}:\d{2})/g,(_,ampm,time)=>(ampm==='오전'?'上午':'下午')+time);
    output=output.replace(/(\d+)개 모두 보기/g,'查看全部$1条');
    output=output.replace(/(\d+)개/g,'$1条');
    output=output.replace(/(\d+)곡/g,'$1首');
    output=output.replace(/(\d+)명/g,'$1人');
    output=output.replace(/(\d+)시간 전/g,'$1小时前');
    output=output.replace(/(\d+)분 전/g,'$1分钟前');
    output=output.replace(/(\d+)일 전/g,'$1天前');
    output=output.replace(/(\d+)명(?:이|이 회원님의 게시물을 좋아합니다\.)/g,'$1人赞了你的帖子。');
    if(Object.prototype.hasOwnProperty.call(weekday,output))output=weekday[output];
    // Compact composite labels from counts, without touching user handles.
    output=output.replace(/^답장\s*(\d+)개$/,'$1条回复');
    output=output.replace(/^사진\s*(\d+)장$/,'$1张照片');
    output=output.replace(/^(\d+)개\s*›$/,'$1条 ›');
    output=output.replace(/^(\d+)곡\s*›$/,'$1首 ›');
    if(Object.prototype.hasOwnProperty.call(dict,output))output=dict[output];
    return (matched?matched[1]:'')+output+(matched?matched[3]:'');
  }

  function ignored(node){
    const element=node.nodeType===1?node:node.parentElement;
    if(!element)return true;
    return !!element.closest(SKIP) ||
      (node.nodeType===3 && !!element.closest(SKIP_TEXT));
  }
  function translateTextNode(node) {
    if(node.nodeType!==3||ignored(node))return;
    const actual=node.nodeValue;
    let record=originalText.get(node);
    if(!record||record.last!==actual){
      record={original:actual,last:actual};
      originalText.set(node,record);
    }
    const next=language==='zh'?translateString(record.original):record.original;
    if(actual!==next){
      record.last=next;
      node.nodeValue=next;
    }
  }
  function translateAttributes(element) {
    if(ignored(element))return;
    let map=originalAttribute.get(element);
    if(!map){map=new Map();originalAttribute.set(element,map)}
    for(const attr of trackedAttributes){
      if(!element.hasAttribute(attr))continue;
      const actual=element.getAttribute(attr);
      let record=map.get(attr);
      if(!record||record.last!==actual){
        record={original:actual,last:actual};
        map.set(attr,record);
      }
      const next=language==='zh'?translateString(record.original):record.original;
      if(actual!==next){
        record.last=next;
        element.setAttribute(attr,next);
      }
    }
  }
  function scan(root){
    if(!root)return;
    if(root.nodeType===3){translateTextNode(root);return}
    if(root.nodeType!==1||ignored(root))return;
    translateAttributes(root);
    const iterator=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{
      acceptNode(n){return ignored(n)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}
    });
    let current;
    while((current=iterator.nextNode())){
      if(current.nodeType===3)translateTextNode(current);
      else translateAttributes(current);
    }
  }
  function apply(){
    if(scanning)return;
    scanning=true;
    try {
      document.documentElement.dataset.simLanguage=language;
      // Keep lang on the simulated phone; startup announcement manages its own language.
      document.documentElement.setAttribute('lang',language==='zh'?'zh-CN':'ko');
      for(const root of ['#device','#maker-credits-link']){
        const element=document.querySelector(root);
        if(element)scan(element);
      }
    }finally{scanning=false}
  }
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      apply();
    });
  }
  function setLanguage(next){
    const normalized=next==='zh'?'zh':'ko';
    const changed=normalized!==language;
    language=normalized;
    try{localStorage.setItem(KEY,language)}catch{}
    apply();
    if(changed){
      // Native apps already have render() handlers for rerendering current contents.
      try {
        if(typeof drawIcons==='function')drawIcons();
        if(typeof render==='function' && typeof mode!=='undefined' && mode!=='home')render();
      } catch(err){console.warn('iPhone locale rerender:',err)}
      document.dispatchEvent(new CustomEvent('iphone26:languagechange',{detail:{language}}));
      window.dispatchEvent(new CustomEvent('iphone26:languagechange',{detail:{language}}));
      for(const callback of listeners){
        try{callback(language)}catch{}
      }
    }
    schedule();
    return language;
  }

  function onChange(callback) {
    if(typeof callback!=='function')return ()=>{};
    listeners.add(callback);
    return ()=>listeners.delete(callback);
  }

  window.IphoneLocale={
    get language(){return language},
    get ready(){return dictionaryReady},
    get dictionarySize(){return Object.keys(dict).length},
    t:translateString,
    setLanguage,
    onChange,
    apply,
    get userLanguage(){return language}
  };

  const observer=new MutationObserver(changes=>{
    if(scanning)return;
    for(const change of changes){
      if(change.target&&
        ((change.target.nodeType===1&&change.target.closest('#device'))||
         (change.target.parentElement&&change.target.parentElement.closest('#device')))){
        schedule();
        return;
      }
    }
  });
  const observe=()=>{
    const root=document.querySelector('#device');
    if(root){
      observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,
        attributeFilter:trackedAttributes});
    }
    apply();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});
  else observe();

  const url=new URL('./locales/ui-zh.json',document.baseURI);
  fetch(url,{cache:'no-store'})
    .then(r=>{if(!r.ok)throw Error('Locale dictionary '+r.status);return r.json()})
    .then(data=>{
      if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Invalid locale file');
      dict=data;
      dictionaryReady=true;
      // If the dictionary arrived after a partial first scan, invalidate the cache
      // by using the preserved original for each existing text node.
      apply();
    })
    .catch(err=>console.warn('iPhone Chinese dictionary unavailable:',err));
})();