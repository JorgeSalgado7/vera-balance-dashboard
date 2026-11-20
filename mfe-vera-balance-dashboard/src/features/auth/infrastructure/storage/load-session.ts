import type { AuthSession } from '../../domain/entities/auth-session.entity'
import { getLocalStorageItem } from '../../../../shared/local-storage/get-local-storage-item'
import { removeLocalStorageItem } from '../../../../shared/local-storage/remove-local-storage-item'
import { SESSION_STORAGE_KEY } from './session-storage-key'

export const loadSession = (): AuthSession | null => {
  const value = getLocalStorageItem(SESSION_STORAGE_KEY)
  if (typeof value === 'object' && value !== null &&
    'accessToken' in value && typeof value.accessToken === 'string' && value.accessToken.trim() &&
    'refreshToken' in value && typeof value.refreshToken === 'string' && value.refreshToken.trim() &&
    'user' in value && typeof value.user === 'object' && value.user !== null) {
    const user = value.user
    if ('id' in user && typeof user.id === 'string' &&
      'name' in user && typeof user.name === 'string' &&
      'email' in user && typeof user.email === 'string' &&
      'role' in user && (user.role === 'admin' || user.role === 'clinic' || user.role === 'therapist') &&
      'clinic' in user && (user.clinic === null || typeof user.clinic === 'string')) {
      return {
        accessToken: value.accessToken,
        refreshToken: value.refreshToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, clinic: user.clinic },
      }
    }
  }
  removeLocalStorageItem(SESSION_STORAGE_KEY)
  return null
}
