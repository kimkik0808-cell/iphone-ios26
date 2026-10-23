const ALLOWED_ORIGINS = new Set([
  'https://nuyheaj.pages.dev',
  'https://kimkik0808-cell.github.io'
]);

const PERSONAS = {
  xxx: '재현과 사적으로 연락하는 여성 지인이다. 관계를 단정하지 않고 편한 반말로 짧게 답한다.',
  yh: '재현과 가까운 같은 그룹 형이다. 편하고 장난스러운 반말을 쓴다.',
  jy: '재현과 친한 같은 그룹 멤버다. 차분하고 담백한 반말을 쓴다.',
  sw: '재현과 친한 동생 멤버다. 자연스럽고 장난스럽게 답하되 매번 형이라고 부르지는 않는다.',
  q: '재현과 친한 동생 멤버다. 밝고 센스 있는 반말을 쓴다.',
  manager: '재현의 매니저다. 친근하지만 현실적인 말투로 답한다.',
  stylist: '재현과 일하는 스타일리스트다. 편안하고 자연스러운 존댓말을 쓴다.',
  pd: '재현과 일하는 제작진이다. 간결하고 자연스러운 존댓말을 쓴다.',
  nuna: '재현의 친누나다. 가족끼리 쓰는 편한 반말로 답한다.'
};

function json(data, status = 200, origin = '') {
  const headers = {'content-type':'application/json; charset=utf-8','cache-control':'no-store','vary':'Origin'};
  if (ALLOWED_ORIGINS.has(origin)) headers['access-control-allow-origin'] = origin;
  return new Response(JSON.stringify(data), { status, headers });
}

export async function onRequestGet({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  return json({service:'kkt-gift-reply',version:'gift-reply-v1',status:env.GEMINI_API_KEY?'configured':'ai_not_configured'}, env.GEMINI_API_KEY?200:503, origin);
}

export async function onRequestOptions({ request }) {
  const origin = request.headers.get('Origin') || '';
  if (!ALLOWED_ORIGINS.has(origin)) return new Response(null, { status: 403 });
  return new Response(null, {status:204,headers:{
    'access-control-allow-origin':origin,
    'access-control-allow-methods':'POST, OPTIONS',
    'access-control-allow-headers':'content-type',
    'access-control-max-age':'86400'
  }});
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  if (origin && !ALLOWED_ORIGINS.has(origin)) return json({error:'origin_not_allowed'},403,origin);
  if (!env.GEMINI_API_KEY) return json({error:'ai_not_configured'},503,origin);
  let body;
  try { body = await request.json(); } catch { return json({error:'invalid_json'},400,origin); }
  const recipientId=String(body?.recipientId||'').slice(0,30);
  const recipientName=String(body?.recipientName||'친구').trim().slice(0,30);
  const item=String(body?.item||'선물').trim().slice(0,60);
  const kind=String(body?.kind||'선물').trim().slice(0,20);
  if(!recipientId||!item)return json({error:'invalid_request'},400,origin);
  const history=Array.isArray(body?.history)?body.history.slice(-8).map(x=>String(x?.role||'')+': '+String(x?.text||'').slice(0,180)).join('\n'):'';
  const persona=PERSONAS[recipientId]||recipientName+'은 재현의 지인이다. 두 사람의 기존 말투와 관계를 과장하지 않고 자연스럽게 답한다.';
  const instruction='너는 팬메이드 가상 휴대폰 속 카카오톡 인물이다. '+persona+' '+
    '재현이 카카오톡 선물하기로 보낸 상품을 방금 받았다. 상품 이름을 매번 그대로 반복하지 말고, 최근 대화 분위기와 관계에 맞춰 실제 한국인이 카톡으로 보낼 법한 감사 반응을 작성한다. '+
    '한 문장 또는 아주 짧은 두 문장만 쓰고 설명, 따옴표, 해시태그는 쓰지 않는다. 같은 표현을 기계적으로 반복하지 않는다.';
  const prompt='받은 상품: '+item+'\n상품 종류: '+kind+(history?'\n최근 대화:\n'+history:'');
  const models=['gemini-3.5-flash-lite','gemini-3.6-flash'];
  let failure='model_unavailable';
  for(const model of models){
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),11000);
    try{
      const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent',{
        method:'POST',headers:{'content-type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
        body:JSON.stringify({systemInstruction:{parts:[{text:instruction}]},contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:180,thinkingConfig:{thinkingLevel:'minimal'}}}),signal:controller.signal
      });
      if(response.ok){
        const result=await response.json().catch(()=>({}));
        const reply=(result?.candidates?.[0]?.content?.parts||[]).filter(p=>typeof p.text==='string'&&!p.thought).map(p=>p.text).join('').trim().replace(/^["“”]|["“”]$/g,'').slice(0,180);
        if(reply)return json({reply,source:'gemini'},200,origin);
        failure='empty_reply';continue;
      }
      if(response.status===401||response.status===403)return json({error:'key_or_region_error'},503,origin);
      failure=response.status===429?'quota_exceeded':'model_unavailable';
    }catch{failure=controller.signal.aborted?'upstream_timeout':'upstream_network'}finally{clearTimeout(timeout)}
  }
  return json({error:failure},failure==='quota_exceeded'?429:503,origin);
}
