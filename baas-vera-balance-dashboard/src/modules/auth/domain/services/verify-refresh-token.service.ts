export interface IVerifyRefreshTokenService {
  verify(token: string): Promise<string>
}
