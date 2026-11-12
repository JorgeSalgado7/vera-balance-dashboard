import * as dynamoose from 'dynamoose'
import { UpdateTherapyTypeDynamooseAdapter } from '../../../infrastructure/persistance/adapters/update-therapy-type-dynamoose.adapter'

jest.mock('dynamoose', () => {
  const actual = jest.requireActual('dynamoose')
  return { ...actual, model: (_name: string, schema: InstanceType<typeof dynamoose.Schema>) => actual.model('therapy-update-request-test', schema,
    { create: false, update: false, waitForActive: false }) }
})
const entity = { pk: 'therapy-id', sk: 'THERAPY_TYPE' as const, name: 'Individual', icon: null, gsi1pk: 'THERAPY_TYPE' as const, gsi1sk: 'THERAPY_TYPE#therapy-id', created_at: '2026-11-12T00:00:00.000Z', updated_at: '2026-11-12T00:00:00.000Z' }

describe('Therapy type real UpdateItem serialization', () => {
  const updateItem = jest.fn()
  beforeEach(() => {
    jest.resetAllMocks()
    dynamoose.aws.ddb.set({ updateItem } as never)
    updateItem.mockResolvedValue({ Attributes: dynamoose.aws.converter().marshall(entity) })
  })
  afterAll(() => dynamoose.aws.ddb.revert())
  it('sets explicit null and guards existence and the previously read timestamp', async () => {
    await new UpdateTherapyTypeDynamooseAdapter().update(entity, { icon: null }, '2026-11-12T01:00:00.000Z')
    const request = updateItem.mock.calls[0][0]
    expect(request.Key).toEqual({ pk: { S: entity.pk }, sk: { S: 'THERAPY_TYPE' } })
    expect(request.ConditionExpression).toContain('attribute_exists')
    expect(Object.values(request.ExpressionAttributeValues)).toContainEqual({ NULL: true })
    expect(Object.values(request.ExpressionAttributeValues)).toContainEqual({ S: entity.updated_at })
    expect(Object.values(request.ExpressionAttributeNames)).not.toContain('created_at')
    expect(Object.values(request.ExpressionAttributeNames)).not.toContain('gsi1pk')
    expect(Object.values(request.ExpressionAttributeNames)).not.toContain('name')
  })
})
