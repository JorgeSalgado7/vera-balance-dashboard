import { CreateRecordUseCase } from '../../../application/use-cases/create-record.use-case'
import { CreateRecordDomainService } from '../../../domain/services/create-record.domain-service'
import { ValidateRecordDomainService } from '../../../domain/services/validate-record.domain-service'
import { RecordProcessNotFoundError, InvalidRecordFieldError } from '../../../domain/errors/record.error'
import { TherapeuticProcessExistsUseCase } from '../../../../therapeutic-processes/application/use-cases/therapeutic-process-exists.use-case'
import { recordRepository, input, now } from '../../fixtures/record.fixture'
function setup() {
  const repository = recordRepository()
  const processRepository = { findById: jest.fn().mockResolvedValue({ pk: 'process-id' }) }
  const processes = new TherapeuticProcessExistsUseCase(processRepository as never)
  return { repository, processRepository, useCase: new CreateRecordUseCase(repository, processes, new CreateRecordDomainService(new ValidateRecordDomainService())) }
}
describe('CreateRecordUseCase', () => {
  afterEach(() => jest.restoreAllMocks())
  it('creates a session without homework or notes, using one ISO instant and a UUID', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse(now))
    const { repository, processRepository, useCase } = setup()
    const result = await useCase.execute(input)
    expect(processRepository.findById).toHaveBeenCalledWith('process-id')
    expect(result).toEqual({ id: expect.stringMatching(/^[a-f0-9-]{36}$/), ...input, resume: null, tools: null, created_at: now, updated_at: now })
    expect(repository.create.mock.calls[0]![0]).toMatchObject({ sk: 'RECORD', gsi2pk: 'THERAPEUTIC_PROCESS#process-id' })
    expect(result).not.toHaveProperty('pk')
    expect(Date.now).toHaveBeenCalledTimes(1)
  })
  it('preserves supplied notes', async () => { expect(await setup().useCase.execute({ ...input, resume: 'Resumen', tools: 'Herramienta' })).toMatchObject({ resume: 'Resumen', tools: 'Herramienta' }) })
  it('does not create records for missing processes', async () => {
    const { useCase, repository, processRepository } = setup(); processRepository.findById.mockResolvedValue(null)
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(RecordProcessNotFoundError)
    expect(repository.create).not.toHaveBeenCalled()
  })
  it('validates fields before writing', async () => {
    const { useCase, repository } = setup()
    await expect(useCase.execute({ ...input, attendance: 'invalid' as never })).rejects.toBeInstanceOf(InvalidRecordFieldError)
    expect(repository.create).not.toHaveBeenCalled()
  })
  it('does not hide persistence failures', async () => {
    const { useCase, repository } = setup(); const error = new Error('Network'); repository.create.mockRejectedValue(error)
    await expect(useCase.execute(input)).rejects.toBe(error)
  })
})
