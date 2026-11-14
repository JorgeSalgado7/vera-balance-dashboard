import { TherapeuticProcessExistsUseCase } from '../../../application/use-cases/therapeutic-process-exists.use-case'
describe('TherapeuticProcessExistsUseCase', () => {
  it('checks existence without loading any related catalog or patient data', async () => {
    const repository = { findById: jest.fn().mockResolvedValueOnce({ pk: 'process-id' }).mockResolvedValueOnce(null) }
    const useCase = new TherapeuticProcessExistsUseCase(repository as never)
    expect(await useCase.execute('process-id')).toBe(true)
    expect(await useCase.execute('missing')).toBe(false)
    expect(repository.findById.mock.calls).toEqual([['process-id'], ['missing']])
  })
})
