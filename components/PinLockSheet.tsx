'use client'

import { useAnimate } from 'framer-motion'
import { Eye, EyeOff, LockKeyhole, X } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { t } from '@/lib/i18n'
import { IconButton } from './IconButton'
import { Sheet } from './Sheet'

interface PinLockSheetProps {
  open: boolean
  onClose: () => void
  onSubmit: (password: string) => boolean
}

export function PinLockSheet({ open, onClose, onSubmit }: PinLockSheetProps) {
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scope, animate] = useAnimate<HTMLFormElement>()

  useEffect(() => {
    if (open) {
      setPassword('')
      setError(null)
      setVisible(false)
    }
  }, [open])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!password) {
      setError(t.lock.empty)
      return
    }
    if (onSubmit(password)) return
    setError(t.lock.wrong)
    setPassword('')
    navigator.vibrate?.(120)
    if (scope.current) {
      void animate(scope.current, { x: [0, -14, 14, -10, 10, -5, 5, 0] }, { duration: 0.45 })
    }
  }

  return (
    <Sheet open={open} onClose={onClose} labelledBy="lock-title">
      <div className="flex justify-end">
        <IconButton onClick={onClose} aria-label={t.lock.close} className="size-9">
          <X className="size-4" />
        </IconButton>
      </div>
      <div className="flex flex-col items-center text-center">
        <span className="flex size-16 items-center justify-center rounded-3xl bg-brand text-white shadow-lg shadow-brand/30">
          <LockKeyhole className="size-7" aria-hidden="true" />
        </span>
        <h2 id="lock-title" className="mt-4 text-xl font-semibold tracking-tight">
          {t.lock.title}
        </h2>
        <p className="mt-1 text-sm text-fg-muted">{t.lock.subtitle}</p>
      </div>

      <form ref={scope} onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3" noValidate>
        <label htmlFor="access-password" className="sr-only">
          {t.lock.label}
        </label>
        <div className="bubble flex items-center gap-2 rounded-2xl pl-4 pr-1.5 focus-within:ring-2 focus-within:ring-brand">
          <input
            id="access-password"
            data-autofocus
            type={visible ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (error) setError(null)
            }}
            placeholder={t.lock.placeholder}
            autoComplete="current-password"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'lock-error' : undefined}
            className="h-12 min-w-0 flex-1 bg-transparent text-base tracking-wide text-fg outline-none placeholder:text-fg-muted"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? t.lock.hide : t.lock.show}
            className="focus-ring flex size-9 items-center justify-center rounded-xl text-fg-muted hover:text-fg"
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <p id="lock-error" role="alert" className="min-h-5 px-1 text-sm font-medium text-destructive">
          {error}
        </p>
        <button
          type="submit"
          className="focus-ring h-12 rounded-2xl bg-brand text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform active:scale-[0.98]"
        >
          {t.lock.submit}
        </button>
      </form>
    </Sheet>
  )
}
