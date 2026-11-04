import type { UserEntity } from '../entities/user.entity'

export interface IUpdateUserStatusRepository {
  updateStatus(user: UserEntity, status: UserEntity['status'], updatedAt: string): Promise<UserEntity>
}
