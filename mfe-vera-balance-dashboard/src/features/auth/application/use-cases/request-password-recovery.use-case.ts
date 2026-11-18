import type { RequestPasswordRecoveryRepository } from '../../domain/repositories/request-password-recovery.repository'

export class RequestPasswordRecoveryUseCase {
  private readonly repository: RequestPasswordRecoveryRepository

  constructor(repository: RequestPasswordRecoveryRepository) {
    this.repository = repository
  }

  execute(email: string): Promise<string> {
    return this.repository.execute(email)
  }
}
