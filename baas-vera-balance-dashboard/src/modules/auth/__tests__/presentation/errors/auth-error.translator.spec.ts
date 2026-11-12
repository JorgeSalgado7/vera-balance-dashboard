import { InvalidPasswordRecoveryCodeError } from '../../../domain/errors/invalid-password-recovery-code.error'
import { InvalidRefreshTokenError } from '../../../domain/errors/invalid-refresh-token.error'
import { AuthErrorTranslator } from '../../../presentation/http/errors/auth-error.translator'
import { InvalidCredentialsError } from '../../../domain/errors/invalid-credentials.error'
import { HttpProblem } from '../../../../../shared/http-problem/http-problem.util'

describe('AuthErrorTranslator', () => {
  it('translates invalid credentials to the shared problem contract', () => {
    try {
      AuthErrorTranslator.translate(new InvalidCredentialsError(), '/auth/login')
      throw new Error('Expected translated error')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpProblem)
      expect((error as HttpProblem).getStatus()).toBe(401)
      expect((error as HttpProblem).getResponse()).toMatchObject({ status: 401, instance: '/auth/login', detail: 'Credenciales inválidas.' })
    }
  })

  it('translates an invalid refresh token to 401', () => {
    try {
      AuthErrorTranslator.translate(new InvalidRefreshTokenError(), '/auth/refresh')
      throw new Error('Expected translated error')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpProblem)
      expect((error as HttpProblem).getStatus()).toBe(401)
      expect((error as HttpProblem).getResponse()).toMatchObject({ status: 401, instance: '/auth/refresh' })
    }
  })

  it('translates recovery validation failures to a generic 400 without revealing account details', () => {
    try {
      AuthErrorTranslator.translate(new InvalidPasswordRecoveryCodeError(), '/auth/forgot-password/reset')
      throw new Error('Expected translated error')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpProblem)
      expect((error as HttpProblem).getStatus()).toBe(400)
      expect((error as HttpProblem).getResponse()).toMatchObject({ status: 400, instance: '/auth/forgot-password/reset', detail: 'Código de recuperación inválido o expirado.' })
    }
  })

  it('leaves unexpected infrastructure errors for the global filter', () => {
    expect(AuthErrorTranslator.translate(new Error('unexpected'), '/auth/login')).toBeUndefined()
  })
})
