import type { UserEntity } from '../entities/user.entity';
import type { TransactionContext } from '../../../../shared/transactions/transaction-context.interface';

export type UserPasswordSnapshot = Pick<UserEntity, 'id' | 'email' | 'clinicId' | 'passwordHash'>;

export interface IUpdateUserPasswordRepository {
  update(user: UserPasswordSnapshot, hash: string, context: TransactionContext): Promise<void>;
}
