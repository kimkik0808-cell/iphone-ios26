(function iphone26UserAI(){
  'use strict';
  if(window.__IPHONE_AI__)return;
  const STORAGE_KEY='iphone26_user_ai_profiles_v1';
  const RELAY=()=>location.hostname==='nuyheaj.pages.dev'?'/api/user-ai':'https://nuyheaj.pages.dev/api/user-ai';
  const blank=()=>({id:'ai-'+Date.now().toString(36),name:'OpenAI',endpoint:'',apiKey:'',model:'',temperature:.7,maxTokens:''});
  const clamp=(value,min,max,fallback)=>{const n=Number(value);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback};
  const normalize=profile=>({
    id:String(profile?.id||blank().id).slice(0,80),
    name:String(profile?.name||'OpenAI').trim().slice(0,40)||'OpenAI',
    endpoint:String(profile?.endpoint||'').trim().slice(0,500),
    apiKey:String(profile?.apiKey||'').trim().slice(0,1000),
    model:String(profile?.model||'').trim().slice(0,160),
    temperature:clamp(profile?.temperature,0,2,.7),
    maxTokens:String(profile?.maxTokens||'').replace(/\D/g,'').slice(0,6)
  });
  function load(){
    try{
      const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(parsed&&Array.isArray(parsed.profiles))return {activeId:String(parsed.activeId||''),profiles:parsed.profiles.map(normalize)};
    }catch{}
    return {activeId:'',profiles:[]};
  }
  let state=load();
  const persist=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}};
  const active=()=>state.profiles.find(item=>item.id===state.activeId)||state.profiles[0]||null;
  const complete=profile=>!!(profile?.endpoint&&profile?.apiKey&&profile?.model);
  async function relay(payload,timeoutMs=26000){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      const response=await fetch(RELAY(),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
      const type=response.headers.get('content-type')||'';
      if(!type.includes('application/json'))throw new Error(response.status===404?'backend_missing':'backend_unavailable');
      const result=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(result.error||'request_failed');
      return result;
    }catch(error){
      if(controller.signal.aborted)throw new Error('upstream_timeout');
      throw error;
    }finally{clearTimeout(timer)}
  }
  async function chat(options={}){
    const profile=normalize(options.profile||active());
    if(!complete(profile))throw new Error('custom_not_configured');
    const messages=[];
    if(options.system)messages.push({role:'system',content:String(options.system).slice(0,8000)});
    for(const item of Array.isArray(options.messages)?options.messages.slice(-20):[]){
      const role=item?.role==='assistant'||item?.role==='model'?'assistant':'user';
      const content=String(item?.content??item?.text??'').trim().slice(0,2000);
      if(content)messages.push({role,content});
    }
    if(options.prompt)messages.push({role:'user',content:String(options.prompt).slice(0,4000)});
    if(!messages.some(item=>item.role==='user'))throw new Error('invalid_request');
    const result=await relay({action:'chat',config:profile,messages,maxTokens:options.maxTokens||'',json:options.json===true});
    const reply=String(result.reply||'').trim();
    if(!reply)throw new Error('empty_reply');
    return reply;
  }
  async function models(profile=active()){
    const config=normalize(profile);
    if(!config.endpoint||!config.apiKey)throw new Error('custom_not_configured');
    const result=await relay({action:'models',config},18000);
    return Array.isArray(result.models)?result.models.map(String).filter(Boolean).slice(0,200):[];
  }
  async function test(profile=active()){
    const reply=await chat({profile,system:'Reply with exactly OK',prompt:'Connection test',maxTokens:12});
    return !!reply;
  }
  function save(profile){
    const item=normalize(profile),index=state.profiles.findIndex(value=>value.id===item.id);
    if(index>=0)state.profiles[index]=item;else state.profiles.push(item);
    state.activeId=item.id;persist();window.dispatchEvent(new CustomEvent('iphone26:aichange',{detail:{configured:complete(item)}}));return {...item};
  }
  function remove(id){
    state.profiles=state.profiles.filter(item=>item.id!==id);
    if(state.activeId===id)state.activeId=state.profiles[0]?.id||'';
    persist();window.dispatchEvent(new CustomEvent('iphone26:aichange',{detail:{configured:complete(active())}}));
  }
  function select(id){if(state.profiles.some(item=>item.id===id)){state.activeId=id;persist()}}
  window.__IPHONE_AI__={
    blank,chat,models,test,save,remove,select,
    get active(){const item=active();return item?{...item}:null},
    get profiles(){return state.profiles.map(item=>({...item}))},
    get configured(){return complete(active())},
    get source(){return complete(active())?'custom':'public-gemini'},
    storageKey:STORAGE_KEY
  };
})();
