import type { IUserRepository } from '../../domain/repositories/user.repository'
import type { IUpdateUserStatusRepository } from '../../domain/repositories/update-user-status.repository'
import { UserNotFoundError } from '../../domain/errors/user-not-found.error'
import { InvalidUserStatusError } from '../../domain/errors/user.error'
import type { UpdateUserStatusDto } from '../dtos/update-user-status.dto'
import type { UpdateUserStatusResponseDto } from '../dtos/update-user-status-response.dto'

export class UpdateUserStatusUseCase {
  constructor(
    private readonly users: Pick<IUserRepository, 'findById'>,
    private readonly updater: IUpdateUserStatusRepository,
  ) {}

  async execute(userId: string, dto: UpdateUserStatusDto): Promise<UpdateUserStatusResponseDto> {
    if (!['Activo', 'Inactivo'].includes(dto.status)) throw new InvalidUserStatusError()

    const user = await this.users.findById(userId)
    if (!user) throw new UserNotFoundError()

    const saved = user.status === dto.status ? user : await this.updater.updateStatus(user, dto.status, new Date(Math.max(Date.now(), Date.parse(user.updated_at) + 1)).toISOString())

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
