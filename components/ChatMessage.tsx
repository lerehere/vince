'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export interface ChatMessageData {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function AssistantAvatar() {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-white shadow-md"
    >
      <Sparkles className="size-4" />
    </span>
  )
}

export function ChatMessage({ message }: { message: ChatMessageData }) {
  const isUser = message.role === 'user'
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className={cn('flex items-end gap-2', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && <AssistantAvatar />}
      <div
        className={cn(
          'max-w-[85%] rounded-[1.35rem] px-4 py-2.5 text-[0.95rem] leading-relaxed sm:max-w-[75%]',
          isUser ? 'rounded-br-md bg-brand text-white shadow-md shadow-brand/25' : 'bubble rounded-bl-md text-fg',
        )}
      >
        <span className="sr-only">{isUser ? t.chat.you : t.chat.assistant}: </span>
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : message.content ? (
          <div className="chat-markdown break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <TypingIndicator />
        )}
      </div>
    </motion.li>
  )
}

function TypingIndicator() {
  return (
    <span role="status" className="flex h-6 items-center gap-1">
      <span className="sr-only">{t.chat.typing}</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className="typing-dot size-2 rounded-full bg-fg-muted"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  )
}
