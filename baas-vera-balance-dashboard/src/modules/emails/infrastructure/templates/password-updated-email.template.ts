import type { IPasswordUpdatedEmailTemplate } from '../../application/ports/password-updated-email-template.port'
import type { EmailMessage } from '../../domain/entities/email-message'
import { EmailLayoutTemplate } from './email-layout.template'

export class PasswordUpdatedEmailTemplate implements IPasswordUpdatedEmailTemplate {
  constructor(private readonly template: EmailLayoutTemplate) {}

  create(email: string): EmailMessage {
    return {
      to: email,
      subject: 'Contraseña actualizada en Vera Balance',
      text: 'Tu contraseña de Vera Balance se actualizó correctamente.',
      html: this.template.render('Contraseña actualizada', ['Tu contraseña de Vera Balance se actualizó correctamente.']),
    }
  }
}
