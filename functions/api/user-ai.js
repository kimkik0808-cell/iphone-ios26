const ALLOWED_ORIGINS=new Set(['https://nuyheaj.pages.dev','https://kimkik0808-cell.github.io']);
function json(data,status=200,origin=''){
  const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','vary':'Origin'};
  if(ALLOWED_ORIGINS.has(origin))headers['access-control-allow-origin']=origin;
  return new Response(JSON.stringify(data),{status,headers});
}
function safeBase(raw){
  let url;try{url=new URL(String(raw||'').trim())}catch{return null}
  if(url.protocol!=='https:'||url.username||url.password)return null;
  const host=url.hostname.toLowerCase();
  if(host==='localhost'||host.endsWith('.local')||host==='0.0.0.0'||host==='127.0.0.1'||host==='::1'||/^10\.|^192\.168\.|^169\.254\.|^172\.(1[6-9]|2\d|3[01])\./.test(host))return null;
  url.hash='';url.search='';url.pathname=url.pathname.replace(/\/(chat\/completions|models)\/?$/,'').replace(/\/$/,'');
  return url.toString().replace(/\/$/,'');
}
function errorCode(status){if(status===401||status===403)return'key_or_region_error';if(status===429)return'quota_exceeded';if(status===404)return'model_unavailable';return status>=500?'model_busy':'request_failed'}
export async function onRequestOptions({request}){
  const origin=request.headers.get('Origin')||'';
  if(!ALLOWED_ORIGINS.has(origin))return new Response(null,{status:403});
  return new Response(null,{status:204,headers:{'access-control-allow-origin':origin,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'content-type','access-control-max-age':'86400'}});
}
export async function onRequestPost({request}){
  const origin=request.headers.get('Origin')||'';
  if(origin&&!ALLOWED_ORIGINS.has(origin))return json({error:'origin_not_allowed'},403,origin);
  let body;try{body=await request.json()}catch{return json({error:'invalid_json'},400,origin)}
  const config=body?.config||{},base=safeBase(config.endpoint),apiKey=String(config.apiKey||'').trim().slice(0,1000),model=String(config.model||'').trim().slice(0,160);
  if(!base||!apiKey)return json({error:'invalid_configuration'},400,origin);
  const headers={'content-type':'application/json','authorization':'Bearer '+apiKey};
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),22000);
  try{
    if(body.action==='models'){
      const response=await fetch(base+'/models',{headers:{authorization:'Bearer '+apiKey},signal:controller.signal});
      if(!response.ok)return json({error:errorCode(response.status)},response.status===429?429:503,origin);
      const result=await response.json().catch(()=>({}));
      const models=(Array.isArray(result?.data)?result.data:[]).map(item=>item?.id).filter(item=>typeof item==='string');
      return json({models},200,origin);
    }
    if(body.action!=='chat'||!model)return json({error:'invalid_request'},400,origin);
    const messages=(Array.isArray(body.messages)?body.messages:[]).slice(-24).map(item=>({role:['system','assistant','user'].includes(item?.role)?item.role:'user',content:String(item?.content||'').slice(0,8000)})).filter(item=>item.content);
    if(!messages.length)return json({error:'invalid_request'},400,origin);
    const max=Number(config.maxTokens||body.maxTokens),payload={model,messages,temperature:Math.min(2,Math.max(0,Number(config.temperature)||0)),stream:false};
    if(Number.isFinite(max)&&max>0)payload.max_tokens=Math.min(8192,Math.max(8,Math.round(max)));
    const response=await fetch(base+'/chat/completions',{method:'POST',headers,body:JSON.stringify(payload),signal:controller.signal});
    if(!response.ok)return json({error:errorCode(response.status)},response.status===429?429:503,origin);
    const result=await response.json().catch(()=>({}));
    let content=result?.choices?.[0]?.message?.content;
    if(Array.isArray(content))content=content.map(part=>typeof part==='string'?part:part?.text||'').join('');
    const reply=String(content||'').trim();
    if(!reply)return json({error:'empty_reply'},503,origin);
    return json({reply,source:'custom-openai'},200,origin);
  }catch(error){return json({error:controller.signal.aborted?'upstream_timeout':'upstream_network'},503,origin)}finally{clearTimeout(timeout)}
}
