jest.mock('../../../infrastructure/persistance/models/homework.model', () => ({ HomeworkModel: { query: jest.fn() } }))
import { HomeworkModel } from '../../../infrastructure/persistance/models/homework.model'
import { FindHomeworksByRecordDynamooseAdapter } from '../../../infrastructure/persistance/adapters/find-homeworks-by-record-dynamoose.adapter'
import { homeworkEntity } from '../../fixtures/homework.fixture'
describe('FindHomeworksByRecordDynamooseAdapter', () => {
  beforeEach(() => jest.resetAllMocks())
  it('queries the record GSI2 partition and HOME_WORK prefix through all pages', async () => {
    const lastKey = { pk: 'next', sk: 'HOME_WORK' }
    const query = { eq: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), beginsWith: jest.fn().mockReturnThis(), using: jest.fn().mockReturnThis(), startAt: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValueOnce(Object.assign([], { lastKey })).mockResolvedValueOnce([homeworkEntity()]) }
    jest.mocked(HomeworkModel.query).mockReturnValue(query as never)
    expect(await new FindHomeworksByRecordDynamooseAdapter().findByRecord('record-id')).toEqual([homeworkEntity()])
    expect(HomeworkModel.query).toHaveBeenCalledTimes(2)
    expect(HomeworkModel.query).toHaveBeenCalledWith('gsi2pk')
    expect(query.eq).toHaveBeenCalledWith('RECORD#record-id')
    expect(query.where).toHaveBeenCalledWith('gsi2sk')
    expect(query.beginsWith).toHaveBeenCalledWith('HOME_WORK#')
    expect(query.using).toHaveBeenCalledWith('GSI2')
    expect(query.startAt).toHaveBeenCalledWith(lastKey)
  })
  it('returns an empty array for a record without homeworks', async () => {
    const query = { eq: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), beginsWith: jest.fn().mockReturnThis(), using: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) }
    jest.mocked(HomeworkModel.query).mockReturnValue(query as never)
    expect(await new FindHomeworksByRecordDynamooseAdapter().findByRecord('record-id')).toEqual([])
  })
})
