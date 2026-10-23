(function musicModule(){
  'use strict';
  if (window.__AM26_INSTALL__) return;
  window.__AM26_INSTALL__=true;
  const owner='kimkik0808-cell', repo='iphone-ios26';
  const api=`https://api.github.com/repos/${owner}/${repo}/contents/music?ref=main`;
  const raw=`https://raw.githubusercontent.com/${owner}/${repo}/main/music/`;
  const mediaType=/\.(mp3|m4a|aac|wav|ogg|flac|mp4|webm)$/i;
  const e=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const basename=n=>n.replace(/\.[a-z\d]+$/i,'').replace(/[_]+/g,' ').trim();
  const safeStorage=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback}catch{return fallback}};
  const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
  const fmt=s=>Number.isFinite(s)?`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`:'0:00';
  const stamp=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);
  let tab='library', view='list', sheet='', query='', sort='recent', loading=false, loaded=false, loadTime=0, error='';
  let built=[], links=safeStorage('am26_links',[]), locals=[], ephemeral=[], currentId='', currentSrc='', shuffle=false, repeat=false;
  let fav=new Set(safeStorage('am26_favorites',[]));
  const audio=new Audio();
  audio.preload='metadata';
  audio.playsInline=true;
  let dbPromise;
  const openDb=()=>{
    if(dbPromise)return dbPromise;
    dbPromise=new Promise((res,rej)=>{
      if(!('indexedDB'in window)){rej(new Error('no_indexeddb'));return}
      const req=indexedDB.open('iphone-am26-music-v1',1);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('tracks'))db.createObjectStore('tracks',{keyPath:'id'})};
      req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error||new Error('storage_error'));
    });
    return dbPromise;
  };
  async function allLocal(){
    const db=await openDb();
    return new Promise((res,rej)=>{
      const q=db.transaction('tracks','readonly').objectStore('tracks').getAll();
      q.onsuccess=()=>res(q.result||[]);q.onerror=()=>rej(q.error);
    });
  }
  async function putLocal(record){
    const db=await openDb();
    await new Promise((res,rej)=>{
      const tx=db.transaction('tracks','readwrite');
      tx.objectStore('tracks').put(record);
      tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);
    });
  }
  async function deleteLocal(id){
    const db=await openDb();
    await new Promise((res,rej)=>{
      const tx=db.transaction('tracks','readwrite');
      tx.objectStore('tracks').delete(id);
      tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);
    });
  }
  const isMusic=()=>typeof mode!=='undefined'&&mode==='music';
  const current=()=>tracks().find(t=>t.id===currentId);
  const makeTrack=(x,source)=>({
    id:x.id,title:x.title||basename(x.name||'알 수 없는 노래'),artist:x.artist||'알 수 없는 아티스트',
    src:x.src||'',cover:x.cover||'',source,filename:x.name||'',size:x.size||0,
    blob:x.blob||null,created:x.created||0
  });
  function tracks(){
    return [...built.map(x=>makeTrack(x,'official')),...links.map(x=>makeTrack(x,'url')),...locals.map(x=>makeTrack(x,'local')),...ephemeral.map(x=>makeTrack(x,'local'))];
  }
  const trById=id=>tracks().find(t=>t.id===id);
  function sanitizedUrl(text){
    try{const u=new URL(String(text||'').trim());if(u.protocol!=='https:')return'';if(u.username||u.password)return'';return u.href}catch{return''}
  }
  function imgCover(track){
    if(!track?.cover)return '';
    const cover=sanitizedUrl(track.cover)||((!track.cover.includes('/')&&!track.cover.includes('..'))?raw+encodeURIComponent(track.cover):'');
    return cover?`<img alt="" loading="lazy" src="${e(cover)}" onerror="this.remove()">`:'';
  }
  function art(track,large=false){
    return `<span class="am-art" data-hue="${e(String((track?.title||'').length%4))}" ${large?'style="width:100%;height:100%;font-size:100px;border-radius:inherit"':''}>${imgCover(track)||'♫'}</span>`;
  }
  function origin(t){return t.source==='official'?'보관함 · 기본 음악':t.source==='url'?'내 링크':'이 기기에 저장됨'}
  function info(t){return `${t.artist} · ${origin(t)}`}
  function icon(type){
    const paths={
      play:'<path d="M8 4.9c0-.8.9-1.3 1.6-.9l10 7c.7.5.7 1.5 0 2l-10 7c-.7.4-1.6-.1-1.6-.9z" fill="currentColor" stroke="none"/>',
      pause:'<rect x="6" y="4" width="4" height="16" rx="1.5" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1.5" fill="currentColor" stroke="none"/>',
      prev:'<path d="M4.7 4.5v15" stroke-width="2.2"/><path d="M19.5 4.5 8 12l11.5 7.5z" fill="currentColor" stroke="none"/>',
      next:'<path d="M19.3 4.5v15" stroke-width="2.2"/><path d="M4.5 4.5 16 12 4.5 19.5z" fill="currentColor" stroke="none"/>',
      down:'<path d="m5 9 7 7 7-7" stroke-width="2.25"/>',
      more:'<circle cx="5" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.7" fill="currentColor" stroke="none"/>',
      heart:'<path d="M20.5 8.6c0 4.1-4.5 7.5-8.5 10.8C8 16.1 3.5 12.7 3.5 8.6a4.7 4.7 0 0 1 8.5-2.7 4.7 4.7 0 0 1 8.5 2.7z" stroke-width="1.7"/>',
      heartFill:'<path d="M20.5 8.6c0 4.1-4.5 7.5-8.5 10.8C8 16.1 3.5 12.7 3.5 8.6a4.7 4.7 0 0 1 8.5-2.7 4.7 4.7 0 0 1 8.5 2.7z" fill="currentColor" stroke="none"/>',
      shuffle:'<path d="M4 7h2c5 0 7 10 12 10h2m-4-3 4 3-4 3M4 17h2c2.3 0 3.8-1.9 5-4M15 7h5m-4-3 4 3-4 3" stroke-width="1.9"/>',
      repeat:'<path d="M17 5h1a3 3 0 0 1 3 3v5m0 0-3-3m3 3 3-3M7 19H6a3 3 0 0 1-3-3v-5m0 0 3 3m-3-3-3 3M7 5h7m3 14h-7" stroke-width="1.9"/>'
    };
    return `<svg viewBox="0 0 24 24" width="25" height="25" aria-hidden="true" style="display:block;fill:none;stroke:currentColor;stroke-linejoin:round;stroke-linecap:round;stroke-width:2">${paths[type]||''}</svg>`;
  }
  const showNotice=msg=>{
    if(!isMusic())return;
    const root=frame.querySelector('.am-root,.am-player');
    if(!root)return;
    root.querySelector('.am-toast')?.remove();
    const n=document.createElement('div');n.className='am-toast';n.textContent=msg;root.appendChild(n);
    setTimeout(()=>{if(n.isConnected)n.remove()},2600);
  };
  function refresh(){
    if(!isMusic())return;
    const offset=frame.querySelector('.am-scroll')?.scrollTop||0;
    render();
    const sc=frame.querySelector('.am-scroll');if(sc)sc.scrollTop=offset;
    syncProgress();
  }
  async function reload(force=false){
    if(loading||(!force&&loaded&&Date.now()-loadTime<300000))return;
    loading=true;error='';if(isMusic())refresh();
    const found=[],seen=new Set(), metadata={};
    // Upload format: Artist - Song.mp3 (also supports Artist - Song.m4a).
    const filenameInfo=name=>{
      const stem=basename(name);
      const match=stem.match(/^(.+?)\s+-\s+(.+)$/);
      return match?{artist:match[1].trim(),title:match[2].trim()}:{artist:'아티스트 정보 없음',title:stem};
    };
    const addTrack=(name,extra={},src='',size=0)=>{
      if(typeof name!=='string'||!mediaType.test(name))return;
      const canonical=name.normalize('NFC');
      if(seen.has(canonical))return;
      seen.add(canonical);
      found.push({
        id:'official:'+canonical,name,
        title:extra.title||filenameInfo(name).title,artist:extra.artist||filenameInfo(name).artist,
        cover:typeof extra.cover==='string'?extra.cover:'',
        src:src||new URL('./music/'+encodeURIComponent(name),document.baseURI).href,size
      });
    };
    try{
      // The deployed music manifest is authoritative. No GitHub API is needed to see these tracks.
      // Filename must retain its exact uploaded Unicode form (important for Hangul).
      try{
        const manifestUrl=new URL('./music/manifest.json',document.baseURI);
        if(force)manifestUrl.searchParams.set('ts',String(Date.now()));
        const m=await fetch(manifestUrl.href,{cache:force?'no-store':'default'});
        if(m.ok){
          const data=await m.json();
          const rows=Array.isArray(data)?data:data.tracks;
          if(Array.isArray(rows)){
            for(const entry of rows){
              if(!entry||typeof entry.file!=='string')continue;
              metadata[entry.file.normalize('NFC')]=entry;
              addTrack(entry.file,entry,new URL('./music/'+encodeURIComponent(entry.file),document.baseURI).href);
            }
          }
        }
      }catch(err){ /* Live GitHub discovery remains optional */ }
      // Discover newly added GitHub music, without removing playable files bundled in Cloudflare.
      try{
        const response=await fetch(api,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
        if(!response.ok)throw new Error('GitHub API status '+response.status);
        const json=await response.json();
        if(!Array.isArray(json))throw new Error('GitHub API did not return a directory');
        for(const file of json){
          if(file.type!=='file'||!mediaType.test(file.name))continue;
          const extra=metadata[file.name.normalize('NFC')]||{};
          const fileUrl=typeof file.download_url==='string'&&file.download_url.startsWith('https:')
            ?file.download_url:raw+encodeURIComponent(file.name);
          addTrack(file.name,extra,fileUrl,file.size||0);
        }
      }catch(err){
        if(!found.length)throw new Error('음악 목록을 불러올 수 없습니다. 새로고침해 주세요.');
      }
      // Auto-match cover images by exact audio basename in the same music folder.
      try{
        const response=await fetch(api,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
        if(response.ok){
          const files=await response.json();
          if(Array.isArray(files)){
            const covers=new Map(files.filter(x=>x.type==='file'&&/\.(jpe?g|png|webp)$/i.test(x.name)).map(x=>[x.name.replace(/\.[^.]+$/,'').normalize('NFC'),x.download_url]));
            for(const t of found)if(!t.cover){const url=covers.get(t.name.replace(/\.[^.]+$/,'').normalize('NFC'));if(url)t.cover=url}
          }
        }
      }catch{}
      built=found;
      loaded=true;loadTime=Date.now();
    }catch(err){error=String(err?.message||'음악 목록을 불러올 수 없습니다');loaded=true;loadTime=Date.now()}
    finally{loading=false;if(isMusic())refresh()}
  }
  async function initLocal(){
    try{
      const data=await allLocal();
      locals=data.map(x=>({...x,src:'',blob:x.blob}));if(isMusic())refresh();
    }catch{}
  }
  function playerSrc(t){
    if(t.source==='local'){
      const obj=t.blob;
      return obj?URL.createObjectURL(obj):'';
    }
    return t.src;
  }
  function selectSong(id,shouldPlay=true){
    const t=trById(id);if(!t){showNotice('노래를 찾을 수 없습니다.');return}
    if(currentId!==id||!audio.src){
      if(currentSrc.startsWith('blob:'))URL.revokeObjectURL(currentSrc);
      currentId=id;currentSrc=playerSrc(t);
      if(!currentSrc){showNotice('오디오 파일을 읽을 수 없습니다.');return}
      audio.src=currentSrc;audio.load();
    }
    if(shouldPlay) {
      audio.play().catch(()=>showNotice('재생할 수 없습니다. 오디오 파일 또는 링크를 확인해 주세요.'));
    }
    refresh();
  }
  function togglePlay(){
    if(!currentId){if(tracks().length)selectSong(tracks()[0].id);else showNotice('음악을 먼저 추가해 주세요.');return}
    if(audio.paused) audio.play().catch(()=>showNotice('오디오를 재생할 수 없습니다.'));
    else audio.pause();
    updatePlayButtons();
  }
  function nextSong(delta=1){
    const list=tracks();if(!list.length)return;
    let i=list.findIndex(x=>x.id===currentId);
    if(shuffle&&list.length>1){
      const others=list.filter(x=>x.id!==currentId);
      return selectSong(others[Math.floor(Math.random()*others.length)].id);
    }
    const j=(i+delta+list.length)%list.length;
    selectSong(list[j].id);
  }
  function updatePlayButtons(){
    if(!isMusic())return;
    for(const x of frame.querySelectorAll('[data-am-icon="play"]'))x.innerHTML=icon(audio.paused?'play':'pause');
    frame.querySelectorAll('[data-am-status]').forEach(x=>{x.textContent=audio.paused?'재생':'일시 정지'});
  }
  function syncProgress(){
    if(!isMusic())return;
    const dur=Number.isFinite(audio.duration)?audio.duration:0;
    const pos=Number.isFinite(audio.currentTime)?audio.currentTime:0;
    const pct=dur>0?Math.max(0,Math.min(100,100*pos/dur)):0;
    frame.querySelectorAll('[data-am-progress]').forEach(n=>n.style.width=pct+'%');
    const seek=frame.querySelector('#am26-seek');
    if(seek&&document.activeElement!==seek){seek.value=String(pct);seek.style.setProperty('--pct',pct+'%')}
    const left=frame.querySelector('#am26-current');if(left)left.textContent=fmt(pos);
    const right=frame.querySelector('#am26-total');if(right)right.textContent='-'+fmt(Math.max(0,dur-pos));
    updatePlayButtons();
  }
  audio.addEventListener('timeupdate',syncProgress);
  audio.addEventListener('loadedmetadata',syncProgress);
  audio.addEventListener('play',syncProgress);
  audio.addEventListener('pause',syncProgress);
  audio.addEventListener('ended',()=>{if(repeat){audio.currentTime=0;audio.play().catch(()=>{})}else nextSong(1)});
  audio.addEventListener('error',()=>{if(currentId)showNotice('오디오 파일을 열 수 없습니다. 링크를 확인해 주세요.')});
  function row(t){
    return `<div class="am-row"><button class="am-row-main" data-am="song" data-id="${e(t.id)}" aria-label="${e(t.title)} 재생">${art(t)}<span class="am-titleinfo"><strong>${e(t.title)}</strong><small>${e(info(t))}</small></span></button><button class="am-row-more" data-am="menu" data-id="${e(t.id)}" aria-label="곡 옵션">•••</button></div>`;
  }
  function list(filter='all'){
    let found=tracks();
    if(filter==='official')found=found.filter(x=>x.source==='official');
    if(filter==='local')found=found.filter(x=>x.source!=='official');
    if(filter==='favorites')found=found.filter(x=>fav.has(x.id));
    if(query.trim()&&tab==='search')found=found.filter(x=>(x.title+' '+x.artist).toLowerCase().includes(query.trim().toLowerCase()));
    return found;
  }
  function mini(){
    const t=current();if(!t)return '';
    const dur=Number.isFinite(audio.duration)?audio.duration:0;
    const pct=dur>0?audio.currentTime/dur*100:0;
    return `<div class="am-mini"><button class="am-mini-song" data-am="player">${art(t)}<strong>${e(t.title)}</strong></button><button class="am-mini-btn" data-am="toggle" data-am-icon="play" aria-label="재생 또는 일시 정지">${icon(audio.paused?'play':'pause')}</button><button class="am-mini-btn" data-am="next" aria-label="다음 곡">${icon('next')}</button><div class="am-mini-line" data-am-progress style="width:${pct}%"></div></div>`;
  }
  function bottom(){
    const tabs=[['home','⌂','홈'],['new','♫','새로운 음악'],['radio','◉','라디오'],['library','▤','보관함'],['search','⌕','검색']];
    return `<div class="am-bottom">${mini()}<div class="am-tabs">${tabs.map(([k,i,label])=>`<button class="am-tab ${tab===k?'selected':''}" data-am="tab" data-tab="${k}"><i>${i}</i><span>${label}</span></button>`).join('')}</div></div>`;
  }
  function head(title){return `<div class="am-head"><h1>${title}</h1><button class="am-add" data-am="sheet" aria-label="음악 추가">＋</button></div>`}
  function noSongs(){
    return `<div class="am-empty"><i>♫</i><strong>${error?'목록을 불러올 수 없음':loading?'음악 불러오는 중…':'아직 음악이 없습니다'}</strong>${error?e(error):'기기의 음악 파일 또는 오디오 URL을 추가할 수 있습니다.'}<div style="margin-top:15px"><button class="am-smallbutton" data-am="sheet">＋ 음악 추가</button> <button class="am-smallbutton" data-am="reload">새로고침</button></div></div>`
  }
  function content(){
    const n=tracks(),count=n.length;
    if(tab==='search'){
      return head('검색')+`<div class="am-search">⌕ <input id="am26-search" placeholder="보관함 검색" autocomplete="off" value="${e(query)}"></div><div class="am-sectionname"><b>검색 결과</b><span>${list().length}곡</span></div><div class="am-list" id="am26-list">${list().map(row).join('')||noSongs()}</div>`;
    }
    if(tab==='radio'){
      return head('라디오')+`<div class="am-hero"><div class="am-hero-art">♫</div><div><strong>나만의 스테이션</strong><p>보관함에 있는 음악을 셔플로 재생합니다.</p><div class="am-hero-actions"><button class="am-smallbutton" data-am="station">셔플 재생</button></div></div></div><div class="am-sectionname"><b>스테이션의 음악</b><span>${count}곡</span></div><div class="am-list">${n.map(row).join('')||noSongs()}</div>`;
    }
    if(tab==='new'){
      const recent=[...n].reverse();
      return head('새로운 음악')+`<div class="am-hero"><div class="am-hero-art">♪</div><div><strong>최근 추가된 음악</strong><p>새로운 노래를 추가해 나만의 보관함을 완성해 보세요.</p><div class="am-hero-actions"><button data-am="sheet" class="am-smallbutton">음악 추가</button></div></div></div><div class="am-sectionname"><b>최근 추가됨</b><span>${count}곡</span></div><div class="am-list">${recent.map(row).join('')||noSongs()}</div>`;
    }
    if(tab==='home'){
      return head('홈')+`<div class="am-hero"><div class="am-hero-art">♫</div><div><strong>내 음악으로 채우는 하루</strong><p>좋아하는 노래를 언제든 재생하세요.</p><div class="am-hero-actions"><button class="am-smallbutton" data-am="station">셔플 재생</button><button class="am-smallbutton" data-am="sheet">추가</button></div></div></div><div class="am-sectionname"><b>내가 좋아하는 노래</b><span>${list('favorites').length}곡</span></div><div class="am-list">${list('favorites').map(row).join('')||'<div class="am-empty">아직 좋아요 표시한 노래가 없습니다.</div>'}</div><div class="am-sectionname"><b>보관함에서 듣기</b><span>${count}곡</span></div><div class="am-list">${n.map(row).join('')||noSongs()}</div>`;
    }
    const nFiltered=sort==='official'?list('official'):sort==='local'?list('local'):sort==='favorites'?list('favorites'):list();
    const chips=[['recent','모든 노래'],['official','기본 음악'],['local','내가 추가함'],['favorites','즐겨찾기']];
    return head('보관함')+`<div class="am-chips">${chips.map(([key,label])=>`<button class="am-chip ${sort===key?'on':''}" data-am="filter" data-filter="${key}">${label}</button>`).join('')}</div><div class="am-sectionname"><b>노래</b><span>${nFiltered.length}곡 <button data-am="reload" aria-label="새로고침" style="color:#ee325f;font-size:16px;margin-left:5px">↻</button></span></div><div class="am-list">${nFiltered.map(row).join('')||noSongs()}</div>`;
  }
  function uploadSheet(){
    if(!sheet)return '';
    const isMenu=sheet.startsWith('options:');
    const t=isMenu?trById(sheet.slice(8)):null;
    if(isMenu&&t) return `<div class="am-modalshade" data-am="dismiss"><div class="am-sheet" data-am-surface><div class="am-handle"></div><h2>${e(t.title)}</h2><p>${e(info(t))}</p><button class="am-primary" data-am="favorite" data-id="${e(t.id)}">${fav.has(t.id)?'♥ 즐겨찾기 해제':'♡ 즐겨찾기에 추가'}</button>${t.source!=='official'?`<button class="am-secondary" data-am="remove" data-id="${e(t.id)}">보관함에서 제거</button>`:''}<button class="am-secondary" data-am="dismiss">취소</button></div></div>`;
    return `<div class="am-modalshade" data-am="dismiss"><div class="am-sheet" data-am-surface><div class="am-handle"></div><h2>보관함에 음악 추가</h2><p>내 기기에서 파일을 선택하거나 직접 재생할 수 있는 오디오 URL을 등록하세요.</p><input type="file" id="am26-file" multiple accept="audio/*,.mp3,.m4a,.aac,.wav,.flac,.ogg" style="display:none"><button class="am-select" data-am="pick">↑ 파일 업로드</button><form id="am26-urlform"><label for="am26-url">오디오 링크 (HTTPS)</label><input type="url" id="am26-url" required placeholder="https://example.com/song.mp3"><label for="am26-title">곡 제목 (선택)</label><input type="text" id="am26-title" maxlength="90" placeholder="노래 제목"><label for="am26-artist">아티스트 (선택)</label><input type="text" id="am26-artist" maxlength="90" placeholder="아티스트 이름"><button class="am-primary" type="submit">링크로 추가</button></form><div class="am-note">파일은 이 기기의 브라우저에만 저장됩니다. 다른 사용자에게 공개되지 않습니다. YouTube·Spotify 페이지 주소는 직접 재생할 수 없습니다. 스트리밍 링크는 서버에서 오디오 재생을 허용해야 합니다.</div><button class="am-secondary" data-am="dismiss">닫기</button></div></div>`;
  }
  function playingPage(){
    const t=current();
    if(!t){view='list';return listPage()}
    const dur=Number.isFinite(audio.duration)?audio.duration:0,pct=dur>0?audio.currentTime/dur*100:0;
    return `<div class="am-player"><div class="am-playerbar"><button data-am="back" aria-label="보관함으로">${icon('down')}</button><span>재생 중</span><button data-am="menu" data-id="${e(t.id)}" aria-label="더 보기">${icon('more')}</button></div><div class="am-playing-art">${imgCover(t)||'♫'}</div><div class="am-player-meta"><div class="am-titleinfo"><strong>${e(t.title)}</strong><small>${e(t.artist)}</small></div><button class="am-heart" data-am="favorite" data-id="${e(t.id)}" aria-label="즐겨찾기">${icon(fav.has(t.id)?'heartFill':'heart')}</button></div><div><input type="range" class="am-range" min="0" max="100" step=".1" id="am26-seek" value="${pct}" style="--pct:${pct}%" aria-label="재생 위치"><div class="am-timeline"><span id="am26-current">${fmt(audio.currentTime)}</span><span id="am26-total">-${fmt(Math.max(0,dur-audio.currentTime))}</span></div></div><div class="am-bigcontrols"><button data-am="previous" aria-label="이전 곡">${icon('prev')}</button><button data-am="toggle" class="am-central" aria-label="재생 또는 일시 정지" data-am-icon="play">${icon(audio.paused?'play':'pause')}</button><button data-am="next" aria-label="다음 곡">${icon('next')}</button></div><div class="am-playerfeet"><button data-am="shuffle" aria-label="셔플" data-active="${shuffle}">${icon('shuffle')}</button><button data-am="favorite" data-id="${e(t.id)}" aria-label="즐겨찾기">${icon(fav.has(t.id)?'heartFill':'heart')}</button><button data-am="repeat" aria-label="반복 재생" data-active="${repeat}">${icon('repeat')}</button></div><div class="am-player-note">${e(origin(t))}</div>${uploadSheet()}</div>`;
  }
  function listPage(){return `<div class="am-root"><div class="am-scroll">${content()}</div>${bottom()}${uploadSheet()}</div>`}
  const oldMusicPage=musicPage;
  musicPage=function(){return view==='player'?playingPage():listPage()};
  const oldRender=render;
  render=function(...args){
    oldRender.apply(this,args);
    if(isMusic()){
      appEl.classList.toggle('am-now-playing',view==='player');
      // Library pages use a light system status bar; Now Playing uses white text.
      document.querySelector('#status')?.classList.toggle('dark',view!=='player');
      document.querySelector('#gesture')?.classList.toggle('ink',view!=='player');
      frame.style.overflow='hidden';
      if(!loaded&&!loading)reload();
      syncProgress();
    }else{
      appEl.classList.remove('am-now-playing');
    }
  };
  const oldBack=back;
  back=function(...args){
    if(isMusic()&&sheet){sheet='';refresh();return}
    if(isMusic()&&view==='player'){view='list';refresh();return}
    return oldBack.apply(this,args);
  };
  frame.addEventListener('click',event=>{
    if(!isMusic())return;
    const btn=event.target.closest('[data-am]');
    if(!btn)return;
    const command=btn.dataset.am,id=btn.dataset.id;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    if(command==='surface')return;
    if(command==='dismiss'){if(event.target.closest('[data-am-surface]')&&btn.classList.contains('am-modalshade'))return;sheet='';refresh();return}
    if(command==='tab'){tab=btn.dataset.tab||'library';view='list';query='';refresh();return}
    if(command==='filter'){sort=btn.dataset.filter||'recent';refresh();return}
    if(command==='sheet'){sheet='add';refresh();return}
    if(command==='pick'){frame.querySelector('#am26-file')?.click();return}
    if(command==='menu'){sheet='options:'+id;refresh();return}
    if(command==='song'){selectSong(id);return}
    if(command==='player'){view='player';refresh();return}
    if(command==='back'){view='list';refresh();return}
    if(command==='toggle'){togglePlay();return}
    if(command==='next'){nextSong(1);return}
    if(command==='previous'){if(audio.currentTime>4)audio.currentTime=0;else nextSong(-1);return}
    if(command==='shuffle'){shuffle=!shuffle;refresh();return}
    if(command==='repeat'){repeat=!repeat;refresh();return}
    if(command==='favorite'){fav.has(id)?fav.delete(id):fav.add(id);save('am26_favorites',[...fav]);sheet='';refresh();return}
    if(command==='reload'){reload(true);return}
    if(command==='station'){shuffle=true;const ls=tracks();if(ls.length)selectSong(ls[Math.floor(Math.random()*ls.length)].id);else showNotice('먼저 음악을 추가해 주세요.');return}
    if(command==='remove'){removeSong(id);return}
  },true);
  frame.addEventListener('change',async event=>{
    if(!isMusic()||event.target.id!=='am26-file')return;
    const files=Array.from(event.target.files||[]);
    if(!files.length)return;
    let success=0,temporary=0;
    for(const file of files){
      if(file.size>100*1024*1024){showNotice('100MB 이하의 파일만 추가할 수 있습니다.');continue}
      if(!file.type.startsWith('audio/')&&!mediaType.test(file.name)){showNotice('지원되는 오디오 형식이 아닙니다.');continue}
      const rec={id:'local:'+stamp(),name:file.name,title:basename(file.name),artist:'내 음악',blob:file,size:file.size,created:Date.now()};
      try{await putLocal(rec);locals.unshift(rec);success++}
      catch{ephemeral.unshift(rec);temporary++}
    }
    sheet='';refresh();
    if(success||temporary)showNotice(`${success+temporary}곡 추가됨${temporary?' · 일부는 새로고침하면 사라질 수 있어요':''}`);
  },true);
  frame.addEventListener('submit',event=>{
    if(!isMusic()||event.target.id!=='am26-urlform')return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    const url=sanitizedUrl(frame.querySelector('#am26-url')?.value);
    if(!url){showNotice('유효한 HTTPS 오디오 주소를 입력해 주세요.');return}
    const title=frame.querySelector('#am26-title')?.value.trim()||basename(decodeURIComponent(new URL(url).pathname.split('/').pop()||'링크 음악'));
    const artist=frame.querySelector('#am26-artist')?.value.trim()||'내 링크';
    links.unshift({id:'url:'+stamp(),name:title,title,artist,src:url,created:Date.now()});
    save('am26_links',links);sheet='';refresh();showNotice('보관함에 링크를 추가했습니다.');
  },true);
  frame.addEventListener('input',event=>{
    if(!isMusic())return;
    if(event.target.id==='am26-search'){
      query=event.target.value;
      const target=frame.querySelector('#am26-list');
      if(target)target.innerHTML=list().map(row).join('')||noSongs();
    }
    if(event.target.id==='am26-seek'){
      const pct=Number(event.target.value)||0;
      event.target.style.setProperty('--pct',pct+'%');
      if(Number.isFinite(audio.duration))audio.currentTime=audio.duration*pct/100;
    }
  },true);
  async function removeSong(id){
    const t=trById(id);if(!t||t.source==='official')return;
    if(t.source==='url'){links=links.filter(x=>x.id!==id);save('am26_links',links)}
    else {
      locals=locals.filter(x=>x.id!==id);ephemeral=ephemeral.filter(x=>x.id!==id);
      try{await deleteLocal(id)}catch{}
    }
    if(currentId===id){audio.pause();audio.removeAttribute('src');audio.load();if(currentSrc.startsWith('blob:'))URL.revokeObjectURL(currentSrc);currentSrc='';currentId=''}
    fav.delete(id);save('am26_favorites',[...fav]);sheet='';refresh();showNotice('보관함에서 제거했습니다.');
  }
  // Photo, phone and other app states are not modified.
  initLocal();
  window.__AM26_TEST__={get count(){return tracks().length},get builtIn(){return built.length},get local(){return locals.length+ephemeral.length},refresh:()=>reload(true),get currentId(){return currentId}};
})();