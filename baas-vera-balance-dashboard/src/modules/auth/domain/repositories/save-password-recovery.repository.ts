import type { PasswordRecoveryEntity } from '../entities/password-recovery.entity';

export interface ISavePasswordRecoveryRepository {
  save(recovery: PasswordRecoveryEntity): Promise<void>;
}
