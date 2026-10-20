import * as dynamoose from 'dynamoose';
import { Test, TestingModule } from '@nestjs/testing';
import { actor, targetId, makeUser } from '../../fixtures/user-use-cases.fixture';
import { UserMutationConflictError } from '../../../domain/errors/user.error';

process.env.DYNAMO_TABLE_NAME = 'users-persistence-test';
dynamoose.Table.defaults.set({ create: false, waitForActive: false });
const { CreateUserDynamooseAdapter } = require('../../../infrastructure/persistence/adapters/create-user-dynamoose.adapter');
const { UpdateUserDynamooseAdapter } = require('../../../infrastructure/persistence/adapters/update-user-dynamoose.adapter');
const { ChangeUserStatusDynamooseAdapter } = require('../../../infrastructure/persistence/adapters/change-user-status-dynamoose.adapter');
const { DeleteUserDynamooseAdapter } = require('../../../infrastructure/persistence/adapters/delete-user-dynamoose.adapter');
const { FindUsersDynamooseAdapter } = require('../../../infrastructure/persistence/adapters/find-users-dynamoose.adapter');
const { FindUserByIdDynamooseAdapter } = require('../../../infrastructure/persistence/adapters/find-user-by-id-dynamoose.adapter');
const { FindUserByEmailDynamooseAdapter } = require('../../../infrastructure/persistence/adapters/find-user-by-email-dynamoose.adapter');
const { UserMapper } = require('../../../infrastructure/mappers/user.mapper');

describe('Users DynamoDB adapters', () => {
  let module: TestingModule;
  const ddb = { transactWriteItems: jest.fn(), scan: jest.fn(), getItem: jest.fn(), putItem: jest.fn(), updateItem: jest.fn(), deleteItem: jest.fn() };
  const conflict = () => Object.assign(new Error('Concurrent state change'), {
    name: 'TransactionCanceledException',
    CancellationReasons: [{ Code: 'ConditionalCheckFailed' }, { Code: 'None' }]
  });

  beforeEach(async () => {
    jest.resetAllMocks();
    ddb.transactWriteItems.mockResolvedValue({});
    dynamoose.aws.ddb.set(ddb as never);
    module = await Test.createTestingModule({
      providers: [
        CreateUserDynamooseAdapter, UpdateUserDynamooseAdapter,
        ChangeUserStatusDynamooseAdapter, DeleteUserDynamooseAdapter, FindUsersDynamooseAdapter,
        FindUserByIdDynamooseAdapter, FindUserByEmailDynamooseAdapter
      ]
    }).compile();
  });
  afterEach(async () => { await module.close(); });
  afterAll(() => { dynamoose.aws.ddb.revert(); dynamoose.Table.defaults.set({}); });

  it('creates one documented USER item with a hash and a conditional administrator check', async () => {
    await module.get(CreateUserDynamooseAdapter).create(makeUser(), actor);
    const writes = ddb.transactWriteItems.mock.calls[0][0].TransactItems;
    expect(writes).toHaveLength(2);
    const put = writes.find((entry: { Put?: unknown }) => entry.Put).Put;
    expect(put.TableName).toBe('users-persistence-test');
    expect(put.Item.password).toEqual({ S: 'stored-password-hash' });
    expect(put.Item.clinic).toEqual({ M: { pk: { S: actor.clinicId }, sk: { S: 'CLINIC' } } });
    expect(put.Item).not.toHaveProperty('password_confirmation');
    expect(put.ConditionExpression).toContain('attribute_not_exists');
    expect(writes.find((entry: { ConditionCheck?: unknown }) => entry.ConditionCheck).ConditionCheck.Key)
      .toEqual({ pk: { S: actor.id }, sk: { S: 'USER' } });
  });

  it('checks another active same-clinic administrator in the SAME transaction as self demotion', async () => {
    const current = makeUser({ ...actor });
    const next = makeUser({ ...actor, role: 'therapist', updatedAt: '2026-10-20T12:00:00Z' });
    const witness = makeUser({ role: 'clinic' });
    await module.get(UpdateUserDynamooseAdapter).update(current, next, actor, witness);
    const writes = ddb.transactWriteItems.mock.calls[0][0].TransactItems;
    expect(writes).toHaveLength(2);
    const check = writes.find((entry: { ConditionCheck?: unknown }) => entry.ConditionCheck).ConditionCheck;
    expect(check.Key).toEqual({ pk: { S: targetId }, sk: { S: 'USER' } });
    expect(Object.values(check.ExpressionAttributeNames)).toEqual(expect.arrayContaining(['status', 'role', 'clinic', 'pk']));
    expect(Object.values(check.ExpressionAttributeValues)).toEqual(expect.arrayContaining([
      { S: 'active' }, { S: 'clinic' }, { S: actor.clinicId }
    ]));
    const update = writes.find((entry: { Update?: unknown }) => entry.Update).Update;
    expect(update.Key).toEqual({ pk: { S: actor.id }, sk: { S: 'USER' } });
    expect(update.ConditionExpression).toContain('attribute_exists');
    expect(ddb.updateItem).not.toHaveBeenCalled();
  });

  it('changes only status and updated_at and protects the witness when deactivating an administrator', async () => {
    const current = makeUser({ ...actor });
    const next = makeUser({ ...actor, status: 'inactive', updatedAt: '2026-10-20T12:00:00Z' });
    await module.get(ChangeUserStatusDynamooseAdapter).change(current, next, actor, makeUser({ role: 'clinic' }));
    const writes = ddb.transactWriteItems.mock.calls[0][0].TransactItems;
    expect(writes).toHaveLength(2);
    const update = writes.find((entry: { Update?: unknown }) => entry.Update).Update;
    const setNames = [...update.UpdateExpression.matchAll(/#[A-Za-z0-9_]+/g)]
      .map((match: RegExpMatchArray) => update.ExpressionAttributeNames[match[0]]);
    expect(setNames.sort()).toEqual(['status', 'updated_at']);
    expect(update.ConditionExpression).toContain('attribute_exists');
    expect(writes.some((entry: { ConditionCheck?: unknown }) => entry.ConditionCheck)).toBe(true);
  });

  it('does not add duplicate condition operations when the authenticated administrator is the witness', async () => {
    const current = makeUser({ role: 'clinic' });
    await module.get(ChangeUserStatusDynamooseAdapter).change(
      current, makeUser({ role: 'clinic', status: 'inactive' }), actor, makeUser({ ...actor })
    );
    expect(ddb.transactWriteItems.mock.calls[0][0].TransactItems).toHaveLength(2);
  });

  it.each(['update', 'status', 'delete'])('maps conditional %s conflicts without a partial standalone write', async operation => {
    ddb.transactWriteItems.mockRejectedValueOnce(conflict());
    const current = makeUser();
    const call = operation === 'update'
      ? module.get(UpdateUserDynamooseAdapter).update(current, makeUser({ name: 'New name' }), actor)
      : operation === 'status'
        ? module.get(ChangeUserStatusDynamooseAdapter).change(current, makeUser({ status: 'inactive' }), actor)
        : module.get(DeleteUserDynamooseAdapter).delete(current, actor);
    await expect(call).rejects.toThrow(UserMutationConflictError);
    expect(ddb.putItem).not.toHaveBeenCalled();
    expect(ddb.updateItem).not.toHaveBeenCalled();
    expect(ddb.deleteItem).not.toHaveBeenCalled();
  });

  it('deletes only the requested USER and conditionally checks the administrator', async () => {
    await module.get(DeleteUserDynamooseAdapter).delete(makeUser(), actor);
    const writes = ddb.transactWriteItems.mock.calls[0][0].TransactItems;
    expect(writes).toHaveLength(2);
    const deletion = writes.find((entry: { Delete?: unknown }) => entry.Delete).Delete;
    expect(deletion.Key).toEqual({ pk: { S: targetId }, sk: { S: 'USER' } });
    expect(deletion.ConditionExpression).toContain('attribute_exists');
    expect(writes.filter((entry: { Delete?: unknown }) => entry.Delete)).toHaveLength(1);
  });

  it('queries all pages with a consistent clinic filter before mapping users', async () => {
    const marshal = dynamoose.aws.converter().marshall;
    const second = makeUser({ ...actor, email: 'admin@example.com' });
    ddb.scan.mockResolvedValueOnce({
      Items: [marshal(UserMapper.toPersistence(makeUser()))],
      LastEvaluatedKey: { pk: { S: targetId }, sk: { S: 'USER' } }
    }).mockResolvedValueOnce({ Items: [marshal(UserMapper.toPersistence(second))] });
    const result = await module.get(FindUsersDynamooseAdapter).findByClinicId(actor.clinicId);
    expect(result).toHaveLength(2);
    expect(ddb.scan).toHaveBeenCalledTimes(2);
    const query = ddb.scan.mock.calls[0][0];
    expect(query.ConsistentRead).toBe(true);
    expect(Object.values(query.ExpressionAttributeNames)).toEqual(expect.arrayContaining(['sk', 'clinic', 'pk']));
    expect(Object.values(query.ExpressionAttributeValues)).toContainEqual({ S: actor.clinicId });
    expect(ddb.scan.mock.calls[1][0].ExclusiveStartKey).toEqual({
      pk: { S: targetId }, sk: { S: 'USER' }
    });
  });

  it.each(['id', 'email', 'clinic'])('sanitizes %s read failures before they can reach the HTTP logger', async read => {
    ddb.getItem.mockRejectedValue(new Error('private-password-hash-in-provider-error'));
    ddb.scan.mockRejectedValue(new Error('private-password-hash-in-provider-error'));
    const operation = read === 'id'
      ? module.get(FindUserByIdDynamooseAdapter).findById(targetId)
      : read === 'email'
        ? module.get(FindUserByEmailDynamooseAdapter).findByEmail('user@example.com')
        : module.get(FindUsersDynamooseAdapter).findByClinicId(actor.clinicId);
    try {
      await operation;
      throw new Error('Expected failure');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toMatch(/^Unable to read/);
      expect((error as Error).message).not.toContain('private-password-hash');
    }
  });
});
