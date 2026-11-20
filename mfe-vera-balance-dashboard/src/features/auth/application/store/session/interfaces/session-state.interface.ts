import type { AuthSession } from '../../../../domain/entities/auth-session.entity'

export interface SessionStateI {
  accessToken: string | null
  refreshToken: string | null
  user: AuthSession['user'] | null
}
