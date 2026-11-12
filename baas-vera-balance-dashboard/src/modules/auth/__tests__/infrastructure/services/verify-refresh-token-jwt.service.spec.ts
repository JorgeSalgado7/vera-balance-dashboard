import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import type { JwtSignOptions } from '@nestjs/jwt'
import { VerifyRefreshTokenJwtService } from '../../../infrastructure/services/verify-refresh-token-jwt.service'
import { InvalidRefreshTokenError } from '../../../domain/errors/auth.error'

describe('VerifyRefreshTokenJwtService', () => {
  const jwt = new JwtService()
  const service = new VerifyRefreshTokenJwtService(jwt, new ConfigService({ JWT_REFRESH_SECRET: 'test-refresh-secret' }))
  const sign = (payload: Record<string, unknown>, options: JwtSignOptions = {}) => jwt.signAsync(payload, {
    secret: 'test-refresh-secret', algorithm: 'HS256', audience: 'refresh', ...options,
  })

  it('verifies a signed refresh token and returns its subject', async () => {
    const token = await sign({ sub: 'user-id' }, { expiresIn: 300 })
    await expect(service.verify(token)).resolves.toBe('user-id')
  })

  it.each([
    ['expired', { sub: 'user-id' }, { expiresIn: -1 }],
    ['wrong secret', { sub: 'user-id' }, { secret: 'wrong-secret', expiresIn: 300 }],
    ['access audience', { sub: 'user-id' }, { audience: 'access', expiresIn: 300 }],
    ['wrong algorithm', { sub: 'user-id' }, { algorithm: 'HS384', expiresIn: 300 }],
    ['missing expiration', { sub: 'user-id' }, {}],
    ['missing subject', {}, { expiresIn: 300 }],
    ['empty subject', { sub: ' ' }, { expiresIn: 300 }],
    ['numeric subject', { sub: 123 }, { expiresIn: 300 }],
    ['not yet valid', { sub: 'user-id' }, { expiresIn: 300, notBefore: 60 }],
  ] as Array<[string, Record<string, unknown>, JwtSignOptions]>)('rejects %s tokens', async (_label, payload, options) => {
    const token = await sign(payload, options)
    await expect(service.verify(token)).rejects.toThrow(InvalidRefreshTokenError)
  })

  it.each(['', 'not-a-jwt', 'a.b.c'])('rejects malformed token %p', async token => {
    await expect(service.verify(token)).rejects.toThrow(InvalidRefreshTokenError)
  })

  it('propagates missing configuration instead of reporting invalid credentials', async () => {
    const config = new ConfigService()
    jest.spyOn(config, 'getOrThrow').mockImplementation(() => { throw new Error('Missing configuration') })
    await expect(new VerifyRefreshTokenJwtService(jwt, config).verify('token')).rejects.toThrow('Missing configuration')
  })
})
