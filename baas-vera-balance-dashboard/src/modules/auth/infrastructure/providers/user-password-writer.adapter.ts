import { Injectable } from '@nestjs/common';
import type { UserPasswordWriterPort } from '../../application/ports/user-password-writer.port';
import type { AuthUser } from '../../application/ports/auth-user-reader.port';
import { UpdateUserPasswordUseCase } from '../../../users/application/use-cases/update-user-password.use-case';
import { RequireActiveClinicUseCase } from '../../../clinics/application/use-cases/require-active-clinic.use-case';
import { DynamooseTransactionManager } from '../../../../infrastructure/dynamoose/dynamoose-transaction.manager';
import { InvalidSessionError } from '../../domain/errors/auth.error';
import { isConditionalTransactionFailure } from '../persistence/errors/is-conditional-transaction-failure';

@Injectable()
export class UserPasswordWriterAdapter implements UserPasswordWriterPort {
  constructor(
    private readonly userPassword: UpdateUserPasswordUseCase,
    private readonly activeClinic: RequireActiveClinicUseCase,
    private readonly transactions: DynamooseTransactionManager
  ) {}

  async update(user: AuthUser, hash: string): Promise<void> {
    const context = this.transactions.begin();
    try {
      await this.userPassword.execute(user, hash, context);
      await this.activeClinic.execute(user.clinicId, context);
      await this.transactions.commit(context);
    } catch (error) {
      if (isConditionalTransactionFailure(error)) {
        throw new InvalidSessionError();
      }
      throw new Error('Unable to update password.');
    } finally {
      this.transactions.discard(context);
    }
  }
}
