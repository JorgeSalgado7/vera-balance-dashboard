import { Test } from '@nestjs/testing'
import { PasswordHasher } from '@nestjs/authentication'
import { CreateUserUseCase } from '../modules/users/application/use-cases/create-user.use-case'
import { PasswordHashService } from '../modules/auth/infrastructure/services/password-hash.service'
import { AppModule } from '../app.module'

jest.mock('../modules/users/infrastructure/persistance/models/user.model', () => ({ UserModel: {} }))

describe('AppModule composition', () => {
  it('composes public endpoints and password hashing without JWT configuration', async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile()
    expect(module.get(CreateUserUseCase)).toBeInstanceOf(CreateUserUseCase)
    expect(module.get('IHashPasswordService')).toBe(module.get(PasswordHashService))
    expect(module.get(PasswordHasher)).toBeInstanceOf(PasswordHasher)
    await module.close()
  })
})
