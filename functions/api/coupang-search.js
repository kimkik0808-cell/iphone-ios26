const ALLOWED_ORIGINS=new Set(['https://nuyheaj.pages.dev','https://kimkik0808-cell.github.io']);
const CATEGORIES=new Set(['food','daily','beauty','fashion','digital','home','pet','baby','travel']);
const EMOJIS=new Set(['🥩','🍜','🍱','🧻','🧺','🧴','💄','✨','👕','🧥','👟','👖','🕶️','🎧','📱','⌚','📷','🔋','🏠','🛏️','☕','🐕','🧸','🧳','🛍️']);
function json(data,status=200,origin=''){const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','vary':'Origin'};if(ALLOWED_ORIGINS.has(origin))headers['access-control-allow-origin']=origin;return new Response(JSON.stringify(data),{status,headers})}
function clean(item,index){
 const cat=CATEGORIES.has(item?.cat)?item.cat:'daily';
 const minimum=cat==='fashion'?120000:cat==='digital'?30000:1000;
 const price=Math.min(8000000,Math.max(minimum,Math.round(Number(item?.price)/100)*100));
 const ko=String(item?.ko||'').trim().slice(0,42),cn=String(item?.cn||'').trim().slice(0,42),brand=String(item?.brand||'Coupang Select').trim().slice(0,28);
 if(!ko||!cn||!brand||!Number.isFinite(price))return null;
 return {id:'ai-'+Date.now().toString(36)+'-'+index,cat,emoji:EMOJIS.has(item?.emoji)?item.emoji:'🛍️',brand,ko,cn,price};
}
function parse(text){
 const source=String(text||'').trim().replace(/^\`\`\`(?:json)?\s*/i,'').replace(/\s*\`\`\`$/,'');
 let parsed;try{parsed=JSON.parse(source)}catch{const a=source.indexOf('['),b=source.lastIndexOf(']');if(a<0||b<=a)return[];try{parsed=JSON.parse(source.slice(a,b+1))}catch{return[]}}
 const list=Array.isArray(parsed)?parsed:parsed?.items;
 return Array.isArray(list)?list.map(clean).filter(Boolean).slice(0,8):[];
}
export async function onRequestGet({request,env}){const origin=request.headers.get('Origin')||'';return json({service:'coupang-search',version:'v1',status:env.GEMINI_API_KEY?'configured':'ai_not_configured'},env.GEMINI_API_KEY?200:503,origin)}
export async function onRequestOptions({request}){const origin=request.headers.get('Origin')||'';if(!ALLOWED_ORIGINS.has(origin))return new Response(null,{status:403});return new Response(null,{status:204,headers:{'access-control-allow-origin':origin,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'content-type','access-control-max-age':'86400'}})}
export async function onRequestPost({request,env}){
 const origin=request.headers.get('Origin')||'';if(origin&&!ALLOWED_ORIGINS.has(origin))return json({error:'origin_not_allowed'},403,origin);if(!env.GEMINI_API_KEY)return json({error:'ai_not_configured'},503,origin);
 let body;try{body=await request.json()}catch{return json({error:'invalid_json'},400,origin)}
 const query=String(body?.query||'').trim().slice(0,40),language=body?.language==='zh'?'zh':'ko';if(!query)return json({error:'invalid_request'},400,origin);
 const instruction='현재 시점은 2026년 10월이다. 너는 한국 쿠팡 스타일 가상 쇼핑 앱의 상품 검색 기획자다. 사용자의 짧은 검색어에 맞는 서로 다른 상품 6개를 만든다. 실제 한국 온라인 쇼핑에서 자연스러운 상품명과 브랜드명 및 현실적인 원화 가격을 사용한다. 의류 패션 상품은 120000원 미만으로 만들지 말고 디지털 상품은 30000원 미만으로 만들지 않는다. 나머지 상품도 품목에 맞는 현실적인 가격을 사용하며 8000000원을 넘지 않는다. 한국어와 자연스러운 중국어 상품명을 모두 제공한다. cat은 food daily beauty fashion digital home pet baby travel 중 하나다. emoji는 상품에 맞는 이모지 하나다. 오직 {"items":[{"brand":"","ko":"","cn":"","cat":"","emoji":"","price":0}]} JSON만 출력한다.';
 const prompt=(language==='zh'?'用户搜索词：':'사용자 검색어: ')+query,models=['gemini-3.5-flash-lite','gemini-3.6-flash'];let failure='model_unavailable';
 for(const model of models){const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);try{const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent',{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},body:JSON.stringify({systemInstruction:{parts:[{text:instruction}]},contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:1300,responseMimeType:'application/json',thinkingConfig:{thinkingLevel:'minimal'}}}),signal:controller.signal});if(response.ok){const result=await response.json().catch(()=>({}));const text=(result?.candidates?.[0]?.content?.parts||[]).filter(part=>typeof part.text==='string'&&!part.thought).map(part=>part.text).join('');const items=parse(text);if(items.length)return json({items},200,origin);failure='empty_results';continue}if(response.status===401||response.status===403)return json({error:'key_or_region_error'},503,origin);failure=response.status===429?'quota_exceeded':'model_unavailable'}catch(error){failure=controller.signal.aborted?'upstream_timeout':'upstream_network'}finally{clearTimeout(timeout)}}
 return json({error:failure},failure==='quota_exceeded'?429:503,origin)
}