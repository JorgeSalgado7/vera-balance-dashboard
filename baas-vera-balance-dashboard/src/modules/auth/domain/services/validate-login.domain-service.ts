import { InvalidCredentialsError } from '../errors/invalid-credentials.error'
import type { LoginUser } from '../entities/login-user.entity'

export class ValidateLoginDomainService {
  validate(user: LoginUser | null, passwordMatches: boolean): asserts user is LoginUser {
    if (!user || !passwordMatches || user.status !== 'Activo') {
      throw new InvalidCredentialsError()
    }
  }
}
