import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { api } from '../lib/api'
import type { AuthResponse, User } from '../types'

const STORAGE_KEY = 'bookshelf.auth.token'

type AuthContextValue = {
  user: User | null
  token: string | null
  loading: boolean
  isAdmin: boolean
  applyAuthResponse: (response: AuthResponse) => void
  syncToken: (token: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restore = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const currentUser = await api.me(token)
        setUser(currentUser)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    void restore()
  }, [token])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAdmin: Boolean(user?.roles.includes('Admin')),
      applyAuthResponse: (response) => {
        localStorage.setItem(STORAGE_KEY, response.token)
        setToken(response.token)
        setUser(response.user)
      },
      syncToken: async (nextToken) => {
        localStorage.setItem(STORAGE_KEY, nextToken)
        setToken(nextToken)
        const currentUser = await api.me(nextToken)
        setUser(currentUser)
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEY)
        setToken(null)
        setUser(null)
      },
    }),
    [loading, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }

  return context
}
