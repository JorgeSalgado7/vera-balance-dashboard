import { processEntity } from '../../fixtures/process.fixture'
import * as dynamoose from 'dynamoose'
jest.mock('dynamoose', () => {
  const actual = jest.requireActual('dynamoose')
  return { ...actual, model: (name: string, schema: unknown, options: Record<string, unknown>) => actual.model(name + '-request-test', schema, { ...options, tableName: 'process-transaction-test', create: false, update: false, waitForActive: false }) }
})
import { UpdateTherapeuticProcessDynamooseAdapter } from '../../../infrastructure/persistance/adapters/update-therapeutic-process-dynamoose.adapter'
import { TherapeuticProcessConflictError, TherapeuticProcessNotFoundError } from '../../../domain/errors/therapeutic-process.error'

describe('UpdateTherapeuticProcess transaction', () => {
  const write = jest.fn(); const get = jest.fn()
  const adapter = new UpdateTherapeuticProcessDynamooseAdapter()
  beforeEach(() => { jest.resetAllMocks(); dynamoose.aws.ddb.set({ transactWriteItems: write, getItem: get } as never); write.mockResolvedValue({}) })
  afterAll(() => dynamoose.aws.ddb.revert())
  it('updates therapist GSI3 and atomically adds/removes only changed patient links', async () => {
    const entity = { ...processEntity(), patients: ['kept', 'removed'] }
    const result = await adapter.update(entity, { therapist: 'new-therapist', patients: ['kept', 'added'] }, '2026-11-12T10:30:00.000Z')
    const changes = write.mock.calls[0][0].TransactItems
    expect(changes).toHaveLength(3)
    expect(changes[0].Update.Key).toEqual({ pk: { S: 'process-id' }, sk: { S: 'THERAPEUTIC_PROCESS' } })
    expect(changes[0].Update.ConditionExpression).toContain('attribute_exists')
    expect(Object.values(changes[0].Update.ExpressionAttributeValues)).toEqual(expect.arrayContaining([{ S: entity.updated_at }, { S: 'THERAPIST#new-therapist' }]))
    expect(Object.values(changes[0].Update.ExpressionAttributeNames)).not.toContain('created_at')
    expect(Object.values(changes[0].Update.ExpressionAttributeNames)).not.toContain('clinic')
    expect(changes[1].Put.Item.pk).toEqual({ S: 'PATIENT#added' })
    expect(changes[2].Delete.Key).toEqual({ pk: { S: 'PATIENT#removed' }, sk: { S: 'THERAPEUTIC_PROCESS#process-id' } })
    expect(result).toMatchObject({ therapist: 'new-therapist', gsi3pk: 'THERAPIST#new-therapist', patients: ['kept', 'added'], created_at: entity.created_at })
  })
  it('does not recreate unchanged patient links', async () => { await adapter.update(processEntity(), { goals: 'New' }, '2026-11-12T10:30:00.000Z'); expect(write.mock.calls[0][0].TransactItems).toHaveLength(1) })
  it.each([true, false])('distinguishes concurrent edits from deletion (exists=%s)', async exists => {
    write.mockRejectedValue(Object.assign(new Error(), { name: 'TransactionCanceledException' }))
    get.mockResolvedValue(exists ? { Item: dynamoose.aws.converter().marshall({ ...processEntity() }) } : {})
    await expect(adapter.update(processEntity(), { goals: 'New' }, '2026-11-12T10:30:00.000Z')).rejects.toBeInstanceOf(exists ? TherapeuticProcessConflictError : TherapeuticProcessNotFoundError)
  })
})
