export interface IVerifyAccessTokenService {
  verify(token: string): Promise<string>
}
