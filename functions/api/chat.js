// Production counterpart of the dev-only proxy in vite.config.js.
// Runs as a Cloudflare Pages Function on /api/chat so the DeepSeek key
// stays server-side (stored with `wrangler pages secret put`).
// Caps input length so a visitor cannot drain the API balance.

const MAX_TOTAL_CHARS = 6000
const MAX_MESSAGE_CHARS = 1500
const MAX_TURNS = 11

export async function onRequestPost(context) {
  const { request, env } = context
  const key = env.DEEPSEEK_API_KEY
  if (!key) {
    return json(503, { error: 'no-key' })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json(400, { error: 'bad-json' })
  }

  const messages = Array.isArray(body.messages) ? body.messages : []
  if (!messages.length) {
    return json(400, { error: 'empty-messages' })
  }
  if (messages.length > MAX_TURNS) {
    messages.splice(0, messages.length - MAX_TURNS)
  }
  let total = 0
  for (const m of messages) {
    if (typeof m.content !== 'string') return json(400, { error: 'bad-message' })
    if (m.content.length > MAX_MESSAGE_CHARS) m.content = m.content.slice(0, MAX_MESSAGE_CHARS)
    total += m.content.length
  }
  if (total > MAX_TOTAL_CHARS) {
    return json(413, { error: 'too-long' })
  }

  try {
    const r = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: body.model || 'deepseek-chat',
        messages,
        temperature: body.temperature ?? 0.8,
        top_p: body.top_p ?? 0.95,
        max_tokens: 700,
        stream: false,
        ...(body.presence_penalty != null ? { presence_penalty: body.presence_penalty } : {}),
        ...(body.frequency_penalty != null ? { frequency_penalty: body.frequency_penalty } : {}),
      }),
    })
    if (!r.ok) {
      return json(502, { error: 'upstream', detail: (await r.text()).slice(0, 300) })
    }
    const data = await r.json()
    return json(200, { text: data.choices?.[0]?.message?.content || '' })
  } catch (e) {
    return json(500, { error: 'proxy-fail', detail: String(e).slice(0, 300) })
  }
}

function json(status, payload) {
  return Response.json(payload, { status })
}

export async function onRequestGet() {
  return json(405, { error: 'method-not-allowed' })
}
