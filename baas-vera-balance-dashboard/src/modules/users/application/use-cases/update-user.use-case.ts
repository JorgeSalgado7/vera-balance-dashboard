import type { IUserRepository } from '../../domain/repositories/user.repository'
import type { IUpdateUserRepository } from '../../domain/repositories/update-user.repository'
import type { UpdateUserChanges } from '../../domain/interfaces/update-user-changes'
import { UpdateUserDomainService } from '../../domain/services/update-user.domain-service'
import { UserNotFoundError } from '../../domain/errors/user-not-found.error'
import type { UpdateUserResponseDto } from '../dtos/update-user-response.dto'

export class UpdateUserUseCase {
  constructor(
    private readonly domain: UpdateUserDomainService,
    private readonly users: Pick<IUserRepository, 'findById'>,
    private readonly updateUser: IUpdateUserRepository,
  ) {}

  async execute(userId: string, input: UpdateUserChanges): Promise<UpdateUserResponseDto> {
    const user = await this.users.findById(userId)
    if (!user) throw new UserNotFoundError()

    const changes = this.domain.execute(user, input)

    const updatedAt = new Date(Math.max(Date.now(), Date.parse(user.updated_at) + 1)).toISOString()
    const saved = await this.updateUser.update(user, changes, updatedAt)
    return {
      id: saved.pk,
      name: saved.name,
      email: saved.email,
      professional_license: saved.professional_license,
      role: saved.role,
      status: saved.status,
      clinic: saved.clinic,
      created_at: saved.created_at,
      updated_at: saved.updated_at,
    }
  }
}
