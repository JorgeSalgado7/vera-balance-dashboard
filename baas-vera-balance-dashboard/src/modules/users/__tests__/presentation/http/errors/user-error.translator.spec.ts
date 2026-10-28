import { HttpException } from '@nestjs/common'
import { UserErrorTranslator } from '../../../../presentation/http/errors/user-error.translator'
import * as errors from '../../../../domain/errors/user.error'

describe('UserErrorTranslator', () => {
  it.each([
    [errors.UserAlreadyExistsError, 409],
    [errors.UserCreationNotAllowedError, 403],
    [errors.MissingUserNameError, 400],
    [errors.MissingUserEmailError, 400],
    [errors.InvalidUserEmailError, 400],
    [errors.MissingUserPasswordError, 400],
    [errors.MissingUserProfessionalLicenseError, 400],
    [errors.InvalidUserRoleError, 400],
    [errors.InvalidUserStatusError, 400],
    [errors.InvalidUserClinicError, 400],
  ])('translates %s to HTTP %s without losing its detail or request path', (ErrorType, status) => {
    const error = new ErrorType()
    let translated: unknown
    try {
      UserErrorTranslator.translate(error, '/users')
    } catch (result) {
      translated = result
    }
    expect(translated).toBeInstanceOf(HttpException)
    const problem = translated as HttpException
    expect(problem.getStatus()).toBe(status)
    expect(problem.getResponse()).toMatchObject({ status, detail: error.message, instance: '/users', type: expect.any(String), title: expect.any(String) })
  })

  it.each([new Error('unexpected'), null, undefined, 'failure'])('leaves unrecognized errors for the global filter (%s)', (error) => {
    expect(UserErrorTranslator.translate(error, '/users')).toBeUndefined()
  })
})
