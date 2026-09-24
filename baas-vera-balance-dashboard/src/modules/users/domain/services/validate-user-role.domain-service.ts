import type { UserRole } from '../entities/user.entity';
import { InvalidUserRoleError } from '../errors/user.error';

export class ValidateUserRoleDomainService {
  execute(role: UserRole): void {
    const roles: UserRole[] = ['clinic', 'therapist'];

    if (!roles.includes(role)) {
      throw new InvalidUserRoleError();
    }
  }
}
