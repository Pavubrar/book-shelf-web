import { useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [token, setToken] = useState(params.get('token') ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    try {
      await api.resetPassword(email, token, newPassword)
      setSuccess('Password updated. You can log in now.')
      setTimeout(() => navigate('/login'), 800)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Reset failed.')
    }
  }

  return (
    <section className="simple-page">
      <div className="form-card narrow">
        <h1>Reset password</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>
          <label>
            Reset token
            <textarea value={token} onChange={(event) => setToken(event.target.value)} rows={4} required />
          </label>
          <label>
            New password
            <input
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              type="password"
              minLength={8}
              required
            />
          </label>
          <button type="submit">Update password</button>
        </form>

        {success ? <p className="success-text">{success}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        <Link to="/login">Back to login</Link>
      </div>
    </section>
  )
}
