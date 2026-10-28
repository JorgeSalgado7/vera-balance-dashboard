import {
  UserAlreadyExistsError,
  UserCreationNotAllowedError,
  MissingUserNameError,
  MissingUserEmailError,
  InvalidUserEmailError,
  MissingUserPasswordError,
  MissingUserProfessionalLicenseError,
  InvalidUserRoleError,
  InvalidUserStatusError,
  InvalidUserClinicError,
} from '../../../domain/errors/user.error'

import { HttpProblem } from '../../../../../shared/http-problem/http-problem.util'

export class UserErrorTranslator {
  static translate(error: unknown, instance: string): never | void {
    if (error instanceof UserAlreadyExistsError) {
      throw HttpProblem.conflict(error.message, instance)
    }

    if (error instanceof UserCreationNotAllowedError) {
      throw HttpProblem.forbidden(error.message, instance)
    }

    if (
      error instanceof MissingUserNameError ||
      error instanceof MissingUserEmailError ||
      error instanceof InvalidUserEmailError ||
      error instanceof MissingUserPasswordError ||
      error instanceof MissingUserProfessionalLicenseError ||
      error instanceof InvalidUserRoleError ||
      error instanceof InvalidUserStatusError ||
      error instanceof InvalidUserClinicError
    ) {
      throw HttpProblem.badRequest(error.message, instance)
    }
  }
}
