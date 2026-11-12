import { CreateTherapyTypeUseCase } from '../../../application/use-cases/create-therapy-type.use-case'
import { CreateTherapyTypeDomainService } from '../../../domain/services/create-therapy-type.domain-service'
const entity = { pk: 'therapy-id', sk: 'THERAPY_TYPE' as const, name: 'Individual', icon: null, gsi1pk: 'THERAPY_TYPE' as const, gsi1sk: 'THERAPY_TYPE#therapy-id', created_at: '2026-11-12T00:00:00.000Z', updated_at: '2026-11-12T00:00:00.000Z' }

describe('CreateTherapyTypeUseCase', () => {
  const repository = { create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn(), delete: jest.fn() }
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(Date, 'now').mockReturnValue(1794445200000)
  })
  afterEach(() => jest.restoreAllMocks())
  it('creates the documented keys, timestamps and defaults absent icon to null', async () => {
    repository.create.mockImplementation(async value => value)
    const uc = new CreateTherapyTypeUseCase(new CreateTherapyTypeDomainService(), repository)
    const result = await uc.execute({ name: `  ${entity.name}  ` })
    expect(result.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(result.icon).toBeNull()
    expect(result.created_at).toBe('2026-11-12T01:00:00.000Z')
    expect(Date.now).toHaveBeenCalledTimes(1)
    expect(result.updated_at).toBe(result.created_at)
    expect(repository.create).toHaveBeenCalledWith({ ...entity, pk: result.id, gsi1sk: `THERAPY_TYPE#${result.id}`, created_at: result.created_at, updated_at: result.updated_at })
    expect(result).not.toHaveProperty('pk')
  })
  it('preserves a supplied icon', async () => {
    repository.create.mockImplementation(async value => value)
    const uc = new CreateTherapyTypeUseCase(new CreateTherapyTypeDomainService(), repository)
    expect((await uc.execute({ name: 'Pareja', icon: 'couple' })).icon).toBe('couple')
  })
})
