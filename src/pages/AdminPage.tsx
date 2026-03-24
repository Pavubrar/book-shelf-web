import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { AdminUser } from '../types'

export function AdminPage() {
  const { token } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      return
    }

    void api
      .listUsers(token)
      .then(setUsers)
      .catch((loadError: Error) => setError(loadError.message))
  }, [token])

  const changeRole = async (userId: string, role: 'Admin' | 'User') => {
    if (!token) {
      return
    }

    try {
      await api.updateUserRole(token, userId, role)
      setUsers((current) =>
        current.map((user) =>
          user.id === userId ? { ...user, roles: role === 'Admin' ? ['Admin', 'User'] : ['User'] } : user,
        ),
      )
    } catch (roleError) {
      setError(roleError instanceof Error ? roleError.message : 'Role update failed.')
    }
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Admin controls</p>
          <h2>User access management</h2>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="user-grid">
        {users.map((user) => {
          const currentRole = user.roles.includes('Admin') ? 'Admin' : 'User'

          return (
            <article key={user.id} className="book-card">
              <h3>{user.displayName}</h3>
              <p>{user.email}</p>
              <label>
                Role
                <select
                  value={currentRole}
                  onChange={(event) => void changeRole(user.id, event.target.value as 'Admin' | 'User')}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </label>
            </article>
          )
        })}
      </div>
    </section>
  )
}
