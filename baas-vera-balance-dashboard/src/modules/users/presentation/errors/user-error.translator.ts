import {
  UserNotFoundError,
  InvalidUserStatusError,
  MissingUserIdError,
  MissingUserNameError,
  MissingUserEmailError,
  InvalidUserEmailError,
  MissingUserPasswordError,
  MissingUserPasswordHashError,
  MissingUserProfessionalLicenseError,
  MissingUserClinicError,
  InvalidUserClinicError,
  InvalidUserRoleError,
  MissingUserCreatedAtError,
  MissingUserUpdatedAtError,
  UserEmailAlreadyExistsError
} from '../../domain/errors/user.error';
import { HttpProblem } from '../../../../shared/http-problem/http-problem.util';

export class UserErrorTranslator {
  static translate(error: unknown, instance: string): never | void {
    if (error instanceof UserNotFoundError) {
      throw HttpProblem.notFound(error.message, instance);
    }

    if (error instanceof UserEmailAlreadyExistsError) {
      throw HttpProblem.conflict(error.message, instance);
    }

    if (
      error instanceof InvalidUserStatusError
      || error instanceof MissingUserIdError
      || error instanceof MissingUserNameError
      || error instanceof MissingUserEmailError
      || error instanceof InvalidUserEmailError
      || error instanceof MissingUserPasswordError
      || error instanceof MissingUserPasswordHashError
      || error instanceof MissingUserProfessionalLicenseError
      || error instanceof MissingUserClinicError
      || error instanceof InvalidUserClinicError
      || error instanceof InvalidUserRoleError
      || error instanceof MissingUserCreatedAtError
      || error instanceof MissingUserUpdatedAtError
    ) {
      throw HttpProblem.badRequest(error.message, instance);
    }
  }
}
