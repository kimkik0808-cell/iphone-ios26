/* iPhone iOS 26 / Korean voicemail add-on.
 * Works with the existing phonePage()/render() in index.html (V23).
 * No existing calls, contacts, or call transcript data is modified.
 */
(() => {
  'use strict';

  if (window.__voiceMail26Installed) return;
  window.__voiceMail26Installed = true;

  const API_URL = 'https://api.github.com/repos/kimkik0808-cell/iphone-ios26/contents/voicemail?ref=main';
  const AUDIO_EXT = /\.(mp3|m4a|wav|aac|mp4)$/i;
  const baseURL = new URL('./', document.baseURI);
  const dirURL = (name) => new URL('voicemail/' + encodeURIComponent(name), baseURL).href;
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const seconds = (value) => {
    if (!Number.isFinite(value) || value < 0) return '0:00';
    value = Math.floor(value);
    return Math.floor(value / 60) + ':' + String(value % 60).padStart(2, '0');
  };
  const playIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M8 5.2a1 1 0 0 1 1.54-.84l10 6.8a1 1 0 0 1 0 1.68l-10 6.8A1 1 0 0 1 8 18.8z"/></svg>';
  const pauseIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';

  const state = {items: [], loaded: false, loading: false, error: '', opened: -1, playing: false, request: null};
  const player = new Audio();
  player.preload = 'metadata';
  let playingFile = '';

  function currentView() {
    return typeof mode !== 'undefined' && mode === 'phone' &&
      typeof sub !== 'undefined' && sub !== 'call' &&
      typeof phoneTab !== 'undefined' && phoneTab === 'voicemail';
  }

  function stopPlayer() {
    player.pause();
    player.removeAttribute('src');
    player.load();
    playingFile = '';
    state.playing = false;
  }

  function labelFromFile(filename) {
    const name = filename.replace(AUDIO_EXT, '').replace(/[_-]+/g,' ').trim();
    return name || '음성 메시지';
  }

  function normalize(file, meta = {}) {
    return {
      file,
      name: String(meta.name || meta.caller || labelFromFile(file)),
      date: String(meta.date || meta.time || ''),
      number: String(meta.number || ''),
      note: String(meta.note || '')
    };
  }

  async function readMetadata() {
    try {
      const res = await fetch(dirURL('messages.json') + '?v=' + Date.now(), {cache:'no-store'});
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : (Array.isArray(data.messages) ? data.messages : []);
    } catch (e) {
      return [];
    }
  }

  async function load(force = false) {
    if (state.loading) return state.request;
    if (state.loaded && !force) return;
    state.loading = true;
    state.error = '';
    if (force) {
      stopPlayer();
      state.opened = -1;
    }
    paint();
    state.request = (async () => {
      // Load files bundled with the website first. This works on Cloudflare Pages
      // even when the public GitHub API is rate-limited, unavailable, or blocked.
      const meta = await readMetadata();
      const metaMap = new Map(meta.filter(x => x && typeof x.file === 'string')
        .map(x => [x.file.normalize('NFC'), x]));
      let filenames = [...new Set(meta
        .map(x => x && x.file)
        .filter(x => typeof x === 'string' && AUDIO_EXT.test(x)))];
      if (!filenames.length) {
        // Legacy fallback: directories without a messages.json can still load.
        try {
          const response = await fetch(API_URL + '&_=' + Date.now(), {
            cache: 'no-store',
            headers: {'Accept':'application/vnd.github+json'}
          });
          if (!response.ok) throw new Error('GitHub API ' + response.status);
          const body = await response.json();
          if (!Array.isArray(body)) throw new Error('응답 형식 오류');
          filenames = body.filter(x => x && x.type === 'file' && AUDIO_EXT.test(x.name))
            .map(x => x.name);
        } catch (err) {
          throw new Error('No bundled voicemail manifest and directory discovery failed: ' + err);
        }
      }
      state.items = filenames.map(file => normalize(file, metaMap.get(file.normalize('NFC')) || {}));
      state.loaded = true;
      state.error = '';
    })().catch(err => {
      state.error = '음성 메시지를 불러오지 못했습니다.';
      state.loaded = false;
      console.warn('[Voicemail] Failed to load audio list:', err);
    }).finally(() => {
      state.loading = false;
      state.request = null;
      paint();
    });
    return state.request;
  }

  function itemHTML(item, index) {
    const open = state.opened === index;
    const isPlaying = open && state.playing && playingFile === item.file;
    return `<article class="vm26-item ${open ? 'vm26-is-open' : ''}">
      <button type="button" class="vm26-entry" data-vm26="open" data-vm-index="${index}" aria-expanded="${open}" aria-label="${escape(item.name)} 음성 메시지">
        <span class="vm26-dot" aria-hidden="true"></span>
        <span class="vm26-main"><strong>${escape(item.name)}</strong><small>${escape(item.number || '음성 메시지')}</small></span>
        <span class="vm26-right">${item.date ? `<time>${escape(item.date)}</time>` : ''}<span class="vm26-chevron">${open ? '⌄' : '›'}</span></span>
      </button>
      ${open ? `<div class="vm26-detail">
        ${item.note ? `<p class="vm26-note">${escape(item.note)}</p>` : ''}
        <div class="vm26-controls">
          <button type="button" class="vm26-play" data-vm26="play" data-vm-index="${index}" aria-label="${isPlaying ? '일시 정지' : '재생'}">${isPlaying ? pauseIcon : playIcon}</button>
          <div class="vm26-track">
            <input class="vm26-seek" data-vm26-seek="${index}" type="range" min="0" max="1000" value="0" aria-label="재생 위치" />
            <div class="vm26-clock"><span class="vm26-position">0:00</span><span class="vm26-duration">0:00</span></div>
          </div>
        </div>
      </div>` : ''}
    </article>`;
  }

  function markup() {
    if (state.loading && !state.loaded) return `<div class="vm26-status" role="status"><div class="vm26-spinner"></div><p>음성 메시지를 불러오는 중…</p></div>`;
    if (state.error) return `<div class="vm26-status" role="alert"><p>${escape(state.error)}</p><button type="button" data-vm26="refresh">다시 시도</button></div>`;
    if (!state.loaded) return `<div class="vm26-status" role="status"><div class="vm26-spinner"></div><p>음성 메시지를 확인하는 중…</p></div>`;
    if (!state.items.length) return `<div class="phone-empty vm26-empty"><i>◉</i><b>음성 메시지 없음</b><span>새로운 음성 메시지가 없습니다.</span><button type="button" data-vm26="refresh">새로고침</button></div>`;
    return `<div class="vm26-list" aria-label="음성 사서함 메시지">${state.items.map(itemHTML).join('')}</div>
      <div class="vm26-footer"><span>${state.items.length}개의 음성 메시지</span><button type="button" data-vm26="refresh" aria-label="목록 새로고침">새로고침</button></div>`;
  }

  function paint() {
    if (!currentView()) return;
    const root = document.getElementById('vm26-root');
    if (!root) return;
    root.innerHTML = markup();
    syncPlayerUI();
  }

  function syncPlayerUI() {
    if (!currentView() || state.opened < 0) return;
    const root = document.getElementById('vm26-root');
    if (!root) return;
    const slider = root.querySelector('.vm26-seek');
    const pos = root.querySelector('.vm26-position');
    const dur = root.querySelector('.vm26-duration');
    const button = root.querySelector('.vm26-play');
    const currentItem = state.items[state.opened];
    const active = currentItem && playingFile === currentItem.file;
    if (pos) pos.textContent = active ? seconds(player.currentTime) : '0:00';
    if (dur) dur.textContent = active ? seconds(player.duration) : '0:00';
    if (slider) {
      slider.value = active && player.duration > 0 ? Math.round(player.currentTime / player.duration * 1000) : 0;
      slider.style.setProperty('--vm26-progress', slider.value / 10 + '%');
    }
    if (button) {
      const playing = active && state.playing;
      button.innerHTML = playing ? pauseIcon : playIcon;
      button.setAttribute('aria-label', playing ? '일시 정지' : '재생');
    }
  }

  player.addEventListener('timeupdate', syncPlayerUI);
  player.addEventListener('durationchange', syncPlayerUI);
  player.addEventListener('loadedmetadata', syncPlayerUI);
  player.addEventListener('pause', () => {state.playing = false; syncPlayerUI();});
  player.addEventListener('play', () => {state.playing = true; syncPlayerUI();});
  player.addEventListener('ended', () => {state.playing = false; syncPlayerUI();});
  player.addEventListener('error', () => {
    state.playing = false;
    syncPlayerUI();
    if (playingFile) {
      const root = document.getElementById('vm26-root');
      if (root) {
        const info = root.querySelector('.vm26-detail');
        if (info && !info.querySelector('.vm26-audio-error')) {
          info.insertAdjacentHTML('beforeend', '<p class="vm26-audio-error">오디오 파일을 재생할 수 없습니다.</p>');
        }
      }
    }
  });

  function openMessage(index) {
    if (!state.items[index]) return;
    if (state.opened === index) {
      state.opened = -1;
      player.pause();
    } else {
      state.opened = index;
      if (playingFile !== state.items[index].file) stopPlayer();
    }
    paint();
  }

  function playMessage(index) {
    const item = state.items[index];
    if (!item) return;
    if (playingFile !== item.file) {
      player.pause();
      playingFile = item.file;
      player.src = dirURL(item.file);
      player.load();
    }
    if (!player.paused) {
      player.pause();
    } else {
      // play() is called directly from the tap gesture for iPhone Safari.
      player.play().catch(err => {
        state.playing = false;
        console.warn('[Voicemail] Audio playback blocked:', err);
        syncPlayerUI();
      });
    }
    syncPlayerUI();
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-vm26]');
    if (!button || !currentView()) return;
    const action = button.getAttribute('data-vm26');
    const index = Number(button.getAttribute('data-vm-index'));
    event.preventDefault();
    event.stopPropagation();
    if (action === 'open') openMessage(index);
    if (action === 'play') playMessage(index);
    if (action === 'refresh') load(true);
  }, true);

  document.addEventListener('input', (event) => {
    const slider = event.target.closest('[data-vm26-seek]');
    if (!slider || !currentView()) return;
    if (state.opened < 0 || !Number.isFinite(player.duration) || player.duration <= 0) return;
    player.currentTime = Number(slider.value) / 1000 * player.duration;
    syncPlayerUI();
  }, true);

  const STYLE = `
  .vm26-list{margin-top:2px;border-top:1px solid #e5e5ea;border-bottom:1px solid #e5e5ea;background:#fff}
  .vm26-item{border-bottom:1px solid #e5e5ea;background:#fff}.vm26-item:last-child{border-bottom:0}
  .vm26-entry{width:100%;min-height:72px;display:flex;align-items:center;gap:12px;padding:11px 18px;background:transparent;color:#161619;text-align:left;border:0;font-family:inherit}
  .vm26-dot{height:8px;width:8px;flex:0 0 8px;border-radius:50%;background:#007aff}
  .vm26-main{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}.vm26-main strong{font-size:16px;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.vm26-main small{font-size:13px;color:#8e8e93;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .vm26-right{display:flex;align-items:center;gap:8px;color:#8e8e93;font-size:12px;flex:0 0 auto;max-width:44%}.vm26-right time{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.vm26-chevron{color:#a4a4ab;font-size:22px;font-weight:350}
  .vm26-detail{padding:0 20px 20px 39px;animation:vm26-in .18s ease}.vm26-note{font-size:13px;color:#74747a;line-height:1.5;margin:0 0 12px}.vm26-controls{display:flex;gap:15px;align-items:center}.vm26-play{width:43px;height:43px;display:grid;place-items:center;background:#f0f0f4;color:#007aff;border-radius:50%;border:0;flex:0 0 43px}.vm26-track{min-width:0;flex:1}.vm26-seek{appearance:none;-webkit-appearance:none;display:block;width:100%;height:5px;background:linear-gradient(to right,#007aff var(--vm26-progress,0%),#d5d5db var(--vm26-progress,0%));border-radius:10px;margin:0;touch-action:pan-y}.vm26-seek::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#007aff;border:0;box-shadow:0 1px 2px #0002}.vm26-clock{display:flex;justify-content:space-between;color:#8e8e93;font-size:11px;margin-top:9px;font-variant-numeric:tabular-nums}
  .vm26-footer{display:flex;align-items:center;justify-content:space-between;padding:15px 20px 20px;color:#8e8e93;font-size:12px}.vm26-footer button,.vm26-status button,.vm26-empty button{border:0;background:none;color:#007aff;font-size:13px;font-weight:550;padding:8px}
  .vm26-status{text-align:center;padding:74px 20px;color:#85858b;font-size:14px;line-height:1.5}.vm26-status p{margin:14px 0 8px}.vm26-spinner{height:24px;width:24px;border:3px solid #dadade;border-top-color:#007aff;border-radius:50%;margin:0 auto;animation:vm26-spin .8s linear infinite}.vm26-empty button{display:block;margin:19px auto 0}.vm26-audio-error{font-size:12px;color:#e14640;margin:11px 0 0}
  @keyframes vm26-spin{to{transform:rotate(360deg)}}@keyframes vm26-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
  `;
  const styleElement = document.createElement('style');
  styleElement.id = 'voice-mail26-css';
  styleElement.textContent = STYLE;
  document.head.appendChild(styleElement);

  if (typeof phonePage !== 'function' || typeof render !== 'function') {
    console.error('[Voicemail] phonePage()/render() not found. Insert script at the end of index.html.');
    return;
  }

  const originalPhonePage = phonePage;
  const oldPlaceholder = '<div class="phone-empty"><i>◉</i><b>음성 메시지 없음</b><span>새로운 음성 메시지가 없습니다.</span></div>';
  phonePage = function (...args) {
    const html = originalPhonePage.apply(this, args);
    if (!currentView()) return html;
    if (!html.includes(oldPlaceholder)) {
      console.warn('[Voicemail] Phone placeholder changed; voicemail add-on needs a small update.');
      return html;
    }
    return html.replace(oldPlaceholder, `<div id="vm26-root">${markup()}</div>`);
  };

  const originalRender = render;
  render = function (...args) {
    const result = originalRender.apply(this, args);
    if (currentView()) {
      load();
      syncPlayerUI();
    } else if (!player.paused) {
      player.pause();
    }
    return result;
  };

  // The home gesture in V23 does not trigger render(); pause playback on exit.
  if (typeof closeApp === 'function') {
    const previousCloseApp = closeApp;
    closeApp = function (...args) {
      if (!player.paused) player.pause();
      return previousCloseApp.apply(this, args);
    };
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !player.paused) player.pause();
  });

  window.__VOICEMAIL26__ = {refresh: () => load(true), get files() {return state.items.map(x => x.file);}};
})();