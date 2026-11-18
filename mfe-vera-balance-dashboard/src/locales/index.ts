import { login } from './auth/login'
import { passwordRecovery } from './auth/password-recovery'

export const locales = {
  auth: {
    login,
    passwordRecovery,
  },
} as const
