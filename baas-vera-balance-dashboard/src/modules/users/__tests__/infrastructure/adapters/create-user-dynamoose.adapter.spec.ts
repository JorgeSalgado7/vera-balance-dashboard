import { CreateUserDynamooseAdapter } from '../../../infrastructure/adapters/create-user-dynamoose.adapter'
import { UserModel } from '../../../infrastructure/models/user.model'
import { UserEntity } from '../../../domain/entities/user.entity'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'

jest.mock('../../../infrastructure/models/user.model', () => ({ UserModel: { create: jest.fn() } }))

describe('CreateUserDynamooseAdapter', () => {
  const create = jest.mocked(UserModel.create)
  let adapter: CreateUserDynamooseAdapter
  let entity: UserEntity

  beforeEach(() => {
    jest.resetAllMocks()
    adapter = new CreateUserDynamooseAdapter()
    entity = Object.assign(new UserEntity(), {
      pk: 'user-1',
      name: 'User',
      email: 'user@example.com',
      password: 'hashed-password',
      professional_license: '123',
      role: USER_ROLES.THERAPIST,
      status: 'Activo',
      clinic: 'clinic-1',
      gsi1pk: 'CLINIC#clinic-1',
      gsi1sk: 'USER#user-1',
      gsi2pk: 'EMAIL#user@example.com',
      gsi2sk: 'USER#user-1',
      created_at: '2026-10-28T00:00:00.000Z',
      updated_at: '2026-10-28T00:00:00.000Z',
    })
  })

  it('persists the mapped user with overwrite protection and returns the same entity', async () => {
    const result = await adapter.create(entity)
    expect(create).toHaveBeenCalledTimes(1)
    expect(create).toHaveBeenCalledWith({ ...entity }, { overwrite: false })
    expect(result).toBe(entity)
  })

  it('omits the clinic index for a global administrator', async () => {
    entity.role = USER_ROLES.ADMIN
    entity.clinic = null
    await adapter.create(entity)
    const persisted = create.mock.calls[0][0]
    expect(persisted).not.toHaveProperty('clinic')
    expect(persisted).not.toHaveProperty('gsi1pk')
    expect(persisted).not.toHaveProperty('gsi1sk')
    expect(persisted).toMatchObject({ gsi2pk: entity.gsi2pk, gsi2sk: entity.gsi2sk })
  })

  it('propagates a failed write instead of reporting a created user', async () => {
    const error = new Error('Conditional write failed')
    create.mockRejectedValue(error)
    await expect(adapter.create(entity)).rejects.toBe(error)
  })
})
