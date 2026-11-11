import { CreateUserDynamooseAdapter } from '../../../infrastructure/persistance/adapters/create-user-dynamoose.adapter'
import { UserModel } from '../../../infrastructure/persistance/models/user.model'
import { UserEntity } from '../../../domain/entities/user.entity'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'

jest.mock('../../../infrastructure/persistance/models/user.model', () => ({ UserModel: { create: jest.fn() } }))

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
      gsi1pk: 'USER',
      gsi1sk: 'USER#user-1',
      gsi2pk: 'CLINIC#clinic-1',
      gsi2sk: 'USER#user-1',
      gsi3pk: 'EMAIL#user@example.com',
      gsi3sk: 'USER#user-1',
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
    expect(persisted).toHaveProperty('clinic', null)
    expect(persisted).not.toHaveProperty('gsi2pk')
    expect(persisted).not.toHaveProperty('gsi2sk')
    expect(persisted).toMatchObject({ gsi3pk: entity.gsi3pk, gsi3sk: entity.gsi3sk })
  })

  it('propagates a failed write instead of reporting a created user', async () => {
    const error = new Error('Conditional write failed')
    create.mockRejectedValue(error)
    await expect(adapter.create(entity)).rejects.toBe(error)
  })
})
