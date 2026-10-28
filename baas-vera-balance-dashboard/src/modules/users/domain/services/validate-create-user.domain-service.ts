import { USER_ROLES, USER_ROLE_VALUES } from '../../../../constants/user-roles.constant'
import type { UserRole } from '../../../../constants/user-roles.constant'
import { UserEntity } from '../entities/user.entity'

import {
  MissingUserNameError,
  MissingUserEmailError,
  InvalidUserEmailError,
  MissingUserPasswordError,
  MissingUserProfessionalLicenseError,
  InvalidUserRoleError,
  InvalidUserStatusError,
  InvalidUserClinicError,
} from '../errors/user.error'

export class ValidateCreateUserDomainService {
  execute(entity: UserEntity): void {
    if (!entity.name?.trim()) {
      throw new MissingUserNameError()
    }

    if (!entity.email?.trim()) {
      throw new MissingUserEmailError()
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entity.email)) {
      throw new InvalidUserEmailError()
    }

    if (!entity.password?.trim()) {
      throw new MissingUserPasswordError()
    }

    if (!entity.professional_license?.trim()) {
      throw new MissingUserProfessionalLicenseError()
    }

    if (!USER_ROLE_VALUES.includes(entity.role)) {
      throw new InvalidUserRoleError()
    }

    if (!['Activo', 'Inactivo'].includes(entity.status)) {
      throw new InvalidUserStatusError()
    }

    if (entity.clinic !== null && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(entity.clinic)) {
      throw new InvalidUserClinicError()
    }

    if (entity.role === USER_ROLES.ADMIN && entity.clinic !== null) {
      throw new InvalidUserClinicError()
    }

    if (entity.role !== USER_ROLES.ADMIN && entity.clinic === null) {
      throw new InvalidUserClinicError()
    }
  }
}
