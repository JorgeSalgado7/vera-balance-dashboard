import { Injectable } from '@nestjs/common';
import type { UserStatus } from '../entities/user.entity';
import { InvalidUserStatusError } from '../errors/user.error';

@Injectable()
export class ValidateUserStatusDomainService {

  execute(status: UserStatus): void {
    const statuses: UserStatus[] = [
      'active',
      'inactive'
    ];

    if (!statuses.includes(status)) {
      throw new InvalidUserStatusError();
    }
  }

}
