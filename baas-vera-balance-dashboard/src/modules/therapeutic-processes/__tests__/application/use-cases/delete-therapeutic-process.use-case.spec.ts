import { dependencies, processEntity, input } from '../../fixtures/process.fixture'
import { DeleteTherapeuticProcessUseCase } from '../../../application/use-cases/delete-therapeutic-process.use-case'
import { TherapeuticProcessNotFoundError } from '../../../domain/errors/therapeutic-process.error'

describe('DeleteTherapeuticProcessUseCase', () => {
  it('delegates the full cascade using the existing process and returns no body', async () => { const deps = dependencies(); expect(await new DeleteTherapeuticProcessUseCase(deps.repository).execute('process-id')).toBeUndefined(); expect(deps.repository.deleteCascade).toHaveBeenCalledWith(processEntity()) })
  it('rejects a missing process before deleting dependencies', async () => { const deps = dependencies(); deps.repository.findById.mockResolvedValue(null); await expect(new DeleteTherapeuticProcessUseCase(deps.repository).execute('missing')).rejects.toBeInstanceOf(TherapeuticProcessNotFoundError); expect(deps.repository.deleteCascade).not.toHaveBeenCalled() })
  it('does not report success if a cascade phase fails', async () => { const deps = dependencies(); deps.repository.deleteCascade.mockRejectedValue(new Error('network')); await expect(new DeleteTherapeuticProcessUseCase(deps.repository).execute('process-id')).rejects.toThrow('network') })
})
