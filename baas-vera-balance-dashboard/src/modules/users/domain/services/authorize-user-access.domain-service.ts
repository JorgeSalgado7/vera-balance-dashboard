import { Injectable } from '@nestjs/common';
import type { UserEntity } from '../entities/user.entity';
import { UserAccessDeniedError, UserNotFoundError } from '../errors/user.error';

export interface UserActor {
  id: string; clinicId: string; role: 'clinic' | 'therapist'; status: 'active' | 'inactive';
}

@Injectable()
export class AuthorizeUserAccessDomainService {
  execute(actor: UserActor, adminOnly = false): void {
    if (!actor || !actor.id || !actor.clinicId || actor.status !== 'active'
      || !['clinic', 'therapist'].includes(actor.role)
      || (adminOnly && actor.role !== 'clinic')) throw new UserAccessDeniedError();
  }

  target(actor: UserActor, id: string, user: UserEntity | null): asserts user is UserEntity {
    this.execute(actor);
    if (actor.role === 'therapist' && id !== actor.id) throw new UserAccessDeniedError();
    if (!user || user.clinicId !== actor.clinicId) throw new UserNotFoundError();
  }
}
