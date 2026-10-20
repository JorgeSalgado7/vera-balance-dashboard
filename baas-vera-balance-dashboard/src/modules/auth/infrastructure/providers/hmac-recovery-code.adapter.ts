import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import type { RecoveryCodePort } from '../../application/ports/recovery-code.port';

@Injectable()
export class HmacRecoveryCodeAdapter implements RecoveryCodePort {
  private readonly secret: string;

  constructor(config: ConfigService) {
    this.secret = config.getOrThrow<string>('AUTH_RECOVERY_SECRET');
    if (Buffer.byteLength(this.secret) < 32) throw new Error('AUTH_RECOVERY_SECRET requires at least 32 bytes.');
    if (this.secret === config.get<string>('AUTH_SESSION_SECRET')) {
      throw new Error('Session and recovery secrets must be different.');
    }
  }

  generate(): string { return randomInt(0, 1_000_000).toString().padStart(6, '0'); }

  protect(userId: string, code: string, createdAt: string): string {
    return createHmac('sha256', this.secret).update(JSON.stringify([userId, createdAt, code])).digest('hex');
  }

  matches(userId: string, code: string, createdAt: string, hash: string): boolean {
    if (!/^[0-9]{6}$/.test(code) || !/^[a-f0-9]{64}$/.test(hash)) return false;
    return timingSafeEqual(Buffer.from(this.protect(userId, code, createdAt), 'hex'), Buffer.from(hash, 'hex'));
  }
}
