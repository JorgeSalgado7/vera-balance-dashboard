import type { SendPasswordUpdatedEmailUseCase } from '../../../emails/application/use-cases/send-password-updated-email.use-case'
import type { FindUserByEmailUseCase } from '../../../users/application/use-cases/find-user-by-email.use-case'
import type { ResetUserPasswordUseCase } from '../../../users/application/use-cases/reset-user-password.use-case'
import type { IVerifyPasswordService } from '../../domain/services/verify-password.service'
import { ValidatePasswordRecoveryDomainService } from '../../domain/services/validate-password-recovery.domain-service'
import { InvalidPasswordRecoveryCodeError } from '../../domain/errors/auth.error'
import type { ResetPasswordDto } from '../dtos/reset-password.dto'
import type { ResetPasswordResponseDto } from '../dtos/reset-password-response.dto'

export class ResetPasswordUseCase {
  constructor(
    private readonly users: FindUserByEmailUseCase,
    private readonly verifier: IVerifyPasswordService,
    private readonly domain: ValidatePasswordRecoveryDomainService,
    private readonly resetUserPassword: ResetUserPasswordUseCase,
    private readonly notification: SendPasswordUpdatedEmailUseCase,
  ) {}

  async execute(input: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    const user = await this.users.execute(input.email)
    if (!user?.password_recovery_code_hash) throw new InvalidPasswordRecoveryCodeError()
    const matches = await this.verifier.verify(input.code, user.password_recovery_code_hash)
    this.domain.validate(matches, user.password_recovery_expires_at)
    const reset = await this.resetUserPassword.execute({
      userId: user.id,
      currentPasswordHash: user.password,
      codeHash: user.password_recovery_code_hash,
      expiresAt: user.password_recovery_expires_at,
      password: input.password,
      password_confirmation: input.password_confirmation,
    })
    if (!reset) throw new InvalidPasswordRecoveryCodeError()
    await this.notification.execute(user.email)
    return { message: 'Contraseña restablecida' }
  }
}
