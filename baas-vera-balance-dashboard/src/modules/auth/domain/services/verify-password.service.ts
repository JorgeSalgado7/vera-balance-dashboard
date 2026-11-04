export interface IVerifyPasswordService {
  verify(password: string, hash: string): Promise<boolean>
}
