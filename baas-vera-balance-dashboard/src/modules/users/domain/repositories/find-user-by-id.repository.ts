import type { UserEntity } from '../entities/user.entity';

export interface IFindUserByIdRepository {
  findById(id: string): Promise<UserEntity | null>;
}
