import ProfilePage from './pages/ProfilePage.tsx'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { PublicLanding } from './pages/PublicLanding'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { useAuth } from './auth/useAuth'

// Logged-in visitors go straight to their home; everyone else sees the
// public marketing landing.
function RootRoute() {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  return user ? <Navigate to="/home" replace /> : <PublicLanding />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route path="/profile" element={<ProfilePage />} />
      {/* Unknown routes fall back to the root redirect. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
