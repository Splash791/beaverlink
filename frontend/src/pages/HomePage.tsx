import { lazy, Suspense } from 'react'
import { useAuth } from '../auth/useAuth'
import { Skeleton } from '../components/shared'

// Each role's landing is loaded only when a user of that role signs in, so a
// role never downloads (or can reach) another role's page.
const StudentLanding = lazy(() => import('../features/student/StudentLanding'))
const AlumniLanding = lazy(() => import('../features/alumni/AlumniLanding'))
const AdminLanding = lazy(() => import('../features/admin/AdminLanding'))

function LoadingScreen() {
  return (
    <div
      className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10"
      aria-busy="true"
      aria-label="Loading"
    >
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

export function HomePage() {
  const { user } = useAuth()
  // ProtectedRoute guarantees a user; guard for type-safety.
  if (!user) return null

  const Page =
    user.role === 'student'
      ? StudentLanding
      : user.role === 'alumnus'
        ? AlumniLanding
        : AdminLanding

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Page />
    </Suspense>
  )
}
