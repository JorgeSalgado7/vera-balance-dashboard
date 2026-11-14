import { RecordNotFoundError } from '../../../../records/domain/errors/record.error'
import { UpdateHomeworkUseCase } from '../../../application/use-cases/update-homework.use-case'
import { UpdateHomeworkDomainService } from '../../../domain/services/update-homework.domain-service'
import { ValidateHomeworkDomainService } from '../../../domain/services/validate-homework.domain-service'
import { HomeworkNotFoundError, EmptyHomeworkUpdateError, InvalidHomeworkUpdateFieldsError, InvalidHomeworkFieldError } from '../../../domain/errors/homework.error'
import { homeworkRepository, homeworkEntity, recordLookup, now } from '../../fixtures/homework.fixture'
function setup() {
  const repository = homeworkRepository()
  return { repository, useCase: new UpdateHomeworkUseCase(repository, recordLookup().useCase, new UpdateHomeworkDomainService(new ValidateHomeworkDomainService())) }
}
describe('UpdateHomeworkUseCase', () => {
  afterEach(() => jest.restoreAllMocks())
  it('changes only the description and updated_at, keeping the record and created_at', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-11-14T00:00:00Z'))
    const { useCase, repository } = setup()
    expect(await useCase.execute('homework-id', { description: 'Nueva actividad' })).toEqual({ id: 'homework-id', description: 'Nueva actividad', record: 'record-id', therapeutic_process: 'process-id', created_at: now, updated_at: '2026-11-14T00:00:00.000Z' })
    expect(repository.update).toHaveBeenCalledWith('homework-id', { description: 'Nueva actividad' }, '2026-11-14T00:00:00.000Z')
  })
  it('does not recreate a missing task', async () => {
    const { useCase, repository } = setup(); repository.findById.mockResolvedValue(null)
    await expect(useCase.execute('missing', { description: 'Nueva' })).rejects.toBeInstanceOf(HomeworkNotFoundError)
    expect(repository.update).not.toHaveBeenCalled()
  })
  it.each([[{}, EmptyHomeworkUpdateError], [{ record: 'other' }, InvalidHomeworkUpdateFieldsError], [{ description: ' ' }, InvalidHomeworkFieldError]] as const)('rejects an invalid update %s before writing', async (data, error) => {
    const { useCase, repository } = setup()
    await expect(useCase.execute('homework-id', data as never)).rejects.toBeInstanceOf(error)
    expect(repository.update).not.toHaveBeenCalled()
  })
  it('includes the process when updating an older task and keeps that relation immutable', async () => {
    const repository = homeworkRepository(); const records = recordLookup()
    const olderTask = { ...homeworkEntity(), therapeutic_process: undefined }
    repository.findById.mockResolvedValue(olderTask)
    repository.update.mockResolvedValue({ ...olderTask, description: 'Nueva' })
    const useCase = new UpdateHomeworkUseCase(repository, records.useCase, new UpdateHomeworkDomainService(new ValidateHomeworkDomainService()))
    expect((await useCase.execute('homework-id', { description: 'Nueva' })).therapeutic_process).toBe('process-id')
    expect(repository.update).toHaveBeenCalledWith('homework-id', { description: 'Nueva' }, expect.any(String))
  })
  it('does not update an older task if its session cannot be resolved', async () => {
    const repository = homeworkRepository(); const records = recordLookup()
    repository.findById.mockResolvedValue({ ...homeworkEntity(), therapeutic_process: undefined })
    records.repository.findById.mockResolvedValue(null)
    const useCase = new UpdateHomeworkUseCase(repository, records.useCase, new UpdateHomeworkDomainService(new ValidateHomeworkDomainService()))
    await expect(useCase.execute('homework-id', { description: 'Nueva' })).rejects.toBeInstanceOf(RecordNotFoundError)
    expect(repository.update).not.toHaveBeenCalled()
  })

})
