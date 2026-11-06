import { createContext, useContext } from 'react'
import type { AuthContextValue } from './types'

// The context lives here (not in AuthProvider.tsx) so the provider file only
// exports a component, keeping React Fast Refresh happy.
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return value
}
