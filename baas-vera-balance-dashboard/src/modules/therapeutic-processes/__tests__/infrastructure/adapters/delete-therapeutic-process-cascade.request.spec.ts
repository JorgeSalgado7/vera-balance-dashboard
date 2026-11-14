import type { TransactWriteItem } from '@aws-sdk/client-dynamodb'
import { processEntity } from '../../fixtures/process.fixture'
import * as dynamoose from 'dynamoose'
jest.mock('dynamoose', () => {
  const actual = jest.requireActual('dynamoose')
  return { ...actual, model: (name: string, schema: unknown, options: Record<string, unknown>) => actual.model(name + '-request-test', schema, { ...options, tableName: 'process-transaction-test', create: false, update: false, waitForActive: false }) }
})
import { DeleteTherapeuticProcessCascadeDynamooseAdapter } from '../../../infrastructure/persistance/adapters/delete-therapeutic-process-cascade-dynamoose.adapter'
import { TherapeuticProcessConflictError } from '../../../domain/errors/therapeutic-process.error'

describe('DeleteTherapeuticProcess cascade', () => {
  const write = jest.fn(); const query = jest.fn(); const get = jest.fn()
  const adapter = new DeleteTherapeuticProcessCascadeDynamooseAdapter()
  const response = (items: Array<{ pk: string, sk: string }>, lastKey?: { pk: string, sk: string }) => ({ Items: items.map(item => dynamoose.aws.converter().marshall(item)), Count: items.length, ScannedCount: items.length, ...(lastKey ? { LastEvaluatedKey: dynamoose.aws.converter().marshall(lastKey) } : {}) })
  beforeEach(() => { jest.resetAllMocks(); dynamoose.aws.ddb.set({ transactWriteItems: write, query, getItem: get } as never); write.mockResolvedValue({}) })
  afterAll(() => dynamoose.aws.ddb.revert())
  it('deletes tasks before records, then patient links and the process last', async () => {
    query.mockResolvedValueOnce(response([{ pk: 'record-id', sk: 'RECORD' }])).mockResolvedValueOnce(response([{ pk: 'task-id', sk: 'HOME_WORK' }]))
    await adapter.deleteCascade(processEntity())
    const deleted = write.mock.calls.flatMap(([request]) => request.TransactItems.filter((item: TransactWriteItem) => item.Delete).map((item: TransactWriteItem) => dynamoose.aws.converter().unmarshall(item.Delete!.Key!)))
    expect(deleted).toEqual([{ pk: 'task-id', sk: 'HOME_WORK' }, { pk: 'record-id', sk: 'RECORD' }, { pk: 'PATIENT#patient-id', sk: 'THERAPEUTIC_PROCESS#process-id' }, { pk: 'process-id', sk: 'THERAPEUTIC_PROCESS' }])
    for (const [request] of write.mock.calls.slice(0, -1)) expect(request.TransactItems[0].ConditionCheck.Key).toEqual({ pk: { S: 'process-id' }, sk: { S: 'THERAPEUTIC_PROCESS' } })
    expect(Object.values(query.mock.calls[0][0].ExpressionAttributeValues)).toContainEqual({ S: 'THERAPEUTIC_PROCESS#process-id' })
    expect(Object.values(query.mock.calls[1][0].ExpressionAttributeValues)).toContainEqual({ S: 'RECORD#record-id' })
  })
  it('paginates dependent records and tasks and supports more than one transaction of tasks', async () => {
    const tasks = Array.from({ length: 101 }, (_, i) => ({ pk: `task-${i}`, sk: 'HOME_WORK' }))
    query.mockResolvedValueOnce(response([], { pk: 'page', sk: 'RECORD' })).mockResolvedValueOnce(response([{ pk: 'record-id', sk: 'RECORD' }])).mockResolvedValueOnce(response(tasks.slice(0, 50), { pk: 'task-page', sk: 'HOME_WORK' })).mockResolvedValueOnce(response(tasks.slice(50)))
    await adapter.deleteCascade(processEntity())
    expect(query).toHaveBeenCalledTimes(4)
    expect(query.mock.calls[1][0].ExclusiveStartKey).toBeDefined()
    expect(query.mock.calls[3][0].ExclusiveStartKey).toBeDefined()
    expect(write.mock.calls.every(([request]) => request.TransactItems.length <= 100)).toBe(true)
    const tasksDeleted = write.mock.calls.flatMap(([request]) => request.TransactItems.filter((item: TransactWriteItem) => item.Delete?.Key?.sk?.S === 'HOME_WORK'))
    expect(tasksDeleted).toHaveLength(101)
  })
  it('does not delete the parent if deleting its tasks fails', async () => {
    query.mockResolvedValueOnce(response([{ pk: 'record-id', sk: 'RECORD' }])).mockResolvedValueOnce(response([{ pk: 'task-id', sk: 'HOME_WORK' }]))
    write.mockRejectedValue(new Error('network'))
    await expect(adapter.deleteCascade(processEntity())).rejects.toThrow('network')
    expect(write).toHaveBeenCalledTimes(1)
    expect(write.mock.calls[0][0].TransactItems.some((item: TransactWriteItem) => item.Delete?.Key?.sk?.S === 'THERAPEUTIC_PROCESS')).toBe(false)
  })
  it('rejects a changed process before continuing the cascade', async () => {
    query.mockResolvedValue(response([]))
    write.mockRejectedValue(Object.assign(new Error(), { name: 'TransactionCanceledException' }))
    get.mockResolvedValue({ Item: dynamoose.aws.converter().marshall({ ...processEntity() }) })
    await expect(adapter.deleteCascade(processEntity())).rejects.toBeInstanceOf(TherapeuticProcessConflictError)
    expect(write).toHaveBeenCalledTimes(1)
  })
})
