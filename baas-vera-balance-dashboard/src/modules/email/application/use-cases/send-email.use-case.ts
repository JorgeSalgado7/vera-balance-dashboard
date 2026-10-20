import { Inject, Injectable } from '@nestjs/common';
import type { EmailSenderPort } from '../ports/email-sender.port';

@Injectable()
export class SendEmailUseCase {
  constructor(@Inject('EmailSenderPort') private readonly sender: EmailSenderPort) {}

  execute(to: string, subject: string, html: string): Promise<void> {
    return this.sender.send(to, subject, html);
  }
}
