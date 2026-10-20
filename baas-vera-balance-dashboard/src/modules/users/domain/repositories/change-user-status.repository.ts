import type { UserEntity } from '../entities/user.entity';
import type { UserActor } from '../services/authorize-user-access.domain-service';

export interface IChangeUserStatusRepository {
  change(current: UserEntity, next: UserEntity, actor: UserActor, witness?: UserEntity): Promise<void>;
}
