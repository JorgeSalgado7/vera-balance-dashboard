import type { IWelcomeEmailTemplate } from '../../application/ports/welcome-email-template.port'
import type { EmailMessage } from '../../domain/entities/email-message'
import { EmailLayoutTemplate } from './email-layout.template'

export class WelcomeEmailTemplate implements IWelcomeEmailTemplate {
  constructor(private readonly template: EmailLayoutTemplate) {}

  create(email: string, name: string): EmailMessage {
    const greeting = `Hola ${name},`
    const message = 'Te damos la bienvenida a Vera Balance. Tu cuenta se creó correctamente.'
    return {
      to: email,
      subject: 'Bienvenida a Vera Balance',
      text: `${greeting}\n\n${message}`,
      html: this.template.render('Te damos la bienvenida', [greeting, message]),
    }
  }
}
