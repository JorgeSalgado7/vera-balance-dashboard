import { GetTherapyTypeByIdUseCase } from '../../../application/use-cases/get-therapy-type-by-id.use-case'
import { TherapyTypeNotFoundError } from '../../../domain/errors/therapy-type-not-found.error'
const entity = { pk: 'therapy-id', sk: 'THERAPY_TYPE' as const, name: 'Individual', icon: null, gsi1pk: 'THERAPY_TYPE' as const, gsi1sk: 'THERAPY_TYPE#therapy-id', created_at: '2026-11-12T00:00:00.000Z', updated_at: '2026-11-12T00:00:00.000Z' }

describe('GetTherapyTypeByIdUseCase', () => {
  const repository = { create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn(), delete: jest.fn() }
  beforeEach(() => jest.resetAllMocks())
  it('rejects a missing entity', async () => {
    repository.findById.mockResolvedValue(null)
    await expect(new GetTherapyTypeByIdUseCase(repository).execute('missing')).rejects.toBeInstanceOf(TherapyTypeNotFoundError)
  })
  it('returns an existing entity without persistence fields', async () => {
    repository.findById.mockResolvedValue(entity)
    const result = await new GetTherapyTypeByIdUseCase(repository).execute(entity.pk)
    expect(result.id).toBe(entity.pk)
    expect(result).not.toHaveProperty('pk')
    expect(result).not.toHaveProperty('gsi1pk')
  })
})
