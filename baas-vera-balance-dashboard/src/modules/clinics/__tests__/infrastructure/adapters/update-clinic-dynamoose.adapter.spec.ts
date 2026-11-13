import { ClinicEntity } from '../../../domain/entities/clinic.entity'
const clinic = () => Object.assign(new ClinicEntity(), { pk: 'clinic-id', sk: 'CLINIC', name: 'Clínica', logo: null,
  address: 'Centro', phone_number: '555', therapy_types: [], status: 'Activo', gsi1pk: 'CLINIC', gsi1sk: 'CLINIC#clinic-id',
  created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' })
import { UpdateClinicDynamooseAdapter } from '../../../infrastructure/persistance/adapters/update-clinic-dynamoose.adapter'
import { ClinicModel } from '../../../infrastructure/persistance/models/clinic.model'
import { ClinicConflictError, ClinicNotFoundError } from '../../../domain/errors/clinic.error'
jest.mock('../../../infrastructure/persistance/models/clinic.model', () => ({ ClinicModel: { update: jest.fn(), get: jest.fn() } }))
describe('UpdateClinicDynamooseAdapter', () => {
  const model = ClinicModel as unknown as { update: jest.Mock, get: jest.Mock }
  const adapter = new UpdateClinicDynamooseAdapter()
  beforeEach(() => jest.resetAllMocks())
  it('writes only the supplied mutable fields and the new timestamp', async () => {
    model.update.mockResolvedValue({ ...clinic(), logo: null, updated_at: 'new' })
    expect((await adapter.update(clinic(), { logo: null }, 'new')).logo).toBeNull()
    expect(model.update).toHaveBeenCalledWith({ pk: 'clinic-id', sk: 'CLINIC' }, { $SET: { logo: null, updated_at: 'new' } }, expect.objectContaining({ returnValues: 'ALL_NEW' }))
  })
  it.each([true, false])('distinguishes a concurrent update from a removed clinic (exists=%s)', async exists => {
    model.update.mockRejectedValue(Object.assign(new Error(), { name: 'ConditionalCheckFailedException' }))
    model.get.mockResolvedValue(exists ? clinic() : undefined)
    await expect(adapter.update(clinic(), { name: 'Nueva' }, 'new')).rejects.toBeInstanceOf(exists ? ClinicConflictError : ClinicNotFoundError)
    expect(model.get).toHaveBeenCalledWith({ pk: 'clinic-id', sk: 'CLINIC' }, { consistent: true })
  })
  it('propagates database failures without retrying a conditional write', async () => {
    model.update.mockRejectedValue(new Error('network'))
    await expect(adapter.update(clinic(), { name: 'Nueva' }, 'new')).rejects.toThrow('network')
    expect(model.get).not.toHaveBeenCalled()
  })
})
