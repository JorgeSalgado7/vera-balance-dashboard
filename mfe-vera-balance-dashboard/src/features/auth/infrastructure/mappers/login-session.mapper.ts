import type { AuthSession } from '../../domain/entities/auth-session.entity'
import { locales } from '../../../../locales'

export const mapLoginSession = (data: unknown): AuthSession => {
  if (!data || typeof data !== 'object'
    || !('access_token' in data) || typeof data.access_token !== 'string' || !data.access_token
    || !('refresh_token' in data) || typeof data.refresh_token !== 'string' || !data.refresh_token
    || !('user' in data) || !data.user || typeof data.user !== 'object') {
    throw new Error(locales.api.requestError)
  }
  const user = data.user
  if (!('id' in user) || typeof user.id !== 'string'
    || !('name' in user) || typeof user.name !== 'string'
    || !('email' in user) || typeof user.email !== 'string'
    || !('role' in user) || (user.role !== 'admin' && user.role !== 'clinic' && user.role !== 'therapist')
    || !('clinic' in user) || (user.clinic !== null && typeof user.clinic !== 'string')) {
    throw new Error(locales.api.requestError)
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, clinic: user.clinic },
  }
}
