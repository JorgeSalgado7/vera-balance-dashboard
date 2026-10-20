import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { InvalidUserStatusError } from '../errors/user.error';

@Injectable()
export class ChangeUserStatusDomainService {
  execute(user: UserEntity, status: string): UserEntity {
    if (status !== 'active' && status !== 'inactive') throw new InvalidUserStatusError();
    return Object.assign(new UserEntity(), user, {
      status, updatedAt: user.status === status ? user.updatedAt : new Date().toISOString()
    });
  }
}
