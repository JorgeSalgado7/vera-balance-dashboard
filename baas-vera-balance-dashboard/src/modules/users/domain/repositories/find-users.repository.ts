import type { UserEntity } from '../entities/user.entity';

export interface IFindUsersRepository {
  findAll(): Promise<UserEntity[]>;
}
