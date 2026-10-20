import {
  UserNotFoundError, UserAccessDeniedError, UserEmailAlreadyExistsError,
  LastActiveAdministratorError, UserMutationConflictError, ClinicUserCannotBeDeletedError,
  MissingUserNameError, InvalidUserEmailError,
  MissingUserProfessionalLicenseError, InvalidUserRoleError, InvalidUserStatusError,
  InvalidUserPasswordError, UserPasswordConfirmationMismatchError
} from '../../domain/errors/user.error';
import { HttpProblem } from '../../../../shared/http-problem/http-problem.util';

export class UserErrorTranslator {
  static translate(error: unknown, instance: string): never | void {
    if (error instanceof UserNotFoundError) {
      throw HttpProblem.notFound(error.message, instance);
    }
    if (error instanceof UserAccessDeniedError) throw HttpProblem.forbidden(error.message, instance);
    if (error instanceof UserEmailAlreadyExistsError || error instanceof LastActiveAdministratorError
      || error instanceof UserMutationConflictError || error instanceof ClinicUserCannotBeDeletedError) throw HttpProblem.conflict(error.message, instance);
    if (error instanceof MissingUserNameError || error instanceof InvalidUserEmailError
      || error instanceof MissingUserProfessionalLicenseError || error instanceof InvalidUserRoleError
      || error instanceof InvalidUserStatusError || error instanceof InvalidUserPasswordError
      || error instanceof UserPasswordConfirmationMismatchError) throw HttpProblem.badRequest(error.message, instance);
  }
}
