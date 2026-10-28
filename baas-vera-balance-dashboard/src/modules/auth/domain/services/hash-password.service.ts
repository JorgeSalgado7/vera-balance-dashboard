export interface IHashPasswordService {
  hash(password: string): Promise<string>
}
