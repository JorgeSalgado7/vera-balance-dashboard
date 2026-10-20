import { Injectable } from '@nestjs/common';
import type { IRegisterRecoveryAttemptRepository } from '../../../domain/repositories/register-recovery-attempt.repository';
import type { PasswordRecoveryEntity } from '../../../domain/entities/password-recovery.entity';
import { PasswordRecoveryModel } from '../models/password-recovery.model';
import { passwordRecoveryCondition } from '../conditions/password-recovery.condition';

@Injectable()
export class RegisterRecoveryAttemptDynamooseAdapter implements IRegisterRecoveryAttemptRepository {
  async register(recovery: PasswordRecoveryEntity): Promise<boolean> {
    try {
      await PasswordRecoveryModel.update(
        { pk: recovery.userId, sk: 'PASSWORD_RECOVERY' },
        { $ADD: { attempts: 1 } },
        { condition: passwordRecoveryCondition(recovery) }
      );
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') return false;
      throw new Error('Unable to register recovery attempt.');
    }
  }
}
