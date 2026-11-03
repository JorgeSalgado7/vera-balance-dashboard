import { ValidateGetUserByIdDomainService } from '../../../domain/services/validate-get-user-by-id.domain-service'
import type { GetUserByIdActor } from '../../../domain/services/validate-get-user-by-id.domain-service'
import { UserConsultationNotAllowedError } from '../../../domain/errors/user-consultation-not-allowed.error'
import { UserEntity } from '../../../domain/entities/user.entity'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'

const user = Object.assign(new UserEntity(), { pk: 'user-1', clinic: 'clinic-1' })

describe('ValidateGetUserByIdDomainService', () => {
  const domain = new ValidateGetUserByIdDomainService()

  it.each(['Activo', 'Inactivo'] as const)('allows admin to consult a user with status %s and any clinic', (status) => {
    expect(() => domain.execute({ id: 'admin-1', role: USER_ROLES.ADMIN, clinic: null }, Object.assign(new UserEntity(), user, { clinic: 'other-clinic', status }))).not.toThrow()
  })

  it('allows a clinic to consult users associated with its clinic', () => {
    expect(() => domain.execute({ id: 'clinic-user', role: USER_ROLES.CLINIC, clinic: 'clinic-1' }, user)).not.toThrow()
  })

  it('allows a therapist to consult its own user', () => {
    expect(() => domain.execute({ id: 'user-1', role: USER_ROLES.THERAPIST, clinic: 'clinic-1' }, user)).not.toThrow()
  })

  it.each([
    [{ id: 'clinic-user', role: USER_ROLES.CLINIC, clinic: 'other-clinic' }, user],
    [
      { id: 'clinic-user', role: USER_ROLES.CLINIC, clinic: 'clinic-1' },
      { ...user, clinic: null },
    ],
    [
      { id: 'clinic-user', role: USER_ROLES.CLINIC, clinic: null },
      { ...user, clinic: null },
    ],
    [{ id: 'therapist-2', role: USER_ROLES.THERAPIST, clinic: 'clinic-1' }, user],
  ] as [GetUserByIdActor, UserEntity][])('rejects unauthorized actor %j', (actor, target) => {
    expect(() => domain.execute(actor, target)).toThrow(UserConsultationNotAllowedError)
  })
})
