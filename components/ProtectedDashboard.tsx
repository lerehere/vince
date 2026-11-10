'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, LogOut, ShieldCheck } from 'lucide-react'
import { useRef } from 'react'
import { useDialog } from '@/hooks/useDialog'
import { t } from '@/lib/i18n'
import { AIChat } from './AIChat'
import { IconButton } from './IconButton'

interface ProtectedDashboardProps {
  open: boolean
  onClose: () => void
  onLogout: () => void
}

export function ProtectedDashboard({ open, onClose, onLogout }: ProtectedDashboardProps) {
  const ref = useRef<HTMLDivElement>(null)
  useDialog(open, onClose, ref)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div aria-hidden="true" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-title"
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="glass-sheet relative flex h-dvh w-full max-w-4xl flex-col overflow-hidden text-fg sm:h-[min(820px,calc(100dvh-2rem))] sm:rounded-[2.25rem]"
          >
            <div className="flex items-center gap-3 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))] sm:px-5 sm:pt-4">
              <IconButton onClick={onClose} aria-label={t.dashboard.back} title={t.dashboard.back} className="size-10">
                <ArrowLeft className="size-5" />
              </IconButton>
              <div className="min-w-0 flex-1">
                <h1 id="dashboard-title" className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                  {t.dashboard.title}
                </h1>
                <p className="flex items-center gap-1 text-xs font-medium text-brand-2">
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  {t.dashboard.badge}
                </p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="focus-ring bubble flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors hover:text-destructive"
              >
                <LogOut className="size-4" aria-hidden="true" />
                {t.dashboard.logout}
              </button>
            </div>
            <div className="mx-2 mb-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] bubble sm:mx-4 sm:mb-4">
              <AIChat />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
