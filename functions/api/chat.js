const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'

export async function onRequestPost(context) {
  const { request, env } = context

  const apiKey = env.GEMINI_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await request.text()

  const geminiRes = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body,
  })

  return new Response(geminiRes.body, {
    status: geminiRes.status,
    headers: {
      'Content-Type': geminiRes.headers.get('Content-Type') ?? 'application/json',
    },
  })
}
