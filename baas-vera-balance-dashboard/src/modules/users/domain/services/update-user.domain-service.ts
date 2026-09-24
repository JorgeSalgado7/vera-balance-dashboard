import { Injectable } from '@nestjs/common';
import { UserEntity, UserRole, UserStatus } from '../entities/user.entity';
import {
  MissingUserNameError, MissingUserEmailError, InvalidUserEmailError,
  MissingUserProfessionalLicenseError, MissingUserClinicError,
  InvalidUserClinicError, MissingUserUpdatedAtError
} from '../errors/user.error';
import { ValidateUserRoleDomainService } from './validate-user-role.domain-service';
import { ValidateUserStatusDomainService } from './validate-user-status.domain-service';

@Injectable()
export class UpdateUserDomainService {
  constructor(
    private readonly validateUserRoleDomainService: ValidateUserRoleDomainService,
    private readonly validateUserStatusDomainService: ValidateUserStatusDomainService
  ) {}

  execute(existing: UserEntity, data: {
    name?: string;
    email?: string;
    professionalLicense?: string;
    clinicId?: string;
    role?: UserRole;
    status?: UserStatus;
    updatedAt: string;
  }): UserEntity {
    if (!data.updatedAt) {
      throw new MissingUserUpdatedAtError();
    }
    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || !data.name.trim()) {
        throw new MissingUserNameError();
      }
      existing.name = data.name;
    }
    if (data.email !== undefined) {
      if (typeof data.email !== 'string' || !data.email.trim()) {
        throw new MissingUserEmailError();
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new InvalidUserEmailError();
      }
      existing.email = data.email;
    }
    if (data.professionalLicense !== undefined) {
      if (typeof data.professionalLicense !== 'string' || !data.professionalLicense.trim()) {
        throw new MissingUserProfessionalLicenseError();
      }
      existing.professionalLicense = data.professionalLicense;
    }
    if (data.clinicId !== undefined) {
      if (typeof data.clinicId !== 'string' || !data.clinicId.trim()) {
        throw new MissingUserClinicError();
      }
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.clinicId)) {
        throw new InvalidUserClinicError();
      }
      existing.clinicId = data.clinicId;
    }
    if (data.role !== undefined) {
      this.validateUserRoleDomainService.execute(data.role);
      existing.role = data.role;
    }
    if (data.status !== undefined) {
      this.validateUserStatusDomainService.execute(data.status);
      existing.status = data.status;
    }
    existing.updatedAt = data.updatedAt;
    return existing;
  }
}
