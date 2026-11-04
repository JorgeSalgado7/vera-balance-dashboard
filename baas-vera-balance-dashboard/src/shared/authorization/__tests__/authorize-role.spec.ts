import { authorizeRole } from '../authorize-role'
import { USER_ROLES } from '../../../constants/user-roles.constant'
import type { UserRole } from '../../../constants/user-roles.constant'

describe('authorizeRole', () => {
  const error = new Error('Access denied')

  it('allows an explicitly granted role', () => {
    expect(() => authorizeRole(USER_ROLES.ADMIN, { [USER_ROLES.ADMIN]: true }, error)).not.toThrow()
  })

  it.each([USER_ROLES.ADMIN, USER_ROLES.CLINIC, USER_ROLES.THERAPIST])('denies %s when omitted or false', (role) => {
    expect(() => authorizeRole(role, {}, error)).toThrow(error)
    expect(() => authorizeRole(role, { [role]: false }, error)).toThrow(error)
  })

  it('uses the resource condition provided by the caller', () => {
    expect(() => authorizeRole(USER_ROLES.CLINIC, { [USER_ROLES.CLINIC]: true }, error)).not.toThrow()
    expect(() => authorizeRole(USER_ROLES.CLINIC, { [USER_ROLES.CLINIC]: false }, error)).toThrow(error)
  })

  it.each(['unknown', 'constructor', '__proto__'])('denies unknown role %s', (role) => {
    expect(() => authorizeRole(role as UserRole, { [USER_ROLES.ADMIN]: true }, error)).toThrow(error)
  })
})
