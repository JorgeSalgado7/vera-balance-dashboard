import { ConsoleLogger } from '@nestjs/common'
import { AppLogger } from '../app-logger.service'
import { LogContextService } from '../log-context.service'

describe('AppLogger', () => {
  const previous = process.env.LOG_LEVEL
  let output: jest.SpyInstance
  beforeEach(() => {
    process.env.LOG_LEVEL = 'debug'
    output = jest.spyOn(ConsoleLogger.prototype, 'log').mockImplementation(() => {})
    jest.spyOn(ConsoleLogger.prototype, 'error').mockImplementation(() => {})
    jest.spyOn(ConsoleLogger.prototype, 'warn').mockImplementation(() => {})
    jest.spyOn(ConsoleLogger.prototype, 'debug').mockImplementation(() => {})
  })
  afterEach(() => {
    if (previous === undefined) delete process.env.LOG_LEVEL
    else process.env.LOG_LEVEL = previous
    jest.restoreAllMocks()
  })

  it('records structured events and the current request without allowing metadata to replace reserved fields', () => {
    const context = new LogContextService()
    const logger = new AppLogger(context)
    context.run({ requestId: 'request-1' }, () => logger.info('Users', 'operation.completed', {
      operation: 'CreateUserUseCase.execute', durationMs: 5, requestId: 'wrong', level: 'wrong',
    }))
    expect(JSON.parse(output.mock.calls[0][0])).toMatchObject({ requestId: 'request-1', context: 'Users',
      event: 'operation.completed', level: 'info', durationMs: 5 })
  })

  it('redacts sensitive nested values and handles cycles', () => {
    const nested: Record<string, unknown> = { password: 'private-password', email: 'private-email',
      Authorization: 'private-auth', recoveryCode: 'private-code', apiKey: 'private-key', count: 2 }
    nested.cycle = nested
    new AppLogger().info('Test', 'test', { nested })
    const entry = output.mock.calls[0][0] as string
    expect(entry).not.toContain('private-')
    expect(JSON.parse(entry).nested).toMatchObject({ password: '[oculto]', email: '[oculto]', count: 2, cycle: '[referencia circular]' })
  })

  it('records technical failure information without the original error message', () => {
    const failure = Object.assign(new Error('private-password private-email'), { code: 'ECONNREFUSED', $metadata: { httpStatusCode: 503, attempts: 2 } })
    new AppLogger().error('Resend', 'email.connection.failed', failure)
    const entry = (ConsoleLogger.prototype.error as jest.Mock).mock.calls[0][0] as string
    expect(JSON.parse(entry)).toMatchObject({ errorType: 'Error', errorCode: 'ECONNREFUSED', httpStatus: 503, attempts: 2 })
    expect(entry).not.toContain('private-')
  })

  it('honors the configured logging threshold', () => {
    process.env.LOG_LEVEL = 'warn'
    const logger = new AppLogger()
    logger.debug('Test', 'debug')
    logger.info('Test', 'info')
    logger.warn('Test', 'warning')
    expect(output).not.toHaveBeenCalled()
    expect(ConsoleLogger.prototype.debug).not.toHaveBeenCalled()
    expect(ConsoleLogger.prototype.warn).toHaveBeenCalledTimes(1)
  })

  it('does not let console failures interrupt the operation', () => {
    output.mockImplementation(() => { throw new Error('output unavailable') })
    expect(() => new AppLogger().info('Test', 'event')).not.toThrow()
  })

  it('keeps overlapping asynchronous request contexts separate', async () => {
    const context = new LogContextService()
    const logger = new AppLogger(context)
    await Promise.all(['first', 'second'].map(requestId => context.run({ requestId }, async () => {
      await Promise.resolve()
      logger.info('Test', 'background.completed')
    })))
    expect(output.mock.calls.map(call => JSON.parse(call[0]).requestId).sort()).toEqual(['first', 'second'])
    expect(context.current()).toBeUndefined()
  })
})
