import {
  InvalidPasswordRecoveryCodeError,
  InvalidAccessTokenError,
  InvalidRefreshTokenError,
  InvalidCredentialsError,
} from '../../../domain/errors/auth.error'
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
