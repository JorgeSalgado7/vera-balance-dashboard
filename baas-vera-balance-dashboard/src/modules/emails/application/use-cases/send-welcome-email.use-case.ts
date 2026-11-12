import type { ISendEmailService } from '../../domain/services/send-email.service'
import type { IWelcomeEmailTemplate } from '../ports/welcome-email-template.port'

export class SendWelcomeEmailUseCase {
  constructor(
    private readonly template: IWelcomeEmailTemplate,
    private readonly sender: ISendEmailService,
    private readonly reportFailure: () => void,
  ) {}

  async execute(email: string, name: string): Promise<void> {
    try {
      await this.sender.send(this.template.create(email, name))
    } catch {
      this.reportFailure()
    }
  }
}
