'use client'

import { useCallback, useEffect, useState } from 'react'
import { ACCESS_PASSWORD } from '@/lib/config'

const AUTH_STORAGE_KEY = 'bc.auth.v1'

// TODO: Это защита только на стороне клиента (sessionStorage + пароль в сборке).
// Для реальной безопасности добавьте серверную авторизацию.
export function useAuth() {
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    try {
      setIsAuthed(sessionStorage.getItem(AUTH_STORAGE_KEY) === '1')
    } catch {
      setIsAuthed(false)
    }
  }, [])

  const login = useCallback((password: string) => {
    if (password !== ACCESS_PASSWORD) return false
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, '1')
    } catch {
      // sessionStorage недоступен — авторизация действует до перезагрузки
    }
    setIsAuthed(true)
    return true
  }, [])

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
    } catch {}
    setIsAuthed(false)
  }, [])

  return { isAuthed, login, logout }
}
