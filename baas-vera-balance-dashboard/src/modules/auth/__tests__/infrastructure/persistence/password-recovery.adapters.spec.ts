import * as dynamoose from 'dynamoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

process.env.DYNAMO_TABLE_NAME = 'auth-recovery-test';
dynamoose.Table.defaults.set({ create: false, waitForActive: false });

const { ConsumePasswordRecoveryDynamooseAdapter } = require('../../../infrastructure/persistence/adapters/consume-password-recovery-dynamoose.adapter');
const { RegisterRecoveryAttemptDynamooseAdapter } = require('../../../infrastructure/persistence/adapters/register-recovery-attempt-dynamoose.adapter');
const { SavePasswordRecoveryDynamooseAdapter } = require('../../../infrastructure/persistence/adapters/save-password-recovery-dynamoose.adapter');
const { FindPasswordRecoveryDynamooseAdapter } = require('../../../infrastructure/persistence/adapters/find-password-recovery-dynamoose.adapter');
const { UsersModule } = require('../../../../users/users.module');
const { ClinicsModule } = require('../../../../clinics/clinics.module');
const { DynamooseModule } = require('../../../../../infrastructure/dynamoose/dynamoose.module');

describe('Password recovery DynamoDB boundaries', () => {
  let module: TestingModule;
  const ddb = { transactWriteItems: jest.fn(), updateItem: jest.fn(), putItem: jest.fn(), getItem: jest.fn() };
  const recovery = {
    userId: 'user', codeHash: 'protected-code', attempts: 4,
    createdAt: '2026-10-19T12:00:00Z', expiresAt: '2026-10-19T12:05:00Z', ttl: 1792411500
  };
  const user = { id: 'user', email: 'user@example.com', clinicId: 'clinic', passwordHash: 'old-hash' };

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-19T12:01:00Z'));
    jest.resetAllMocks();
    ddb.transactWriteItems.mockResolvedValue({});
    ddb.updateItem.mockResolvedValue({ Attributes: {} });
    ddb.putItem.mockResolvedValue({});
    ddb.getItem.mockResolvedValue({});
    dynamoose.aws.ddb.set(ddb as never);
    module = await Test.createTestingModule({
      imports: [UsersModule, ClinicsModule, DynamooseModule],
      providers: [
        ConsumePasswordRecoveryDynamooseAdapter, RegisterRecoveryAttemptDynamooseAdapter,
        SavePasswordRecoveryDynamooseAdapter, FindPasswordRecoveryDynamooseAdapter
      ]
    }).overrideProvider(ConfigService).useValue(new ConfigService({
      AUTH_ALLOWED_ORIGINS: 'https://dashboard.example.com'
    })).compile();
  });

  afterEach(async () => { jest.useRealTimers(); await module.close(); });
  afterAll(() => { dynamoose.aws.ddb.revert(); dynamoose.Table.defaults.set({}); });

  it('updates USER, checks the current CLINIC and consumes PASSWORD_RECOVERY in one transaction', async () => {
    await expect(module.get(ConsumePasswordRecoveryDynamooseAdapter).consume(recovery, user, 'new-hash')).resolves.toBe(true);
    expect(ddb.transactWriteItems).toHaveBeenCalledTimes(1);
    const writes = ddb.transactWriteItems.mock.calls[0][0].TransactItems;
    expect(writes).toHaveLength(3);
    const update = writes.find((write: { Update?: unknown }) => write.Update).Update;
    const deletion = writes.find((write: { Delete?: unknown }) => write.Delete).Delete;
    const clinicCheck = writes.find((write: { ConditionCheck?: unknown }) => write.ConditionCheck).ConditionCheck;
    expect(update.TableName).toBe('auth-recovery-test');
    expect(update.Key).toEqual({ pk: { S: 'user' }, sk: { S: 'USER' } });
    expect(Object.values(update.ExpressionAttributeNames)).toEqual(expect.arrayContaining(['password', 'updated_at', 'status', 'email']));
    expect(update.ConditionExpression).toContain('attribute_exists');
    expect(deletion.Key).toEqual({ pk: { S: 'user' }, sk: { S: 'PASSWORD_RECOVERY' } });
    expect(Object.values(deletion.ExpressionAttributeNames)).toEqual(expect.arrayContaining(['code_hash', 'created_at', 'attempts', 'expires_at']));
    expect(deletion.ConditionExpression).toContain('attribute_exists');
    expect(deletion.ConditionExpression).toContain('>');
    expect(deletion.ConditionExpression).toContain('<');
    expect(clinicCheck.Key).toEqual({ pk: { S: 'clinic' }, sk: { S: 'CLINIC' } });
    expect(Object.values(clinicCheck.ExpressionAttributeNames)).toContain('status');
    expect(ddb.updateItem).not.toHaveBeenCalled();
    expect(ddb.putItem).not.toHaveBeenCalled();
  });

  it('rejects a concurrent consume, fifth failed attempt or replacement without a separate password write', async () => {
    ddb.transactWriteItems.mockRejectedValueOnce(Object.assign(new Error('Conflict'), {
      name: 'TransactionCanceledException', CancellationReasons: [{ Code: 'None' }, { Code: 'None' }, { Code: 'ConditionalCheckFailed' }]
    }));
    await expect(module.get(ConsumePasswordRecoveryDynamooseAdapter).consume(recovery, user, 'new-hash')).resolves.toBe(false);
    expect(ddb.updateItem).not.toHaveBeenCalled();
  });

  it('does not confuse a throughput or storage failure with an invalid recovery', async () => {
    ddb.transactWriteItems.mockRejectedValueOnce(Object.assign(new Error('Provider data'), {
      name: 'TransactionCanceledException', CancellationReasons: [{ Code: 'ProvisionedThroughputExceeded' }]
    }));
    await expect(module.get(ConsumePasswordRecoveryDynamooseAdapter).consume(recovery, user, 'new-hash'))
      .rejects.toThrow('Unable to complete password recovery.');
    expect(ddb.updateItem).not.toHaveBeenCalled();
  });

  it('increments attempts conditionally against the exact issuance, counter and logical expiry', async () => {
    await expect(module.get(RegisterRecoveryAttemptDynamooseAdapter).register(recovery)).resolves.toBe(true);
    const write = ddb.updateItem.mock.calls[0][0];
    expect(write.Key).toEqual({ pk: { S: 'user' }, sk: { S: 'PASSWORD_RECOVERY' } });
    expect(Object.values(write.ExpressionAttributeNames)).toEqual(expect.arrayContaining(['attempts', 'created_at', 'code_hash', 'expires_at']));
    expect(write.ConditionExpression).toContain('attribute_exists');
    expect(write.ConditionExpression).toContain('<');
  });

  it('reports a changed recovery snapshot so the use case can safely reread and retry', async () => {
    ddb.updateItem.mockRejectedValueOnce(Object.assign(new Error('Changed'), { name: 'ConditionalCheckFailedException' }));
    await expect(module.get(RegisterRecoveryAttemptDynamooseAdapter).register(recovery)).resolves.toBe(false);
  });

  it('replaces the same documented recovery item without storing the original code or changing USER', async () => {
    await module.get(SavePasswordRecoveryDynamooseAdapter).save(recovery);
    const write = ddb.putItem.mock.calls[0][0];
    expect(write.Item.pk).toEqual({ S: 'user' });
    expect(write.Item.sk).toEqual({ S: 'PASSWORD_RECOVERY' });
    expect(write.Item.code_hash).toEqual({ S: 'protected-code' });
    expect(Object.keys(write.Item).sort()).toEqual(['attempts', 'code_hash', 'created_at', 'expires_at', 'pk', 'sk', 'ttl']);
    expect(ddb.updateItem).not.toHaveBeenCalled();
  });

  it('uses a strongly consistent recovery read, without depending on eventual TTL deletion', async () => {
    await expect(module.get(FindPasswordRecoveryDynamooseAdapter).findByUserId('user')).resolves.toBeNull();
    expect(ddb.getItem).toHaveBeenCalledWith(expect.objectContaining({
      Key: { pk: { S: 'user' }, sk: { S: 'PASSWORD_RECOVERY' } }, ConsistentRead: true
    }));
    expect(ddb.updateItem).not.toHaveBeenCalled();
  });
});
