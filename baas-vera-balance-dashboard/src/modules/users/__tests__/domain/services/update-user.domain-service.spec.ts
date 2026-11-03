import { UpdateUserDomainService } from '../../../domain/services/update-user.domain-service'
import type { UpdateUserChanges } from '../../../domain/interfaces/update-user-changes'
import { EmptyUserUpdateError } from '../../../domain/errors/empty-user-update.error'
import { InvalidUserUpdateFieldsError } from '../../../domain/errors/invalid-user-update-fields.error'
import {
  MissingUserNameError,
  MissingUserEmailError,
  InvalidUserEmailError,
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
    const input = { name: ' User ', email: ' NEW@EXAMPLE.COM ', professional_license: ' 456 ' }
    expect(domain.execute(user, input)).toEqual({ name: 'User', email: 'new@example.com', professional_license: '456' })
    expect(input.name).toBe(' User ')
    expect(user.name).toBeUndefined()
  })

  it('supports an authorized role/clinic transition and explicit null', () => {
    expect(domain.execute(user, { role: USER_ROLES.ADMIN, clinic: null })).toEqual({ role: USER_ROLES.ADMIN, clinic: null })
    expect(domain.execute({ ...user, role: USER_ROLES.ADMIN, clinic: null }, { role: USER_ROLES.CLINIC, clinic })).toEqual({ role: USER_ROLES.CLINIC, clinic })
  })

  it('preserves missing fields and skips explicit undefined values', () => {
    expect(domain.execute(user, { name: 'New', email: undefined })).toEqual({ name: 'New' })
    expect(domain.execute(user, { clinic })).toEqual({ clinic })
    expect(domain.execute(user, { role: USER_ROLES.THERAPIST })).toEqual({ role: USER_ROLES.THERAPIST })
  })

  it.each([{}, { name: undefined }])('rejects an empty patch (%j)', (input) => {
    expect(() => domain.execute(user, input)).toThrow(EmptyUserUpdateError)
  })

  it.each(['password', 'status', 'pk', 'sk', 'created_at', 'updated_at', 'gsi1pk', 'gsi2pk', 'gsi3pk'])('rejects protected field %s', (field) => {
    expect(() => domain.execute(user, { name: 'New', [field]: 'forged' })).toThrow(InvalidUserUpdateFieldsError)
  })

  it.each([
    [{ name: ' ' }, MissingUserNameError],
    [{ name: null }, MissingUserNameError],
    [{ email: '' }, MissingUserEmailError],
    [{ email: null }, MissingUserEmailError],
    [{ email: 'invalid' }, InvalidUserEmailError],
    [{ professional_license: '' }, MissingUserProfessionalLicenseError],
    [{ professional_license: null }, MissingUserProfessionalLicenseError],
    [{ role: 'owner' }, InvalidUserRoleError],
    [{ role: null }, InvalidUserRoleError],
    [{ clinic: 'invalid' }, InvalidUserClinicError],
    [{ clinic: 123 }, InvalidUserClinicError],
    [{ clinic: null }, InvalidUserClinicError],
    [{ role: USER_ROLES.ADMIN }, InvalidUserClinicError],
  ] as const)('rejects invalid data %j', (input, ErrorType) => {
    expect(() => domain.execute(user, input as UpdateUserChanges)).toThrow(ErrorType)
  })
})
