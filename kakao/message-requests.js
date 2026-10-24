// Cloudflare deployment refresh: Gemini backend enabled
(function(){
'use strict';
if(window.__KKT_REQUESTS_LOADED__)return;
window.__KKT_REQUESTS_LOADED__=true;
// Keep all 50 scripted senders visible; banners append later messages over time.
const templates=Array.isArray(window.KKT_REQUEST_CONVERSATIONS)?window.KKT_REQUEST_CONVERSATIONS:[];
if(!templates.length)return;
const DELIVERY_KEY='jh_kkt_request_delivered_v1';
const deliveryCounts=(()=>{
  let saved={};
  try{saved=JSON.parse(localStorage.getItem(DELIVERY_KEY)||'null')||{}}catch{}
  return Object.fromEntries(templates.map(item=>[
    item.id,Math.min(item.messages.length,Math.max(1,Math.floor(Number(saved[item.id])||0)))
  ]));
})();
const conversations=templates.map(item=>({
  ...item,
  messages:item.messages.slice(0,deliveryCounts[item.id]).map(message=>({...message}))
}));
const deliveredTotal=()=>visibleConversations().reduce((n,item)=>n+item.messages.length,0);
const saveDeliveries=()=>{try{localStorage.setItem(DELIVERY_KEY,JSON.stringify(deliveryCounts))}catch{}};
function peekNextDelivery(){
  // Deliver one message at a time from a small group of six senders.
  // For each group, sender messages interleave round-robin (1, 2, 3...),
  // before progressively introducing the next group. Never expose future text.
  const batchSize=6;
  for(let start=0;start<templates.length;start+=batchSize){
    const active=templates.slice(start,start+batchSize)
      .map(source=>({source,index:deliveryCounts[source.id]||0}))
      .filter(({source,index})=>index<source.messages.length);
    if(!active.length)continue;
    const earliest=Math.min(...active.map(item=>item.index));
    const next=active.find(item=>item.index===earliest);
    const message=next.source.messages[next.index];
    return {id:next.source.id,name:next.source.name,text:message.text,index:next.index};
  }
  return null;
}
function deliverNext(){
  const incoming=peekNextDelivery();
  if(!incoming)return null;
  const room=conversations.find(item=>item.id===incoming.id);
  if(!room)return null;
  const time=new Intl.DateTimeFormat('ko-KR',{hour:'numeric',minute:'2-digit',hour12:true}).format(new Date());
  room.messages.push({text:incoming.text,time});
  room.latestTime='방금';
  deliveryCounts[room.id]=room.messages.length;
  saveDeliveries();
  if(requestView==='list'){
    listScroll=document.querySelector('#krq-list')?.scrollTop||0;
    renderList();
  }else if(requestView==='room'&&currentId===room.id){
    renderRoom(room.id);
  }else refreshEntryCount();
  return incoming;
}
const READ_KEY='jh_kkt_request_read_v1';
const ACTION_KEY='jh_kkt_request_actions_v1';
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const isZh=()=>window.IphoneLocale?.language==='zh';
const unknownTitle=()=>isZh()?'未知聊天':'알 수 없는 채팅';
const load=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch(e){return fallback}};
let readState=load(READ_KEY,{});
let actionState=load(ACTION_KEY,{});
let requestView='';
let currentId='';
let listScroll=0;
let modalAction='';
const saveRead=()=>{try{localStorage.setItem(READ_KEY,JSON.stringify(readState))}catch(e){}};
const saveActions=()=>{try{localStorage.setItem(ACTION_KEY,JSON.stringify(actionState))}catch(e){}};
const seenCount=item=>typeof readState[item.id]==='number'?readState[item.id]:0;
const newMessages=item=>Math.max(0,item.messages.length-seenCount(item));
const visibleConversations=()=>conversations.filter(item=>item.messages.length>0);
const unreadCount=()=>visibleConversations().reduce((n,item)=>n+(newMessages(item)>0?1:0),0);
function refreshEntryCount(){
  const entry=document.querySelector('.krq-entry');
  if(!entry)return;
  const count=unreadCount();
  const bubble=entry.querySelector('.krq-entry-count');
  if(count){
    if(bubble){
      // Do not rewrite unchanged badge text: this observer watches subtree
      // childList changes, and a repeated textContent assignment loops forever.
      if(bubble.textContent!==String(count))bubble.textContent=String(count);
    }else entry.insertAdjacentHTML('beforeend','<i class="krq-entry-count">'+count+'</i>');
  }else bubble?.remove();
}
const current=()=>conversations.find(item=>item.id===currentId);
const toneColors=[
  ['#d5d0f5','#7466bd'],['#c9e8df','#4d9d8d'],['#c9e1f5','#4d8fc5'],['#f0d2dc','#be718c'],
  ['#ead8c6','#a77a52'],['#d8dfc4','#7f9457'],['#d7d7d7','#848484'],['#d7c9e8','#8c62ad']
];
function avatar(item,small=false){
  const colors=toneColors[item.avatarTone%toneColors.length];
  const initial=Array.from(item.name)[0]||'?';
  return '<span class="krq-avatar '+(small?'small':'')+'" style="--krq-bg:'+colors[0]+';--krq-fg:'+colors[1]+'"><i></i><b>'+esc(initial)+'</b></span>';
}
function removeLegacyRiskChat(){
  const api=window.__KKT15_TEST__;
  const data=api?.data;
  if(!Array.isArray(data))return;
  const before=data.length;
  for(let i=data.length-1;i>=0;i--)if(data[i]?.id==='unknown')data.splice(i,1);
  if(data.length!==before){
    try{localStorage.setItem('jh_kkt15',JSON.stringify(data))}catch(e){}
  }
}
function injectStyles(){
  if(document.querySelector('#krq-styles'))return;
  const style=document.createElement('style');
  style.id='krq-styles';
  style.textContent=`
  .krq-entry{width:calc(100% - 30px);margin:9px 15px 7px;padding:12px 4px;display:flex;align-items:center;gap:12px;background:transparent;color:#111;text-align:left;border-bottom:1px solid rgba(0,0,0,.08)}
  .krq-entry:active{opacity:.55}.krq-entry-icon{width:48px;height:48px;border-radius:18px;background:#f1f1f3;display:grid;place-items:center;position:relative;flex:0 0 auto}
  .krq-entry-icon svg{width:25px;height:25px;fill:#606166}.krq-entry-text{min-width:0;flex:1;display:flex;flex-direction:column;gap:4px}.krq-entry-text strong{font-size:16px;font-weight:700;letter-spacing:-.2px}.krq-entry-text span{font-size:13px;color:#85858a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .krq-entry-count,.krq-unread{min-width:20px;height:20px;padding:0 6px;border-radius:11px;background:#ef3d46;color:#fff;display:grid;place-items:center;font-size:11px;font-weight:700;font-style:normal}
  #krq-root{position:absolute;inset:0;background:#fff;color:#111;display:flex;flex-direction:column;overflow:hidden;z-index:4;font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",system-ui,sans-serif}
  .krq-head{height:54px;flex:0 0 54px;display:flex;align-items:center;padding:0 12px;border-bottom:1px solid rgba(0,0,0,.08);background:rgba(255,255,255,.97)}
  .krq-head>button{width:38px;height:42px;background:transparent;color:#111;font-size:34px;line-height:1;padding:0;text-align:left}
  .krq-title{min-width:0;display:flex;align-items:baseline;gap:7px}.krq-title strong{font-size:18px;letter-spacing:-.35px}.krq-title small{font-size:13px;color:#8b8b91;font-weight:600}
  .krq-list{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;background:#fff;padding-bottom:max(22px,env(safe-area-inset-bottom))}
  .krq-summary{padding:13px 17px 10px;color:#77777d;font-size:12px;border-bottom:1px solid #f0f0f2}
  .krq-row{width:100%;min-height:73px;padding:10px 16px;display:flex;align-items:center;gap:12px;background:#fff;color:#111;text-align:left}
  .krq-row:active{background:#f3f3f5}.krq-row-main{min-width:0;flex:1;display:flex;flex-direction:column;gap:5px}.krq-row-main strong{font-size:15.5px;line-height:1.2;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.krq-row-main p{margin:0;color:#85858a;font-size:13px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .krq-row-meta{width:58px;align-self:stretch;display:flex;flex-direction:column;align-items:flex-end;justify-content:center;gap:8px}.krq-row-meta time{font-size:10.5px;color:#aaa;white-space:nowrap}
  .krq-avatar{--krq-bg:#ddd;--krq-fg:#888;width:49px;height:49px;border-radius:19px;background:var(--krq-bg);display:grid;place-items:center;position:relative;overflow:hidden;flex:0 0 auto}.krq-avatar.small{width:34px;height:34px;border-radius:13px}
  .krq-avatar i:before{content:"";position:absolute;width:15px;height:15px;border-radius:50%;background:var(--krq-fg);top:9px;left:17px}.krq-avatar i:after{content:"";position:absolute;width:31px;height:20px;border-radius:18px 18px 5px 5px;background:var(--krq-fg);bottom:-2px;left:9px}.krq-avatar.small i:before{width:10px;height:10px;top:6px;left:12px}.krq-avatar.small i:after{width:22px;height:14px;left:6px}
  .krq-avatar b{display:none}
  .krq-room-head{height:104px;flex:0 0 104px;display:flex;flex-direction:column;background:#b8cad8;border:0}.krq-room-top{height:58px;width:100%;display:flex;align-items:center;padding:0 12px;color:#202429}.krq-room-top>button{width:60px;height:44px;border-radius:18px;background:rgba(255,255,255,.34);border:1px solid rgba(255,255,255,.53);color:#202429;font-size:34px;line-height:1;text-align:center;box-shadow:inset 0 1px rgba(255,255,255,.12)}.krq-room-name{font-size:18px;font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;text-align:center;padding-right:60px;color:#202429}
  .krq-actions{height:46px;width:100%;display:flex;padding:1px 10px 5px;background:#b8cad8}.krq-actions button{height:40px;min-width:0;flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:0 8px;background:#fff;color:#242527;font-size:13.5px;font-weight:650;letter-spacing:-.25px;border-radius:0}.krq-actions button:first-child{border-radius:14px 0 0 14px}.krq-actions button:last-child{border-radius:0 14px 14px 0}.krq-actions button+button{position:relative}.krq-actions button+button:before{content:"";position:absolute;left:0;top:8px;bottom:8px;width:1px;background:#dedee0}.krq-actions svg{width:19px;height:19px;display:block;flex:0 0 auto;fill:none;stroke:currentColor;stroke-width:2.15;stroke-linecap:round;stroke-linejoin:round}.krq-actions button.danger{color:#ff7658}.krq-actions button.done{color:#78787a;background:#fafafa}
  .krq-chat{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;background:#b8cad8;padding:13px 13px max(30px,env(safe-area-inset-bottom))}
  .krq-date{text-align:center;margin:2px 0 17px}.krq-date span{display:inline-block;background:rgba(74,90,102,.35);color:#fff;font-size:10.5px;padding:5px 10px;border-radius:12px}
  .krq-message-row{display:flex;align-items:flex-start;gap:8px;margin:0 0 7px}.krq-message-row.follow{padding-left:42px;margin-top:-2px}.krq-message-block{max-width:76%;display:flex;flex-direction:column;gap:3px}.krq-sender{font-size:11.5px;color:#3e464c;margin:0 0 1px 2px}.krq-bubble-line{display:flex;align-items:flex-end;gap:5px}.krq-bubble{background:#fff;color:#17191b;border-radius:4px 11px 11px 11px;padding:8px 10px;font-size:14px;line-height:1.38;word-break:break-word;box-shadow:0 .5px 0 rgba(0,0,0,.06)}.krq-message-row.follow .krq-bubble{border-radius:11px}.krq-bubble-line time{font-size:9.5px;color:#5d6870;white-space:nowrap;margin-bottom:1px}
  .krq-empty-input{height:49px;flex:0 0 49px;background:#fff;display:flex;align-items:center;padding:7px 11px calc(7px + env(safe-area-inset-bottom));color:#aaa;font-size:13px;border-top:1px solid rgba(0,0,0,.06)}
  .krq-empty-input span{height:34px;flex:1;border:1px solid #e3e3e6;border-radius:17px;display:flex;align-items:center;padding:0 13px}
  .krq-modal{position:absolute;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:flex-end;z-index:9;padding:0 10px calc(9px + env(safe-area-inset-bottom))}
  .krq-sheet{width:100%;background:#f8f8fa;border-radius:15px;overflow:hidden;box-shadow:0 12px 35px rgba(0,0,0,.2)}.krq-sheet-copy{padding:20px 18px;text-align:center}.krq-sheet-copy strong{display:block;font-size:16px;margin-bottom:7px}.krq-sheet-copy p{margin:0;color:#707078;font-size:13px;line-height:1.45}.krq-sheet-actions{display:flex;border-top:1px solid #dddde0}.krq-sheet-actions button{height:49px;flex:1;background:#fff;color:#1677df;font-size:15px}.krq-sheet-actions button+button{border-left:1px solid #dddde0}.krq-sheet-actions .danger{color:#e13942}
  @media(max-height:700px){.krq-row{min-height:67px}.krq-room-head{height:98px;flex-basis:98px}.krq-room-top{height:54px}.krq-actions{height:44px}.krq-actions button{height:39px}}
  `;
  document.head.appendChild(style);
}
function entryHTML(){
  const count=unreadCount();
  return '<button class="krq-entry" type="button" data-krq="open-list"><span class="krq-entry-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.3c5.45 0 9.65 3.38 9.65 7.85 0 4.48-4.2 7.86-9.65 7.86-.72 0-1.43-.06-2.1-.18L5.36 21.1c-.52.37-1.19-.12-.99-.73l1.21-3.65c-2.04-1.43-3.23-3.78-3.23-6.57C2.35 5.68 6.55 2.3 12 2.3z"/></svg></span><span class="krq-entry-text"><strong>'+esc(unknownTitle())+'</strong><span>'+(isZh()?'未添加为好友的用户发来的消息请求':'친구로 등록되지 않은 사용자의 메시지 요청')+'</span></span>'+(count?'<i class="krq-entry-count">'+count+'</i>':'')+'</button>';
}
function injectEntry(){
  if(requestView||typeof mode==='undefined'||mode!=='kakao')return;
  const api=window.__KKT15_TEST__;
  if(api?.tab!=='chats'||api?.view)return;
  const root=document.querySelector('#kkt15');
  const scroll=root?.querySelector('.k15-scroll');
  if(!scroll)return;
  if(scroll.querySelector('.krq-entry')){refreshEntryCount();return;}
  const search=scroll.querySelector('.k15-search');
  if(!search)return;
  search.insertAdjacentHTML('afterend',entryHTML());
}
function renderList(){
  requestView='list';
  currentId='';
  modalAction='';
  const app=document.querySelector('#appcontent');
  if(!app)return;
  const rows=visibleConversations().slice().reverse().map(item=>{
    const latest=item.messages[item.messages.length-1];
    const unread=newMessages(item);
    return '<button class="krq-row" type="button" data-krq="open-room" data-id="'+esc(item.id)+'">'+avatar(item)+'<span class="krq-row-main"><strong>'+esc(item.name)+'</strong><p>'+esc(latest.text)+'</p></span><span class="krq-row-meta"><time>'+esc(item.latestTime)+'</time>'+(unread?'<i class="krq-unread">'+unread+'</i>':'')+'</span></button>';
  }).join('');
  app.innerHTML='<section id="krq-root"><header class="krq-head"><button type="button" aria-label="뒤로" data-krq="back-main">‹</button><div class="krq-title"><strong>'+esc(unknownTitle())+'</strong><small>'+unreadCount()+'</small></div></header><main class="krq-list" id="krq-list"><div class="krq-summary">'+(isZh()?'消息请求 ':'메시지 요청 ')+visibleConversations().length+(isZh()?' 个':'개')+'</div>'+(rows||'<div class="krq-summary">'+(isZh()?'还没有收到陌生消息':'아직 도착한 메시지 요청이 없습니다')+'</div>')+'</main></section>';
  requestAnimationFrame(()=>{const list=document.querySelector('#krq-list');if(list)list.scrollTop=listScroll});
}
function getAction(id){return actionState[id]||{added:false,unblocked:false,reported:false}}
function actionButtons(item){
  const a=getAction(item.id);
  const addIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="7" r="3.3"></circle><path d="M3.3 19c.3-4 2.2-6 5.7-6s5.4 2 5.7 6M18 7v6M15 10h6"></path></svg>';
  const unblockIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2"></circle><path d="M6.2 17.8 17.8 6.2"></path></svg>';
  const reportIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18h10M8.5 15.5v-4a3.5 3.5 0 0 1 7 0v4M6.5 18v-2.5h11V18M12 3v2M4.8 6.1l1.5 1.5M19.2 6.1l-1.5 1.5M3 12h2M19 12h2"></path></svg>';
  return '<div class="krq-actions"><button type="button" data-krq="add" class="'+(a.added?'done':'')+'">'+addIcon+'<span>'+(isZh()?(a.added?'已添加':'添加'):(a.added?'추가됨':'추가'))+'</span></button><button type="button" data-krq="unblock" class="'+(a.unblocked?'done':'')+'">'+unblockIcon+'<span>'+(isZh()?(a.unblocked?'已解除':'解除屏蔽'):(a.unblocked?'차단':'차단해제'))+'</span></button><button type="button" data-krq="report" class="'+(a.reported?'done':'danger')+'">'+reportIcon+'<span>'+(isZh()?(a.reported?'已举报':'举报'):(a.reported?'신고됨':'신고'))+'</span></button></div>';
}
function modalHTML(item){
  if(!modalAction)return '';
  const isReport=modalAction==='report';
  const title=isZh()?(isReport?'要举报这段对话吗':'要解除屏蔽吗'):(isReport?'이 대화를 신고할까요?':'차단을 해제할까요?');
  const copy=isZh()?(isReport?'举报后该对话会显示为已举报':'解除后可再次收到该用户的消息'):(isReport?'신고 처리 후 이 대화는 신고 상태로 표시됩니다':'차단을 해제하면 이 사용자의 메시지를 다시 받을 수 있습니다');
  return '<div class="krq-modal" data-krq="dismiss"><section class="krq-sheet" role="dialog" aria-modal="true"><div class="krq-sheet-copy"><strong>'+title+'</strong><p>'+copy+'</p></div><div class="krq-sheet-actions"><button type="button" data-krq="cancel">'+(isZh()?'取消':'취소')+'</button><button type="button" class="'+(isReport?'danger':'')+'" data-krq="confirm">'+(isZh()?(isReport?'举报':'解除屏蔽'):(isReport?'신고':'차단해제'))+'</button></div></section></div>';
}
function renderRoom(id){
  const item=conversations.find(x=>x.id===id);
  if(!item){renderList();return}
  requestView='room';
  currentId=id;
  modalAction='';
  if(!item.messages.length){renderList();return}
  readState[id]=item.messages.length;
  saveRead();
  const app=document.querySelector('#appcontent');
  if(!app)return;
  const messages=item.messages.map((message,index)=>{
    const first=index===0;
    return '<div class="krq-message-row '+(first?'':'follow')+'">'+(first?avatar(item,true):'')+'<div class="krq-message-block">'+(first?'<div class="krq-sender">'+esc(item.name)+'</div>':'')+'<div class="krq-bubble-line"><div class="krq-bubble">'+esc(message.text)+'</div><time>'+esc(isZh()?String(message.time).replace(/^오전 /,'上午 ').replace(/^오후 /,'下午 '):message.time)+'</time></div></div></div>';
  }).join('');
  app.innerHTML='<section id="krq-root"><header class="krq-room-head"><div class="krq-room-top"><button type="button" aria-label="뒤로" data-krq="back-list">‹</button><div class="krq-room-name">'+esc(item.name)+'</div></div>'+actionButtons(item)+'</header><main class="krq-chat" id="krq-chat"><div class="krq-date"><span>'+(isZh()?'今天':'오늘')+'</span></div>'+messages+'</main><div class="krq-empty-input"><span>'+(isZh()?'输入消息':'메시지를 입력하세요')+'</span></div>'+modalHTML(item)+'</section>';
  requestAnimationFrame(()=>{const chat=document.querySelector('#krq-chat');if(chat)chat.scrollTop=chat.scrollHeight});
}
function updateActions(patch){
  if(!currentId)return;
  actionState[currentId]={...getAction(currentId),...patch};
  saveActions();
  renderRoom(currentId);
}
function openList(){
  if(typeof mode!=='undefined'&&mode!=='kakao'&&typeof openApp==='function')openApp('kakao');
  renderList();
}
function backToMain(){
  requestView='';
  currentId='';
  modalAction='';
  if(typeof render==='function')render();
  else window.__KKT15_TEST__?.render?.();
  requestAnimationFrame(injectEntry);
}
function saveKktData(){
  const data=window.__KKT15_TEST__?.data;
  if(!Array.isArray(data))return;
  try{localStorage.setItem('jh_kkt15',JSON.stringify(data))}catch(e){}
}
const AI_CHAT_IDS=new Set(['sw','sister','jy']);
const AI_PERSONAS={
  sw:'너는 선우다. 재현을 형이라고 부르는 친한 같은 팀 멤버다. 장난스럽고 짧게 자연스러운 한국어 카톡 말투로 답한다. 과하게 다정하거나 문어체로 말하지 않는다. 보통 한두 문장만 보낸다.',
  sister:'너는 재현의 누나다. 현실적인 가족 말투로 편하게 말한다. 잔소리와 챙김이 자연스럽게 섞이지만 과장하지 않는다. 짧은 한국어 카톡으로 답한다.',
  jy:'너는 주연이다. 재현과 오래 알고 지낸 같은 팀 멤버다. 무심하고 편한 반말과 가벼운 농담을 쓴다. 짧고 자연스러운 한국어 카톡으로 답한다.'
};
let aiView='';
let aiTyping=false;
let aiError='';
let aiController=null;
let aiSending=false;
let aiRequestSequence=0;
function ensureAiChats(){
  const data=window.__KKT15_TEST__?.data;
  if(!Array.isArray(data))return;
  // Earlier AI code generated id="nuna" even though the main KKT already
  // has id="sister". Keep one contact and preserve any existing AI messages.
  const sister=data.find(item=>item.id==='sister');
  const legacy=data.filter(item=>item.id==='nuna');
  // The main seed loader can drop legacy-only chats during a reload; include
  // the backup captured before that loader rewrites localStorage.
  let savedLegacy=null,alreadyMerged=false;
  try{
    savedLegacy=JSON.parse(localStorage.getItem('jh_kkt_nuna_legacy_backup')||'null');
    alreadyMerged=localStorage.getItem('jh_kkt_nuna_merged_sister_v1')==='1';
  }catch(e){}
  const sources=legacy.length?legacy:(savedLegacy?.id==='nuna'?[savedLegacy]:[]);
  if(sister&&sources.length&&!alreadyMerged){
    const existing=Array.isArray(sister.messages)?sister.messages:[];
    const seen=new Set(existing.map(message=>JSON.stringify(message)));
    const addUnique=(items)=>items.filter(message=>{
      if(!Array.isArray(message))return false;
      const key=JSON.stringify(message);
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    });
    let earlier=[],later=[],latest=null;
    for(const old of sources){
      // Keep a local backup before folding the duplicate room into the original.
      try{
        if(!localStorage.getItem('jh_kkt_nuna_legacy_backup')){
          localStorage.setItem('jh_kkt_nuna_legacy_backup',JSON.stringify(old));
        }
      }catch(e){}
      const messages=Array.isArray(old.messages)?old.messages:[];
      const hasOldIntro=messages.length>=4 &&
        String(messages[0]?.[1]||'').includes('2026년 10월 19일') &&
        messages[1]?.[1]==='오늘도 늦어?' &&
        messages[2]?.[1]==='응 연습 끝나고 들어갈 것 같아' &&
        messages[3]?.[1]==='알겠어 밥은 꼭 챙겨 먹어';
      earlier.push(...addUnique(hasOldIntro?messages.slice(0,4):[]));
      later.push(...addUnique(hasOldIntro?messages.slice(4):messages));
      if(later.length && (!latest || Number(old.updatedAt||0)>Number(latest.updatedAt||0)))latest=old;
    }
    sister.messages=[...earlier,...existing,...later];
    if(latest && Number(latest.updatedAt||0)>Number(sister.updatedAt||0)){
      sister.preview=latest.preview||sister.preview;
      sister.time=latest.time||sister.time;
      sister.updatedAt=latest.updatedAt;
    }
    try{localStorage.setItem('jh_kkt_nuna_merged_sister_v1','1')}catch(e){}
  }
  // Never show the deprecated second room, including on already migrated sites.
  for(let i=data.length-1;i>=0;i--){
    if(data[i]?.id==='nuna')data.splice(i,1);
  }
  for(const item of data){
    item.aiInteractive=AI_CHAT_IDS.has(item.id);
    if(!item.aiInteractive&&item.id!=='xxx'){
      delete item.scriptReply;
      delete item.scriptNext;
      item.scriptDone=true;
    }
  }
  saveKktData();
}
function aiTime(){
  return new Intl.DateTimeFormat('ko-KR',{hour:'numeric',minute:'2-digit',hour12:true}).format(new Date());
}
function aiAvatar(item){
  return '<span class="k15-avatar '+esc(item.type||'friend')+'" style="--avbg:#d8dfc4;--avfg:#7f9457"></span>';
}
function injectAiStyles(){
  if(document.querySelector('#kai-styles'))return;
  const style=document.createElement('style');
  style.id='kai-styles';
  style.textContent='.kai-form .k15-inputbox input{user-select:text;-webkit-user-select:text}.kai-form .k15-send{opacity:.35;transition:.16s}.kai-form:focus-within .k15-send,.kai-form .k15-send.ready{opacity:1;background:#fee500}.kai-error{margin:8px auto 12px;padding:7px 11px;border-radius:12px;background:rgba(0,0,0,.07);color:#666;font-size:12px}.kai-readonly{height:52px;display:flex;align-items:center;justify-content:center;border-top:1px solid rgba(0,0,0,.08);background:#fafafa;color:#9a9a9f;font-size:12px}.kai-retry{display:block;margin:12px auto 14px;padding:10px 17px;border:0;border-radius:14px;background:#fee500;color:#252525;font-size:13px;font-weight:650}';
  document.head.appendChild(style);
}
function aiMessages(item){
  return item.messages.map(message=>{
    const text=isZh()?(message[5]||message[1]):message[1];
    if(message[0]==='date')return '<div class="k15-date"><span>'+esc(text)+'</span></div>';
    const mine=message[0]==='mine';
    return '<div class="k15-message '+(mine?'mine':'')+'">'+(!mine?aiAvatar(item):'')+'<div class="k15-msgstack"><div class="k15-bubbleline"><div class="k15-bubble">'+esc(text)+'</div><span class="k15-msgmeta">'+(mine&&message[4]==='unread'?'<i class="k15-read">1</i>':'')+'<time>'+esc(message[2]||'방금')+'</time></span></div></div></div>';
  }).join('');
}
function renderAiRoom(id){
  if(aiView && aiView!==id){
    aiRequestSequence++;
    aiController?.abort();
    aiController=null;
    aiTyping=false;
    aiSending=false;
    aiError='';
  }
  ensureAiChats();
  const item=window.__KKT15_TEST__?.data?.find(chat=>chat.id===id);
  if(!item||!AI_CHAT_IDS.has(id))return;
  aiView=id;
  item.unread=0;
  saveKktData();
  const app=document.querySelector('#appcontent');
  if(!app)return;
  const latest=item.messages.filter(m=>m[0]==='mine'||m[0]==='other').at(-1);
  const retryAvailable=latest?.[0]==='mine'&&!aiSending;
  const retryHTML=retryAvailable?'<button type="button" class="kai-retry" data-ai-chat="retry">'+(isZh()?'↻ 重试上一条消息':'↻ 마지막 메시지 다시 시도')+'</button>':'';
  app.innerHTML='<div id="kkt15"><section class="k15-chatroom"><header class="k15-head"><button class="k15-ico k15-back" type="button" data-ai-chat="back">‹</button><h1 class="k15-roomtitle">'+esc(item.name)+'</h1><span class="k15-grow"></span><div class="k15-head-actions"><button class="k15-ico" type="button">•••</button></div></header><main class="k15-chatbody" id="k15-chatbody">'+aiMessages(item)+(aiTyping?'<div class="k15-message">'+aiAvatar(item)+'<div class="k15-msgstack"><div class="k15-typing"><i></i><i></i><i></i></div></div></div>':'')+(aiError?'<div class="kai-error">'+esc(aiError)+'</div>':'')+retryHTML+'</main><form class="k15-input kai-form" id="kai-form"><button type="button" class="k15-plus">＋</button><label class="k15-inputbox"><input id="kai-input" autocomplete="off" enterkeyhint="send" maxlength="160" placeholder="메시지를 입력하세요"><button class="k15-send" type="submit" aria-label="전송">↑</button></label></form></section></div>';
  requestAnimationFrame(()=>{const body=document.querySelector('#k15-chatbody');if(body)body.scrollTop=body.scrollHeight});
}
function closeAiRoom(){
  aiRequestSequence++;
  aiController?.abort();
  aiController=null;
  aiView='';
  aiTyping=false;
  aiError='';
  aiSending=false;
  if(typeof render==='function')render();
  else window.__KKT15_TEST__?.render?.();
  requestAnimationFrame(()=>{injectEntry();restrictReadOnlyRooms()});
}
function localHash(value){
  let hash=2166136261;
  for(const ch of String(value)){
    hash^=ch.codePointAt(0);
    hash=Math.imul(hash,16777619);
  }
  return hash>>>0;
}
function localPick(list,seed){
  return list[seed%list.length];
}
function localLanguage(textValue){
  const chinese=(textValue.match(/[\u4e00-\u9fff]/g)||[]).length;
  const korean=(textValue.match(/[가-힣]/g)||[]).length;
  return chinese>korean?'zh':'ko';
}
function localIntent(textValue){
  const text=textValue.toLowerCase().replace(/\s+/g,' ').trim();
  const rules=[
    ['hello',/(안녕|하이|ㅎㅇ|뭐해|在吗|你好|嗨|干嘛|做什么)/],
    ['meal',/(밥|먹었|먹을|배고|야식|메뉴|吃饭|吃了|饿|宵夜|吃什么)/],
    ['where',/(어디|위치|왔어|도착|오는 중|在哪|哪里|到了|过来|回来)/],
    ['schedule',/(언제|몇 시|스케줄|일정|끝나|늦어|时间|几点|什么时候|行程|结束|忙完)/],
    ['sleep',/(자니|잘 거|졸려|잠|굿나잇|晚安|睡了|困|睡觉)/],
    ['game',/(게임|한 판|접속|롤|배그|游戏|开黑|上线|打一局)/],
    ['photo',/(사진|셀카|보내|찍어|照片|自拍|发给|拍一张)/],
    ['mood',/(힘들|피곤|지쳐|짜증|우울|좋아|기분|累|烦|难受|开心|心情|不舒服)/],
    ['care',/(괜찮|조심|아프|건강|챙겨|没事吧|小心|生病|身体|照顾)/],
    ['thanks',/(고마|감사|땡큐|谢谢|谢啦)/],
    ['sorry',/(미안|죄송|对不起|抱歉)/],
    ['negative',/(싫어|화났|왜 그래|됐어|몰라|讨厌|生气|算了|烦死|不想)/],
    ['yesno',/(맞아|그래|응|네|아니|아냐|是吗|真的|嗯|不是|对吗)/]
  ];
  for(const [intent,pattern] of rules)if(pattern.test(text))return intent;
  if(/[?？]$/.test(text)||/(왜|어떻게|뭐|누구|가능해|할까|吗|呢|为什么|怎么|谁|能不能|可以)/.test(text))return 'question';
  return text.length<=3?'short':'fallback';
}
const LOCAL_CHAT_LINES={
  sw:{
    ko:{
      hello:['형 뭐 해요 ㅋㅋ','왜요 형','저 그냥 폰 보고 있었어요'],
      meal:['아직요 형은 먹었어요?','뭐 먹을 건데요 저도 껴요','저 지금 메뉴 보고 있어요'],
      where:['지금 연습실 쪽이에요','가는 중인데 왜요','아직 밖이에요 금방 가요'],
      schedule:['끝나는 거 봐야 알 것 같아요','조금 있다가 다시 말해줄게요','오늘은 좀 늦을 수도 있어요'],
      sleep:['아직 안 자요 ㅋㅋ','형도 빨리 자요','조금만 더 있다가 잘게요'],
      game:['콜 형 들어오면 말해요','한 판만 해요 진짜','저 먼저 접속해 있을게요'],
      photo:['사진은 좀 이따 보내줄게요','그걸 왜 보고 싶어요 ㅋㅋ','잘 나온 거 있으면 보내줄게요'],
      mood:['왜요 무슨 일 있었어요?','형 오늘 많이 힘들었어요?','일단 좀 쉬어요'],
      care:['알았어요 형도 챙겨요','저 괜찮아요 걱정 마요','형이나 조심해요 ㅋㅋ'],
      thanks:['갑자기 왜 그래요 ㅋㅋ','네 형','오케이 알겠어요'],
      sorry:['됐어요 신경 쓰지 마요','알겠어요 다음엔 그러지 마요','뭐 그럴 수도 있죠'],
      negative:['왜 화났어요','아니 갑자기 뭐예요','일단 진정해요 형'],
      yesno:['맞아요 ㅋㅋ','아닌 것 같은데요','응 저도 그렇게 생각해요'],
      question:['아마 그런 것 같은데요','잘 모르겠는데 확인해볼게요','형은 어떻게 생각해요?'],
      short:['응 형','왜요','ㅋㅋ 알겠어요'],
      fallback:['아 그 얘기였어요?','형 말이 좀 애매한데 ㅋㅋ','응 보고 있어요']
    },
    zh:{
      hello:['哥你干嘛呢','在啊 怎么了','刚在看手机'],
      meal:['还没吃 哥吃了吗','吃什么啊 我也想吃','我正在看菜单'],
      where:['还在练习室这边','在路上了 怎么了','还在外面 马上回'],
      schedule:['得看什么时候结束','过一会儿再跟你说','今天可能会晚一点'],
      sleep:['还没睡呢ㅋㅋ','哥也早点睡','再待一会儿就睡'],
      game:['可以啊 你上线叫我','就打一局 真的','我先上线等你'],
      photo:['晚点发给你','为什么突然要照片ㅋㅋ','有拍得好的再发'],
      mood:['怎么了 出什么事了','今天很累吗','先休息一下吧'],
      care:['知道了 哥也照顾好自己','我没事 别担心','你才要小心ㅋㅋ'],
      thanks:['突然这么客气干嘛ㅋㅋ','知道了哥','行'],
      sorry:['没事 别想了','知道了 下次别这样','也没多大事'],
      negative:['怎么突然生气了','不是 怎么了','先冷静一下'],
      yesno:['对啊ㅋㅋ','好像不是','嗯 我也这么觉得'],
      question:['应该是吧','我不太清楚 等我确认一下','哥你怎么想'],
      short:['嗯哥','怎么了','ㅋㅋ知道了'],
      fallback:['原来你说这个啊','哥你说得有点模糊ㅋㅋ','嗯 我在看']
    }
  },
  sister:{
    ko:{
      hello:['응 왜','무슨 일이야','나 지금 집이야'],
      meal:['넌 밥 먹었어?','나는 먹었지 너나 챙겨','또 대충 먹은 건 아니지?'],
      where:['나 집이야 넌 어디야','아직 밖이야','가는 중이야 왜'],
      schedule:['끝나면 연락해','몇 시인지는 아직 몰라','너 일정부터 잘 보고 말해'],
      sleep:['이제 자려고','너도 폰 그만 보고 자','늦게까지 있지 마'],
      game:['게임은 적당히 해','또 게임이야?','난 안 해 너나 해'],
      photo:['잘 나온 걸로 보내','사진은 왜','나중에 찾아볼게'],
      mood:['많이 힘들었어?','일단 쉬고 천천히 말해','오늘은 그냥 푹 쉬어'],
      care:['난 괜찮아 너나 조심해','아프면 바로 말해','약 챙겼어?'],
      thanks:['됐어 가족끼리 뭘','알면 됐어','응'],
      sorry:['알았어 다음부터 조심해','됐어 너무 신경 쓰지 마','말했으면 됐어'],
      negative:['왜 또 그래','무슨 일인데','화부터 내지 말고 말해'],
      yesno:['응 맞아','아닌 것 같은데','그래 그러자'],
      question:['그건 네가 정하면 되지','확인해 보고 말해줄게','왜 갑자기 궁금해?'],
      short:['응','왜','알겠어'],
      fallback:['응 계속 말해 봐','그래서 어떻게 됐는데','그 얘기였구나']
    },
    zh:{
      hello:['嗯 怎么了','什么事','我在家'],
      meal:['你吃饭了吗','我吃了 你管好自己','你不会又随便吃了吧'],
      where:['我在家 你在哪','还在外面','在路上 怎么了'],
      schedule:['结束了告诉我','几点还不知道','先看好你自己的行程'],
      sleep:['准备睡了','你也别玩手机了 快睡','别又熬太晚'],
      game:['游戏少玩一点','又打游戏啊','我不玩 你自己玩'],
      photo:['挑张好看的发','突然要照片干嘛','晚点找找看'],
      mood:['很累吗','先休息 再慢慢说','今天就早点休息'],
      care:['我没事 你自己小心','不舒服就马上说','药吃了吗'],
      thanks:['一家人谢什么','知道就好','嗯'],
      sorry:['知道了 下次注意','没事 别一直想','说开了就行'],
      negative:['怎么又这样','出什么事了','别先发火 好好说'],
      yesno:['嗯 对','我觉得不是','行 那就这样'],
      question:['这个你自己决定啊','我确认一下再告诉你','怎么突然问这个'],
      short:['嗯','怎么了','知道了'],
      fallback:['嗯 你继续说','然后呢','原来是这件事']
    }
  },
  jy:{
    ko:{
      hello:['왜 ㅋㅋ','나 그냥 쉬고 있어','뭐 해 너는'],
      meal:['아직 뭐 먹을지 못 정했어','너 먹는 거 보고 정할래','국밥 갈래?'],
      where:['아직 연습실','지금 가는 중','밖인데 왜'],
      schedule:['끝나 봐야 알 듯','조금 늦을 것 같아','정해지면 바로 말할게'],
      sleep:['아직 안 자','너 먼저 자 ㅋㅋ','곧 잘 거야'],
      game:['콜 들어와','한 판만 하고 자자','나 이미 켰어'],
      photo:['그 사진 말하는 거야?','있으면 보내줄게','나중에 골라서 보낼게'],
      mood:['오늘 좀 힘들었냐','너 일단 쉬어','무슨 일 있었어?'],
      care:['난 괜찮아','너나 잘 챙겨','알았어 조심할게'],
      thanks:['뭘 이런 걸로 ㅋㅋ','응','다음에 밥 사'],
      sorry:['됐어 괜찮아','신경 쓰지 마','다음엔 미리 말해'],
      negative:['왜 또 삐졌어','갑자기 왜 그래','말해 봐 무슨 일인데'],
      yesno:['응 맞아','아닌데 ㅋㅋ','그럴 수도 있지'],
      question:['아마 될걸','나도 잘 모르겠어','일단 해 보고 말해'],
      short:['응','왜','ㅋㅋ 알았어'],
      fallback:['뭔 말인지는 알겠어','그래서 너는 어떻게 할 건데','응 계속 말해']
    },
    zh:{
      hello:['怎么了ㅋㅋ','我在休息','你干嘛呢'],
      meal:['还没决定吃什么','看你吃什么再说','去吃汤饭吗'],
      where:['还在练习室','正在过去','在外面 怎么了'],
      schedule:['得结束了才知道','可能会晚一点','定下来马上告诉你'],
      sleep:['还没睡','你先睡ㅋㅋ','马上就睡'],
      game:['可以 上线吧','打一局就睡','我已经开了'],
      photo:['你说那张照片吗','有的话发给你','晚点挑一下再发'],
      mood:['今天很累吗','你先休息','出什么事了'],
      care:['我没事','先管好你自己','知道了 我会小心'],
      thanks:['这有什么好谢的ㅋㅋ','嗯','下次请我吃饭'],
      sorry:['没事','别想太多','下次提前说'],
      negative:['怎么又不高兴了','突然怎么了','说吧 出什么事了'],
      yesno:['嗯 对','不是吧ㅋㅋ','也有可能'],
      question:['应该可以','我也不太清楚','先试试再说'],
      short:['嗯','怎么了','ㅋㅋ知道了'],
      fallback:['我懂你意思了','所以你打算怎么办','嗯 继续说']
    }
  }
};
function localContextReply(item,userText){
  const language=localLanguage(userText);
  const intent=localIntent(userText);
  const replies=LOCAL_CHAT_LINES[item.id]?.[language]||LOCAL_CHAT_LINES[item.id]?.ko;
  const list=replies?.[intent]||replies?.fallback||['응'];
  const seed=localHash(item.id+'|'+userText+'|'+item.messages.length);
  let reply=localPick(list,seed);
  const lastOther=[...item.messages].reverse().find(message=>message[0]==='other')?.[1];
  if(reply===lastOther&&list.length>1)reply=list[(seed+1)%list.length];
  return reply;
}
async function requestAiReply(item,userText){
  const endpoint=location.hostname==='nuyheaj.pages.dev'?'/api/kkt-reply':'https://nuyheaj.pages.dev/api/kkt-reply';
  const history=item.messages
    .filter(message=>message[0]==='mine'||message[0]==='other')
    .slice(0,-1)
    .slice(-12)
    .map(message=>({role:message[0]==='mine'?'user':'model',text:isZh()?(message[5]||message[1]):message[1]}));
  if(window.__IPHONE_AI__?.configured){
    const instruction=(AI_PERSONAS[item.id]||'너는 재현과 가까운 지인이다 자연스럽고 짧은 채팅 말투로 답한다')+' 이것은 팬메이드 가상 휴대폰 속 허구 대화다 '+(isZh()?'현재 언어는 중국어다 자연스럽고 짧은 중국어 채팅체로 답한다 ':'현재 언어는 한국어다 자연스럽고 짧은 한국어 채팅체로 답한다 ')+'직전 대화의 질문과 맥락에 직접 반응한다 한 번에 한두 개의 짧은 메시지만 작성하고 설명문 따옴표 해시태그는 쓰지 않는다';
    return window.__IPHONE_AI__.chat({system:instruction,messages:history,prompt:userText,maxTokens:260});
  }
  const controller=new AbortController();
  aiController=controller;
  const timeout=setTimeout(()=>controller.abort(),10000);
  try{
    let response;
    try{
      response=await fetch(endpoint,{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({chatId:item.id,message:userText,history,language:isZh()?'zh':'ko'}),
        signal:controller.signal
      });
    }catch(error){
      throw new Error(controller.signal.aborted?'upstream_timeout':'upstream_network');
    }
    const type=response.headers.get('content-type')||'';
    if(!type.includes('application/json'))
      throw new Error(response.status===404?'backend_missing':'backend_unavailable');
    const result=await response.json().catch(()=>({}));
    if(!response.ok)
      throw new Error(result.error||(
        response.status===429?'quota_exceeded':
        response.status===404?'backend_missing':
        response.status===503?'model_busy':'request_failed'));
    const reply=typeof result.reply==='string'?result.reply.trim():'';
    if(!reply)throw new Error('empty_reply');
    return reply;
  }finally{
    clearTimeout(timeout);
    if(aiController===controller)aiController=null;
  }
}
function aiFailureText(error){
  const code=String(error?.message||'request_failed');
  const descriptions={
    ai_not_configured:['Gemini 密钥尚未在 Cloudflare 配置。','Cloudflare에 Gemini API 키가 설정되지 않았습니다.'],
    key_or_region_error:['Gemini 密钥无效、权限不足或当前地区不可用。','Gemini API 키, 권한 또는 지역을 확인해 주세요.'],
    quota_exceeded:['Gemini 已达到请求或额度限制，请稍后再试。','Gemini 요청 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.'],
    model_unavailable:['当前模型不可用，请检查 Cloudflare 接口部署。','모델을 사용할 수 없습니다. Cloudflare 배포를 확인해 주세요.'],
    backend_missing:['Cloudflare 的 Gemini 接口尚未部署。','Cloudflare Gemini API가 아직 배포되지 않았습니다.'],
    backend_unavailable:['Cloudflare 返回了异常页面，请检查部署。','Cloudflare 배포 상태를 확인해 주세요.'],
    invalid_configuration:['自定义 API 配置无效，请在设置中检查。','사용자 API 설정을 확인해 주세요.'],
    upstream_timeout:['Gemini 响应超时，可以点击重试。','Gemini 응답 시간이 초과되었습니다. 다시 시도해 주세요.'],
    upstream_network:['无法连接 Gemini 服务，请检查网络后重试。','Gemini 연결에 실패했습니다. 네트워크를 확인해 주세요.'],
    content_blocked:['本次消息无法生成回复。','이 메시지에는 답변을 생성할 수 없습니다.'],
    empty_reply:['Gemini 没有返回有效文本，可以重试。','Gemini에서 답변 내용이 오지 않았습니다. 다시 시도해 주세요.'],
    model_busy:['Gemini 暂时繁忙，可以稍后重试。','Gemini가 일시적으로 혼잡합니다. 잠시 후 다시 시도해 주세요.']
  };
  const text=descriptions[code]||['回复暂时失败，请检查 Cloudflare 部署或稍后重试。','답장을 불러오지 못했습니다. 배포 상태를 확인하거나 잠시 후 다시 시도해 주세요.'];
  return text[isZh()?0:1];
}
const aiWait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function runAiReply(item,userText){
  if(aiSending||aiView!==item.id)return;
  aiSending=true;
  aiError='';
  aiTyping=false;
  const seq=++aiRequestSequence;
  const active=()=>seq===aiRequestSequence&&aiView===item.id;
  renderAiRoom(item.id);
  const pending=requestAiReply(item,userText).then(reply=>({reply}),error=>({error}));
  try{
    await aiWait(2000);
    if(!active())return;
    const mine=item.messages.at(-1);
    if(mine?.[0]==='mine'&&mine[4]==='unread')mine[4]='read';
    aiTyping=true;
    saveKktData();
    renderAiRoom(item.id);
    const typingStarted=Date.now();
    const result=await pending;
    const remaining=Math.max(0,3000-(Date.now()-typingStarted));
    if(remaining)await aiWait(remaining);
    if(!active())return;
    aiTyping=false;
    const reply=result.error?localContextReply(item,userText):result.reply;
    item.messages.push(['other',reply,aiTime()]);
    if(isZh())item.previewZh=reply;
    else item.preview=reply;
    item.time='방금';
    aiError='';
    saveKktData();
  }finally{
    if(active()){
      aiSending=false;
      aiTyping=false;
      aiController=null;
      renderAiRoom(item.id);
    }
  }
}
function retryLastAiReply(){
  if(aiSending||!aiView)return;
  const item=window.__KKT15_TEST__?.data?.find(chat=>chat.id===aiView);
  if(!item)return;
  const last=item.messages.filter(m=>m[0]==='mine'||m[0]==='other').at(-1);
  if(last?.[0]!=='mine'||!String(last[1]||'').trim())return;
  void runAiReply(item,last[1]);
}
function handleAiSubmit(event){
  if(event.target?.id!=='kai-form')return;
  event.preventDefault();
  event.stopPropagation();
  if(aiSending||!aiView)return;
  const userText=document.querySelector('#kai-input')?.value.trim();
  if(!userText)return;
  const item=window.__KKT15_TEST__?.data?.find(chat=>chat.id===aiView);
  if(!item)return;
  item.messages.push(['mine',userText,aiTime(),'','unread']);
  if(isZh())item.previewZh=userText;
  else item.preview=userText;
  item.time='방금';
  saveKktData();
  void runAiReply(item,userText);
}
function restrictReadOnlyRooms(){
  if(aiView||requestView)return;
  const room=document.querySelector('#kkt15 .k15-chatroom');
  const form=room?.querySelector('#k15-form');
  if(!room||!form)return;
  const title=room.querySelector('.k15-roomtitle')?.textContent?.trim()||'';
  if(['xxx','선우','누나','주연'].includes(title))return;
  form.outerHTML='<div class="kai-readonly">읽기 전용 대화</div>';
  room.querySelector('.k15-keyboard')?.remove();
}

function handleClick(event){
  const aiButton=event.target.closest('[data-ai-chat],[data-k15="chat"][data-id],[data-k15="friend"][data-id]');
  if(aiButton){
    const aiId=aiButton.dataset.id;
    if(aiButton.dataset.aiChat==='back'){
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();closeAiRoom();return;
    }
    if(aiButton.dataset.aiChat==='retry'){
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();retryLastAiReply();return;
    }
    if(aiId&&AI_CHAT_IDS.has(aiId)){
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();renderAiRoom(aiId);return;
    }
  }
  const button=event.target.closest('[data-krq]');
  if(!button)return;
  const action=button.dataset.krq;
  if(!action)return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  if(action==='open-list'){listScroll=0;openList()}
  else if(action==='open-room'){
    const list=document.querySelector('#krq-list');
    listScroll=list?.scrollTop||0;
    renderRoom(button.dataset.id);
  }else if(action==='back-main')backToMain();
  else if(action==='back-list')renderList();
  else if(action==='add'){if(!getAction(currentId).added)updateActions({added:true})}
  else if(action==='unblock'){
    if(getAction(currentId).unblocked)updateActions({unblocked:false});
    else{modalAction='unblock';renderRoomWithModal()}
  }else if(action==='report'){
    if(!getAction(currentId).reported){modalAction='report';renderRoomWithModal()}
  }else if(action==='cancel'||action==='dismiss'){if(event.target===button||action==='cancel'){modalAction='';renderRoomWithModal()}}
  else if(action==='confirm'){
    const selected=modalAction;
    modalAction='';
    if(selected==='report')updateActions({reported:true});
    else if(selected==='unblock')updateActions({unblocked:true});
  }
}
function renderRoomWithModal(){
  const id=currentId;
  const selected=modalAction;
  renderRoom(id);
  modalAction=selected;
  const item=current();
  if(item&&selected){
    const root=document.querySelector('#krq-root');
    root?.insertAdjacentHTML('beforeend',modalHTML(item));
  }
}
injectStyles();
injectAiStyles();
removeLegacyRiskChat();
ensureAiChats();
document.addEventListener('click',handleClick,true);
document.addEventListener('submit',handleAiSubmit,true);
const app=document.querySelector('#appcontent');
if(app){
  new MutationObserver(()=>{
    if(typeof mode!=='undefined'&&mode!=='kakao'){
      // Never let an old Gemini response overwrite another app after leaving KKT.
      if(aiView){
        aiRequestSequence++;
        aiController?.abort();
        aiController=null;
        aiView='';
        aiSending=false;
        aiTyping=false;
        aiError='';
      }
      if(requestView){
        requestView='';
        currentId='';
        modalAction='';
      }
    }
    injectEntry();
    restrictReadOnlyRooms();
  }).observe(app,{childList:true,subtree:true});
}
window.addEventListener('iphone26:languagechange',()=>{
  if(aiView)renderAiRoom(aiView);
  else if(requestView==='list')renderList();
  else if(requestView==='room')renderRoom(currentId);
  else{
    document.querySelector('.krq-entry')?.remove();
    requestAnimationFrame(injectEntry);
  }
});
window.addEventListener('pageshow',()=>{removeLegacyRiskChat();injectEntry()});
window.__KKT_REQUESTS__={
  openList,
  openConversation:renderRoom,
  peekNext:peekNextDelivery,
  deliverNext,
  get data(){return visibleConversations()},
  get unread(){return unreadCount()},
  get readState(){return {...readState}},
  get view(){return requestView}
};
requestAnimationFrame(injectEntry);
})();
