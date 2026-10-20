import { Inject, Injectable } from '@nestjs/common';
import type { IUpdateUserPasswordRepository, UserPasswordSnapshot } from '../../domain/repositories/update-user-password.repository';
import type { TransactionContext } from '../../../../shared/transactions/transaction-context.interface';

@Injectable()
export class UpdateUserPasswordUseCase {
  constructor(
    @Inject('IUpdateUserPasswordRepository') private readonly repository: IUpdateUserPasswordRepository
  ) {}

  execute(user: UserPasswordSnapshot, hash: string, context: TransactionContext): Promise<void> {
    return this.repository.update(user, hash, context);
  }
}
