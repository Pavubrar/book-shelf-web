import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AppShell() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Book library platform</p>
          <h1>BookShelf</h1>
        </div>

        <div className="topbar__actions">
          <nav>
            <NavLink to="/books">Books</NavLink>
            {isAdmin ? <NavLink to="/admin">Admin</NavLink> : null}
          </nav>

          <div className="user-chip">
            <span>{user?.displayName}</span>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  )
}
