'use strict';
/* Node-only smoke test for the bilingual iPhone locale controller.
 * Tests the real locale.js without needing a browser or external dependencies.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

async function main(){
  const code=fs.readFileSync('locales/locale.js','utf8');
  const translations=JSON.parse(fs.readFileSync('locales/ui-zh.json','utf8'));
  const storage=new Map();
  const documentEvents=[];
  const windowEvents=[];
  const html={
    dataset:{},
    setAttribute(k,v){this[k]=v}
  };
  const registered={};
  const doc={
    readyState:'loading',
    documentElement:html,
    addEventListener(k,callback){registered[k]=callback},
    dispatchEvent(e){documentEvents.push(e.type)},
    querySelector(){return null}
  };
  const win={
    dispatchEvent(e){windowEvents.push(e.type)}
  };
  const context={
    document:doc,window:win,
    navigator:{languages:['zh-CN','ko-KR'],language:'zh-CN'},
    localStorage:{
      getItem(k){return storage.get(k)??null},
      setItem(k,v){storage.set(k,String(v))}
    },
    fetch:async()=>({ok:true,json:async()=>translations}),
    requestAnimationFrame:cb=>{cb();return 1},
    MutationObserver:class {observe(){}},
    NodeFilter:{SHOW_ELEMENT:1,SHOW_TEXT:4,FILTER_REJECT:2,FILTER_ACCEPT:1},
    CustomEvent:class {constructor(type,params){this.type=type;this.detail=params?.detail}},
    URL,
    console
  };
  vm.createContext(context);
  vm.runInContext(code,context,{timeout:2000,filename:'locales/locale.js'});
  const lang=win.IphoneLocale;
  assert.ok(lang,'global language controller should exist');
  assert.equal(lang.language,'zh','Chinese browser defaults to Chinese');
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(lang.ready,true,'dictionary loaded');
  assert.ok(lang.dictionarySize>=550,'dictionary must cover all major apps');
  assert.equal(lang.t('캘린더'),'日历');
  assert.equal(lang.t('전화'),'电话');
  assert.equal(lang.t('설정'),'设置');
  assert.equal(lang.t('2026년 10월 21일 수요일'),'2026年10月21日 星期三');
  assert.equal(lang.t('오후 9:14'),'下午9:14');
  assert.equal(lang.t('좋아요 15개'),'15个赞');
  assert.equal(lang.t('댓글 10개 모두 보기'),'查看全部10条评论');
  const observed=[];
  lang.onChange(l=>observed.push(l));
  assert.equal(lang.setLanguage('ko'),'ko');
  assert.equal(lang.t('캘린더'),'캘린더','Korean mode retains original words');
  assert.equal(storage.get('iphone26_ui_language'),'ko');
  assert.equal(lang.setLanguage('zh'),'zh');
  assert.equal(lang.t('캘린더'),'日历','Chinese mode restores translations');
  assert.equal(storage.get('iphone26_ui_language'),'zh');
  assert.deepEqual(observed,['ko','zh']);
  assert.ok(documentEvents.includes('iphone26:languagechange'));
  assert.ok(windowEvents.includes('iphone26:languagechange'));
  console.log('Locale controller OK: 2 languages, '+lang.dictionarySize+' translations, persistence, dynamic counts, round-trip.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
