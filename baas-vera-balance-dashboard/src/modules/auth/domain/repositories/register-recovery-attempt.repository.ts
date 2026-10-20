import type { PasswordRecoveryEntity } from '../entities/password-recovery.entity';

export interface IRegisterRecoveryAttemptRepository {
  register(recovery: PasswordRecoveryEntity): Promise<boolean>;
}
