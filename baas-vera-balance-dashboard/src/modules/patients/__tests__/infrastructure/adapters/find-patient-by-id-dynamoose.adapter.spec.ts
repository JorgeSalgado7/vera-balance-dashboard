import { patient } from '../../fixtures/patient.fixture'
import { FindPatientByIdDynamooseAdapter } from '../../../infrastructure/persistance/adapters/find-patient-by-id-dynamoose.adapter'
import { PatientModel } from '../../../infrastructure/persistance/models/patient.model'
jest.mock('../../../infrastructure/persistance/models/patient.model', () => ({ PatientModel: { get: jest.fn() } }))
describe('FindPatientByIdDynamooseAdapter', () => {
  const model = PatientModel as unknown as { get: jest.Mock }
  const adapter = new FindPatientByIdDynamooseAdapter()
  beforeEach(() => jest.resetAllMocks())
  it('uses both primary keys with a consistent read', async () => {
    model.get.mockResolvedValue(patient())
    expect(await adapter.findById('patient-id')).toEqual(patient())
    expect(model.get).toHaveBeenCalledWith({ pk: 'patient-id', sk: 'PATIENT' }, { consistent: true })
  })
  it('returns null for a missing patient', async () => { expect(await adapter.findById('missing')).toBeNull() })
})
