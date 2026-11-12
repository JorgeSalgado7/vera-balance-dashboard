import { CreateTherapyTypeDynamooseAdapter } from '../../../infrastructure/persistance/adapters/create-therapy-type-dynamoose.adapter'
import { TherapyTypeConflictError, TherapyTypeNotFoundError } from '../../../domain/errors/therapy-type.error'
jest.mock('../../../infrastructure/persistance/models/therapy-type.model', () => ({ TherapyTypeModel: { create: jest.fn(), get: jest.fn(), update: jest.fn(), delete: jest.fn(), query: jest.fn() } }))
import { TherapyTypeModel } from '../../../infrastructure/persistance/models/therapy-type.model'
const model = TherapyTypeModel as unknown as { create: jest.Mock, get: jest.Mock, update: jest.Mock, delete: jest.Mock, query: jest.Mock }
const failure = Object.assign(new Error('condition failed'), { name: 'ConditionalCheckFailedException' })
const entity = { pk: 'therapy-id', sk: 'THERAPY_TYPE' as const, name: 'Individual', icon: null, gsi1pk: 'THERAPY_TYPE' as const, gsi1sk: 'THERAPY_TYPE#therapy-id', created_at: '2026-11-12T00:00:00.000Z', updated_at: '2026-11-12T00:00:00.000Z' }

describe('CreateTherapyTypeDynamooseAdapter', () => {
  const adapter = new CreateTherapyTypeDynamooseAdapter()
  beforeEach(() => jest.resetAllMocks())
  it('writes the documented item without overwriting', async () => {
    await adapter.create(entity)
    expect(model.create).toHaveBeenCalledWith(entity, { overwrite: false })
  })
  it('translates a collision to conflict', async () => {
    model.create.mockRejectedValue(failure)
    await expect(adapter.create(entity)).rejects.toBeInstanceOf(TherapyTypeConflictError)
  })
  it('preserves unexpected persistence errors', async () => {
    const error = new Error('storage unavailable')
    model.create.mockRejectedValue(error)
    await expect(adapter.create(entity)).rejects.toBe(error)
  })
})
