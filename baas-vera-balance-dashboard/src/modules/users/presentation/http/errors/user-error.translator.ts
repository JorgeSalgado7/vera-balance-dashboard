import {
  IncorrectCurrentUserPasswordError,
  ReusedUserPasswordError,
  InvalidNewUserPasswordError,
  UserPasswordConfirmationMismatchError,
  UserDeletionConflictError,
  UserHasTherapeuticProcessesError,
  EmptyUserUpdateError,
  InvalidUserUpdateFieldsError,
  UserUpdateConflictError,
  UserNotFoundError,
  UserAlreadyExistsError,
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
    if (error instanceof UserNotFoundError) {
      throw HttpProblem.notFound(error.message, instance)
    }

    if (error instanceof UserAlreadyExistsError || error instanceof UserUpdateConflictError || error instanceof UserDeletionConflictError || error instanceof UserHasTherapeuticProcessesError) {
      throw HttpProblem.conflict(error.message, instance)
    }


    if (
      error instanceof IncorrectCurrentUserPasswordError ||
      error instanceof ReusedUserPasswordError ||
      error instanceof InvalidNewUserPasswordError ||
      error instanceof UserPasswordConfirmationMismatchError ||
      error instanceof EmptyUserUpdateError ||
      error instanceof InvalidUserUpdateFieldsError ||
      error instanceof MissingUserNameError ||
      error instanceof MissingUserEmailError ||
      error instanceof InvalidUserEmailError ||
      error instanceof MissingUserPasswordError ||
      error instanceof MissingUserProfessionalLicenseError ||
      error instanceof InvalidUserRoleError ||
      error instanceof InvalidUserStatusError ||
      error instanceof InvalidUserClinicError
    ) {
      throw HttpProblem.badRequest(error.message, instance,
        error instanceof InvalidUserUpdateFieldsError ? error.fields.map(field => ({ field, message: `No puedes actualizar el campo «${field}».` })) :
          'field' in error ? [{ field: error.field, message: error.message }] : undefined)
    }
  }
}
