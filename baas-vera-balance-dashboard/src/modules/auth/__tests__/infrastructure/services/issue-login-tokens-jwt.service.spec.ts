import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { IssueLoginTokensJwtService } from '../../../infrastructure/services/issue-login-tokens-jwt.service'

const settings = {
  JWT_ACCESS_SECRET: 'access-secret-used-only-in-tests',
  JWT_REFRESH_SECRET: 'refresh-secret-used-only-in-tests',
}

describe('IssueLoginTokensJwtService', () => {
  const jwt = new JwtService()

  it('signs distinct, expiring tokens with the real installed JWT library', async () => {
    const service = new IssueLoginTokensJwtService(jwt, new ConfigService(settings))
    const tokens = await service.issue('user-id')
    const access = await jwt.verifyAsync(tokens.access_token, { secret: settings.JWT_ACCESS_SECRET, algorithms: ['HS256'], audience: 'access' })
    const refresh = await jwt.verifyAsync(tokens.refresh_token, { secret: settings.JWT_REFRESH_SECRET, algorithms: ['HS256'], audience: 'refresh' })
    expect(access.sub).toBe('user-id')
    expect(refresh.sub).toBe('user-id')
    expect(access.exp - access.iat).toBe(300)
    expect(refresh.exp - refresh.iat).toBe(300)
    expect(Object.keys(access).sort()).toEqual(['aud', 'exp', 'iat', 'sub'])
    expect(tokens.access_token).not.toBe(tokens.refresh_token)
    await expect(jwt.verifyAsync(tokens.refresh_token, { secret: settings.JWT_ACCESS_SECRET, audience: 'access' })).rejects.toThrow()
    await expect(jwt.verifyAsync(tokens.access_token, { secret: settings.JWT_ACCESS_SECRET, clockTimestamp: access.exp + 1 })).rejects.toThrow()
  })

  it('fails when a signing secret is missing', async () => {
    const config = new ConfigService(settings)
    jest.spyOn(config, 'getOrThrow').mockImplementation(() => { throw new Error('Missing secret') })
    await expect(new IssueLoginTokensJwtService(jwt, config).issue('user-id')).rejects.toThrow('Missing secret')
  })
})
