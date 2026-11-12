import { Test, type TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { SwaggerModule } from '@nestjs/swagger'
import { AuthModule } from '../auth.module'
import { LogoutController } from '../presentation/http/controllers/logout.controller'
import type { IIssueLoginTokensService } from '../domain/services/issue-login-tokens.service'
import { RefreshUseCase } from '../application/use-cases/refresh.use-case'
import { openApiHeader } from '../../../docs/openapi.header'
import { HttpProblem } from '../../../shared/http-problem/http-problem.util'

jest.mock('../../users/infrastructure/persistance/models/user.model', () => ({ UserModel: {} }))

describe('Logout composition', () => {
  let module: TestingModule
  let controller: LogoutController

  beforeAll(async () => {
    module = await Test.createTestingModule({ imports: [AuthModule] })
      .overrideProvider(ConfigService).useValue(new ConfigService({
        JWT_ACCESS_SECRET: 'test-access-secret', JWT_REFRESH_SECRET: 'test-refresh-secret',
      })).compile()
    controller = module.get(LogoutController)
  })

  afterAll(async () => { await module.close() })

  it('accepts a valid access token without revoking either token', async () => {
    const tokens = await module.get<IIssueLoginTokensService>('IIssueLoginTokensService').issue('user-id')
    await expect(controller.execute(`Bearer ${tokens.access_token}`)).resolves.toBeUndefined()
    await expect(controller.execute(`bearer ${tokens.access_token}`)).resolves.toBeUndefined()
    await expect(module.get(JwtService).verifyAsync(tokens.access_token, {
      secret: 'test-access-secret', audience: 'access', algorithms: ['HS256'],
    })).resolves.toMatchObject({ sub: 'user-id' })
    await expect(module.get(RefreshUseCase).execute({ refresh_token: tokens.refresh_token })).resolves.toHaveProperty('access_token')
  })

  it.each([undefined, '', 'Bearer', 'Basic credentials', 'Bearer first second', 'Bearer malformed-token'])('rejects invalid authorization %p with 401', async header => {
    await expect(controller.execute(header)).rejects.toMatchObject({
      response: expect.objectContaining({ status: 401, instance: '/auth/logout' }),
    })
  })

  it('rejects refresh tokens on logout', async () => {
    const tokens = await module.get<IIssueLoginTokensService>('IIssueLoginTokensService').issue('user-id')
    await expect(controller.execute(`Bearer ${tokens.refresh_token}`)).rejects.toBeInstanceOf(HttpProblem)
  })

  it('rejects expired access tokens with 401', async () => {
    const token = await module.get(JwtService).signAsync({ sub: 'user-id' }, {
      secret: 'test-access-secret', audience: 'access', expiresIn: -1,
    })
    await expect(controller.execute(`Bearer ${token}`)).rejects.toMatchObject({ response: expect.objectContaining({ status: 401 }) })
  })

  it('documents Bearer security only for logout, with 204 and no body', async () => {
    const app = module.createNestApplication()
    try {
      const document = SwaggerModule.createDocument(app, openApiHeader)
      const operation = document.paths['/auth/logout']!.post!
      expect(operation.operationId).toBe('logout')
      expect(operation.security).toEqual([{ bearerAuth: [] }])
      expect(Object.keys(operation.responses).sort()).toEqual(['204', '401', '500'])
      expect(operation.responses['204']).not.toHaveProperty('content')
      expect(operation).not.toHaveProperty('requestBody')
      expect(document.security ?? []).toEqual([])
      expect(document.paths['/auth/login']!.post!.security ?? []).toEqual([])
      expect(document.paths['/auth/refresh']!.post!.security ?? []).toEqual([])
    } finally {
      await app.close()
    }
  })
})
