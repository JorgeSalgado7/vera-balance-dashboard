import type { IUserRepository } from '../../domain/repositories/user.repository'
import type { UpdateUserChanges } from '../../domain/interfaces/update-user-changes'
import { UpdateUserDomainService } from '../../domain/services/update-user.domain-service'
import { UserNotFoundError } from '../../domain/errors/user.error'
import type { UpdateUserResponseDto } from '../dtos/update-user-response.dto'

export class UpdateUserUseCase {
  constructor(
    private readonly domain: UpdateUserDomainService,
    private readonly repository: Pick<IUserRepository, 'findById' | 'update'>,
  ) {}

  async execute(userId: string, input: UpdateUserChanges): Promise<UpdateUserResponseDto> {
    const user = await this.repository.findById(userId)
    if (!user) throw new UserNotFoundError()

    const changes = this.domain.execute(user, input)

    const updatedAt = new Date(Date.now()).toISOString()
    const saved = await this.repository.update(user, changes, updatedAt)
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
