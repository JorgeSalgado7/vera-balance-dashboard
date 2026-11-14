jest.mock('../../../infrastructure/persistance/models/record.model', () => ({ RecordModel: { get: jest.fn() } }))
import { RecordModel } from '../../../infrastructure/persistance/models/record.model'
import { FindRecordByIdDynamooseAdapter } from '../../../infrastructure/persistance/adapters/find-record-by-id-dynamoose.adapter'
import { recordEntity } from '../../fixtures/record.fixture'
describe('FindRecordByIdDynamooseAdapter', () => {
  beforeEach(() => jest.resetAllMocks())
  it('gets a session with its full key and a consistent read', async () => {
    jest.mocked(RecordModel.get).mockResolvedValue(recordEntity() as never)
    expect(await new FindRecordByIdDynamooseAdapter().findById('record-id')).toEqual(recordEntity())
    expect(RecordModel.get).toHaveBeenCalledWith({ pk: 'record-id', sk: 'RECORD' }, { consistent: true })
  })
  it('returns null when absent', async () => { expect(await new FindRecordByIdDynamooseAdapter().findById('missing')).toBeNull() })
})
