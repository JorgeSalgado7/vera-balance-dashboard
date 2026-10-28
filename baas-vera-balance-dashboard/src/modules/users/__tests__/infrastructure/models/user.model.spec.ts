import { Schema, model } from 'dynamoose'
import { USER_ROLE_VALUES } from '../../../../../constants/user-roles.constant'

jest.mock('dynamoose', () => ({
  Schema: jest.fn(function (definition, options) {
    return { definition, options }
  }),
  model: jest.fn(() => ({})),
}))

describe('UserModel storage contract', () => {
  let configured: { definition: Record<string, any>; options: Record<string, unknown> }
  const previousTableName = process.env.DYNAMO_TABLE_NAME

  beforeAll(() => {
    process.env.DYNAMO_TABLE_NAME = 'users-model-test'
    const { UserModel } = require('../../../infrastructure/models/user.model')
    expect(UserModel).toBe((model as jest.Mock).mock.results[0].value)
    configured = (Schema as unknown as jest.Mock).mock.results[0].value
  })

  afterAll(() => {
    if (previousTableName === undefined) delete process.env.DYNAMO_TABLE_NAME
    else process.env.DYNAMO_TABLE_NAME = previousTableName
  })

  it('uses the configured shared table and disables automatic table creation or updates', () => {
    expect(model).toHaveBeenCalledWith('users-model-test', configured, { create: false, update: false })
  })

  it('declares the documented primary keys and secondary indexes', () => {
    expect(configured.definition.pk).toMatchObject({ type: String, hashKey: true })
    expect(configured.definition.sk).toMatchObject({ type: String, rangeKey: true })
    expect(configured.definition.gsi1pk.index).toMatchObject({ name: 'GSI1', rangeKey: 'gsi1sk', project: true })
    expect(configured.definition.gsi2pk.index).toMatchObject({ name: 'GSI2', rangeKey: 'gsi2sk', project: true })
  })

  it('constrains roles and statuses and leaves timestamps under application control', () => {
    expect(configured.definition.role.enum).toEqual(USER_ROLE_VALUES)
    expect(configured.definition.status.enum).toEqual(['Activo', 'Inactivo'])
    expect(configured.options).toEqual({ timestamps: false, saveUnknown: false })
  })
})
