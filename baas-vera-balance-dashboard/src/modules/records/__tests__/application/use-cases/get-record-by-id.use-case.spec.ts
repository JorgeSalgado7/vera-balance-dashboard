import { GetRecordByIdUseCase } from '../../../application/use-cases/get-record-by-id.use-case'
import { RecordNotFoundError } from '../../../domain/errors/record.error'
import { recordRepository, input, now } from '../../fixtures/record.fixture'
describe('GetRecordByIdUseCase', () => {
  it('returns the complete public projection without persistence keys', async () => {
    const repository = recordRepository()
    expect(await new GetRecordByIdUseCase(repository).execute('record-id')).toEqual({ id: 'record-id', ...input, resume: null, tools: null, created_at: now, updated_at: now })
    expect(repository.findById).toHaveBeenCalledWith('record-id')
  })
  it('reports missing sessions', async () => {
    const repository = recordRepository(); repository.findById.mockResolvedValue(null)
    await expect(new GetRecordByIdUseCase(repository).execute('missing')).rejects.toBeInstanceOf(RecordNotFoundError)
  })
})
