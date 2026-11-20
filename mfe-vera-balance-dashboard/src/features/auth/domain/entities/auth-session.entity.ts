export interface AuthSession {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    name: string
    email: string
    role: 'admin' | 'clinic' | 'therapist'
    clinic: string | null
  }
}
