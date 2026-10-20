import type { PasswordRecoveryEntity } from '../entities/password-recovery.entity';

export interface IConsumePasswordRecoveryRepository {
  consume(recovery: PasswordRecoveryEntity, user: {
    id: string;
    email: string;
    clinicId: string;
    passwordHash: string;
  }, passwordHash: string): Promise<boolean>;
}
