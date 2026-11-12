import { GetTherapyTypesUseCase } from '../../../application/use-cases/get-therapy-types.use-case'
const entity = { pk: 'therapy-id', sk: 'THERAPY_TYPE' as const, name: 'Individual', icon: null, gsi1pk: 'THERAPY_TYPE' as const, gsi1sk: 'THERAPY_TYPE#therapy-id', created_at: '2026-11-12T00:00:00.000Z', updated_at: '2026-11-12T00:00:00.000Z' }

describe('GetTherapyTypesUseCase', () => {
  const repository = { create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn(), delete: jest.fn() }
  beforeEach(() => jest.resetAllMocks())
  it('returns an empty list', async () => {
    repository.findAll.mockResolvedValue([])
    expect(await new GetTherapyTypesUseCase(repository).execute()).toEqual([])
  })
  it('projects only public fields', async () => {
    repository.findAll.mockResolvedValue([entity])
    expect((await new GetTherapyTypesUseCase(repository).execute())[0]).toEqual({ id: entity.pk, name: entity.name, icon: null, created_at: entity.created_at, updated_at: entity.updated_at })
  })
})
