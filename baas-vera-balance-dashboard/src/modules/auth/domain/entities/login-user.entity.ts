import type { UserRole } from '../../../../constants/user-roles.constant'

export interface LoginUser {
  id: string
  name: string
  email: string
  password: string
  professional_license: string
  role: UserRole
  status: 'Activo' | 'Inactivo'
  clinic: string | null
  created_at: string
  updated_at: string
}
