import { FindTherapyTypeByIdDynamooseAdapter } from '../../../infrastructure/persistance/adapters/find-therapy-type-by-id-dynamoose.adapter'
import { TherapyTypeConflictError, TherapyTypeNotFoundError } from '../../../domain/errors/therapy-type.error'
jest.mock('../../../infrastructure/persistance/models/therapy-type.model', () => ({ TherapyTypeModel: { create: jest.fn(), get: jest.fn(), update: jest.fn(), delete: jest.fn(), query: jest.fn() } }))
import { TherapyTypeModel } from '../../../infrastructure/persistance/models/therapy-type.model'
const model = TherapyTypeModel as unknown as { create: jest.Mock, get: jest.Mock, update: jest.Mock, delete: jest.Mock, query: jest.Mock }
const failure = Object.assign(new Error('condition failed'), { name: 'ConditionalCheckFailedException' })
const entity = { pk: 'therapy-id', sk: 'THERAPY_TYPE' as const, name: 'Individual', icon: null, gsi1pk: 'THERAPY_TYPE' as const, gsi1sk: 'THERAPY_TYPE#therapy-id', created_at: '2026-11-12T00:00:00.000Z', updated_at: '2026-11-12T00:00:00.000Z' }

describe('FindTherapyTypeByIdDynamooseAdapter', () => {
  const adapter = new FindTherapyTypeByIdDynamooseAdapter()
  beforeEach(() => jest.resetAllMocks())
  it('uses the full key and returns a domain entity', async () => {
    model.get.mockResolvedValue(entity)
    expect(await adapter.findById(entity.pk)).toEqual(entity)
    expect(model.get).toHaveBeenCalledWith({ pk: entity.pk, sk: 'THERAPY_TYPE' }, { consistent: true })
  })
  it('returns null for a missing item', async () => {
    model.get.mockResolvedValue(undefined)
    expect(await adapter.findById('missing')).toBeNull()
  })
  it('preserves unexpected persistence errors', async () => {
    const error = new Error('storage unavailable')
    model.get.mockRejectedValue(error)
    await expect(adapter.findById(entity.pk)).rejects.toBe(error)
  })
})
