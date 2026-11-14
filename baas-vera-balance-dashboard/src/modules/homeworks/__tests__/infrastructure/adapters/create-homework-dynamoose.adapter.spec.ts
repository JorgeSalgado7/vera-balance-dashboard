jest.mock('../../../infrastructure/persistance/models/homework.model', () => ({ HomeworkModel: { create: jest.fn() } }))
import { HomeworkModel } from '../../../infrastructure/persistance/models/homework.model'
import { CreateHomeworkDynamooseAdapter } from '../../../infrastructure/persistance/adapters/create-homework-dynamoose.adapter'
import { homeworkEntity } from '../../fixtures/homework.fixture'
describe('CreateHomeworkDynamooseAdapter', () => {
  beforeEach(() => jest.resetAllMocks())
  it('writes the documented item without overwriting existing data', async () => {
    const entity = homeworkEntity()
    expect(await new CreateHomeworkDynamooseAdapter().create(entity)).toBe(entity)
    expect(HomeworkModel.create).toHaveBeenCalledWith({ ...entity }, { overwrite: false })
  })
  it('propagates storage failures', async () => {
    const error = new Error('Network'); jest.mocked(HomeworkModel.create).mockRejectedValue(error as never)
    await expect(new CreateHomeworkDynamooseAdapter().create(homeworkEntity())).rejects.toBe(error)
  })
})
