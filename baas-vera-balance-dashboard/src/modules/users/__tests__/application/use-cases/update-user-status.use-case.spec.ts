import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserStatusUseCase } from '../../../application/use-cases/update-user-status.use-case';
import { UpdateUserStatusDomainService } from '../../../domain/services/update-user-status.domain-service';
import { ValidateUserStatusDomainService } from '../../../domain/services/validate-user-status.domain-service';
import { InvalidUserStatusError, UserNotFoundError } from '../../../domain/errors/user.error';
import type { UserEntity, UserStatus } from '../../../domain/entities/user.entity';

const existing: UserEntity = {
  id: 'user-id', name: 'Mónica', email: 'monica@example.com', passwordHash: 'secret-hash',
  professionalLicense: '123', clinicId: '7cb3a81a-e137-4ef4-aafd-6e387c8c7390',
  role: 'therapist', status: 'active',
  createdAt: '2026-09-17T00:00:00.000Z', updatedAt: '2026-09-18T00:00:00.000Z'
};

describe('UpdateUserStatusUseCase', () => {
  let module: TestingModule;
  let useCase: UpdateUserStatusUseCase;
  const reader = { findById: jest.fn() };
  const writer = { updateStatus: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    reader.findById.mockResolvedValue({ ...existing });
    writer.updateStatus.mockImplementation(async entity => entity);
    module = await Test.createTestingModule({
      providers: [UpdateUserStatusUseCase, UpdateUserStatusDomainService, ValidateUserStatusDomainService,
        { provide: 'IFindUserByIdRepository', useValue: reader },
        { provide: 'IUpdateUserStatusRepository', useValue: writer }]
    }).compile();
    useCase = module.get(UpdateUserStatusUseCase);
  });

  afterEach(async () => { await module.close(); });

  it.each(['active', 'inactive'] as const)('should change to %s and preserve all other user data', async status => {
    reader.findById.mockResolvedValue({ ...existing, status: status === 'active' ? 'inactive' : 'active' });
    const before = Date.now();
    const result = await useCase.execute(existing.id, { status });
    expect(reader.findById).toHaveBeenCalledWith(existing.id);
    expect(writer.updateStatus).toHaveBeenCalledWith({ ...existing, status, updatedAt: result.updated_at });
    expect(Date.parse(result.updated_at)).toBeGreaterThanOrEqual(before);
    expect(Date.parse(result.updated_at)).toBeLessThanOrEqual(Date.now());
    expect(result).toEqual({
      id: existing.id, name: existing.name, email: existing.email,
      professional_license: existing.professionalLicense, clinic: { id: existing.clinicId },
      role: existing.role, status, created_at: existing.createdAt, updated_at: result.updated_at
    });
    expect(JSON.stringify(result)).not.toContain(existing.passwordHash);
  });

  it('should allow the current status', async () => {
    await expect(useCase.execute(existing.id, { status: 'active' })).resolves.toMatchObject({ status: 'active' });
  });

  it.each(['disabled', '', ' ', null, undefined, 1, {}])('should reject invalid status %j without writing', async status => {
    await expect(useCase.execute(existing.id, { status: status as UserStatus })).rejects.toThrow(InvalidUserStatusError);
    expect(writer.updateStatus).not.toHaveBeenCalled();
    expect(await reader.findById.mock.results[0].value).toEqual(existing);
  });

  it('should reject a missing user without writing', async () => {
    reader.findById.mockResolvedValue(null);
    await expect(useCase.execute('missing', { status: 'active' })).rejects.toThrow(UserNotFoundError);
    expect(writer.updateStatus).not.toHaveBeenCalled();
  });

  it.each(['read', 'write'])('should propagate %s failures', async operation => {
    const error = new Error('Database failed');
    if (operation === 'read') reader.findById.mockRejectedValue(error);
    else writer.updateStatus.mockRejectedValue(error);
    await expect(useCase.execute(existing.id, { status: 'inactive' })).rejects.toThrow(error);
    if (operation === 'read') expect(writer.updateStatus).not.toHaveBeenCalled();
  });
});
