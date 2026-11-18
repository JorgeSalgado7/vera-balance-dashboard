export interface ResetPasswordRepository {
  execute(email: string, code: string, password: string, passwordConfirmation: string): Promise<string>
}
