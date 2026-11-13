import { Injectable, type NestMiddleware } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import type { Request, Response, NextFunction } from 'express'
import { LogContextService } from './log-context.service'
import { AppLogger } from './app-logger.service'

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly context: LogContextService, private readonly logger: AppLogger) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const context = { requestId: randomUUID() }
    const start = performance.now()
    const segments = request.originalUrl.split('?')[0]!.split('/').filter(Boolean)
    const resources = ['clinics', 'users', 'auth', 'therapy-types', 'docs', 'favicon.ico']
    const routes = ['login', 'logout', 'refresh', 'forgot-password', 'reset', 'password', 'status']
    const path = resources.includes(segments[0] ?? '')
      ? '/' + segments.map((segment, index) => index === 0 || routes.includes(segment) ? segment : ':id').join('/')
      : '/desconocido'
    const metadata = { method: request.method, path }
    let finished = false
    this.context.run(context, () => {
      this.logger.info('HTTP', 'request.started', metadata)
      response.once('finish', () => this.context.run(context, () => {
        finished = true
        const result = { ...metadata, status: response.statusCode, durationMs: Math.round(performance.now() - start) }
        if (response.statusCode >= 500) this.logger.error('HTTP', 'request.failed', undefined, result)
        else if (response.statusCode >= 400) this.logger.warn('HTTP', 'request.rejected', result)
        else this.logger.info('HTTP', 'request.completed', result)
      }))
      response.once('close', () => {
        if (!finished) this.context.run(context, () => this.logger.warn('HTTP', 'request.aborted', {
          ...metadata, durationMs: Math.round(performance.now() - start),
        }))
      })
      next()
    })
  }
}
