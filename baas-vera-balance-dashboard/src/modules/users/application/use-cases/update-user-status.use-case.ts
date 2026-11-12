import type { IUserRepository } from '../../domain/repositories/user.repository'
import { UserNotFoundError, InvalidUserStatusError } from '../../domain/errors/user.error'
import type { UpdateUserStatusDto } from '../dtos/update-user-status.dto'
import type { UpdateUserStatusResponseDto } from '../dtos/update-user-status-response.dto'

export class UpdateUserStatusUseCase {
  constructor(
    private readonly repository: Pick<IUserRepository, 'findById' | 'updateStatus'>,
  ) {}

  async execute(userId: string, dto: UpdateUserStatusDto): Promise<UpdateUserStatusResponseDto> {
    if (!['Activo', 'Inactivo'].includes(dto.status)) throw new InvalidUserStatusError()

    const user = await this.repository.findById(userId)
    if (!user) throw new UserNotFoundError()

    const saved = user.status === dto.status ? user : await this.repository.updateStatus(user, dto.status, new Date(Date.now()).toISOString())

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
