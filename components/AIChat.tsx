'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowUp, KeyRound, Square, Trash2, X } from 'lucide-react'
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react'
import {
  type ChatErrorCode,
  DEFAULT_PROVIDER,
  PROVIDER_IDS,
  PROVIDERS,
  type ProviderId,
} from '@/lib/ai/providers'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { AssistantAvatar, ChatMessage, type ChatMessageData } from './ChatMessage'
import { IconButton } from './IconButton'
import { SegmentedControl } from './SegmentedControl'

const PROVIDER_STORAGE_KEY = 'bc.chat.provider'
const keyStorageKey = (provider: ProviderId) => `bc.apikey.${provider}`

class ChatRequestError extends Error {
  constructor(public code: ChatErrorCode) {
    super(code)
  }
}

const createId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`)

export function AIChat() {
  const [provider, setProvider] = useState<ProviderId>(DEFAULT_PROVIDER)
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<ChatErrorCode | null>(null)
  const [keyPanelOpen, setKeyPanelOpen] = useState(false)
  const [storedKeys, setStoredKeys] = useState<Partial<Record<ProviderId, string>>>({})
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const savedProvider = localStorage.getItem(PROVIDER_STORAGE_KEY)
      if (savedProvider && savedProvider in PROVIDERS) setProvider(savedProvider as ProviderId)
      const keys: Partial<Record<ProviderId, string>> = {}
      for (const id of PROVIDER_IDS) {
        const value = localStorage.getItem(keyStorageKey(id))
        if (value) keys[id] = value
      }
      setStoredKeys(keys)
    } catch {}
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => () => abortRef.current?.abort(), [])

  const changeProvider = (next: ProviderId) => {
    setProvider(next)
    try {
      localStorage.setItem(PROVIDER_STORAGE_KEY, next)
    } catch {}
  }

  const saveKey = (value: string) => {
    const trimmed = value.trim()
    setStoredKeys((prev) => ({ ...prev, [provider]: trimmed || undefined }))
    try {
      if (trimmed) localStorage.setItem(keyStorageKey(provider), trimmed)
      else localStorage.removeItem(keyStorageKey(provider))
    } catch {}
  }

  const send = async (text: string) => {
    const content = text.trim()
    if (!content || isStreaming) return

    const userMessage: ChatMessageData = { id: createId(), role: 'user', content }
    const assistantId = createId()
    const history = [...messages, userMessage]
    setMessages([...history, { id: assistantId, role: 'assistant', content: '' }])
    setInput('')
    setError(null)
    setIsStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          messages: history.map(({ role, content: c }) => ({ role, content: c })),
          apiKey: storedKeys[provider] || undefined,
        }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: ChatErrorCode } | null
        throw new ChatRequestError(data?.error ?? 'unknown')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        if (!chunk) continue
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)))
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err instanceof ChatRequestError ? err.code : 'network')
      }
    } finally {
      setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.content))
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const stop = () => abortRef.current?.abort()

  const clear = () => {
    stop()
    setMessages([])
    setError(null)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void send(input)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void send(input)
    }
  }

  const providerOptions = PROVIDER_IDS.map((id) => ({ value: id, label: PROVIDERS[id].label }))

  return (
    <section aria-labelledby="chat-title" className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
        <AssistantAvatar />
        <div className="min-w-0 flex-1">
          <h2 id="chat-title" className="font-semibold leading-tight">
            {t.chat.title}
          </h2>
          <p className="truncate text-xs text-fg-muted">{t.chat.subtitle}</p>
        </div>
        <SegmentedControl
          size="sm"
          label={t.chat.provider}
          options={providerOptions}
          value={provider}
          onChange={changeProvider}
        />
        <div className="flex items-center gap-1.5">
          <IconButton
            className={cn('size-9', keyPanelOpen && 'text-brand')}
            onClick={() => setKeyPanelOpen((v) => !v)}
            aria-label={t.chat.keyToggle}
            aria-expanded={keyPanelOpen}
            aria-controls="api-key-panel"
            title={t.chat.keyToggle}
          >
            <KeyRound className="size-4" />
            {storedKeys[provider] && <span className="absolute right-1 top-1 size-1.5 rounded-full bg-brand-2" />}
          </IconButton>
          <IconButton
            className="size-9"
            onClick={clear}
            disabled={messages.length === 0}
            aria-label={t.chat.clear}
            title={t.chat.clear}
          >
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      </header>

      <AnimatePresence initial={false}>
        {keyPanelOpen && (
          <motion.div
            id="api-key-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 36 }}
            className="overflow-hidden border-b border-border"
          >
            <ApiKeyForm
              key={provider}
              providerLabel={PROVIDERS[provider].label}
              placeholder={PROVIDERS[provider].keyPlaceholder}
              storedKey={storedKeys[provider] ?? ''}
              onSave={saveKey}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5">
        {messages.length === 0 ? (
          <EmptyState onPick={(s) => void send(s)} />
        ) : (
          <ul className="flex flex-col gap-3" aria-label={t.chat.title}>
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
          </ul>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mx-3 mb-2 flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-fg sm:mx-5"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            <p className="flex-1">{t.chat.errors[error]}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              aria-label={t.chat.dismissError}
              className="focus-ring rounded-md text-fg-muted hover:text-fg"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="px-3 pb-3 sm:px-5 sm:pb-4">
        <div className="bubble flex items-end gap-2 rounded-[1.5rem] p-1.5 pl-4 focus-within:ring-2 focus-within:ring-brand">
          <label htmlFor="chat-input" className="sr-only">
            {t.chat.inputLabel}
          </label>
          <textarea
            id="chat-input"
            data-autofocus
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.chat.placeholder}
            aria-describedby="chat-input-hint"
            className="field-sizing-content max-h-40 min-h-10 flex-1 resize-none bg-transparent py-2 text-[0.95rem] text-fg outline-none placeholder:text-fg-muted"
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={stop}
              aria-label={t.chat.stop}
              className="focus-ring flex size-10 shrink-0 items-center justify-center rounded-full bg-fg text-glass"
            >
              <Square className="size-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label={t.chat.send}
              className="focus-ring flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-md shadow-brand/30 transition-all disabled:opacity-40 disabled:shadow-none"
            >
              <ArrowUp className="size-5" />
            </button>
          )}
        </div>
        <p id="chat-input-hint" className="mt-1.5 hidden px-2 text-xs text-fg-muted sm:block">
          {t.chat.inputHint}
        </p>
      </form>
    </section>
  )
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 py-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-3xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-lg">
        <AssistantAvatarIcon />
      </span>
      <div>
        <p className="text-lg font-semibold">{t.chat.emptyTitle}</p>
        <p className="mt-1 text-sm text-fg-muted">{t.chat.emptyText}</p>
      </div>
      <div className="flex max-w-lg flex-wrap justify-center gap-2">
        {t.chat.suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="focus-ring bubble rounded-full px-3.5 py-2 text-sm transition-colors hover:text-brand"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function AssistantAvatarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" strokeLinejoin="round" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" strokeLinejoin="round" />
    </svg>
  )
}

function ApiKeyForm({
  providerLabel,
  placeholder,
  storedKey,
  onSave,
}: {
  providerLabel: string
  placeholder: string
  storedKey: string
  onSave: (value: string) => void
}) {
  const [value, setValue] = useState(storedKey)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave(value)
      }}
      className="flex flex-col gap-2 px-4 py-3 sm:px-5"
    >
      <label htmlFor="api-key-input" className="text-sm font-medium">
        {t.chat.keyLabel(providerLabel)}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="api-key-input"
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="bubble h-10 min-w-0 flex-1 rounded-xl px-3 font-mono text-sm text-fg outline-none placeholder:text-fg-muted focus:ring-2 focus:ring-brand"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="focus-ring h-10 flex-1 rounded-xl bg-brand px-4 text-sm font-semibold text-white sm:flex-none"
          >
            {t.chat.keySave}
          </button>
          {storedKey && (
            <button
              type="button"
              onClick={() => {
                setValue('')
                onSave('')
              }}
              className="focus-ring bubble h-10 rounded-xl px-4 text-sm font-medium text-fg-muted hover:text-destructive"
            >
              {t.chat.keyRemove}
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-fg-muted">
        <span className={cn('font-medium', storedKey ? 'text-brand-2' : '')}>
          {storedKey ? t.chat.keySaved : t.chat.keyNone}
        </span>
        {' · '}
        {t.chat.keyHint}
      </p>
    </form>
  )
}
