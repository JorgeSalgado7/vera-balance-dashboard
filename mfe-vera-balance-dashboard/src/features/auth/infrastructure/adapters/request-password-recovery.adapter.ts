import type { RequestPasswordRecoveryRepository } from '../../domain/repositories/request-password-recovery.repository'
import { postAuthMessage } from '../http/post-auth-message'

export class RequestPasswordRecoveryAdapter implements RequestPasswordRecoveryRepository {
  execute(email: string): Promise<string> {
    return postAuthMessage('/auth/forgot-password', { email })
  }
}
