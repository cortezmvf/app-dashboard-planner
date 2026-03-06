export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

const CHAT_ENDPOINT = '/api/chat'

/**
 * Stream a chat completion. Calls onChunk with each text delta.
 * Returns the full accumulated response string.
 */
export async function streamChat(
  messages: ChatMessage[],
  onChunk: (delta: string, accumulated: string) => void,
  model = 'llama-3.3-70b-versatile'
): Promise<string> {
  const response = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true }),
  })

  if (!response.ok || !response.body) {
    const text = await response.text()
    throw new Error(`Chat API error: ${response.status} ${text}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let full = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') continue
      try {
        const parsed = JSON.parse(data)
        const delta = parsed.choices?.[0]?.delta?.content ?? ''
        if (delta) {
          full += delta
          onChunk(delta, full)
        }
      } catch {
        // skip malformed SSE chunks
      }
    }
  }

  return full
}

/**
 * Request a JSON object response (no streaming).
 */
export async function chatJSON<T>(
  messages: ChatMessage[],
  model = 'llama-3.3-70b-versatile'
): Promise<T> {
  const response = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, response_format: { type: 'json_object' } }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Chat API error: ${response.status} ${text}`)
  }

  const data = await response.json() as { choices: Array<{ message: { content: string } }> }
  const content = data.choices[0]?.message?.content ?? '{}'
  return JSON.parse(content) as T
}
