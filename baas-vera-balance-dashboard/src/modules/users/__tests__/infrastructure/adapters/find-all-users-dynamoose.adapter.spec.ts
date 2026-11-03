import { FindAllUsersDynamooseAdapter } from '../../../infrastructure/adapters/find-all-users-dynamoose.adapter'
import { UserModel } from '../../../infrastructure/models/user.model'
import { UserEntity } from '../../../domain/entities/user.entity'

jest.mock('../../../infrastructure/models/user.model', () => ({ UserModel: { query: jest.fn(), scan: jest.fn() } }))

describe('FindAllUsersDynamooseAdapter', () => {
  const query = jest.mocked(UserModel.query)
  const chain = { eq: jest.fn(), using: jest.fn(), attributes: jest.fn(), startAt: jest.fn(), exec: jest.fn() }
  let adapter: FindAllUsersDynamooseAdapter

  beforeEach(() => {
    jest.resetAllMocks()
    chain.eq.mockReturnValue(chain)
    chain.using.mockReturnValue(chain)
    chain.attributes.mockReturnValue(chain)
    chain.startAt.mockReturnValue(chain)
    query.mockReturnValue(chain as never)
    adapter = new FindAllUsersDynamooseAdapter()
  })

  it('queries only the USER partition in GSI1 without scanning or loading password attributes', async () => {
    chain.exec.mockResolvedValue([{ pk: 'user-1', name: 'User', clinic: null }])
    const result = await adapter.findAll()
    expect(query).toHaveBeenCalledWith('gsi1pk')
    expect(chain.eq).toHaveBeenCalledWith('USER')
    expect(chain.using).toHaveBeenCalledWith('GSI1')
    expect(chain.attributes).toHaveBeenCalledWith(['pk', 'sk', 'name', 'email', 'professional_license', 'role', 'status', 'clinic', 'created_at', 'updated_at'])
    expect(UserModel.scan).not.toHaveBeenCalled()
    expect(result[0]).toBeInstanceOf(UserEntity)
    expect(result[0]).toMatchObject({ pk: 'user-1', clinic: null })
    expect(chain.startAt).not.toHaveBeenCalled()
  })

  it('follows every LastEvaluatedKey, including an empty intermediate page', async () => {
    const firstKey = { pk: 'user-1', sk: 'USER', gsi1pk: 'USER', gsi1sk: 'USER#user-1' }
    const secondKey = { pk: 'user-2', sk: 'USER', gsi1pk: 'USER', gsi1sk: 'USER#user-2' }
    chain.exec
      .mockResolvedValueOnce(Object.assign([{ pk: 'user-1' }], { lastKey: firstKey }))
      .mockResolvedValueOnce(Object.assign([], { lastKey: secondKey }))
      .mockResolvedValueOnce([{ pk: 'user-3' }])
    const result = await adapter.findAll()
    expect(result.map((user) => user.pk)).toEqual(['user-1', 'user-3'])
    expect(chain.exec).toHaveBeenCalledTimes(3)
    expect(chain.startAt).toHaveBeenNthCalledWith(1, firstKey)
    expect(chain.startAt).toHaveBeenNthCalledWith(2, secondKey)
    expect(query).toHaveBeenCalledTimes(3)
    expect(UserModel.scan).not.toHaveBeenCalled()
  })

  it('returns an empty array for an empty final page', async () => {
    chain.exec.mockResolvedValue([])
    await expect(adapter.findAll()).resolves.toEqual([])
  })

  it('propagates a failure on a later page without returning a partial collection', async () => {
    const error = new Error('Next page unavailable')
    chain.exec.mockResolvedValueOnce(Object.assign([{ pk: 'user-1' }], { lastKey: { pk: 'user-1' } })).mockRejectedValueOnce(error)
    await expect(adapter.findAll()).rejects.toBe(error)
  })
})
