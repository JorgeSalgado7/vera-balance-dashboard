import { UpdateTherapyTypeDomainService } from '../../../domain/services/update-therapy-type.domain-service'
import { UpdateTherapyTypeUseCase } from '../../../application/use-cases/update-therapy-type.use-case'
import { EmptyTherapyTypeUpdateError, TherapyTypeNotFoundError } from '../../../domain/errors/therapy-type.error'
import type { UpdateTherapyTypeDto } from '../../../application/dtos/update-therapy-type.dto'
const entity = { pk: 'therapy-id', sk: 'THERAPY_TYPE' as const, name: 'Individual', icon: null, gsi1pk: 'THERAPY_TYPE' as const, gsi1sk: 'THERAPY_TYPE#therapy-id', created_at: '2026-11-12T00:00:00.000Z', updated_at: '2026-11-12T00:00:00.000Z' }

describe('UpdateTherapyTypeUseCase', () => {
  const repository = { isAssignedToClinic: jest.fn(), findByIds: jest.fn(), create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn(), delete: jest.fn() }
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(Date, 'now').mockReturnValue(1794445200000)
  })
  afterEach(() => jest.restoreAllMocks())
  it.each([{}, null, [], 'invalid', { id: 'immutable' }, { icon: undefined }])('rejects an empty or invalid update %j before accessing storage', async value => {
    const uc = new UpdateTherapyTypeUseCase(new UpdateTherapyTypeDomainService(), repository)
    await expect(uc.execute(entity.pk, value as UpdateTherapyTypeDto)).rejects.toBeInstanceOf(EmptyTherapyTypeUpdateError)
    expect(repository.findById).not.toHaveBeenCalled()
    expect(repository.update).not.toHaveBeenCalled()
  })
  it('rejects missing records before writing', async () => {
    repository.findById.mockResolvedValue(null)
    await expect(new UpdateTherapyTypeUseCase(new UpdateTherapyTypeDomainService(), repository).execute('missing', { name: 'Pareja' })).rejects.toBeInstanceOf(TherapyTypeNotFoundError)
    expect(repository.update).not.toHaveBeenCalled()
  })
  it.each([{ name: 'Pareja' }, { icon: null }, { icon: 'family' }])('passes only the supplied changes %j', async changes => {
    repository.findById.mockResolvedValue(entity)
    repository.update.mockImplementation(async (current, patch, date) => ({ ...current, ...patch, updated_at: date }))
    const result = await new UpdateTherapyTypeUseCase(new UpdateTherapyTypeDomainService(), repository).execute(entity.pk, changes)
    expect(repository.update).toHaveBeenCalledWith(entity, changes, result.updated_at)
    expect(result.created_at).toBe(entity.created_at)
    expect(result.updated_at).toBe('2026-11-12T01:00:00.000Z')
  })
})
