jest.mock('../../../infrastructure/persistance/models/record.model', () => ({ RecordModel: { query: jest.fn() } }))
import { RecordModel } from '../../../infrastructure/persistance/models/record.model'
import { FindRecordsByProcessDynamooseAdapter } from '../../../infrastructure/persistance/adapters/find-records-by-process-dynamoose.adapter'
import { recordEntity } from '../../fixtures/record.fixture'
describe('FindRecordsByProcessDynamooseAdapter', () => {
  beforeEach(() => jest.resetAllMocks())
  it('queries only session keys in GSI2, follows every page including empty pages', async () => {
    const key = { pk: 'next', sk: 'RECORD' }
    const query = { eq: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), beginsWith: jest.fn().mockReturnThis(), using: jest.fn().mockReturnThis(), startAt: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValueOnce(Object.assign([], { lastKey: key })).mockResolvedValueOnce([recordEntity()]) }
    jest.mocked(RecordModel.query).mockReturnValue(query as never)
    expect(await new FindRecordsByProcessDynamooseAdapter().findByProcess('process-id')).toEqual([recordEntity()])
    expect(RecordModel.query).toHaveBeenCalledTimes(2)
    expect(RecordModel.query).toHaveBeenCalledWith('gsi2pk')
    expect(query.eq).toHaveBeenCalledWith('THERAPEUTIC_PROCESS#process-id')
    expect(query.where).toHaveBeenCalledWith('gsi2sk')
    expect(query.beginsWith).toHaveBeenCalledWith('RECORD#')
    expect(query.using).toHaveBeenCalledWith('GSI2')
    expect(query.startAt).toHaveBeenCalledWith(key)
  })
  it('returns no records for an empty result', async () => {
    const query = { eq: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), beginsWith: jest.fn().mockReturnThis(), using: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) }
    jest.mocked(RecordModel.query).mockReturnValue(query as never)
    expect(await new FindRecordsByProcessDynamooseAdapter().findByProcess('process-id')).toEqual([])
  })
})
