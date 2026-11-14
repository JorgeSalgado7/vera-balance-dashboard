import * as dynamoose from 'dynamoose'
import { recordEntity } from '../../fixtures/record.fixture'
jest.mock('dynamoose', () => {
  const actual = jest.requireActual('dynamoose')
  return { ...actual, model: (name: string, schema: unknown, options: Record<string, unknown>) => actual.model(name + '-request-test', schema, { ...options, tableName: 'records-test', create: false, update: false, waitForActive: false }) }
})
import { UpdateRecordDynamooseAdapter } from '../../../infrastructure/persistance/adapters/update-record-dynamoose.adapter'
describe('UpdateRecord DynamoDB serialization', () => {
  const write = jest.fn()
  beforeEach(() => { jest.resetAllMocks(); dynamoose.aws.ddb.set({ updateItem: write } as never) })
  afterAll(() => dynamoose.aws.ddb.revert())
  it('uses an existence condition and updates notes to NULL without deleting the process or keys', async () => {
    const saved = { ...recordEntity(), resume: 'Nueva nota', tools: null, updated_at: '2026-11-14T00:00:00.000Z' }
    write.mockResolvedValue({ Attributes: Object.fromEntries(Object.entries(saved).map(([key, value]) => [key, value === null ? { NULL: true } : { S: value }])) })
    expect(await new UpdateRecordDynamooseAdapter().update('record-id', { resume: saved.resume, tools: null }, saved.updated_at)).toEqual(saved)
    const request = write.mock.calls[0]![0]
    expect(request.Key).toEqual({ pk: { S: 'record-id' }, sk: { S: 'RECORD' } })
    expect(request.ConditionExpression).toContain('attribute_exists')
    expect(request.ReturnValues).toBe('ALL_NEW')
    expect(Object.values(request.ExpressionAttributeNames)).toEqual(expect.arrayContaining(['pk', 'resume', 'tools', 'updated_at']))
    expect(Object.values(request.ExpressionAttributeNames)).not.toContain('created_at')
    expect(Object.values(request.ExpressionAttributeNames)).not.toContain('therapeutic_process')
    expect(Object.values(request.ExpressionAttributeValues)).toContainEqual({ NULL: true })
    expect(Object.values(request.ExpressionAttributeValues)).toContainEqual({ S: saved.updated_at })
  })
})
