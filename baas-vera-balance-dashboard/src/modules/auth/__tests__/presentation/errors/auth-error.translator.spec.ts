import { InvalidPasswordRecoveryCodeError, InvalidRefreshTokenError, InvalidCredentialsError } from '../../../domain/errors/auth.error'
import { AuthErrorTranslator } from '../../../presentation/http/errors/auth-error.translator'
import { HttpProblem } from '../../../../../shared/http-problem/http-problem.util'

describe('AuthErrorTranslator', () => {
  it('translates invalid credentials to the shared problem contract', () => {
    try {
      AuthErrorTranslator.translate(new InvalidCredentialsError(), '/auth/login')
      throw new Error('Expected translated error')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpProblem)
      expect((error as HttpProblem).getStatus()).toBe(401)
      expect((error as HttpProblem).getResponse()).toMatchObject({ status: 401, instance: '/auth/login', detail: 'El correo electrónico o la contraseña no son correctos. Revisa tus datos e inténtalo de nuevo.' })
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
      expect((error as HttpProblem).getResponse()).toMatchObject({ status: 400, instance: '/auth/forgot-password/reset', detail: 'El código de recuperación no es válido o ha vencido. Revisa el código o solicita uno nuevo.' })
    }
  })

  it('leaves unexpected infrastructure errors for the global filter', () => {
    expect(AuthErrorTranslator.translate(new Error('unexpected'), '/auth/login')).toBeUndefined()
  })
})
