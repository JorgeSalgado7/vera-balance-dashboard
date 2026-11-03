import { USER_ROLES } from '../../../../../constants/user-roles.constant'
import { CreateUserDomainService } from '../../../domain/services/create-user.domain-service'
import { ValidateCreateUserDomainService } from '../../../domain/services/validate-create-user.domain-service'
import { UserMapper } from '../../../infrastructure/mappers/user.mapper'

// Use the installed schema and serializer with table initialization disabled; no AWS requests.
jest.mock('dynamoose', () => {
  const actual = jest.requireActual('dynamoose')
  return { ...actual, model: (name, schema, options) => actual.model(name, schema, { ...options, initialize: false }) }
})

describe('UserModel DynamoDB serialization', () => {
  let UserModel: typeof import('../../../infrastructure/models/user.model').UserModel
  const previousTable = process.env.DYNAMO_TABLE_NAME

  beforeAll(() => {
    process.env.DYNAMO_TABLE_NAME = 'users-serialization-test'
    UserModel = require('../../../infrastructure/models/user.model').UserModel
  })

  afterAll(() => {
    if (previousTable === undefined) delete process.env.DYNAMO_TABLE_NAME
    else process.env.DYNAMO_TABLE_NAME = previousTable
  })

  it.each([null, '11111111-1111-4111-8111-111111111111'])('serializes clinic %s and all documented indexes with the real schema', async clinic => {
    const service = new CreateUserDomainService(new ValidateCreateUserDomainService())
    const entity = service.create({
      id: '33333333-3333-4333-8333-333333333333', name: 'User', email: 'user@example.com', password: 'hashed-password',
      professional_license: '123', role: clinic === null ? USER_ROLES.ADMIN : USER_ROLES.THERAPIST, status: 'Activo', clinic,
      created_at: '2026-11-02T00:00:00.000Z', updated_at: '2026-11-02T00:00:00.000Z',
    })
    const item = await new UserModel(UserMapper.toPersistence(entity)).toDynamo({ validate: true, required: true })
    expect(item.clinic).toEqual(clinic === null ? { NULL: true } : { S: clinic })
    expect(item.gsi1pk).toEqual({ S: 'USER' })
    expect(item.gsi1sk).toEqual({ S: `USER#${entity.pk}` })
    expect(item.gsi3pk).toEqual({ S: 'EMAIL#user@example.com' })
    expect(item.gsi3sk).toEqual({ S: `USER#${entity.pk}` })
    if (clinic === null) {
      expect(item).not.toHaveProperty('gsi2pk')
      expect(item).not.toHaveProperty('gsi2sk')
    } else {
      expect(item.gsi2pk).toEqual({ S: `CLINIC#${clinic}` })
      expect(item.gsi2sk).toEqual({ S: `USER#${entity.pk}` })
    }
  })
})
