import { FindUserByIdDynamooseAdapter } from '../../../infrastructure/adapters/find-user-by-id-dynamoose.adapter'
import { UserModel } from '../../../infrastructure/models/user.model'
import { UserEntity } from '../../../domain/entities/user.entity'

jest.mock('../../../infrastructure/models/user.model', () => ({ UserModel: { get: jest.fn() } }))

describe('FindUserByIdDynamooseAdapter', () => {
  const get = jest.mocked(UserModel.get)
  const adapter = new FindUserByIdDynamooseAdapter()
  beforeEach(() => jest.resetAllMocks())

  it('uses both primary keys and maps the persisted user', async () => {
    get.mockResolvedValue({ pk: 'user-1', name: 'User', email: 'user@example.com', clinic: 'clinic-1' } as never)
    const result = await adapter.findById('user-1')
    expect(get).toHaveBeenCalledWith({ pk: 'user-1', sk: 'USER' })
    expect(result).toBeInstanceOf(UserEntity)
    expect(result).toMatchObject({ pk: 'user-1', name: 'User', clinic: 'clinic-1' })
  })

  it('returns null when the user does not exist', async () => {
    get.mockResolvedValue(undefined as never)
    await expect(adapter.findById('missing')).resolves.toBeNull()
  })

  it('propagates database failures', async () => {
    const error = new Error('Read unavailable')
    get.mockRejectedValue(error as never)
    await expect(adapter.findById('user-1')).rejects.toBe(error)
  })
})
