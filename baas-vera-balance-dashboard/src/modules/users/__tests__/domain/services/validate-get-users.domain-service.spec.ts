import { ValidateGetUsersDomainService } from '../../../domain/services/validate-get-users.domain-service'
import { UserListingNotAllowedError } from '../../../domain/errors/user-listing-not-allowed.error'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'

describe('ValidateGetUsersDomainService', () => {
  const service = new ValidateGetUsersDomainService()

  it('allows the administrator role', () => {
    expect(() => service.execute(USER_ROLES.ADMIN)).not.toThrow()
  })

  it.each([USER_ROLES.CLINIC, USER_ROLES.THERAPIST])('rejects role %s', (role) => {
    expect(() => service.execute(role)).toThrow(UserListingNotAllowedError)
  })
})
