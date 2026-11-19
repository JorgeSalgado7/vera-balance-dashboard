import type { RequestPasswordRecoveryUseCase } from '../../application/use-cases/request-password-recovery.use-case'
import type { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case'

export interface ResetPasswordI {
  requestRecovery: RequestPasswordRecoveryUseCase
  resetPassword: ResetPasswordUseCase
}
