import { USER_ROLES, USER_ROLE_VALUES } from '../../../../constants/user-roles.constant'
import { UPDATE_USER_FIELDS } from '../constants/update-user-fields.constant'
import type { UserEntity } from '../entities/user.entity'
import type { UpdateUserChanges } from '../interfaces/update-user-changes'
import { EmptyUserUpdateError } from '../errors/empty-user-update.error'
import { InvalidUserUpdateFieldsError } from '../errors/invalid-user-update-fields.error'
import { MissingUserNameError, MissingUserProfessionalLicenseError, InvalidUserRoleError, InvalidUserClinicError } from '../errors/user.error'

export class UpdateUserDomainService {
  execute(user: UserEntity, changes: UpdateUserChanges): UpdateUserChanges {
    if (Object.keys(changes).some((field) => !UPDATE_USER_FIELDS.includes(field as (typeof UPDATE_USER_FIELDS)[number]))) throw new InvalidUserUpdateFieldsError()
    if (!UPDATE_USER_FIELDS.some((field) => changes[field] !== undefined)) throw new EmptyUserUpdateError()

    const result: UpdateUserChanges = {}
    if (changes.name !== undefined) {
      if (typeof changes.name !== 'string' || !changes.name.trim()) throw new MissingUserNameError()
      result.name = changes.name.trim()
    }
    if (changes.professional_license !== undefined) {
      if (typeof changes.professional_license !== 'string' || !changes.professional_license.trim()) throw new MissingUserProfessionalLicenseError()
      result.professional_license = changes.professional_license.trim()
    }
    if (changes.role !== undefined) {
      if (!USER_ROLE_VALUES.includes(changes.role)) throw new InvalidUserRoleError()
      result.role = changes.role
    }
    if (changes.clinic !== undefined) {
      if (changes.clinic !== null && (typeof changes.clinic !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(changes.clinic)))
        throw new InvalidUserClinicError()
      result.clinic = changes.clinic
    }
    if (changes.role !== undefined || changes.clinic !== undefined) {
      const role = result.role ?? user.role
      const clinic = result.clinic === undefined ? user.clinic : result.clinic
      if ((role === USER_ROLES.ADMIN && clinic !== null) || (role !== USER_ROLES.ADMIN && clinic === null)) throw new InvalidUserClinicError()
    }
    return result
  }
}
