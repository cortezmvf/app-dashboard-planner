const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function onRequestPost(context) {
  const { request, env } = context

  const apiKey = env.GROQ_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await request.text()

  const groqRes = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body,
  })

  return new Response(groqRes.body, {
    status: groqRes.status,
    headers: {
      'Content-Type': groqRes.headers.get('Content-Type') ?? 'application/json',
    },
  })
}
