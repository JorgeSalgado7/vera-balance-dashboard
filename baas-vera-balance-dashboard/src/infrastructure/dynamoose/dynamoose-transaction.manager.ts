import { Injectable } from '@nestjs/common';
import { transaction } from 'dynamoose';
import type { TransactionContext } from '../../shared/transactions/transaction-context.interface';

type TransactionOperation = Parameters<typeof transaction>[0][number];

@Injectable()
export class DynamooseTransactionManager {
  private readonly operations = new WeakMap<TransactionContext, TransactionOperation[]>();

  begin(): TransactionContext {
    const context = Object.freeze({ transactionId: Symbol('transaction') });
    this.operations.set(context, []);
    return context;
  }

  async enlist(context: TransactionContext, operation: TransactionOperation): Promise<void> {
    const operations = this.operations.get(context);
    if (!operations) throw new Error('Transaction context is not active.');
    // Resolve request construction before retaining it, so a later failure
    // cannot leave an unobserved rejected promise behind.
    const prepared = await operation;
    if (this.operations.get(context) !== operations) {
      throw new Error('Transaction context is not active.');
    }
    operations.push(prepared);
  }

  async commit(context: TransactionContext): Promise<void> {
    const operations = this.operations.get(context);
    if (!operations) throw new Error('Transaction context is not active.');
    this.operations.delete(context);
    await transaction(operations);
  }

  discard(context: TransactionContext): void {
    this.operations.delete(context);
  }
}
