(()=>{
'use strict';
const KEY='iphone_coupang_v1';
const AI_KEY='iphone_coupang_ai_products_v1';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const zh=()=>window.IphoneLocale?.language==='zh';
const t=(ko,cn)=>zh()?cn:ko;
const products=[
 {id:'p1',cat:'food',emoji:'🥩',brand:'곰곰',ko:'한우 1등급 구이용 모둠 600g',cn:'韩牛1级烤肉拼盘 600g',price:45900,old:59900,a:'#ffe0d2',b:'#ffc0aa',rating:'4.8',reviews:'3,241'},
 {id:'p2',cat:'daily',emoji:'🧻',brand:'코멧',ko:'프리미엄 3겹 데코 화장지 30롤',cn:'高级三层压花卷纸 30卷',price:18990,old:23900,a:'#e9f5ff',b:'#c7e6ff',rating:'4.9',reviews:'18,532'},
 {id:'p3',cat:'beauty',emoji:'🧴',brand:'라운드랩',ko:'자작나무 수분 선크림 50ml 2개',cn:'白桦树保湿防晒霜 50ml 两支装',price:23800,old:36000,a:'#e4f5ef',b:'#bee4d8',rating:'4.8',reviews:'9,630'},
 {id:'p4',cat:'fashion',emoji:'👟',brand:'나이키',ko:'데일리 러닝 스니커즈 화이트',cn:'日常跑步运动鞋 白色',price:78900,old:109000,a:'#f0f0f0',b:'#d5d7da',rating:'4.7',reviews:'1,087'},
 {id:'p5',cat:'digital',emoji:'🎧',brand:'Apple',ko:'에어팟 프로 노이즈 캔슬링',cn:'AirPods Pro 主动降噪耳机',price:329000,old:349000,a:'#eef3fa',b:'#d9e1ec',rating:'4.9',reviews:'7,856'},
 {id:'p6',cat:'home',emoji:'🛏️',brand:'룸앤홈',ko:'포근한 워싱 차렵이불 세트',cn:'柔软水洗棉被套装',price:39900,old:65000,a:'#f4ecff',b:'#d9c8ee',rating:'4.7',reviews:'2,416'},
 {id:'p7',cat:'food',emoji:'🍜',brand:'농심',ko:'신라면 멀티팩 5개입 4봉',cn:'辛拉面五连包 4组',price:15900,old:19800,a:'#ffe9db',b:'#ffd0b3',rating:'4.9',reviews:'32,104'},
 {id:'p8',cat:'daily',emoji:'🧺',brand:'다우니',ko:'실내건조 섬유유연제 리필 3개',cn:'室内晾晒柔顺剂补充装 3袋',price:21900,old:29900,a:'#e8ddff',b:'#cbb5f0',rating:'4.8',reviews:'6,770'},
 {id:'p9',cat:'beauty',emoji:'💄',brand:'롬앤',ko:'쥬시 래스팅 틴트 인기 컬러',cn:'果汁持色唇釉 人气色号',price:8900,old:13000,a:'#ffe2eb',b:'#f5b5ca',rating:'4.7',reviews:'4,221'},
 {id:'p10',cat:'digital',emoji:'🔋',brand:'삼성전자',ko:'초고속 보조배터리 10000mAh',cn:'高速移动电源 10000mAh',price:34900,old:42000,a:'#e0edff',b:'#bcd5f4',rating:'4.8',reviews:'2,035'},
 {id:'p11',cat:'home',emoji:'☕',brand:'네스프레소',ko:'버츄오 캡슐 커피 인기팩',cn:'Vertuo 胶囊咖啡人气组合',price:48900,old:56000,a:'#f4e9dd',b:'#d9c0a6',rating:'4.9',reviews:'1,943'},
 {id:'p12',cat:'fashion',emoji:'🧥',brand:'무신사 스탠다드',ko:'릴랙스드 베이식 후드 집업',cn:'宽松基础连帽拉链外套',price:42900,old:49900,a:'#eceef1',b:'#c8cbd0',rating:'4.7',reviews:'3,009'},
 {id:'p13',cat:'pet',emoji:'🐕',brand:'탐사',ko:'반려동물 소프트 사료 연어 3kg',cn:'宠物软粮 三文鱼味 3kg',price:28900,old:34900,a:'#fff0d6',b:'#f0d29d',rating:'4.8',reviews:'2,818'},
 {id:'p14',cat:'baby',emoji:'🧸',brand:'베베숲',ko:'아기 물티슈 시그니처 20팩',cn:'婴儿湿巾 Signature 20包',price:31900,old:42000,a:'#fff2d9',b:'#f6dab0',rating:'4.9',reviews:'11,240'},
 {id:'p15',cat:'travel',emoji:'🧳',brand:'트래블메이트',ko:'확장형 기내용 캐리어 20인치',cn:'可扩展登机箱 20英寸',price:69900,old:89000,a:'#dcecff',b:'#aacbed',rating:'4.7',reviews:'965'},
 {id:'l1',cat:'fashion',emoji:'🧥',brand:'PRADA',ko:'리나일론 블루종 재킷 블랙',cn:'Re-Nylon 黑色飞行夹克',price:3550000,old:3950000,a:'#dadada',b:'#9d9d9d',rating:'4.9',reviews:'128'},
 {id:'l2',cat:'fashion',emoji:'🧶',brand:'Bottega Veneta',ko:'캐시미어 가디건 베이지',cn:'米色羊绒开衫',price:3250000,old:3590000,a:'#eee4d4',b:'#c9b89c',rating:'4.8',reviews:'76'},
 {id:'l3',cat:'fashion',emoji:'🧥',brand:'Saint Laurent',ko:'램스킨 라이더 재킷',cn:'羊皮机车夹克',price:7150000,old:7590000,a:'#d9d9d9',b:'#8b8b8b',rating:'4.9',reviews:'54'},
 {id:'l4',cat:'fashion',emoji:'🧥',brand:'Lemaire',ko:'벨티드 울 랩 코트',cn:'系带羊毛裹身大衣',price:2190000,old:2390000,a:'#e9e2d9',b:'#b9aa99',rating:'4.8',reviews:'93'},
 {id:'l5',cat:'fashion',emoji:'👟',brand:'Maison Margiela',ko:'레플리카 스니커즈 화이트',cn:'Replica 白色运动鞋',price:790000,old:850000,a:'#f3f1eb',b:'#d6d1c8',rating:'4.8',reviews:'412'},
 {id:'l6',cat:'fashion',emoji:'👔',brand:'Jil Sander',ko:'울 오버셔츠 다크 네이비',cn:'深海军蓝羊毛衬衫式外套',price:1490000,old:1690000,a:'#dce0e6',b:'#8694aa',rating:'4.7',reviews:'81'},
 {id:'l7',cat:'fashion',emoji:'👖',brand:'Acne Studios',ko:'루즈 핏 데님 진 미드블루',cn:'中蓝色宽松牛仔裤',price:720000,old:790000,a:'#d5e4f2',b:'#769dc2',rating:'4.8',reviews:'267'},
 {id:'l8',cat:'fashion',emoji:'🧶',brand:'Stone Island',ko:'와펜 울 니트 블랙',cn:'黑色徽章羊毛针织衫',price:780000,old:860000,a:'#e1e1e1',b:'#a2a2a2',rating:'4.8',reviews:'194'},
 {id:'l9',cat:'fashion',emoji:'🕶️',brand:'Gentle Monster',ko:'블랙 아세테이트 선글라스',cn:'黑色醋酸纤维太阳镜',price:340000,old:370000,a:'#e8e8e8',b:'#b0b0b0',rating:'4.9',reviews:'631'},
 {id:'l10',cat:'travel',emoji:'🧳',brand:'RIMOWA',ko:'Original Cabin 알루미늄 실버',cn:'Original Cabin 银色铝镁合金登机箱',price:2300000,old:2450000,a:'#e8ecef',b:'#aeb8bf',rating:'4.9',reviews:'356'},
 {id:'l11',cat:'digital',emoji:'🎧',brand:'Apple',ko:'AirPods Max 2 미드나이트',cn:'AirPods Max 2 午夜色',price:769000,old:799000,a:'#dce3e8',b:'#8797a2',rating:'4.9',reviews:'1,827'},
 {id:'l12',cat:'digital',emoji:'⌚',brand:'Apple',ko:'Apple Watch Ultra 4 티타늄',cn:'Apple Watch Ultra 4 钛金属',price:1104000,old:1199000,a:'#ede7de',b:'#b8aa98',rating:'4.9',reviews:'943'},
 {id:'l13',cat:'digital',emoji:'📷',brand:'Sony',ko:'Alpha 7C II 풀프레임 카메라',cn:'Alpha 7C II 全画幅相机',price:2799000,old:3099000,a:'#e5e5e5',b:'#999',rating:'4.9',reviews:'518'},
 {id:'l14',cat:'beauty',emoji:'💨',brand:'Dyson',ko:'슈퍼소닉 뉴럴 헤어드라이어',cn:'Supersonic Nural 吹风机',price:599000,old:649000,a:'#efe5f4',b:'#b99ac9',rating:'4.8',reviews:'2,106'},
 {id:'l15',cat:'home',emoji:'💪',brand:'Therabody',ko:'테라건 프라임 플러스',cn:'Theragun Prime Plus 筋膜枪',price:689000,old:749000,a:'#e4eaed',b:'#94a4aa',rating:'4.8',reviews:'734'},
 {id:'l16',cat:'fashion',emoji:'🧥',brand:'ADERERROR',ko:'오버사이즈 울 블루종 재킷',cn:'宽松羊毛飞行夹克',price:890000,old:950000,a:'#e2e5e8',b:'#9aa2aa',rating:'4.8',reviews:'146'},
 {id:'l17',cat:'fashion',emoji:'🧶',brand:'AMI',ko:'하트 로고 메리노 울 가디건',cn:'爱心标志美利奴羊毛开衫',price:690000,old:750000,a:'#e7e2dc',b:'#b7aaa0',rating:'4.8',reviews:'238'},
 {id:'l18',cat:'digital',emoji:'🪒',brand:'Braun',ko:'Series 9 Pro+ 전기면도기',cn:'Series 9 Pro+ 电动剃须刀',price:499000,old:549000,a:'#e5e8eb',b:'#9ca5ad',rating:'4.9',reviews:'1,384'},
 {id:'l19',cat:'food',emoji:'💊',brand:'정관장',ko:'홍삼정 에브리타임 30포',cn:'正官庄红参精 Everytime 30条',price:119000,old:139000,a:'#f4dfd3',b:'#c58f74',rating:'4.9',reviews:'8,612'},
 {id:'l20',cat:'food',emoji:'🥩',brand:'설로인',ko:'한우 1++ 프리미엄 구이 세트',cn:'韩牛1++高级烤肉礼盒',price:169000,old:199000,a:'#f5dfd7',b:'#d39d8c',rating:'4.9',reviews:'1,536'}
];
function cleanSearchProduct(item,index=0){
 const kinds={food:'food',daily:'daily',beauty:'beauty',fashion:'fashion',digital:'digital',home:'home',pet:'pet',baby:'baby',travel:'travel'};
 const cat=kinds[item?.cat]||'daily';
 let price=Math.round(Number(item?.price)/100)*100;
 if(!Number.isFinite(price))return null;
 const minimum=cat==='fashion'?120000:cat==='digital'?30000:1000;
 price=Math.min(8000000,Math.max(minimum,price));
 const ko=String(item?.ko||'').trim().slice(0,42),cn=String(item?.cn||'').trim().slice(0,42);
 if(!ko||!cn)return null;
 return {id:String(item?.id||('ai-'+Date.now().toString(36)+'-'+index)),cat,emoji:String(item?.emoji||'🛍️').slice(0,4),brand:String(item?.brand||'Coupang').trim().slice(0,28),ko,cn,price,old:Math.max(price+1000,Math.round(price*1.12/100)*100),a:'#eef3f8',b:'#cbd8e6',rating:'4.8',reviews:String(120+((price+index*97)%4800)).replace(/\B(?=(\d{3})+(?!\d))/g,',')};
}
try{const saved=JSON.parse(localStorage.getItem(AI_KEY)||'[]');for(const item of saved){const p=cleanSearchProduct(item);if(p&&!products.some(x=>x.id===p.id))products.push(p)}}catch{}
const DEFAULT_ORDERS=[
 {id:'CP2026102201',date:'2026. 10. 22.',items:[{id:'l10',qty:1}],total:2300000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026101801',date:'2026. 10. 18.',items:[{id:'l1',qty:1}],total:3550000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026101201',date:'2026. 10. 12.',items:[{id:'l16',qty:1}],total:890000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026100501',date:'2026. 10. 05.',items:[{id:'l11',qty:1}],total:769000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026092701',date:'2026. 09. 27.',items:[{id:'l7',qty:1}],total:720000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026091901',date:'2026. 09. 19.',items:[{id:'l15',qty:1}],total:689000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026090801',date:'2026. 09. 08.',items:[{id:'l5',qty:1}],total:790000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026082601',date:'2026. 08. 26.',items:[{id:'l13',qty:1}],total:2799000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026081401',date:'2026. 08. 14.',items:[{id:'l19',qty:1}],total:119000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026080201',date:'2026. 08. 02.',items:[{id:'l8',qty:1}],total:780000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026072101',date:'2026. 07. 21.',items:[{id:'l14',qty:1}],total:599000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026070901',date:'2026. 07. 09.',items:[{id:'l2',qty:1}],total:3250000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026062401',date:'2026. 06. 24.',items:[{id:'l9',qty:1}],total:340000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026061101',date:'2026. 06. 11.',items:[{id:'l20',qty:1}],total:169000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026052901',date:'2026. 05. 29.',items:[{id:'l4',qty:1}],total:2190000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026051301',date:'2026. 05. 13.',items:[{id:'l17',qty:1}],total:690000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026042501',date:'2026. 04. 25.',items:[{id:'l12',qty:1}],total:1104000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026040701',date:'2026. 04. 07.',items:[{id:'l6',qty:1}],total:1490000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026031601',date:'2026. 03. 16.',items:[{id:'l18',qty:1}],total:499000,status:'배송 완료',statusCn:'配送完成'},
 {id:'CP2026022101',date:'2026. 02. 21.',items:[{id:'l3',qty:1}],total:7150000,status:'배송 완료',statusCn:'配送完成'}
];
const cats=[['all','🛍️','전체','全部'],['food','🥬','식품','食品'],['daily','🧻','생활','生活'],['beauty','✨','뷰티','美妆'],['fashion','👕','패션','服饰'],['digital','📱','가전','数码'],['home','🏠','홈','家居'],['pet','🐶','반려','宠物'],['baby','🧸','유아','母婴'],['travel','✈️','여행','旅行']];
let state={cart:[],orders:[]},view='home',selected='',category='all',query='',toastTimer,searching=false,searchMessage='';
let story={active:false,phase:'',result:false,keyIndex:-1,timers:[]};
try{state=Object.assign(state,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{}
if(!Array.isArray(state.cart))state.cart=[];if(!Array.isArray(state.orders))state.orders=[];
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
try{if(localStorage.getItem('iphone_coupang_order_seed_v1')!=='1'){const ids=new Set(state.orders.map(o=>o.id));state.orders=[...state.orders,...DEFAULT_ORDERS.filter(o=>!ids.has(o.id))];save();localStorage.setItem('iphone_coupang_order_seed_v1','1')}}catch{}
try{if(localStorage.getItem('iphone_coupang_order_correction_v2')!=='1'){const corrected={l16:890000,l17:690000,l18:499000};state.orders=state.orders.map(o=>{const item=o.items?.find(i=>corrected[i.id]);return item?{...o,total:corrected[item.id]*Number(item.qty||1)}:o});save();localStorage.setItem('iphone_coupang_order_correction_v2','1')}}catch{}
const money=n=>Number(n||0).toLocaleString(zh()?'zh-CN':'ko-KR')+t('원','韩元');
const logo=()=>'<div class="cp-logo" aria-label="coupang">'+[...'coupang'].map(x=>'<i>'+x+'</i>').join('')+'</div>';
const cartCount=()=>state.cart.reduce((n,x)=>n+x.qty,0);
function head(search=true){return '<header class="cp-head">'+logo()+(search?'<label class="cp-search">⌕<input id="cp-search" value="'+esc(query)+'" placeholder="'+t('쿠팡에서 검색하세요','在 Coupang 搜索')+'"></label>':'<span style="flex:1"></span>')+'<button class="cp-iconbtn" data-cp="cart" aria-label="'+t('장바구니','购物车')+'">🛒'+(cartCount()?'<i class="cp-badge">'+cartCount()+'</i>':'')+'</button></header>'}
function backHead(title,cart=true){return '<header class="cp-backhead"><button data-cp="back">‹</button><h1>'+esc(title)+'</h1><span>'+(cart?'<button class="cp-iconbtn" data-cp="cart">🛒'+(cartCount()?'<i class="cp-badge">'+cartCount()+'</i>':'')+'</button>':'')+'</span></header>'}
function tabs(active='home'){return '<nav class="cp-tabs">'+[['home','⌂','홈','首页'],['category','☷','카테고리','分类'],['search','⌕','검색','搜索'],['orders','▤','주문목록','订单'],['account','♙','마이쿠팡','我的']].map(x=>'<button class="'+(active===x[0]?'active':'')+(story.active&&story.phase==='orders-tap'&&x[0]==='orders'?' cp-story-tap':'')+'" data-cp="tab" data-v="'+x[0]+'"><i>'+x[1]+'</i><span>'+t(x[2],x[3])+'</span></button>').join('')+'</nav>'}
function productCard(p){return '<button class="cp-product" data-cp="product" data-id="'+p.id+'"><div class="cp-thumb" style="--a:'+p.a+';--b:'+p.b+'"><small>SALE</small>'+p.emoji+'</div><div class="cp-name">'+esc(t(p.ko,p.cn))+'</div><div class="cp-price"><del>'+money(p.old)+'</del>'+money(p.price)+'</div><span class="cp-rocket">🚀 '+t('로켓배송','火箭配送')+'</span><div class="cp-rating">★ '+p.rating+' <span>('+p.reviews+')</span></div></button>'}
function productGrid(list){return '<div class="cp-products">'+list.map(productCard).join('')+'</div>'}
function home(){return head()+'<main class="cp-scroll"><div class="cp-location">📍 <b>'+t('서울특별시 강남구','首尔特别市江南区')+'</b> ›</div><section class="cp-hero"><b>'+t('오늘 주문하면<br>내일 아침 도착','今天下单<br>明早送达')+'</b><span>'+t('로켓배송으로 빠르고 편리하게','火箭配送 快速又方便')+'</span></section><section class="cp-section"><div class="cp-categories">'+cats.map(x=>'<button class="cp-cat" data-cp="category" data-v="'+x[0]+'"><i>'+x[1]+'</i><span>'+t(x[2],x[3])+'</span></button>').join('')+'</div></section><section class="cp-section"><div class="cp-section-title"><b>'+t('오늘의 추천','今日推荐')+'</b><span>'+t('맞춤 상품','为你精选')+'</span></div>'+productGrid(products.slice(0,8))+'</section></main>'+tabs('home')}
function searchPage(){let q=query.trim().toLowerCase(),list=products.filter(p=>(p.ko+p.cn+p.brand).toLowerCase().includes(q));return head()+'<main class="cp-scroll"><div class="cp-results">'+(searching?t('상품을 찾고 있습니다','正在查找商品'):q?t('검색 결과 ','搜索结果 ')+list.length+t('개','件'):t('인기 검색 상품','热门搜索商品'))+(searchMessage?'<small class="cp-search-note">'+esc(searchMessage)+'</small>':'')+'</div><section class="cp-section">'+(list.length?productGrid(list):searching?'<div class="cp-empty"><i>⌕</i><b>'+t('상품을 찾는 중입니다','正在查找商品')+'</b></div>':'<div class="cp-empty"><i>⌕</i><b>'+t('검색 결과가 없습니다','没有搜索结果')+'</b><span>'+t('다른 검색어를 입력해 보세요','请尝试其他关键词')+'</span></div>')+'</section></main>'+tabs('search')}
function categoryPage(){let list=category==='all'?products:products.filter(p=>p.cat===category);return head(false)+'<main class="cp-scroll"><section class="cp-section"><div class="cp-categories">'+cats.map(x=>'<button class="cp-cat" data-cp="category" data-v="'+x[0]+'"><i>'+x[1]+'</i><span>'+t(x[2],x[3])+'</span></button>').join('')+'</div></section><section class="cp-section"><div class="cp-section-title"><b>'+t(cats.find(x=>x[0]===category)?.[2]||'전체 상품',cats.find(x=>x[0]===category)?.[3]||'全部商品')+'</b><span>'+list.length+t('개 상품','件商品')+'</span></div>'+productGrid(list)+'</section></main>'+tabs('category')}
function detail(){let p=products.find(x=>x.id===selected)||products[0],discount=Math.round((1-p.price/p.old)*100);return backHead(t('상품 상세','商品详情'))+'<main class="cp-scroll no-tabs" style="bottom:66px"><div class="cp-detail-img" style="--a:'+p.a+';--b:'+p.b+'">'+p.emoji+'</div><section class="cp-detail-body"><span class="cp-brand">'+esc(p.brand)+' ›</span><h2>'+esc(t(p.ko,p.cn))+'</h2><span class="cp-discount">'+discount+'%</span><span class="cp-detail-price">'+money(p.price)+'</span><div class="cp-rating">★★★★★ <span>'+p.rating+' · '+p.reviews+t('개 상품평','条评价')+'</span></div><div class="cp-delivery"><b>🚀 '+t('로켓배송','火箭配送')+'</b><br>'+t('내일 오전 7시 전 도착 보장','保证明早7点前送达')+'<br><strong>'+t('무료배송','免运费')+'</strong></div></section></main><div class="cp-buybar"><button class="cp-cartbtn" data-cp="add" data-id="'+p.id+'">'+t('장바구니','加入购物车')+'</button><button class="cp-buybtn" data-cp="buy" data-id="'+p.id+'">'+t('바로구매','立即购买')+'</button></div>'}
function cart(){let rows=state.cart.map(item=>{let p=products.find(x=>x.id===item.id);if(!p)return'';return '<div class="cp-cartrow"><div class="cp-thumb" style="--a:'+p.a+';--b:'+p.b+'">'+p.emoji+'</div><div><h3>'+esc(t(p.ko,p.cn))+'</h3><b>'+money(p.price)+'</b><span class="cp-rocket">'+t('수량','数量')+' '+item.qty+'</span></div><button class="cp-remove" data-cp="remove" data-id="'+p.id+'">×</button></div>'}).join(''),total=state.cart.reduce((n,x)=>n+(products.find(p=>p.id===x.id)?.price||0)*x.qty,0);if(!rows)return backHead(t('장바구니','购物车'),false)+'<main class="cp-scroll no-tabs"><div class="cp-empty"><i>🛒</i><b>'+t('장바구니가 비어 있습니다','购物车是空的')+'</b><button data-cp="home">'+t('쇼핑 계속하기','继续购物')+'</button></div></main>';return backHead(t('장바구니','购物车'),false)+'<main class="cp-scroll no-tabs" style="bottom:66px"><div class="cp-cart-list">'+rows+'</div><div class="cp-summary"><div><span>'+t('상품금액','商品金额')+'</span><b>'+money(total)+'</b></div><div><span>'+t('배송비','运费')+'</span><b>'+t('무료','免费')+'</b></div><div class="total"><span>'+t('총 결제금액','总付款金额')+'</span><b>'+money(total)+'</b></div></div></main><div class="cp-orderbar"><button data-cp="checkout">'+money(total)+' '+t('주문하기','下单')+'</button></div>'}
function checkout(){let total=state.cart.reduce((n,x)=>n+(products.find(p=>p.id===x.id)?.price||0)*x.qty,0);return backHead(t('주문/결제','订单/支付'),false)+'<main class="cp-scroll no-tabs" style="bottom:66px"><div class="cp-check"><section><h3>'+t('배송지','收货地址')+'</h3><p><b>'+t('이재현','李贤在')+'</b><br>'+t('서울특별시 강남구 테헤란로 00','首尔特别市江南区德黑兰路00')+'<br>010-****-****</p></section><section><h3>'+t('배송 요청사항','配送要求')+'</h3><p>'+t('문 앞에 놓아주세요','请放在门口')+'</p></section><section><h3>'+t('결제수단','付款方式')+'</h3><div class="cp-method">kakao pay <small>'+t('잔액 ','余额 ')+money(window.__KKT_SHOP__?.balance||0)+'</small><span>✓</span></div></section><section><h3>'+t('최종 결제금액','最终付款金额')+'</h3><p style="font-size:22px;color:#111;font-weight:800">'+money(total)+'</p></section></div></main><div class="cp-orderbar"><button data-cp="placeorder">'+money(total)+' '+t('결제하기','确认支付')+'</button></div>'}
function orders(){let cards=state.orders.map(o=>{let items=o.items.map(i=>{let p=products.find(x=>x.id===i.id);return p?p.brand+' '+t(p.ko,p.cn)+(i.qty>1?' × '+i.qty:''):''}).filter(Boolean);return '<article class="cp-ordercard"><time>'+esc(o.date)+'</time><h3>'+esc(items.join(' · '))+'</h3><p>'+money(o.total)+'</p><b>'+esc(zh()?(o.statusCn||'配送完成'):(o.status||'배송 완료'))+'</b></article>'}).join('');return head(false)+'<main class="cp-scroll"><button class="cp-order-search'+(story.active&&story.phase==='search-tap'?' cp-story-tap':'')+'" data-cp="order-search"><span>⌕</span>'+t('주문내역 검색','搜索订单记录')+'</button>'+(cards||'<div class="cp-empty"><i>📦</i><b>'+t('주문 내역이 없습니다','暂无订单')+'</b><span>'+t('주문한 상품이 여기에 표시됩니다','购买的商品会显示在这里')+'</span></div>')+'</main>'+tabs('orders')}
function storyKeyboard(){const keys=['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ','ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ','ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ'];let n=0,rows=[keys.slice(0,10),keys.slice(10,19),keys.slice(19)];return '<div class="cp-story-keyboard">'+rows.map((row,r)=>'<div>'+row.map(k=>'<i class="'+(n++===story.keyIndex?'pressed':'')+'">'+k+'</i>').join('')+(r===2?'<i class="wide">⌫</i>':'')+'</div>').join('')+'<div><i class="wide">123</i><i class="space">'+t('간격','空格')+'</i><i class="wide">'+t('검색','搜索')+'</i></div></div>'}
function storyOrderSearch(){return backHead(t('주문목록','订单记录'),false)+'<main class="cp-scroll no-tabs cp-story-search"><div class="cp-results"><label class="cp-search cp-story-field"><span>⌕</span><input value="'+esc(query)+'" readonly><i></i></label></div>'+(story.result?'<div class="cp-empty"><i>📦</i><b>'+t('검색된 주문이 없습니다','没有找到相关订单')+'</b><span>'+esc(query)+' '+t('주문 내역을 찾을 수 없습니다','没有相关订单记录')+'</span></div>':'<div class="cp-story-wait">'+t('주문 상품을 검색해 보세요','搜索已购买的商品')+'</div>')+'</main>'+storyKeyboard()}
function account(){return head(false)+'<main class="cp-scroll"><section class="cp-section"><div class="cp-section-title"><b>'+t('마이쿠팡','我的 Coupang')+'</b></div><div class="cp-ordercard" style="margin:0"><h3>'+t('이재현 님','李贤在')+'</h3><p>WOW '+t('회원','会员')+' · '+t('무료 로켓배송','火箭配送免运费')+'</p></div></section><section class="cp-section"><div class="cp-section-title"><b>'+t('나의 쇼핑','我的购物')+'</b></div><div class="cp-categories">'+[['📦','주문목록','订单'],['♡','찜한상품','收藏'],['🎫','쿠폰','优惠券'],['💳','결제수단','付款'],['🎧','고객센터','客服']].map(x=>'<button class="cp-cat" '+(x[1]==='주문목록'?'data-cp="orders"':'data-cp="noop"')+'><i>'+x[0]+'</i><span>'+t(x[1],x[2])+'</span></button>').join('')+'</div></section></main>'+tabs('account')}
function page(){if(view==='detail')return detail();if(view==='cart')return cart();if(view==='checkout')return checkout();if(view==='search')return searchPage();if(view==='story-orders')return storyOrderSearch();if(view==='category')return categoryPage();if(view==='orders')return orders();if(view==='account')return account();return home()}
function renderCoupang(){if(typeof mode==='undefined'||mode!=='coupang')return;let app=$('#app'),frame=$('#appcontent');app.className='layer appscreen active coupang-mode';app.style.display='block';$('#status')?.classList.add('dark');$('#gesture')?.classList.add('ink');frame.style.bottom='calc(var(--safe-bottom) + 28px)';frame.style.overflow='hidden';frame.innerHTML='<div id="coupang-app">'+page()+'</div>'}
function flash(message){clearTimeout(toastTimer);let root=$('#coupang-app');if(!root)return;root.querySelector('.cp-toast')?.remove();let n=document.createElement('div');n.className='cp-toast';n.textContent=message;root.appendChild(n);toastTimer=setTimeout(()=>n.remove(),1500)}
const coupangSearchEndpoint=()=>location.hostname==='nuyheaj.pages.dev'?'/api/coupang-search':'https://nuyheaj.pages.dev/api/coupang-search';
function localSearchProducts(value){
 const q=String(value||'').trim(),seed=[...q].reduce((n,ch)=>n+ch.charCodeAt(0),0);
 const cat=/(옷|자켓|코트|니트|신발|服|衣|鞋)/i.test(q)?'fashion':/(폰|이어폰|카메라|电|耳机|相机)/i.test(q)?'digital':/(화장|스킨|뷰티|美妆|护肤)/i.test(q)?'beauty':'daily';
 const base=cat==='fashion'?180000+(seed%20)*25000:cat==='digital'?59000+(seed%18)*18000:19000+(seed%20)*2300;
 const namesKo=[q+' 프리미엄 에디션',q+' 베스트 셀렉션',q+' 데일리 세트',q+' 한정 패키지'];
 const namesCn=[q+' 高级款',q+' 人气精选',q+' 日常套装',q+' 限定组合'];
 return namesKo.map((ko,i)=>cleanSearchProduct({id:'local-'+encodeURIComponent(q).slice(0,20)+'-'+i,cat,emoji:cat==='fashion'?'👕':cat==='digital'?'🎧':cat==='beauty'?'✨':'🛍️',brand:'Coupang Select',ko,cn:namesCn[i],price:base+i*(cat==='fashion'?45000:9000)},i)).filter(Boolean);
}
async function searchProducts(value){
 const q=String(value||'').trim().slice(0,40);query=q;view='search';searchMessage='';
 if(!q){searching=false;renderCoupang();return}
 searching=true;renderCoupang();
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
 let fresh=[];
 try{
  const response=await fetch(coupangSearchEndpoint(),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query:q,language:zh()?'zh':'ko'}),signal:controller.signal});
  const result=await response.json().catch(()=>({}));
  if(!response.ok||!Array.isArray(result.items))throw new Error(result.error||'search_failed');
  fresh=result.items.map(cleanSearchProduct).filter(Boolean).slice(0,8);
 }catch(error){fresh=localSearchProducts(q)}
 finally{clearTimeout(timer)}
 for(const item of fresh){const at=products.findIndex(p=>p.id===item.id);if(at>=0)products[at]=item;else products.push(item)}
 try{localStorage.setItem(AI_KEY,JSON.stringify(products.filter(p=>String(p.id).startsWith('ai-')||String(p.id).startsWith('local-')).slice(-60)))}catch{}
 searching=false;searchMessage=fresh.length?t('추천 상품을 불러왔습니다','已加载推荐商品'):'';renderCoupang();
}
document.addEventListener('submit',e=>{if(mode!=='coupang'||e.target.closest('#coupang-app')===null)return;e.preventDefault()},true);
document.addEventListener('keydown',e=>{if(mode==='coupang'&&e.target.id==='cp-search'&&e.key==='Enter'){e.preventDefault();void searchProducts(e.target.value)}},true);
document.addEventListener('input',e=>{if(mode==='coupang'&&e.target.id==='cp-search')query=e.target.value},true);
document.addEventListener('click',e=>{if(typeof mode==='undefined'||mode!=='coupang')return;let b=e.target.closest('[data-cp]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();let a=b.dataset.cp,id=b.dataset.id,v=b.dataset.v;if(a==='tab'){view=v==='home'?'home':v;renderCoupang()}else if(a==='home'){view='home';renderCoupang()}else if(a==='back'){if(view==='checkout')view='cart';else view='home';renderCoupang()}else if(a==='product'){selected=id;view='detail';renderCoupang()}else if(a==='category'){category=v;view='category';renderCoupang()}else if(a==='cart'){view='cart';renderCoupang()}else if(a==='add'||a==='buy'){let item=state.cart.find(x=>x.id===id);if(item)item.qty++;else state.cart.push({id,qty:1});save();if(a==='buy'){view='cart';renderCoupang()}else{renderCoupang();flash(t('장바구니에 담았습니다','已加入购物车'))}}else if(a==='remove'){state.cart=state.cart.filter(x=>x.id!==id);save();renderCoupang()}else if(a==='checkout'){view='checkout';renderCoupang()}else if(a==='placeorder'){let total=state.cart.reduce((n,x)=>n+(products.find(p=>p.id===x.id)?.price||0)*x.qty,0);if(!state.cart.length)return;const wallet=window.__KKT_SHOP__;if(!wallet||wallet.balance<total){flash(t('카카오페이 잔액이 부족합니다','KakaoPay余额不足'));return}const placedAt=Date.now(),order='CP'+placedAt,items=state.cart.map(x=>({...x})),summary=items.map(x=>{const p=products.find(v=>v.id===x.id);return p?t(p.ko,p.cn)+(x.qty>1?' × '+x.qty:''):''}).filter(Boolean).join(' · ');if(!wallet.recordMerchantPayment?.({id:order,merchant:'쿠팡',item:summary,amount:total,at:placedAt})){flash(t('결제를 완료하지 못했습니다','支付未完成'));return}state.orders.unshift({id:order,date:new Intl.DateTimeFormat(zh()?'zh-CN':'ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(placedAt)),items,total,status:'결제 완료 · 상품 준비 중',statusCn:'付款完成 · 商品准备中'});state.cart=[];save();view='orders';renderCoupang();flash(t('결제가 완료되었습니다','付款成功'));setTimeout(()=>window.__IPHONE_SMS__?.notify?.({type:'merchant',sender:'카카오페이',message:t('쿠팡 결제가 완료되었습니다','Coupang付款成功')}),1200)}else if(a==='orders'){view='orders';renderCoupang()}else if(a==='order-search'){query='';view='story-orders';renderCoupang()}else if(a==='noop')flash(t('준비 중인 메뉴입니다','该功能正在准备中'))},true);
function waitStory(fn,ms){const timer=setTimeout(()=>{story.timers=story.timers.filter(x=>x!==timer);if(typeof mode!=='undefined'&&mode==='coupang'&&story.active)fn()},ms);story.timers.push(timer)}
function stopStory(){story.timers.forEach(clearTimeout);story={active:false,phase:'',result:false,keyIndex:-1,timers:[]}}
function playStoryOrderSearch(value,done){stopStory();story.active=true;story.phase='home';story.result=false;query='';view='home';renderCoupang();waitStory(()=>{story.phase='orders-tap';renderCoupang();waitStory(()=>{story.phase='orders';view='orders';renderCoupang();waitStory(()=>{story.phase='search-tap';renderCoupang();waitStory(()=>{story.phase='typing';view='story-orders';query='';renderCoupang();const chars=Array.from(String(value||''));let i=0;const type=()=>{if(i>=chars.length){story.keyIndex=-1;story.result=true;story.phase='result';renderCoupang();waitStory(()=>{story.active=false;done?.()},1500);return}story.keyIndex=(i*5+3)%26;query+=chars[i++];renderCoupang();waitStory(type,135)};waitStory(type,320)},430)},650)},430)},650)}
window.addEventListener('iphone26:languagechange',()=>{if(typeof mode!=='undefined'&&mode==='coupang')renderCoupang()});
const previousRender=window.render;window.render=function(){if(typeof mode!=='undefined'&&mode==='coupang')renderCoupang();else previousRender()};
const previousBack=window.back;window.back=function(){if(typeof mode!=='undefined'&&mode==='coupang'&&view!=='home'){view=view==='checkout'?'cart':'home';renderCoupang()}else previousBack()};
window.__COUPANG__={render:renderCoupang,playStoryOrderSearch,stopStory,get state(){return JSON.parse(JSON.stringify(state))},products};
})();
