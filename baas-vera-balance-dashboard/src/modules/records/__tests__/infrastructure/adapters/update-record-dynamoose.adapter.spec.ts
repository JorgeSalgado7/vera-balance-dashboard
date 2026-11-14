jest.mock('../../../infrastructure/persistance/models/record.model', () => ({ RecordModel: { update: jest.fn() } }))
import { RecordModel } from '../../../infrastructure/persistance/models/record.model'
import { UpdateRecordDynamooseAdapter } from '../../../infrastructure/persistance/adapters/update-record-dynamoose.adapter'
import { RecordNotFoundError } from '../../../domain/errors/record.error'
import { recordEntity } from '../../fixtures/record.fixture'
describe('UpdateRecordDynamooseAdapter', () => {
  beforeEach(() => jest.resetAllMocks())
  it('sets only supplied mutable fields and the ISO timestamp, supporting null clearing', async () => {
    const saved = { ...recordEntity(), tools: null, attendance: 'Falta', updated_at: '2026-11-14T00:00:00.000Z' }
    jest.mocked(RecordModel.update).mockResolvedValue(saved as never)
    expect(await new UpdateRecordDynamooseAdapter().update('record-id', { tools: null, attendance: 'Falta', resume: undefined }, saved.updated_at)).toEqual(saved)
    expect(RecordModel.update).toHaveBeenCalledWith({ pk: 'record-id', sk: 'RECORD' }, { $SET: { tools: null, attendance: 'Falta', updated_at: saved.updated_at } }, { condition: expect.anything(), returnValues: 'ALL_NEW' })
  })
  it('prevents recreating a removed session', async () => {
    jest.mocked(RecordModel.update).mockRejectedValue(Object.assign(new Error(), { name: 'ConditionalCheckFailedException' }) as never)
    await expect(new UpdateRecordDynamooseAdapter().update('gone', { tools: 'x' }, 'now')).rejects.toBeInstanceOf(RecordNotFoundError)
  })
  it('preserves network failures', async () => {
    const error = new Error('Network'); jest.mocked(RecordModel.update).mockRejectedValue(error as never)
    await expect(new UpdateRecordDynamooseAdapter().update('record-id', { tools: 'x' }, 'now')).rejects.toBe(error)
  })
})
