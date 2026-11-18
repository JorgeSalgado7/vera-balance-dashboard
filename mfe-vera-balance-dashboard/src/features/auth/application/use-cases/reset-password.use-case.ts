import type { ResetPasswordRepository } from '../../domain/repositories/reset-password.repository'
import type { ResetPasswordDto } from '../dtos/reset-password.dto'

export class ResetPasswordUseCase {
  private readonly repository: ResetPasswordRepository

  constructor(repository: ResetPasswordRepository) {
    this.repository = repository
  }

  execute(input: ResetPasswordDto): Promise<string> {
    return this.repository.execute(input.email, input.code, input.password, input.password_confirmation)
  }
}
