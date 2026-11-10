'use client'

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { ArrowUpRight, Check, Copy, Lock, LockOpen, Mail, Send, Settings2, X } from 'lucide-react'
import { type CSSProperties, type ComponentType, type PointerEvent, type SVGProps, useState } from 'react'
import { PROFILE } from '@/lib/config'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { GithubIcon } from './BrandIcons'
import { IconButton } from './IconButton'
import { MusicToggle } from './MusicPlayer'

interface BusinessCardProps {
  cardTransparency: number
  isPlaying: boolean
  onToggleMusic: () => void
  onOpenSettings: () => void
  onOpenLock: () => void
  isAuthed: boolean
}

const contacts: {
  key: string
  label: string
  value: string
  href: string
  external: boolean
  icon: ComponentType<SVGProps<SVGSVGElement>>
}[] = [
  { key: 'email', label: t.card.email, value: PROFILE.email, href: `mailto:${PROFILE.email}`, external: false, icon: Mail },
  {
    key: 'telegram',
    label: t.card.telegram,
    value: `@${PROFILE.telegram}`,
    href: `https://t.me/${PROFILE.telegram}`,
    external: true,
    icon: Send,
  },
  {
    key: 'github',
    label: t.card.github,
    value: `github.com/${PROFILE.github}`,
    href: `https://github.com/${PROFILE.github}`,
    external: true,
    icon: GithubIcon,
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
}

export function BusinessCard({
  cardTransparency,
  isPlaying,
  onToggleMusic,
  onOpenSettings,
  onOpenLock,
  isAuthed,
}: BusinessCardProps) {
  const reduceMotion = useReducedMotion()
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [4, -4]), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-5, 5]), { stiffness: 150, damping: 20 })
  const glowX = useTransform(px, [-0.5, 0.5], [0, 100])
  const glowY = useTransform(py, [-0.5, 0.5], [0, 100])
  const glow = useMotionTemplate`radial-gradient(520px circle at ${glowX}% ${glowY}%, rgb(255 255 255 / 0.16), transparent 60%)`

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    px.set((event.clientX - rect.left) / rect.width - 0.5)
    py.set((event.clientY - rect.top) / rect.height - 0.5)
  }
  const handlePointerLeave = () => {
    px.set(0)
    py.set(0)
  }

  return (
    <div className="w-full max-w-[860px]" style={{ '--card-alpha': `${100 - cardTransparency}%` } as CSSProperties}>
      <motion.article
        aria-labelledby="card-name"
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        style={{ rotateX, rotateY, transformPerspective: 1400 }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="glass-card relative flex flex-col overflow-hidden rounded-[2.25rem] p-5 text-fg sm:p-7 md:min-h-[470px] md:p-9"
      >
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: glow }} />

        <motion.div variants={container} initial="hidden" animate="show" className="relative flex flex-1 flex-col">
          <motion.header variants={item} className="flex items-center justify-between gap-3">
            <span className="bubble inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-fg-muted sm:text-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-2 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-brand-2" />
              </span>
              {t.card.status}
            </span>
            <div className="flex items-center gap-2">
              <MusicToggle isPlaying={isPlaying} onToggle={onToggleMusic} />
              <IconButton onClick={onOpenLock} aria-label={t.card.openLocked} title={t.card.openLocked}>
                {isAuthed ? <LockOpen className="size-5 text-brand-2" /> : <Lock className="size-5" />}
              </IconButton>
              <IconButton onClick={onOpenSettings} aria-label={t.card.openSettings} title={t.card.openSettings}>
                <Settings2 className="size-5" />
              </IconButton>
            </div>
          </motion.header>

          <div className="mt-6 grid flex-1 items-center gap-7 md:mt-8 md:grid-cols-[1.15fr_1fr] md:gap-10">
            <motion.section variants={item} className="flex flex-col gap-5">
              <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-5">
                <div className="avatar-ring shrink-0 rounded-full p-[3px]">
                  <img
                    src={PROFILE.avatar || '/placeholder.svg'}
                    alt={t.card.avatarAlt(PROFILE.name)}
                    width={128}
                    height={128}
                    className="size-20 rounded-full object-cover sm:size-24 md:size-32"
                  />
                </div>
                <div className="min-w-0">
                  <h1 id="card-name" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                    {PROFILE.name}
                  </h1>
                  <p className="mt-1 text-pretty text-sm font-medium text-brand sm:text-base">{PROFILE.title}</p>
                </div>
              </div>
              <p className="max-w-prose text-pretty text-sm leading-relaxed text-fg-muted sm:text-[0.95rem]">
                {PROFILE.bio}
              </p>
            </motion.section>

            <motion.section variants={item} aria-labelledby="contacts-heading" className="flex flex-col gap-2.5">
              <h2 id="contacts-heading" className="sr-only">
                {t.card.contactsHeading}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {contacts.map(({ key, ...contact }) => (
                  <li key={key}>
                    <ContactLink {...contact} />
                  </li>
                ))}
              </ul>
              <CopyContactsButton />
            </motion.section>
          </div>
        </motion.div>
      </motion.article>
    </div>
  )
}

function ContactLink({
  label,
  value,
  href,
  external,
  icon: Icon,
}: Omit<(typeof contacts)[number], 'key'>) {
  return (
    <motion.a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      aria-label={t.card.openLink(`${label} — ${value}`)}
      whileHover={{ scale: 1.02, x: 2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="bubble focus-ring group flex items-center gap-3 rounded-2xl px-3 py-2.5"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-fg-muted">{label}</span>
        <span className="block truncate text-sm font-medium">{value}</span>
      </span>
      <ArrowUpRight
        className="size-4 shrink-0 text-fg-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
        aria-hidden="true"
      />
    </motion.a>
  )
}

function CopyContactsButton() {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        t.card.copyTemplate({
          name: PROFILE.name,
          title: PROFILE.title,
          email: PROFILE.email,
          telegram: `https://t.me/${PROFILE.telegram}`,
          github: `https://github.com/${PROFILE.github}`,
        }),
      )
      setStatus('copied')
    } catch {
      setStatus('error')
    }
    setTimeout(() => setStatus('idle'), 2200)
  }

  const label = status === 'copied' ? t.card.copied : status === 'error' ? t.card.copyError : t.card.copyContacts
  const Icon = status === 'copied' ? Check : status === 'error' ? X : Copy

  return (
    <motion.button
      type="button"
      onClick={handleCopy}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'focus-ring mt-1 flex h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white shadow-lg transition-colors duration-300',
        status === 'copied' ? 'bg-brand-2 shadow-brand-2/30' : status === 'error' ? 'bg-destructive' : 'bg-brand shadow-brand/30',
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={status}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-2"
        >
          <Icon className="size-4" aria-hidden="true" />
          <span aria-live="polite">{label}</span>
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
