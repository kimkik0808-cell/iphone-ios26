const ALLOWED_ORIGINS = new Set([
  'https://nuyheaj.pages.dev',
  'https://kimkik0808-cell.github.io'
]);

const PERSONAS = {
  sw: '너는 선우 역할의 가상 채팅 캐릭터다. 재현과 친한 같은 그룹 멤버처럼 자연스러운 한국어 반말로 답한다. 장난스럽고 반응이 빠르지만 매번 형이라고 부르지는 않는다.',
  nuna: '너는 재현의 친누나 역할의 가상 채팅 캐릭터다. 가족끼리 쓰는 자연스러운 한국어 반말로 답한다. 현실적이고 편안하며 필요할 때 잔소리를 조금 한다.',
  jy: '너는 주연 역할의 가상 채팅 캐릭터다. 재현과 친한 같은 그룹 멤버처럼 차분하고 자연스러운 한국어 반말로 답한다. 짧고 담백하지만 차갑지는 않다.'
};

function json(data, status = 200, origin = '') {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'vary': 'Origin'
  };
  if (ALLOWED_ORIGINS.has(origin)) headers['access-control-allow-origin'] = origin;
  return new Response(JSON.stringify(data), { status, headers });
}

export async function onRequestGet({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  // Safe diagnostic: never returns a token or calls Gemini.
  return json({
    service: 'kkt-gemini',
    version: 'gemini-stable-v2',
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
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400, origin);
  }

  const chatId = String(body?.chatId || '');
  const message = String(body?.message || '').trim().slice(0, 300);
  if (!PERSONAS[chatId] || !message) return json({ error: 'invalid_request' }, 400, origin);

  const history = Array.isArray(body?.history) ? body.history.slice(-12) : [];
  const contents = history
    .filter(item => item && (item.role === 'user' || item.role === 'model') && typeof item.text === 'string')
    .map(item => ({
      role: item.role,
      parts: [{ text: item.text.slice(0, 300) }]
    }));
  contents.push({ role: 'user', parts: [{ text: message }] });

  const instruction = PERSONAS[chatId] +
    ' 이것은 실제 인물을 사칭하는 서비스가 아니라 팬메이드 가상 휴대폰 속 허구 대화다. ' +
    '상대가 중국어로 말하면 자연스러운 중국어 또는 중한 혼용으로 답할 수 있다. ' +
    '질문의 핵심에 직접 반응하고 직전 대화 맥락을 이어라. 한 번에 1~2개의 짧은 메시지만 작성하고 설명문 인용부호 이모지 해시태그는 쓰지 마라.';

  // Prefer stable models for short KKT messages; never expose the API key to browsers.
  const models = ['gemini-3.5-flash-lite', 'gemini-3.6-flash'];
  let lastFailure = 'model_unavailable';
  let lastStatus = 503;

  for (const [modelIndex, model] of models.entries()) {
    const payload = JSON.stringify({
      systemInstruction: { parts: [{ text: instruction }] },
      contents,
      generationConfig: {
        maxOutputTokens: 512,
        thinkingConfig: { thinkingLevel: 'minimal' }
      }
    });
    // At most 2 attempts on the low-latency model and 1 on fallback.
    const tries = modelIndex === 0 ? 2 : 1;
    for (let attempt = 0; attempt < tries; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), modelIndex === 0 ? 9000 : 11000);
      let response;
      try {
        response = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent',
          {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-goog-api-key': env.GEMINI_API_KEY
            },
            body: payload,
            signal: controller.signal
          }
        );
      } catch (error) {
        lastFailure = controller.signal.aborted ? 'upstream_timeout' : 'upstream_network';
        lastStatus = 503;
        console.warn('Gemini request failed', model, lastFailure);
        if (attempt + 1 < tries) {
          await new Promise(resolve => setTimeout(resolve, 600));
          continue;
        }
        break;
      } finally {
        clearTimeout(timeout);
      }

      lastStatus = response.status;
      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        const candidate = result?.candidates?.[0];
        const reply = (candidate?.content?.parts || [])
          .filter(part => typeof part.text === 'string' && !part.thought)
          .map(part => part.text)
          .join('')
          .trim()
          .replace(/^["“”]|["“”]$/g, '')
          .slice(0, 240);
        if (reply) return json({ reply }, 200, origin);
        lastFailure = (candidate?.finishReason === 'SAFETY' || result?.promptFeedback?.blockReason)
          ? 'content_blocked' : 'empty_reply';
        console.warn('Gemini no usable text', model, candidate?.finishReason || 'unknown');
        break;
      }

      // Never log API keys, raw prompts, or the user's chat text.
      const detail = await response.text().catch(() => '');
      console.warn('Gemini API status', model, lastStatus, detail.slice(0, 100));
      if (response.status === 401 || response.status === 403) {
        return json({ error: 'key_or_region_error', retryable: false }, 503, origin);
      }
      if (response.status === 429) {
        lastFailure = 'quota_exceeded';
        // Another model could have different limits, but repeated calls to
        // the same model cannot instantly restore an exhausted quota.
        break;
      }
      if (response.status === 400 || response.status === 404) {
        lastFailure = 'model_unavailable';
        break;
      }
      lastFailure = 'model_busy';
      if ((response.status === 408 || response.status >= 500) && attempt + 1 < tries) {
        await new Promise(resolve => setTimeout(resolve, 700));
        continue;
      }
      break;
    }
  }
  const retryable = ['model_busy', 'upstream_timeout', 'upstream_network', 'empty_reply'].includes(lastFailure);
  return json({ error: lastFailure, retryable }, lastFailure === 'quota_exceeded' ? 429 : 503, origin);
}
