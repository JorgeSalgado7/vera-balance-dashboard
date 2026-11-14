jest.mock('../../../infrastructure/persistance/models/record.model', () => ({ RecordModel: { create: jest.fn() } }))
import { RecordModel } from '../../../infrastructure/persistance/models/record.model'
import { CreateRecordDynamooseAdapter } from '../../../infrastructure/persistance/adapters/create-record-dynamoose.adapter'
import { recordEntity } from '../../fixtures/record.fixture'
describe('CreateRecordDynamooseAdapter', () => {
  beforeEach(() => jest.resetAllMocks())
  it('persists documented keys conditionally and keeps null notes', async () => {
    const entity = recordEntity()
    expect(await new CreateRecordDynamooseAdapter().create(entity)).toBe(entity)
    expect(RecordModel.create).toHaveBeenCalledWith({ ...entity }, { overwrite: false })
  })
  it('propagates database failures', async () => {
    const error = new Error('Network'); jest.mocked(RecordModel.create).mockRejectedValue(error as never)
    await expect(new CreateRecordDynamooseAdapter().create(recordEntity())).rejects.toBe(error)
  })
})
