import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    try {
      const response = await api.forgotPassword(email)
      setMessage(response.message)
      setResetToken(response.resetToken ?? '')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Request failed.')
    }
  }

  return (
    <section className="simple-page">
      <div className="form-card narrow">
        <h1>Forgot password</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>
          <button type="submit">Generate reset token</button>
        </form>

        {message ? <p className="success-text">{message}</p> : null}
        {resetToken ? (
          <div className="token-box">
            <strong>Development reset token</strong>
            <code>{resetToken}</code>
            <Link to={`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetToken)}`}>
              Open reset form
            </Link>
          </div>
        ) : null}
        {error ? <p className="error-text">{error}</p> : null}
        <Link to="/login">Back to login</Link>
      </div>
    </section>
  )
}
