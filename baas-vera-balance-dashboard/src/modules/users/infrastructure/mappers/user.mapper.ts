import { UserEntity } from '../../domain/entities/user.entity';
import type { UserPersistence } from '../persistence/interfaces/user-persistence.interface';

export class UserMapper {
  static toEntity(item: UserPersistence): UserEntity {
    const entity = new UserEntity();

    entity.id = item.pk;
    entity.name = item.name;
    entity.email = item.email;
    entity.passwordHash = item.password;
    entity.professionalLicense = item.professional_license;
    entity.role = item.role;
    entity.status = item.status;
    entity.createdAt = item.created_at;
    entity.updatedAt = item.updated_at;
    entity.clinicId = item.clinic.pk;

    return entity;
  }

  static toPersistence(entity: UserEntity): UserPersistence {
    return {
      pk: entity.id,
      name: entity.name,
      email: entity.email,
      password: entity.passwordHash,
      professional_license: entity.professionalLicense,
      role: entity.role,
      status: entity.status,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
      sk: 'USER',
      clinic: { pk: entity.clinicId, sk: 'CLINIC' }
    };
  }
}
