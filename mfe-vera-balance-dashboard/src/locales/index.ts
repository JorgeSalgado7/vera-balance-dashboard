import { api } from './api'
import { login } from './auth/login'
import { passwordRecovery } from './auth/password-recovery'

export const locales = {
  api,
  auth: {
    login,
    passwordRecovery,
  },
} as const
