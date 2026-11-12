import type { EmailMessage } from '../../domain/entities/email-message'

export interface IRecoveryCodeEmailTemplate {
  create(email: string, code: string): EmailMessage
}
