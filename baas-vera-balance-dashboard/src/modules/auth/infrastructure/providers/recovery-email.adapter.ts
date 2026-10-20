import { Injectable } from '@nestjs/common';
import { SendEmailUseCase } from '../../../email/application/use-cases/send-email.use-case';
import type { RecoveryEmailPort } from '../../application/ports/recovery-email.port';
import { passwordRecoveryEmailTemplate } from '../templates/password-recovery-email.template';

@Injectable()
export class RecoveryEmailAdapter implements RecoveryEmailPort {
  constructor(private readonly sendEmail: SendEmailUseCase) {}

  send(email: string, code: string): Promise<void> {
    return this.sendEmail.execute(
      email, 'Recuperación de contraseña — Vera Balance', passwordRecoveryEmailTemplate(code)
    );
  }
}
