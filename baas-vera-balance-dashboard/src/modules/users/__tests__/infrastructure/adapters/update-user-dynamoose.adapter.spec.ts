import { Condition } from 'dynamoose'
import { UpdateUserDynamooseAdapter } from '../../../infrastructure/adapters/update-user-dynamoose.adapter'
import { UserModel } from '../../../infrastructure/models/user.model'
import { UserEntity } from '../../../domain/entities/user.entity'
import { UserNotFoundError } from '../../../domain/errors/user-not-found.error'
import { UserUpdateConflictError } from '../../../domain/errors/user-update-conflict.error'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'

jest.mock('../../../infrastructure/models/user.model', () => ({ UserModel: { update: jest.fn(), get: jest.fn(), query: jest.fn(), scan: jest.fn() } }))
const user = Object.assign(new UserEntity(), { pk: 'user-1', role: USER_ROLES.THERAPIST, email: 'user@example.com', clinic: 'clinic-1', updated_at: '2026-01-01T00:00:00.000Z' })
const updatedAt = '2026-11-02T00:00:00.000Z'

describe('UpdateUserDynamooseAdapter', () => {
  const update = jest.mocked(UserModel.update),
    get = jest.mocked(UserModel.get)
  const adapter = new UpdateUserDynamooseAdapter()
  beforeEach(() => {
    jest.resetAllMocks()
    update.mockResolvedValue({ ...user, updated_at: updatedAt } as never)
  })
  afterEach(() => {
    expect(UserModel.scan).not.toHaveBeenCalled()
    expect(UserModel.query).not.toHaveBeenCalled()
  })

  it('uses UpdateItem with the primary keys, a partial SET and optimistic existence condition', async () => {
    const result = await adapter.update(user, { name: 'New' }, updatedAt)
    expect(update).toHaveBeenCalledWith({ pk: 'user-1', sk: 'USER' }, { $SET: { name: 'New', updated_at: updatedAt } }, { condition: expect.any(Condition), returnValues: 'ALL_NEW' })
    expect(result).toBeInstanceOf(UserEntity)
    expect(result.updated_at).toBe(updatedAt)
    expect(get).not.toHaveBeenCalled()
  })

  it('updates only the email field and its GSI3 partition key', async () => {
    await adapter.update(user, { email: 'new@example.com' }, updatedAt)
    expect(update.mock.calls[0][1]).toEqual({ $SET: { email: 'new@example.com', gsi3pk: 'EMAIL#new@example.com', updated_at: updatedAt } })
  })

  it('updates both clinic index keys when clinic changes', async () => {
    await adapter.update(user, { clinic: 'clinic-2' }, updatedAt)
    expect(update.mock.calls[0][1]).toEqual({ $SET: { clinic: 'clinic-2', gsi2pk: 'CLINIC#clinic-2', gsi2sk: 'USER#user-1', updated_at: updatedAt } })
  })

  it('persists clinic null and removes both GSI2 keys in the same update', async () => {
    await adapter.update(user, { role: USER_ROLES.ADMIN, clinic: null }, updatedAt)
    expect(update.mock.calls[0][1]).toEqual({ $SET: { role: USER_ROLES.ADMIN, clinic: null, updated_at: updatedAt }, $REMOVE: ['gsi2pk', 'gsi2sk'] })
  })

  it('never forwards protected fields to the update expression', async () => {
    await adapter.update(user, { name: 'New', ...{ password: 'forged', created_at: 'forged', gsi1pk: 'forged' } }, updatedAt)
    expect(update.mock.calls[0][1]).toEqual({ $SET: { name: 'New', updated_at: updatedAt } })
  })

  it('returns 404-domain error if the conditional update fails because the user was deleted', async () => {
    update.mockRejectedValue(Object.assign(new Error('condition failed'), { name: 'ConditionalCheckFailedException' }) as never)
    get.mockResolvedValue(undefined as never)
    await expect(adapter.update(user, { name: 'New' }, updatedAt)).rejects.toBeInstanceOf(UserNotFoundError)
    expect(get).toHaveBeenCalledWith({ pk: 'user-1', sk: 'USER' }, { consistent: true })
  })

  it('returns conflict if the same record changed after it was read', async () => {
    update.mockRejectedValue(Object.assign(new Error('condition failed'), { name: 'ConditionalCheckFailedException' }) as never)
    get.mockResolvedValue(user as never)
    await expect(adapter.update(user, { name: 'New' }, updatedAt)).rejects.toBeInstanceOf(UserUpdateConflictError)
  })

  it('propagates infrastructure failures without hiding the original cause', async () => {
    const error = new Error('Update unavailable')
    update.mockRejectedValue(error as never)
    await expect(adapter.update(user, { name: 'New' }, updatedAt)).rejects.toBe(error)
    expect(get).not.toHaveBeenCalled()
  })
})
