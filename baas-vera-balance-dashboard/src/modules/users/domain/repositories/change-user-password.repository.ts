import type { UserEntity } from '../entities/user.entity'

export interface IChangeUserPasswordRepository {
  changePassword(user: UserEntity, passwordHash: string, updatedAt: string): Promise<void>
}
