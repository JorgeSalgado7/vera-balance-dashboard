import type { EmailMessage } from '../entities/email-message'

export interface ISendEmailService {
  send(message: EmailMessage): Promise<void>
}
