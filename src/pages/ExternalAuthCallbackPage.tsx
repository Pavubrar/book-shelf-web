import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ExternalAuthCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { syncToken } = useAuth()
  const [message, setMessage] = useState('Completing external login...')
  const result = useMemo(
    () => ({
      token: params.get('token'),
      error: params.get('error'),
    }),
    [params],
  )

  useEffect(() => {
    const finish = async () => {
      if (result.error) {
        setMessage(result.error)
        return
      }

      if (!result.token) {
        setMessage('No login token was returned.')
        return
      }

      try {
        await syncToken(result.token)
        navigate('/books', { replace: true })
      } catch {
        setMessage('Unable to restore the external session.')
      }
    }

    void finish()
  }, [navigate, result.error, result.token, syncToken])

  return <div className="screen-message">{message}</div>
}
