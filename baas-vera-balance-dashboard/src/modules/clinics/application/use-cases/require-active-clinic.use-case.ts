import { Inject, Injectable } from '@nestjs/common';
import type { IRequireActiveClinicRepository } from '../../domain/repositories/require-active-clinic.repository';
import type { TransactionContext } from '../../../../shared/transactions/transaction-context.interface';

@Injectable()
export class RequireActiveClinicUseCase {
  constructor(
    @Inject('IRequireActiveClinicRepository') private readonly repository: IRequireActiveClinicRepository
  ) {}

  execute(id: string, context: TransactionContext): Promise<void> {
    return this.repository.requireActive(id, context);
  }
}
