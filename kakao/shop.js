/* KakaoTalk gift shop: local-only fictional wallet, gift coupons, and iPhone SMS receipts. */
(function(){
'use strict';
if(window.__KKT_SHOP__)return;
const STORAGE='jh_kkt_shop_v1';
const START=680000;
const PRODUCTS=[
 {id:'coffee',ko:'아메리카노 T',zh:'美式咖啡（中杯）',kind:'카페',emoji:'☕',price:4500,bg:'#f6e0cc',desc:'따뜻한 커피 한 잔을 선물해요.'},
 {id:'cake',ko:'딸기 케이크 세트',zh:'草莓蛋糕套餐',kind:'디저트',emoji:'🍰',price:12800,bg:'#f9e0e9',desc:'달콤한 디저트 선물.'},
 {id:'chicken',ko:'치킨 한 마리 교환권',zh:'整只炸鸡兑换券',kind:'푸드',emoji:'🍗',price:25900,bg:'#faeac6',desc:'퇴근 후 맛있게 먹어요.'},
 {id:'movie',ko:'영화 관람권 1매',zh:'电影票兑换券（1张）',kind:'문화',emoji:'🎟️',price:15000,bg:'#e3ddfa',desc:'좋은 영화 한 편.'},
 {id:'flowers',ko:'오늘의 꽃다발',zh:'今日鲜花花束',kind:'라이프',emoji:'💐',price:35900,bg:'#e0f0da',desc:'작은 마음을 담아 전해요.'},
 {id:'perfume',ko:'미니 향수 기프트 세트',zh:'迷你香水礼盒',kind:'뷰티',emoji:'🧴',price:59500,bg:'#dceafa',desc:'은은한 향기의 선물.'},
 {id:'snack',ko:'편의점 모바일 금액권',zh:'便利店电子礼券',kind:'쿠폰',emoji:'🍫',price:10000,bg:'#f4e5c8',desc:'언제든 필요한 간식.'},
 {id:'tea',ko:'티 & 쿠키 세트',zh:'茶饮与曲奇礼盒',kind:'카페',emoji:'🍵',price:16900,bg:'#dfefe4',desc:'쉬는 날의 여유.'}
];
const t=(ko,zh)=>window.IphoneLocale?.language==='zh'?zh:ko;
const money=n=>Math.max(0,Math.floor(Number(n)||0)).toLocaleString('ko-KR')+'원';
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const getItem=id=>PRODUCTS.find(p=>p.id===id);
function load(){
 try{
  const s=JSON.parse(localStorage.getItem(STORAGE)||'null');
  if(s&&Array.isArray(s.orders))return {
    orders:s.orders.filter(o=>o&&typeof o.id==='string'&&getItem(o.itemId)&&Number(o.price)===getItem(o.itemId).price).slice(-200),
    topups:Array.isArray(s.topups)?s.topups.filter(v=>Number.isFinite(v)&&v===100000).slice(-50):[]
  };
 }catch{}
 return {orders:[],topups:[]};
}
let state=load();
const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch{}};
const totalSpent=()=>state.orders.reduce((sum,o)=>sum+o.price,0);
const balance=()=>Math.max(0,START+state.topups.reduce((sum,v)=>sum+v,0)-totalSpent());
const contacts=()=>{
 const from=window.__KKT15_TEST__?.contacts||[];
 const chats=window.__KKT15_TEST__?.data||[];
 const result=[],ids=new Set();
 for(const c of [{id:'nuna',name:'누나'},...from,...chats]){
  if(!c?.id||!c.name||ids.has(c.id)||c.id==='unknown'||c.id==='tbz'||c.id==='stage')continue;
  ids.add(c.id);result.push({id:c.id,name:c.name});
 }
 return result;
};
let page='home', selected='coffee', orderId='', intent='self', recipient='', active=false, category='전체';
const currentOrder=()=>state.orders.find(o=>o.id===orderId)||null;
const iconTab=(emoji,label,key)=>'<button type="button" data-k15="tab" data-v="'+key+'"><span style="font-size:21px">'+emoji+'</span><span>'+label+'</span></button>';
function bottom(){
 return '<nav class="k15-bottom">'+iconTab('♟',t('친구','好友'),'friends')+
 iconTab('▤',t('채팅','聊天'),'chats')+iconTab('◉',t('오픈채팅','开放聊天'),'open')+
 '<button type="button" data-kshop="home" class="active"><span style="font-size:21px">🛍</span><span>'+t('쇼핑','购物')+'</span></button>'+
 iconTab('•••',t('더보기','更多'),'more')+'</nav>';
}
function button(action,text,cls=''){
 return '<button type="button" data-kshop="'+action+'" class="ks-btn '+cls+'">'+text+'</button>';
}
function productCard(p){
 return '<button type="button" class="ks-product" data-kshop="product" data-id="'+p.id+'">'+
 '<span class="ks-art" style="background:'+p.bg+'">'+p.emoji+'</span>'+
 '<span class="ks-product-name">'+safe(t(p.ko,p.zh))+'</span>'+
 '<span class="ks-price">'+money(p.price)+'</span></button>';
}
function orderRow(o){
 const p=getItem(o.itemId);if(!p)return '';
 return '<button class="ks-order" data-kshop="order" data-id="'+safe(o.id)+'">'+
 '<span class="ks-order-art" style="background:'+p.bg+'">'+p.emoji+'</span>'+
 '<span><strong>'+safe(t(p.ko,p.zh))+'</strong><small>'+new Date(o.at).toLocaleDateString('ko-KR')+
 (o.recipient?' · '+safe(t('선물 완료','已赠送')):' · '+safe(t('구매 완료','已购买')))+'</small></span>'+
 '<b>'+money(o.price)+'</b><i>›</i></button>';
}
function catalog(){
 const visible=PRODUCTS.filter(p=>category==='전체'||p.kind===category);
 const chips=['전체','카페','디저트','푸드','문화','라이프','뷰티','쿠폰'];
 return '<section class="ks-hero"><small>kakao<span>pay</span> · '+t('모의 잔액','模拟余额')+'</small>'+
 '<strong>'+money(balance())+'</strong>'+button('wallet',t('잔액 · 결제 내역 보기 ›','查看余额与交易 ›'),'ks-light')+'</section>'+
 '<div class="ks-section"><h2>'+t('마음을 전하는 선물','把心意送给朋友')+'</h2><p>'+t('친구에게 보내거나 직접 구매해 보세요.','可自行购买，也可以赠送好友。')+'</p></div>'+
 '<div class="ks-categories">'+chips.map(c=>'<button class="'+(c===category?'chosen':'')+'" data-kshop="category" data-id="'+c+'">'+
 safe(c==='전체'?t('전체','全部'):c)+'</button>').join('')+'</div>'+
 '<div class="ks-grid">'+visible.map(productCard).join('')+'</div>'+
 button('orders',t('선물함 · 구매 내역','礼物盒 · 购买记录'),'ks-outline');
}
function detail(){
 const p=getItem(selected);if(!p)return catalog();
 return '<div class="ks-detail-art" style="background:'+p.bg+'">'+p.emoji+'</div>'+
 '<div class="ks-section"><small>'+safe(p.kind)+'</small><h2>'+safe(t(p.ko,p.zh))+'</h2><strong class="ks-huge">'+money(p.price)+'</strong><p>'+safe(t(p.desc,'虚拟电子礼券。购买后可赠送 KakaoTalk 联系人。'))+'</p></div>'+
 '<div class="ks-infocard">'+t('모바일 교환권 · 구매 후 선물 가능','电子礼券 · 购买后可赠送')+'</div>'+
 button('checkout',t('구매하기','立即购买'),'ks-primary')+
 button('choose-before',t('친구에게 선물하기','购买并送给好友'),'ks-outline');
}
function checkout(){
 const p=getItem(selected);if(!p)return catalog();
 const who=contacts().find(c=>c.id===recipient);
 return '<div class="ks-section"><h2>'+t('결제 확인','确认支付')+'</h2><p>'+t('실제 결제가 발생하지 않는 체험용 화면입니다.','此页面仅模拟付款，不会产生真实扣款。')+'</p></div>'+
 '<div class="ks-payment-line"><span>'+p.emoji+' '+safe(t(p.ko,p.zh))+'</span><b>'+money(p.price)+'</b></div>'+
 (intent==='gift'?'<div class="ks-payment-line"><span>'+t('받는 친구','赠送对象')+'</span><strong>'+safe(who?.name||'—')+'</strong></div>':'')+
 '<div class="ks-infocard"><b>kakao<span>pay</span></b><p>'+t('현재 잔액','当前余额')+'　'+money(balance())+'</p>'+
 '<p>'+t('결제 후 잔액','支付后余额')+'　'+money(balance()-p.price)+'</p></div>'+
 (balance()<p.price?'<p class="ks-warning">'+t('잔액이 부족합니다. 모의 충전 후 다시 시도해 주세요.','余额不足，请先模拟充值。')+'</p>'+
 button('wallet',t('잔액 확인 · 체험 충전','查看余额并模拟充值'),'ks-outline'):
 button('purchase',t('결제하기 · '+money(p.price),'确认模拟付款 · '+money(p.price)),'ks-primary'))+
 button('back',t('뒤로','返回'),'ks-outline');
}
function success(){
 const o=currentOrder(),p=o&&getItem(o.itemId);if(!p)return catalog();
 const who=contacts().find(c=>c.id===o.recipient);
 return '<div class="ks-success"><div class="ks-check">✓</div><h2>'+t('결제가 완료됐어요','模拟付款成功')+'</h2>'+
 '<p>'+money(o.price)+' · '+safe(t(p.ko,p.zh))+'</p>'+
 '<small>'+t('아이폰 메시지 앱에 결제 안내가 도착했어요.','付款通知已写入 iPhone“信息”App。')+'</small></div>'+
 (o.recipient?'<div class="ks-infocard">'+t('선물 받는 친구','赠送对象')+'：'+safe(who?.name||o.recipient)+'</div>':
 button('choose-after',t('🎁 구매한 상품 선물하기','🎁 把买好的商品送给联系人'),'ks-primary'))+
 button('wallet',t('잔액 · 결제 내역 보기','查看余额及交易'),'ks-outline')+
 button('home',t('쇼핑 계속하기','继续购物'),'ks-outline');
}
function recipients(){
 const options=contacts();
 return '<div class="ks-section"><h2>'+t('받는 친구 선택','选择赠送联系人')+'</h2><p>'+
 t('선물을 받을 친구를 선택해 주세요.','请选择接收礼物的 KakaoTalk 联系人。')+'</p></div>'+
 '<div class="ks-recipients">'+options.map(c=>'<button data-kshop="recipient" data-id="'+safe(c.id)+'" class="'+(recipient===c.id?'picked':'')+'">'+
 '<span class="ks-avatar">'+safe(c.name.slice(0,1))+'</span><strong>'+safe(c.name)+'</strong><span>'+(recipient===c.id?'✓':'○')+'</span></button>').join('')+'</div>'+
 button('recipient-next',t('확인','确定'),'ks-primary')+button('back',t('뒤로','返回'),'ks-outline');
}
function wallet(){
 return '<section class="ks-hero"><small>kakao<span>pay</span> · '+t('내 지갑','我的钱包')+'</small>'+
 '<strong>'+money(balance())+'</strong><p>'+t('이 잔액은 실제 자산이 아닌 가상 금액입니다.','余额为虚构演示金额，不是真实资产。')+'</p></section>'+
 '<div class="ks-stats"><div><small>'+t('총 결제액','累计消费')+'</small><b>'+money(totalSpent())+'</b></div><div><small>'+
 t('결제 건수','购买次数')+'</small><b>'+state.orders.length+'</b></div></div>'+
 button('topup',t('＋ 100,000원 체험 충전','＋ 模拟充值 100,000 韩元'),'ks-outline')+
 '<div class="ks-section"><h2>'+t('최근 결제 내역','最近消费')+'</h2></div>'+
 (state.orders.length?state.orders.slice().reverse().map(orderRow).join(''):'<p class="ks-empty">'+t('결제 내역이 없습니다.','暂无购买记录')+'</p>');
}
function orders(){
 return '<div class="ks-section"><h2>'+t('구매한 선물','已购买礼物')+'</h2><p>'+
 t('구매한 상품은 친구에게 한 번 선물할 수 있어요.','每笔已购买礼物可以赠送给一位联系人。')+'</p></div>'+
 (state.orders.length?state.orders.slice().reverse().map(orderRow).join(''):'<p class="ks-empty">'+t('아직 구매 내역이 없어요.','还没有购买记录')+'</p>');
}
function orderDetail(){
 const o=currentOrder(),p=o&&getItem(o.itemId);if(!p)return orders();
 const who=contacts().find(c=>c.id===o.recipient);
 return '<div class="ks-detail-art" style="background:'+p.bg+'">'+p.emoji+'</div>'+
 '<div class="ks-section"><h2>'+safe(t(p.ko,p.zh))+'</h2><strong class="ks-huge">'+money(o.price)+'</strong><p>'+
 t('주문번호','订单号')+'：'+safe(o.id)+'</p><p>'+t('구매 시각','购买时间')+'：'+new Date(o.at).toLocaleString('ko-KR')+'</p></div>'+
 (o.recipient?'<div class="ks-infocard">'+t('선물 완료','礼物已送出')+' · '+safe(who?.name||o.recipient)+'</div>':
 button('choose-after',t('이 상품 선물하기','把这份礼物送给联系人'),'ks-primary'))+
 button('orders',t('선물함으로','返回礼物盒'),'ks-outline');
}
function draw(){
 if(typeof mode==='undefined'||mode!=='kakao')return;
 const app=document.querySelector('#appcontent');if(!app)return;
 active=true;
 const content=page==='detail'?detail():page==='checkout'?checkout():page==='success'?success():
 page==='recipients'?recipients():page==='wallet'?wallet():page==='orders'?orders():page==='order'?orderDetail():catalog();
 const main=page==='home';
 app.innerHTML='<div id="kkt15"><section id="kshop-root" class="kshop">'+
 '<header class="ks-header">'+(main?'<b>'+t('쇼핑','购物')+'</b>':
 '<button data-kshop="back" class="ks-back">‹</button><b>'+
 safe(({detail:t('상품 정보','商品详情'),checkout:t('결제','付款'),recipients:t('친구 선택','选择好友'),success:t('구매 완료','购买完成'),wallet:'kakaoPay',orders:t('선물함','礼物盒'),order:t('주문 정보','订单详情')})[page]||'쇼핑')+'</b>')+
 '<span class="ks-headright">'+(main?button('orders','🎁','ks-plain')+button('wallet','₩','ks-plain'):'')+'</span></header>'+
 '<div class="ks-scroll">'+content+'<p class="ks-disclaimer">'+t('팬메이드 가상 화면 · 실제 결제 및 발송 없음','同人虚拟界面 · 不产生真实付款或发送')+'</p></div>'+
 bottom()+'</section></div>';
}
function open(next='home'){
 if(typeof mode==='undefined'||mode!=='kakao')return;
 page=next;draw();
}
function smsEvents(){
 return state.orders.flatMap(o=>{
  const p=getItem(o.itemId);
  const purchase={id:o.id,sender:'카카오페이',type:'purchase',item:t(p.ko,p.zh),price:o.price,balance:o.balanceAfter,at:o.at};
  if(!o.recipient)return [purchase];
  return [purchase,{id:o.id+'-gift',sender:'카카오 선물하기',type:'gift',item:t(p.ko,p.zh),
   recipient:contacts().find(c=>c.id===o.recipient)?.name||o.recipient,at:o.giftedAt||o.at}];
 });
}
function syncSMS(){window.__IPHONE_SMS__?.sync?.(smsEvents());}
function assignGift(o,id){
 if(!o||o.recipient||!contacts().some(c=>c.id===id))return false;
 o.recipient=id;o.giftedAt=Date.now();save();
 const p=getItem(o.itemId);
 const data=window.__KKT15_TEST__?.data;
 if(Array.isArray(data)){
  let chat=data.find(c=>c.id===id);
  if(!chat){
   const c=contacts().find(x=>x.id===id);
   chat={id,name:c?.name||id,type:'friend',tag:'친구',giftChat:true,preview:'',time:'방금',unread:0,members:1,messages:[]};
   data.push(chat);
  }
  if(!Array.isArray(chat.messages))chat.messages=[];
  if(!chat.messages.some(m=>m[5]==='gift:'+o.id)){
   const text='🎁 [선물하기] '+p.ko+' · '+money(p.price)+'\n'+t('선물을 보냈어요!','礼物已送出！');
   chat.messages.push(['mine',text,new Intl.DateTimeFormat('ko-KR',{hour:'numeric',minute:'2-digit',hour12:true}).format(new Date()),'','read','gift:'+o.id]);
   chat.preview=text;chat.time='방금';
   try{localStorage.setItem('jh_kkt15',JSON.stringify(data))}catch{}
  }
 }
 syncSMS();
 return true;
}
function restoreGiftChats(){
 const list=window.__KKT15_TEST__?.data;
 if(!Array.isArray(list))return;
 for(const o of state.orders){
  if(!o.recipient)continue;
  const p=getItem(o.itemId),found=list.find(c=>c.id===o.recipient);
  if(!p)continue;
  let c=found;
  if(!c){
   const who=contacts().find(x=>x.id===o.recipient);
   c={id:o.recipient,name:who?.name||o.recipient,type:'friend',tag:'친구',giftChat:true,preview:'',time:'방금',unread:0,members:1,messages:[]};
   list.push(c);
  }
  if(!Array.isArray(c.messages))c.messages=[];
  if(c.messages.some(m=>m[5]==='gift:'+o.id))continue;
  const msg='🎁 [선물하기] '+p.ko+' · '+money(o.price)+'\n선물을 보냈어요!';
  c.messages.push(['mine',msg,'오후 9:00','','read','gift:'+o.id]);c.preview=msg;c.time='방금';
 }
 try{localStorage.setItem('jh_kkt15',JSON.stringify(list))}catch{}
}
function purchase(){
 const p=getItem(selected);
 if(!p||balance()<p.price)return;
 const id='KS'+Date.now().toString(36).toUpperCase()+Math.floor(Math.random()*10000).toString(36).toUpperCase();
 const o={id,itemId:p.id,price:p.price,at:Date.now(),balanceAfter:balance()-p.price,recipient:null};
 state.orders.push(o);save();
 orderId=id;syncSMS();
 if(intent==='gift'&&recipient)assignGift(o,recipient);
 page='success';draw();
}
function back(){
 if(page==='detail')page='home';
 else if(page==='checkout')page=intent==='gift'?'recipients':'detail';
 else if(page==='recipients')page=intent==='gift'?'detail':(currentOrder()?'success':'detail');
 else if(page==='order')page='orders';
 else page='home';
 draw();
}
document.addEventListener('click',function(e){
 const shopTab=e.target.closest('[data-k15="tab"][data-v="shop"]');
 if(shopTab && typeof mode!=='undefined'&&mode==='kakao'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();open('home');return;
 }
 const btn=e.target.closest('[data-kshop]');
 if(!btn||typeof mode==='undefined'||mode!=='kakao')return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const action=btn.dataset.kshop,id=btn.dataset.id;
 if(action==='home'){page='home';category='전체';}
 else if(action==='product'){selected=id;page='detail';}
 else if(action==='category'){category=id;page='home';}
 else if(action==='wallet'||action==='balance'||action==='pay'){page='wallet';}
 else if(action==='orders'){page='orders';}
 else if(action==='order'){orderId=id;page='order';}
 else if(action==='checkout'){intent='self';recipient='';page='checkout';}
 else if(action==='choose-before'){intent='gift';recipient='';page='recipients';}
 else if(action==='choose-after'){intent='after';recipient='';page='recipients';}
 else if(action==='recipient'){recipient=id;page='recipients';}
 else if(action==='recipient-next'){
  if(!recipient)return;
  if(intent==='gift')page='checkout';
  else{
   if(!assignGift(currentOrder(),recipient))return;
   page='success';
  }
 }else if(action==='purchase'){purchase();return;}
 else if(action==='topup'){state.topups.push(100000);save();page='wallet';}
 else if(action==='gift'){page='home';category='전체';}
 else if(action==='back'){back();return;}
 else return;
 draw();
},true);
window.addEventListener('iphone26:languagechange',function(){if(active&&typeof mode!=='undefined'&&mode==='kakao'&&document.querySelector('#kshop-root'))draw()});
window.__KKT_SHOP__={
 get balance(){return balance()},
 balanceText:()=>money(balance()),
 get orders(){return state.orders.map(o=>({...o}))},
 open, getProducts:()=>PRODUCTS.map(p=>({...p})),
 purchaseForTest:(productId)=>{selected=productId;intent='self';recipient='';purchase();},
 sync:syncSMS
};
restoreGiftChats();
syncSMS();
})();