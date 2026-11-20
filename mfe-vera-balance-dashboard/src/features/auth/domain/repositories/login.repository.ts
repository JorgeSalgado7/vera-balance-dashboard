import type { AuthSession } from '../entities/auth-session.entity'

export interface LoginRepository {
  execute(email: string, password: string): Promise<AuthSession>
}
