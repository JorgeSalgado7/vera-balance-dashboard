import { ClinicEntity } from '../../../domain/entities/clinic.entity'
const clinic = () => Object.assign(new ClinicEntity(), { pk: 'clinic-id', sk: 'CLINIC', name: 'Clínica', logo: null,
  address: 'Centro', phone_number: '555', therapy_types: [], status: 'Activo', gsi1pk: 'CLINIC', gsi1sk: 'CLINIC#clinic-id',
  created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' })
import * as dynamoose from 'dynamoose'
import { UpdateClinicDynamooseAdapter } from '../../../infrastructure/persistance/adapters/update-clinic-dynamoose.adapter'

jest.mock('dynamoose', () => {
  const actual = jest.requireActual('dynamoose')
  return { ...actual, model: (_name: string, schema: unknown, options: Record<string, unknown>) => actual.model('clinics-update-request-test', schema, { ...options, create: false, update: false, waitForActive: false }) }
})
describe('UpdateClinic real DynamoDB request', () => {
  const updateItem = jest.fn()
  const adapter = new UpdateClinicDynamooseAdapter()
  beforeEach(() => {
    jest.resetAllMocks()
    dynamoose.aws.ddb.set({ updateItem } as never)
    updateItem.mockResolvedValue({ Attributes: dynamoose.aws.converter().marshall({ ...clinic(), logo: null, therapy_types: [] }) })
  })
  afterAll(() => dynamoose.aws.ddb.revert())
  it('serializes null and empty therapy selections and preserves immutable fields with a conditional write', async () => {
    await adapter.update(clinic(), { logo: null, therapy_types: [] }, '2026-11-12T10:30:00.000Z')
    const request = updateItem.mock.calls[0][0]
    expect(request.Key).toEqual({ pk: { S: 'clinic-id' }, sk: { S: 'CLINIC' } })
    expect(request.ConditionExpression).toContain('attribute_exists')
    expect(Object.values(request.ExpressionAttributeValues)).toEqual(expect.arrayContaining([{ NULL: true }, { L: [] }, { S: clinic().updated_at }, { S: '2026-11-12T10:30:00.000Z' }]))
    expect(Object.values(request.ExpressionAttributeNames)).not.toContain('created_at')
    expect(Object.values(request.ExpressionAttributeNames)).not.toContain('gsi1pk')
    expect(Object.values(request.ExpressionAttributeNames)).not.toContain('name')
  })
})
