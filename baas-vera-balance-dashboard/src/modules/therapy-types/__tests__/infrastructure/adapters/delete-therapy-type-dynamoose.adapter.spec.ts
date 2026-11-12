import { DeleteTherapyTypeDynamooseAdapter } from '../../../infrastructure/persistance/adapters/delete-therapy-type-dynamoose.adapter'
import { TherapyTypeConflictError, TherapyTypeNotFoundError } from '../../../domain/errors/therapy-type.error'
jest.mock('../../../infrastructure/persistance/models/therapy-type.model', () => ({ TherapyTypeModel: { create: jest.fn(), get: jest.fn(), update: jest.fn(), delete: jest.fn(), query: jest.fn() } }))
import { TherapyTypeModel } from '../../../infrastructure/persistance/models/therapy-type.model'
const model = TherapyTypeModel as unknown as { create: jest.Mock, get: jest.Mock, update: jest.Mock, delete: jest.Mock, query: jest.Mock }
const failure = Object.assign(new Error('condition failed'), { name: 'ConditionalCheckFailedException' })
const entity = { pk: 'therapy-id', sk: 'THERAPY_TYPE' as const, name: 'Individual', icon: null, gsi1pk: 'THERAPY_TYPE' as const, gsi1sk: 'THERAPY_TYPE#therapy-id', created_at: '2026-11-12T00:00:00.000Z', updated_at: '2026-11-12T00:00:00.000Z' }

describe('DeleteTherapyTypeDynamooseAdapter', () => {
  const adapter = new DeleteTherapyTypeDynamooseAdapter()
  beforeEach(() => jest.resetAllMocks())
  it('deletes only the exact therapy item with an existence condition', async () => {
    await adapter.delete(entity.pk)
    expect(model.delete).toHaveBeenCalledWith({ pk: entity.pk, sk: 'THERAPY_TYPE' }, expect.objectContaining({ condition: expect.anything() }))
  })
  it('returns not found when no item exists', async () => {
    model.delete.mockRejectedValue(failure)
    await expect(adapter.delete('missing')).rejects.toBeInstanceOf(TherapyTypeNotFoundError)
  })
  it('preserves unexpected persistence errors', async () => {
    const error = new Error('storage unavailable')
    model.delete.mockRejectedValue(error)
    await expect(adapter.delete(entity.pk)).rejects.toBe(error)
  })
})
