import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import type { IIssueLoginTokensService } from '../../domain/services/issue-login-tokens.service'

const TOKEN_TTL_SECONDS = 5 * 60

@Injectable()
export class IssueLoginTokensJwtService implements IIssueLoginTokensService {
  constructor(private readonly jwt: JwtService, private readonly config: ConfigService) {}

  async issue(userId: string) {
    const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET')
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET')
    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync({ sub: userId }, { secret: accessSecret, algorithm: 'HS256', expiresIn: TOKEN_TTL_SECONDS, audience: 'access' }),
      this.jwt.signAsync({ sub: userId }, { secret: refreshSecret, algorithm: 'HS256', expiresIn: TOKEN_TTL_SECONDS, audience: 'refresh' }),
    ])
    return { access_token, refresh_token }
  }
}
