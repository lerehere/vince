'use client'

import { Monitor, Moon, RotateCcw, Sun, X } from 'lucide-react'
import { type CSSProperties, useId } from 'react'
import { type ThemeMode, useSettings } from '@/hooks/useSettings'
import { t } from '@/lib/i18n'
import { IconButton } from './IconButton'
import { SegmentedControl } from './SegmentedControl'
import { Sheet } from './Sheet'

const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: t.settings.themeLight, icon: Sun },
  { value: 'dark', label: t.settings.themeDark, icon: Moon },
  { value: 'system', label: t.settings.themeSystem, icon: Monitor },
]

export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, update, reset } = useSettings()

  return (
    <Sheet open={open} onClose={onClose} labelledBy="settings-title">
      <div className="flex items-center justify-between">
        <h2 id="settings-title" className="text-xl font-semibold tracking-tight">
          {t.settings.title}
        </h2>
        <IconButton onClick={onClose} aria-label={t.settings.close} className="size-9">
          <X className="size-4" />
        </IconButton>
      </div>

      <section className="mt-5 flex flex-col gap-1">
        <h3 className="px-1 text-xs font-medium uppercase tracking-wider text-fg-muted">{t.settings.appearance}</h3>
        <div className="bubble flex flex-col gap-4 rounded-3xl p-4">
          <IosSlider label={t.settings.dim} value={settings.dim} onChange={(v) => update('dim', v)} />
          <IosSlider
            label={t.settings.cardOpacity}
            value={settings.cardTransparency}
            onChange={(v) => update('cardTransparency', v)}
          />
        </div>
      </section>

      <section className="mt-5 flex flex-col gap-1">
        <h3 className="px-1 text-xs font-medium uppercase tracking-wider text-fg-muted">{t.settings.theme}</h3>
        <SegmentedControl
          label={t.settings.theme}
          options={themeOptions}
          value={settings.theme}
          onChange={(v) => update('theme', v)}
        />
      </section>

      <section className="mt-5 flex flex-col gap-1">
        <h3 className="px-1 text-xs font-medium uppercase tracking-wider text-fg-muted">{t.settings.sound}</h3>
        <div className="bubble rounded-3xl p-4">
          <IosSlider label={t.settings.volume} value={settings.volume} onChange={(v) => update('volume', v)} />
        </div>
      </section>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="focus-ring bubble flex h-12 items-center gap-2 rounded-2xl px-4 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {t.settings.reset}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="focus-ring h-12 flex-1 rounded-2xl bg-brand text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform active:scale-[0.98]"
        >
          {t.settings.done}
        </button>
      </div>
    </Sheet>
  )
}

function IosSlider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const id = useId()
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        <span className="tabular-nums text-fg-muted">{value}%</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${value}%`}
        className="ios-slider"
        style={{ '--fill': `${value}%` } as CSSProperties}
      />
    </div>
  )
}
