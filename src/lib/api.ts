import type {
  AdminUser,
  AuthProvider,
  AuthResponse,
  Book,
  ForgotPasswordResponse,
  User,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
console.log("API_BASE_URL =", API_BASE_URL);

type RequestOptions = {
  method?: string
  body?: BodyInit | null
  token?: string | null
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers()

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    body: options.body ?? null,
    headers,
  })

  if (!response.ok) {
    const payload = await response.text()
    throw new Error(payload || 'Request failed.')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function buildAssetUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith('http')) {
    return path;
    }
   return new URL(path, API_BASE_URL).toString();
  
}

export function getExternalLoginUrl(provider: string) {
  const callbackUrl = `${window.location.origin}/auth/external-callback`
  return `${API_BASE_URL}/api/auth/external/${provider}?returnUrl=${encodeURIComponent(callbackUrl)}`
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (displayName: string, email: string, password: string) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ displayName, email, password }),
    }),

  me: (token: string) =>
    request<User>('/api/auth/me', {
      token,
    }),

  providers: () => request<AuthProvider[]>('/api/auth/providers'),

  forgotPassword: (email: string) =>
    request<ForgotPasswordResponse>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, token: string, newPassword: string) =>
    request<void>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, newPassword }),
    }),

  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    request<void>('/api/auth/change-password', {
      method: 'POST',
      token,
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  listBooks: (token: string) =>
    request<Book[]>('/api/books', {
      token,
    }),

  createBook: (token: string, body: FormData) =>
    request<Book>('/api/books', {
      method: 'POST',
      token,
      body,
    }),

  updateBook: (token: string, id: string, body: FormData) =>
    request<Book>(`/api/books/${id}`, {
      method: 'PUT',
      token,
      body,
    }),

  deleteBook: (token: string, id: string) =>
    request<void>(`/api/books/${id}`, {
      method: 'DELETE',
      token,
    }),

  listUsers: (token: string) =>
    request<AdminUser[]>('/api/admin/users', {
      token,
    }),

  updateUserRole: (token: string, id: string, role: 'Admin' | 'User') =>
    request<void>(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ role }),
    }),
}
