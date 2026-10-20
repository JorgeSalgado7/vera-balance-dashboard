import type { UserEntity } from '../entities/user.entity';
import type { UserActor } from '../services/authorize-user-access.domain-service';

export interface IDeleteUserRepository {
  delete(current: UserEntity, actor: UserActor, witness?: UserEntity): Promise<void>;
}
