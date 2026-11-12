import type { IRecoveryCodeEmailTemplate } from '../../application/ports/recovery-code-email-template.port'
import type { EmailMessage } from '../../domain/entities/email-message'
import { EmailLayoutTemplate } from './email-layout.template'

export class RecoveryCodeEmailTemplate implements IRecoveryCodeEmailTemplate {
  constructor(private readonly template: EmailLayoutTemplate) {}

  create(email: string, code: string): EmailMessage {
    return {
      to: email,
      subject: 'Recuperación de contraseña de Vera Balance',
      text: `Tu código de recuperación de contraseña es: ${code}`,
      html: this.template.render('Recupera tu contraseña', ['Tu código de recuperación de contraseña es el siguiente.', 'El código vence en 5 minutos.'], code),
    }
  }
}
