import { EventEmitter } from 'node:events'
import type { Request, Response } from 'express'
import { RequestLoggingMiddleware } from '../request-logging.middleware'
import { LogContextService } from '../log-context.service'
import type { AppLogger } from '../app-logger.service'

describe('RequestLoggingMiddleware', () => {
  const context = new LogContextService()
  const events: Array<{ level: string, event: string, metadata: unknown, requestId?: string }> = []
  const logger = {
    info: (_scope: string, event: string, metadata: unknown) => events.push({ level: 'info', event, metadata, ...context.current() }),
    warn: (_scope: string, event: string, metadata: unknown) => events.push({ level: 'warn', event, metadata, ...context.current() }),
    error: (_scope: string, event: string, _error: unknown, metadata: unknown) => events.push({ level: 'error', event, metadata, ...context.current() }),
  }
  beforeEach(() => { events.length = 0 })

  it.each([[200, 'request.completed'], [400, 'request.rejected'], [500, 'request.failed']])('records the final HTTP status %s without queries or identifiers', (statusCode, event) => {
    const response = Object.assign(new EventEmitter(), { statusCode })
    const request = { method: 'PATCH', originalUrl: '/users/private-id?token=private-token', body: { password: 'private-password' } }
    let nextRequestId: string | undefined
    new RequestLoggingMiddleware(context, logger as unknown as AppLogger).use(request as Request, response as unknown as Response, () => {
      nextRequestId = context.current()?.requestId
    })
    response.emit('finish')
    response.emit('close')
    expect(events).toHaveLength(2)
    expect(events[1]).toMatchObject({ event, requestId: nextRequestId, metadata: { status: statusCode, path: '/users/:id' } })
    expect(JSON.stringify(events)).not.toContain('private-')
  })

  it('records a disconnected request without a duplicate completion', () => {
    const response = new EventEmitter()
    new RequestLoggingMiddleware(context, logger as unknown as AppLogger).use({ method: 'GET', originalUrl: '/users' } as Request, response as unknown as Response, () => {})
    response.emit('close')
    expect(events[1]?.event).toBe('request.aborted')
  })
})
