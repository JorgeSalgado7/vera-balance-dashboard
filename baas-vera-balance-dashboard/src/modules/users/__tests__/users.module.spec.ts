import { SendEmailResendService } from '../../emails/infrastructure/services/send-email-resend.service'
import { UpdateUserUseCase } from '../application/use-cases/update-user.use-case'
import { UpdateUserDynamooseAdapter } from '../infrastructure/persistance/adapters/update-user-dynamoose.adapter'
import { GetUserByIdUseCase } from '../application/use-cases/get-user-by-id.use-case'
import { GetUsersUseCase } from '../application/use-cases/get-users.use-case'
import { FindAllUsersDynamooseAdapter } from '../infrastructure/persistance/adapters/find-all-users-dynamoose.adapter'
import { Module } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { UsersModule } from '../users.module'
import { PasswordModule } from '../../auth/password.module'
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case'
import { CreateUserDomainService } from '../domain/services/create-user.domain-service'
import { ValidateCreateUserDomainService } from '../domain/services/validate-create-user.domain-service'
import { CreateUserDynamooseAdapter } from '../infrastructure/persistance/adapters/create-user-dynamoose.adapter'
import { FindUserByEmailDynamooseAdapter } from '../infrastructure/persistance/adapters/find-user-by-email-dynamoose.adapter'
import { FindUserByIdDynamooseAdapter } from '../infrastructure/persistance/adapters/find-user-by-id-dynamoose.adapter'
import type { IUserRepository } from '../domain/repositories/user.repository'
import { UserEntity } from '../domain/entities/user.entity'
import { USER_ROLES } from '../../../constants/user-roles.constant'

jest.mock('../infrastructure/persistance/models/user.model', () => ({ UserModel: {} }))
const hash = jest.fn()
@Module({
  providers: [
    { provide: 'IHashPasswordService', useValue: { hash } },
    { provide: 'IVerifyPasswordService', useValue: { verify: jest.fn() } },
  ],
  exports: ['IHashPasswordService', 'IVerifyPasswordService'],
})
class TestPasswordModule {}

describe('UsersModule', () => {
  const findAll = jest.fn()
  const create = jest.fn()
  const findByEmail = jest.fn()
  const findById = jest.fn()
  let repository: IUserRepository
  let useCase: CreateUserUseCase

  beforeEach(async () => {
    jest.resetAllMocks()
    const module = await Test.createTestingModule({ imports: [UsersModule] })
      .overrideProvider(SendEmailResendService)
      .useValue({ send: jest.fn() })
      .overrideModule(PasswordModule)
      .useModule(TestPasswordModule)
      .overrideProvider(FindAllUsersDynamooseAdapter)
      .useValue({ findAll })
      .overrideProvider(CreateUserDynamooseAdapter)
      .useValue({ create })
      .overrideProvider(FindUserByEmailDynamooseAdapter)
      .useValue({ findByEmail })
      .overrideProvider(FindUserByIdDynamooseAdapter)
      .useValue({ findById })
      .compile()
    expect(module.get(UpdateUserUseCase)).toBeInstanceOf(UpdateUserUseCase)
    expect(module.get('IUpdateUserRepository')).toBe(module.get(UpdateUserDynamooseAdapter))
    expect(module.get('IFindAllUsersRepository')).toBe(module.get(FindAllUsersDynamooseAdapter))
    expect(module.get(GetUsersUseCase)).toBeInstanceOf(GetUsersUseCase)
    expect(module.get(GetUserByIdUseCase)).toBeInstanceOf(GetUserByIdUseCase)
    repository = module.get('IUserRepository')
    useCase = module.get(CreateUserUseCase)
    expect(module.get(CreateUserDomainService)).toBeInstanceOf(CreateUserDomainService)
    expect(module.get(ValidateCreateUserDomainService)).toBeInstanceOf(ValidateCreateUserDomainService)
  })

  it('routes creation through its dedicated adapter', async () => {
    const entity = new UserEntity()
    create.mockResolvedValue(entity)
    await expect(repository.create(entity)).resolves.toBe(entity)
    expect(create).toHaveBeenCalledWith(entity)
    expect(findByEmail).not.toHaveBeenCalled()
    expect(findById).not.toHaveBeenCalled()
  })

  it('routes email lookup through its dedicated adapter', async () => {
    findByEmail.mockResolvedValue(null)
    await expect(repository.findByEmail('user@example.com')).resolves.toBeNull()
    expect(findByEmail).toHaveBeenCalledWith('user@example.com')
  })

  it('routes ID lookup through its dedicated adapter', async () => {
    findById.mockResolvedValue(null)
    await expect(repository.findById('user-1')).resolves.toBeNull()
    expect(findById).toHaveBeenCalledWith('user-1')
  })

  it('creates a user with the real use case and both real domain services', async () => {
    findByEmail.mockResolvedValue(null)
    hash.mockResolvedValue('hashed-password')
    create.mockImplementation(async (entity) => entity)
    const response = await useCase.execute(
      { name: ' User ', email: ' USER@EXAMPLE.COM ', password: 'Password123!', professional_license: ' 123 ', role: USER_ROLES.THERAPIST, clinic: '11111111-1111-4111-8111-111111111111' })
    expect(response).toMatchObject({ name: 'User', email: 'user@example.com', professional_license: '123', role: USER_ROLES.THERAPIST, status: 'Activo' })
    expect(response).not.toHaveProperty('password')
    expect(response).not.toHaveProperty('pk')
    expect(create.mock.calls[0][0]).toBeInstanceOf(UserEntity)
    expect(create.mock.calls[0][0].password).toBe('hashed-password')
  })
})
