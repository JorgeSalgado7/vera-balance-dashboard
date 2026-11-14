jest.mock('../../../infrastructure/persistance/models/homework.model', () => ({ HomeworkModel: { update: jest.fn() } }))
import { HomeworkModel } from '../../../infrastructure/persistance/models/homework.model'
import { UpdateHomeworkDynamooseAdapter } from '../../../infrastructure/persistance/adapters/update-homework-dynamoose.adapter'
import { HomeworkNotFoundError } from '../../../domain/errors/homework.error'
import { homeworkEntity } from '../../fixtures/homework.fixture'
describe('UpdateHomeworkDynamooseAdapter', () => {
  beforeEach(() => jest.resetAllMocks())
  it('sets only description and updated_at with an existence condition', async () => {
    const saved = { ...homeworkEntity(), description: 'Nueva', updated_at: '2026-11-14T00:00:00.000Z' }
    jest.mocked(HomeworkModel.update).mockResolvedValue(saved as never)
    expect(await new UpdateHomeworkDynamooseAdapter().update('homework-id', { description: 'Nueva' }, saved.updated_at)).toEqual(saved)
    expect(HomeworkModel.update).toHaveBeenCalledWith({ pk: 'homework-id', sk: 'HOME_WORK' }, { $SET: { description: 'Nueva', updated_at: saved.updated_at } }, { condition: expect.anything(), returnValues: 'ALL_NEW' })
  })
  it('does not recreate a deleted task', async () => {
    jest.mocked(HomeworkModel.update).mockRejectedValue(Object.assign(new Error(), { name: 'ConditionalCheckFailedException' }) as never)
    await expect(new UpdateHomeworkDynamooseAdapter().update('missing', { description: 'Nueva' }, 'now')).rejects.toBeInstanceOf(HomeworkNotFoundError)
  })
  it('preserves infrastructure failures', async () => {
    const error = new Error('Network'); jest.mocked(HomeworkModel.update).mockRejectedValue(error as never)
    await expect(new UpdateHomeworkDynamooseAdapter().update('id', { description: 'Nueva' }, 'now')).rejects.toBe(error)
  })
})
