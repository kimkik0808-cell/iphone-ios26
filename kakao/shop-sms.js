/* iPhone Messages bridge for fictional KakaoPay purchases. Runs after core app. */
(function(){
'use strict';
if(window.__IPHONE_SMS__)return;
const existing=new Set();
const READ_KEY='iphone26_sms_read_receipts_v1';
let readIds=new Set();
try{readIds=new Set(JSON.parse(localStorage.getItem(READ_KEY)||'[]'))}catch{}
function esc(s){return String(s??'');}
function balance(n){return Math.max(0,Number(n)||0).toLocaleString('ko-KR')+'원';}
function messageTime(at){
 return new Intl.DateTimeFormat(window.IphoneLocale?.language==='zh'?'zh-CN':'ko-KR',{hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(at||Date.now()));
}
function update(receipts){
 if(!Array.isArray(receipts)||typeof texts==='undefined'||!Array.isArray(texts))return;
 const openChat=(typeof mode!=='undefined'&&mode==='messages'&&sub==='chat')?texts[currentThread]:null;
 let added=0;
 for(const e of receipts.slice().sort((a,b)=>(a.at||0)-(b.at||0))){
  if(!e||typeof e.id!=='string'||existing.has(e.id)||!['purchase','gift','bank'].includes(e.type))continue;
  existing.add(e.id);
  const gift=e.type==='gift',bank=e.type==='bank',name=bank?(e.bank||'카카오뱅크'):gift?'카카오 선물하기':'카카오페이';
  const zh=window.IphoneLocale?.language==='zh';
  const message=zh?(bank?'[银行转账支出]\n支出金额 '+balance(e.amount)+'\n收款人 '+esc(e.recipient||'')+'\n账户 '+esc(e.account||'')+'\n转账后余额 '+balance(e.balance):gift?'[Kakao礼物]\n已向'+esc(e.recipient||'朋友')+'发送 '+esc(e.item||'礼物')+'\n订单号 '+e.id.replace(/-gift$/,''):'[KakaoPay支付完成]\n商品 '+esc(e.item||'礼物')+'\n支付金额 '+balance(e.price)+'\n支付后余额 '+balance(e.balance)+'\n订单号 '+e.id):bank?
   '[은행 이체출금]\n출금 금액 '+balance(e.amount)+'\n받는 분 '+esc(e.recipient||'')+'\n계좌 '+esc(e.account||'')+'\n출금 후 잔액 '+balance(e.balance):gift?
   '[카카오 선물하기]\n'+esc(e.recipient||'친구')+'님에게 '+esc(e.item||'선물')+' 선물 발송 완료\n주문번호 '+e.id.replace(/-gift$/,''):
   '[카카오페이 결제 완료]\n상품 '+esc(e.item||'선물')+'\n결제 금액 '+balance(e.price)+'\n결제 후 잔액 '+balance(e.balance)+'\n주문번호 '+e.id;
  let thread=texts.find(t=>t.shopSender===name);
  if(!thread){
   thread={name,initial:'K',color:'#f9dd49',preview:'',time:'방금',chat:[],unread:false,shopSender:name,receiptIds:[]};
   texts.unshift(thread);
  }
  thread.receiptIds=Array.isArray(thread.receiptIds)?thread.receiptIds:[];
  if(!thread.receiptIds.includes(e.id))thread.receiptIds.push(e.id);
  thread.chat.push(['other',message,messageTime(e.at)]);
  thread.preview=message.split('\n')[0];
  thread.time='방금';if(!readIds.has(e.id))thread.unread=true;added++;
 }
 if(openChat)currentThread=texts.indexOf(openChat);
 if(added&&typeof mode!=='undefined'&&mode==='messages'&&typeof render==='function')render();
}
function notify(event){
 if(!event||(!event.story&&window.__IOS26_NOTIFICATIONS__?.enabled===false)||document.hidden)return;
 if(window.__IOS26_NOTIFICATIONS__?.showSMS){
  window.__IOS26_NOTIFICATIONS__.showSMS(event);
  return;
 }
}
function markRead(thread){
 if(!thread)return;
 thread.unread=false;
 for(const id of thread.receiptIds||[])readIds.add(id);
 try{localStorage.setItem(READ_KEY,JSON.stringify([...readIds]))}catch{}
}
window.__IPHONE_SMS__={sync:update,notify,markRead};
})();
