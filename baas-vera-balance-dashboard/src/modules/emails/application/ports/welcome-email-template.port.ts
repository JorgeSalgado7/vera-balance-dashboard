import type { EmailMessage } from '../../domain/entities/email-message'

export interface IWelcomeEmailTemplate {
  create(email: string, name: string): EmailMessage
}
