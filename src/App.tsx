import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import { AdminPage } from './pages/AdminPage'
import { BooksPage } from './pages/BooksPage'
import { ExternalAuthCallbackPage } from './pages/ExternalAuthCallbackPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'

function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? '/books' : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/external-callback" element={<ExternalAuthCallbackPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/books" element={<BooksPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute requireAdmin />}>
        <Route element={<AppShell />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
