import type { IVerifyAccessTokenService } from '../../domain/services/verify-access-token.service'

export class LogoutUseCase {
  constructor(private readonly verifier: IVerifyAccessTokenService) {}

  async execute(accessToken: string): Promise<void> {
    await this.verifier.verify(accessToken)
  }
}
