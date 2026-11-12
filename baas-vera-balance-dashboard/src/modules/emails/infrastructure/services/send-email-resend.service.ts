import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { EmailMessage } from '../../domain/entities/email-message'
import type { ISendEmailService } from '../../domain/services/send-email.service'
import { EmailDeliveryError } from '../../domain/errors/email-delivery.error'

@Injectable()
export class SendEmailResendService implements ISendEmailService {
  constructor(private readonly config: ConfigService) {}

  async send(message: EmailMessage): Promise<void> {
    const apiKey = this.config.getOrThrow<string>('RESEND_API_KEY')
    const from = this.config.getOrThrow<string>('RESEND_FROM_EMAIL')
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [message.to], subject: message.subject, text: message.text, html: message.html }),
      })
      if (!response.ok) throw new EmailDeliveryError()
    } catch {
      throw new EmailDeliveryError()
    }
  }
}
