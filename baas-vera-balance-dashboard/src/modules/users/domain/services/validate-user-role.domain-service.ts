import { Injectable } from '@nestjs/common';
import { InvalidUserRoleError } from '../errors/user.error';

@Injectable()
export class ValidateUserRoleDomainService {
  execute(role: string): asserts role is 'clinic' | 'therapist' {
    if (role !== 'clinic' && role !== 'therapist') throw new InvalidUserRoleError();
  }
}
