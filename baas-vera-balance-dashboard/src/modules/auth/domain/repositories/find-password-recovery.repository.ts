import type { PasswordRecoveryEntity } from '../entities/password-recovery.entity';

export interface IFindPasswordRecoveryRepository {
  findByUserId(userId: string): Promise<PasswordRecoveryEntity | null>;
}
