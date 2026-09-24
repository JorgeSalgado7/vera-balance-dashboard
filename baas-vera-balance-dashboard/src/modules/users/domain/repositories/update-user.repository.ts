import type { UserEntity } from '../entities/user.entity';

export interface IUpdateUserRepository {
  update(entity: UserEntity): Promise<UserEntity>;
}
