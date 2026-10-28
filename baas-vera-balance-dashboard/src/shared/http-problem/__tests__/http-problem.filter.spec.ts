import { HttpException } from '@nestjs/common'
import type { ArgumentsHost } from '@nestjs/common'
import { HttpProblemFilter } from '../http-problem.filter'
import { HttpProblem } from '../http-problem.util'
import { UserErrorTranslator } from '../../../modules/users/presentation/http/errors/user-error.translator'
import { UserAlreadyExistsError } from '../../../modules/users/domain/errors/user.error'

describe('HttpProblemFilter', () => {
  const filter = new HttpProblemFilter()
  let response: { status: jest.Mock; json: jest.Mock; send: jest.Mock }
  let host: ArgumentsHost
  let log: jest.SpyInstance

  beforeEach(() => {
    response = { status: jest.fn(), json: jest.fn(), send: jest.fn() }
    response.status.mockReturnValue(response)
    host = { switchToHttp: () => ({ getResponse: () => response, getRequest: () => ({ originalUrl: '/users' }) }) } as unknown as ArgumentsHost
    log = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => jest.restoreAllMocks())

  it('returns an empty 204 for the favicon request', () => {
    host = { switchToHttp: () => ({ getResponse: () => response, getRequest: () => ({ originalUrl: '/favicon.ico' }) }) } as unknown as ArgumentsHost
    filter.catch(new Error('ignored'), host)
    expect(response.status).toHaveBeenCalledWith(204)
    expect(response.send).toHaveBeenCalledTimes(1)
    expect(response.json).not.toHaveBeenCalled()
  })

  it('translates a domain error through its module translator', () => {
    filter.catch(new UserAlreadyExistsError(), host)
    expect(response.status).toHaveBeenCalledWith(409)
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ status: 409, instance: '/users' }))
  })

  it('normalizes a plain HTTP exception emitted by a translator', () => {
    jest.spyOn(UserErrorTranslator, 'translate').mockImplementation(() => {
      throw new HttpException('translated detail', 403)
    })
    filter.catch(new Error('original'), host)
    expect(response.status).toHaveBeenCalledWith(403)
    expect(response.json).toHaveBeenCalledWith({ detail: 'translated detail', instance: '/users' })
  })

  it('preserves a problem while setting instance from the current request', () => {
    filter.catch(HttpProblem.notFound('missing', '/outdated'), host)
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ status: 404, detail: 'missing', instance: '/users' }))
  })

  it('passes through a complete problem from an HTTP exception', () => {
    filter.catch(new HttpException({ type: 'https://example.com/conflict', title: 'Conflict', status: 409, detail: 'custom detail', instance: '/old' }, 409), host)
    expect(response.json).toHaveBeenCalledWith({ type: 'https://example.com/conflict', title: 'Conflict', status: 409, detail: 'custom detail', instance: '/users' })
  })

  it.each([400, 401, 403, 404, 409, 503, 418])('normalizes a plain HTTP message with status %s', (status) => {
    filter.catch(new HttpException('plain detail', status), host)
    expect(response.status).toHaveBeenCalledWith([400, 401, 403, 404, 409, 503].includes(status) ? status : 500)
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ detail: 'plain detail', instance: '/users' }))
  })

  it('turns a validation message array into per-error messages', () => {
    filter.catch(new HttpException({ message: ['email invalid', 'name missing'] }, 400), host)
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ status: 400, errors: [{ message: 'email invalid' }, { message: 'name missing' }] }))
  })

  it('prefers a string message to detail when normalizing an HTTP exception', () => {
    filter.catch(new HttpException({ message: 'message', detail: 'detail' }, 404), host)
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ detail: 'message' }))
  })

  it('uses an explicit detail when message is absent', () => {
    filter.catch(new HttpException({ detail: 'explicit detail' }, 403), host)
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ detail: 'explicit detail' }))
  })

  it.each([
    [400, 'Validate that the elements in the errors parameter exist and are correct.'],
    [401, 'Authentication is required to access this resource.'],
    [403, 'You do not have permission to access this resource.'],
    [404, 'No resource was found with the provided ID.'],
    [409, 'A resource with the same identifier already exists.'],
    [503, 'The service is temporarily unavailable.'],
    [500, 'An unexpected error has occurred. Please try again later.'],
  ] as const)('uses the default detail for HTTP status %s', (status, detail) => {
    filter.catch(new HttpException({}, status), host)
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ detail }))
    if (status >= 500) expect(log).toHaveBeenCalled()
  })

  it('does not expose an unexpected error in the public response', () => {
    const error = new Error('internal-secret')
    filter.catch(error, host)
    expect(response.status).toHaveBeenCalledWith(500)
    expect(log).toHaveBeenCalledWith('ERROR:', error)
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ detail: 'An unexpected error has occurred. Please try again later.' }))
    expect(JSON.stringify(response.json.mock.calls)).not.toContain('internal-secret')
  })

  it('propagates a translator failure that is not an HTTP exception', () => {
    const error = new Error('translator failure')
    jest.spyOn(UserErrorTranslator, 'translate').mockImplementation(() => {
      throw error
    })
    expect(() => filter.catch(new Error('original'), host)).toThrow(error)
    expect(response.json).not.toHaveBeenCalled()
  })
})
