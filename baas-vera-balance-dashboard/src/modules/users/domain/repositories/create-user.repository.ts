import type { UserEntity } from '../entities/user.entity';
export interface ICreateUserRepository {
  create(entity: UserEntity): Promise<UserEntity>;
}
