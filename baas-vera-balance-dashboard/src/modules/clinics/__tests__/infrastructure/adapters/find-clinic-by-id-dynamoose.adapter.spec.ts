import { ClinicEntity } from '../../../domain/entities/clinic.entity'
const clinic = () => Object.assign(new ClinicEntity(), { pk: 'clinic-id', sk: 'CLINIC', name: 'Clínica', logo: null,
  address: 'Centro', phone_number: '555', therapy_types: [], status: 'Activo', gsi1pk: 'CLINIC', gsi1sk: 'CLINIC#clinic-id',
  created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' })
import { FindClinicByIdDynamooseAdapter } from '../../../infrastructure/persistance/adapters/find-clinic-by-id-dynamoose.adapter'
import { ClinicModel } from '../../../infrastructure/persistance/models/clinic.model'
jest.mock('../../../infrastructure/persistance/models/clinic.model', () => ({ ClinicModel: { get: jest.fn() } }))
describe('FindClinicByIdDynamooseAdapter', () => {
  const model = ClinicModel as unknown as { get: jest.Mock }
  const adapter = new FindClinicByIdDynamooseAdapter()
  beforeEach(() => jest.resetAllMocks())
  it('uses both primary keys with a consistent read', async () => {
    model.get.mockResolvedValue(clinic())
    expect(await adapter.findById('clinic-id')).toEqual(clinic())
    expect(model.get).toHaveBeenCalledWith({ pk: 'clinic-id', sk: 'CLINIC' }, { consistent: true })
  })
  it('returns null for a missing clinic', async () => { expect(await adapter.findById('missing')).toBeNull() })
})
