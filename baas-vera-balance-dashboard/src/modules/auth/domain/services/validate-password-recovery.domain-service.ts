import { Injectable } from '@nestjs/common';
import type { PasswordRecoveryEntity } from '../entities/password-recovery.entity';
import { InvalidRecoveryCodeError } from '../errors/auth.error';

@Injectable()
export class ValidatePasswordRecoveryDomainService {
  execute(recovery: PasswordRecoveryEntity | null, now = Date.now()): asserts recovery is PasswordRecoveryEntity {
    if (!recovery || recovery.attempts >= 5 || recovery.attempts < 0
      || !Number.isInteger(recovery.attempts)
      || !Number.isFinite(Date.parse(recovery.expiresAt))
      || Date.parse(recovery.expiresAt) <= now) {
      throw new InvalidRecoveryCodeError();
    }
  }
}
