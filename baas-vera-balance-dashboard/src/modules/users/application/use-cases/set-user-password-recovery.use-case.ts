import type { ISetUserPasswordRecoveryRepository, SetUserPasswordRecoveryInput } from '../../domain/repositories/set-user-password-recovery.repository'

export class SetUserPasswordRecoveryUseCase {
  constructor(private readonly repository: ISetUserPasswordRecoveryRepository) {}

  execute(input: SetUserPasswordRecoveryInput): Promise<boolean> {
    return this.repository.set(input, new Date(Date.now()).toISOString())
  }
}
