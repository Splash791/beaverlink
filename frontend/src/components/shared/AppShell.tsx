// Consistent page frame for every role: skip link, header with the logo, a
// "Demo data" label, the user's role badge, and logout. Children render inside
// the <main> landmark.
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../Logo'
import { RoleBadge } from '../RoleBadge'
import { Button } from '../Button'
import { Badge } from './Badge'
import { useAuth } from '../../auth/useAuth'

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo className="text-ink" />
            <Badge tone="amber" className="hidden sm:inline-flex">
              Demo data
            </Badge>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <div className="hidden items-center gap-2 sm:flex">
                <span className="text-sm font-medium text-ink">{user.name}</span>
                <RoleBadge role={user.role} />
              </div>
            )}
            <Button variant="secondary" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}
