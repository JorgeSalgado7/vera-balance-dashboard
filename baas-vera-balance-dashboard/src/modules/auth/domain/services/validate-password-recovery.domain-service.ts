import { InvalidPasswordRecoveryCodeError } from '../errors/auth.error'

export class ValidatePasswordRecoveryDomainService {
  validate(matches: boolean, expiresAt: string | undefined): asserts expiresAt is string {
    const expiration = expiresAt ? Date.parse(expiresAt) : NaN
    if (!matches || !Number.isFinite(expiration) || expiration <= Date.now()) {
      throw new InvalidPasswordRecoveryCodeError()
    }
  }
}
