import type { UserEntity } from '../entities/user.entity';

export interface IUpdateUserStatusRepository {
  updateStatus(entity: UserEntity): Promise<UserEntity>;
}
