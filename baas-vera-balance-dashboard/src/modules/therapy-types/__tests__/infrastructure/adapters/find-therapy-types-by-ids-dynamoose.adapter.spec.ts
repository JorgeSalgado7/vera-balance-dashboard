import { FindTherapyTypesByIdsDynamooseAdapter } from '../../../infrastructure/persistance/adapters/find-therapy-types-by-ids-dynamoose.adapter'
import { TherapyTypeModel } from '../../../infrastructure/persistance/models/therapy-type.model'
jest.mock('../../../infrastructure/persistance/models/therapy-type.model', () => ({ TherapyTypeModel: { batchGet: jest.fn() } }))
describe('FindTherapyTypesByIdsDynamooseAdapter', () => {
  const model = TherapyTypeModel as unknown as { batchGet: jest.Mock }
  const adapter = new FindTherapyTypesByIdsDynamooseAdapter()
  beforeEach(() => jest.resetAllMocks())
  it('deduplicates IDs and splits batches at the DynamoDB limit', async () => {
    model.batchGet.mockImplementation(async (keys: Array<{ pk: string, sk: string }>) => keys.map(key => ({ ...key, name: key.pk, icon: null })))
    const ids = Array.from({ length: 101 }, (_, index) => String(index))
    expect(await adapter.findByIds([...ids, '0'])).toHaveLength(101)
    expect(model.batchGet).toHaveBeenCalledTimes(2)
    expect(model.batchGet.mock.calls[0][0]).toHaveLength(100)
    expect(model.batchGet.mock.calls[1][0]).toEqual([{ pk: '100', sk: 'THERAPY_TYPE' }])
  })
  it('does not access DynamoDB for an empty selection', async () => { expect(await adapter.findByIds([])).toEqual([]); expect(model.batchGet).not.toHaveBeenCalled() })
  it('does not interpret unprocessed keys as nonexistent therapy types', async () => {
    model.batchGet.mockResolvedValue(Object.assign([], { unprocessedKeys: [{ pk: 'pending', sk: 'THERAPY_TYPE' }] }))
    await expect(adapter.findByIds(['pending'])).rejects.toThrow('No se pudo completar')
  })
})
