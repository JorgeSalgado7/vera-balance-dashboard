import type { AuthUser } from './auth-user-reader.port';

export interface UserPasswordWriterPort {
  update(user: AuthUser, passwordHash: string): Promise<void>;
}
