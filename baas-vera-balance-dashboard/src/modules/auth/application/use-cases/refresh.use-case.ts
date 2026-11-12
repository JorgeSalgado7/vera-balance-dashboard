import type { IVerifyRefreshTokenService } from '../../domain/services/verify-refresh-token.service'
import type { IIssueLoginTokensService } from '../../domain/services/issue-login-tokens.service'
import type { RefreshDto } from '../dtos/refresh.dto'
import type { RefreshResponseDto } from '../dtos/refresh-response.dto'

export class RefreshUseCase {
  constructor(
    private readonly verifier: IVerifyRefreshTokenService,
    private readonly tokens: IIssueLoginTokensService,
  ) {}

  async execute(input: RefreshDto): Promise<RefreshResponseDto> {
    const userId = await this.verifier.verify(input.refresh_token)
    const tokens = await this.tokens.issue(userId)
    return { access_token: tokens.access_token, refresh_token: tokens.refresh_token }
  }
}
