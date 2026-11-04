import type { UserEntity } from '../entities/user.entity'

export interface IDeleteUserRepository {
  delete(user: UserEntity): Promise<void>
}
