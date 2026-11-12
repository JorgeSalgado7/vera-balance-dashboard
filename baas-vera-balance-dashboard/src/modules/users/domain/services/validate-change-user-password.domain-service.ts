import { InvalidNewUserPasswordError, UserPasswordConfirmationMismatchError } from '../errors/user.error'

export class ValidateChangeUserPasswordDomainService {
  execute(password: string, confirmation: string): void {
    if (typeof password !== 'string' || !password.trim()) throw new InvalidNewUserPasswordError()
    if (password !== confirmation) throw new UserPasswordConfirmationMismatchError()
  }
}
