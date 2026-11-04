import type { UserRole } from '../../constants/user-roles.constant'

export function authorizeRole(role: UserRole, permissions: Readonly<Partial<Record<UserRole, boolean>>>, error: Error): void {
  if (permissions[role] !== true) throw error
}
