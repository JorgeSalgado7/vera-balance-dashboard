import type { UserEntity } from '../entities/user.entity'

export interface IUserRepository {
  create(entity: UserEntity): Promise<UserEntity>
  findByEmail(email: string): Promise<UserEntity | null>
  findById(id: string): Promise<UserEntity | null>
}
