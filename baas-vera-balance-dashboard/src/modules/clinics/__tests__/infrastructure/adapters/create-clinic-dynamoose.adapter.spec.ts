import { ClinicEntity } from '../../../domain/entities/clinic.entity'
const clinic = () => Object.assign(new ClinicEntity(), { pk: 'clinic-id', sk: 'CLINIC', name: 'Clínica', logo: null,
  address: 'Centro', phone_number: '555', therapy_types: [], status: 'Activo', gsi1pk: 'CLINIC', gsi1sk: 'CLINIC#clinic-id',
  created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' })
import { CreateClinicDynamooseAdapter } from '../../../infrastructure/persistance/adapters/create-clinic-dynamoose.adapter'
import { ClinicModel } from '../../../infrastructure/persistance/models/clinic.model'
import { ClinicConflictError } from '../../../domain/errors/clinic.error'
jest.mock('../../../infrastructure/persistance/models/clinic.model', () => ({ ClinicModel: { create: jest.fn() } }))
describe('CreateClinicDynamooseAdapter', () => {
  const model = ClinicModel as unknown as { create: jest.Mock }
  const adapter = new CreateClinicDynamooseAdapter()
  beforeEach(() => jest.resetAllMocks())
  it('creates only the documented persisted attributes without overwriting an existing item', async () => {
    model.create.mockResolvedValue(clinic())
    expect(await adapter.create(clinic())).toEqual(clinic())
    expect(model.create).toHaveBeenCalledWith({ ...clinic() }, { overwrite: false })
  })
  it('translates a conditional collision to a friendly domain conflict', async () => {
    model.create.mockRejectedValue(Object.assign(new Error(), { name: 'ConditionalCheckFailedException' }))
    await expect(adapter.create(clinic())).rejects.toBeInstanceOf(ClinicConflictError)
  })
  it('propagates infrastructure failures', async () => {
    model.create.mockRejectedValue(new Error('network'))
    await expect(adapter.create(clinic())).rejects.toThrow('network')
  })
})
