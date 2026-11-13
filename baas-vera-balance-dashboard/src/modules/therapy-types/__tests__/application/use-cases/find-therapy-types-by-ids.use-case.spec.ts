import { FindTherapyTypesByIdsUseCase } from '../../../application/use-cases/find-therapy-types-by-ids.use-case'
import { TherapyTypeEntity } from '../../../domain/entities/therapy-type.entity'
import type { ITherapyTypeRepository } from '../../../domain/repositories/therapy-type.repository'

describe('FindTherapyTypesByIdsUseCase', () => {
  const repository = { isAssignedToClinic: jest.fn(), findByIds: jest.fn() }
  const useCase = new FindTherapyTypesByIdsUseCase(repository as unknown as ITherapyTypeRepository)
  beforeEach(() => jest.resetAllMocks())
  it('exposes the complete therapy DTO while hiding persistence keys', async () => {
    repository.findByIds.mockResolvedValue([Object.assign(new TherapyTypeEntity(), { pk: 'therapy-id', name: 'Individual', icon: null, created_at: '2026-11-12T10:30:00.000Z', updated_at: '2026-11-12T10:30:00.000Z' })])
    expect(await useCase.execute(['therapy-id'])).toEqual([{ id: 'therapy-id', name: 'Individual', icon: null, created_at: '2026-11-12T10:30:00.000Z', updated_at: '2026-11-12T10:30:00.000Z' }])
    expect(repository.findByIds).toHaveBeenCalledWith(['therapy-id'])
  })
  it('propagates an incomplete batch failure', async () => { repository.findByIds.mockRejectedValue(new Error('incomplete')); await expect(useCase.execute(['therapy-id'])).rejects.toThrow('incomplete') })
})
