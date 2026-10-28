import { Test } from '@nestjs/testing'
import { PasswordHasher } from '@nestjs/authentication'
import { CreateUserUseCase } from '../modules/users/application/use-cases/create-user.use-case'
import { PasswordHashService } from '../modules/auth/infrastructure/services/password-hash.service'
import { JwtAuthProvider } from '../modules/auth/infrastructure/providers/jwt-auth.provider'

jest.mock('../modules/users/infrastructure/models/user.model', () => ({ UserModel: {} }))

describe('AppModule composition', () => {
  const previousSecret = process.env.JWT_ACCESS_SECRET

  afterEach(() => {
    if (previousSecret === undefined) delete process.env.JWT_ACCESS_SECRET
    else process.env.JWT_ACCESS_SECRET = previousSecret
  })

  it('composes users, authentication and the shared password hasher', async () => {
    process.env.JWT_ACCESS_SECRET = 'test-only-access-secret-with-at-least-32-characters'
    const { AppModule } = require('../app.module')
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile()
    expect(module.get(CreateUserUseCase)).toBeInstanceOf(CreateUserUseCase)
    expect(module.get(JwtAuthProvider)).toBeInstanceOf(JwtAuthProvider)
    expect(module.get('IHashPasswordService')).toBe(module.get(PasswordHashService))
    expect(module.get(PasswordHasher)).toBeInstanceOf(PasswordHasher)
    await module.close()
  })
})
