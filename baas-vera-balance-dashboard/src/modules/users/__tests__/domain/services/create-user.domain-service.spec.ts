import { CreateUserDomainService } from '../../../domain/services/create-user.domain-service';
import { MissingUserIdError, MissingUserPasswordHashError, MissingUserCreatedAtError, MissingUserUpdatedAtError } from '../../../domain/errors/user.error';

const data = {
  id: 'user-id', name: 'Mónica', email: 'monica@example.com', passwordHash: 'hash',
  professionalLicense: '123', clinicId: '7cb3a81a-e137-4ef4-aafd-6e387c8c7390', role: 'therapist' as const,
  createdAt: '2026-09-17T00:00:00.000Z', updatedAt: '2026-09-17T00:00:00.000Z'
};

describe('CreateUserDomainService', () => {
  const service = new CreateUserDomainService();

  it('should create an active entity with audit dates and the supplied hash', () => {
    expect(service.execute(data)).toEqual({ ...data, status: 'active' });
  });

  it.each([
    ['id', MissingUserIdError],
    ['passwordHash', MissingUserPasswordHashError],
    ['createdAt', MissingUserCreatedAtError],
    ['updatedAt', MissingUserUpdatedAtError]
  ] as const)('should reject missing %s', (field, error) => {
    expect(() => service.execute({ ...data, [field]: '' })).toThrow(error);
  });
});
