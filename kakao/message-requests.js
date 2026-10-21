(function(){
'use strict';
if(window.__KKT_REQUESTS_LOADED__)return;
window.__KKT_REQUESTS_LOADED__=true;
const conversations=Array.isArray(window.KKT_REQUEST_CONVERSATIONS)?window.KKT_REQUEST_CONVERSATIONS:[];
if(!conversations.length)return;
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
const unreadCount=()=>conversations.reduce((n,item)=>n+(readState[item.id]?0:1),0);
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
  .krq-room-head{height:93px;flex:0 0 93px;display:flex;flex-direction:column;background:#b8cad8;border:0}.krq-room-top{height:50px;width:100%;display:flex;align-items:center;padding:0 10px}.krq-room-top>button{width:38px;height:42px;background:transparent;color:#20262b;font-size:34px;line-height:1;text-align:left}.krq-room-name{font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;text-align:center;padding-right:38px}
  .krq-actions{height:43px;width:100%;display:flex;justify-content:center;gap:9px;padding:4px 10px 7px}.krq-actions button{height:31px;padding:0 14px;border-radius:16px;background:rgba(255,255,255,.78);color:#30363a;font-size:12px;font-weight:650}.krq-actions button.danger{color:#d8373f}.krq-actions button.done{color:#8b8f92;background:rgba(255,255,255,.55)}
  .krq-chat{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;background:#b8cad8;padding:13px 13px max(30px,env(safe-area-inset-bottom))}
  .krq-date{text-align:center;margin:2px 0 17px}.krq-date span{display:inline-block;background:rgba(74,90,102,.35);color:#fff;font-size:10.5px;padding:5px 10px;border-radius:12px}
  .krq-message-row{display:flex;align-items:flex-start;gap:8px;margin:0 0 7px}.krq-message-row.follow{padding-left:42px;margin-top:-2px}.krq-message-block{max-width:76%;display:flex;flex-direction:column;gap:3px}.krq-sender{font-size:11.5px;color:#3e464c;margin:0 0 1px 2px}.krq-bubble-line{display:flex;align-items:flex-end;gap:5px}.krq-bubble{background:#fff;color:#17191b;border-radius:4px 11px 11px 11px;padding:8px 10px;font-size:14px;line-height:1.38;word-break:break-word;box-shadow:0 .5px 0 rgba(0,0,0,.06)}.krq-message-row.follow .krq-bubble{border-radius:11px}.krq-bubble-line time{font-size:9.5px;color:#5d6870;white-space:nowrap;margin-bottom:1px}
  .krq-empty-input{height:49px;flex:0 0 49px;background:#fff;display:flex;align-items:center;padding:7px 11px calc(7px + env(safe-area-inset-bottom));color:#aaa;font-size:13px;border-top:1px solid rgba(0,0,0,.06)}
  .krq-empty-input span{height:34px;flex:1;border:1px solid #e3e3e6;border-radius:17px;display:flex;align-items:center;padding:0 13px}
  .krq-modal{position:absolute;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:flex-end;z-index:9;padding:0 10px calc(9px + env(safe-area-inset-bottom))}
  .krq-sheet{width:100%;background:#f8f8fa;border-radius:15px;overflow:hidden;box-shadow:0 12px 35px rgba(0,0,0,.2)}.krq-sheet-copy{padding:20px 18px;text-align:center}.krq-sheet-copy strong{display:block;font-size:16px;margin-bottom:7px}.krq-sheet-copy p{margin:0;color:#707078;font-size:13px;line-height:1.45}.krq-sheet-actions{display:flex;border-top:1px solid #dddde0}.krq-sheet-actions button{height:49px;flex:1;background:#fff;color:#1677df;font-size:15px}.krq-sheet-actions button+button{border-left:1px solid #dddde0}.krq-sheet-actions .danger{color:#e13942}
  @media(max-height:700px){.krq-row{min-height:67px}.krq-room-head{height:88px;flex-basis:88px}}
  `;
  document.head.appendChild(style);
}
function entryHTML(){
  const count=unreadCount();
  return '<button class="krq-entry" type="button" data-krq="open-list"><span class="krq-entry-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.3c5.45 0 9.65 3.38 9.65 7.85 0 4.48-4.2 7.86-9.65 7.86-.72 0-1.43-.06-2.1-.18L5.36 21.1c-.52.37-1.19-.12-.99-.73l1.21-3.65c-2.04-1.43-3.23-3.78-3.23-6.57C2.35 5.68 6.55 2.3 12 2.3z"/></svg></span><span class="krq-entry-text"><strong>'+esc(unknownTitle())+'</strong><span>친구로 등록되지 않은 사용자의 메시지 요청</span></span>'+(count?'<i class="krq-entry-count">'+count+'</i>':'')+'</button>';
}
function injectEntry(){
  if(requestView||typeof mode==='undefined'||mode!=='kakao')return;
  const api=window.__KKT15_TEST__;
  if(api?.tab!=='chats'||api?.view)return;
  const root=document.querySelector('#kkt15');
  const scroll=root?.querySelector('.k15-scroll');
  if(!scroll||scroll.querySelector('.krq-entry'))return;
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
  const rows=conversations.map(item=>{
    const latest=item.messages[item.messages.length-1];
    const unread=!readState[item.id];
    return '<button class="krq-row" type="button" data-krq="open-room" data-id="'+esc(item.id)+'">'+avatar(item)+'<span class="krq-row-main"><strong>'+esc(item.name)+'</strong><p>'+esc(latest.text)+'</p></span><span class="krq-row-meta"><time>'+esc(item.latestTime)+'</time>'+(unread?'<i class="krq-unread">'+item.messages.length+'</i>':'')+'</span></button>';
  }).join('');
  app.innerHTML='<section id="krq-root"><header class="krq-head"><button type="button" aria-label="뒤로" data-krq="back-main">‹</button><div class="krq-title"><strong>'+esc(unknownTitle())+'</strong><small>'+unreadCount()+'</small></div></header><main class="krq-list" id="krq-list"><div class="krq-summary">메시지 요청 '+conversations.length+'개</div>'+rows+'</main></section>';
  requestAnimationFrame(()=>{const list=document.querySelector('#krq-list');if(list)list.scrollTop=listScroll});
}
function getAction(id){return actionState[id]||{added:false,unblocked:false,reported:false}}
function actionButtons(item){
  const a=getAction(item.id);
  return '<div class="krq-actions"><button type="button" data-krq="add" class="'+(a.added?'done':'')+'">'+(a.added?'추가됨':'추가')+'</button><button type="button" data-krq="unblock" class="'+(a.unblocked?'done':'')+'">'+(a.unblocked?'차단':'차단해제')+'</button><button type="button" data-krq="report" class="'+(a.reported?'done':'danger')+'">'+(a.reported?'신고됨':'신고')+'</button></div>';
}
function modalHTML(item){
  if(!modalAction)return '';
  const isReport=modalAction==='report';
  return '<div class="krq-modal" data-krq="dismiss"><section class="krq-sheet" role="dialog" aria-modal="true"><div class="krq-sheet-copy"><strong>'+(isReport?'이 대화를 신고할까요?':'차단을 해제할까요?')+'</strong><p>'+(isReport?'신고 처리 후 이 대화는 신고 상태로 표시됩니다':'차단을 해제하면 이 사용자의 메시지를 다시 받을 수 있습니다')+'</p></div><div class="krq-sheet-actions"><button type="button" data-krq="cancel">취소</button><button type="button" class="'+(isReport?'danger':'')+'" data-krq="confirm">'+(isReport?'신고':'차단해제')+'</button></div></section></div>';
}
function renderRoom(id){
  const item=conversations.find(x=>x.id===id);
  if(!item){renderList();return}
  requestView='room';
  currentId=id;
  modalAction='';
  readState[id]=true;
  saveRead();
  const app=document.querySelector('#appcontent');
  if(!app)return;
  const messages=item.messages.map((message,index)=>{
    const first=index===0;
    return '<div class="krq-message-row '+(first?'':'follow')+'">'+(first?avatar(item,true):'')+'<div class="krq-message-block">'+(first?'<div class="krq-sender">'+esc(item.name)+'</div>':'')+'<div class="krq-bubble-line"><div class="krq-bubble">'+esc(message.text)+'</div><time>'+esc(message.time)+'</time></div></div></div>';
  }).join('');
  app.innerHTML='<section id="krq-root"><header class="krq-room-head"><div class="krq-room-top"><button type="button" aria-label="뒤로" data-krq="back-list">‹</button><div class="krq-room-name">'+esc(item.name)+'</div></div>'+actionButtons(item)+'</header><main class="krq-chat" id="krq-chat"><div class="krq-date"><span>오늘</span></div>'+messages+'</main><div class="krq-empty-input"><span>메시지를 입력하세요</span></div>'+modalHTML(item)+'</section>';
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
  window.__KKT15_TEST__?.render?.();
  requestAnimationFrame(injectEntry);
}
function handleClick(event){
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
removeLegacyRiskChat();
document.addEventListener('click',handleClick,true);
const app=document.querySelector('#appcontent');
if(app){
  new MutationObserver(()=>{
    if(typeof mode!=='undefined'&&mode!=='kakao'&&requestView){
      requestView='';
      currentId='';
      modalAction='';
    }
    injectEntry();
  }).observe(app,{childList:true,subtree:true});
}
window.addEventListener('iphone26:languagechange',()=>{
  if(requestView==='list')renderList();
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
  get data(){return conversations},
  get unread(){return unreadCount()},
  get readState(){return {...readState}},
  get view(){return requestView}
};
requestAnimationFrame(injectEntry);
})();