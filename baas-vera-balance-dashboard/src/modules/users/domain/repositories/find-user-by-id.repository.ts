import type { UserEntity } from '../entities/user.entity';

export interface IFindUserByIdRepository {
  findById(userId: string): Promise<UserEntity | null>;
}
