import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { PasswordHasher } from '@nestjs/authentication'
import { JwtService } from '@nestjs/jwt'
import { SwaggerModule } from '@nestjs/swagger'
import { AuthModule } from '../auth.module'
import { LoginUseCase } from '../application/use-cases/login.use-case'
import { FindUserByEmailDynamooseAdapter } from '../../users/infrastructure/persistance/adapters/find-user-by-email-dynamoose.adapter'
import { openApiHeader } from '../../../docs/openapi.header'

jest.mock('../../users/infrastructure/persistance/models/user.model', () => ({ UserModel: {} }))

describe('AuthModule', () => {
  it('composes login with Users lookup, native password verification and JWT signing', async () => {
    const hasher = new PasswordHasher()
    const password = await hasher.hash('real password')
    const findByEmail = jest.fn().mockResolvedValue({
      pk: 'user-id', name: 'User', email: 'user@example.com', password,
      professional_license: '123', role: 'therapist', status: 'Activo', clinic: null,
      created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z',
    })
    const module = await Test.createTestingModule({ imports: [AuthModule] })
      .overrideProvider(FindUserByEmailDynamooseAdapter).useValue({ findByEmail })
      .overrideProvider(ConfigService).useValue(new ConfigService({
        JWT_ACCESS_SECRET: 'test-access', JWT_REFRESH_SECRET: 'test-refresh',
      })).compile()
    const app = module.createNestApplication()
    try {
      const result = await module.get(LoginUseCase).execute({ email: ' USER@EXAMPLE.COM ', password: 'real password' })
      expect(findByEmail).toHaveBeenCalledWith('user@example.com')
      expect(result.user.id).toBe('user-id')
      expect(result.user).not.toHaveProperty('password')
      expect(result.user).not.toHaveProperty('pk')
      expect(result).not.toHaveProperty('token_type')
      expect(result.user).not.toHaveProperty('created_at')
      expect(result.user).not.toHaveProperty('updated_at')
      expect(result.user).not.toHaveProperty('professional_license')
      expect(result.user).not.toHaveProperty('status')
      expect(await module.get(JwtService).verifyAsync(result.access_token, { secret: 'test-access' })).toMatchObject({ sub: 'user-id' })
      const document = SwaggerModule.createDocument(app, openApiHeader)
      const operation = document.paths['/auth/login']!.post!
      expect(operation.operationId).toBe('login')
      expect(operation.security ?? []).toEqual([])
      expect(Object.keys(operation.responses).sort()).toEqual(['200', '400', '401', '429', '500'])
      const schemas = document.components!.schemas!
      expect(schemas.LoginResponseDto).toMatchObject({ required: ['access_token', 'refresh_token', 'user'] })
      expect(schemas.LoginResponseDto).not.toHaveProperty('properties.token_type')
      expect(schemas.LoginResponseDto).not.toHaveProperty('properties.user.allOf.0.properties.created_at')
      expect(schemas.LoginResponseDto).not.toHaveProperty('properties.user.allOf.0.properties.updated_at')
      expect(schemas.LoginResponseDto).not.toHaveProperty('properties.user.allOf.0.properties.professional_license')
      expect(schemas.LoginResponseDto).not.toHaveProperty('properties.user.allOf.0.properties.status')
      expect(schemas.LoginResponseDto).toMatchObject({
        properties: { user: { allOf: [{ required: ['id', 'name', 'email', 'role', 'clinic'] }] } },
      })
      expect(schemas).not.toHaveProperty('LoginUserResponseDto')
    } finally {
      await app.close()
    }
  }, 15000)
})
