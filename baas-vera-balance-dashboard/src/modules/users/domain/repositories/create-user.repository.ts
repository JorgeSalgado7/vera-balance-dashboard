import type { UserEntity } from '../entities/user.entity';
import type { UserActor } from '../services/authorize-user-access.domain-service';

export interface ICreateUserRepository {
  create(user: UserEntity, actor: UserActor): Promise<void>;
}
