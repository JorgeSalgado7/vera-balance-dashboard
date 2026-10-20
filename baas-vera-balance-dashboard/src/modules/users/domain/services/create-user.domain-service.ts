import { Injectable } from '@nestjs/common';
import type { UserEntity } from '../entities/user.entity';
import { ValidateUserNameDomainService } from './validate-user-name.domain-service';
import { ValidateUserEmailDomainService } from './validate-user-email.domain-service';
import { ValidateUserProfessionalLicenseDomainService } from './validate-user-professional-license.domain-service';
import { ValidateUserRoleDomainService } from './validate-user-role.domain-service';
import { ValidateUserPasswordDomainService } from './validate-user-password.domain-service';

@Injectable()
export class CreateUserDomainService {
  constructor(
    private readonly names: ValidateUserNameDomainService,
    private readonly emails: ValidateUserEmailDomainService,
    private readonly licenses: ValidateUserProfessionalLicenseDomainService,
    private readonly roles: ValidateUserRoleDomainService,
    private readonly passwords: ValidateUserPasswordDomainService
  ) {}

  execute(data: {
    id: string; name: string; email: string; professionalLicense: string;
    clinicId: string; role: string; password: string; confirmation: string; now: string;
  }): Omit<UserEntity, 'passwordHash'> {
    this.names.execute(data.name);
    const email = this.emails.execute(data.email);
    this.licenses.execute(data.professionalLicense);
    this.roles.execute(data.role);
    this.passwords.execute(data.password, data.confirmation);
    return {
      id: data.id, name: data.name, email, professionalLicense: data.professionalLicense,
      clinicId: data.clinicId, role: data.role, status: 'active', createdAt: data.now, updatedAt: data.now
    };
  }
}
