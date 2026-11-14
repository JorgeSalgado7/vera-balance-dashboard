import { UpdateRecordUseCase } from '../../../application/use-cases/update-record.use-case'
import { UpdateRecordDomainService } from '../../../domain/services/update-record.domain-service'
import { ValidateRecordDomainService } from '../../../domain/services/validate-record.domain-service'
import { RecordNotFoundError, EmptyRecordUpdateError, InvalidRecordUpdateFieldsError } from '../../../domain/errors/record.error'
import { recordRepository } from '../../fixtures/record.fixture'
function setup() {
  const repository = recordRepository()
  return { repository, useCase: new UpdateRecordUseCase(repository, new UpdateRecordDomainService(new ValidateRecordDomainService())) }
}
describe('UpdateRecordUseCase', () => {
  afterEach(() => jest.restoreAllMocks())
  it('updates only supplied fields and returns unchanged dates, process and optional data', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-11-14T10:00:00Z'))
    const { repository, useCase } = setup()
    expect(await useCase.execute('record-id', { attendance: 'Cancelada', resume: null })).toMatchObject({ id: 'record-id', attendance: 'Cancelada', resume: null, tools: null, therapeutic_process: 'process-id', created_at: '2026-11-13T12:00:00.000Z', updated_at: '2026-11-14T10:00:00.000Z' })
    expect(repository.update).toHaveBeenCalledWith('record-id', { attendance: 'Cancelada', resume: null }, '2026-11-14T10:00:00.000Z')
  })
  it('rejects missing records', async () => {
    const { repository, useCase } = setup(); repository.findById.mockResolvedValue(null)
    await expect(useCase.execute('missing', { tools: 'Técnica' })).rejects.toBeInstanceOf(RecordNotFoundError)
    expect(repository.update).not.toHaveBeenCalled()
  })
  it('rejects empty bodies', async () => {
    const { repository, useCase } = setup(); await expect(useCase.execute('record-id', {})).rejects.toBeInstanceOf(EmptyRecordUpdateError)
    expect(repository.update).not.toHaveBeenCalled()
  })
  it('forbids moving a session to another process', async () => {
    const { repository, useCase } = setup()
    await expect(useCase.execute('record-id', { therapeutic_process: 'other' } as never)).rejects.toBeInstanceOf(InvalidRecordUpdateFieldsError)
    expect(repository.update).not.toHaveBeenCalled()
  })
})
