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
    if (actor.role === USER_ROLES.ADMIN) return

    const ownClinic = actor.role === USER_ROLES.CLINIC && actor.clinic !== null && actor.clinic === user.clinic
    const ownUser = actor.role === USER_ROLES.THERAPIST && actor.id === user.pk
    if (!ownClinic && !ownUser) throw new UserUpdateNotAllowedError()

    if (changes.email !== undefined && (typeof changes.email !== 'string' || changes.email.trim().toLowerCase() !== user.email.trim().toLowerCase())) throw new UserUpdateNotAllowedError()
    if (changes.role !== undefined && changes.role !== user.role) throw new UserUpdateNotAllowedError()
    if (changes.clinic !== undefined && changes.clinic !== user.clinic) throw new UserUpdateNotAllowedError()
  }
}
