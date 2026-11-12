import { ConsoleLogger, Injectable } from '@nestjs/common'
import { LogContextService } from './log-context.service'
import { sanitizeLogMetadata } from './sanitize-log-metadata'

type Level = 'debug' | 'info' | 'warn' | 'error'

@Injectable()
export class AppLogger {
  private readonly output = new ConsoleLogger('VeraBalance')

  constructor(private readonly context: LogContextService = new LogContextService()) {}

  info(context: string, event: string, metadata: Record<string, unknown> = {}): void {
    this.write('info', context, event, metadata)
  }

  debug(context: string, event: string, metadata: Record<string, unknown> = {}): void {
    this.write('debug', context, event, metadata)
  }

  warn(context: string, event: string, metadata: Record<string, unknown> = {}): void {
    this.write('warn', context, event, metadata)
  }

  error(context: string, event: string, error?: unknown, metadata: Record<string, unknown> = {}): void {
    const value = error as { constructor?: { name?: string }, name?: string, code?: string,
      cause?: { code?: string }, stack?: string, $metadata?: { httpStatusCode?: number, attempts?: number } } | null
    const errorType = value?.constructor?.name === 'Error' ? value?.name : value?.constructor?.name
    const errorCode = value?.code ?? value?.cause?.code
    const safeCodes = ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN', 'EPIPE', 'UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_SOCKET']
    this.write('error', context, event, {
      ...metadata,
      ...(errorType && /^[A-Za-z0-9_]{1,80}$/.test(errorType) ? { errorType } : {}),
      ...(safeCodes.includes(errorCode ?? '') ? { errorCode } : {}),
      ...(value?.$metadata ? { httpStatus: value.$metadata.httpStatusCode, attempts: value.$metadata.attempts } : {}),
      ...(typeof value?.stack === 'string' ? { trace: value.stack.split('\n').filter(line => line.trim().startsWith('at ')).slice(0, 6) } : {}),
    })
  }

  private write(level: Level, context: string, event: string, metadata: Record<string, unknown>): void {
    const levels = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 }
    const configured = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'test' ? 'silent' : 'info')
    const minimum = levels[configured as keyof typeof levels] ?? levels.info
    if (levels[level] < minimum) return
    try {
      const entry = JSON.stringify({ ...sanitizeLogMetadata(metadata), timestamp: new Date(Date.now()).toISOString(),
        level, context, event, ...this.context.current() })
      if (level === 'info') this.output.log(entry)
      else this.output[level](entry)
    } catch {
      // A logging failure must not change the result of a business operation.
    }
  }
}
