'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { useId } from 'react'
import { cn } from '@/lib/utils'

interface SegmentedOption<T extends string> {
  value: T
  label: string
  icon?: LucideIcon
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  size?: 'sm' | 'md'
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  className,
}: SegmentedControlProps<T>) {
  const id = useId()
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('bubble grid rounded-2xl p-1', className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map(({ value: optionValue, label: optionLabel, icon: Icon }) => {
        const active = optionValue === value
        return (
          <button
            key={optionValue}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(optionValue)}
            className={cn(
              'focus-ring relative z-0 flex items-center justify-center gap-1.5 rounded-xl font-medium transition-colors',
              size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3 py-2 text-sm',
              active ? 'text-white' : 'text-fg-muted hover:text-fg',
            )}
          >
            {active && (
              <motion.span
                layoutId={`segment-${id}`}
                className="absolute inset-0 -z-10 rounded-xl bg-brand shadow-md shadow-brand/30"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            {Icon && <Icon className="size-4" aria-hidden="true" />}
            {optionLabel}
          </button>
        )
      })}
    </div>
  )
}
