'use client'

import { type HTMLMotionProps, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function IconButton({ className, children, ...props }: HTMLMotionProps<'button'>) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={cn(
        'bubble focus-ring relative inline-flex size-11 shrink-0 items-center justify-center rounded-full text-fg transition-colors hover:text-brand',
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
