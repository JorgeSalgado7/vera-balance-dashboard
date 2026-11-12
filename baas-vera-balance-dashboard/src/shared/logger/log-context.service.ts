import { Injectable } from '@nestjs/common'
import { AsyncLocalStorage } from 'node:async_hooks'

export interface LogContext { requestId: string }

@Injectable()
export class LogContextService {
  private readonly storage = new AsyncLocalStorage<LogContext>()

  run<T>(context: LogContext, callback: () => T): T {
    return this.storage.run(context, callback)
  }

  current(): LogContext | undefined {
    return this.storage.getStore()
  }
}
