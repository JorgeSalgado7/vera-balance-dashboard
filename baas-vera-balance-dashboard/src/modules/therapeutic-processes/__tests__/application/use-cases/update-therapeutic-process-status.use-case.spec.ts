import { dependencies, processEntity, input } from '../../fixtures/process.fixture'
import { UpdateTherapeuticProcessStatusUseCase } from '../../../application/use-cases/update-therapeutic-process-status.use-case'
import { InvalidTherapeuticProcessFieldError } from '../../../domain/errors/therapeutic-process.error'

describe('UpdateTherapeuticProcessStatusUseCase', () => {
  it.each(['Activo', 'Dado de alta', 'Proceso interrupido', 'Cancelado'] as const)('updates only status through its independent operation: %s', async status => {
    const deps = dependencies(); const useCase = new UpdateTherapeuticProcessStatusUseCase(deps.repository, deps.resolver)
    expect((await useCase.execute('process-id', { status })).status).toBe(status)
    expect(deps.repository.updateStatus).toHaveBeenCalledWith('process-id', status, expect.any(String)); expect(deps.repository.update).not.toHaveBeenCalled()
  })
  it('rejects an invalid status before writing', async () => { const deps = dependencies(); await expect(new UpdateTherapeuticProcessStatusUseCase(deps.repository, deps.resolver).execute('process-id', { status: 'Other' } as never)).rejects.toBeInstanceOf(InvalidTherapeuticProcessFieldError); expect(deps.repository.updateStatus).not.toHaveBeenCalled() })
})
