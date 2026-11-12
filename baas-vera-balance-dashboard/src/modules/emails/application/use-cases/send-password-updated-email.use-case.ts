import type { ISendEmailService } from '../../domain/services/send-email.service'
import type { IPasswordUpdatedEmailTemplate } from '../ports/password-updated-email-template.port'

export class SendPasswordUpdatedEmailUseCase {
  constructor(
    private readonly template: IPasswordUpdatedEmailTemplate,
    private readonly sender: ISendEmailService,
    private readonly reportFailure: () => void,
  ) {}

  async execute(email: string): Promise<void> {
    try {
      await this.sender.send(this.template.create(email))
    } catch {
      this.reportFailure()
    }
  }
}
