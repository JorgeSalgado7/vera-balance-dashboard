import { authorizeRole } from '../../../../shared/authorization/authorize-role'
import { USER_ROLES } from '../../../../constants/user-roles.constant'
import type { UserRole } from '../../../../constants/user-roles.constant'
import type { UserEntity } from '../entities/user.entity'
import type { UpdateUserChanges } from '../interfaces/update-user-changes'
import { UserUpdateNotAllowedError } from '../errors/user-update-not-allowed.error'

export interface UpdateUserActor {
  id: string
  role: UserRole
  clinic: string | null
}

export class ValidateUpdateUserAccessDomainService {
  execute(actor: UpdateUserActor, user: UserEntity, changes: UpdateUserChanges): void {
    const unchangedEmail = changes.email === undefined || (typeof changes.email === 'string' && changes.email.trim().toLowerCase() === user.email.trim().toLowerCase())
    const unchangedRole = changes.role === undefined || changes.role === user.role
    const unchangedClinic = changes.clinic === undefined || changes.clinic === user.clinic
    const profileOnly = unchangedEmail && unchangedRole && unchangedClinic

    authorizeRole(
      actor.role,
      {
        [USER_ROLES.ADMIN]: true,
        [USER_ROLES.CLINIC]: profileOnly && actor.clinic !== null && actor.clinic === user.clinic,
        [USER_ROLES.THERAPIST]: profileOnly && actor.id === user.pk,
      },
      new UserUpdateNotAllowedError(),
    )
  }
}
