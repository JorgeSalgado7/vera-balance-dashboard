import { authorizeRole } from '../../../../shared/authorization/authorize-role'
import { USER_ROLES } from '../../../../constants/user-roles.constant'
import type { UserRole } from '../../../../constants/user-roles.constant'
import type { UserEntity } from '../entities/user.entity'
import { UserConsultationNotAllowedError } from '../errors/user-consultation-not-allowed.error'

export interface GetUserByIdActor {
  id: string
  role: UserRole
  clinic: string | null
}

export class ValidateGetUserByIdDomainService {
  execute(actor: GetUserByIdActor, user: UserEntity): void {
    authorizeRole(
      actor.role,
      {
        [USER_ROLES.ADMIN]: true,
        [USER_ROLES.CLINIC]: actor.clinic !== null && actor.clinic === user.clinic,
        [USER_ROLES.THERAPIST]: actor.id === user.pk,
      },
      new UserConsultationNotAllowedError(),
    )
  }
}
