import { UpdateTherapyTypeDynamooseAdapter } from '../../../infrastructure/persistance/adapters/update-therapy-type-dynamoose.adapter'
import { TherapyTypeConflictError, TherapyTypeNotFoundError } from '../../../domain/errors/therapy-type.error'
jest.mock('../../../infrastructure/persistance/models/therapy-type.model', () => ({ TherapyTypeModel: { create: jest.fn(), get: jest.fn(), update: jest.fn(), delete: jest.fn(), query: jest.fn() } }))
import { TherapyTypeModel } from '../../../infrastructure/persistance/models/therapy-type.model'
const model = TherapyTypeModel as unknown as { create: jest.Mock, get: jest.Mock, update: jest.Mock, delete: jest.Mock, query: jest.Mock }
const failure = Object.assign(new Error('condition failed'), { name: 'ConditionalCheckFailedException' })
const entity = { pk: 'therapy-id', sk: 'THERAPY_TYPE' as const, name: 'Individual', icon: null, gsi1pk: 'THERAPY_TYPE' as const, gsi1sk: 'THERAPY_TYPE#therapy-id', created_at: '2026-11-12T00:00:00.000Z', updated_at: '2026-11-12T00:00:00.000Z' }

describe('UpdateTherapyTypeDynamooseAdapter', () => {
  const adapter = new UpdateTherapyTypeDynamooseAdapter()
  beforeEach(() => jest.resetAllMocks())
  it('updates supplied fields and preserves immutable data', async () => {
    model.update.mockResolvedValue({ ...entity, icon: 'new' })
    await adapter.update(entity, { icon: 'new' }, 'later')
    expect(model.update).toHaveBeenCalledWith({ pk: entity.pk, sk: entity.sk }, { $SET: { icon: 'new', updated_at: 'later' } }, expect.objectContaining({ returnValues: 'ALL_NEW' }))
  })
  it('returns not found if concurrently removed', async () => {
    model.update.mockRejectedValue(failure)
    model.get.mockResolvedValue(undefined)
    await expect(adapter.update(entity, { icon: null }, 'later')).rejects.toBeInstanceOf(TherapyTypeNotFoundError)
  })
  it('returns conflict if concurrently updated', async () => {
    model.update.mockRejectedValue(failure)
    model.get.mockResolvedValue(entity)
    await expect(adapter.update(entity, { name: 'Pareja' }, 'later')).rejects.toBeInstanceOf(TherapyTypeConflictError)
  })
  it('preserves unexpected persistence errors', async () => {
    const error = new Error('storage unavailable')
    model.update.mockRejectedValue(error)
    await expect(adapter.update(entity, { name: 'Pareja' }, 'later')).rejects.toBe(error)
  })
})
