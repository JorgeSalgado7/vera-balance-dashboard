import { Test } from '@nestjs/testing'
import { Module } from '@nestjs/common'
import { LoggerModule } from '../logger.module'
import { AppLogger } from '../app-logger.service'

class ExampleUseCase { execute() { return 'success' } }
@Module({ imports: [LoggerModule], providers: [ExampleUseCase] })
class ExampleModule {}

describe('LoggerModule composition', () => {
  it('discovers and instruments real Nest providers during initialization', async () => {
    const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() }
    const module = await Test.createTestingModule({ imports: [ExampleModule] }).overrideProvider(AppLogger).useValue(logger).compile()
    const app = module.createNestApplication()
    try {
      await app.init()
      expect(module.get(ExampleUseCase).execute()).toBe('success')
      expect(logger.info).toHaveBeenCalledWith('ExampleUseCase', 'operation.started', expect.any(Object))
      expect(logger.info).toHaveBeenCalledWith('ExampleUseCase', 'operation.completed', expect.any(Object))
    } finally { await app.close() }
  })
})
