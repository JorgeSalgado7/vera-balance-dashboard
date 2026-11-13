import { ClinicExistsUseCase } from '../../../application/use-cases/clinic-exists.use-case'
import { ClinicEntity } from '../../../domain/entities/clinic.entity'

describe('ClinicExistsUseCase', () => {
  const repository = { findById: jest.fn() }
  const useCase = new ClinicExistsUseCase(repository)
  beforeEach(() => jest.resetAllMocks())
  it('checks existence through the existing reader without loading therapy details', async () => {
    repository.findById.mockResolvedValue(new ClinicEntity())
    expect(await useCase.execute('clinic-id')).toBe(true)
    expect(repository.findById).toHaveBeenCalledWith('clinic-id')
  })
  it('returns false for an unknown clinic', async () => { repository.findById.mockResolvedValue(null); expect(await useCase.execute('missing')).toBe(false) })
  it('propagates infrastructure errors', async () => { repository.findById.mockRejectedValue(new Error('network')); await expect(useCase.execute('clinic-id')).rejects.toThrow('network') })
})
