import {
  type ChatErrorCode,
  type ChatMessageInput,
  isProviderId,
  ProviderError,
  streamChatCompletion,
} from '@/lib/ai/providers'
import { AI_SYSTEM_PROMPT } from '@/lib/config'
import { SERVER_API_KEYS } from '@/lib/config.server'

export const maxDuration = 60

const MAX_MESSAGES = 30
const MAX_CONTENT_LENGTH = 8000
const MAX_KEY_LENGTH = 300

function errorResponse(code: ChatErrorCode, status: number) {
  return Response.json({ error: code }, { status })
}

function parseMessages(value: unknown): ChatMessageInput[] | null {
  if (!Array.isArray(value) || value.length === 0) return null
  const messages: ChatMessageInput[] = []
  for (const item of value.slice(-MAX_MESSAGES)) {
    const m = item as { role?: unknown; content?: unknown }
    if ((m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') return null
    const content = m.content.trim().slice(0, MAX_CONTENT_LENGTH)
    if (content) messages.push({ role: m.role, content })
  }
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') return null
  // Anthropic требует, чтобы диалог начинался с сообщения пользователя
  while (messages.length && messages[0].role !== 'user') messages.shift()
  return messages
}

export async function POST(req: Request) {
  let body: { provider?: unknown; messages?: unknown; apiKey?: unknown }
  try {
    body = await req.json()
  } catch {
    return errorResponse('bad_request', 400)
  }

  if (!isProviderId(body.provider)) return errorResponse('bad_request', 400)
  const messages = parseMessages(body.messages)
  if (!messages) return errorResponse('bad_request', 400)

  // Ключ из окружения сервера имеет приоритет; ключ из браузера — запасной вариант.
  const clientKey =
    typeof body.apiKey === 'string' && body.apiKey.length <= MAX_KEY_LENGTH ? body.apiKey.trim() : ''
  const apiKey = SERVER_API_KEYS[body.provider] || clientKey
  if (!apiKey) return errorResponse('no_key', 400)

  try {
    const stream = await streamChatCompletion({
      provider: body.provider,
      apiKey,
      system: AI_SYSTEM_PROMPT,
      messages,
      signal: req.signal,
    })
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    })
  } catch (error) {
    if (error instanceof ProviderError) return errorResponse(error.code, error.status)
    return errorResponse('unknown', 500)
  }
}
