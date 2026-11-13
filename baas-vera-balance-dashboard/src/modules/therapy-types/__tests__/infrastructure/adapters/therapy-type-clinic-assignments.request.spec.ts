import * as dynamoose from 'dynamoose'
import { TherapyTypeClinicAssignmentsDynamooseAdapter } from '../../../infrastructure/persistance/adapters/therapy-type-clinic-assignments-dynamoose.adapter'

jest.mock('dynamoose', () => {
  const actual = jest.requireActual('dynamoose')
  return { ...actual, model: (_name: string, schema: unknown, options: Record<string, unknown>) => actual.model('therapy-clinic-assignments-test', schema, { ...options, create: false, update: false, waitForActive: false }) }
})

describe('Therapy clinic assignments real Query request', () => {
  const query = jest.fn()
  beforeEach(() => {
    jest.resetAllMocks()
    dynamoose.aws.ddb.set({ query } as never)
    query.mockResolvedValue({ Items: [], Count: 0, ScannedCount: 0 })
  })
  afterAll(() => dynamoose.aws.ddb.revert())

  it('serializes a Query with a server-side list membership filter, without accessing AWS', async () => {
    expect(await new TherapyTypeClinicAssignmentsDynamooseAdapter().isAssignedToClinic('therapy-id')).toBe(false)
    const request = query.mock.calls[0][0]
    expect(request.IndexName).toBe('GSI1')
    expect(request.KeyConditionExpression).toBeDefined()
    expect(request.FilterExpression).toContain('contains')
    expect(Object.values(request.ExpressionAttributeNames)).toContain('therapy_types')
    expect(Object.values(request.ExpressionAttributeValues)).toEqual(expect.arrayContaining([{ S: 'CLINIC' }, { S: 'therapy-id' }]))
  })
})
