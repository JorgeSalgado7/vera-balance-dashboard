import type { IResetUserPasswordRepository } from '../../domain/repositories/reset-user-password.repository'
import type { IHashPasswordService } from '../../../auth/domain/services/hash-password.service'
import { ValidateChangeUserPasswordDomainService } from '../../domain/services/validate-change-user-password.domain-service'
import { InvalidNewUserPasswordError } from '../../domain/errors/invalid-new-user-password.error'

interface ResetUserPasswordCommand {
  userId: string
  currentPasswordHash: string
  codeHash: string
  expiresAt: string
  password: string
  password_confirmation: string
}

export class ResetUserPasswordUseCase {
  constructor(
    private readonly domain: ValidateChangeUserPasswordDomainService,
    private readonly hasher: IHashPasswordService,
    private readonly repository: IResetUserPasswordRepository,
  ) {}

  async execute(input: ResetUserPasswordCommand): Promise<boolean> {
    this.domain.execute(input.password, input.password_confirmation)
    let passwordHash: string
    try {
      passwordHash = await this.hasher.hash(input.password)
    } catch (error) {
      if (error instanceof RangeError) throw new InvalidNewUserPasswordError()
      throw error
    }
    return this.repository.reset({
      userId: input.userId,
      currentPasswordHash: input.currentPasswordHash,
      codeHash: input.codeHash,
      expiresAt: input.expiresAt,
      passwordHash,
    }, new Date().toISOString())
  }
}
