import type { RequestPasswordRecoveryRepository } from '../../domain/repositories/request-password-recovery.repository'
import { api } from '../../../../infrastructure/http/api'
import { readMessageResponse } from '../http/read-message-response'

export class RequestPasswordRecoveryAdapter implements RequestPasswordRecoveryRepository {
  async execute(email: string): Promise<string> {
    const { data } = await api.post<unknown>('/auth/forgot-password', { email })
    return readMessageResponse(data)
  }
}
