import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { HttpProblem } from '../http-problem/http-problem.util';

@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly origins: Set<string>;

  constructor(config: ConfigService) {
    const configured = config.getOrThrow<string>('AUTH_ALLOWED_ORIGINS');
    this.origins = new Set(configured.split(',').map(value => value.trim()).filter(Boolean));
    if (!this.origins.size || [...this.origins].some(origin => {
      try {
        const parsed = new URL(origin);
        return !['https:', 'http:'].includes(parsed.protocol) || parsed.origin !== origin;
      } catch { return true; }
    })) throw new Error('AUTH_ALLOWED_ORIGINS requires exact HTTP origins.');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const origin = request.get('origin');
    if (!origin || !this.origins.has(origin)) {
      throw HttpProblem.forbidden('Request origin is not allowed.', request.originalUrl);
    }
    return true;
  }
}
