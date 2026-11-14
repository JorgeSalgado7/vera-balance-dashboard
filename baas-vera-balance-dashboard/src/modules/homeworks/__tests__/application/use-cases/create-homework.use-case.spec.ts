import { CreateHomeworkUseCase } from '../../../application/use-cases/create-homework.use-case'
import { CreateHomeworkDomainService } from '../../../domain/services/create-homework.domain-service'
import { ValidateHomeworkDomainService } from '../../../domain/services/validate-homework.domain-service'
import { InvalidHomeworkFieldError } from '../../../domain/errors/homework.error'
import { RecordNotFoundError } from '../../../../records/domain/errors/record.error'
import { homeworkRepository, recordLookup, input, now } from '../../fixtures/homework.fixture'
function setup() {
  const repository = homeworkRepository(); const records = recordLookup()
  return { repository, records, useCase: new CreateHomeworkUseCase(repository, records.useCase, new CreateHomeworkDomainService(new ValidateHomeworkDomainService())) }
}
describe('CreateHomeworkUseCase', () => {
  afterEach(() => jest.restoreAllMocks())
  it('creates a homework for an existing record with a UUID and one ISO instant', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse(now))
    const { repository, records, useCase } = setup()
    expect(await useCase.execute(input)).toEqual({ id: expect.stringMatching(/^[a-f0-9-]{36}$/), ...input, therapeutic_process: 'process-id', created_at: now, updated_at: now })
    expect(Date.now).toHaveBeenCalledTimes(1)
    expect(records.repository.findById).toHaveBeenCalledWith('record-id')
    expect(repository.create.mock.calls[0]![0]).toMatchObject({ sk: 'HOME_WORK', gsi2pk: 'RECORD#record-id' })
  })
  it('does not write when the associated record is absent', async () => {
    const { repository, records, useCase } = setup(); records.repository.findById.mockResolvedValue(null)
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(RecordNotFoundError)
    expect(repository.create).not.toHaveBeenCalled()
  })
  it('rejects invalid descriptions before writing', async () => {
    const { repository, records, useCase } = setup()
    await expect(useCase.execute({ ...input, description: ' ' })).rejects.toBeInstanceOf(InvalidHomeworkFieldError)
    expect(repository.create).not.toHaveBeenCalled()
  })
  it('does not hide storage failures', async () => {
    const { repository, useCase } = setup(); const error = new Error('Network'); repository.create.mockRejectedValue(error)
    await expect(useCase.execute(input)).rejects.toBe(error)
  })
  it('uses the process from Records rather than a client-supplied value', async () => {
    const { repository, records, useCase } = setup()
    records.repository.findById.mockResolvedValue({ pk: 'record-id', therapeutic_process: 'actual-process-id' })
    const result = await useCase.execute({ ...input, therapeutic_process: 'wrong-process-id' } as never)
    expect(repository.create.mock.calls[0]![0].therapeutic_process).toBe('actual-process-id')
    expect(result.therapeutic_process).toBe('actual-process-id')
  })

})
