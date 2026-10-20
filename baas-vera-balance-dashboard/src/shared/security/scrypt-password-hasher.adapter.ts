import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import type { PasswordHasherPort } from './password-hasher.port';

@Injectable()
export class ScryptPasswordHasherAdapter implements PasswordHasherPort {
  private derive(password: string, salt: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      scrypt(password, salt, 64, { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 },
        (error, key) => error ? reject(error) : resolve(key));
    });
  }

  async hash(password: string): Promise<string> {
    const salt = randomBytes(32).toString('hex');
    const key = await this.derive(password, salt);
    return `scrypt$v1$${salt}$${key.toString('hex')}`;
  }

  async verify(password: string, hash: string): Promise<boolean> {
    const match = /^scrypt\$v1\$([a-f0-9]{64})\$([a-f0-9]{128})$/.exec(hash);
    if (!match) return false;
    const key = await this.derive(password, match[1]);
    return timingSafeEqual(key, Buffer.from(match[2], 'hex'));
  }
}
