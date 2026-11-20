import type { LoginRepository } from '../../domain/repositories/login.repository'
import type { AuthSession } from '../../domain/entities/auth-session.entity'
import type { LoginDto } from '../dtos/login.dto'

export class LoginUseCase {
  private readonly repository: LoginRepository

  constructor(repository: LoginRepository) {
    this.repository = repository
  }

  execute(input: LoginDto): Promise<AuthSession> {
    return this.repository.execute(input.email, input.password)
  }
}
