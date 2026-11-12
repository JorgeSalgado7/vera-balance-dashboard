import { FindAllTherapyTypesDynamooseAdapter } from '../../../infrastructure/persistance/adapters/find-all-therapy-types-dynamoose.adapter'
import { TherapyTypeConflictError } from '../../../domain/errors/therapy-type-conflict.error'
import { TherapyTypeNotFoundError } from '../../../domain/errors/therapy-type-not-found.error'
jest.mock('../../../infrastructure/persistance/models/therapy-type.model', () => ({ TherapyTypeModel: { create: jest.fn(), get: jest.fn(), update: jest.fn(), delete: jest.fn(), query: jest.fn() } }))
import { TherapyTypeModel } from '../../../infrastructure/persistance/models/therapy-type.model'
const model = TherapyTypeModel as unknown as { create: jest.Mock, get: jest.Mock, update: jest.Mock, delete: jest.Mock, query: jest.Mock }
const failure = Object.assign(new Error('condition failed'), { name: 'ConditionalCheckFailedException' })
const entity = { pk: 'therapy-id', sk: 'THERAPY_TYPE' as const, name: 'Individual', icon: null, gsi1pk: 'THERAPY_TYPE' as const, gsi1sk: 'THERAPY_TYPE#therapy-id', created_at: '2026-11-12T00:00:00.000Z', updated_at: '2026-11-12T00:00:00.000Z' }

describe('FindAllTherapyTypesDynamooseAdapter', () => {
  const adapter = new FindAllTherapyTypesDynamooseAdapter()
  beforeEach(() => jest.resetAllMocks())
  it('queries every GSI1 page', async () => {
    const key = { pk: 'page-1', sk: 'THERAPY_TYPE' }
    const query = { eq: jest.fn().mockReturnThis(), using: jest.fn().mockReturnThis(), startAt: jest.fn().mockReturnThis(), exec: jest.fn() }
    model.query.mockReturnValue(query)
    query.exec.mockResolvedValueOnce(Object.assign([entity], { lastKey: key })).mockResolvedValueOnce([{ ...entity, pk: 'second' }])
    const result = await adapter.findAll()
    expect(result.map(item => item.pk)).toEqual([entity.pk, 'second'])
    expect(model.query).toHaveBeenCalledWith('gsi1pk')
    expect(query.eq).toHaveBeenCalledWith('THERAPY_TYPE')
    expect(query.using).toHaveBeenCalledWith('GSI1')
    expect(query.startAt).toHaveBeenCalledWith(key)
  })
  it('returns an empty list', async () => {
    const query = { eq: jest.fn().mockReturnThis(), using: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) }
    model.query.mockReturnValue(query)
    expect(await adapter.findAll()).toEqual([])
  })
  it('preserves unexpected persistence errors', async () => {
    const error = new Error('storage unavailable')
    model.query.mockImplementation(() => { throw error })
    await expect(adapter.findAll()).rejects.toBe(error)
  })
})
