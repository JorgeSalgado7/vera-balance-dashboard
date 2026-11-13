import { TherapyTypeInUseError } from '../../../domain/errors/therapy-type.error'
import { DeleteTherapyTypeUseCase } from '../../../application/use-cases/delete-therapy-type.use-case'
const entity = { pk: 'therapy-id', sk: 'THERAPY_TYPE' as const, name: 'Individual', icon: null, gsi1pk: 'THERAPY_TYPE' as const, gsi1sk: 'THERAPY_TYPE#therapy-id', created_at: '2026-11-12T00:00:00.000Z', updated_at: '2026-11-12T00:00:00.000Z' }

describe('DeleteTherapyTypeUseCase', () => {
  const repository = { isAssignedToClinic: jest.fn(), findByIds: jest.fn(), create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn(), delete: jest.fn() }
  beforeEach(() => jest.resetAllMocks())
  it('deletes the requested entity and returns no body', async () => {
    expect(await new DeleteTherapyTypeUseCase(repository).execute(entity.pk)).toBeUndefined()
    expect(repository.delete).toHaveBeenCalledWith(entity.pk)
  })
  it('rejects a type assigned to any clinic and never deletes it', async () => {
    repository.isAssignedToClinic.mockResolvedValue(true)
    await expect(new DeleteTherapyTypeUseCase(repository).execute(entity.pk)).rejects.toBeInstanceOf(TherapyTypeInUseError)
    expect(repository.isAssignedToClinic).toHaveBeenCalledWith(entity.pk)
    expect(repository.delete).not.toHaveBeenCalled()
  })
  it('does not delete when checking clinic assignments fails', async () => {
    repository.isAssignedToClinic.mockRejectedValue(new Error('database unavailable'))
    await expect(new DeleteTherapyTypeUseCase(repository).execute(entity.pk)).rejects.toThrow('database unavailable')
    expect(repository.delete).not.toHaveBeenCalled()
  })
  it('preserves repository errors', async () => {
    const error = new Error('storage unavailable')
    repository.delete.mockRejectedValue(error)
    await expect(new DeleteTherapyTypeUseCase(repository).execute(entity.pk)).rejects.toBe(error)
  })
})
