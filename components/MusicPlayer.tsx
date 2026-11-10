'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Music2, Volume2, VolumeX } from 'lucide-react'
import { t } from '@/lib/i18n'
import { IconButton } from './IconButton'

export function MusicToggle({ isPlaying, onToggle }: { isPlaying: boolean; onToggle: () => void }) {
  return (
    <IconButton
      data-music-toggle=""
      onClick={onToggle}
      aria-label={isPlaying ? t.music.pause : t.music.play}
      aria-pressed={isPlaying}
      title={isPlaying ? t.music.pause : t.music.play}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isPlaying ? 'on' : 'off'}
          initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotate: 30 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className="flex"
        >
          {isPlaying ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        </motion.span>
      </AnimatePresence>
      {isPlaying && (
        <span className="absolute right-1 top-1 size-2 rounded-full bg-brand-2 shadow-[0_0_8px_var(--brand-2)]" />
      )}
    </IconButton>
  )
}

export function MusicHint({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.8 }}
          className="pointer-events-none fixed inset-x-0 bottom-5 z-20 flex justify-center px-4"
        >
          <span className="bubble flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-fg shadow-lg">
            <Music2 className="hint-pulse size-4 text-brand" aria-hidden="true" />
            {t.music.hint}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
