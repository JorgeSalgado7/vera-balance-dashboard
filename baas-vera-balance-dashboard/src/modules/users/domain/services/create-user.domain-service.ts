import { UserEntity, type UserRole } from '../entities/user.entity';
import {
  MissingUserIdError,
  MissingUserPasswordHashError,
  MissingUserCreatedAtError,
  MissingUserUpdatedAtError
} from '../errors/user.error';

export class CreateUserDomainService {
  execute(data: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    professionalLicense: string;
    clinicId: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
  }): UserEntity {
    if (!data.id) {
      throw new MissingUserIdError();
    }
    if (!data.passwordHash) {
      throw new MissingUserPasswordHashError();
    }
    if (!data.createdAt) {
      throw new MissingUserCreatedAtError();
    }
    if (!data.updatedAt) {
      throw new MissingUserUpdatedAtError();
    }

    const entity = new UserEntity();

    entity.id = data.id;
    entity.name = data.name;
    entity.email = data.email;
    entity.passwordHash = data.passwordHash;
    entity.professionalLicense = data.professionalLicense;
    entity.clinicId = data.clinicId;
    entity.role = data.role;
    entity.status = 'active';
    entity.createdAt = data.createdAt;
    entity.updatedAt = data.updatedAt;

    return entity;
  }
}
