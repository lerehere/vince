'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseAudioOptions {
  src: string
  enabled: boolean
  volume: number
  onEnabledChange: (enabled: boolean) => void
}

/**
 * Фоновая музыка с учётом ограничений автовоспроизведения:
 * воспроизведение стартует только после первого взаимодействия пользователя.
 * Элементы с атрибутом `data-music-toggle` обрабатывают клик сами.
 */
export function useAudio({ src, enabled, volume, onEnabledChange }: UseAudioOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const enabledRef = useRef(enabled)
  const [isPlaying, setIsPlaying] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  useEffect(() => {
    const audio = new Audio()
    audio.src = src
    audio.loop = true
    audio.preload = 'auto'
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onError = () => setError(true)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)
    audioRef.current = audio
    return () => {
      audio.pause()
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
      audio.removeAttribute('src')
      audio.load()
      audioRef.current = null
    }
  }, [src])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100
  }, [volume])

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    try {
      audio.volume = volume / 100
      await audio.play()
      setError(false)
    } catch {
      // Браузер заблокировал воспроизведение — попробуем после следующего жеста
    }
  }, [volume])

  useEffect(() => {
    if (unlocked) return
    const handleFirstInteraction = (event: Event) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('[data-music-toggle]')) return
      setUnlocked(true)
      if (enabledRef.current) void play()
    }
    window.addEventListener('pointerdown', handleFirstInteraction)
    window.addEventListener('keydown', handleFirstInteraction)
    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [unlocked, play])

  const toggle = useCallback(() => {
    setUnlocked(true)
    const audio = audioRef.current
    if (audio && !audio.paused) {
      audio.pause()
      onEnabledChange(false)
    } else {
      onEnabledChange(true)
      void play()
    }
  }, [onEnabledChange, play])

  return { isPlaying, unlocked, error, toggle }
}
