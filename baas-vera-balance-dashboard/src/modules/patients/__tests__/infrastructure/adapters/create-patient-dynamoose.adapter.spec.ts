import { patient } from '../../fixtures/patient.fixture'
import { CreatePatientDynamooseAdapter } from '../../../infrastructure/persistance/adapters/create-patient-dynamoose.adapter'
import { PatientModel } from '../../../infrastructure/persistance/models/patient.model'
jest.mock('../../../infrastructure/persistance/models/patient.model', () => ({ PatientModel: { create: jest.fn() } }))
describe('CreatePatientDynamooseAdapter', () => {
  const model = PatientModel as unknown as { create: jest.Mock }
  const adapter = new CreatePatientDynamooseAdapter()
  beforeEach(() => jest.resetAllMocks())
  it('creates only the documented persisted attributes without overwriting an existing item', async () => {
    model.create.mockResolvedValue(patient())
    expect(await adapter.create(patient())).toEqual(patient())
    expect(model.create).toHaveBeenCalledWith({ ...patient() }, { overwrite: false })
  })
  it('propagates infrastructure failures', async () => {
    model.create.mockRejectedValue(new Error('network'))
    await expect(adapter.create(patient())).rejects.toThrow('network')
  })
})
