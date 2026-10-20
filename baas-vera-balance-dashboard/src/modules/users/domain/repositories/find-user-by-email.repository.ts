import type { UserEntity } from '../entities/user.entity';

export interface IFindUserByEmailRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
}
