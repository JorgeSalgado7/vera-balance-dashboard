import type { TransactionContext } from '../../../../shared/transactions/transaction-context.interface';

export interface IRequireActiveClinicRepository {
  requireActive(id: string, context: TransactionContext): Promise<void>;
}
