import { InvalidNewUserPasswordError } from '../errors/invalid-new-user-password.error'
import { UserPasswordConfirmationMismatchError } from '../errors/user-password-confirmation-mismatch.error'

export class ValidateChangeUserPasswordDomainService {
  execute(password: string, confirmation: string): void {
    if (typeof password !== 'string' || !password.trim()) throw new InvalidNewUserPasswordError()
    if (password !== confirmation) throw new UserPasswordConfirmationMismatchError()
  }
}
