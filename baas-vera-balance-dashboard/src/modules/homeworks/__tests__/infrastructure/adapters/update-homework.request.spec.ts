import * as dynamoose from 'dynamoose'
import { homeworkEntity } from '../../fixtures/homework.fixture'
jest.mock('dynamoose', () => {
  const actual = jest.requireActual('dynamoose')
  return { ...actual, model: (name: string, schema: unknown, options: Record<string, unknown>) => actual.model(name + '-request-test', schema, { ...options, tableName: 'homeworks-test', create: false, update: false, waitForActive: false }) }
})
import { UpdateHomeworkDynamooseAdapter } from '../../../infrastructure/persistance/adapters/update-homework-dynamoose.adapter'
describe('UpdateHomework DynamoDB serialization', () => {
  const write = jest.fn()
  beforeEach(() => { jest.resetAllMocks(); dynamoose.aws.ddb.set({ updateItem: write } as never); write.mockResolvedValue({}) })
  afterAll(() => dynamoose.aws.ddb.revert())
  it('serializes the documented keys and ISO timestamps with a conditional write', async () => {
    const saved = { ...homeworkEntity(), description: 'Nueva', updated_at: '2026-11-14T00:00:00.000Z' }
    write.mockResolvedValue({ Attributes: Object.fromEntries(Object.entries(saved).map(([key, value]) => [key, { S: value }])) })
    expect(await new UpdateHomeworkDynamooseAdapter().update('homework-id', { description: saved.description }, saved.updated_at)).toEqual(saved)
    const request = write.mock.calls[0]![0]
    expect(request.Key).toEqual({ pk: { S: 'homework-id' }, sk: { S: 'HOME_WORK' } })
    expect(request.ConditionExpression).toContain('attribute_exists')
    expect(request.ReturnValues).toBe('ALL_NEW')
    expect(Object.values(request.ExpressionAttributeNames)).toEqual(expect.arrayContaining(['pk', 'description', 'updated_at']))
    expect(Object.values(request.ExpressionAttributeNames)).not.toContain('record')
    expect(Object.values(request.ExpressionAttributeNames)).not.toContain('created_at')
    expect(Object.values(request.ExpressionAttributeValues)).toContainEqual({ S: saved.updated_at })
    expect(request.TableName).toBe('homeworks-test')
    expect(write).toHaveBeenCalledTimes(1)
  })
})
