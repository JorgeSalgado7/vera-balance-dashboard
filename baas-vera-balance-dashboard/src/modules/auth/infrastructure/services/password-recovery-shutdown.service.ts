import { Injectable, type OnModuleDestroy } from '@nestjs/common'
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case'

@Injectable()
export class PasswordRecoveryShutdownService implements OnModuleDestroy {
  constructor(private readonly useCase: ForgotPasswordUseCase) {}

  onModuleDestroy(): Promise<void> {
    return this.useCase.waitForPendingRequests()
  }
}
