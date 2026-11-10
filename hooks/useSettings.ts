'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface Settings {
  /** Затемнение фона, 0–100 */
  dim: number
  /** Прозрачность карточки, 0–100 (100 — полностью прозрачная подложка) */
  cardTransparency: number
  theme: ThemeMode
  musicEnabled: boolean
  /** Громкость, 0–100 */
  volume: number
}

export const DEFAULT_SETTINGS: Settings = {
  dim: 35,
  cardTransparency: 35,
  theme: 'system',
  musicEnabled: true,
  volume: 40,
}

import { SETTINGS_STORAGE_KEY } from '@/lib/storage-keys'

const clampPercent = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : fallback

function readStoredSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      dim: clampPercent(parsed.dim, DEFAULT_SETTINGS.dim),
      cardTransparency: clampPercent(parsed.cardTransparency, DEFAULT_SETTINGS.cardTransparency),
      theme: parsed.theme === 'light' || parsed.theme === 'dark' || parsed.theme === 'system' ? parsed.theme : 'system',
      musicEnabled: typeof parsed.musicEnabled === 'boolean' ? parsed.musicEnabled : DEFAULT_SETTINGS.musicEnabled,
      volume: clampPercent(parsed.volume, DEFAULT_SETTINGS.volume),
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function useSettingsState() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setSettings(readStoredSettings())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // Хранилище недоступно (например, приватный режим)
    }
  }, [settings, hydrated])

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), [])

  return { settings, update, reset, hydrated }
}

export interface SettingsContextValue extends ReturnType<typeof useSettingsState> {
  resolvedTheme: ResolvedTheme
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within ThemeProvider')
  return ctx
}
