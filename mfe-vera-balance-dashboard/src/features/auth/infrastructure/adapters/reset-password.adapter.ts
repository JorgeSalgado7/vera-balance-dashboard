import type { ResetPasswordRepository } from '../../domain/repositories/reset-password.repository'
import { api } from '../../../../infrastructure/http/api'
import { readMessageResponse } from '../http/read-message-response'

export class ResetPasswordAdapter implements ResetPasswordRepository {
  async execute(email: string, code: string, password: string, passwordConfirmation: string): Promise<string> {
    const { data } = await api.post<unknown>('/auth/forgot-password/reset', {
      email,
      code,
      password,
      password_confirmation: passwordConfirmation,
    })
    return readMessageResponse(data)
  }
}
