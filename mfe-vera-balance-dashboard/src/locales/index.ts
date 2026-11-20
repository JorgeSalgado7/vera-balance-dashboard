import { clinicDetail } from './clinics/clinic-detail'
import { breadcrumb } from './dashboard/breadcrumb'
import { header } from './dashboard/header'
import { sideMenu } from './dashboard/side-menu'
import { api } from './api'
import { login } from './auth/login'
import { passwordRecovery } from './auth/password-recovery'

export const locales = {
  clinics: clinicDetail,
  dashboard: {
    breadcrumb,
    header,
    sideMenu,
  },
  api,
  auth: {
    login,
    passwordRecovery,
  },
} as const
