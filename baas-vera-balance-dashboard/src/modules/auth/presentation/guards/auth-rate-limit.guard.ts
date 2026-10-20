import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import type { Request } from 'express';

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private readonly limit: number;
  private readonly window: number;
  private readonly buckets = new Map<string, { attempts: number; expires: number }>();

  constructor(config: ConfigService) {
    this.limit = Number(config.getOrThrow('AUTH_RATE_LIMIT'));
    this.window = Number(config.getOrThrow('AUTH_RATE_WINDOW_MS'));
    if (!Number.isSafeInteger(this.limit) || this.limit < 1
      || !Number.isSafeInteger(this.window) || this.window < 1) {
      throw new Error('AUTH_RATE_LIMIT and AUTH_RATE_WINDOW_MS must be positive integers.');
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const now = Date.now();
    for (const [key, bucket] of this.buckets) {
      if (bucket.expires <= now) this.buckets.delete(key);
    }
    const operation = String(request.route?.path ?? request.path);
    const keys = [operation + ':ip:' + request.ip];
    if (typeof request.body?.email === 'string') {
      const email = createHash('sha256').update(request.body.email.trim().toLowerCase()).digest('hex');
      keys.push(operation + ':email:' + email);
    }
    for (const key of keys) {
      const bucket = this.buckets.get(key) ?? { attempts: 0, expires: now + this.window };
      bucket.attempts++;
      this.buckets.set(key, bucket);
      if (bucket.attempts > this.limit) {
        throw new HttpException({
          type: 'https://www.rfc-editor.org/rfc/rfc6585#section-4',
          title: 'Too many requests.',
          status: 429,
          instance: request.originalUrl,
          detail: 'Too many requests. Try again later.'
        }, 429);
      }
    }
    return true;
  }
}
