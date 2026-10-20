import { Injectable } from '@nestjs/common';
import { Condition } from 'dynamoose';
import type { IRequireActiveClinicRepository } from '../../../domain/repositories/require-active-clinic.repository';
import type { TransactionContext } from '../../../../../shared/transactions/transaction-context.interface';
import { DynamooseTransactionManager } from '../../../../../infrastructure/dynamoose/dynamoose-transaction.manager';
import { ClinicModel } from '../models/clinic.model';

@Injectable()
export class RequireActiveClinicDynamooseAdapter implements IRequireActiveClinicRepository {
  constructor(private readonly transactions: DynamooseTransactionManager) {}

  requireActive(id: string, context: TransactionContext): Promise<void> {
    return this.transactions.enlist(context, ClinicModel.transaction.condition(
      { pk: id, sk: 'CLINIC' },
      new Condition().where('pk').exists().and().where('status').eq('active')
    ));
  }
}
