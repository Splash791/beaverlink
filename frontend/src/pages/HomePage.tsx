import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { RoleBadge } from '../components/RoleBadge'
import { useAuth } from '../auth/useAuth'
import type { Role } from '../auth/types'

const roleMessages: Record<Role, string> = {
  student: 'Your recommended alumni connections will appear here.',
  alumnus: 'Students looking to connect will appear here.',
  admin: 'Event management tools will appear here.',
}

export function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // ProtectedRoute guarantees a user, but guard for type-safety.
  if (!user) return null

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <span className="text-lg font-bold text-gray-900">
            Beaver<span className="text-[#D73F09]">Link</span>
          </span>
          <Button variant="secondary" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user.name}
            </h1>
            <RoleBadge role={user.role} />
          </div>
          <p className="mt-1 text-sm text-gray-500">{user.email}</p>
          <p className="mt-6 text-gray-700">{roleMessages[user.role]}</p>
        </div>

        <p className="mt-6 text-xs font-medium uppercase tracking-wide text-gray-400">
          Demo build
        </p>
      </main>
    </div>
  )
}
