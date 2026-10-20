import { HttpProblem } from '../../../../shared/http-problem/http-problem.util';
import {
  InvalidCredentialsError, InvalidSessionError, InactiveAccountError,
  InvalidRecoveryCodeError, PasswordConfirmationMismatchError, MissingPasswordError,
  PasswordPolicyUnavailableError, PasswordTooShortError
} from '../../domain/errors/auth.error';

export class AuthErrorTranslator {
  static translate(error: unknown, instance: string): never | void {
    if (error instanceof InvalidCredentialsError || error instanceof InvalidSessionError
      || error instanceof InvalidRecoveryCodeError) {
      throw HttpProblem.unauthorized(error.message, instance);
    }
    if (error instanceof InactiveAccountError) throw HttpProblem.forbidden(error.message, instance);
    if (error instanceof MissingPasswordError || error instanceof PasswordConfirmationMismatchError
      || error instanceof PasswordTooShortError) {
      throw HttpProblem.badRequest(error.message, instance);
    }
    if (error instanceof PasswordPolicyUnavailableError) {
      throw HttpProblem.internal('An unexpected error has occurred. Please try again later.', instance);
    }
  }
}
