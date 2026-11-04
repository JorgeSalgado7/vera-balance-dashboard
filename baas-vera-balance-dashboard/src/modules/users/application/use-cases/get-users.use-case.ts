import { USER_ROLES } from '../../../../constants/user-roles.constant'
import type { UserRole } from '../../../../constants/user-roles.constant'
import type { IFindAllUsersRepository } from '../../domain/repositories/find-all-users.repository'
import { authorizeRole } from '../../../../shared/authorization/authorize-role'
import { UserListingNotAllowedError } from '../../domain/errors/user-listing-not-allowed.error'
import type { GetUsersResponseDto } from '../dtos/get-users-response.dto'

export interface GetUsersActor {
  role: UserRole
}

export class GetUsersUseCase {
  constructor(private readonly repository: IFindAllUsersRepository) {}

  async execute(actor: GetUsersActor): Promise<GetUsersResponseDto[]> {
    authorizeRole(actor.role, { [USER_ROLES.ADMIN]: true }, new UserListingNotAllowedError())

    const users = await this.repository.findAll()

    return users.map((user) => ({
      id: user.pk,
      name: user.name,
      email: user.email,
      professional_license: user.professional_license,
      role: user.role,
      status: user.status,
      clinic: user.clinic,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }))
  }
}
