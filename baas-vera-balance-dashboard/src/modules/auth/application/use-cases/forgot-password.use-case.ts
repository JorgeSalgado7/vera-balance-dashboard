import { Inject, Injectable } from '@nestjs/common';
import type { AuthUserReaderPort } from '../ports/auth-user-reader.port';
import type { RecoveryCodePort } from '../ports/recovery-code.port';
import type { RecoveryEmailPort } from '../ports/recovery-email.port';
import type { ISavePasswordRecoveryRepository } from '../../domain/repositories/save-password-recovery.repository';
import { PasswordRecoveryEntity } from '../../domain/entities/password-recovery.entity';
import { ValidateAuthAccountService } from '../services/validate-auth-account.service';
import { InactiveAccountError } from '../../domain/errors/auth.error';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject('AuthUserReaderPort') private readonly users: AuthUserReaderPort,
    @Inject('RecoveryCodePort') private readonly codes: RecoveryCodePort,
    @Inject('RecoveryEmailPort') private readonly email: RecoveryEmailPort,
    @Inject('ISavePasswordRecoveryRepository') private readonly recoveries: ISavePasswordRecoveryRepository,
    private readonly validateAccount: ValidateAuthAccountService
  ) {}

  async execute(email: string): Promise<{ accepted: true }> {
    const user = await this.users.findByEmail(email.trim().toLowerCase());
    if (!user) return { accepted: true };

    try {
      await this.validateAccount.execute(user);
    } catch (error) {
      if (error instanceof InactiveAccountError) return { accepted: true };
      throw error;
    }

    const code = this.codes.generate();
    const now = Date.now();
    const recovery = new PasswordRecoveryEntity();
    recovery.userId = user.id;
    recovery.createdAt = new Date(now).toISOString();
    recovery.expiresAt = new Date(now + 300_000).toISOString();
    recovery.ttl = Math.floor((now + 300_000) / 1000);
    recovery.attempts = 0;
    recovery.codeHash = this.codes.protect(user.id, code, recovery.createdAt);
    try {
      await this.recoveries.save(recovery);
      await this.email.send(user.email, code);
    } catch {
      // Provider failures must not reveal which addresses are registered.
      // No provider response (which may contain the code) reaches the logger.
    }
    return { accepted: true };
  }
}
