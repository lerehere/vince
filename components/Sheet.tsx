'use client'

import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { type ReactNode, useRef } from 'react'
import { useDialog } from '@/hooks/useDialog'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface SheetProps {
  open: boolean
  onClose: () => void
  labelledBy: string
  children: ReactNode
  className?: string
}

/** Нижний лист в стиле iOS на мобильных и модальное окно на десктопе. */
export function Sheet({ open, onClose, labelledBy, children, className }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()
  useDialog(open, onClose, ref)

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ y: 120, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 120, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose()
            }}
            className={cn(
              'glass-sheet relative w-full max-w-md rounded-t-[2rem] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 text-fg md:rounded-[2rem] md:p-6',
              className,
            )}
          >
            <div
              className="mx-auto mb-3 flex h-5 w-full cursor-grab touch-none items-center justify-center active:cursor-grabbing md:hidden"
              onPointerDown={(e) => dragControls.start(e)}
              aria-hidden="true"
              title={t.settings.dragHandle}
            >
              <span className="h-1.5 w-10 rounded-full bg-fg/25" />
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
