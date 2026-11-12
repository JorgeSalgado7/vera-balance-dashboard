import type { FindUserByEmailUseCase } from '../../../users/application/use-cases/find-user-by-email.use-case'
import type { SetUserPasswordRecoveryUseCase } from '../../../users/application/use-cases/set-user-password-recovery.use-case'
import type { IHashPasswordService } from '../../domain/services/hash-password.service'
import type { IGenerateRecoveryCodeService } from '../../domain/services/generate-recovery-code.service'
import type { SendRecoveryCodeEmailUseCase } from '../../../emails/application/use-cases/send-recovery-code-email.use-case'
import { CreatePasswordRecoveryDomainService } from '../../domain/services/create-password-recovery.domain-service'
import type { ForgotPasswordDto } from '../dtos/forgot-password.dto'
import type { ForgotPasswordResponseDto } from '../dtos/forgot-password-response.dto'

export class ForgotPasswordUseCase {
  private readonly pending = new Set<Promise<void>>()

  constructor(
    private readonly users: FindUserByEmailUseCase,
    private readonly storeRecovery: SetUserPasswordRecoveryUseCase,
    private readonly generator: IGenerateRecoveryCodeService,
    private readonly domain: CreatePasswordRecoveryDomainService,
    private readonly hasher: IHashPasswordService,
    private readonly sender: SendRecoveryCodeEmailUseCase,
    private readonly reportFailure: () => void,
  ) {}

  execute(input: ForgotPasswordDto): ForgotPasswordResponseDto {
    const task = Promise.resolve().then(() => this.process(input.email))
      .catch(() => { this.reportFailure() })
      .finally(() => { this.pending.delete(task) })
    this.pending.add(task)
    return { message: 'Si el correo está registrado, recibirás un código de recuperación.' }
  }

  async waitForPendingRequests(): Promise<void> {
    while (this.pending.size) await Promise.all(this.pending)
  }

  private async process(email: string): Promise<void> {
    const user = await this.users.execute(email)
    if (!user) return
    const recovery = this.domain.create(this.generator.generate())
    const codeHash = await this.hasher.hash(recovery.code)
    const stored = await this.storeRecovery.execute({
      userId: user.id,
      currentPasswordHash: user.password,
      codeHash,
      expiresAt: recovery.expiresAt,
    })
    if (stored) await this.sender.execute(user.email, recovery.code)
  }
}
