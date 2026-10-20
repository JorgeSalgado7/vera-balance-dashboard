import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { ValidateUserNameDomainService } from './validate-user-name.domain-service';
import { ValidateUserEmailDomainService } from './validate-user-email.domain-service';
import { ValidateUserProfessionalLicenseDomainService } from './validate-user-professional-license.domain-service';
import { ValidateUserRoleDomainService } from './validate-user-role.domain-service';

@Injectable()
export class UpdateUserDomainService {
  constructor(
    private readonly names: ValidateUserNameDomainService,
    private readonly emails: ValidateUserEmailDomainService,
    private readonly licenses: ValidateUserProfessionalLicenseDomainService,
    private readonly roles: ValidateUserRoleDomainService
  ) {}

  execute(user: UserEntity, changes: {
    name?: string; email?: string; professionalLicense?: string; role?: string;
  }): UserEntity {
    const result = Object.assign(new UserEntity(), user);
    if (changes.name !== undefined) { this.names.execute(changes.name); result.name = changes.name; }
    if (changes.email !== undefined) result.email = this.emails.execute(changes.email);
    if (changes.professionalLicense !== undefined) {
      this.licenses.execute(changes.professionalLicense); result.professionalLicense = changes.professionalLicense;
    }
    if (changes.role !== undefined) { this.roles.execute(changes.role); result.role = changes.role; }
    if (result.name !== user.name || result.email !== user.email
      || result.professionalLicense !== user.professionalLicense || result.role !== user.role) {
      result.updatedAt = new Date().toISOString();
    }
    return result;
  }
}
