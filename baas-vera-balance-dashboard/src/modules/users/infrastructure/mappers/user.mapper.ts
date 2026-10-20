import { UserEntity } from '../../domain/entities/user.entity';
import type { UserPersistence } from '../persistence/interfaces/user-persistence.interface';

export class UserMapper {
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
