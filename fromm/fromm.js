(function frommModule() {
  'use strict';
  if (window.__fromm26Loaded) return;
  window.__fromm26Loaded = true;

  const appEl = document.querySelector('#app');
  const frame = document.querySelector('#appcontent');
  const status = document.querySelector('#status');
  const gesture = document.querySelector('#gesture');
  const base = new URL('./fromm/', document.baseURI);
  const escape = x => String(x ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  const svg = name => {
    const path = {
      back: '<path d="m15 18-6-6 6-6"/>',
      dots: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      send: '<path d="m12 19 0-14m0 0-6 6m6-6 6 6"/>',
      reply: '<path d="M20 11.5c0 4-3.5 7-8 7-1.5 0-3-.3-4.3-.9L4 19l1.3-3.7A6.8 6.8 0 0 1 4 11.5c0-4 3.5-7 8-7s8 3 8 7z"/>'
    };
    return `<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path[name] || ''}</svg>`;
  };

  let scenes = [];
  let collections = new Map();
  let scripted = new Map();
  let messageThreads = new Map();
  const fixedTurns = [];
  const fixedSent = () => local.filter(x => x.fixed === true).length;
  let ready = false;
  let busy = false;
  let failed = false;
  let view = 'chat';
  let selectedId = '';
  let sort = 'new';
  let visibleCount = 20;
  let chatScrollTop = null;
  let replyScrollTop = 0;
  let currentDraft = '';
  const pendingTimer = new Map();
  let local = [];
  try {
    const saved = JSON.parse(localStorage.getItem('fromm26_artist_extra') || '[]');
    if (Array.isArray(saved)) local = saved.filter(x => typeof x.text === 'string').slice(-40).map(x => ({ ...x, id: x.id || `sent-legacy-${Date.now()}-${Math.random().toString(36).slice(2)}`, replyScene: x.replyScene || '' }));
  } catch {}

  const isActive = () => typeof mode !== 'undefined' && mode === 'fromm';
  const chinese=()=>window.IphoneLocale?.language==='zh';
  const contentFor=item=>{
    if(!item)return '';
    if(!chinese())return item.text||'';
    if(item.fixed&&item.stage)return ['요','在干嘛','吃饭了吗？'][item.stage-1]||item.text;
    return item.textZh||item.text||'';
  };
  const labelFor=(item,key)=>chinese()?(item?.[key+'Zh']||item?.[key]||''):(item?.[key]||'');
  const getScene = () => scenes.find(x => x.id === selectedId);
  const activeLocal = () => local.find(x => x.id === selectedId);
  const activeThread = () => messageThreads.get(selectedId) || getScene() || activeLocal();
  const selectedCollection = () => {
    const custom = activeLocal();
    return custom ? custom.replyScene : selectedId;
  };
  const getReplies = () => {
    const rows = collections.get(selectedCollection()) || [];
    return sort === 'new' ? [...rows].reverse() : rows;
  };
  const koreanTime = () => new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', hour: 'numeric', minute: '2-digit', hour12: true
  }).format(new Date());
  function persistLocal() {
    try { localStorage.setItem('fromm26_artist_extra', JSON.stringify(local)); } catch {}
  }
  function replyCard(id, count, previews, waiting = false) {
    return `<div class="fm-replyline"><span class="fm-from-avatar"><i></i><b>F</b></span><div class="fm-replywrap"><span class="fm-from-label">FROM FAN</span><button class="fm-replycard ${waiting ? 'fm-waiting' : ''}" data-fm="${waiting ? 'waiting' : 'open'}" data-scene="${escape(id)}" ${waiting ? 'disabled aria-label="답장 기다리는 중"' : `aria-label="${count}개의 답장 보기"`}><div class="fm-cardtop"><b>답장 모아보기</b><span>${waiting ? '답장 도착 중…' : count + '개 ›'}</span></div><div class="fm-preview">${waiting ? '팬들이 메시지를 확인하고 있어요…' : escape(previews.join(' · '))}</div></button></div></div>`;
  }

  function header(title, right) {
    return `<header class="fm-top"><button class="fm-topbtn" data-fm="back" aria-label="뒤로">${svg('back')}</button><div class="fm-heading"><strong>${escape(title)}</strong>${title === '재현' ? '<small>fromm · 아티스트</small>' : ''}</div>${right || '<span class="fm-emptybtn"></span>'}</header>`;
  }

  function message(item) {
    const isYo = item.text.trim() === '요';
    return `<div class="fm-msg"><time class="fm-time">${escape(item.time)}</time><div class="fm-bubble ${isYo ? 'fm-yo' : ''}">${escape(contentFor(item))}</div></div>`;
  }

  function chatHtml() {
    const days = scenes.map(scene => {
      const messages = scene.messages.map(m => {
        const replies=collections.get(m.id)||[];
        const previews=replies.slice(0,2).map(item=>chinese()?(item.textZh||item.text):item.text);
        const card = m.replies ? replyCard(m.id, replies.length, previews) : '';
        return message(m) + card;
      }).join('');
      return `<section class="fm-scene"><div class="fm-date">${escape(labelFor(scene,'dateLabel'))}</div>${messages}</section>`;
    }).join('');
    const extras = local.map(m => {
      const scene = scenes.find(x => x.id === m.replyScene) || scripted.get(m.replyScene);
      const replies = collections.get(m.replyScene) || [];
      const previews = chinese()?(scene?.previewZh || replies.slice(0,2).map(x=>x.textZh||x.text)):(scene?.preview || replies.slice(0,2).map(x=>x.text));
      const replyBlock = m.replyScene && scene
        ? replyCard(m.id, replies.length, previews)
        : (m.fixed && !m.replyScene ? replyCard(m.id, 0, [], true) : '');
      return message(m) + replyBlock;
    }).join('');
    const more = '';
    const finished = true;
    return `<div class="fm-shell">${header('재현', '<span class="fm-emptybtn"></span>')}<div class="fm-scroll" id="fm-chat-list">${days}${more}</div><div class="fm-composer"><button class="fm-plus" data-fm="attachment" aria-label="첨부">${svg('plus')}</button><textarea id="fm-draft" placeholder="오늘의 메시지를 모두 보냈어요" rows="1" maxlength="300" disabled></textarea><button class="fm-send" data-fm="send" aria-label="메시지 보내기" disabled>${svg('send')}</button></div></div>`;
  }

  function fanRow(item, i) {
    const text = contentFor(item);
    const name = item.name || '더비';
    const color = (name.length + i) % 4;
    return `<div class="fm-fan"><span class="fm-avatar" data-c="${color}">${escape(name.slice(0, 1))}</span><div class="fm-fanbody"><div class="fm-fanheader"><b>${escape(name)}</b><time>${escape(item.time || '')}</time></div><div class="fm-fantext">${escape(text)}</div></div></div>`;
  }

  function repliesHtml() {
    const scene = activeThread();
    if (!scene) return '<div class="fm-shell"><div class="fm-status">답장 정보를 찾을 수 없습니다.</div></div>';
    const rows = getReplies();
    const custom = activeLocal();
    const anchor = custom || scene.messages?.find(m => m.id === scene.anchor) || scene.message || scene;
    return `<div class="fm-shell">${header('답장 모아보기', '<span class="fm-emptybtn"></span>')}<div class="fm-origin"><small>재현 · ${escape(anchor?.time || '')}</small><strong>${escape(contentFor(anchor)||labelFor(scene,'topic'))}</strong></div><div class="fm-sortbar"><b>답장 ${rows.length}개</b><button data-fm="sort">${sort === 'new' ? '최신순' : '오래된순'} ⌄</button></div><div class="fm-replies" id="fm-replies-list">${rows.slice(0, visibleCount).map(fanRow).join('')}${visibleCount < rows.length ? '<button class="fm-more" data-fm="more">답장 더 보기 ↓</button>' : ''}</div></div>`;
  }

  function draw(opts = {}) {
    if (!isActive()) return;
    appEl.className = 'layer appscreen active fromm-screen';
    appEl.style.display = 'block';
    status.classList.add('dark');
    gesture.classList.add('ink');
    frame.style.bottom = 'calc(var(--safe-bottom) + 28px)';
    frame.style.overflow = 'hidden';
    if (!ready) {
      frame.innerHTML = `<div class="fm-shell"><div class="fm-status">${failed ? '메시지를 불러올 수 없습니다. 새로고침해 주세요.' : 'fromm 메시지를 불러오는 중…'}</div></div>`;
      return;
    }
    frame.innerHTML = view === 'replies' ? repliesHtml() : chatHtml();
    if (view === 'chat') {
      const scroller = frame.querySelector('#fm-chat-list');
      if (scroller) scroller.scrollTop = chatScrollTop === null ? scroller.scrollHeight : chatScrollTop;
    } else {
      const scroller = frame.querySelector('#fm-replies-list');
      if (scroller) scroller.scrollTop = opts.preserveReplies ? replyScrollTop : 0;
    }
  }

  const fanNamesKo=['현재만보는더비','말랑현재','구름다리','소금빵좋아','재현이웃음','별빛정원','오늘도더비','다정한밤','곰돌이티','하루끝에재현'];
  const fanNamesZh=['草莓牛奶','小熊软糖','橘子汽水','月亮收集者','今天也想你','奶油泡芙','晚风很好','一颗小星星','软糖日记','海边散步'];
  const replyPools={
    hello:{
      ko:['요 여기있어','재현아 왔구나','기다리고 있었어 ㅋㅋ','나도 요','오늘도 반가워','알림 보자마자 왔어','왜 이렇게 귀엽게 와','딱 기다리던 타이밍이야','오늘 하루 어땠어','재현이 왔다'],
      zh:['我在这里','你终于来啦','看到提醒马上就来了','我也哟','一直在等你出现','今天过得怎么样','一来就这么可爱','刚好正在想你','欢迎回来','今天也很高兴见到你']
    },
    doing:{
      ko:['퇴근하고 집 가는 중이야','저녁 먹고 있었어','과제하다가 잠깐 쉬는 중','침대에 누워서 프롬 보고 있어','운동 끝나고 집 왔어','친구랑 카페에 있어','드라마 보다가 알림 보고 왔어','아직 회사야 살려줘','강아지 산책시키고 있어','너 기다리고 있었지'],
      zh:['刚下班正在回家','正在吃晚饭','写作业写到一半来看看','躺在床上看FROMM','刚健身结束','和朋友在咖啡店','看剧的时候收到提醒了','还在公司加班','正在遛狗','当然是在等你']
    },
    pictorial:{
      ko:['화보 봤어 진짜 너무 잘 나왔어','분위기 미쳤더라','사진 뜨자마자 저장했어','카인드오브랑 너무 잘 어울려','표정이랑 착장 다 좋았어','잘 나온 정도가 아닌데 ㅋㅋ','이번 화보 완전 레전드야','한 장씩 계속 보고 있어','악세서리까지 완벽했어','진짜 자랑할 만해'],
      zh:['看了！真的拍得特别好','氛围感太绝了','照片一出来我就保存了','和KIND OF特别合适','表情和造型都很好看','哪里只是拍得好，是神图','这次画报完全是传奇','每一张都反复看了好多遍','连配饰都特别适合你','确实值得你骄傲']
    },
    story:{
      ko:['무슨 썰인데 빨리 말해줘','화보 찍을 때 재밌었겠다','악세서리 착용한 거 너무 잘 어울렸어','그래서 무슨 일이 있었는데 ㅋㅋ','벌써 재밌다 계속 얘기해줘','관계자분도 놀라셨겠다','옷이랑 반지 조합 진짜 좋았어','비하인드 더 들려줘','이런 얘기 해주는 거 너무 좋아','사진 다시 보면서 들어야겠다'],
      zh:['什么故事快讲给我们听','拍画报的时候一定很有趣','配饰真的特别适合你','所以后来发生什么了哈哈','已经开始觉得好笑了，继续讲','工作人员应该也很惊讶','衣服和戒指的搭配特别好看','再多说一点幕后故事吧','最喜欢听你讲这种小故事','我要一边重看画报一边听']
    },
    piercing:{
      ko:['귀가 안 막혀 있었던 거네 ㅋㅋ','10년 만에 알았다니 너무 웃겨','안 아팠다니 다행이다','쏘옥 들어간 게 진짜 신기해','연습생 때 귀걸이 했던 거 보고 싶다','본인이 제일 놀란 게 너무 귀여워','살짝만 막혀 있었나 보다','이제 귀걸이 자주 해줘','그 장면 상상하니까 웃겨','화보 귀걸이 진짜 잘 어울렸어'],
      zh:['原来耳洞根本没有完全堵住哈哈','十年后才发现也太好笑了','不疼就好','居然一下就戴进去了，好神奇','好想看看练习生时期戴耳环的样子','你自己最惊讶这件事太可爱了','看来只是稍微堵住了一点','以后可以多戴耳环了','想象那个场面就觉得好笑','画报里的耳环真的很适合你']
    },
    dinner:{
      ko:['저녁은 고기 먹자','김치찌개 어때','오늘은 닭갈비 추천','따뜻한 국밥 먹어','파스타 먹고 싶다','제발 밥부터 챙겨 먹어','치킨 먹자 ㅋㅋ','샤브샤브 어때','나는 떡볶이 먹을 거야','너는 뭐 먹고 싶은데'],
      zh:['晚饭吃烤肉吧','要不要吃泡菜汤','今天推荐炒鸡排','吃一碗热乎乎的汤饭吧','我想吃意面','先好好吃饭最重要','吃炸鸡吧哈哈','火锅怎么样','我准备吃辣炒年糕','你自己想吃什么']
    }
  };
  function poolFor(message){
    const text=message.text||'';
    if(message.id==='m01')return replyPools.hello;
    if(message.id==='m02')return replyPools.doing;
    if(message.id==='m19')return replyPools.dinner;
    if(/화보|잘나왔지|카인드오브랑/.test(text))return replyPools.pictorial;
    if(/귀|반지|귀걸이|구멍|막혀|들어가|아팠|10년/.test(text))return replyPools.piercing;
    return replyPools.story;
  }
  function buildFanReplies(message){
    const pool=poolFor(message),rows=[];
    for(let i=0;i<10;i++){
      rows.push({id:message.id+'-ko-'+(i+1),name:fanNamesKo[i],text:pool.ko[i],textZh:pool.ko[i],time:message.time,lang:'ko'});
      rows.push({id:message.id+'-zh-'+(i+1),name:fanNamesZh[i],text:pool.zh[i],textZh:pool.zh[i],time:message.time,lang:'zh-CN'});
    }
    const seed=Number(message.id.replace(/\D/g,''))||1;
    return rows.map((row,index)=>({row,key:(index*7+seed*11)%20})).sort((a,b)=>a.key-b.key).map(item=>item.row);
  }
  async function load() {
    if (busy || ready) return;
    busy = true;
    try {
      const response=await fetch(new URL('scenes.json?locale=3', base),{cache:'no-store'});
      if(!response.ok)throw new Error('Data missing');
      const data=await response.json();
      if(!Array.isArray(data.scenes))throw new Error('Invalid fromm data');
      scenes=data.scenes;
      collections=new Map();
      messageThreads=new Map();
      for(const scene of scenes){
        for(const message of scene.messages||[]){
          const replies=buildFanReplies(message);
          collections.set(message.id,replies);
          messageThreads.set(message.id,{
            id:message.id,topic:message.text,topicZh:message.textZh,anchor:message.id,
            message,messages:[message],replyCount:replies.length
          });
        }
      }
      scripted=new Map();
      ready = true;
      failed = false;
      draw();
    } catch (e) {
      failed = true;
      draw();
    } finally {
      busy = false;
    }
  }

  function openReplies(id) {
    const list = frame.querySelector('#fm-chat-list');
    if (list) chatScrollTop = list.scrollTop;
    selectedId = id;
    view = 'replies';
    visibleCount = 20;
    replyScrollTop = 0;
    sort = 'new';
    draw();
  }

  function backFromm() {
    if (view === 'replies') { view = 'chat'; draw(); return; }
    closeApp();
  }

  const previousRender = render;
  render = function (...args) {
    if (isActive()) {
      draw();
      if (!ready) load();
      return;
    }
    previousRender.apply(this, args);
  };
  const previousBack = back;
  back = function (...args) {
    if (isActive()) return backFromm();
    return previousBack.apply(this, args);
  };

  frame.addEventListener('click', event => {
    if (!isActive()) return;
    const btn = event.target.closest('[data-fm]');
    if (!btn) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const action = btn.dataset.fm;
    if (action === 'open') { openReplies(btn.dataset.scene); return; }
    if (action === 'back') { backFromm(); return; }
    if (action === 'sort') {
      sort = sort === 'new' ? 'old' : 'new';
      visibleCount = 20;
      replyScrollTop = 0;
      draw();
      return;
    }
    if (action === 'more') {
      replyScrollTop = frame.querySelector('#fm-replies-list')?.scrollTop || 0;
      visibleCount += 20;
      draw({ preserveReplies: true });
      return;
    }
    if (action === 'menu') { return; }
    if (action === 'waiting') { return; }
    if (action === 'attachment') {
      // File attachments aren't simulated yet; leave the chat uninterrupted.
      frame.querySelector('#fm-draft')?.focus();
      return;
    }
    if (action === 'send') {
      const field = frame.querySelector('#fm-draft');
      const typed = field?.value.trim();
      // Typed content is only the interaction trigger. The artist's message is fixed.
      if (!typed || !ready) return;
      const step = fixedSent();
      if (step >= fixedTurns.length) return;
      const script = fixedTurns[step];
      const id = 'fixed-' + Date.now() + '-' + Math.random().toString(36).slice(2);
      const record = {
        id, text: script.text, time: koreanTime(), replyScene: '', fixed: true, stage: step + 1
      };
      local.push(record);
      local = local.slice(-40);
      persistLocal();
      currentDraft = '';
      chatScrollTop = null;
      draw();
      const timer = setTimeout(() => {
        pendingTimer.delete(id);
        const item = local.find(x => x.id === id);
        if (!item) return;
        item.replyScene = script.group;
        persistLocal();
        if (isActive() && view === 'chat') {
          chatScrollTop = null;
          draw();
        }
      }, 850);
      pendingTimer.set(id, timer);
    }
  }, true);

  frame.addEventListener('input', event => {
    if (isActive() && event.target.id === 'fm-draft') currentDraft = event.target.value;
  }, true);
  frame.addEventListener('scroll', event => {
    if (!isActive()) return;
    if (event.target.id === 'fm-chat-list') chatScrollTop = event.target.scrollTop;
    if (event.target.id === 'fm-replies-list') replyScrollTop = event.target.scrollTop;
  }, true);

  window.__FROMM26_DIAG__ = {
    get scenes() { return scenes.length; },
    get replies() { return [...collections.values()].reduce((a, x) => a + x.length, 0); },
    get ready() { return ready; },
    get view() { return view; },
    get fixedSent() { return fixedSent(); },
    get scriptedGroups() { return [...scripted.keys()]; }
  };

  load();
})();