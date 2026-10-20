import { Module } from '@nestjs/common';
import { SendEmailUseCase } from './application/use-cases/send-email.use-case';
import { ResendEmailAdapter } from './infrastructure/providers/resend-email.adapter';

@Module({
  providers: [
    SendEmailUseCase,
    { provide: 'EmailSenderPort', useClass: ResendEmailAdapter }
  ],
  exports: [SendEmailUseCase]
})
export class EmailModule {}
