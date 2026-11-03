import type { UserRole } from '../../../../constants/user-roles.constant'

export interface UpdateUserChanges {
  name?: string
  email?: string
  professional_license?: string
  role?: UserRole
  clinic?: string | null
}
