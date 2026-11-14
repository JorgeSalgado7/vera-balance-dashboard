import { GetTherapeuticProcessRecordsUseCase } from '../../../application/use-cases/get-therapeutic-process-records.use-case'
import { TherapeuticProcessExistsUseCase } from '../../../../therapeutic-processes/application/use-cases/therapeutic-process-exists.use-case'
import { RecordProcessNotFoundError } from '../../../domain/errors/record.error'
import { recordRepository, input, now } from '../../fixtures/record.fixture'
function setup() {
  const repository = recordRepository()
  const processes = { findById: jest.fn().mockResolvedValue({ pk: 'process-id' }) }
  return { repository, processes, useCase: new GetTherapeuticProcessRecordsUseCase(repository, new TherapeuticProcessExistsUseCase(processes as never)) }
}
describe('GetTherapeuticProcessRecordsUseCase', () => {
  it('returns an array of complete public records', async () => {
    const { useCase, repository } = setup()
    expect(await useCase.execute('process-id')).toEqual([{ id: 'record-id', ...input, resume: null, tools: null, created_at: now, updated_at: now }])
    expect(repository.findByProcess).toHaveBeenCalledWith('process-id')
  })
  it('returns an empty array for an existing process without sessions', async () => {
    const { useCase, repository } = setup(); repository.findByProcess.mockResolvedValue([])
    expect(await useCase.execute('process-id')).toEqual([])
  })
  it('reports a missing process without querying sessions', async () => {
    const { useCase, repository, processes } = setup(); processes.findById.mockResolvedValue(null)
    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(RecordProcessNotFoundError)
    expect(repository.findByProcess).not.toHaveBeenCalled()
  })
})
