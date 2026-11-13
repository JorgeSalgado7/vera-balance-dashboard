import { ClinicEntity } from '../../../domain/entities/clinic.entity'
const clinic = () => Object.assign(new ClinicEntity(), { pk: 'clinic-id', sk: 'CLINIC', name: 'Clínica', logo: null,
  address: 'Centro', phone_number: '555', therapy_types: [], status: 'Activo', gsi1pk: 'CLINIC', gsi1sk: 'CLINIC#clinic-id',
  created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' })
import { FindAllClinicsDynamooseAdapter } from '../../../infrastructure/persistance/adapters/find-all-clinics-dynamoose.adapter'
import { ClinicModel } from '../../../infrastructure/persistance/models/clinic.model'
jest.mock('../../../infrastructure/persistance/models/clinic.model', () => ({ ClinicModel: { query: jest.fn() } }))
describe('FindAllClinicsDynamooseAdapter', () => {
  const model = ClinicModel as unknown as { query: jest.Mock }
  const adapter = new FindAllClinicsDynamooseAdapter()
  it('queries only the clinic GSI1 partition and consumes every page', async () => {
    const lastKey = { pk: 'last', sk: 'CLINIC' }
    const query = { eq: jest.fn().mockReturnThis(), using: jest.fn().mockReturnThis(), startAt: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValueOnce(Object.assign([clinic()], { lastKey })).mockResolvedValueOnce([clinic()]) }
    model.query.mockReturnValue(query)
    expect(await adapter.findAll()).toHaveLength(2)
    expect(model.query).toHaveBeenCalledWith('gsi1pk')
    expect(query.eq).toHaveBeenCalledWith('CLINIC')
    expect(query.using).toHaveBeenCalledWith('GSI1')
    expect(query.startAt).toHaveBeenCalledWith(lastKey)
    expect(query.exec).toHaveBeenCalledTimes(2)
  })
})
