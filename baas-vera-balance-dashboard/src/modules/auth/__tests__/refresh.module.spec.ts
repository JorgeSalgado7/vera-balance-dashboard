import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { SwaggerModule } from '@nestjs/swagger'
import { AuthModule } from '../auth.module'
import { RefreshUseCase } from '../application/use-cases/refresh.use-case'
import type { IIssueLoginTokensService } from '../domain/services/issue-login-tokens.service'
import { openApiHeader } from '../../../docs/openapi.header'

jest.mock('../../users/infrastructure/persistance/models/user.model', () => ({ UserModel: {} }))

describe('Refresh composition', () => {
  it('renews a real refresh token and documents exactly the two response fields', async () => {
    const module = await Test.createTestingModule({ imports: [AuthModule] })
      .overrideProvider(ConfigService).useValue(new ConfigService({
        JWT_ACCESS_SECRET: 'test-access-secret', JWT_REFRESH_SECRET: 'test-refresh-secret',
      })).compile()
    const app = module.createNestApplication()
    try {
      const original = await module.get<IIssueLoginTokensService>('IIssueLoginTokensService').issue('user-id')
      const result = await module.get(RefreshUseCase).execute({ refresh_token: original.refresh_token })
      expect(Object.keys(result).sort()).toEqual(['access_token', 'refresh_token'])
      const jwt = module.get(JwtService)
      for (const [token, secret, audience] of [
        [result.access_token, 'test-access-secret', 'access'],
        [result.refresh_token, 'test-refresh-secret', 'refresh'],
      ]) {
        const claims = await jwt.verifyAsync(token, { secret, audience, algorithms: ['HS256'] })
        expect(claims.sub).toBe('user-id')
        expect(claims.exp - claims.iat).toBe(300)
      }
      await expect(module.get(RefreshUseCase).execute({ refresh_token: original.access_token })).rejects.toThrow()
      const document = SwaggerModule.createDocument(app, openApiHeader)
      const operation = document.paths['/auth/refresh']!.post!
      expect(operation.operationId).toBe('refreshSession')
      expect(operation.security ?? []).toEqual([])
      expect(Object.keys(operation.responses).sort()).toEqual(['200', '400', '401', '500'])
      const schema = document.components!.schemas!.RefreshResponseDto
      expect(schema).toMatchObject({ required: ['access_token', 'refresh_token'] })
      expect(schema).not.toHaveProperty('properties.user')
      expect(schema).not.toHaveProperty('properties.token_type')
    } finally {
      await app.close()
    }
  })
})
