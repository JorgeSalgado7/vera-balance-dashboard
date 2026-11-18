import type { ResetPasswordRepository } from '../../domain/repositories/reset-password.repository'
import { postAuthMessage } from '../http/post-auth-message'

export class ResetPasswordAdapter implements ResetPasswordRepository {
  execute(email: string, code: string, password: string, passwordConfirmation: string): Promise<string> {
    return postAuthMessage('/auth/forgot-password/reset', {
      email,
      code,
      password,
      password_confirmation: passwordConfirmation,
    })
  }
}
