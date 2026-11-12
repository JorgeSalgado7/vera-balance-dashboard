import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import type { IVerifyAccessTokenService } from '../../domain/services/verify-access-token.service'
import { InvalidAccessTokenError } from '../../domain/errors/auth.error'

@Injectable()
export class VerifyAccessTokenJwtService implements IVerifyAccessTokenService {
  constructor(private readonly jwt: JwtService, private readonly config: ConfigService) {}

  async verify(token: string): Promise<string> {
    const secret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET')
    try {
      const claims = await this.jwt.verifyAsync<{ sub?: unknown; exp?: unknown }>(token, {
        secret,
        algorithms: ['HS256'],
        audience: 'access',
      })
      if (typeof claims.sub !== 'string' || !claims.sub.trim() ||
        typeof claims.exp !== 'number' || !Number.isFinite(claims.exp)) {
        throw new InvalidAccessTokenError()
      }
      return claims.sub
    } catch {
      throw new InvalidAccessTokenError()
    }
  }
}
