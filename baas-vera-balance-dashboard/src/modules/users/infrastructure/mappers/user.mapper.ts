import { UserEntity } from '../../domain/entities/user.entity';
import type { UserPersistence } from '../persistence/interfaces/user-persistence.interface';

export class UserMapper {
  static toPersistence(user: UserEntity): UserPersistence {
    return {
      pk: user.id, sk: 'USER', name: user.name, email: user.email, password: user.passwordHash,
      professional_license: user.professionalLicense, clinic: { pk: user.clinicId, sk: 'CLINIC' },
      role: user.role, status: user.status, created_at: user.createdAt, updated_at: user.updatedAt
    };
  }

  static toEntity(item: UserPersistence): UserEntity {
    const user = new UserEntity();
    user.id = item.pk;
    user.name = item.name;
    user.email = item.email;
    user.passwordHash = item.password;
    user.professionalLicense = item.professional_license;
    user.clinicId = item.clinic.pk;
    user.role = item.role;
    user.status = item.status;
    user.createdAt = item.created_at;
    user.updatedAt = item.updated_at;
    return user;
  }
}
