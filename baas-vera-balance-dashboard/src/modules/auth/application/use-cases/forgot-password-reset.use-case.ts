import { Inject, Injectable } from '@nestjs/common';
import type { AuthUserReaderPort } from '../ports/auth-user-reader.port';
import type { RecoveryCodePort } from '../ports/recovery-code.port';
import type { PasswordHasherPort } from '../ports/password-hasher.port';
import type { IFindPasswordRecoveryRepository } from '../../domain/repositories/find-password-recovery.repository';
import type { IRegisterRecoveryAttemptRepository } from '../../domain/repositories/register-recovery-attempt.repository';
import type { IConsumePasswordRecoveryRepository } from '../../domain/repositories/consume-password-recovery.repository';
import { ValidatePasswordDomainService } from '../../domain/services/validate-password.domain-service';
import { ValidatePasswordRecoveryDomainService } from '../../domain/services/validate-password-recovery.domain-service';
import { ValidateAuthAccountService } from '../services/validate-auth-account.service';
import { InactiveAccountError, InvalidRecoveryCodeError } from '../../domain/errors/auth.error';

@Injectable()
export class ForgotPasswordResetUseCase {
  constructor(
    @Inject('AuthUserReaderPort') private readonly users: AuthUserReaderPort,
    @Inject('RecoveryCodePort') private readonly codes: RecoveryCodePort,
    @Inject('PasswordHasherPort') private readonly passwords: PasswordHasherPort,
    @Inject('IFindPasswordRecoveryRepository') private readonly recoveries: IFindPasswordRecoveryRepository,
    @Inject('IRegisterRecoveryAttemptRepository') private readonly attempts: IRegisterRecoveryAttemptRepository,
    @Inject('IConsumePasswordRecoveryRepository') private readonly consumer: IConsumePasswordRecoveryRepository,
    private readonly validatePassword: ValidatePasswordDomainService,
    private readonly validateRecovery: ValidatePasswordRecoveryDomainService,
    private readonly validateAccount: ValidateAuthAccountService
  ) {}

  async execute(email: string, code: string, password: string, confirmation: string): Promise<void> {
    this.validatePassword.execute(password, confirmation);
    const user = await this.users.findByEmail(email.trim().toLowerCase());
    if (!user) throw new InvalidRecoveryCodeError();

    // Retry optimistic attempt updates if another verification changed the counter.
    // At most five updates can succeed for a particular recovery.
    for (let retry = 0; retry < 5; retry++) {
      const recovery = await this.recoveries.findByUserId(user.id);
      this.validateRecovery.execute(recovery);
      if (!this.codes.matches(user.id, code, recovery.createdAt, recovery.codeHash)) {
        if (!await this.attempts.register(recovery)) continue;
        throw new InvalidRecoveryCodeError();
      }
      try {
        await this.validateAccount.execute(user);
      } catch (error) {
        if (error instanceof InactiveAccountError) throw new InvalidRecoveryCodeError();
        throw error;
      }
      const hash = await this.passwords.hash(password);
      if (!await this.consumer.consume(recovery, user, hash)) {
        throw new InvalidRecoveryCodeError();
      }
      return;
    }
    throw new InvalidRecoveryCodeError();
  }
}
