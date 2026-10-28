import { FindUserByEmailDynamooseAdapter } from '../../../infrastructure/adapters/find-user-by-email-dynamoose.adapter'
import { UserModel } from '../../../infrastructure/models/user.model'
import { UserEntity } from '../../../domain/entities/user.entity'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'

jest.mock('../../../infrastructure/models/user.model', () => ({ UserModel: { query: jest.fn() } }))

describe('FindUserByEmailDynamooseAdapter', () => {
  const query = jest.mocked(UserModel.query)
  const chain = { eq: jest.fn(), using: jest.fn(), limit: jest.fn(), exec: jest.fn() }
  let adapter: FindUserByEmailDynamooseAdapter

  beforeEach(() => {
    jest.resetAllMocks()
    chain.eq.mockReturnValue(chain)
    chain.using.mockReturnValue(chain)
    chain.limit.mockReturnValue(chain)
    query.mockReturnValue(chain as never)
    adapter = new FindUserByEmailDynamooseAdapter()
  })

  it('looks up normalized email in GSI2 and maps the first matching user', async () => {
    chain.exec.mockResolvedValue([{ pk: 'user-1', email: 'user@example.com', role: USER_ROLES.ADMIN, clinic: null }])
    const result = await adapter.findByEmail('  USER@EXAMPLE.COM  ')
    expect(query).toHaveBeenCalledWith('gsi2pk')
    expect(chain.eq).toHaveBeenCalledWith('EMAIL#user@example.com')
    expect(chain.using).toHaveBeenCalledWith('GSI2')
    expect(chain.limit).toHaveBeenCalledWith(1)
    expect(chain.exec).toHaveBeenCalledTimes(1)
    expect(result).toBeInstanceOf(UserEntity)
    expect(result).toMatchObject({ pk: 'user-1', sk: 'USER', email: 'user@example.com' })
  })

  it.each([[], undefined])('returns null when the query has no user (%j)', async (items) => {
    chain.exec.mockResolvedValue(items)
    await expect(adapter.findByEmail('missing@example.com')).resolves.toBeNull()
  })

  it('propagates query errors instead of treating the email as available', async () => {
    const error = new Error('Query unavailable')
    chain.exec.mockRejectedValue(error)
    await expect(adapter.findByEmail('user@example.com')).rejects.toBe(error)
  })
})
