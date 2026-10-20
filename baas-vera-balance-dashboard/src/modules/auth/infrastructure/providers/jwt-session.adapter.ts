import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { SessionPort } from '../../application/ports/session.port';
import { InvalidSessionError } from '../../domain/errors/auth.error';

@Injectable()
export class JwtSessionAdapter implements SessionPort {
  private readonly secret: string;

  constructor(config: ConfigService) {
    this.secret = config.getOrThrow<string>('AUTH_SESSION_SECRET');
    if (Buffer.byteLength(this.secret) < 32) throw new Error('AUTH_SESSION_SECRET requires at least 32 bytes.');
  }

  async issue(userId: string): Promise<string> {
    const iat = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ sub: userId, iat, exp: iat + 300 })).toString('base64url');
    const data = `${header}.${payload}`;
    return `${data}.${this.sign(data).toString('base64url')}`;
  }

  async verify(token: string): Promise<string> {
    try {
      if (token.length > 4096 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
        throw new InvalidSessionError();
      }
      const [header, payload, signature] = token.split('.');
      const provided = Buffer.from(signature, 'base64url');
      const expected = this.sign(`${header}.${payload}`);
      if (provided.length !== expected.length || !timingSafeEqual(provided, expected)
        || provided.toString('base64url') !== signature) throw new InvalidSessionError();
      const metadata = JSON.parse(Buffer.from(header, 'base64url').toString('utf8'));
      const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      const now = Math.floor(Date.now() / 1000);
      if (!metadata || metadata.alg !== 'HS256' || metadata.typ !== 'JWT'
        || metadata.crit !== undefined || metadata.b64 !== undefined
        || !claims || typeof claims.sub !== 'string' || !claims.sub
        || !Number.isInteger(claims.iat) || !Number.isInteger(claims.exp)
        || claims.iat > now || claims.exp <= now || claims.exp - claims.iat !== 300) {
        throw new InvalidSessionError();
      }
      return claims.sub;
    } catch {
      throw new InvalidSessionError();
    }
  }

  private sign(data: string): Buffer {
    return createHmac('sha256', this.secret).update(data).digest();
  }
}
