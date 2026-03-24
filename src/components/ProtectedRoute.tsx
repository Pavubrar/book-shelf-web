import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type ProtectedRouteProps = {
  requireAdmin?: boolean
}

export function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const { loading, user, isAdmin } = useAuth()

  if (loading) {
    return <div className="screen-message">Loading your workspace...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/books" replace />
  }

  return <Outlet />
}
