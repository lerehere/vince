'use client'

import { useCallback, useState } from 'react'
import { useAudio } from '@/hooks/useAudio'
import { useAuth } from '@/hooks/useAuth'
import { useSettings } from '@/hooks/useSettings'
import { MUSIC_URL } from '@/lib/config'
import { BackgroundLayer } from './BackgroundLayer'
import { BusinessCard } from './BusinessCard'
import { MusicHint } from './MusicPlayer'
import { PinLockSheet } from './PinLockSheet'
import { ProtectedDashboard } from './ProtectedDashboard'
import { SettingsSheet } from './SettingsSheet'

type ActiveSheet = 'settings' | 'lock' | null

export function CardExperience() {
  const { settings, update, hydrated } = useSettings()
  const onEnabledChange = useCallback((enabled: boolean) => update('musicEnabled', enabled), [update])
  const audio = useAudio({
    src: MUSIC_URL,
    enabled: settings.musicEnabled,
    volume: settings.volume,
    onEnabledChange,
  })
  const auth = useAuth()
  const [sheet, setSheet] = useState<ActiveSheet>(null)
  const [dashboardOpen, setDashboardOpen] = useState(false)

  const closeSheet = useCallback(() => setSheet(null), [])
  const closeDashboard = useCallback(() => setDashboardOpen(false), [])

  const handleLogin = (password: string) => {
    const ok = auth.login(password)
    if (ok) {
      setSheet(null)
      setDashboardOpen(true)
    }
    return ok
  }

  return (
    <>
      <BackgroundLayer dim={settings.dim} />
      <main className="relative z-10 flex min-h-dvh items-center justify-center px-3 py-8 sm:px-6 sm:py-12">
        <BusinessCard
          cardTransparency={settings.cardTransparency}
          isPlaying={audio.isPlaying}
          onToggleMusic={audio.toggle}
          isAuthed={auth.isAuthed}
          onOpenSettings={() => setSheet('settings')}
          onOpenLock={() => (auth.isAuthed ? setDashboardOpen(true) : setSheet('lock'))}
        />
      </main>
      <MusicHint visible={hydrated && settings.musicEnabled && !audio.unlocked && !audio.error} />
      <SettingsSheet open={sheet === 'settings'} onClose={closeSheet} />
      <PinLockSheet open={sheet === 'lock'} onClose={closeSheet} onSubmit={handleLogin} />
      <ProtectedDashboard
        open={dashboardOpen && auth.isAuthed}
        onClose={closeDashboard}
        onLogout={() => {
          auth.logout()
          setDashboardOpen(false)
        }}
      />
    </>
  )
}
