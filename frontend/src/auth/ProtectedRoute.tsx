import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'

// Guards routes that require a signed-in user. While the session is being
// restored we render nothing to avoid flashing the login page on refresh.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
