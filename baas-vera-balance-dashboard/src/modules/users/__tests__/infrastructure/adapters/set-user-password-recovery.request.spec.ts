import * as dynamoose from 'dynamoose'
import { SetUserPasswordRecoveryDynamooseAdapter } from '../../../infrastructure/persistance/adapters/set-user-password-recovery-dynamoose.adapter'

jest.mock('dynamoose', () => {
  const actual = jest.requireActual('dynamoose')
  return { ...actual, model: (_name, schema, options) => actual.model('user-recovery-request-test', schema, { ...options, create: false, update: false, waitForActive: false }) }
})

describe('SetUserPasswordRecovery real UpdateItem request', () => {
  const updateItem = jest.fn()
  const adapter = new SetUserPasswordRecoveryDynamooseAdapter()
  const input = { userId: 'user-id', currentPasswordHash: 'current-hash', codeHash: 'recovery-hash', expiresAt: '2026-11-11T00:05:00.000Z' }
  beforeEach(() => {
    jest.resetAllMocks()
    dynamoose.aws.ddb.set({ updateItem } as never)
    updateItem.mockResolvedValue({})
  })
  afterAll(() => dynamoose.aws.ddb.revert())

  it('atomically replaces recovery fields on the existing USER without changing its password', async () => {
    await expect(adapter.set(input, '2026-11-11T00:00:00.000Z')).resolves.toBe(true)
    const request = updateItem.mock.calls[0][0]
    expect(request.Key).toEqual({ pk: { S: 'user-id' }, sk: { S: 'USER' } })
    expect(request.UpdateExpression).toContain('SET')
    expect(request.ConditionExpression).toContain('attribute_exists')
    expect(Object.values(request.ExpressionAttributeNames)).toEqual(expect.arrayContaining(['password', 'password_recovery_code_hash', 'password_recovery_expires_at', 'updated_at']))
    expect(Object.values(request.ExpressionAttributeValues)).toEqual(expect.arrayContaining([{ S: 'current-hash' }, { S: 'recovery-hash' }, { S: input.expiresAt }]))
    const names = Object.fromEntries(Object.entries(request.ExpressionAttributeNames).filter(([key]) => request.UpdateExpression.includes(key)))
    expect(Object.values(names)).not.toContain('password')
    expect(Object.values(names)).not.toContain('email')
  })

  it('does not recreate a deleted user or store a code after a password change', async () => {
    updateItem.mockRejectedValue(Object.assign(new Error('condition failed'), { name: 'ConditionalCheckFailedException' }))
    await expect(adapter.set(input, '2026-11-11T00:00:00.000Z')).resolves.toBe(false)
  })

  it('propagates database failures', async () => {
    const error = new Error('DynamoDB unavailable')
    updateItem.mockRejectedValue(error)
    await expect(adapter.set(input, '2026-11-11T00:00:00.000Z')).rejects.toBe(error)
  })
})
