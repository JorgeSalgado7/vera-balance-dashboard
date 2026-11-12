import type { ISendEmailService } from '../../domain/services/send-email.service'
import type { IRecoveryCodeEmailTemplate } from '../ports/recovery-code-email-template.port'

export class SendRecoveryCodeEmailUseCase {
  constructor(private readonly template: IRecoveryCodeEmailTemplate, private readonly sender: ISendEmailService) {}

  execute(email: string, code: string): Promise<void> {
    return this.sender.send(this.template.create(email, code))
  }
}
