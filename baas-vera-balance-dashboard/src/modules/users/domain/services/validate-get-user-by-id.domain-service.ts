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
    if (actor.role === USER_ROLES.ADMIN) {
      return
    }

    if (actor.role === USER_ROLES.CLINIC && actor.clinic !== null && actor.clinic === user.clinic) {
      return
    }

    if (actor.role === USER_ROLES.THERAPIST && actor.id === user.pk) {
      return
    }

    throw new UserConsultationNotAllowedError()
  }
}
