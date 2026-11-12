import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import type { IVerifyRefreshTokenService } from '../../domain/services/verify-refresh-token.service'
import { InvalidRefreshTokenError } from '../../domain/errors/auth.error'

@Injectable()
export class VerifyRefreshTokenJwtService implements IVerifyRefreshTokenService {
  constructor(private readonly jwt: JwtService, private readonly config: ConfigService) {}

  async verify(token: string): Promise<string> {
    const secret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET')
    try {
      const claims = await this.jwt.verifyAsync<{ sub?: unknown; exp?: unknown }>(token, {
        secret,
        algorithms: ['HS256'],
        audience: 'refresh',
      })
      if (typeof claims.sub !== 'string' || !claims.sub.trim() ||
        typeof claims.exp !== 'number' || !Number.isFinite(claims.exp)) {
        throw new InvalidRefreshTokenError()
      }
      return claims.sub
    } catch {
      throw new InvalidRefreshTokenError()
    }
  }
}
