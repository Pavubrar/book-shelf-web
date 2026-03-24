import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export function RegisterPage() {
  const { applyAuthResponse } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await api.register(displayName, email, password)
      applyAuthResponse(response)
      navigate('/books')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="simple-page">
      <div className="form-card narrow">
        <h1>Create account</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Display name
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
          </label>
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
              minLength={8}
              required
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Register'}
          </button>
        </form>
        <Link to="/login">Back to login</Link>
      </div>
    </section>
  )
}
