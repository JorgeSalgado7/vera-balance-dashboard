import { UpdateUserDomainService } from '../../../domain/services/update-user.domain-service'
import type { UpdateUserChanges } from '../../../domain/interfaces/update-user-changes'
import {
  EmptyUserUpdateError,
  InvalidUserUpdateFieldsError,
  MissingUserNameError,
  MissingUserProfessionalLicenseError,
  InvalidUserRoleError,
  InvalidUserClinicError,
} from '../../../domain/errors/user.error'
import { UserEntity } from '../../../domain/entities/user.entity'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'

const clinic = '11111111-1111-4111-8111-111111111111'
const user = Object.assign(new UserEntity(), { pk: 'user-1', role: USER_ROLES.THERAPIST, clinic })

describe('UpdateUserDomainService', () => {
  const domain = new UpdateUserDomainService()

  it('normalizes only supplied fields without mutating inputs or requiring unrelated fields', () => {
    const input = { name: ' User ', professional_license: ' 456 ' }
    expect(domain.execute(user, input)).toEqual({ name: 'User', professional_license: '456' })
    expect(input.name).toBe(' User ')
    expect(user.name).toBeUndefined()
  })

  it('supports an authorized role/clinic transition and explicit null', () => {
    expect(domain.execute(user, { role: USER_ROLES.ADMIN, clinic: null })).toEqual({ role: USER_ROLES.ADMIN, clinic: null })
    expect(domain.execute({ ...user, role: USER_ROLES.ADMIN, clinic: null }, { role: USER_ROLES.CLINIC, clinic })).toEqual({ role: USER_ROLES.CLINIC, clinic })
  })

  it.each([USER_ROLES.ADMIN, USER_ROLES.CLINIC, USER_ROLES.THERAPIST])('allows assigning or clearing clinic for role %s', role => {
    expect(domain.execute(user, { role, clinic })).toEqual({ role, clinic })
    expect(domain.execute(user, { role, clinic: null })).toEqual({ role, clinic: null })
    expect(domain.execute({ ...user, role }, { clinic })).toEqual({ clinic })
    expect(domain.execute({ ...user, role }, { clinic: null })).toEqual({ clinic: null })
    expect(domain.execute(user, { role })).toEqual({ role })
  })

  it('preserves missing fields and skips explicit undefined values', () => {
    expect(domain.execute(user, { name: 'New' })).toEqual({ name: 'New' })
    expect(domain.execute(user, { clinic })).toEqual({ clinic })
    expect(domain.execute(user, { role: USER_ROLES.THERAPIST })).toEqual({ role: USER_ROLES.THERAPIST })
  })

  it.each([{}, { name: undefined }])('rejects an empty patch (%j)', (input) => {
    expect(() => domain.execute(user, input)).toThrow(EmptyUserUpdateError)
  })

  it.each(['email', 'password', 'status', 'pk', 'sk', 'created_at', 'updated_at', 'gsi1pk', 'gsi2pk', 'gsi3pk'])('rejects protected field %s', (field) => {
    expect(() => domain.execute(user, { name: 'New', [field]: 'forged' })).toThrow(InvalidUserUpdateFieldsError)
  })

  it.each([
    [{ name: ' ' }, MissingUserNameError],
    [{ name: null }, MissingUserNameError],
    [{ email: '' }, InvalidUserUpdateFieldsError],
    [{ email: null }, InvalidUserUpdateFieldsError],
    [{ email: 'invalid' }, InvalidUserUpdateFieldsError],
    [{ professional_license: '' }, MissingUserProfessionalLicenseError],
    [{ professional_license: null }, MissingUserProfessionalLicenseError],
    [{ role: 'owner' }, InvalidUserRoleError],
    [{ role: null }, InvalidUserRoleError],
    [{ clinic: 'invalid' }, InvalidUserClinicError],
    [{ clinic: 123 }, InvalidUserClinicError],
  ] as const)('rejects invalid data %j', (input, ErrorType) => {
    expect(() => domain.execute(user, input as UpdateUserChanges)).toThrow(ErrorType)
  })
})
