import { EmailLayoutTemplate } from './infrastructure/templates/email-layout.template'
import { WelcomeEmailTemplate } from './infrastructure/templates/welcome-email.template'
import { SendWelcomeEmailUseCase } from './application/use-cases/send-welcome-email.use-case'
import { Logger, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SendRecoveryCodeEmailUseCase } from './application/use-cases/send-recovery-code-email.use-case'
import { SendPasswordUpdatedEmailUseCase } from './application/use-cases/send-password-updated-email.use-case'
import { RecoveryCodeEmailTemplate } from './infrastructure/templates/recovery-code-email.template'
import { PasswordUpdatedEmailTemplate } from './infrastructure/templates/password-updated-email.template'
import type { ISendEmailService } from './domain/services/send-email.service'
import { SendEmailResendService } from './infrastructure/services/send-email-resend.service'

@Module({
  imports: [ConfigModule],
  providers: [
    EmailLayoutTemplate,
    {
      provide: WelcomeEmailTemplate,
      useFactory: (template: EmailLayoutTemplate) => new WelcomeEmailTemplate(template),
      inject: [EmailLayoutTemplate],
    },
    {
      provide: RecoveryCodeEmailTemplate,
      useFactory: (template: EmailLayoutTemplate) => new RecoveryCodeEmailTemplate(template),
      inject: [EmailLayoutTemplate],
    },
    {
      provide: PasswordUpdatedEmailTemplate,
      useFactory: (template: EmailLayoutTemplate) => new PasswordUpdatedEmailTemplate(template),
      inject: [EmailLayoutTemplate],
    },
    SendEmailResendService,
    { provide: 'ISendEmailService', useExisting: SendEmailResendService },
    {
      provide: SendWelcomeEmailUseCase,
      useFactory: (template: WelcomeEmailTemplate, sender: ISendEmailService) => {
        const logger = new Logger(SendWelcomeEmailUseCase.name)
        return new SendWelcomeEmailUseCase(template, sender,
          () => { logger.error('No se pudo enviar el correo de bienvenida.') })
      },
      inject: [WelcomeEmailTemplate, 'ISendEmailService'],
    },
    {
      provide: SendRecoveryCodeEmailUseCase,
      useFactory: (template: RecoveryCodeEmailTemplate, sender: ISendEmailService) =>
        new SendRecoveryCodeEmailUseCase(template, sender),
      inject: [RecoveryCodeEmailTemplate, 'ISendEmailService'],
    },
    {
      provide: SendPasswordUpdatedEmailUseCase,
      useFactory: (template: PasswordUpdatedEmailTemplate, sender: ISendEmailService) => {
        const logger = new Logger(SendPasswordUpdatedEmailUseCase.name)
        return new SendPasswordUpdatedEmailUseCase(template, sender,
          () => { logger.error('No se pudo enviar la notificación de contraseña actualizada.') })
      },
      inject: [PasswordUpdatedEmailTemplate, 'ISendEmailService'],
    },
  ],
  exports: [SendRecoveryCodeEmailUseCase, SendPasswordUpdatedEmailUseCase, SendWelcomeEmailUseCase],
})
export class EmailsModule {}
