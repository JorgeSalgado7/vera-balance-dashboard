import * as dynamoose from 'dynamoose'
import { ResetUserPasswordDynamooseAdapter } from '../../../infrastructure/persistance/adapters/reset-user-password-dynamoose.adapter'

jest.mock('dynamoose', () => {
  const actual = jest.requireActual('dynamoose')
  return { ...actual, model: (_name, schema, options) => actual.model('user-reset-password-request-test', schema, { ...options, create: false, update: false, waitForActive: false }) }
})

describe('ResetUserPassword real UpdateItem request', () => {
  const updateItem = jest.fn()
  const adapter = new ResetUserPasswordDynamooseAdapter()
  const input = { userId: 'user-id', currentPasswordHash: 'old-hash', codeHash: 'code-hash', expiresAt: '2026-11-11T00:05:00.000Z', passwordHash: 'new-hash' }
  const updatedAt = '2026-11-11T00:00:00.000Z'
  beforeEach(() => {
    jest.resetAllMocks()
    dynamoose.aws.ddb.set({ updateItem } as never)
    updateItem.mockResolvedValue({})
  })
  afterAll(() => dynamoose.aws.ddb.revert())

  it('changes the password and removes both recovery attributes in one conditional UpdateItem', async () => {
    await expect(adapter.reset(input, updatedAt)).resolves.toBe(true)
    expect(updateItem).toHaveBeenCalledTimes(1)
    const request = updateItem.mock.calls[0][0]
    expect(request.Key).toEqual({ pk: { S: 'user-id' }, sk: { S: 'USER' } })
    expect(request.UpdateExpression).toContain('SET')
    expect(request.UpdateExpression).toContain('REMOVE')
    expect(request.ConditionExpression).toContain('attribute_exists')
    expect(request.ConditionExpression).toContain(' > ')
    expect(Object.values(request.ExpressionAttributeValues)).toEqual(expect.arrayContaining([
      { S: 'old-hash' }, { S: 'new-hash' }, { S: 'code-hash' }, { S: input.expiresAt }, { S: updatedAt },
    ]))
    const names = request.ExpressionAttributeNames as Record<string, string>
    const removed = request.UpdateExpression.match(/\bREMOVE\s+(.+?)(?=\s+(?:SET|ADD|DELETE)\s|$)/)[1]
    const removedFields = (removed.match(/#[A-Za-z0-9_]+/g) ?? []).map((key: string) => names[key])
    expect(removedFields.sort()).toEqual(['password_recovery_code_hash', 'password_recovery_expires_at'])
    const conditionFields = (request.ConditionExpression.match(/#[A-Za-z0-9_]+/g) ?? []).map((key: string) => names[key])
    expect(conditionFields).toEqual(expect.arrayContaining(['pk', 'password', 'password_recovery_code_hash', 'password_recovery_expires_at']))
  })

  it('reports conditional rejection instead of consuming a changed, expired or missing code', async () => {
    updateItem.mockRejectedValue(Object.assign(new Error('condition failed'), { name: 'ConditionalCheckFailedException' }))
    await expect(adapter.reset(input, updatedAt)).resolves.toBe(false)
  })

  it('propagates database errors', async () => {
    const error = new Error('DynamoDB unavailable')
    updateItem.mockRejectedValue(error)
    await expect(adapter.reset(input, updatedAt)).rejects.toBe(error)
  })
})
