import { patient } from '../../fixtures/patient.fixture'
import * as dynamoose from 'dynamoose'
import { UpdatePatientDynamooseAdapter } from '../../../infrastructure/persistance/adapters/update-patient-dynamoose.adapter'

jest.mock('dynamoose', () => {
  const actual = jest.requireActual('dynamoose')
  return { ...actual, model: (_name: string, schema: unknown, options: Record<string, unknown>) => actual.model('patients-update-request-test', schema, { ...options, create: false, update: false, waitForActive: false }) }
})

describe('UpdatePatient real DynamoDB requests', () => {
  const updateItem = jest.fn()
  const adapter = new UpdatePatientDynamooseAdapter()
  beforeEach(() => {
    jest.resetAllMocks()
    dynamoose.aws.ddb.set({ updateItem } as never)
    updateItem.mockResolvedValue({ Attributes: dynamoose.aws.converter().marshall({ ...patient(), guardian: null, partner_data: null, phone_number: null }) })
  })
  afterAll(() => dynamoose.aws.ddb.revert())
  it('serializes nullable optional values and preserves the documented keys and dates', async () => {
    await adapter.update(patient(), { guardian: null, partner_data: null, phone_number: null }, '2026-11-12T10:30:00.000Z')
    const request = updateItem.mock.calls[0][0]
    expect(request.Key).toEqual({ pk: { S: 'patient-id' }, sk: { S: 'PATIENT' } })
    expect(request.ConditionExpression).toContain('attribute_exists')
    expect(Object.values(request.ExpressionAttributeValues)).toContainEqual({ NULL: true })
    expect(Object.values(request.ExpressionAttributeValues)).toContainEqual({ S: patient().updated_at })
    expect(Object.values(request.ExpressionAttributeNames)).not.toContain('clinic')
    expect(Object.values(request.ExpressionAttributeNames)).not.toContain('gsi2pk')
    expect(Object.values(request.ExpressionAttributeNames)).not.toContain('created_at')
  })
  it('serializes complete nested guardian and partner objects', async () => {
    const guardian = { name: 'Tutor', phone_number: '555', relationship: 'Madre' }
    const partner_data = { name: 'Pareja', relationship_time: '2 años', occupation: 'Docente' }
    await adapter.update(patient(), { guardian, partner_data }, '2026-11-12T10:30:00.000Z')
    const request = updateItem.mock.calls[0][0]
    expect(Object.values(request.ExpressionAttributeValues)).toContainEqual(dynamoose.aws.converter().marshall({ guardian }).guardian)
    expect(Object.values(request.ExpressionAttributeValues)).toContainEqual(dynamoose.aws.converter().marshall({ partner_data }).partner_data)
  })
})
