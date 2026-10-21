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
  const fixedTurns = [{ text: '요', group: 't01' }, { text: '모하니', group: 't02' }, { text: '밥먹었어?', group: 't03' }];
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
  const getScene = () => scenes.find(x => x.id === selectedId);
  const activeLocal = () => local.find(x => x.id === selectedId);
  const activeThread = () => getScene() || activeLocal();
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
    return `<button class="fm-replycard ${waiting ? 'fm-waiting' : ''}" data-fm="${waiting ? 'waiting' : 'open'}" data-scene="${escape(id)}" ${waiting ? 'disabled aria-label="답장 기다리는 중"' : `aria-label="${count}개의 답장 보기"`}><div class="fm-cardtop"><b>▤ &nbsp;답장 모아보기</b><span>${waiting ? '답장 도착 중…' : count + '개 ›'}</span></div><div class="fm-preview">${waiting ? '팬들이 메시지를 확인하고 있어요…' : escape(previews.join(' · '))}</div></button>`;
  }

  function header(title, right) {
    return `<header class="fm-top"><button class="fm-topbtn" data-fm="back" aria-label="뒤로">${svg('back')}</button><div class="fm-heading"><strong>${escape(title)}</strong>${title === '재현' ? '<small>fromm · 아티스트</small>' : ''}</div>${right || '<span class="fm-emptybtn"></span>'}</header>`;
  }

  function message(item) {
    const isYo = item.text.trim() === '요';
    return `<div class="fm-msg"><time class="fm-time">${escape(item.time)}</time><div class="fm-bubble ${isYo ? 'fm-yo' : ''}">${escape(item.text)}</div></div>`;
  }

  function chatHtml() {
    const days = scenes.map(scene => {
      const messages = scene.messages.map(m => {
        const card = m.replies ? replyCard(scene.id, scene.replyCount, scene.preview) : '';
        return message(m) + card;
      }).join('');
      return `<section class="fm-scene"><div class="fm-date">${escape(scene.dateLabel)}</div>${messages}</section>`;
    }).join('');
    const extras = local.map(m => {
      const scene = scenes.find(x => x.id === m.replyScene) || scripted.get(m.replyScene);
      const replies = collections.get(m.replyScene) || [];
      const previews = scene?.preview || replies.slice(0, 2).map(x => x.text);
      const replyBlock = m.replyScene && scene
        ? replyCard(m.id, replies.length, previews)
        : (m.fixed && !m.replyScene ? replyCard(m.id, 0, [], true) : '');
      return message(m) + replyBlock;
    }).join('');
    const more = extras ? `<section class="fm-scene"><div class="fm-date">내가 보낸 메시지</div>${extras}</section>` : '';
    const finished = fixedSent() >= fixedTurns.length;
    return `<div class="fm-shell">${header('재현', '<span class="fm-emptybtn"></span>')}<div class="fm-scroll" id="fm-chat-list">${days}${more}</div><div class="fm-composer"><button class="fm-plus" data-fm="attachment" aria-label="첨부">${svg('plus')}</button><textarea id="fm-draft" placeholder="${finished ? '오늘의 메시지를 모두 보냈어요' : '메시지 입력'}" rows="1" maxlength="300" ${finished ? 'disabled' : ''}>${finished ? '' : escape(currentDraft)}</textarea><button class="fm-send" data-fm="send" aria-label="메시지 보내기" ${finished ? 'disabled' : ''}>${svg('send')}</button></div></div>`;
  }

  function fanRow(item, i) {
    const text = item.text || '';
    const name = item.name || '더비';
    const color = (name.length + i) % 4;
    return `<div class="fm-fan"><span class="fm-avatar" data-c="${color}">${escape(name.slice(0, 1))}</span><div class="fm-fanbody"><div class="fm-fanheader"><b>${escape(name)}</b><time>${escape(item.time || '')}</time></div><div class="fm-fantext">${escape(text)}</div></div></div>`;
  }

  function repliesHtml() {
    const scene = activeThread();
    if (!scene) return '<div class="fm-shell"><div class="fm-status">답장 정보를 찾을 수 없습니다.</div></div>';
    const rows = getReplies();
    const custom = activeLocal();
    const anchor = custom || scene.messages.find(m => m.id === scene.anchor);
    return `<div class="fm-shell">${header('답장 모아보기', '<span class="fm-emptybtn"></span>')}<div class="fm-origin"><small>재현 · ${escape(anchor?.time || '')}</small><strong>${escape(anchor?.text || scene.topic)}</strong></div><div class="fm-sortbar"><b>답장 ${rows.length}개</b><button data-fm="sort">${sort === 'new' ? '최신순' : '오래된순'} ⌄</button></div><div class="fm-replies" id="fm-replies-list">${rows.slice(0, visibleCount).map(fanRow).join('')}${visibleCount < rows.length ? '<button class="fm-more" data-fm="more">답장 더 보기 ↓</button>' : ''}</div></div>`;
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

  async function load() {
    if (busy || ready) return;
    busy = true;
    try {
      const responses = await Promise.all([
        fetch(new URL('scenes.json', base)),
        fetch(new URL('replies.json', base)),
        fetch(new URL('interactive.json', base))
      ]);
      if (!responses.every(r => r.ok)) throw new Error('Data missing');
      const [a, b, c] = await Promise.all(responses.map(x => x.json()));
      if (!Array.isArray(a.scenes) || !Array.isArray(b.collections) || !Array.isArray(c.collections))
        throw new Error('Invalid fromm data');
      const next = new Map([...b.collections, ...c.collections].map(x => [x.sceneId, x.replies]));
      for (const scene of a.scenes) {
        if (!next.has(scene.id) || next.get(scene.id).length !== scene.replyCount)
          throw new Error('Reply count mismatch');
      }
      for (const item of fixedTurns) {
        if (!next.has(item.group) || next.get(item.group).length < 60)
          throw new Error('Fixed three-step reply collection unavailable');
      }
      scenes = a.scenes;
      scripted = new Map(c.collections.map(x => [x.sceneId, {
        topic: x.phrase, preview: x.preview, replyCount: x.replies.length
      }]));
      collections = next;
      // Recover an interrupted reply arrival after a page reload.
      let changed = false;
      for (const item of local) {
        if (item.fixed && !item.replyScene) {
          item.replyScene = fixedTurns[(item.stage || 1) - 1]?.group || 't01';
          changed = true;
        }
      }
      if (changed) persistLocal();
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