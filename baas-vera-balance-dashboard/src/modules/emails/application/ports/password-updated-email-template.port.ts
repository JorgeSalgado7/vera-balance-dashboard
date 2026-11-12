import type { EmailMessage } from '../../domain/entities/email-message'

export interface IPasswordUpdatedEmailTemplate {
  create(email: string): EmailMessage
}
