import type { SetUserPasswordRecoveryDto } from '../dtos/set-user-password-recovery.dto'
import type { IUserRepository } from '../../domain/repositories/user.repository'

export class SetUserPasswordRecoveryUseCase {
  constructor(private readonly repository: Pick<IUserRepository, 'set'>) {}

  execute(input: SetUserPasswordRecoveryDto): Promise<boolean> {
    return this.repository.set(input, new Date(Date.now()).toISOString())
  }
}
