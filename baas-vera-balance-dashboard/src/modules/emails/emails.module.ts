import { LoggerModule } from '../../shared/logger/logger.module'
import { AppLogger } from '../../shared/logger/app-logger.service'
import { EmailLayoutTemplate } from './infrastructure/templates/email-layout.template'
import { WelcomeEmailTemplate } from './infrastructure/templates/welcome-email.template'
import { SendWelcomeEmailUseCase } from './application/use-cases/send-welcome-email.use-case'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SendRecoveryCodeEmailUseCase } from './application/use-cases/send-recovery-code-email.use-case'
import { SendPasswordUpdatedEmailUseCase } from './application/use-cases/send-password-updated-email.use-case'
import { RecoveryCodeEmailTemplate } from './infrastructure/templates/recovery-code-email.template'
import { PasswordUpdatedEmailTemplate } from './infrastructure/templates/password-updated-email.template'
import type { ISendEmailService } from './domain/services/send-email.service'
import { SendEmailResendService } from './infrastructure/services/send-email-resend.service'

@Module({
  imports: [LoggerModule, ConfigModule],
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
      useFactory: (template: WelcomeEmailTemplate, sender: ISendEmailService, logger: AppLogger) => {
        return new SendWelcomeEmailUseCase(template, sender,
          () => { logger.warn(SendWelcomeEmailUseCase.name, 'email.welcome.not_delivered') })
      },
      inject: [WelcomeEmailTemplate, 'ISendEmailService', AppLogger],
    },
    {
      provide: SendRecoveryCodeEmailUseCase,
      useFactory: (template: RecoveryCodeEmailTemplate, sender: ISendEmailService) =>
        new SendRecoveryCodeEmailUseCase(template, sender),
      inject: [RecoveryCodeEmailTemplate, 'ISendEmailService'],
    },
    {
      provide: SendPasswordUpdatedEmailUseCase,
      useFactory: (template: PasswordUpdatedEmailTemplate, sender: ISendEmailService, logger: AppLogger) => {
        return new SendPasswordUpdatedEmailUseCase(template, sender,
          () => { logger.warn(SendPasswordUpdatedEmailUseCase.name, 'email.password_updated.not_delivered') })
      },
      inject: [PasswordUpdatedEmailTemplate, 'ISendEmailService', AppLogger],
    },
  ],
  exports: [SendRecoveryCodeEmailUseCase, SendPasswordUpdatedEmailUseCase, SendWelcomeEmailUseCase],
})
export class EmailsModule {}
