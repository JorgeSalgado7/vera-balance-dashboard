import { GetRecordHomeworksUseCase } from '../../../application/use-cases/get-record-homeworks.use-case'
import { RecordNotFoundError } from '../../../../records/domain/errors/record.error'
import { homeworkRepository, homeworkEntity, recordLookup, input, now } from '../../fixtures/homework.fixture'
function setup() {
  const repository = homeworkRepository(); const records = recordLookup()
  return { repository, records, useCase: new GetRecordHomeworksUseCase(repository, records.useCase) }
}
describe('GetRecordHomeworksUseCase', () => {
  it('returns an array with all homework projections', async () => {
    const { repository, useCase } = setup()
    expect(await useCase.execute('record-id')).toEqual([{ id: 'homework-id', ...input, therapeutic_process: 'process-id', created_at: now, updated_at: now }])
    expect(repository.findByRecord).toHaveBeenCalledWith('record-id')
  })
  it('allows a session without assigned tasks', async () => {
    const { repository, useCase } = setup(); repository.findByRecord.mockResolvedValue([])
    expect(await useCase.execute('record-id')).toEqual([])
  })
  it('reports a missing session before querying tasks', async () => {
    const { records, repository, useCase } = setup(); records.repository.findById.mockResolvedValue(null)
    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(RecordNotFoundError)
    expect(repository.findByRecord).not.toHaveBeenCalled()
  })
  it('resolves older task relations using the same session lookup for the entire list', async () => {
    const { repository, records, useCase } = setup()
    repository.findByRecord.mockResolvedValue([
      { ...homeworkEntity(), therapeutic_process: undefined },
      { ...homeworkEntity(), pk: 'second-id', therapeutic_process: undefined },
    ])
    const result = await useCase.execute('record-id')
    expect(result.map(item => item.therapeutic_process)).toEqual(['process-id', 'process-id'])
    expect(records.repository.findById).toHaveBeenCalledTimes(1)
    expect(repository.update).not.toHaveBeenCalled()
  })

})
