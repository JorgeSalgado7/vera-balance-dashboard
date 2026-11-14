jest.mock('../../../infrastructure/persistance/models/homework.model', () => ({ HomeworkModel: { get: jest.fn() } }))
import { HomeworkModel } from '../../../infrastructure/persistance/models/homework.model'
import { FindHomeworkByIdDynamooseAdapter } from '../../../infrastructure/persistance/adapters/find-homework-by-id-dynamoose.adapter'
import { homeworkEntity } from '../../fixtures/homework.fixture'
describe('FindHomeworkByIdDynamooseAdapter', () => {
  beforeEach(() => jest.resetAllMocks())
  it('uses a consistent read with the complete key', async () => {
    jest.mocked(HomeworkModel.get).mockResolvedValue(homeworkEntity() as never)
    expect(await new FindHomeworkByIdDynamooseAdapter().findById('homework-id')).toEqual(homeworkEntity())
    expect(HomeworkModel.get).toHaveBeenCalledWith({ pk: 'homework-id', sk: 'HOME_WORK' }, { consistent: true })
  })
  it('returns null when the task is absent', async () => { expect(await new FindHomeworkByIdDynamooseAdapter().findById('missing')).toBeNull() })
})
