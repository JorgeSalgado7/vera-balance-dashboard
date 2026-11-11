import { IncorrectCurrentUserPasswordError } from '../../../domain/errors/incorrect-current-user-password.error'
import { ReusedUserPasswordError } from '../../../domain/errors/reused-user-password.error'
import { InvalidNewUserPasswordError } from '../../../domain/errors/invalid-new-user-password.error'
import { UserPasswordConfirmationMismatchError } from '../../../domain/errors/user-password-confirmation-mismatch.error'
import { UserDeletionConflictError } from '../../../domain/errors/user-deletion-conflict.error'
import { UserHasTherapeuticProcessesError } from '../../../domain/errors/user-has-therapeutic-processes.error'
import { EmptyUserUpdateError } from '../../../domain/errors/empty-user-update.error'
import { InvalidUserUpdateFieldsError } from '../../../domain/errors/invalid-user-update-fields.error'
import { UserUpdateConflictError } from '../../../domain/errors/user-update-conflict.error'
import { UserNotFoundError } from '../../../domain/errors/user-not-found.error'
import {
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
      throw HttpProblem.badRequest(error.message, instance)
    }
  }
}
