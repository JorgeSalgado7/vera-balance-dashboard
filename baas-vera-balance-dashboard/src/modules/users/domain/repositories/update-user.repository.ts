import type { UserEntity } from '../entities/user.entity'
import type { UpdateUserChanges } from '../interfaces/update-user-changes'

export interface IUpdateUserRepository {
  update(user: UserEntity, changes: UpdateUserChanges, updatedAt: string): Promise<UserEntity>
}
