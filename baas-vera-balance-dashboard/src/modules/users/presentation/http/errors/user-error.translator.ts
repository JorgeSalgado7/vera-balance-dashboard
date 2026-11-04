import { UserPasswordChangeNotAllowedError } from '../../../domain/errors/user-password-change-not-allowed.error'
import { IncorrectCurrentUserPasswordError } from '../../../domain/errors/incorrect-current-user-password.error'
import { ReusedUserPasswordError } from '../../../domain/errors/reused-user-password.error'
import { InvalidNewUserPasswordError } from '../../../domain/errors/invalid-new-user-password.error'
import { UserPasswordConfirmationMismatchError } from '../../../domain/errors/user-password-confirmation-mismatch.error'
import { UserStatusUpdateNotAllowedError } from '../../../domain/errors/user-status-update-not-allowed.error'
import { UserDeletionNotAllowedError } from '../../../domain/errors/user-deletion-not-allowed.error'
import { UserDeletionConflictError } from '../../../domain/errors/user-deletion-conflict.error'
import { UserHasTherapeuticProcessesError } from '../../../domain/errors/user-has-therapeutic-processes.error'
import { EmptyUserUpdateError } from '../../../domain/errors/empty-user-update.error'
import { InvalidUserUpdateFieldsError } from '../../../domain/errors/invalid-user-update-fields.error'
import { UserUpdateNotAllowedError } from '../../../domain/errors/user-update-not-allowed.error'
import { UserUpdateConflictError } from '../../../domain/errors/user-update-conflict.error'
import { UserNotFoundError } from '../../../domain/errors/user-not-found.error'
import { UserConsultationNotAllowedError } from '../../../domain/errors/user-consultation-not-allowed.error'
import { UserListingNotAllowedError } from '../../../domain/errors/user-listing-not-allowed.error'
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
    if (error instanceof UserNotFoundError) {
      throw HttpProblem.notFound(error.message, instance)
    }

    if (error instanceof UserAlreadyExistsError || error instanceof UserUpdateConflictError || error instanceof UserDeletionConflictError || error instanceof UserHasTherapeuticProcessesError) {
      throw HttpProblem.conflict(error.message, instance)
    }

    if (
      error instanceof UserPasswordChangeNotAllowedError ||
      error instanceof UserStatusUpdateNotAllowedError ||
      error instanceof UserDeletionNotAllowedError ||
      error instanceof UserCreationNotAllowedError ||
      error instanceof UserListingNotAllowedError ||
      error instanceof UserConsultationNotAllowedError ||
      error instanceof UserUpdateNotAllowedError
    ) {
      throw HttpProblem.forbidden(error.message, instance)
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
