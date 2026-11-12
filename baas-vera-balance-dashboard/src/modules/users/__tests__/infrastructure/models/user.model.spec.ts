import { Schema, model } from 'dynamoose'
import { USER_ROLE_VALUES } from '../../../../../constants/user-roles.constant'

jest.mock('dynamoose', () => ({
  type: { NULL: Symbol.for('dynamoose-null') },
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
    const { UserModel } = require('../../../infrastructure/persistance/models/user.model')
    expect(UserModel).toBe((model as jest.Mock).mock.results[0].value)
    configured = (Schema as unknown as jest.Mock).mock.results[0].value
  })

  afterAll(() => {
    if (previousTableName === undefined) delete process.env.DYNAMO_TABLE_NAME
    else process.env.DYNAMO_TABLE_NAME = previousTableName
  })

  it('declares optional recovery credentials without exposing a plain code field', () => {
    expect(configured.definition.password_recovery_code_hash).toEqual({ type: String })
    expect(configured.definition.password_recovery_expires_at).toEqual({ type: String })
    expect(configured.definition).not.toHaveProperty('password_recovery_code')
  })

  it('uses the configured shared table with the default Dynamoose table options', () => {
    expect(model).toHaveBeenCalledWith('users-model-test', configured)
  })

  it('declares the documented primary keys and secondary indexes', () => {
    expect(configured.definition.pk).toMatchObject({ type: String, hashKey: true })
    expect(configured.definition.sk).toMatchObject({ type: String, rangeKey: true })
    expect(configured.definition.gsi1pk.index).toMatchObject({ name: 'GSI1', rangeKey: 'gsi1sk', project: true })
    expect(configured.definition.gsi3pk.index).toMatchObject({ name: 'GSI3', rangeKey: 'gsi3sk', project: true })
    expect(configured.definition.gsi2pk.index).toMatchObject({ name: 'GSI2', rangeKey: 'gsi2sk', project: true })
  })

  it('constrains roles and statuses and leaves timestamps under application control', () => {
    expect(configured.definition.role.enum).toEqual(USER_ROLE_VALUES)
    expect(configured.definition.status.enum).toEqual(['Activo', 'Inactivo'])
    expect(configured.options).toEqual({ timestamps: false })
  })
})
