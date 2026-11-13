import { ResolveClinicTherapyTypesUseCase } from '../../../application/use-cases/resolve-clinic-therapy-types.use-case'
import type { FindTherapyTypesByIdsUseCase } from '../../../../therapy-types/application/use-cases/find-therapy-types-by-ids.use-case'
import { InvalidClinicTherapyTypesError } from '../../../domain/errors/clinic.error'
describe('ResolveClinicTherapyTypesUseCase', () => {
  const therapies = { execute: jest.fn() }
  const useCase = new ResolveClinicTherapyTypesUseCase(therapies as unknown as FindTherapyTypesByIdsUseCase)
  beforeEach(() => jest.resetAllMocks())
  it('restores requested order from an unordered batch response and exposes only the contracted fields', async () => {
    therapies.execute.mockResolvedValue([{ id: 'b', name: 'Pareja', icon: null, created_at: 'private' }, { id: 'a', name: 'Individual', icon: 'a.svg' }])
    expect(await useCase.execute(['a', 'b'])).toEqual([{ id: 'a', name: 'Individual', icon: 'a.svg' }, { id: 'b', name: 'Pareja', icon: null }])
  })
  it('rejects nonexistent therapy IDs', async () => {
    therapies.execute.mockResolvedValue([])
    await expect(useCase.execute(['missing'])).rejects.toBeInstanceOf(InvalidClinicTherapyTypesError)
  })
  it('supports an empty selection', async () => { therapies.execute.mockResolvedValue([]); expect(await useCase.execute([])).toEqual([]) })
})
