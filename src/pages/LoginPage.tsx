import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, getExternalLoginUrl } from '../lib/api'
import type { AuthProvider } from '../types'

export function LoginPage() {
  const { applyAuthResponse, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [providers, setProviders] = useState<AuthProvider[]>([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      navigate('/books')
    }
  }, [navigate, user])

  useEffect(() => {
    void api.providers().then(setProviders).catch(() => setProviders([]))
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await api.login(email, password)
      applyAuthResponse(response)
      navigate('/books')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Login failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-layout">
      <div className="hero-card">
        <p className="eyebrow">Separate frontend and backend ready</p>
        <h1>Upload PDF and audio books in one secure library</h1>
        <p>
          Sign in to manage your collection, keep user/admin access separate, and prepare this app
          for split deployment later.
        </p>
      </div>

      <div className="form-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="stack-links">
          <Link to="/register">Create an account</Link>
          <Link to="/forgot-password">Forgot your password?</Link>
        </div>

        <div className="social-row">
          {providers.map((provider) => (
            <button
              key={provider.name}
              type="button"
              className="secondary"
              disabled={!provider.isConfigured}
              onClick={() => {
                window.location.href = getExternalLoginUrl(provider.name)
              }}
            >
              {provider.isConfigured
                ? `Continue with ${provider.displayName}`
                : `${provider.displayName} not configured`}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
