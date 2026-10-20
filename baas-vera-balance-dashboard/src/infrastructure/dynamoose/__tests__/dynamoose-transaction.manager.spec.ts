import * as dynamoose from 'dynamoose';
import { Test, TestingModule } from '@nestjs/testing';
import { DynamooseTransactionManager } from '../dynamoose-transaction.manager';

const TransactionModel = dynamoose.model('TransactionManagerTest', new dynamoose.Schema({
  pk: { type: String, hashKey: true },
  sk: { type: String, rangeKey: true }
}), { tableName: 'transaction-manager-test', create: false, waitForActive: false });

describe('DynamooseTransactionManager', () => {
  let module: TestingModule;
  let manager: DynamooseTransactionManager;
  const ddb = { transactWriteItems: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    ddb.transactWriteItems.mockResolvedValue({});
    dynamoose.aws.ddb.set(ddb as never);
    module = await Test.createTestingModule({ providers: [DynamooseTransactionManager] }).compile();
    manager = module.get(DynamooseTransactionManager);
  });

  afterEach(async () => { await module.close(); });
  afterAll(() => { dynamoose.aws.ddb.revert(); });

  it('keeps concurrent contexts isolated and writes nothing until their commit', async () => {
    const first = manager.begin();
    const second = manager.begin();
    await manager.enlist(first, TransactionModel.transaction.delete({ pk: 'first', sk: 'TEST' }));
    await manager.enlist(second, TransactionModel.transaction.delete({ pk: 'second', sk: 'TEST' }));
    expect(ddb.transactWriteItems).not.toHaveBeenCalled();

    await manager.commit(second);
    await manager.commit(first);
    expect(ddb.transactWriteItems).toHaveBeenCalledTimes(2);
    expect(ddb.transactWriteItems.mock.calls[0][0].TransactItems).toEqual([
      expect.objectContaining({ Delete: expect.objectContaining({
        Key: { pk: { S: 'second' }, sk: { S: 'TEST' } }
      }) })
    ]);
    expect(ddb.transactWriteItems.mock.calls[1][0].TransactItems).toEqual([
      expect.objectContaining({ Delete: expect.objectContaining({
        Key: { pk: { S: 'first' }, sk: { S: 'TEST' } }
      }) })
    ]);
  });

  it('discards a partially prepared transaction without persisting anything', async () => {
    const context = manager.begin();
    await manager.enlist(context, TransactionModel.transaction.delete({ pk: 'first', sk: 'TEST' }));
    manager.discard(context);
    await expect(manager.commit(context)).rejects.toThrow('Transaction context is not active.');
    expect(ddb.transactWriteItems).not.toHaveBeenCalled();
  });

  it('does not reuse operations after a failed commit', async () => {
    const context = manager.begin();
    await manager.enlist(context, TransactionModel.transaction.delete({ pk: 'first', sk: 'TEST' }));
    ddb.transactWriteItems.mockRejectedValueOnce(new Error('Storage unavailable'));
    await expect(manager.commit(context)).rejects.toThrow('Storage unavailable');
    manager.discard(context);
    await expect(manager.commit(context)).rejects.toThrow('Transaction context is not active.');
    expect(ddb.transactWriteItems).toHaveBeenCalledTimes(1);
  });
});
