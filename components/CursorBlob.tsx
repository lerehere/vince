'use client'

import { animate, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useEffect } from 'react'

export function CursorBlob() {
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const leadX = useSpring(x, { stiffness: 55, damping: 16, mass: 1.2 })
  const leadY = useSpring(y, { stiffness: 55, damping: 16, mass: 1.2 })
  const trailX = useSpring(x, { stiffness: 22, damping: 14, mass: 2 })
  const trailY = useSpring(y, { stiffness: 22, damping: 14, mass: 2 })

  useEffect(() => {
    const w = window.innerWidth
    const h = window.innerHeight
    x.jump(w / 2)
    y.jump(h / 2)
    if (reduceMotion) return

    if (window.matchMedia('(pointer: coarse)').matches) {
      const controls = [
        animate(x, [w * 0.3, w * 0.75, w * 0.55, w * 0.25, w * 0.3], {
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }),
        animate(y, [h * 0.3, h * 0.45, h * 0.75, h * 0.6, h * 0.3], {
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }),
      ]
      return () => controls.forEach((c) => c.stop())
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      x.set(event.clientX)
      y.set(event.clientY)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduceMotion, x, y])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div className="absolute left-0 top-0 size-0" style={{ x: trailX, y: trailY }}>
        <div className="blob blob-secondary size-[20rem] md:size-[30rem]" />
      </motion.div>
      <motion.div className="absolute left-0 top-0 size-0" style={{ x: leadX, y: leadY }}>
        <div className="blob blob-primary size-[24rem] md:size-[38rem]" />
      </motion.div>
    </div>
  )
}
