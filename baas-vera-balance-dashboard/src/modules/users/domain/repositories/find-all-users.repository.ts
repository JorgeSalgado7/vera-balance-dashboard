import type { UserEntity } from '../entities/user.entity'

export interface IFindAllUsersRepository {
  findAll(): Promise<UserEntity[]>
}
