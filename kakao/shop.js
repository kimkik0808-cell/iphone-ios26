/* KakaoTalk gift shop: fictional wallet, gift coupons, AI search, and iPhone SMS receipts. */
(function(){
'use strict';
if(window.__KKT_SHOP__)return;
const STORAGE='jh_kkt_shop_v1';
const AI_STORAGE='jh_kkt_shop_ai_products_v1';
const START=1680000;
const STATIC_PRODUCTS=[
 {id:'coffee',ko:'아메리카노 T',zh:'美式咖啡（中杯）',kind:'카페',emoji:'☕',price:4500,bg:'#f6e0cc',desc:'따뜻한 커피 한 잔을 선물해요.'},
 {id:'cake',ko:'딸기 케이크 세트',zh:'草莓蛋糕套餐',kind:'디저트',emoji:'🍰',price:12800,bg:'#f9e0e9',desc:'달콤한 디저트 선물.'},
 {id:'chicken',ko:'치킨 한 마리 교환권',zh:'整只炸鸡兑换券',kind:'푸드',emoji:'🍗',price:25900,bg:'#faeac6',desc:'퇴근 후 맛있게 먹어요.'},
 {id:'movie',ko:'영화 관람권 1매',zh:'电影票兑换券（1张）',kind:'문화',emoji:'🎟️',price:15000,bg:'#e3ddfa',desc:'좋은 영화 한 편.'},
 {id:'flowers',ko:'오늘의 꽃다발',zh:'今日鲜花花束',kind:'라이프',emoji:'💐',price:35900,bg:'#e0f0da',desc:'작은 마음을 담아 전해요.'},
 {id:'perfume',ko:'미니 향수 기프트 세트',zh:'迷你香水礼盒',kind:'뷰티',emoji:'🧴',price:59500,bg:'#dceafa',desc:'은은한 향기의 선물.'},
 {id:'snack',ko:'편의점 모바일 금액권',zh:'便利店电子礼券',kind:'쿠폰',emoji:'🍫',price:10000,bg:'#f4e5c8',desc:'언제든 필요한 간식.'},
 {id:'tea',ko:'티 & 쿠키 세트',zh:'茶饮与曲奇礼盒',kind:'카페',emoji:'🍵',price:16900,bg:'#dfefe4',desc:'쉬는 날의 여유.'},
 {id:'latte',ko:'카페라떼 & 마카롱',zh:'拿铁与马卡龙套餐',kind:'카페',emoji:'🥤',price:8900,bg:'#efe1d3',desc:'달콤한 휴식 시간을 선물해요.'},
 {id:'donut',ko:'도넛 6개 골라담기',zh:'自选甜甜圈 6 个装',kind:'디저트',emoji:'🍩',price:14900,bg:'#f7ddd5',desc:'다 같이 나눠 먹기 좋은 디저트.'},
 {id:'icecream',ko:'프리미엄 아이스크림 파인트',zh:'精品冰淇淋家庭装',kind:'디저트',emoji:'🍨',price:11900,bg:'#e8e2fa',desc:'기분 좋아지는 달콤한 선물.'},
 {id:'pizza',ko:'치즈 피자 한 판',zh:'芝士披萨兑换券',kind:'푸드',emoji:'🍕',price:28900,bg:'#fae1c1',desc:'따뜻할 때 함께 즐겨요.'},
 {id:'burger',ko:'수제버거 세트',zh:'手作汉堡套餐',kind:'푸드',emoji:'🍔',price:13800,bg:'#f1dfc1',desc:'든든한 한 끼를 선물해요.'},
 {id:'concert',ko:'온라인 공연 관람권',zh:'线上演出观看券',kind:'문화',emoji:'🎫',price:22000,bg:'#dfe4fa',desc:'좋아하는 공연을 편하게 즐겨요.'},
 {id:'book',ko:'전자책 금액권',zh:'电子书礼券',kind:'문화',emoji:'📚',price:20000,bg:'#e5eadc',desc:'읽고 싶은 책을 직접 골라요.'},
 {id:'candle',ko:'포근한 향초 세트',zh:'香薰蜡烛礼盒',kind:'라이프',emoji:'🕯️',price:32900,bg:'#f2e7cf',desc:'공간을 채우는 편안한 향기.'},
 {id:'mug',ko:'데일리 머그컵',zh:'日常马克杯',kind:'라이프',emoji:'☕',price:18900,bg:'#dceaf0',desc:'매일 편하게 쓰는 작은 선물.'},
 {id:'handcream',ko:'핸드크림 듀오 세트',zh:'护手霜双支礼盒',kind:'뷰티',emoji:'🧴',price:27500,bg:'#eee2f4',desc:'부드러운 향과 보습을 선물해요.'},
 {id:'lipbalm',ko:'컬러 립밤 기프트',zh:'润色唇膏礼盒',kind:'뷰티',emoji:'💄',price:24000,bg:'#f7dfe5',desc:'가볍게 매일 쓰기 좋은 선물.'},
 {id:'department',ko:'백화점 모바일 상품권',zh:'百货商场电子礼券',kind:'쿠폰',emoji:'🎁',price:50000,bg:'#eee4cf',desc:'원하는 선물을 직접 고를 수 있어요.'},
 {id:'delivery',ko:'배달 모바일 금액권',zh:'外卖电子礼券',kind:'쿠폰',emoji:'🛵',price:30000,bg:'#dff0e7',desc:'오늘 먹고 싶은 메뉴로 골라요.'},
 {id:'cap',ko:'베이직 볼캡',zh:'基础款棒球帽',kind:'패션',emoji:'🧢',price:39000,bg:'#dde5ef',desc:'어디에나 편하게 어울리는 아이템.'},
 {id:'earbuds',ko:'무선 이어버드 케이스',zh:'无线耳机保护壳',kind:'디지털',emoji:'🎧',price:24900,bg:'#e2e5ef',desc:'매일 사용하는 기기에 작은 포인트.'}
];
const AI_KINDS=new Set(['카페','디저트','푸드','문화','라이프','뷰티','쿠폰','패션','디지털']);
const AI_EMOJIS=new Set(['☕','🥤','🍵','🍰','🍩','🍪','🍫','🍨','🍗','🍕','🍔','🍱','🎟️','🎫','🎬','📚','💐','🕯️','🪴','🧸','🧴','💄','🎁','🛍️','🧢','👕','🎧','📱','⌚']);
const AI_BACKGROUNDS=['#f6e0cc','#f9e0e9','#faeac6','#e3ddfa','#e0f0da','#dceafa','#f4e5c8','#dfefe4'];
const cleanProduct=(p,index=0)=>{
 const price=Math.round(Number(p?.price)/100)*100;
 const kind=AI_KINDS.has(p?.kind)?p.kind:'라이프';
 const ko=String(p?.ko||'').trim().slice(0,32),zh=String(p?.zh||'').trim().slice(0,32);
 if(!ko||!zh||!Number.isFinite(price)||price<1000||price>300000)return null;
 return {id:String(p?.id||'').replace(/[^a-z0-9-]/gi,'').slice(0,48),ko,zh,kind,
  emoji:AI_EMOJIS.has(p?.emoji)?p.emoji:'🎁',price,bg:AI_BACKGROUNDS[index%AI_BACKGROUNDS.length],
  desc:String(p?.desc||'마음을 담아 선물해요.').trim().slice(0,80),descZh:String(p?.descZh||'').trim().slice(0,80)};
};
function loadAiProducts(){
 try{return JSON.parse(localStorage.getItem(AI_STORAGE)||'[]').map(cleanProduct).filter(p=>p&&p.id).slice(-60)}catch{return []}
}
let aiProducts=loadAiProducts();
const allProducts=()=>STATIC_PRODUCTS.concat(aiProducts);
const t=(ko,zh)=>window.IphoneLocale?.language==='zh'?zh:ko;
const categoryName=name=>t(name,({
  '카페':'咖啡','디저트':'甜点','푸드':'美食','문화':'娱乐',
  '라이프':'生活','뷰티':'美妆','쿠폰':'礼券','패션':'时尚','디지털':'数码'
})[name]||name);
const money=n=>Math.max(0,Math.floor(Number(n)||0)).toLocaleString('ko-KR')+'원';
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const getItem=id=>allProducts().find(p=>p.id===id);
function load(){
 try{
  const s=JSON.parse(localStorage.getItem(STORAGE)||'null');
   if(s&&Array.isArray(s.orders))return {
    orders:s.orders.filter(o=>o&&typeof o.id==='string'&&getItem(o.itemId)&&Number(o.price)===getItem(o.itemId).price).slice(-200),
    topups:Array.isArray(s.topups)?s.topups.filter(v=>Number.isFinite(v)&&v===100000).slice(-50):[],
    transfers:Array.isArray(s.transfers)?s.transfers.filter(x=>x&&typeof x.id==='string'&&Number.isFinite(x.amount)&&x.amount>0).slice(-50):[]
  };
 }catch{}
 return {orders:[],topups:[],transfers:[]};
}
let state=load();
const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch{}};
const totalSpent=()=>state.orders.reduce((sum,o)=>sum+o.price,0)+state.transfers.reduce((sum,x)=>sum+x.amount,0);
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
let searchQuery='',searchResults=[],searching=false,searchError='';
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
function transferRow(x){
 return '<div class="ks-order"><span class="ks-order-art" style="background:#fee500">₩</span><span><strong>'+safe(x.recipient||'계좌이체')+'</strong><small>'+new Date(x.at).toLocaleString('ko-KR')+' · '+safe(x.bank||'은행 이체')+'</small></span><b>'+money(x.amount)+'</b></div>';
}
function catalog(){
 const source=searchQuery?searchResults:allProducts();
 const visible=source.filter(p=>category==='전체'||p.kind===category);
 const chips=['전체','카페','디저트','푸드','문화','라이프','뷰티','쿠폰','패션','디지털'];
 return '<section class="ks-hero"><small>kakao<span>pay</span> · '+t('모의 잔액','模拟余额')+'</small>'+
 '<strong>'+money(balance())+'</strong>'+button('wallet',t('잔액 · 결제 내역 보기 ›','查看余额与交易 ›'),'ks-light')+'</section>'+
 '<div class="ks-section"><h2>'+t('마음을 전하는 선물','把心意送给朋友')+'</h2><p>'+t('친구에게 보내거나 직접 구매해 보세요.','可自行购买，也可以赠送好友。')+'</p></div>'+
 '<form class="ks-search" data-kshop-form="search"><input name="query" maxlength="40" autocomplete="off" value="'+safe(searchQuery)+'" placeholder="'+safe(t('향수, 케이크, 생일 선물 검색','搜索香水、蛋糕、生日礼物'))+'" aria-label="'+safe(t('AI 선물 검색','AI 礼物搜索'))+'"><button type="submit" '+(searching?'disabled':'')+'>'+(searching?'<span class="ks-spinner"></span>':t('AI 검색','AI 搜索'))+'</button>'+(searchQuery?'<button type="button" class="ks-search-clear" data-kshop="clear-search" aria-label="'+safe(t('검색 지우기','清除搜索'))+'">×</button>':'')+'</form>'+
 (searching?'<p class="ks-search-note">'+t('어울리는 선물을 찾고 있어요…','正在生成合适的礼物…')+'</p>':'')+
 (searchError?'<p class="ks-search-error">'+safe(searchError)+'</p>':'')+
 (searchQuery&&!searching?'<div class="ks-result-title"><strong>'+safe(t('“'+searchQuery+'” AI 추천','“'+searchQuery+'” AI 推荐'))+'</strong><small>'+visible.length+t('개',' 件')+'</small></div>':'')+
 '<div class="ks-categories">'+chips.map(c=>'<button class="'+(c===category?'chosen':'')+'" data-kshop="category" data-id="'+c+'">'+
 safe(c==='전체'?t('전체','全部'):categoryName(c))+'</button>').join('')+'</div>'+
 '<div class="ks-grid">'+visible.map(productCard).join('')+'</div>'+
 (!searching&&!visible.length?'<p class="ks-empty ks-search-empty">'+t('검색 결과가 없어요. 다른 단어로 검색해 보세요.','没有找到结果，请换个关键词试试。')+'</p>':'')+
 button('orders',t('선물함 · 구매 내역','礼物盒 · 购买记录'),'ks-outline');
}
function detail(){
 const p=getItem(selected);if(!p)return catalog();
 return '<div class="ks-detail-art" style="background:'+p.bg+'">'+p.emoji+'</div>'+
 '<div class="ks-section"><small>'+safe(categoryName(p.kind))+'</small><h2>'+safe(t(p.ko,p.zh))+'</h2><strong class="ks-huge">'+money(p.price)+'</strong><p>'+safe(t(p.desc,p.descZh||'虚拟电子礼券。购买后可赠送 KakaoTalk 联系人。'))+'</p></div>'+
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
 t('결제 건수','购买次数')+'</small><b>'+(state.orders.length+state.transfers.length)+'</b></div></div>'+
 button('topup',t('＋ 100,000원 체험 충전','＋ 模拟充值 100,000 韩元'),'ks-outline')+
 '<div class="ks-section"><h2>'+t('최근 결제 내역','最近消费')+'</h2></div>'+
 ([...state.orders.map(x=>({...x,kind:'order'})),...state.transfers.map(x=>({...x,kind:'transfer'}))].sort((a,b)=>b.at-a.at).map(x=>x.kind==='transfer'?transferRow(x):orderRow(x)).join('')||'<p class="ks-empty">'+t('결제 내역이 없습니다.','暂无购买记录')+'</p>');
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
 const purchases=state.orders.flatMap(o=>{
  const p=getItem(o.itemId);
  const purchase={id:o.id,sender:'카카오페이',type:'purchase',item:t(p.ko,p.zh),price:o.price,balance:o.balanceAfter,at:o.at};
  if(!o.recipient)return [purchase];
  return [purchase,{id:o.id+'-gift',sender:'카카오 선물하기',type:'gift',item:t(p.ko,p.zh),
   recipient:contacts().find(c=>c.id===o.recipient)?.name||o.recipient,at:o.giftedAt||o.at}];
 });
 return purchases.concat(state.transfers.map(x=>({...x,type:'bank',balance:x.balanceAfter})));
}
function syncSMS(){window.__IPHONE_SMS__?.sync?.(smsEvents());}
function recordEpisodeTransfer(event){
 if(!event||typeof event.id!=='string'||!Number.isFinite(event.amount)||event.amount<=0)return false;
 if(state.transfers.some(x=>x.id===event.id)){syncSMS();return false}
 const transfer={id:event.id,amount:event.amount,bank:event.bank||'카카오뱅크',recipient:event.recipient||'',account:event.account||'',at:event.at||Date.now(),balanceAfter:balance()-event.amount};
 state.transfers.push(transfer);save();syncSMS();return true;
}
const giftReplyPending=new Set();
const giftFallback=(id,p)=>{
 const item=p.kind==='카페'?'커피':p.kind==='푸드'||p.kind==='디저트'?'맛있는 거':p.ko;
 const fixed={
  xxx:`${item}까지 왜 보내ㅋㅋ 그래도 잘 받을게 고마워`,
  yh:`야 ${item} 고맙다 ㅋㅋ 다음엔 같이 먹자`,
  jy:`${item} 고마워 잘 받을게`,
  sw:`형 갑자기 ${item} 뭐예요ㅋㅋ 잘 받을게요`,
  q:`형 ${item} 고마워요 ㅋㅋ 잘 받을게요`,
  manager:`재현아 ${item} 고맙다 잘 받을게`,
  stylist:`재현 씨 ${item} 감사합니다 잘 쓸게요`,
  pd:`${item} 감사합니다 잘 받겠습니다`,
  nuna:`갑자기 웬 ${item}이야ㅋㅋ 잘 받을게 고마워`
 };
 return fixed[id]||`${item} 고마워 잘 받을게`;
};
function scheduleGiftReply(o,id,p,chat){
 if(!o||o.replyDone||giftReplyPending.has(o.id)||!chat)return;
 giftReplyPending.add(o.id);
 setTimeout(()=>{
  const reply=giftFallback(id,p);
  const now=new Intl.DateTimeFormat('ko-KR',{hour:'numeric',minute:'2-digit',hour12:true}).format(new Date());
  if(!chat.messages.some(message=>message[5]==='gift-reply:'+o.id)){
   chat.messages.push(['other',reply,now,'','', 'gift-reply:'+o.id]);
   chat.preview=reply;chat.time='방금';chat.unread=(chat.unread||0)+1;
  }
  o.replyDone=true;o.replyText=reply;o.repliedAt=Date.now();save();
  try{localStorage.setItem('jh_kkt15',JSON.stringify(window.__KKT15_TEST__?.data||[]))}catch{}
  giftReplyPending.delete(o.id);
  window.__KKT15_TEST__?.render?.();
 },900+Math.floor(Math.random()*900));
}
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
  scheduleGiftReply(o,id,p,chat);
 }
 syncSMS();
 if(intent==='after')window.__IPHONE_SMS__?.notify?.({type:'gift',recipient:id});
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
  if(c.messages.some(m=>m[5]==='gift:'+o.id)){
   if(o.replyDone&&o.replyText&&!c.messages.some(m=>m[5]==='gift-reply:'+o.id)){
    const replyTime=new Intl.DateTimeFormat('ko-KR',{hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(o.repliedAt||o.giftedAt||o.at));
    c.messages.push(['other',o.replyText,replyTime,'','', 'gift-reply:'+o.id]);c.preview=o.replyText;
   }
   continue;
  }
  const msg='🎁 [선물하기] '+p.ko+' · '+money(o.price)+'\n선물을 보냈어요!';
  const restoredTime=new Intl.DateTimeFormat('ko-KR',{hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(o.giftedAt||o.at));
  c.messages.push(['mine',msg,restoredTime,'','read','gift:'+o.id]);c.preview=msg;c.time='방금';
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
 window.__IPHONE_SMS__?.notify?.({type:'purchase',id});
 if(intent==='gift'&&recipient)assignGift(o,recipient);
 page='success';draw();
}
const giftEndpoint=()=>location.hostname==='nuyheaj.pages.dev'?'/api/kkt-gift-search':'https://nuyheaj.pages.dev/api/kkt-gift-search';
const hashId=value=>{
 let h=2166136261;
 for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619)}
 return (h>>>0).toString(36);
};
function localSearch(query){
 const q=query.toLowerCase();
 const aliases={향수:['뷰티','perfume'],香水:['뷰티','perfume'],케이크:['디저트','cake'],蛋糕:['디저트','cake'],생일:['디저트','라이프','쿠폰'],生日:['디저트','라이프','쿠폰'],꽃:['라이프','flowers'],花:['라이프','flowers'],커피:['카페'],咖啡:['카페'],음식:['푸드'],美食:['푸드'],패션:['패션'],时尚:['패션'],이어폰:['디지털'],耳机:['디지털']};
 const hints=Object.entries(aliases).filter(([key])=>q.includes(key.toLowerCase())).flatMap(([,v])=>v);
 const found=allProducts().filter(p=>[p.ko,p.zh,p.kind,p.id].some(v=>String(v).toLowerCase().includes(q))||hints.includes(p.kind)||hints.includes(p.id));
 return (found.length?found:STATIC_PRODUCTS.slice(0,6)).slice(0,8);
}
async function searchGifts(query){
 const q=String(query||'').trim().slice(0,40);
 if(!q||searching)return;
 searchQuery=q;searchResults=[];searchError='';searching=true;category='전체';draw();
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);
 try{
  const response=await fetch(giftEndpoint(),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query:q,language:window.IphoneLocale?.language==='zh'?'zh':'ko'}),signal:controller.signal});
  const result=await response.json().catch(()=>({}));
  if(!response.ok||!Array.isArray(result.items))throw new Error(result.error||'request_failed');
  const fresh=result.items.map((item,index)=>cleanProduct({...item,id:'ai-'+hashId(q+'|'+item.ko+'|'+item.price)},index)).filter(Boolean).slice(0,8);
  if(!fresh.length)throw new Error('empty_results');
  for(const item of fresh){const at=aiProducts.findIndex(p=>p.id===item.id);if(at>=0)aiProducts[at]=item;else aiProducts.push(item)}
  aiProducts=aiProducts.slice(-60);
  try{localStorage.setItem(AI_STORAGE,JSON.stringify(aiProducts))}catch{}
  searchResults=fresh;
 }catch(error){
  searchResults=localSearch(q);
  searchError=t('AI 연결이 잠시 불안정해 기본 추천을 보여드려요.','AI 暂时连接不稳定，已显示本地推荐。');
 }finally{clearTimeout(timer);searching=false;draw()}
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
 else if(action==='clear-search'){searchQuery='';searchResults=[];searchError='';category='전체';page='home';}
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
document.addEventListener('submit',function(e){
 const form=e.target.closest('[data-kshop-form="search"]');
 if(!form||typeof mode==='undefined'||mode!=='kakao')return;
 e.preventDefault();e.stopPropagation();
 searchGifts(new FormData(form).get('query'));
},true);
window.addEventListener('iphone26:languagechange',function(){if(active&&typeof mode!=='undefined'&&mode==='kakao'&&document.querySelector('#kshop-root'))draw()});
window.__KKT_SHOP__={
 get balance(){return balance()},
 balanceText:()=>money(balance()),
 get orders(){return state.orders.map(o=>({...o}))},
 get transfers(){return state.transfers.map(x=>({...x}))},
 open, getProducts:()=>allProducts().map(p=>({...p})),
 sync:syncSMS,recordEpisodeTransfer
};
restoreGiftChats();
syncSMS();
})();
