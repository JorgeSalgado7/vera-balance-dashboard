import { UserEntity } from '../../../domain/entities/user.entity';
import { UserMapper } from '../../../infrastructure/mappers/user.mapper';
import type { UserPersistence } from '../../../infrastructure/persistence/interfaces/user-persistence.interface';

const item: UserPersistence = {
  pk: 'user-id', sk: 'USER', name: 'Mónica', email: 'monica@example.com', password: 'hash',
  professional_license: '123', clinic: { pk: 'clinic-id', sk: 'CLINIC' }, role: 'therapist', status: 'active',
  created_at: '2026-09-17T00:00:00.000Z', updated_at: '2026-09-17T00:00:00.000Z'
};

describe('UserMapper', () => {
  it('should map every field without exposing persistence keys in the domain', () => {
    const entity = UserMapper.toEntity(item);
    expect(entity).toBeInstanceOf(UserEntity);
    expect(entity).toEqual({
      id: item.pk, name: item.name, email: item.email, passwordHash: item.password,
      professionalLicense: item.professional_license, clinicId: item.clinic.pk,
      role: item.role, status: item.status, createdAt: item.created_at, updatedAt: item.updated_at
    });
    expect(UserMapper.toPersistence(entity)).toEqual(item);
    expect(entity).not.toHaveProperty('pk');
    expect(entity).not.toHaveProperty('sk');
  });
});
