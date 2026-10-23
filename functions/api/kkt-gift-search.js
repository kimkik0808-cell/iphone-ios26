const ALLOWED_ORIGINS = new Set([
  'https://nuyheaj.pages.dev',
  'https://kimkik0808-cell.github.io'
]);

const KINDS = new Set(['카페', '디저트', '푸드', '문화', '라이프', '뷰티', '쿠폰', '패션', '디지털']);
const EMOJIS = new Set(['☕', '🥤', '🍵', '🍰', '🍩', '🍪', '🍫', '🍨', '🍗', '🍕', '🍔', '🍱', '🎟️', '🎫', '🎬', '📚', '💐', '🕯️', '🪴', '🧸', '🧴', '💄', '🎁', '🛍️', '🧢', '👕', '🎧', '📱', '⌚']);

function json(data, status = 200, origin = '') {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'vary': 'Origin'
  };
  if (ALLOWED_ORIGINS.has(origin)) headers['access-control-allow-origin'] = origin;
  return new Response(JSON.stringify(data), { status, headers });
}

function cleanItem(item) {
  const ko = String(item?.ko || '').trim().slice(0, 32);
  const zh = String(item?.zh || '').trim().slice(0, 32);
  const price = Math.round(Number(item?.price) / 100) * 100;
  if (!ko || !zh || !Number.isFinite(price) || price < 1000 || price > 300000) return null;
  return {
    ko,
    zh,
    kind: KINDS.has(item?.kind) ? item.kind : '라이프',
    emoji: EMOJIS.has(item?.emoji) ? item.emoji : '🎁',
    price,
    desc: String(item?.desc || '마음을 담아 선물해요.').trim().slice(0, 80),
    descZh: String(item?.descZh || '一份用心挑选的虚拟礼物。').trim().slice(0, 80)
  };
}

function parseItems(text) {
  const source = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  let parsed;
  try {
    parsed = JSON.parse(source);
  } catch {
    const start = source.indexOf('['), end = source.lastIndexOf(']');
    if (start < 0 || end <= start) return [];
    try { parsed = JSON.parse(source.slice(start, end + 1)); } catch { return []; }
  }
  const list = Array.isArray(parsed) ? parsed : parsed?.items;
  return Array.isArray(list) ? list.map(cleanItem).filter(Boolean).slice(0, 8) : [];
}

export async function onRequestGet({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  return json({
    service: 'kkt-gift-search',
    version: 'gift-ai-v1',
    status: env.GEMINI_API_KEY ? 'configured' : 'ai_not_configured'
  }, env.GEMINI_API_KEY ? 200 : 503, origin);
}

export async function onRequestOptions({ request }) {
  const origin = request.headers.get('Origin') || '';
  if (!ALLOWED_ORIGINS.has(origin)) return new Response(null, { status: 403 });
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'access-control-max-age': '86400'
    }
  });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  if (origin && !ALLOWED_ORIGINS.has(origin)) return json({ error: 'origin_not_allowed' }, 403, origin);
  if (!env.GEMINI_API_KEY) return json({ error: 'ai_not_configured' }, 503, origin);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'invalid_json' }, 400, origin); }
  const query = String(body?.query || '').trim().slice(0, 40);
  const language = body?.language === 'zh' ? 'zh' : 'ko';
  if (!query) return json({ error: 'invalid_request' }, 400, origin);

  const instruction = '너는 팬메이드 가상 카카오톡 선물하기 상점의 상품 기획자다. ' +
    '사용자가 짧은 검색어 하나만 입력해도 그 의도에 맞는 서로 다른 가상 선물 상품 6개를 만든다. ' +
    '실제 구매 링크나 실제 재고가 있다고 주장하지 말고 유명 브랜드명은 사용하지 않는다. ' +
    '상품명과 설명은 자연스러운 한국 쇼핑 앱 문체로 작성한다. 중국어 번역도 함께 제공한다. ' +
    'kind는 카페, 디저트, 푸드, 문화, 라이프, 뷰티, 쿠폰, 패션, 디지털 중 하나다. ' +
    'emoji는 상품을 가장 잘 나타내는 이모지 하나다. price는 1000~300000 사이의 현실적인 원화 정수다. ' +
    '오직 {"items":[{"ko":"","zh":"","kind":"","emoji":"","price":0,"desc":"","descZh":""}]} 형식의 JSON만 출력한다.';
  const prompt = (language === 'zh' ? '用户搜索词：' : '사용자 검색어: ') + query;
  const models = ['gemini-3.5-flash-lite', 'gemini-3.6-flash'];
  let failure = 'model_unavailable';

  for (const model of models) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: instruction }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1400, responseMimeType: 'application/json', thinkingConfig: { thinkingLevel: 'minimal' } }
        }),
        signal: controller.signal
      });
      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        const text = (result?.candidates?.[0]?.content?.parts || []).filter(part => typeof part.text === 'string' && !part.thought).map(part => part.text).join('');
        const items = parseItems(text);
        if (items.length) return json({ items }, 200, origin);
        failure = 'empty_results';
        continue;
      }
      if (response.status === 401 || response.status === 403) return json({ error: 'key_or_region_error' }, 503, origin);
      failure = response.status === 429 ? 'quota_exceeded' : 'model_unavailable';
    } catch (error) {
      failure = controller.signal.aborted ? 'upstream_timeout' : 'upstream_network';
    } finally {
      clearTimeout(timeout);
    }
  }
  return json({ error: failure }, failure === 'quota_exceeded' ? 429 : 503, origin);
}
