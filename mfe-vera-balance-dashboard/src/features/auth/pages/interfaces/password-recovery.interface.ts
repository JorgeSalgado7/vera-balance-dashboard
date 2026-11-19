import type { RequestPasswordRecoveryUseCase } from '../../application/use-cases/request-password-recovery.use-case'

export interface PasswordRecoveryI {
  requestRecovery: RequestPasswordRecoveryUseCase
}
