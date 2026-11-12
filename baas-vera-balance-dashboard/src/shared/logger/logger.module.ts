import { Global, Module, RequestMethod, type MiddlewareConsumer, type NestModule } from '@nestjs/common'
import { DiscoveryModule } from '@nestjs/core'
import { AppLogger } from './app-logger.service'
import { LogContextService } from './log-context.service'
import { OperationLoggingService } from './operation-logging.service'
import { RequestLoggingMiddleware } from './request-logging.middleware'

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [AppLogger, LogContextService, OperationLoggingService, RequestLoggingMiddleware],
  exports: [AppLogger],
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggingMiddleware).forRoutes({ path: '{*path}', method: RequestMethod.ALL })
  }
}
