import { USER_ROLES } from '../../../../constants/user-roles.constant'
import type { UserRole } from '../../../../constants/user-roles.constant'
import { authorizeRole } from '../../../../shared/authorization/authorize-role'
import { UserDeletionNotAllowedError } from '../../domain/errors/user-deletion-not-allowed.error'
import type { IUserRepository } from '../../domain/repositories/user.repository'
import type { IDeleteUserRepository } from '../../domain/repositories/delete-user.repository'
import type { IUserTherapeuticProcessesRepository } from '../../domain/repositories/user-therapeutic-processes.repository'
import { UserNotFoundError } from '../../domain/errors/user-not-found.error'
import { UserHasTherapeuticProcessesError } from '../../domain/errors/user-has-therapeutic-processes.error'

export class DeleteUserUseCase {
  constructor(
    private readonly users: Pick<IUserRepository, 'findById'>,
    private readonly relations: IUserTherapeuticProcessesRepository,
    private readonly deleter: IDeleteUserRepository,
  ) {}

  async execute(userId: string, actor: { role: UserRole }): Promise<void> {
    authorizeRole(actor.role, { [USER_ROLES.ADMIN]: true }, new UserDeletionNotAllowedError())
    const user = await this.users.findById(userId)
    if (!user) throw new UserNotFoundError()

    if (user.role === USER_ROLES.THERAPIST && (await this.relations.hasTherapeuticProcesses(userId))) {
      throw new UserHasTherapeuticProcessesError()
    }

    await this.deleter.delete(user)
  }
}
