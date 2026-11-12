import * as dynamoose from 'dynamoose'
import { UpdateUserDynamooseAdapter } from '../../../infrastructure/persistance/adapters/update-user-dynamoose.adapter'
import { UserEntity } from '../../../domain/entities/user.entity'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'

// Build real DynamoDB UpdateItem requests with the installed Dynamoose schema; mock only AWS I/O.
jest.mock('dynamoose', () => {
  const actual = jest.requireActual('dynamoose')
  return { ...actual, model: (_name, schema, options) => actual.model('users-update-request-test', schema, { ...options, create: false, update: false, waitForActive: false }) }
})

const user = Object.assign(new UserEntity(), {
  pk: '22222222-2222-4222-8222-222222222222',
  sk: 'USER',
  name: 'User',
  email: 'user@example.com',
  password: 'secret-hash',
  professional_license: '123',
  role: USER_ROLES.THERAPIST,
  status: 'Activo',
  clinic: '11111111-1111-4111-8111-111111111111',
  gsi1pk: 'USER',
  gsi1sk: 'USER#id',
  gsi2pk: 'CLINIC#old',
  gsi2sk: 'USER#id',
  gsi3pk: 'EMAIL#user@example.com',
  gsi3sk: 'USER#id',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
})

describe('UpdateUser real UpdateItem request', () => {
  const updateItem = jest.fn()
  const adapter = new UpdateUserDynamooseAdapter()
  beforeEach(() => {
    jest.resetAllMocks()
    dynamoose.aws.ddb.set({ updateItem } as never)
    updateItem.mockResolvedValue({ Attributes: dynamoose.aws.converter().marshall({ ...user, role: USER_ROLES.ADMIN, clinic: null }) })
  })
  afterAll(() => dynamoose.aws.ddb.revert())

  it('conditions the write on existence and the previously read timestamp', async () => {
    await adapter.update(user, { name: 'New' }, '2026-11-02T00:00:00.000Z')
    const request = updateItem.mock.calls[0][0]
    expect(request.Key).toEqual({ pk: { S: user.pk }, sk: { S: 'USER' } })
    expect(request.ReturnValues).toBe('ALL_NEW')
    expect(request.ConditionExpression).toContain('attribute_exists')
    expect(Object.values(request.ExpressionAttributeNames)).toEqual(expect.arrayContaining(['pk', 'updated_at', 'name']))
    expect(Object.values(request.ExpressionAttributeValues)).toEqual(expect.arrayContaining([{ S: user.updated_at }, { S: 'New' }, { S: '2026-11-02T00:00:00.000Z' }]))
    expect(Object.values(request.ExpressionAttributeNames)).not.toContain('password')
    expect(Object.values(request.ExpressionAttributeNames)).not.toContain('created_at')
  })

  it('sets explicit clinic null and removes both clinic index keys atomically', async () => {
    await adapter.update(user, { role: USER_ROLES.ADMIN, clinic: null }, '2026-11-02T00:00:00.000Z')
    const request = updateItem.mock.calls[0][0]
    expect(request.UpdateExpression).toContain('REMOVE')
    expect(Object.values(request.ExpressionAttributeNames)).toEqual(expect.arrayContaining(['clinic', 'gsi2pk', 'gsi2sk']))
    expect(Object.values(request.ExpressionAttributeValues)).toContainEqual({ NULL: true })
    expect(Object.values(request.ExpressionAttributeNames)).not.toContain('gsi1pk')
  })
})
