import type { IHashPasswordService } from '../../../auth/domain/services/hash-password.service'
import type { IVerifyPasswordService } from '../../../auth/domain/services/verify-password.service'
import type { IUserRepository } from '../../domain/repositories/user.repository'
import type { IChangeUserPasswordRepository } from '../../domain/repositories/change-user-password.repository'
import { ValidateChangeUserPasswordDomainService } from '../../domain/services/validate-change-user-password.domain-service'
import { UserNotFoundError } from '../../domain/errors/user-not-found.error'
import { IncorrectCurrentUserPasswordError } from '../../domain/errors/incorrect-current-user-password.error'
import { ReusedUserPasswordError } from '../../domain/errors/reused-user-password.error'
import { InvalidNewUserPasswordError } from '../../domain/errors/invalid-new-user-password.error'
import type { ChangeUserPasswordDto } from '../dtos/change-user-password.dto'
import type { ChangeUserPasswordResponseDto } from '../dtos/change-user-password-response.dto'

export class ChangeUserPasswordUseCase {
  constructor(
    private readonly domain: ValidateChangeUserPasswordDomainService,
    private readonly users: Pick<IUserRepository, 'findById'>,
    private readonly verifier: IVerifyPasswordService,
    private readonly hasher: IHashPasswordService,
    private readonly updater: IChangeUserPasswordRepository,
  ) {}

  async execute(userId: string, dto: ChangeUserPasswordDto): Promise<ChangeUserPasswordResponseDto> {
    this.domain.execute(dto.password, dto.password_confirmation)
    const user = await this.users.findById(userId)
    if (!user) throw new UserNotFoundError()

    if (typeof dto.current_password !== 'string' || !(await this.verifier.verify(dto.current_password, user.password))) throw new IncorrectCurrentUserPasswordError()
    if (await this.verifier.verify(dto.password, user.password)) throw new ReusedUserPasswordError()

    let hash: string
    try {
      hash = await this.hasher.hash(dto.password)
    } catch (error) {
      if (error instanceof RangeError) throw new InvalidNewUserPasswordError()
      throw new Error('No se pudo procesar el cambio de contraseña.')
    }

    const updatedAt = new Date(Math.max(Date.now(), Date.parse(user.updated_at) + 1)).toISOString()
    await this.updater.changePassword(user, hash, updatedAt)
    return { message: 'Contraseña actualizada' }
  }
}
