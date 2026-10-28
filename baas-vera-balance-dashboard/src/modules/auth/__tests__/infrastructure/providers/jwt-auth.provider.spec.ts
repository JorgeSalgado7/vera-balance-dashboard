import { AuthenticationRegistry } from '@nestjs/authentication'
import { JwtAuthProvider } from '../../../infrastructure/providers/jwt-auth.provider'
import type { IUserRepository } from '../../../../users/domain/repositories/user.repository'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'

// AuthenticationRegistry is supplied by the authentication module; no token or database I/O is needed here.
describe('JwtAuthProvider', () => {
  const findById = jest.fn()
  const registerProvider = jest.fn()
  let provider: JwtAuthProvider

  beforeEach(() => {
    jest.resetAllMocks()
    provider = new JwtAuthProvider({ findById } as unknown as IUserRepository, { registerProvider } as unknown as AuthenticationRegistry)
  })

  it('registers itself as an authentication provider', () => {
    expect(registerProvider).toHaveBeenCalledWith(provider)
    expect(registerProvider).toHaveBeenCalledTimes(1)
  })

  it.each([undefined, ''])('rejects a token without subject (%s) before querying persistence', async (sub) => {
    await expect(provider.validate({ sub })).resolves.toBeNull()
    expect(findById).not.toHaveBeenCalled()
  })

  it('rejects a user that no longer exists', async () => {
    findById.mockResolvedValue(null)
    await expect(provider.validate({ sub: 'user-1' })).resolves.toBeNull()
    expect(findById).toHaveBeenCalledWith('user-1')
  })

  it('rejects an inactive user even with a valid token subject', async () => {
    findById.mockResolvedValue({ pk: 'user-1', status: 'Inactivo' })
    await expect(provider.validate({ sub: 'user-1' })).resolves.toBeNull()
  })

  it.each([USER_ROLES.ADMIN, USER_ROLES.CLINIC, USER_ROLES.THERAPIST])('loads current identity and role %s from persistence without exposing credentials', async (role) => {
    findById.mockResolvedValue({ pk: 'user-1', role, clinic: role === USER_ROLES.ADMIN ? null : 'clinic-1', status: 'Activo', password: 'sensitive-hash', email: 'private@example.com' })
    await expect(provider.validate({ sub: 'user-1' })).resolves.toEqual({ id: 'user-1', role, clinic: role === USER_ROLES.ADMIN ? null : 'clinic-1' })
  })

  it('propagates storage failures rather than treating them as missing users', async () => {
    const error = new Error('Storage unavailable')
    findById.mockRejectedValue(error)
    await expect(provider.validate({ sub: 'user-1' })).rejects.toBe(error)
  })
})
