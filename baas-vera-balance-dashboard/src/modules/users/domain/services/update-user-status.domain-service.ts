import { Injectable } from '@nestjs/common';
import { UserEntity, UserStatus } from '../entities/user.entity';
import { MissingUserUpdatedAtError } from '../errors/user.error';
import { ValidateUserStatusDomainService } from './validate-user-status.domain-service';

@Injectable()
export class UpdateUserStatusDomainService {
  constructor(private readonly validateUserStatusDomainService: ValidateUserStatusDomainService) {}

  execute(existing: UserEntity, data: { status: UserStatus; updatedAt: string }): UserEntity {
    if (!data.updatedAt) {
      throw new MissingUserUpdatedAtError();
    }
    this.validateUserStatusDomainService.execute(data.status);
    existing.status = data.status;
    existing.updatedAt = data.updatedAt;
    return existing;
  }
}
