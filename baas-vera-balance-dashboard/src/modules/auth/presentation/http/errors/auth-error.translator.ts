import { InvalidPasswordRecoveryCodeError } from '../../../domain/errors/invalid-password-recovery-code.error'
import { InvalidAccessTokenError } from '../../../domain/errors/invalid-access-token.error'
import { InvalidRefreshTokenError } from '../../../domain/errors/invalid-refresh-token.error'
import { InvalidCredentialsError } from '../../../domain/errors/invalid-credentials.error'
import { HttpProblem } from '../../../../../shared/http-problem/http-problem.util'

export class AuthErrorTranslator {
  static translate(error: unknown, instance: string): void {
    if (error instanceof InvalidPasswordRecoveryCodeError) {
      throw HttpProblem.badRequest(error.message, instance)
    }
    if (error instanceof InvalidAccessTokenError || error instanceof InvalidCredentialsError || error instanceof InvalidRefreshTokenError) {
      throw HttpProblem.unauthorized(error.message, instance)
    }
  }
}
