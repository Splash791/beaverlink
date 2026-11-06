// DEMO ONLY: this provider fakes authentication against hardcoded accounts and
// stores the session in localStorage. Swap the body of login/logout for a real
// provider (Supabase Auth or OSU SSO) before any real use; the public API
// (user, isLoading, login, logout) is intentionally provider-agnostic so only
// this file needs to change.
import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from './types'
import { AuthContext } from './useAuth'
import { DEMO_PASSWORD, demoUsers } from './demoUsers'

const STORAGE_KEY = 'beaverlink.demo.user'
const FAKE_DELAY_MS = 500

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function writeStoredUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Ignore storage failures (private mode, quota); session just won't persist.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Restore the session synchronously on first render so a refresh never
  // flashes the login page. isLoading is still exposed for the async login.
  const [user, setUser] = useState<User | null>(readStoredUser)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, FAKE_DELAY_MS))
      const match = demoUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
      )
      if (!match || password !== DEMO_PASSWORD) {
        throw new Error('Incorrect email or password.')
      }
      const nextUser: User = {
        id: match.id,
        name: match.name,
        email: match.email,
        role: match.role,
      }
      setUser(nextUser)
      writeStoredUser(nextUser)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    writeStoredUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
