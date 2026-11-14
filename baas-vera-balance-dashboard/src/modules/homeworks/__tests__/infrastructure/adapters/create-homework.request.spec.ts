import * as dynamoose from 'dynamoose'
import { homeworkEntity } from '../../fixtures/homework.fixture'
jest.mock('dynamoose', () => {
  const actual = jest.requireActual('dynamoose')
  return { ...actual, model: (name: string, schema: unknown, options: Record<string, unknown>) => actual.model(name + '-request-test', schema, { ...options, tableName: 'homeworks-test', create: false, update: false, waitForActive: false }) }
})
import { CreateHomeworkDynamooseAdapter } from '../../../infrastructure/persistance/adapters/create-homework-dynamoose.adapter'
describe('CreateHomework DynamoDB serialization', () => {
  const write = jest.fn()
  beforeEach(() => { jest.resetAllMocks(); dynamoose.aws.ddb.set({ putItem: write } as never); write.mockResolvedValue({}) })
  afterAll(() => dynamoose.aws.ddb.revert())
  it('serializes the documented keys and ISO timestamps with a conditional write', async () => {
    const saved = homeworkEntity()
    await new CreateHomeworkDynamooseAdapter().create(saved)
    const request = write.mock.calls[0]![0]
    expect(request.ConditionExpression).toContain('attribute_not_exists')
    expect(request.Item).toEqual(Object.fromEntries(Object.entries(saved).map(([key, value]) => [key, { S: value }])))
    expect(request.TableName).toBe('homeworks-test')
    expect(write).toHaveBeenCalledTimes(1)
  })
})
