import type { LoginRepository } from '../../domain/repositories/login.repository'
import type { AuthSession } from '../../domain/entities/auth-session.entity'
import { api } from '../../../../infrastructure/http/api'
import { mapLoginSession } from '../mappers/login-session.mapper'

export class LoginAdapter implements LoginRepository {
  async execute(email: string, password: string): Promise<AuthSession> {
    const { data } = await api.post<unknown>('/auth/login', { email, password })
    return mapLoginSession(data)
  }
}
