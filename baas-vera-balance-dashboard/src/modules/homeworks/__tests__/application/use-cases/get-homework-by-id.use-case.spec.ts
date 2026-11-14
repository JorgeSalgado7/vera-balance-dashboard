import { GetHomeworkByIdUseCase } from '../../../application/use-cases/get-homework-by-id.use-case'
import { HomeworkNotFoundError } from '../../../domain/errors/homework.error'
import { homeworkRepository, homeworkEntity, recordLookup, input, now } from '../../fixtures/homework.fixture'
describe('GetHomeworkByIdUseCase', () => {
  it('returns exactly the public fields', async () => {
    const repository = homeworkRepository()
    expect(await new GetHomeworkByIdUseCase(repository, recordLookup().useCase).execute('homework-id')).toEqual({ id: 'homework-id', ...input, therapeutic_process: 'process-id', created_at: now, updated_at: now })
    expect(repository.findById).toHaveBeenCalledWith('homework-id')
  })
  it('reports an absent homework', async () => {
    const repository = homeworkRepository(); repository.findById.mockResolvedValue(null)
    await expect(new GetHomeworkByIdUseCase(repository, recordLookup().useCase).execute('missing')).rejects.toBeInstanceOf(HomeworkNotFoundError)
  })
  it('resolves the process of older tasks from Records without changing persistence', async () => {
    const repository = homeworkRepository(); const records = recordLookup()
    repository.findById.mockResolvedValue({ ...homeworkEntity(), therapeutic_process: undefined })
    expect((await new GetHomeworkByIdUseCase(repository, records.useCase).execute('homework-id')).therapeutic_process).toBe('process-id')
    expect(records.repository.findById).toHaveBeenCalledWith('record-id')
    expect(repository.update).not.toHaveBeenCalled()
  })
  it('does not query Records again when the task already stores the process ID', async () => {
    const repository = homeworkRepository(); const records = recordLookup()
    expect((await new GetHomeworkByIdUseCase(repository, records.useCase).execute('homework-id')).therapeutic_process).toBe('process-id')
    expect(records.repository.findById).not.toHaveBeenCalled()
  })

})
