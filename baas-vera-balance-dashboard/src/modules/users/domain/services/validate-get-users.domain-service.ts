import { USER_ROLES } from '../../../../constants/user-roles.constant'
import type { UserRole } from '../../../../constants/user-roles.constant'
import { UserListingNotAllowedError } from '../errors/user-listing-not-allowed.error'

export class ValidateGetUsersDomainService {
  execute(role: UserRole): void {
    if (role !== USER_ROLES.ADMIN) {
      throw new UserListingNotAllowedError()
    }
  }
}
