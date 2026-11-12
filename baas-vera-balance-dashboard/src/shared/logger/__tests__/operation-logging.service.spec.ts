import { OperationLoggingService } from '../operation-logging.service'
import { DiscoveryService } from '@nestjs/core'
import type { AppLogger } from '../app-logger.service'

class ExampleUseCase {
  execute(value: unknown): unknown { return value }
}
class ExampleDynamooseAdapter {
  async findAll(): Promise<number[]> { return [1, 2] }
  async fail(): Promise<void> { throw new Error('private') }
}

describe('OperationLoggingService', () => {
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() }
  beforeEach(() => jest.resetAllMocks())
  function instrument(instances: object[]) {
    const discovery = { getProviders: () => instances.map(instance => ({ instance })) } as unknown as DiscoveryService
    const service = new OperationLoggingService(discovery, logger as unknown as AppLogger)
    service.onModuleInit()
    return service
  }

  it('preserves synchronous results without exposing arguments or return objects', () => {
    const operation = new ExampleUseCase()
    instrument([operation])
    const value = { password: 'private', email: 'private' }
    expect(operation.execute(value)).toBe(value)
    expect(logger.info).toHaveBeenCalledWith('ExampleUseCase', 'operation.completed', expect.objectContaining({ operation: 'ExampleUseCase.execute' }))
    expect(JSON.stringify(logger.info.mock.calls)).not.toContain('private')
  })

  it('logs the count of asynchronously returned items', async () => {
    const adapter = new ExampleDynamooseAdapter()
    instrument([adapter])
    await expect(adapter.findAll()).resolves.toEqual([1, 2])
    expect(logger.info).toHaveBeenCalledWith('ExampleDynamooseAdapter', 'operation.completed', expect.objectContaining({ count: 2 }))
  })

  it('preserves asynchronous failures and records the failing operation', async () => {
    const adapter = new ExampleDynamooseAdapter()
    instrument([adapter])
    await expect(adapter.fail()).rejects.toThrow('private')
    expect(logger.error).toHaveBeenCalledWith('ExampleDynamooseAdapter', 'operation.failed', expect.any(Error), expect.objectContaining({ operation: 'ExampleDynamooseAdapter.fail' }))
  })

  it('preserves synchronous exceptions', () => {
    const error = new Error('private')
    class FailingUseCase { execute() { throw error } }
    const operation = new FailingUseCase()
    instrument([operation])
    expect(() => operation.execute()).toThrow(error)
    expect(logger.error).toHaveBeenCalledTimes(1)
  })

  it.each([null, false])('distinguishes an empty/negative outcome %p', result => {
    const operation = new ExampleUseCase()
    instrument([operation])
    expect(operation.execute(result)).toBe(result)
    expect(logger.warn).toHaveBeenCalledWith('ExampleUseCase', 'operation.no_result', expect.any(Object))
  })

  it('wraps aliases and repeated initialization only once', () => {
    const operation = new ExampleUseCase()
    const service = instrument([operation, operation])
    service.onModuleInit()
    operation.execute('value')
    expect(logger.info.mock.calls.filter(call => call[1] === 'operation.started')).toHaveLength(1)
  })
})
