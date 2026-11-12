import type { SendPasswordUpdatedEmailUseCase } from '../../../emails/application/use-cases/send-password-updated-email.use-case'
import type { IHashPasswordService } from '../../../auth/domain/services/hash-password.service'
import type { IVerifyPasswordService } from '../../../auth/domain/services/verify-password.service'
import type { IUserRepository } from '../../domain/repositories/user.repository'
import { ValidateChangeUserPasswordDomainService } from '../../domain/services/validate-change-user-password.domain-service'
import {
  UserNotFoundError,
  IncorrectCurrentUserPasswordError,
  ReusedUserPasswordError,
  InvalidNewUserPasswordError,
} from '../../domain/errors/user.error'
import type { ChangeUserPasswordDto } from '../dtos/change-user-password.dto'
import type { ChangeUserPasswordResponseDto } from '../dtos/change-user-password-response.dto'

export class ChangeUserPasswordUseCase {
  constructor(
    private readonly domain: ValidateChangeUserPasswordDomainService,
    private readonly repository: Pick<IUserRepository, 'findById' | 'changePassword'>,
    private readonly verifier: IVerifyPasswordService,
    private readonly hasher: IHashPasswordService,
    private readonly notification: SendPasswordUpdatedEmailUseCase,
  ) {}

  async execute(userId: string, dto: ChangeUserPasswordDto): Promise<ChangeUserPasswordResponseDto> {
    this.domain.execute(dto.password, dto.password_confirmation)
    const user = await this.repository.findById(userId)
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

    const updatedAt = new Date(Date.now()).toISOString()
    await this.repository.changePassword(user, hash, updatedAt)
    await this.notification.execute(user.email)
    return { message: 'Contraseña actualizada' }
  }
}
