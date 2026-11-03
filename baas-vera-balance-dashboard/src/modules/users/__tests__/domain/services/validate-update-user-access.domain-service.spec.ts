import { ValidateUpdateUserAccessDomainService } from '../../../domain/services/validate-update-user-access.domain-service'
import { UserUpdateNotAllowedError } from '../../../domain/errors/user-update-not-allowed.error'
import { UserEntity } from '../../../domain/entities/user.entity'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'

const user = Object.assign(new UserEntity(), { pk: 'user-1', role: USER_ROLES.THERAPIST, clinic: 'clinic-1', email: 'user@example.com' })
const clinic = { id: 'clinic-user', role: USER_ROLES.CLINIC, clinic: 'clinic-1' }
const therapist = { id: 'user-1', role: USER_ROLES.THERAPIST, clinic: 'clinic-1' }

describe('ValidateUpdateUserAccessDomainService', () => {
  const domain = new ValidateUpdateUserAccessDomainService()

  it('allows admin to change email, role and clinic', () => {
    expect(() => domain.execute({ id: 'admin', role: USER_ROLES.ADMIN, clinic: null }, user, { email: 'new@example.com', role: USER_ROLES.ADMIN, clinic: null })).not.toThrow()
  })

  it.each([clinic, therapist])('allows basic profile changes by %j', (actor) => {
    expect(() => domain.execute(actor, user, { name: 'New name', professional_license: '456' })).not.toThrow()
  })

  it.each([clinic, therapist])('allows an unchanged normalized email, role and clinic by %j', (actor) => {
    expect(() => domain.execute(actor, user, { email: ' USER@EXAMPLE.COM ', role: user.role, clinic: user.clinic })).not.toThrow()
  })

  it.each([clinic, therapist])('rejects email changes by %j even when combined with an allowed field', (actor) => {
    expect(() => domain.execute(actor, user, { name: 'New name', email: 'new@example.com' })).toThrow(UserUpdateNotAllowedError)
  })

  it.each([clinic, therapist])('rejects privilege changes by %j', (actor) => {
    expect(() => domain.execute(actor, user, { role: USER_ROLES.ADMIN })).toThrow(UserUpdateNotAllowedError)
    expect(() => domain.execute(actor, user, { clinic: 'other-clinic' })).toThrow(UserUpdateNotAllowedError)
    expect(() => domain.execute(actor, user, { clinic: null })).toThrow(UserUpdateNotAllowedError)
  })

  it('rejects a clinic accessing another clinic or a user without clinic', () => {
    expect(() => domain.execute({ ...clinic, clinic: 'other-clinic' }, user, { name: 'New' })).toThrow(UserUpdateNotAllowedError)
    expect(() => domain.execute({ ...clinic, clinic: null }, { ...user, clinic: null }, { name: 'New' })).toThrow(UserUpdateNotAllowedError)
  })

  it('rejects a therapist accessing another user even in the same clinic', () => {
    expect(() => domain.execute({ ...therapist, id: 'other-user' }, user, { name: 'New' })).toThrow(UserUpdateNotAllowedError)
  })
})
