import { USER_ROLES } from '../../../../constants/user-roles.constant'
import type { UserRole } from '../../../../constants/user-roles.constant'
import { authorizeRole } from '../../../../shared/authorization/authorize-role'
import type { IUserRepository } from '../../domain/repositories/user.repository'
import type { IUpdateUserStatusRepository } from '../../domain/repositories/update-user-status.repository'
import { UserNotFoundError } from '../../domain/errors/user-not-found.error'
import { UserStatusUpdateNotAllowedError } from '../../domain/errors/user-status-update-not-allowed.error'
import { InvalidUserStatusError } from '../../domain/errors/user.error'
import type { UpdateUserStatusDto } from '../dtos/update-user-status.dto'
import type { UpdateUserStatusResponseDto } from '../dtos/update-user-status-response.dto'

export class UpdateUserStatusUseCase {
  constructor(
    private readonly users: Pick<IUserRepository, 'findById'>,
    private readonly updater: IUpdateUserStatusRepository,
  ) {}

  async execute(userId: string, dto: UpdateUserStatusDto, actor: { id: string; role: UserRole; clinic: string | null }): Promise<UpdateUserStatusResponseDto> {
    authorizeRole(
      actor.role,
      {
        [USER_ROLES.ADMIN]: actor.id !== userId,
        [USER_ROLES.CLINIC]: actor.id !== userId,
      },
      new UserStatusUpdateNotAllowedError(),
    )

    if (!['Activo', 'Inactivo'].includes(dto.status)) throw new InvalidUserStatusError()

    const user = await this.users.findById(userId)
    if (!user) throw new UserNotFoundError()

    authorizeRole(
      actor.role,
      {
        [USER_ROLES.ADMIN]: true,
        [USER_ROLES.CLINIC]: user.role === USER_ROLES.THERAPIST && actor.clinic !== null && actor.clinic === user.clinic,
      },
      new UserStatusUpdateNotAllowedError(),
    )

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
