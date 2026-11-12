import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import type { JwtSignOptions } from '@nestjs/jwt'
import { VerifyAccessTokenJwtService } from '../../../infrastructure/services/verify-access-token-jwt.service'
import { InvalidAccessTokenError } from '../../../domain/errors/invalid-access-token.error'

describe('VerifyAccessTokenJwtService', () => {
  const jwt = new JwtService()
  const service = new VerifyAccessTokenJwtService(jwt, new ConfigService({ JWT_ACCESS_SECRET: 'test-access-secret' }))
  const sign = (payload: Record<string, unknown>, options: JwtSignOptions = {}) => jwt.signAsync(payload, {
    secret: 'test-access-secret', algorithm: 'HS256', audience: 'access', ...options,
  })

  it('verifies a signed access token and returns its subject', async () => {
    const token = await sign({ sub: 'user-id' }, { expiresIn: 300 })
    await expect(service.verify(token)).resolves.toBe('user-id')
  })

  it.each([
    ['expired', { sub: 'user-id' }, { expiresIn: -1 }],
    ['wrong secret', { sub: 'user-id' }, { secret: 'wrong-secret', expiresIn: 300 }],
    ['refresh audience', { sub: 'user-id' }, { audience: 'refresh', expiresIn: 300 }],
    ['wrong algorithm', { sub: 'user-id' }, { algorithm: 'HS384', expiresIn: 300 }],
    ['missing expiration', { sub: 'user-id' }, {}],
    ['missing subject', {}, { expiresIn: 300 }],
    ['empty subject', { sub: ' ' }, { expiresIn: 300 }],
    ['numeric subject', { sub: 123 }, { expiresIn: 300 }],
    ['not yet valid', { sub: 'user-id' }, { expiresIn: 300, notBefore: 60 }],
  ] as Array<[string, Record<string, unknown>, JwtSignOptions]>)('rejects %s tokens', async (_label, payload, options) => {
    const token = await sign(payload, options)
    await expect(service.verify(token)).rejects.toThrow(InvalidAccessTokenError)
  })

  it.each(['', 'not-a-jwt', 'a.b.c'])('rejects malformed token %p', async token => {
    await expect(service.verify(token)).rejects.toThrow(InvalidAccessTokenError)
  })

  it('propagates missing configuration instead of reporting invalid credentials', async () => {
    const config = new ConfigService()
    jest.spyOn(config, 'getOrThrow').mockImplementation(() => { throw new Error('Missing configuration') })
    await expect(new VerifyAccessTokenJwtService(jwt, config).verify('token')).rejects.toThrow('Missing configuration')
  })
})
