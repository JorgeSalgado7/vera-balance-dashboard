import { Injectable, type OnModuleInit } from '@nestjs/common'
import { DiscoveryService } from '@nestjs/core'
import { AppLogger } from './app-logger.service'

@Injectable()
export class OperationLoggingService implements OnModuleInit {
  private readonly instrumented = new WeakSet<object>()

  constructor(private readonly discovery: DiscoveryService, private readonly logger: AppLogger) {}

  onModuleInit(): void {
    let count = 0
    for (const provider of this.discovery.getProviders()) {
      const instance = provider.instance as object | undefined
      if (!instance || this.instrumented.has(instance)) continue
      const name = instance.constructor?.name ?? ''
      if (name === 'JwtService') continue
      if (!/(UseCase|DynamooseAdapter|JwtService|PasswordHashService|PasswordVerifyService|GenerateRecoveryCodeCryptoService|SendEmailResendService)$/.test(name)) continue
      this.instrumented.add(instance)
      const prototype = Object.getPrototypeOf(instance) as Record<string, unknown> | null
      if (!prototype) continue
      for (const method of Object.getOwnPropertyNames(prototype)) {
        if (method === 'constructor' || typeof prototype[method] !== 'function') continue
        this.wrap(instance, name, method)
        count++
      }
    }
    this.logger.info('LoggerModule', 'logger.operations.ready', { count })
  }

  private wrap(instance: object, context: string, method: string): void {
    const target = instance as Record<string, (...args: unknown[]) => unknown>
    const original = target[method]!
    const logger = this.logger
    target[method] = function (this: object, ...args: unknown[]): unknown {
      const operation = `${context}.${method}`
      const start = performance.now()
      logger.info(context, 'operation.started', { operation })
      const success = (result: unknown): unknown => {
        const metadata = { operation, durationMs: Math.round(performance.now() - start),
          ...(Array.isArray(result) ? { count: result.length } : {}),
          ...(result === null ? { found: false } : {}),
          ...(typeof result === 'boolean' ? { result } : {}),
        }
        if (result === false || result === null) logger.warn(context, 'operation.no_result', metadata)
        else logger.info(context, 'operation.completed', metadata)
        return result
      }
      const failure = (error: unknown): never => {
        logger.error(context, 'operation.failed', error, { operation, durationMs: Math.round(performance.now() - start) })
        throw error
      }
      try {
        const result = original.apply(this, args)
        if (result instanceof Promise) return result.then(success, failure)
        return success(result)
      } catch (error) { return failure(error) }
    }
  }
}
