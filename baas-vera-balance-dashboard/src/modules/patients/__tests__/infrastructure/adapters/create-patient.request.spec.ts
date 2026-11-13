import { patient } from '../../fixtures/patient.fixture'
import * as dynamoose from 'dynamoose'
import { CreatePatientDynamooseAdapter } from '../../../infrastructure/persistance/adapters/create-patient-dynamoose.adapter'

jest.mock('dynamoose', () => {
  const actual = jest.requireActual('dynamoose')
  return { ...actual, model: (_name: string, schema: unknown, options: Record<string, unknown>) => actual.model('patients-create-request-test', schema, { ...options, create: false, update: false, waitForActive: false }) }
})

describe('CreatePatient real DynamoDB requests', () => {
  const putItem = jest.fn()
  const adapter = new CreatePatientDynamooseAdapter()
  beforeEach(() => {
    jest.resetAllMocks()
    dynamoose.aws.ddb.set({ putItem } as never)
    putItem.mockResolvedValue({})
  })
  afterAll(() => dynamoose.aws.ddb.revert())
  it('serializes nullable optional values and preserves the documented keys and dates', async () => {
    await adapter.create(patient())
    const request = putItem.mock.calls[0][0]
    expect(request.Item.pk).toEqual({ S: 'patient-id' })
    expect(request.Item.sk).toEqual({ S: 'PATIENT' })
    expect(request.Item.gsi2pk).toEqual({ S: 'CLINIC#clinic-id' })
    expect(request.Item.guardian).toEqual({ NULL: true })
    expect(request.Item.partner_data).toEqual({ NULL: true })
    expect(request.Item.phone_number).toEqual({ NULL: true })
    expect(request.Item.birthday).toEqual({ S: patient().birthday })
    expect(request.Item.created_at).toEqual({ S: patient().created_at })
    expect(request.ConditionExpression).toContain('attribute_not_exists')
  })
  it('serializes complete nested guardian and partner objects', async () => {
    const guardian = { name: 'Tutor', phone_number: '555', relationship: 'Madre' }
    const partner_data = { name: 'Pareja', relationship_time: '2 años', occupation: 'Docente' }
    await adapter.create({ ...patient(), guardian, partner_data })
    const request = putItem.mock.calls[0][0]
    expect(dynamoose.aws.converter().unmarshall(request.Item)).toMatchObject({ guardian, partner_data })
  })
})
