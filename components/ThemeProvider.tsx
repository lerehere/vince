'use client'

import { MotionConfig } from 'framer-motion'
import { type ReactNode, useEffect, useMemo, useSyncExternalStore } from 'react'
import { type ResolvedTheme, SettingsContext, useSettingsState } from '@/hooks/useSettings'

const DARK_QUERY = '(prefers-color-scheme: dark)'

function subscribeSystemTheme(callback: () => void) {
  const media = window.matchMedia(DARK_QUERY)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

function useSystemPrefersDark() {
  return useSyncExternalStore(
    subscribeSystemTheme,
    () => window.matchMedia(DARK_QUERY).matches,
    () => false,
  )
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const state = useSettingsState()
  const systemDark = useSystemPrefersDark()
  const { theme } = state.settings
  const resolvedTheme: ResolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  useEffect(() => {
    if (!state.hydrated) return
    const root = document.documentElement
    root.classList.toggle('dark', resolvedTheme === 'dark')
    root.style.colorScheme = resolvedTheme
  }, [resolvedTheme, state.hydrated])

  const value = useMemo(() => ({ ...state, resolvedTheme }), [state, resolvedTheme])

  return (
    <SettingsContext.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </SettingsContext.Provider>
  )
}
