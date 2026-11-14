import * as dynamoose from 'dynamoose'
import { recordEntity } from '../../fixtures/record.fixture'
jest.mock('dynamoose', () => {
  const actual = jest.requireActual('dynamoose')
  return { ...actual, model: (name: string, schema: unknown, options: Record<string, unknown>) => actual.model(name + '-request-test', schema, { ...options, tableName: 'records-test', create: false, update: false, waitForActive: false }) }
})
import { CreateRecordDynamooseAdapter } from '../../../infrastructure/persistance/adapters/create-record-dynamoose.adapter'
describe('CreateRecord DynamoDB serialization', () => {
  const write = jest.fn()
  beforeEach(() => { jest.resetAllMocks(); dynamoose.aws.ddb.set({ putItem: write } as never); write.mockResolvedValue({}) })
  afterAll(() => dynamoose.aws.ddb.revert())
  it('writes the documented item, ISO strings and DynamoDB nulls with no overwrite', async () => {
    const entity = recordEntity()
    await new CreateRecordDynamooseAdapter().create(entity)
    const request = write.mock.calls[0]![0]
    expect(request.TableName).toBe('records-test')
    expect(request.ConditionExpression).toContain('attribute_not_exists')
    expect(request.Item).toEqual(Object.fromEntries(Object.entries(entity).map(([key, value]) => [key, value === null ? { NULL: true } : { S: value }])))
    expect(write).toHaveBeenCalledTimes(1)
  })
})
