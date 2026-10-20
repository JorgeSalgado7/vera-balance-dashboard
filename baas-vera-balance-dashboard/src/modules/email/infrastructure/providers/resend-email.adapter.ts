import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EmailSenderPort } from '../../application/ports/email-sender.port';

@Injectable()
export class ResendEmailAdapter implements EmailSenderPort {
  private readonly apiKey: string;
  private readonly from: string;

  constructor(config: ConfigService) {
    this.apiKey = config.getOrThrow<string>('RESEND_API_KEY');
    this.from = config.getOrThrow<string>('RESEND_FROM_EMAIL');
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: this.from, to: [to], subject, html }),
        signal: AbortSignal.timeout(10_000)
      });
      if (!response.ok) throw new Error('Email delivery failed.');
      await response.body?.cancel();
    } catch {
      throw new Error('Email delivery failed.');
    }
  }
}
