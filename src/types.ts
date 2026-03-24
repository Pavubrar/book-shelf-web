export type User = {
  id: string
  email: string
  displayName: string
  roles: string[]
}

export type AuthResponse = {
  token: string
  expiresAtUtc: string
  user: User
}

export type AuthProvider = {
  name: string
  displayName: string
  isConfigured: boolean
}

export type ForgotPasswordResponse = {
  message: string
  resetToken?: string | null
}

export type Book = {
  id: string
  title: string
  author: string
  description: string
  category: string
  publishedOn?: string | null
  pdfFileUrl?: string | null
  audioFileUrl?: string | null
  createdAtUtc: string
  updatedAtUtc: string
  uploadedById: string
  uploadedByName: string
}

export type AdminUser = {
  id: string
  email: string
  displayName: string
  roles: string[]
  createdAtUtc: string
}
