import { processEntity } from '../../fixtures/process.fixture'
import * as dynamoose from 'dynamoose'
jest.mock('dynamoose', () => {
  const actual = jest.requireActual('dynamoose')
  return { ...actual, model: (name: string, schema: unknown, options: Record<string, unknown>) => actual.model(name + '-request-test', schema, { ...options, tableName: 'process-transaction-test', create: false, update: false, waitForActive: false }) }
})
import { CreateTherapeuticProcessDynamooseAdapter } from '../../../infrastructure/persistance/adapters/create-therapeutic-process-dynamoose.adapter'
import { TherapeuticProcessConflictError, TherapeuticProcessTransactionLimitError } from '../../../domain/errors/therapeutic-process.error'

describe('CreateTherapeuticProcess transaction', () => {
  const write = jest.fn()
  const adapter = new CreateTherapeuticProcessDynamooseAdapter()
  beforeEach(() => { jest.resetAllMocks(); dynamoose.aws.ddb.set({ transactWriteItems: write } as never); write.mockResolvedValue({}) })
  afterAll(() => dynamoose.aws.ddb.revert())
  it('atomically creates the process and all patient links using exactly the documented keys and ISO timestamps', async () => {
    const entity = { ...processEntity(), patients: ['patient-id', 'second-id'] }
    expect(await adapter.create(entity)).toEqual(entity)
    expect(write).toHaveBeenCalledTimes(1)
    const changes = write.mock.calls[0][0].TransactItems
    expect(changes).toHaveLength(3)
    expect(changes[0].Put.Item.pk).toEqual({ S: 'process-id' })
    expect(changes[0].Put.Item.sk).toEqual({ S: 'THERAPEUTIC_PROCESS' })
    expect(changes[0].Put.Item.therapy_type).toEqual({ S: 'therapy-id' })
    expect(changes[0].Put.Item.patients).toEqual({ L: [{ S: 'patient-id' }, { S: 'second-id' }] })
    for (let index = 1; index < changes.length; index++) {
      expect(changes[index].Put.Item).toEqual({ pk: { S: index === 1 ? 'PATIENT#patient-id' : 'PATIENT#second-id' }, sk: { S: 'THERAPEUTIC_PROCESS#process-id' }, created_at: { S: entity.created_at }, updated_at: { S: entity.updated_at } })
      expect(changes[index].Put.ConditionExpression).toContain('attribute_not_exists')
    }
  })
  it('maps a cancelled transaction to conflict without separate partial writes', async () => {
    write.mockRejectedValue(Object.assign(new Error('transaction cancelled'), { name: 'TransactionCanceledException' }))
    await expect(adapter.create(processEntity())).rejects.toBeInstanceOf(TherapeuticProcessConflictError)
    expect(write).toHaveBeenCalledTimes(1)
  })
  it('rejects a transaction exceeding the storage service limit before writing', async () => {
    await expect(adapter.create({ ...processEntity(), patients: Array.from({ length: 100 }, (_, i) => String(i)) })).rejects.toBeInstanceOf(TherapeuticProcessTransactionLimitError)
    expect(write).not.toHaveBeenCalled()
  })
  it('propagates infrastructure errors', async () => { write.mockRejectedValue(new Error('network')); await expect(adapter.create(processEntity())).rejects.toThrow('network') })
})
