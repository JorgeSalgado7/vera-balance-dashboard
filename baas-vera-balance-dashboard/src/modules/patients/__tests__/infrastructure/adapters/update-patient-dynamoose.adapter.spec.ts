import { patient } from '../../fixtures/patient.fixture'
import { UpdatePatientDynamooseAdapter } from '../../../infrastructure/persistance/adapters/update-patient-dynamoose.adapter'
import { PatientModel } from '../../../infrastructure/persistance/models/patient.model'
import { PatientUpdateConflictError, PatientNotFoundError } from '../../../domain/errors/patient.error'
jest.mock('../../../infrastructure/persistance/models/patient.model', () => ({ PatientModel: { update: jest.fn(), get: jest.fn() } }))
describe('UpdatePatientDynamooseAdapter', () => {
  const model = PatientModel as unknown as { update: jest.Mock, get: jest.Mock }
  const adapter = new UpdatePatientDynamooseAdapter()
  beforeEach(() => jest.resetAllMocks())
  it('writes only the supplied mutable fields and the new timestamp', async () => {
    model.update.mockResolvedValue({ ...patient(), phone_number: null, updated_at: 'new' })
    expect((await adapter.update(patient(), { phone_number: null }, 'new')).phone_number).toBeNull()
    expect(model.update).toHaveBeenCalledWith({ pk: 'patient-id', sk: 'PATIENT' }, { $SET: { phone_number: null, updated_at: 'new' } }, expect.objectContaining({ returnValues: 'ALL_NEW' }))
  })
  it.each([true, false])('distinguishes a concurrent update from a removed patient (exists=%s)', async exists => {
    model.update.mockRejectedValue(Object.assign(new Error(), { name: 'ConditionalCheckFailedException' }))
    model.get.mockResolvedValue(exists ? patient() : undefined)
    await expect(adapter.update(patient(), { name: 'Nueva' }, 'new')).rejects.toBeInstanceOf(exists ? PatientUpdateConflictError : PatientNotFoundError)
    expect(model.get).toHaveBeenCalledWith({ pk: 'patient-id', sk: 'PATIENT' }, { consistent: true })
  })
  it('propagates database failures without retrying a conditional write', async () => {
    model.update.mockRejectedValue(new Error('network'))
    await expect(adapter.update(patient(), { name: 'Nueva' }, 'new')).rejects.toThrow('network')
    expect(model.get).not.toHaveBeenCalled()
  })
})
