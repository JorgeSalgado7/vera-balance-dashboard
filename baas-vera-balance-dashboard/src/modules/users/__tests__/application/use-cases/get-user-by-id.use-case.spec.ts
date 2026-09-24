import { Test, TestingModule } from '@nestjs/testing';
import { GetUserByIdUseCase } from '../../../application/use-cases/get-user-by-id.use-case';
import { UserNotFoundError } from '../../../domain/errors/user.error';
import type { UserEntity } from '../../../domain/entities/user.entity';

const existing: UserEntity = {
  id: 'user-id', name: 'Mónica', email: 'monica@example.com', passwordHash: 'secret-hash',
  professionalLicense: '123', clinicId: '7cb3a81a-e137-4ef4-aafd-6e387c8c7390',
  role: 'therapist', status: 'active',
  createdAt: '2026-09-17T00:00:00.000Z', updatedAt: '2026-09-18T00:00:00.000Z'
};

describe('GetUserByIdUseCase', () => {
  let module: TestingModule;
  let useCase: GetUserByIdUseCase;
  const reader = { findById: jest.fn() };
  const deleter = { delete: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    reader.findById.mockResolvedValue(Object.freeze({ ...existing }));
    module = await Test.createTestingModule({
      providers: [GetUserByIdUseCase,
        { provide: 'IFindUserByIdRepository', useValue: reader },
        { provide: 'IDeleteUserRepository', useValue: deleter }]
    }).compile();
    useCase = module.get(GetUserByIdUseCase);
  });

  afterEach(async () => { await module.close(); });

  it('should report a missing user', async () => {
    reader.findById.mockResolvedValue(null);
    await expect(useCase.execute('missing')).rejects.toThrow(UserNotFoundError);
    expect(reader.findById).toHaveBeenCalledWith('missing');
    expect(deleter.delete).not.toHaveBeenCalled();
  });

  it('should propagate read failures', async () => {
    const error = new Error('Read failed');
    reader.findById.mockRejectedValue(error);
    await expect(useCase.execute(existing.id)).rejects.toThrow(error);
    expect(deleter.delete).not.toHaveBeenCalled();
  });

  it('should return only public information without mutating the user', async () => {
    const result = await useCase.execute(existing.id);
    expect(reader.findById).toHaveBeenCalledWith(existing.id);
    expect(result).toEqual({
      id: existing.id, name: existing.name, email: existing.email,
      professional_license: existing.professionalLicense, clinic: { id: existing.clinicId },
      role: existing.role, status: existing.status,
      created_at: existing.createdAt, updated_at: existing.updatedAt
    });
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('pk');
    expect(result).not.toHaveProperty('sk');
    expect(await reader.findById.mock.results[0].value).toEqual(existing);
    expect(deleter.delete).not.toHaveBeenCalled();
  });
});
