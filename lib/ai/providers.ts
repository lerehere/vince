export type ProviderId = 'groq' | 'claude'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessageInput {
  role: ChatRole
  content: string
}

export type ChatErrorCode =
  | 'no_key'
  | 'invalid_key'
  | 'rate_limit'
  | 'insufficient_balance'
  | 'network'
  | 'bad_request'
  | 'unknown'

export interface ProviderInfo {
  id: ProviderId
  label: string
  model: string
  keyPlaceholder: string
}

export const PROVIDERS: Record<ProviderId, ProviderInfo> = {
  groq: {
    id: 'groq',
    label: 'Groq',
    model: 'llama-3.3-70b-versatile',
    keyPlaceholder: 'gsk_…',
  },
  claude: {
    id: 'claude',
    label: 'Claude',
    // claude-3-5-sonnet-latest снят с поддержки Anthropic — используем актуальную модель Sonnet.
    model: 'claude-sonnet-4-5',
    keyPlaceholder: 'sk-ant-…',
  },
}

export const PROVIDER_IDS = Object.keys(PROVIDERS) as ProviderId[]

export const DEFAULT_PROVIDER: ProviderId = 'groq'

export function isProviderId(value: unknown): value is ProviderId {
  return typeof value === 'string' && value in PROVIDERS
}

export class ProviderError extends Error {
  constructor(
    public code: ChatErrorCode,
    public status: number,
  ) {
    super(code)
  }
}

interface ProviderAdapter {
  buildRequest(args: { apiKey: string; model: string; system: string; messages: ChatMessageInput[] }): {
    url: string
    init: RequestInit
  }
  extractDelta(event: unknown): string | null
}

const adapters: Record<ProviderId, ProviderAdapter> = {
  // DeepSeek — OpenAI-совместимый API
  groq: {
    buildRequest: ({ apiKey, model, system, messages }) => ({
      url: 'https://api.groq.com/openai/v1/chat/completions',
      init: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          stream: true,
          messages: [{ role: 'system', content: system }, ...messages],
        }),
      },
    }),
    extractDelta: (event) => {
      const e = event as { choices?: { delta?: { content?: string } }[] }
      return e.choices?.[0]?.delta?.content ?? null
    },
  },
  claude: {
    buildRequest: ({ apiKey, model, system, messages }) => ({
      url: 'https://api.anthropic.com/v1/messages',
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ model, system, messages, max_tokens: 2048, stream: true }),
      },
    }),
    extractDelta: (event) => {
      const e = event as { type?: string; delta?: { type?: string; text?: string } }
      return e.type === 'content_block_delta' && e.delta?.type === 'text_delta' ? (e.delta.text ?? null) : null
    },
  },
}

function errorCodeFromStatus(status: number): ChatErrorCode {
  if (status === 401 || status === 403) return 'invalid_key'
  if (status === 402) return 'insufficient_balance'
  if (status === 429 || status === 529) return 'rate_limit'
  if (status === 400 || status === 404 || status === 422) return 'bad_request'
  return 'unknown'
}

function sseToTextStream(body: ReadableStream<Uint8Array>, extract: (event: unknown) => string | null) {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let buffer = ''

  const handleLine = (line: string, controller: TransformStreamDefaultController<Uint8Array>) => {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:')) return
    const data = trimmed.slice(5).trim()
    if (!data || data === '[DONE]') return
    try {
      const text = extract(JSON.parse(data))
      if (text) controller.enqueue(encoder.encode(text))
    } catch {
      // Пропускаем неполные или служебные события
    }
  }

  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) handleLine(line, controller)
      },
      flush(controller) {
        if (buffer) handleLine(buffer, controller)
      },
    }),
  )
}

export async function streamChatCompletion({
  provider,
  apiKey,
  system,
  messages,
  signal,
}: {
  provider: ProviderId
  apiKey: string
  system: string
  messages: ChatMessageInput[]
  signal?: AbortSignal
}): Promise<ReadableStream<Uint8Array>> {
  const adapter = adapters[provider]
  const { url, init } = adapter.buildRequest({ apiKey, model: PROVIDERS[provider].model, system, messages })

  let upstream: Response
  try {
    upstream = await fetch(url, { ...init, signal })
  } catch {
    throw new ProviderError('network', 502)
  }

  if (!upstream.ok || !upstream.body) {
    const status = upstream.status >= 400 && upstream.status < 500 ? upstream.status : 502
    throw new ProviderError(errorCodeFromStatus(upstream.status), status)
  }
if (!upstream.ok || !upstream.body) {
  console.error('Upstream error:', upstream.status, await upstream.text())
  const status = upstream.status >= 400 && upstream.status < 500 ? upstream.status : 502
  throw new ProviderError(errorCodeFromStatus(upstream.status), status)
}
  return sseToTextStream(upstream.body, adapter.extractDelta)
}
