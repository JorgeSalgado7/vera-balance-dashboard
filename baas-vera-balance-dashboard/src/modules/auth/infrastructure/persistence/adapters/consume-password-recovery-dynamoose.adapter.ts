import { Injectable } from '@nestjs/common';
import type { IConsumePasswordRecoveryRepository } from '../../../domain/repositories/consume-password-recovery.repository';
import type { PasswordRecoveryEntity } from '../../../domain/entities/password-recovery.entity';
import { PasswordRecoveryModel } from '../models/password-recovery.model';
import { passwordRecoveryCondition } from '../conditions/password-recovery.condition';
import { UpdateUserPasswordUseCase } from '../../../../users/application/use-cases/update-user-password.use-case';
import { RequireActiveClinicUseCase } from '../../../../clinics/application/use-cases/require-active-clinic.use-case';
import { DynamooseTransactionManager } from '../../../../../infrastructure/dynamoose/dynamoose-transaction.manager';
import { isConditionalTransactionFailure } from '../../../../../infrastructure/dynamoose/is-conditional-transaction-failure';

@Injectable()
export class ConsumePasswordRecoveryDynamooseAdapter implements IConsumePasswordRecoveryRepository {
  constructor(
    private readonly userPassword: UpdateUserPasswordUseCase,
    private readonly activeClinic: RequireActiveClinicUseCase,
    private readonly transactions: DynamooseTransactionManager
  ) {}

  async consume(recovery: PasswordRecoveryEntity, user: {
    id: string; email: string; clinicId: string; passwordHash: string;
  }, hash: string): Promise<boolean> {
    const context = this.transactions.begin();
    try {
      await this.userPassword.execute(user, hash, context);
      await this.activeClinic.execute(user.clinicId, context);
      await this.transactions.enlist(context,
        PasswordRecoveryModel.transaction.delete(
          { pk: recovery.userId, sk: 'PASSWORD_RECOVERY' },
          { condition: passwordRecoveryCondition(recovery) }
        )
      );
      await this.transactions.commit(context);
      return true;
    } catch (error) {
      if (isConditionalTransactionFailure(error)) return false;
      throw new Error('Unable to complete password recovery.');
    } finally {
      this.transactions.discard(context);
    }
  }
}
