import { USER_ROLES } from '../../../../constants/user-roles.constant'
import type { IUserRepository } from '../../domain/repositories/user.repository'
import { UserNotFoundError, UserHasTherapeuticProcessesError } from '../../domain/errors/user.error'

export class DeleteUserUseCase {
  constructor(
    private readonly repository: Pick<IUserRepository, 'findById' | 'hasTherapeuticProcesses' | 'delete'>,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.repository.findById(userId)
    if (!user) throw new UserNotFoundError()

    if (user.role === USER_ROLES.THERAPIST && (await this.repository.hasTherapeuticProcesses(userId))) {
      throw new UserHasTherapeuticProcessesError()
    }

    await this.repository.delete(user)
  }
}
