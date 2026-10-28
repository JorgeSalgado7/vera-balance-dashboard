import { HttpException } from '@nestjs/common'
import { HttpProblem } from '../http-problem.util'

describe('HttpProblem', () => {
  it.each([
    ['badRequest', 400, 'Bad request.'],
    ['unauthorized', 401, 'Unauthorized.'],
    ['forbidden', 403, 'Forbidden.'],
    ['notFound', 404, 'Resource not found.'],
    ['conflict', 409, 'The resource already exists.'],
    ['internal', 500, 'Internal Server Error.'],
    ['serviceUnavailable', 503, 'Service Unavailable.'],
  ] as const)('creates a %s HTTP exception with consistent status and request information', (method, status, title) => {
    const problem = HttpProblem[method]('detail', '/users')
    expect(problem).toBeInstanceOf(HttpException)
    expect(problem.getStatus()).toBe(status)
    expect(problem.getResponse()).toMatchObject({ type: expect.stringMatching(/^https:\/\//), title, status, instance: '/users', detail: 'detail' })
  })

  it('includes validation details only when present', () => {
    const errors = [{ field: 'email', message: 'Invalid email' }]
    expect(HttpProblem.badRequest('invalid', '/users', errors).getResponse()).toMatchObject({ errors })
    expect(HttpProblem.badRequest('invalid', '/users', []).getResponse()).not.toHaveProperty('errors')
    expect(HttpProblem.badRequest('invalid', '/users').getResponse()).not.toHaveProperty('errors')
  })

  it.each([400, 404, 409, 503, 500, 418])('maps external status %s to a supported problem', (status) => {
    const problem = HttpProblem.external({ detail: 'upstream failure' }, '/users', status)
    expect(problem.getStatus()).toBe([400, 404, 409, 503].includes(status) ? status : 500)
    expect(problem.getResponse()).toMatchObject({ detail: 'upstream failure', instance: '/users' })
  })

  it.each([
    [{ detail: 'detail', Message: 'Message', message: 'message' }, 'detail'],
    [{ Message: 'Message', message: 'message' }, 'Message'],
    [{ message: 'message' }, 'message'],
    [{}, 'An unexpected error has occurred. Please try again later.'],
    [null, 'An unexpected error has occurred. Please try again later.'],
  ] as const)('normalizes the external detail in priority order (%j)', (response, detail) => {
    expect(HttpProblem.external(response, '/users', 500).getResponse()).toMatchObject({ detail })
  })
})
