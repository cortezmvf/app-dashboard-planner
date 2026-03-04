import OpenAI from 'openai'

function getClient(): OpenAI {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY is not set. Add it to .env.local for development or to Cloudflare Pages environment variables for production.')
  }
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
}

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

/**
 * Stream a chat completion. Calls onChunk with each text delta.
 * Returns the full accumulated response string.
 */
export async function streamChat(
  messages: ChatMessage[],
  onChunk: (delta: string, accumulated: string) => void,
  model = 'gpt-4o-mini'
): Promise<string> {
  const client = getClient()
  const stream = await client.chat.completions.create({
    model,
    messages,
    stream: true,
  })

  let full = ''
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? ''
    if (delta) {
      full += delta
      onChunk(delta, full)
    }
  }
  return full
}

/**
 * Request a JSON object response (no streaming — used for the DataViz layout call
 * where we need the full structured output before doing anything with it).
 */
export async function chatJSON<T>(
  messages: ChatMessage[],
  model = 'gpt-4o-mini'
): Promise<T> {
  const client = getClient()
  const response = await client.chat.completions.create({
    model,
    messages,
    response_format: { type: 'json_object' },
  })
  const content = response.choices[0]?.message?.content ?? '{}'
  return JSON.parse(content) as T
}
