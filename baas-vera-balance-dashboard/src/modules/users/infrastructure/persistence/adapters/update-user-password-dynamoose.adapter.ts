import { Injectable } from '@nestjs/common';
import { Condition } from 'dynamoose';
import type { IUpdateUserPasswordRepository, UserPasswordSnapshot } from '../../../domain/repositories/update-user-password.repository';
import type { TransactionContext } from '../../../../../shared/transactions/transaction-context.interface';
import { DynamooseTransactionManager } from '../../../../../infrastructure/dynamoose/dynamoose-transaction.manager';
import { UserModel } from '../models/user.model';

@Injectable()
export class UpdateUserPasswordDynamooseAdapter implements IUpdateUserPasswordRepository {
  constructor(private readonly transactions: DynamooseTransactionManager) {}

  update(user: UserPasswordSnapshot, hash: string, context: TransactionContext): Promise<void> {
    return this.transactions.enlist(context, UserModel.transaction.update(
      { pk: user.id, sk: 'USER' },
      { $SET: { password: hash, updated_at: new Date().toISOString() } },
      {
        condition: new Condition().where('pk').exists()
          .and().where('status').eq('active')
          .and().where('email').eq(user.email)
          .and().where('clinic.pk').eq(user.clinicId)
          .and().where('password').eq(user.passwordHash)
      }
    ));
  }
}
